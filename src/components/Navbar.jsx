import React, { useState, useEffect } from 'react';
import { getMuteState, setMuteState } from '../audioEffects';
import { Volume2, VolumeX, Menu, X, Landmark, Compass } from 'lucide-react';

export default function Navbar({ navigateTo, currentPath, openManifiesto }) {
  const [isMuted, setIsMuted] = useState(getMuteState());
  const [showNavbar, setShowNavbar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lógica para mostrar la barra de navegación al acercar el mouse al tope (en pantallas no táctiles)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientY < 60) {
        setShowNavbar(true);
      } else if (e.clientY > 120 && !mobileMenuOpen) {
        setShowNavbar(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mobileMenuOpen]);

  // También mostrar la barra al hacer scroll hacia arriba
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setMuteState(nextMuted);
  };

  return (
    <>
      {/* Barra de navegación */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 glass-effect border-b transition-all duration-500 ease-out py-4 px-8 md:px-12 flex justify-between items-center ${
          showNavbar || mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* Marca/Logo */}
        <button 
          onClick={() => { navigateTo('vestibulo'); setMobileMenuOpen(false); }}
          className="text-lg md:text-xl font-serif tracking-widest uppercase hover:opacity-75 transition-opacity"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-color)' }}
        >
          Maison & Atelier
        </button>

        {/* Links de escritorio */}
        <div className="hidden md:flex items-center space-x-8 text-xs tracking-widest uppercase">
          <button 
            onClick={() => navigateTo('vestibulo')}
            className={`hover:text-[var(--gold-accent)] transition-colors flex items-center gap-1 ${
              currentPath === 'vestibulo' ? 'text-[var(--gold-accent)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <Compass size={12} />
            El Vestíbulo
          </button>
          
          <button 
            onClick={() => navigateTo('lookbook', 'boutique')}
            className={`hover:text-[var(--gold-accent)] transition-colors ${
              window.location.hash.includes('boutique') ? 'text-[var(--gold-accent)] font-medium' : 'text-[var(--text-muted)]'
            }`}
          >
            Boutique
          </button>
          
          <button 
            onClick={() => navigateTo('lookbook', 'joyeria')}
            className={`hover:text-[var(--gold-accent)] transition-colors ${
              window.location.hash.includes('joyeria') ? 'text-[var(--gold-accent)] font-medium' : 'text-[var(--text-muted)]'
            }`}
          >
            Joyería
          </button>
          
          <button 
            onClick={openManifiesto}
            className="text-[var(--text-muted)] hover:text-[var(--gold-accent)] transition-colors flex items-center gap-1"
          >
            <Landmark size={12} />
            El Manifiesto
          </button>

        </div>

        {/* Controles de sonido y menú móvil */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleMute}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
            title={isMuted ? "Activar sonido de interacción" : "Desactivar sonido"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button 
            className="md:hidden p-2 text-[var(--text-color)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[var(--bg-color)] flex flex-col justify-center items-center space-y-8 text-lg tracking-widest uppercase font-light animate-fade-only"
        >
          <button 
            onClick={() => { navigateTo('vestibulo'); setMobileMenuOpen(false); }}
            className="hover:text-[var(--gold-accent)]"
          >
            El Vestíbulo
          </button>
          <button 
            onClick={() => { navigateTo('lookbook', 'boutique'); setMobileMenuOpen(false); }}
            className="hover:text-[var(--gold-accent)]"
          >
            Boutique
          </button>
          <button 
            onClick={() => { navigateTo('lookbook', 'joyeria'); setMobileMenuOpen(false); }}
            className="hover:text-[var(--gold-accent)]"
          >
            Joyería
          </button>
          <button 
            onClick={() => { openManifiesto(); setMobileMenuOpen(false); }}
            className="hover:text-[var(--gold-accent)]"
          >
            El Manifiesto
          </button>
        </div>
      )}

      {/* Indicador flotante sutil para sugerir al usuario que mueva el mouse arriba para ver la navegación */}
      {!showNavbar && !mobileMenuOpen && (
        <div 
          className="fixed top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-700 opacity-25 flex flex-col items-center pt-2"
        >
          <div className="w-12 h-1 bg-[var(--accent-color)] rounded-full opacity-30"></div>
          <span className="text-[9px] tracking-widest uppercase mt-1" style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Mover mouse arriba</span>
        </div>
      )}
    </>
  );
}
