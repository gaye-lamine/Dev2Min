import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Trash2, Loader, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AudioRecorderProps {
  onRecordingComplete: (audio: Blob, duration: number) => void;
}

function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const MAX_RECORDING_TIME = 120;
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  const startRecording = async () => {
    setIsLoading(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => {
          const newTime = prevTime + 1;
          
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  const playPauseRecording = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handleSaveRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col items-center">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {audioBlob ? 'Prévisualisation' : 'Enregistrer un micro-podcast'}
          </h2>
          <p className="text-neutral-500">
            {audioBlob 
              ? 'Écoutez votre enregistrement avant de l\'enregistrer' 
              : 'Partagez votre expertise en 2 minutes max'}
          </p>
        </div>
        
        <div className="relative mb-6">
          {isLoading ? (
            <div className="h-24 w-24 flex items-center justify-center">
              <Loader className="h-10 w-10 text-primary-600 animate-spin" />
            </div>
          ) : audioBlob ? (
            <button
              onClick={playPauseRecording}
              className="record-btn bg-secondary-600 hover:bg-secondary-700"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Square className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </button>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`record-btn ${isRecording ? 'bg-red-600 hover:bg-red-700 recording-pulse' : ''}`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </button>
          )}
        </div>
        
        <div className="text-2xl font-mono font-bold mb-6">
          {formatTime(recordingTime)}
          {MAX_RECORDING_TIME !== null && (
            <span className="text-neutral-400"> / {formatTime(MAX_RECORDING_TIME)}</span>
          )}
        </div>
        
        {audioBlob && (
          <div className="flex gap-4">
            <button
              onClick={discardRecording}
              className="btn btn-outline flex items-center gap-2"
              aria-label="Discard recording"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer</span>
            </button>
            <button
              onClick={handleSaveRecording}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Save recording"
            >
              <Save className="h-4 w-4" />
              <span>Continuer</span>
            </button>
          </div>
        )}
        
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
        )}
      </div>
    </div>
  );
}

export default AudioRecorder;