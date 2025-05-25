import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Player from './Player';
import { usePlayer } from '../contexts/PlayerContext';
import FloatingActionButton from './FloatingActionButton';

function Layout() {
  const { currentEpisode } = usePlayer();
  
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>
      {currentEpisode && <Player />}
      <FloatingActionButton />
    </div>
  );
}

export default Layout;