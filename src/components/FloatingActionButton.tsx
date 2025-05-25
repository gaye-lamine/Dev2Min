import { Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function FloatingActionButton() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <Link to="/record" className="fab" aria-label="Record new episode">
      <Mic className="h-6 w-6" />
    </Link>
  );
}

export default FloatingActionButton;