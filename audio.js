// ===============================
// Audio Manager - Web Audio API
// ===============================

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.enabledSounds = true;
    this.currentAmbientSound = 'water';
    this.initAudioContext();
    this.createSounds();
  }

  async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume context on user interaction (required by browsers)
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', () => {
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
        }, { once: true });
      }
    } catch (error) {
      console.warn('Web Audio API no compatible:', error);
    }
  }

  // Crear sonidos sintéticos usando Web Audio API
  createSounds() {
    if (!this.audioContext) return;

    // Sonido de burbuja pop
    this.sounds.set('bubblePop', this.createBubblePopSound.bind(this));
    
    // Sonido de respiración
    this.sounds.set('breathe', this.createBreatheSound.bind(this));
    
    // Sonido de cubo cayendo
    this.sounds.set('cubeFall', this.createCubeFallSound.bind(this));
    
    // Sonido de spinner
    this.sounds.set('spinnerClick', this.createSpinnerSound.bind(this));
    
    // Sonidos específicos para Bubble Wrap
    this.sounds.set('bubbleWrapPop', this.createBubbleWrapPopSound.bind(this));
    this.sounds.set('bubbleWrapMultiPop', this.createBubbleWrapMultiPopSound.bind(this));
    
    // Sonidos ambiente
    this.sounds.set('water', this.createWaterSound.bind(this));
    this.sounds.set('wind', this.createWindSound.bind(this));
    this.sounds.set('wood', this.createWoodSound.bind(this));
  }

  // Reproducir sonido
  playSound(soundName, options = {}) {
    if (!this.enabledSounds || !this.audioContext || !this.sounds.has(soundName)) {
      return;
    }

    try {
      const soundFunction = this.sounds.get(soundName);
      soundFunction(options);
    } catch (error) {
      console.warn('Error al reproducir sonido:', error);
    }
  }

  // Crear sonido de burbuja que explota
  createBubblePopSound(options = {}) {
    const { pitch = 1, volume = 0.3 } = options;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Configurar oscilador con frecuencia aleatoria
    const baseFreq = 800 + (Math.random() * 400);
    oscillator.frequency.setValueAtTime(baseFreq * pitch, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200 * pitch, this.audioContext.currentTime + 0.3);
    oscillator.type = 'sine';

    // Configurar filtro para suavizar
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);

    // Configurar volumen con fade out
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    // Conectar nodos
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Reproducir
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Crear sonido de respiración suave
  createBreatheSound(options = {}) {
    const { duration = 4, volume = 0.2 } = options;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Configurar oscilador
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.type = 'sine';

    // Configurar filtro
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(400, this.audioContext.currentTime);

    // Configurar envolvente de volumen para simular respiración
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + duration / 2);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

    // Conectar nodos
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Reproducir
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Crear sonido de cubo cayendo
  createCubeFallSound(options = {}) {
    const { volume = 0.4 } = options;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Configurar oscilador con caída de frecuencia
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
    oscillator.type = 'square';

    // Configurar filtro
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);

    // Configurar volumen
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    // Conectar nodos
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Reproducir
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Crear sonido de spinner
  createSpinnerSound(options = {}) {
    const { volume = 0.3 } = options;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Configurar oscilador con pitch ascendente
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    oscillator.type = 'triangle';

    // Configurar volumen
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    // Conectar nodos
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Reproducir
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Crear sonido de bubble wrap pop (más realista)
  createBubbleWrapPopSound(options = {}) {
    const { pitch = 1, volume = 0.4, variant = 0 } = options;
    
    // Crear ruido blanco corto para simular el "pffff"
    const bufferSize = this.audioContext.sampleRate * 0.1; // 100ms
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Generar ruido blanco con envelope
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.exp(-progress * 8); // Decay exponencial
      output[i] = (Math.random() * 2 - 1) * envelope * 0.5;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();
    const highPassFilter = this.audioContext.createBiquadFilter();

    source.buffer = buffer;

    // Configurar filtros para simular el sonido del plástico
    filterNode.type = 'bandpass';
    filterNode.frequency.setValueAtTime(1200 + (variant * 200) + (Math.random() * 400), this.audioContext.currentTime);
    filterNode.Q.setValueAtTime(3 + Math.random() * 2, this.audioContext.currentTime);

    highPassFilter.type = 'highpass';
    highPassFilter.frequency.setValueAtTime(600, this.audioContext.currentTime);

    // Configurar volumen con variación
    const finalVolume = volume * (0.8 + Math.random() * 0.4);
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(finalVolume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);

    // Conectar nodos
    source.connect(highPassFilter);
    highPassFilter.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Reproducir
    source.start(this.audioContext.currentTime);
    source.stop(this.audioContext.currentTime + 0.1);

    // Agregar un pequeño click inicial para simular el estallido
    const clickOsc = this.audioContext.createOscillator();
    const clickGain = this.audioContext.createGain();
    
    clickOsc.frequency.setValueAtTime(800 + (variant * 100), this.audioContext.currentTime);
    clickOsc.type = 'square';
    
    clickGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    clickGain.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.02);
    
    clickOsc.connect(clickGain);
    clickGain.connect(this.audioContext.destination);
    
    clickOsc.start(this.audioContext.currentTime);
    clickOsc.stop(this.audioContext.currentTime + 0.02);
  }

  // Crear sonido para múltiples pops simultáneos
  createBubbleWrapMultiPopSound(options = {}) {
    const { count = 5, volume = 0.3, spread = 0.2 } = options;
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createBubbleWrapPopSound({
          pitch: 0.8 + Math.random() * 0.6,
          volume: volume * (0.7 + Math.random() * 0.6),
          variant: i
        });
      }, Math.random() * spread * 1000);
    }
  }

  // Crear sonido de agua ambiente
  createWaterSound(options = {}) {
    const { duration = 10, volume = 0.1 } = options;
    
    // Crear ruido blanco filtrado para simular agua
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Generar ruido blanco
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    source.buffer = buffer;
    source.loop = true;

    // Configurar filtro para simular agua
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filterNode.Q.setValueAtTime(2, this.audioContext.currentTime);

    // Configurar volumen
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    // Conectar nodos
    source.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Reproducir
    source.start(this.audioContext.currentTime);
    
    // Detener después del tiempo especificado
    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
      setTimeout(() => source.stop(), 1000);
    }, duration * 1000);
  }

  // Crear sonido de viento ambiente
  createWindSound(options = {}) {
    const { duration = 10, volume = 0.1 } = options;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Generar ruido rosa para simular viento
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    source.buffer = buffer;
    source.loop = true;

    // Configurar filtro
    filterNode.type = 'highpass';
    filterNode.frequency.setValueAtTime(100, this.audioContext.currentTime);

    // Configurar volumen
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    // Conectar nodos
    source.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Reproducir
    source.start(this.audioContext.currentTime);
    
    // Detener después del tiempo especificado
    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
      setTimeout(() => source.stop(), 1000);
    }, duration * 1000);
  }

  // Crear sonido de madera ambiente
  createWoodSound(options = {}) {
    const { volume = 0.2 } = options;
    
    // Crear serie de clicks suaves aleatorios para simular madera
    const createClick = (delay) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();

        oscillator.frequency.setValueAtTime(200 + Math.random() * 300, this.audioContext.currentTime);
        oscillator.type = 'triangle';

        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(500, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * (0.3 + Math.random() * 0.7), this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }, delay);
    };

    // Crear clicks aleatorios durante 10 segundos
    for (let i = 0; i < 20; i++) {
      createClick(Math.random() * 10000);
    }
  }

  // Habilitar/deshabilitar sonidos
  toggleSounds(enabled) {
    this.enabledSounds = enabled;
    if (!enabled && this.audioContext) {
      // Detener todos los sonidos activos
      this.audioContext.suspend();
    } else if (enabled && this.audioContext) {
      this.audioContext.resume();
    }
  }

  // Cambiar sonido ambiente
  setAmbientSound(soundType) {
    this.currentAmbientSound = soundType;
    if (soundType !== 'silence' && this.enabledSounds) {
      this.playSound(soundType, { duration: 10 });
    }
  }
}

// Exportar instancia global
window.AudioManager = AudioManager;


