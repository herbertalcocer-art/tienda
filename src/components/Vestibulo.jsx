import React, { useState, useEffect } from 'react';
import { getRooms } from '../dataService';
import { playClothRustle, playPageFlip } from '../audioEffects';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Vestibulo({ navigateTo }) {
  const [rooms, setRooms] = useState([]);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRooms() {
      const data = await getRooms();
      setRooms(data);
      setLoading(false);
    }
    loadRooms();
  }, []);

  const handleMouseEnter = (slug) => {
    setHoveredRoom(slug);
    if (slug === 'boutique') {
      playClothRustle();
    } else if (slug === 'joyeria') {
      playPageFlip();
    }
  };

  const handleMouseLeave = () => {
    setHoveredRoom(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-[var(--bg-color)]">
        <span className="font-serif italic text-lg tracking-widest animate-pulse">Cargando el vestíbulo...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col md:flex-row relative bg-[var(--bg-color)]">
      {/* Título Central Decorativo que flota */}
      <div 
        className="absolute top-8 left-0 right-0 z-20 text-center pointer-events-none md:top-12 animate-fade-in"
      >
        <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--text-muted)] block mb-1">
          Atelier & Maison
        </span>
        <h1 
          className="text-4xl md:text-5xl font-serif tracking-widest text-[var(--text-color)]"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: '300' }}
        >
          SILENCIO MINERAL
        </h1>
      </div>

      {rooms.map((room) => {
        const isHovered = hoveredRoom === room.slug;
        const isAnyHovered = hoveredRoom !== null;
        
        // Determinar ancho basado en el hover
        let widthClass = 'md:w-1/2';
        if (isAnyHovered) {
          widthClass = isHovered ? 'md:w-[58%]' : 'md:w-[42%]';
        }

        return (
          <div
            key={room.id}
            onClick={() => navigateTo('lookbook', room.slug)}
            onMouseEnter={() => handleMouseEnter(room.slug)}
            onMouseLeave={handleMouseLeave}
            className={`h-1/2 md:h-full relative overflow-hidden transition-all duration-700 ease-out cursor-pointer flex flex-col justify-end p-8 md:p-16 border-b md:border-b-0 md:border-r last:border-0 ${widthClass}`}
            style={{ borderColor: 'var(--border-color)' }}
          >
            {/* Imagen de fondo con zoom lento al hacer hover */}
            <div 
              className="absolute inset-0 transition-transform duration-[2000ms] ease-out"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(18, 17, 16, 0.75) 0%, rgba(18, 17, 16, 0.2) 60%, rgba(18, 17, 16, 0.4) 100%), url(${room.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: isHovered ? 'scale(1.06)' : 'scale(1)'
              }}
            />

            {/* Contenido Editorial de la Sala */}
            <div className="relative z-10 text-[#f7f4ed] max-w-lg transition-all duration-500 transform">
              <span className="text-xs tracking-[0.3em] uppercase opacity-75 mb-2 block font-light">
                Colección
              </span>
              <h2 
                className="text-4xl md:text-5xl font-serif mb-4 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {room.name}
              </h2>
              
              <div 
                className={`transition-all duration-700 overflow-hidden ${
                  isHovered ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-gray-300 font-light font-serif leading-relaxed mb-6 italic">
                  "{room.description}"
                </p>
                <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[var(--gold-accent)] font-medium">
                  <span>Adentrarse en la sala</span>
                  <ArrowRight size={14} className="animate-pulse" />
                </div>
              </div>
            </div>

            {/* Marco o borde interno de adorno Wabi-Sabi */}
            <div 
              className={`absolute inset-4 border pointer-events-none transition-opacity duration-700 ${
                isHovered ? 'opacity-25' : 'opacity-0'
              }`}
              style={{ borderColor: 'var(--border-color)' }}
            />
          </div>
        );
      })}

      {/* Pie de página minimalista flotante */}
      <div 
        className="absolute bottom-4 left-0 right-0 z-20 text-center pointer-events-none text-[10px] tracking-widest text-gray-400 uppercase font-light"
      >
        Presiona para iniciar el viaje
      </div>
    </div>
  );
}
