import { useState } from 'react';
import { Play, Pause, Clock, User } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { formatTime } from '../utils/formatTime';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EpisodeCardProps {
  episode: {
    id: string;
    title: string;
    audio_url: string;
    duration: number;
    created_at: string;
    user_id: string;
    profiles: {
      username: string;
    };
  };
}

function EpisodeCard({ episode }: EpisodeCardProps) {
  const { currentEpisode, isPlaying, playEpisode, pauseEpisode } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCurrentEpisode = currentEpisode?.id === episode.id;
  
  const handlePlayPause = () => {
    if (isCurrentEpisode && isPlaying) {
      pauseEpisode();
    } else {
      playEpisode({
        id: episode.id,
        title: episode.title,
        audio_url: episode.audio_url,
        duration: episode.duration,
        user_id: episode.user_id
      });
    }
  };
  
  return (
    <div 
      className="card group hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        <div 
          className="relative flex-shrink-0 h-16 w-16 overflow-hidden rounded-md bg-primary-100 flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
        >
          {isCurrentEpisode && isPlaying ? (
            <div className="absolute inset-0 bg-primary-600/90 flex items-center justify-center">
              <Pause className="h-8 w-8 text-white" />
            </div>
          ) : (
            <>
              <div className={`absolute inset-0 bg-primary-600/80 flex items-center justify-center transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <Play className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-primary-600">2m</span>
            </>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 truncate">{episode.title}</h3>
          
          <div className="mt-1 flex items-center text-sm text-neutral-500">
            <div className="flex items-center">
              <User className="mr-1 h-3 w-3" />
              <span className="truncate">{episode.profiles.username}</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{formatTime(episode.duration)}</span>
            </div>
            <span className="mx-2">•</span>
            <time dateTime={episode.created_at}>
              {formatDistanceToNow(new Date(episode.created_at), { 
                addSuffix: true,
                locale: fr
              })}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EpisodeCard;