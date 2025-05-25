import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { formatTime } from '../utils/formatTime';

function Player() {
  const { 
    currentEpisode, 
    isPlaying, 
    duration, 
    currentTime, 
    togglePlayPause, 
    seek 
  } = usePlayer();
  const [waveform, setWaveform] = useState<number[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentEpisode) {
      const bars = 50;
      const newWaveform = Array.from({ length: bars }, () => 
        Math.floor(Math.random() * 40) + 5
      );
      setWaveform(newWaveform);
    }
  }, [currentEpisode]);
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };
  
  if (!currentEpisode) return null;

  return (
    <div className="player-container">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <div className="truncate mr-4">
              <h3 className="text-sm font-medium truncate">{currentEpisode.title}</h3>
            </div>
            <div className="flex items-center space-x-1 text-xs text-neutral-500">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          <div 
            ref={progressRef}
            className="relative h-2 w-full cursor-pointer rounded-full bg-neutral-200"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-4">
            <button className="icon-btn">
              <SkipBack className="h-5 w-5" />
            </button>
            <button 
              className="rounded-full bg-primary-600 p-3 text-white"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
            <button className="icon-btn">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          
          <div className="waveform mt-3">
            {waveform.map((height, index) => (
              <div 
                key={index}
                className="waveform-bar"
                style={{ 
                  height: `${height}px`,
                  opacity: index < (waveform.length * currentTime / duration) ? 1 : 0.3
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;