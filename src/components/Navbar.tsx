import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    setIsMenuOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Mic className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-primary-800">Dev2Min</span>
          </Link>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="icon-btn"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          
          <nav className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-2 px-4 pb-4 pt-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block rounded-md px-3 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-100"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block rounded-md px-3 py-2 text-base font-medium text-primary-600 hover:bg-neutral-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;