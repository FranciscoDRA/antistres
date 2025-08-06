// ===============================
// Módulo de Configuración y Persistencia
// ===============================

class SettingsModule {
  constructor() {
    this.panel = document.getElementById('settingsPanel');
    this.settingsBtn = document.querySelector('.settings-btn');
    this.closeBtn = document.getElementById('closeSettings');
    
    // Elementos de configuración
    this.themeBtns = document.querySelectorAll('.theme-btn');
    this.soundBtns = document.querySelectorAll('.sound-btn');
    this.reduceMotionToggle = document.getElementById('reduceMotion');
    this.enableSoundsToggle = document.getElementById('enableSounds');
    this.exportBtn = document.getElementById('exportConfig');
    this.resetBtn = document.getElementById('resetConfig');
    
    // Configuración por defecto
    this.defaultConfig = {
      theme: 'zen',
      ambientSound: 'water',
      reduceMotion: false,
      enableSounds: true,
      bubbles: {
        autoCreate: true,
        maxBubbles: 20
      },
      breathing: {
        defaultDuration: 30,
        pattern: { inhale: 4, hold: 4, exhale: 4, pause: 2 }
      },
      cubes: {
        physics: { gravity: 0.3, bounce: 0.7, friction: 0.98 }
      },
      spinner: {
        idleAnimation: true
      }
    };
    
    this.currentConfig = { ...this.defaultConfig };
    this.isOpen = false;
    
    this.init();
  }

  init() {
    this.loadConfig();
    this.addEventListeners();
    this.applyConfig();
  }

  addEventListeners() {
    // Abrir/cerrar panel de configuración
    this.settingsBtn?.addEventListener('click', () => {
      this.togglePanel();
    });

    this.closeBtn?.addEventListener('click', () => {
      this.closePanel();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePanel();
      }
    });

    // Cerrar al hacer clic fuera del panel
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.panel?.contains(e.target) && e.target !== this.settingsBtn) {
        this.closePanel();
      }
    });

    // Botones de tema
    this.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
    });

    // Botones de sonido ambiente
    this.soundBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setAmbientSound(btn.dataset.sound);
      });
    });

    // Toggles de accesibilidad
    this.reduceMotionToggle?.addEventListener('change', (e) => {
      this.setReduceMotion(e.target.checked);
    });

    this.enableSoundsToggle?.addEventListener('change', (e) => {
      this.setEnableSounds(e.target.checked);
    });

    // Botones de datos
    this.exportBtn?.addEventListener('click', () => {
      this.exportConfig();
    });

    this.resetBtn?.addEventListener('click', () => {
      this.resetConfig();
    });
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    if (!this.panel) return;
    
    this.panel.classList.add('open');
    this.isOpen = true;
    
    // Efecto de backdrop
    document.body.style.overflow = 'hidden';
    
    // Sonido de apertura
    window.audioManager?.playSound('spinnerClick', { volume: 0.2, pitch: 1.2 });
  }

  closePanel() {
    if (!this.panel) return;
    
    this.panel.classList.remove('open');
    this.isOpen = false;
    
    // Quitar efecto de backdrop
    document.body.style.overflow = '';
    
    // Guardar configuración
    this.saveConfig();
    
    // Sonido de cierre
    window.audioManager?.playSound('spinnerClick', { volume: 0.2, pitch: 0.8 });
  }

  setTheme(theme) {
    this.currentConfig.theme = theme;
    this.applyTheme(theme);
    this.updateThemeButtons(theme);
    this.saveConfig();
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    
    // Actualizar colores de los módulos
    this.updateModuleColors();
  }

  updateThemeButtons(activeTheme) {
    this.themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === activeTheme);
    });
  }

  setAmbientSound(sound) {
    this.currentConfig.ambientSound = sound;
    this.updateSoundButtons(sound);
    
    // Cambiar sonido ambiente
    window.audioManager?.setAmbientSound(sound);
    this.saveConfig();
  }

  updateSoundButtons(activeSound) {
    this.soundBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sound === activeSound);
    });
  }

  setReduceMotion(enabled) {
    this.currentConfig.reduceMotion = enabled;
    
    if (enabled) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
    
    this.saveConfig();
  }

  setEnableSounds(enabled) {
    this.currentConfig.enableSounds = enabled;
    
    // Habilitar/deshabilitar sonidos
    window.audioManager?.toggleSounds(enabled);
    
    this.saveConfig();
  }

  updateModuleColors() {
    // Obtener colores del tema actual
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Actualizar colores de burbujas si el módulo existe
    if (window.bubblesModule) {
      const bubbleColors = this.getBubbleColorsForTheme(this.currentConfig.theme);
      window.bubblesModule.colors = bubbleColors;
    }
    
    // Actualizar colores del spinner si el módulo existe
    if (window.spinnerModule) {
      const spinnerColors = this.getSpinnerColorsForTheme(this.currentConfig.theme);
      window.spinnerModule.setColors(spinnerColors);
    }
  }

  getBubbleColorsForTheme(theme) {
    const themes = {
      zen: ['#81c784', '#64b5f6', '#f48fb1', '#ffb74d', '#a5d6a7', '#90caf9'],
      dark: ['#68d391', '#63b3ed', '#fbb6ce', '#f6e05e', '#9ae6b4', '#90cdf4'],
      viking: ['#d69e2e', '#c05621', '#9c4221', '#b7791f', '#a0522d', '#cd853f'],
      kawaii: ['#f472b6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
    };
    return themes[theme] || themes.zen;
  }

  getSpinnerColorsForTheme(theme) {
    return this.getBubbleColorsForTheme(theme);
  }

  exportConfig() {
    const config = {
      ...this.currentConfig,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `relaxalab-config-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Sonido de confirmación
    window.audioManager?.playSound('bubblePop', { volume: 0.3, pitch: 1.3 });
    
    // Mostrar notificación
    this.showNotification('Configuración exportada correctamente', 'success');
  }

  resetConfig() {
    if (confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
      this.currentConfig = { ...this.defaultConfig };
      this.applyConfig();
      this.saveConfig();
      
      // Sonido de confirmación
      window.audioManager?.playSound('spinnerClick', { volume: 0.3, pitch: 0.9 });
      
      // Mostrar notificación
      this.showNotification('Configuración restaurada', 'success');
    }
  }

  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-hover);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      backdrop-filter: blur(10px);
      color: var(--text-primary);
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('relaxalab-config');
      if (saved) {
        this.currentConfig = { ...this.defaultConfig, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Error al cargar la configuración:', error);
      this.currentConfig = { ...this.defaultConfig };
    }
  }

  saveConfig() {
    try {
      localStorage.setItem('relaxalab-config', JSON.stringify(this.currentConfig));
    } catch (error) {
      console.warn('Error al guardar la configuración:', error);
    }
  }

  applyConfig() {
    // Aplicar tema
    this.applyTheme(this.currentConfig.theme);
    this.updateThemeButtons(this.currentConfig.theme);
    
    // Aplicar sonido ambiente
    this.updateSoundButtons(this.currentConfig.ambientSound);
    window.audioManager?.setAmbientSound(this.currentConfig.ambientSound);
    
    // Aplicar accesibilidad
    this.setReduceMotion(this.currentConfig.reduceMotion);
    this.setEnableSounds(this.currentConfig.enableSounds);
    
    // Actualizar controles
    if (this.reduceMotionToggle) {
      this.reduceMotionToggle.checked = this.currentConfig.reduceMotion;
    }
    if (this.enableSoundsToggle) {
      this.enableSoundsToggle.checked = this.currentConfig.enableSounds;
    }
  }

  getConfig() {
    return { ...this.currentConfig };
  }

  updateConfig(newConfig) {
    this.currentConfig = { ...this.currentConfig, ...newConfig };
    this.applyConfig();
    this.saveConfig();
  }

  // Método para importar configuración (para uso futuro)
  importConfig(configFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target.result);
        this.currentConfig = { ...this.defaultConfig, ...importedConfig };
        this.applyConfig();
        this.saveConfig();
        this.showNotification('Configuración importada correctamente', 'success');
      } catch (error) {
        this.showNotification('Error al importar la configuración', 'error');
      }
    };
    reader.readAsText(configFile);
  }
}

// Exportar para uso global
window.SettingsModule = SettingsModule;
