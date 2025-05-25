import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Save, Loader, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatTime } from '../utils/formatTime';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);
  
  useState(() => {
    const fetchUserEpisodes = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('episodes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setEpisodes(data || []);
      } catch (error) {
        console.error('Error fetching user episodes:', error);
      } finally {
        setIsLoadingEpisodes(false);
      }
    };
    
    fetchUserEpisodes();
  });
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const handleSaveProfile = async () => {
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await updateProfile({ username });
      
      if (error) {
        throw error;
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Profil</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <UserCircle className="h-20 w-20 text-neutral-400" />
              </div>
              
              {isEditing ? (
                <>
                  {error && (
                    <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4 w-full">
                    <label htmlFor="username" className="block mb-1 text-sm font-medium">
                      Nom d'utilisateur
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  
                  <div className="flex w-full space-x-2">
                    <button
                      onClick={() => {
                        setUsername(profile?.username || '');
                        setIsEditing(false);
                      }}
                      className="btn btn-outline flex-1"
                      disabled={isLoading}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-primary flex-1 flex justify-center items-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          <span>Enregistrer</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{profile?.username}</h2>
                  <p className="text-neutral-500 mb-6">{user?.email}</p>
                  
                  <div className="flex w-full space-x-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline flex-1"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-outline flex-1"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Mes épisodes</h2>
            
            {isLoadingEpisodes ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
              </div>
            ) : episodes.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-neutral-500">Vous n'avez pas encore publié d'épisodes</p>
                <button
                  onClick={() => navigate('/record')}
                  className="mt-4 btn btn-primary"
                >
                  Enregistrer un épisode
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {episodes.map(episode => (
                  <li key={episode.id} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{episode.title}</h3>
                        <div className="mt-1 flex items-center text-xs text-neutral-500">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{formatTime(episode.duration)}</span>
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;