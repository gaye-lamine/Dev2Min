import { useState, useEffect } from 'react';
import { Mic, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import EpisodeCard from '../components/EpisodeCard';

function HomePage() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchEpisodes();
    
    const subscription = supabase
      .channel('episodes-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'episodes' }, 
        () => {
          fetchEpisodes();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchEpisodes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setEpisodes(data || []);
    } catch (error: any) {
      console.error('Error fetching episodes:', error);
      setError(error.message || 'Une erreur est survenue lors du chargement des épisodes.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Derniers épisodes</h1>
        <button
          onClick={fetchEpisodes}
          className="icon-btn"
          aria-label="Refresh episodes"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
          <button
            onClick={fetchEpisodes}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Réessayer
          </button>
        </div>
      ) : episodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-neutral-50 p-12 text-center">
          <div className="mb-4 rounded-full bg-primary-100 p-3">
            <Mic className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Aucun épisode pour le moment</h2>
          <p className="mb-6 text-neutral-500">
            Soyez le premier à enregistrer un micro-podcast de 2 minutes !
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {episodes.map(episode => (
            <EpisodeCard key={episode.id} episode={episode} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;