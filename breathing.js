// ===============================
// Módulo de Respiración Guiada
// ===============================

class BreathingModule {
  constructor() {
    this.container = document.getElementById('breathing-module');
    this.circle = document.getElementById('breathingCircle');
    this.text = document.getElementById('breathingText');
    this.startBtn = document.getElementById('startBreathing');
    this.durationBtns = document.querySelectorAll('.duration-btn');
    
    this.isActive = false;
    this.isBreathing = false;
    this.currentPhase = 'inhale'; // 'inhale' | 'hold' | 'exhale' | 'pause'
    this.duration = 30; // segundos
    this.breathingInterval = null;
    this.breathingTimeout = null;
    this.phaseTimeout = null;
    
    // Configuración de respiración (en segundos)
    this.breathingPattern = {
      inhale: 4,
      hold: 4,
      exhale: 4,
      pause: 2
    };
    
    this.init();
  }

  init() {
    this.addEventListeners();
    this.updateUI();
  }

  addEventListeners() {
    // Botón de inicio/parada
    this.startBtn?.addEventListener('click', () => {
      if (this.isBreathing) {
        this.stopBreathing();
      } else {
        this.startBreathing();
      }
    });

    // Botones de duración
    this.durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isBreathing) return; // No cambiar durante la sesión
        
        this.durationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.duration = parseInt(btn.dataset.duration);
        this.updateUI();
      });
    });

    // Click en el círculo para iniciar/parar
    this.circle?.addEventListener('click', () => {
      if (this.isBreathing) {
        this.stopBreathing();
      } else {
        this.startBreathing();
      }
    });
  }

  startBreathing() {
    if (this.isBreathing) return;
    
    this.isBreathing = true;
    this.currentPhase = 'inhale';
    this.updateUI();
    
    // Sonido inicial suave
    window.audioManager?.playSound('breathe', { duration: 1, volume: 0.1 });
    
    // Iniciar el ciclo de respiración
    this.startBreathingCycle();
    
    // Programar el final de la sesión
    this.breathingTimeout = setTimeout(() => {
      this.stopBreathing();
    }, this.duration * 1000);
    
    // Deshabilitar botones de duración
    this.durationBtns.forEach(btn => btn.disabled = true);
  }

  stopBreathing() {
    if (!this.isBreathing) return;
    
    this.isBreathing = false;
    this.currentPhase = 'inhale';
    
    // Limpiar timeouts e intervalos
    if (this.breathingTimeout) {
      clearTimeout(this.breathingTimeout);
      this.breathingTimeout = null;
    }
    
    if (this.phaseTimeout) {
      clearTimeout(this.phaseTimeout);
      this.phaseTimeout = null;
    }
    
    this.updateUI();
    
    // Restablecer animaciones
    this.circle?.classList.remove('breathing-inhale', 'breathing-exhale');
    
    // Habilitar botones de duración
    this.durationBtns.forEach(btn => btn.disabled = false);
    
    // Sonido final
    window.audioManager?.playSound('breathe', { duration: 0.5, volume: 0.15 });
  }

  startBreathingCycle() {
    if (!this.isBreathing) return;
    
    this.executePhase();
  }

  executePhase() {
    if (!this.isBreathing) return;
    
    const phaseDuration = this.breathingPattern[this.currentPhase] * 1000;
    
    // Actualizar UI para la fase actual
    this.updatePhaseUI();
    
    // Programar la siguiente fase
    this.phaseTimeout = setTimeout(() => {
      this.nextPhase();
      this.executePhase();
    }, phaseDuration);
  }

  nextPhase() {
    switch (this.currentPhase) {
      case 'inhale':
        this.currentPhase = 'hold';
        break;
      case 'hold':
        this.currentPhase = 'exhale';
        break;
      case 'exhale':
        this.currentPhase = 'pause';
        break;
      case 'pause':
        this.currentPhase = 'inhale';
        break;
    }
  }

  updatePhaseUI() {
    if (!this.circle || !this.text) return;
    
    // Remover clases anteriores
    this.circle.classList.remove('breathing-inhale', 'breathing-exhale');
    
    switch (this.currentPhase) {
      case 'inhale':
        this.text.textContent = 'Inhala...';
        this.circle.classList.add('breathing-inhale');
        this.updateCircleColor('#81c784'); // Verde suave
        break;
        
      case 'hold':
        this.text.textContent = 'Mantén...';
        this.updateCircleColor('#64b5f6'); // Azul suave
        break;
        
      case 'exhale':
        this.text.textContent = 'Exhala...';
        this.circle.classList.add('breathing-exhale');
        this.updateCircleColor('#f48fb1'); // Rosa suave
        break;
        
      case 'pause':
        this.text.textContent = 'Pausa...';
        this.updateCircleColor('#ffb74d'); // Naranja suave
        break;
    }
    
    // Reproducir sonido suave según la fase
    if (this.currentPhase === 'inhale' || this.currentPhase === 'exhale') {
      const duration = this.breathingPattern[this.currentPhase];
      window.audioManager?.playSound('breathe', { 
        duration: duration, 
        volume: 0.08 
      });
    }
  }

  updateCircleColor(color) {
    if (!this.circle) return;
    
    // Crear gradiente dinámico con el color especificado
    const gradient = `conic-gradient(from 0deg, ${color}, ${this.lightenColor(color, 20)}, ${this.darkenColor(color, 10)}, ${color})`;
    this.circle.style.background = gradient;
  }

  lightenColor(color, percent) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + percent);
    const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + percent);
    const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + percent);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  darkenColor(color, percent) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - percent);
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - percent);
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - percent);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  updateUI() {
    if (!this.startBtn || !this.text) return;
    
    if (this.isBreathing) {
      this.startBtn.textContent = 'Detener Respiración';
      this.startBtn.style.background = 'var(--accent-tertiary)';
    } else {
      this.startBtn.textContent = 'Comenzar Respiración';
      this.startBtn.style.background = '';
      this.text.textContent = `Sesión de ${this.duration}s`;
      
      // Restablecer color del círculo
      this.updateCircleColor('#81c784');
    }
  }

  activate() {
    this.isActive = true;
    // Si hay una sesión en curso, mantenerla
  }

  deactivate() {
    this.isActive = false;
    // No detener automáticamente la respiración al cambiar de módulo
    // Esto permite que continue en segundo plano
  }

  destroy() {
    this.stopBreathing();
  }

  // Método para ajustar el patrón de respiración
  setBreathingPattern(inhale, hold, exhale, pause) {
    if (this.isBreathing) return false; // No cambiar durante una sesión
    
    this.breathingPattern = {
      inhale: inhale || 4,
      hold: hold || 4,
      exhale: exhale || 4,
      pause: pause || 2
    };
    
    return true;
  }

  // Método para obtener el estado actual
  getState() {
    return {
      isBreathing: this.isBreathing,
      currentPhase: this.currentPhase,
      duration: this.duration,
      pattern: this.breathingPattern
    };
  }
}

// Exportar para uso global
window.BreathingModule = BreathingModule;
