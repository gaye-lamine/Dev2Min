import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="flex h-96 flex-col items-center justify-center text-center">
      <h1 className="text-9xl font-bold text-primary-200">404</h1>
      <h2 className="mt-4 text-2xl font-bold">Page non trouvée</h2>
      <p className="mt-2 text-neutral-500">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link 
        to="/" 
        className="mt-8 btn btn-primary flex items-center space-x-2"
      >
        <Home className="h-4 w-4" />
        <span>Retour à l'accueil</span>
      </Link>
    </div>
  );
}

export default NotFoundPage;