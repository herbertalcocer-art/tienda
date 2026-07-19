import React from 'react';
import { X, Feather, Truck, ShieldCheck } from 'lucide-react';

export default function Manifiesto({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-only">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 md:p-12 bg-[var(--bg-color)] border shadow-xl animate-fade-in"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Sección del Manifiesto */}
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4 text-[var(--gold-accent)]">
            <Feather size={28} />
          </div>
          <h2 className="text-3xl font-serif mb-6 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
            El Manifiesto
          </h2>
          <div className="space-y-4 text-sm md:text-base text-[var(--text-muted)] leading-relaxed text-justify font-light font-serif italic">
            <p>
              "Creemos en las manos que acarician el metal y en el telar que respira con el viento. En una época de prisas y consumo efímero, nuestra Maison se erige como un templo al sosiego. No vendemos objetos; entregamos instantes de materia viva esculpida por el tiempo."
            </p>
            <p>
              "Aquí no encontrarás prisas, ni pasarelas frías de transacción digital. Cada costura, cada imperfección de la plata pulida a mano, cuenta una historia de intimidad y paciencia. Comprar aquí es iniciar una conversación humana, un ritual donde la asesora acompaña tu elección con la paciencia de un viejo amigo."
            </p>
          </div>
        </div>

        <hr className="my-8" style={{ borderColor: 'var(--border-color)' }} />

        {/* Sección de Envíos y Proceso */}
        <div className="grid md:grid-cols-2 gap-8 text-xs tracking-wide">
          <div>
            <div className="flex items-center gap-2 mb-3 text-[var(--gold-accent)] uppercase">
              <Truck size={14} />
              <span>El Tránsito y la Espera</span>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed font-light">
              Nuestras piezas viajan envueltas en lino orgánico y protegidas en cofres de madera reciclada. Los envíos nacionales tardan entre 3 a 5 días hábiles, respetando los tiempos del transporte terrestre para reducir nuestra huella ecológica.
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-3 text-[var(--gold-accent)] uppercase">
              <ShieldCheck size={14} />
              <span>El Vínculo de Garantía</span>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed font-light">
              Al ser piezas de carácter puramente artesanal, ofrecemos un servicio post-compra vitalicio para el ajuste de talla de joyería y retoque de costura. Nos importa que la pieza te acompañe a lo largo de las estaciones de tu vida.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 border text-xs uppercase tracking-widest hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-all"
            style={{ borderColor: 'var(--text-color)' }}
          >
            Regresar a la contemplación
          </button>
        </div>
      </div>
    </div>
  );
}
