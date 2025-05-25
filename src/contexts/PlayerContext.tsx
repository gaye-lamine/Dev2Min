import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface Episode {
  id: string;
  title: string;
  audio_url: string;
  duration: number;
  user_id: string;
}

interface PlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  playEpisode: (episode: Episode) => void;
  pauseEpisode: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(audioRef.current?.currentTime || 0);
    });
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current?.duration || 0);
    });
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
  }

  const playEpisode = (episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      if (audioRef.current) {
        audioRef.current.src = episode.audio_url;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
          });
      }
      setCurrentEpisode(episode);
    }
  };

  const pauseEpisode = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!currentEpisode) return;
    
    if (isPlaying) {
      pauseEpisode();
    } else {
      playEpisode(currentEpisode);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const value = {
    currentEpisode,
    isPlaying,
    duration,
    currentTime,
    playEpisode,
    pauseEpisode,
    togglePlayPause,
    seek
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};