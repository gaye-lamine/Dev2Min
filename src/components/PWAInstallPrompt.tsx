import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface PWAInstallPromptProps {
  onClose: () => void;
}

function PWAInstallPrompt({ onClose }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      onClose();
    });
  };
  
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg md:left-auto md:right-4 md:w-80">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-primary-100 p-2">
            <Download className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium">Installer l'application</h3>
            <p className="text-sm text-neutral-500">Ajoutez Dev2Min à votre écran d'accueil</p>
          </div>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-500">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Plus tard
        </button>
        <button
          onClick={handleInstallClick}
          className="flex-1 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Installer
        </button>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;