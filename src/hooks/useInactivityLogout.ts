import { useEffect } from 'react';

interface UseInactivityLogoutOptions {
  timeoutMinutes?: number;
  onLogout: () => void;
}

/**
 * Hook qui déconnecte automatiquement l'utilisateur après une période d'inactivité.
 * Écoute les événements: mousemove, keydown, click, scroll, touchstart
 * Réinitialise le timer à chaque activité.
 */
export function useInactivityLogout({
  timeoutMinutes = 5,
  onLogout
}: UseInactivityLogoutOptions) {
  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000; // Convertir en millisecondes
    let timeoutId: NodeJS.Timeout | null = null;

    // Fonction pour réinitialiser le timer
    const resetTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        console.log(`Inactivité détectée (${timeoutMinutes}min). Déconnexion...`);
        onLogout();
      }, timeoutMs);
    };

    // Événements à surveiller
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Ajouter les écouteurs
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Démarrer le timer initial
    resetTimer();

    // Nettoyage
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutMinutes, onLogout]);
}
