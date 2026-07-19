import React, { useState, useEffect, useRef } from 'react';
import { getProductsByRoom } from '../dataService';
import { playPageFlip } from '../audioEffects';
import { ArrowLeft, ArrowRight, MessageCircle, Info, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

export default function Lookbook({ roomSlug, navigateTo, openManifiesto }) {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const mediaRef = useRef(null);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const data = await getProductsByRoom(roomSlug);
      setProducts(data);
      setCurrentIndex(0);
      setActiveMediaIndex(0);
      setLoading(false);
    }
    loadProducts();
  }, [roomSlug]);

  const handlePageChange = (direction) => {
    let nextIndex = currentIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % products.length;
    } else {
      nextIndex = (currentIndex - 1 + products.length) % products.length;
    }
    
    playPageFlip();
    setCurrentIndex(nextIndex);
    setActiveMediaIndex(0);
  };

  // Habilitar navegación por teclado (flechas izquierda/derecha)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (products.length <= 1) return;
      if (e.key === 'ArrowRight') {
        handlePageChange('next');
      } else if (e.key === 'ArrowLeft') {
        handlePageChange('prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, products]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-[var(--bg-color)]">
        <span className="font-serif italic text-lg tracking-widest animate-pulse">Abriendo el catálogo...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-[var(--bg-color)] text-center p-8">
        <h2 className="text-2xl font-serif mb-4">El silencio reina en esta sala</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mb-8 italic">
          "Aún no se han revelado las piezas de esta colección. La paciencia acompaña a la belleza."
        </p>
        <button 
          onClick={() => navigateTo('vestibulo')}
          className="px-6 py-2 border text-xs uppercase tracking-widest hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-all"
          style={{ borderColor: 'var(--text-color)' }}
        >
          Volver al vestíbulo
        </button>
      </div>
    );
  }

  const currentProduct = products[currentIndex];
  const currentMediaUrl = currentProduct.media_urls[activeMediaIndex] || '';

  // Determinar si el archivo es un video (mp4, webm)
  const isVideo = currentMediaUrl.match(/\.(mp4|webm|ogg)/i) || currentMediaUrl.includes('storage.googleapis.com') && currentMediaUrl.includes('/videos/');

  // Construir el link dinámico de consulta de WhatsApp
  const buildWhatsAppLink = () => {
    const phone = import.meta.env.VITE_WHATSAPP_PHONE || '56912345678';
    const elegantGreeting = "Buenos días, deseo consultar con una asesora sobre la pieza de su Atelier:";
    const prodName = currentProduct.name;
    const roomName = roomSlug === 'boutique' ? 'Alta Costura' : 'Joyería';
    const imageUrl = currentProduct.media_urls[0] || '';
    const pageUrl = window.location.href;

    const message = `${elegantGreeting}\n\n*Pieza:* ${prodName}\n*Sala:* ${roomName}\n*Imagen:* ${imageUrl}\n*Referencia:* ${pageUrl}\n\nAgradezco su tiempo y dedicación para guiar mi elección.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row relative bg-[var(--bg-color)] select-none">
      
      {/* Botón de Regreso Flotante (Esquina Superior Izquierda) */}
      <button 
        onClick={() => navigateTo('vestibulo')}
        className="absolute top-8 left-8 z-30 flex items-center gap-2 text-[10px] tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors py-2"
      >
        <ArrowLeft size={12} />
        <span>Volver</span>
      </button>

      {/* PANEL IZQUIERDO: Editorial e Información (50% Ancho) */}
      <div 
        className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-between p-8 md:p-16 pt-20 md:pt-28 border-b md:border-b-0 md:border-r relative z-10"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* Encabezado: Colección e Index */}
        <div className="flex justify-between items-center text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
          <span>Colección {roomSlug === 'boutique' ? 'Boutique' : 'Joyería'}</span>
          <span className="font-serif italic font-normal">
            {(currentIndex + 1).toString().padStart(2, '0')} / {products.length.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Ficha Editorial Principal */}
        <div className="my-auto max-w-md animate-fade-in" key={currentProduct.id}>
          <h2 
            className="text-4xl md:text-5xl font-serif text-[var(--text-color)] mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: '300' }}
          >
            {currentProduct.name}
          </h2>
          
          <p className="text-sm md:text-base text-[var(--text-muted)] font-serif italic leading-relaxed text-justify mb-8 font-light">
            "{currentProduct.poetic_description}"
          </p>

          <div className="flex justify-between items-center mb-8 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] block mb-1">Precio Estimado</span>
              <span className="text-sm md:text-md font-serif tracking-widest text-[var(--text-color)]">
                {currentProduct.price ? `${parseFloat(currentProduct.price).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} CLP` : 'Consultar Valor'}
              </span>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] block mb-1">Disponibilidad</span>
              <span className={`text-xs tracking-widest uppercase ${currentProduct.in_stock ? 'text-[var(--gold-accent)]' : 'text-red-400 font-light'}`}>
                {currentProduct.in_stock ? 'Disponible en Atelier' : 'Adquirido / Pieza Única'}
              </span>
            </div>
          </div>

          {/* Botón WhatsApp Concierge */}
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full gap-3 px-6 py-3 border text-xs tracking-widest uppercase hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-all duration-500 ease-out"
            style={{ borderColor: 'var(--text-color)', backgroundColor: 'transparent' }}
          >
            <MessageCircle size={14} />
            <span>Consultar a una Asesora</span>
          </a>
        </div>

        {/* Controles de Navegación Editorial en la Base */}
        <div className="flex justify-between items-center text-xs tracking-widest uppercase text-[var(--text-muted)]">
          <button 
            onClick={() => handlePageChange('prev')}
            className="hover:text-[var(--text-color)] flex items-center gap-2 py-2"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>
          
          <button 
            onClick={openManifiesto} 
            className="text-[10px] hover:text-[var(--gold-accent)] flex items-center gap-1 py-2 font-light"
          >
            <Info size={11} />
            Nuestra Filosofía
          </button>

          <button 
            onClick={() => handlePageChange('next')}
            className="hover:text-[var(--text-color)] flex items-center gap-2 py-2"
          >
            <span>Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* PANEL DERECHO: Exhibición Visual (50% Ancho) */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-black flex justify-center items-center">
        {/* Media con Lazy Loading y Transición */}
        <div className="w-full h-full relative" ref={mediaRef}>
          {isVideo ? (
            <video
              key={currentMediaUrl}
              src={currentMediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-opacity duration-1000 opacity-90"
              style={{ filter: 'contrast(1.02) brightness(0.95)' }}
            />
          ) : (
            <img
              key={currentMediaUrl}
              src={currentMediaUrl}
              alt={currentProduct.name}
              loading="lazy"
              className="w-full h-full object-cover transition-opacity duration-1000 opacity-85 hover:scale-[1.03] transition-transform duration-[3000ms]"
              style={{ filter: 'contrast(1.02) brightness(0.95)' }}
            />
          )}
          
          {/* Sombras de overlay sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Indicadores de galería multimedia secundaria (si hay más de 1 imagen/video) */}
        {currentProduct.media_urls.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {currentProduct.media_urls.map((_, mediaIdx) => (
              <button
                key={mediaIdx}
                onClick={() => setActiveMediaIndex(mediaIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeMediaIndex === mediaIdx ? 'w-6 bg-[var(--gold-accent)]' : 'w-1.5 bg-white/40'
                }`}
                title={`Ver detalle ${mediaIdx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Indicador de Leyenda Visual en la imagen */}
        <div className="absolute bottom-8 right-8 text-[9px] tracking-[0.2em] text-white/60 uppercase pointer-events-none hidden md:block">
          {isVideo ? 'Micro-video en Loop • Detalle de caída' : 'Captura de Alta Resolución'}
        </div>
      </div>
      
    </div>
  );
}
