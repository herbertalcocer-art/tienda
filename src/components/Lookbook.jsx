import React, { useState, useEffect, useRef } from 'react';
import { getProductsByRoom } from '../dataService';
import { playPageFlip, playClothRustle } from '../audioEffects';
import { ArrowLeft, MessageCircle, Info, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function Lookbook({ roomSlug, navigateTo, openManifiesto }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  
  // Guardar posición de scroll para regresar
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const data = await getProductsByRoom(roomSlug);
      setProducts(data);
      setSelectedProduct(null);
      setActiveMediaIndex(0);
      setLoading(false);
    }
    loadProducts();
  }, [roomSlug]);

  const handleSelectProduct = (product) => {
    // Guardar el scroll actual antes de cambiar de vista
    scrollPositionRef.current = window.scrollY;
    
    playPageFlip();
    setSelectedProduct(product);
    setActiveMediaIndex(0);
    window.scrollTo(0, 0); // Ir al inicio en la vista detallada
  };

  const handleBackToGrid = () => {
    playPageFlip();
    setSelectedProduct(null);
    
    // Restaurar posición de scroll después del renderizado
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 50);
  };

  const handleNextPrevDetail = (direction) => {
    if (products.length <= 1) return;
    const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
    let nextIndex = currentIndex;
    
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % products.length;
    } else {
      nextIndex = (currentIndex - 1 + products.length) % products.length;
    }

    playPageFlip();
    setSelectedProduct(products[nextIndex]);
    setActiveMediaIndex(0);
  };

  const handleCardMouseEnter = (id) => {
    setHoveredCardId(id);
    if (roomSlug === 'boutique') {
      playClothRustle();
    } else {
      playPageFlip();
    }
  };

  const handleCardMouseLeave = () => {
    setHoveredCardId(null);
  };

  // Enlace dinámico de WhatsApp para el Concierge Digital
  const buildWhatsAppLink = (product) => {
    const phone = import.meta.env.VITE_WHATSAPP_PHONE || '56912345678';
    const elegantGreeting = "Buenos días, deseo consultar con una asesora sobre la pieza de su Atelier:";
    const prodName = product.name;
    const roomName = roomSlug === 'boutique' ? 'Alta Costura' : 'Joyería';
    const imageUrl = product.media_urls[0] || '';
    const pageUrl = window.location.href;

    const message = `${elegantGreeting}\n\n*Pieza:* ${prodName}\n*Sala:* ${roomName}\n*Imagen:* ${imageUrl}\n*Referencia:* ${pageUrl}\n\nAgradezco su tiempo y dedicación para guiar mi elección.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

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

  // ================= RENDERIZAR VISTA DE DETALLE DEL PRODUCTO =================
  if (selectedProduct) {
    const currentMediaUrl = selectedProduct.media_urls[activeMediaIndex] || '';
    const isVideo = currentMediaUrl.match(/\.(mp4|webm|ogg)/i) || 
                    (currentMediaUrl.includes('storage.googleapis.com') && currentMediaUrl.includes('/videos/'));

    return (
      <div className="h-screen w-screen flex flex-col md:flex-row relative bg-[var(--bg-color)] select-none animate-fade-only">
        
        {/* Botón de Regreso al Catálogo */}
        <button 
          onClick={handleBackToGrid}
          className="absolute top-8 left-8 z-30 flex items-center gap-2 text-[10px] tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors py-2"
        >
          <ArrowLeft size={12} />
          <span>Volver al Catálogo</span>
        </button>

        {/* DETALLE: Izquierda (Información y Contemplación) */}
        <div 
          className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-between p-8 md:p-16 pt-20 md:pt-28 border-b md:border-b-0 md:border-r relative z-10"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Header de Ficha */}
          <div className="flex justify-between items-center text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
            <span>Colección {roomSlug === 'boutique' ? 'Boutique' : 'Joyería'}</span>
            <span className="font-serif italic font-normal">Pieza Singular</span>
          </div>

          {/* Cuerpo Editorial */}
          <div className="my-auto max-w-md animate-fade-in" key={selectedProduct.id}>
            <h2 
              className="text-4xl md:text-5xl font-serif text-[var(--text-color)] mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: '300' }}
            >
              {selectedProduct.name}
            </h2>
            
            <p className="text-sm md:text-base text-[var(--text-muted)] font-serif italic leading-relaxed text-justify mb-8 font-light">
              "{selectedProduct.poetic_description}"
            </p>

            <div className="flex justify-between items-center mb-8 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] block mb-1">Precio Estimado</span>
                <span className="text-sm md:text-md font-serif tracking-widest text-[var(--text-color)]">
                  {selectedProduct.price ? `${parseFloat(selectedProduct.price).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })} CLP` : 'Consultar Valor'}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] block mb-1">Disponibilidad</span>
                <span className={`text-xs tracking-widest uppercase ${selectedProduct.in_stock ? 'text-[var(--gold-accent)]' : 'text-red-400 font-light'}`}>
                  {selectedProduct.in_stock ? 'Disponible en Atelier' : 'Adquirido / Pieza Única'}
                </span>
              </div>
            </div>

            {/* Concierge Digital Botón */}
            <a
              href={buildWhatsAppLink(selectedProduct)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full gap-3 px-6 py-3 border text-xs tracking-widest uppercase hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-all duration-500 ease-out"
              style={{ borderColor: 'var(--text-color)', backgroundColor: 'transparent' }}
            >
              <MessageCircle size={14} />
              <span>Solicitar esta pieza</span>
            </a>
          </div>

          {/* Navegación Base en Detalle */}
          <div className="flex justify-between items-center text-xs tracking-widest uppercase text-[var(--text-muted)]">
            <button 
              onClick={() => handleNextPrevDetail('prev')}
              className="hover:text-[var(--text-color)] flex items-center gap-2 py-2"
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>
            
            <button 
              onClick={openManifiesto} 
              className="text-[10px] hover:text-[var(--gold-accent)] flex items-center gap-1 py-2 font-light"
            >
              Filosofía
            </button>

            <button 
              onClick={() => handleNextPrevDetail('next')}
              className="hover:text-[var(--text-color)] flex items-center gap-2 py-2"
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* EXHIBICIÓN: Derecha (Galería Visual) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-[#121110] flex justify-center items-center">
          <div className="w-full h-full relative">
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
                alt={selectedProduct.name}
                loading="lazy"
                className="w-full h-full object-cover transition-opacity duration-1000 opacity-85 hover:scale-[1.03] transition-transform duration-[3000ms]"
                style={{ filter: 'contrast(1.02) brightness(0.95)' }}
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
          </div>

          {selectedProduct.media_urls.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
              {selectedProduct.media_urls.map((_, mediaIdx) => (
                <button
                  key={mediaIdx}
                  onClick={() => setActiveMediaIndex(mediaIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeMediaIndex === mediaIdx ? 'w-6 bg-[var(--gold-accent)]' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-8 right-8 text-[9px] tracking-[0.2em] text-white/60 uppercase pointer-events-none hidden md:block">
            {isVideo ? 'Micro-video en Loop' : 'Detalle de Alta Definición'}
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDERIZAR REJILLA EDITORIAL (VISTA GENERAL) =================
  return (
    <div className="min-h-screen bg-[var(--bg-color)] py-24 md:py-32 select-none animate-fade-only">
      <div className="flat-container">
        
        {/* Encabezado de la Colección */}
        <header className="mb-16 border-b pb-8" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--text-muted)] block mb-2">
            Colección {roomSlug === 'boutique' ? 'Alta Costura' : 'Plata Fina'}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--text-color)] mb-4">
            {roomSlug === 'boutique' ? 'Boutique' : 'Joyería'}
          </h2>
          <p className="text-sm md:text-base text-[var(--text-muted)] font-serif italic max-w-xl font-light">
            {roomSlug === 'boutique' 
              ? '"Prendas esculpidas con el ritmo del viento y la textura del lino puro. Caídas que acompañan el andar."' 
              : '"Plata martillada a mano, capturando destellos de luna fría para reposar suavemente sobre la piel."'}
          </p>
        </header>

        {/* Rejilla de Productos */}
        <div className="editorial-grid">
          {products.map((product) => {
            const isHovered = hoveredCardId === product.id;
            // Si el producto tiene múltiples imágenes, mostramos la segunda en hover como detalle macro
            const mediaUrl = isHovered && product.media_urls.length > 1 
              ? product.media_urls[1] 
              : product.media_urls[0];

            const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)/i);

            return (
              <article
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                onMouseEnter={() => handleCardMouseEnter(product.id)}
                onMouseLeave={handleCardMouseLeave}
                className="product-card"
              >
                <div className="product-card-media">
                  {isVideo ? (
                    <video 
                      src={mediaUrl} 
                      className="product-card-image" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={product.name}
                      loading="lazy"
                      className="product-card-image"
                    />
                  )}
                  
                  {/* Etiqueta de Agotado */}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex justify-center items-center">
                      <span className="text-[10px] tracking-widest uppercase border border-white/40 text-white px-3 py-1 bg-black/40">
                        Adquirido
                      </span>
                    </div>
                  )}

                  {/* Icono de Ver Detalle flotante en hover */}
                  <div 
                    className={`absolute bottom-4 left-4 p-2 bg-[var(--bg-color)] border text-[var(--text-color)] rounded-full transition-all duration-500 shadow-md ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <Eye size={12} />
                  </div>
                </div>

                <div className="product-card-info">
                  <h3 className="product-card-name">
                    {product.name}
                  </h3>
                  <span className="product-card-price">
                    {product.price ? `${parseFloat(product.price).toLocaleString('es-CL')} CLP` : 'Consultar'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pie de página con enlace al Manifiesto */}
        <footer className="mt-24 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-widest uppercase text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
          <span>Maison & Atelier © 2026</span>
          <button 
            onClick={openManifiesto} 
            className="hover:text-[var(--gold-accent)] transition-colors flex items-center gap-1.5"
          >
            <Info size={11} />
            Manifiesto de Slow Shopping
          </button>
        </footer>

      </div>
    </div>
  );
}
