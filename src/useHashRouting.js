import { useState, useEffect } from 'react';

/**
 * Hook personalizado para enrutamiento simple y robusto basado en el hash del navegador.
 * Evita configuraciones complejas de redirección en Vercel.
 */
export function useHashRouting() {
  const [route, setRoute] = useState(parseHash());

  function parseHash() {
    const hash = window.location.hash || '#/';
    
    if (hash === '#/' || hash === '') {
      return { path: 'vestibulo' };
    }
    
    if (hash.startsWith('#/lookbook/')) {
      const roomSlug = hash.replace('#/lookbook/', '');
      return { path: 'lookbook', roomSlug };
    }
    
    if (hash === '#/backstage') {
      return { path: 'backstage' };
    }
    
    return { path: 'vestibulo' }; // Ruta por defecto
  }

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path, roomSlug = '') => {
    if (path === 'vestibulo') {
      window.location.hash = '#/';
    } else if (path === 'lookbook') {
      window.location.hash = `#/lookbook/${roomSlug}`;
    } else if (path === 'backstage') {
      window.location.hash = '#/backstage';
    }
  };

  return { route, navigateTo };
}
