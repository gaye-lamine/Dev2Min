import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AudioRecorder from '../components/AudioRecorder';

function RecordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'record' | 'details'>('record');
  
  const handleRecordingComplete = (audio: Blob, duration: number) => {
    setAudioBlob(audio);
    setAudioDuration(duration);
    setStep('details');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioBlob || !user) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('podcasts')
        .upload(`public/${fileName}`, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from('podcasts')
        .getPublicUrl(`public/${fileName}`);
        
      const { error: insertError } = await supabase
        .from('episodes')
        .insert({
          title,
          user_id: user.id,
          audio_url: urlData.publicUrl,
          duration: audioDuration
        });
        
      if (insertError) {
        throw insertError;
      }
      
      navigate('/');
      
    } catch (error: any) {
      console.error('Error uploading podcast:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleBack = () => {
    if (step === 'details') {
      setStep('record');
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={handleBack}
          className="mr-3 rounded-full p-2 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">
          {step === 'record' ? 'Nouvel enregistrement' : 'Finaliser l\'épisode'}
        </h1>
      </div>
      
      {step === 'record' ? (
        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Détails de l'épisode</h2>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block mb-2 text-sm font-medium">
                Titre de l'épisode
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de votre micro-podcast"
                required
                className="input w-full"
                maxLength={100}
              />
              <p className="mt-1 text-xs text-neutral-500">
                {title.length}/100 caractères
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep('record')}
                className="btn btn-outline mr-3"
                disabled={isUploading}
              >
                Refaire l'enregistrement
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading || !title.trim()}
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    <span>Publication...</span>
                  </div>
                ) : (
                  'Publier l\'épisode'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default RecordPage;