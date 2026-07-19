import React, { useState } from 'react';
import { useHashRouting } from './useHashRouting';
import Navbar from './components/Navbar';
import Vestibulo from './components/Vestibulo';
import Lookbook from './components/Lookbook';
import Backstage from './components/Backstage';
import Manifiesto from './components/Manifiesto';

function App() {
  const { route, navigateTo } = useHashRouting();
  const [isManifiestoOpen, setIsManifiestoOpen] = useState(false);

  const openManifiesto = () => setIsManifiestoOpen(true);
  const closeManifiesto = () => setIsManifiestoOpen(false);

  // Seleccionar la vista a renderizar
  const renderView = () => {
    switch (route.path) {
      case 'vestibulo':
        return <Vestibulo navigateTo={navigateTo} />;
      case 'lookbook':
        return (
          <Lookbook 
            roomSlug={route.roomSlug} 
            navigateTo={navigateTo} 
            openManifiesto={openManifiesto} 
          />
        );
      case 'backstage':
        return <Backstage navigateTo={navigateTo} />;
      default:
        return <Vestibulo navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* 
        Solo renderizar la barra de navegación pública en vistas públicas.
        El Backstage tiene su propia interfaz y lógica de navegación privada.
      */}
      {route.path !== 'backstage' && (
        <Navbar 
          navigateTo={navigateTo} 
          currentPath={route.path} 
          openManifiesto={openManifiesto} 
        />
      )}

      {/* Vista Activa */}
      {renderView()}

      {/* Modal del Manifiesto / Envíos */}
      <Manifiesto isOpen={isManifiestoOpen} onClose={closeManifiesto} />
    </div>
  );
}

export default App;
