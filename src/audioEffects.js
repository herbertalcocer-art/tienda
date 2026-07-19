// Síntesis de sonido mediante Web Audio API para evitar descargas de archivos y garantizar rendimiento instantáneo.

let audioContext = null;
let isMuted = localStorage.getItem('atelier_muted') === 'true';

export function getMuteState() {
  return isMuted;
}

export function setMuteState(muted) {
  isMuted = muted;
  localStorage.setItem('atelier_muted', muted ? 'true' : 'false');
}

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(e => console.warn('Error al activar AudioContext:', e));
  }
  return audioContext;
}

// Generar búfer de ruido blanco estático
let noiseBufferCache = null;
function getNoiseBuffer(ctx) {
  if (noiseBufferCache) return noiseBufferCache;
  
  const bufferSize = ctx.sampleRate * 1.5; // 1.5 segundos de ruido
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBufferCache = buffer;
  return buffer;
}

/**
 * Reproduce un sonido sutil que imita pasar la página de un libro antiguo.
 */
export function playPageFlip() {
  if (isMuted) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    // Filtro Pasa Banda (Bandpass) enfocado en frecuencias medias-bajas de papel
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4.0;
    
    // Barrido de frecuencia descendente (el sonido del papel rozándose al doblarse)
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.35);

    // Envolvente de volumen (muy baja amplitud para ser un susurro táctil)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05); // Pico sutil
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    // Conexiones
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Ejecución
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn('AudioContext bloqueado o no soportado en este navegador:', e);
  }
}

/**
 * Reproduce un sonido sutil que imita el roce de una tela suave (seda/lino).
 */
export function playClothRustle() {
  if (isMuted) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    // Filtro Pasa Banda enfocado en frecuencias más altas (fricción fina de tela)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.0;
    
    // Frecuencia alta cayendo rápidamente
    filter.frequency.setValueAtTime(1300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.28);

    // Envolvente de volumen extremadamente suave
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    // Conexiones
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Ejecución
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.32);
  } catch (e) {
    console.warn('AudioContext bloqueado o no soportado en este navegador:', e);
  }
}
