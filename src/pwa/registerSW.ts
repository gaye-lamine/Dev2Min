import { registerSW } from 'virtual:pwa-register';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('Une nouvelle version est disponible. Mettre à jour?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('L\'application est prête à fonctionner hors ligne');
      },
    });
  }
};