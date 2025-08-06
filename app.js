// ===============================
// Aplicación Principal RelaxaLAB
// ===============================

class RelaxaLAB {
  constructor() {
    this.modules = new Map();
    this.currentModule = 'bubbles';
    this.isInitialized = false;
    
    // Referencias a elementos DOM
    this.navButtons = document.querySelectorAll('.nav-btn');
    this.moduleContainers = document.querySelectorAll('.module');
    
    this.init();
  }

  async init() {
    try {
      // Mostrar indicador de carga
      this.showLoadingIndicator();
      
      // Esperar a que el DOM esté completamente cargado
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
          } else {
            window.addEventListener('load', resolve);
          }
        });
      }
      
      // Pequeña pausa para asegurar que todo esté listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Inicializar módulos
      await this.initializeModules();
      
      // Configurar navegación
      this.setupNavigation();
      
      // Configurar efectos de fondo
      this.setupBackgroundEffects();
      
      // Inicializar configuración
      this.initializeSettings();
      
      // Configurar eventos globales
      this.setupGlobalEvents();
      
      // Mostrar módulo inicial
      this.showModule('bubbles');
      
      // Ocultar indicador de carga
      this.hideLoadingIndicator();
      
      this.isInitialized = true;
      
      // Mensaje de bienvenida
      console.log('🧪 RelaxaLAB iniciado correctamente - ¡Disfruta de tu momento de relajación!');
      
    } catch (error) {
      console.error('Error al inicializar RelaxaLAB:', error);
      this.showErrorMessage('Error al cargar la aplicación. Por favor, recarga la página.');
    }
  }

  async initializeModules() {
    try {
      // Esperar un poco más para asegurar que todos los scripts estén cargados
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Inicializar módulo de audio primero
      if (window.audioManager) {
        console.log('✅ Audio Manager inicializado');
      }
      
      // Inicializar módulo de burbujas
      if (window.BubblesModule) {
        this.modules.set('bubbles', new window.BubblesModule());
        console.log('✅ Módulo de Burbujas inicializado');
      } else {
        console.warn('⚠️ BubblesModule no disponible');
      }
      
      // Inicializar módulo de respiración
      if (window.BreathingModule) {
        this.modules.set('breathing', new window.BreathingModule());
        console.log('✅ Módulo de Respiración inicializado');
      } else {
        console.warn('⚠️ BreathingModule no disponible');
      }
      
      // Inicializar módulo de cubos
      if (window.CubesModule) {
        this.modules.set('cubes', new window.CubesModule());
        console.log('✅ Módulo de Cubos inicializado');
      } else {
        console.warn('⚠️ CubesModule no disponible');
      }
      
      // Inicializar módulo spinner
      if (window.SpinnerModule) {
        this.modules.set('spinner', new window.SpinnerModule());
        console.log('✅ Módulo Spinner inicializado');
      } else {
        console.warn('⚠️ SpinnerModule no disponible');
      }
      
      // Inicializar módulo bubble wrap
      if (window.BubbleWrapModule) {
        this.modules.set('bubblewrap', new window.BubbleWrapModule());
        console.log('✅ Módulo Bubble Wrap inicializado');
      } else {
        console.warn('⚠️ BubbleWrapModule no disponible');
      }
      
      // Hacer módulos disponibles globalmente para debugging
      window.bubblesModule = this.modules.get('bubbles');
      window.breathingModule = this.modules.get('breathing');
      window.cubesModule = this.modules.get('cubes');
      window.spinnerModule = this.modules.get('spinner');
      window.bubbleWrapModule = this.modules.get('bubblewrap');
      
    } catch (error) {
      console.error('Error al inicializar módulos:', error);
      // No lanzar el error para que la aplicación continue
    }
  }

  initializeSettings() {
    try {
      if (window.SettingsModule) {
        this.settingsModule = new window.SettingsModule();
        window.settingsModule = this.settingsModule;
        console.log('✅ Módulo de Configuración inicializado');
      }
    } catch (error) {
      console.error('Error al inicializar configuración:', error);
    }
  }

  setupNavigation() {
    this.navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const moduleName = button.dataset.module;
        if (moduleName) {
          this.showModule(moduleName);
        }
      });
    });
  }

  showModule(moduleName) {
    if (!this.modules.has(moduleName)) {
      console.warn(`Módulo '${moduleName}' no encontrado`);
      return;
    }

    // Desactivar módulo actual
    if (this.currentModule && this.modules.has(this.currentModule)) {
      const currentModuleInstance = this.modules.get(this.currentModule);
      if (currentModuleInstance.deactivate) {
        currentModuleInstance.deactivate();
      }
    }

    // Actualizar navegación
    this.updateNavigation(moduleName);
    
    // Mostrar contenedor del módulo
    this.updateModuleVisibility(moduleName);
    
    // Activar nuevo módulo
    const newModuleInstance = this.modules.get(moduleName);
    if (newModuleInstance.activate) {
      newModuleInstance.activate();
    }
    
    this.currentModule = moduleName;
    
    // Sonido de navegación
    window.audioManager?.playSound('spinnerClick', { 
      volume: 0.2, 
      pitch: 1.1 
    });
    
    // Actualizar título dinámicamente
    this.updatePageTitle(moduleName);
  }

  updateNavigation(activeModule) {
    this.navButtons.forEach(button => {
      const isActive = button.dataset.module === activeModule;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive);
    });
  }

  updateModuleVisibility(activeModule) {
    this.moduleContainers.forEach(container => {
      const isActive = container.id === `${activeModule}-module`;
      container.classList.toggle('active', isActive);
      container.setAttribute('aria-hidden', !isActive);
    });
  }

  updatePageTitle(moduleName) {
    const titles = {
      bubbles: 'RelaxaLAB - Burbujas Relajantes',
      breathing: 'RelaxaLAB - Respiración Guiada',
      cubes: 'RelaxaLAB - Cubos Zen',
      spinner: 'RelaxaLAB - Spinner Interactivo',
      bubblewrap: 'RelaxaLAB - Bubble Wrap Digital'
    };
    
    document.title = titles[moduleName] || 'RelaxaLAB - Laboratorio Digital Antiestrés';
  }

  setupBackgroundEffects() {
    const overlay = document.getElementById('backgroundOverlay');
    if (!overlay) return;
    
    // Efectos de partículas sutiles en el fondo
    this.createBackgroundParticles(overlay);
    
    // Efecto de parallax suave en el mouse
    this.setupParallaxEffect();
  }

  createBackgroundParticles(container) {
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
        background: var(--accent-primary);
        border-radius: 50%;
        opacity: 0.3;
        animation: particleFloat ${10 + Math.random() * 20}s linear infinite;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 10}s;
      `;
      
      container.appendChild(particle);
    }
    
    // CSS para animación de partículas
    if (!document.querySelector('#particle-styles')) {
      const style = document.createElement('style');
      style.id = 'particle-styles';
      style.textContent = `
        @keyframes particleFloat {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(-50vh) translateX(${Math.random() * 100 - 50}px) scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px) scale(0.8);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupParallaxEffect() {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });
    
    const updateParallax = () => {
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;
      
      const overlay = document.getElementById('backgroundOverlay');
      if (overlay) {
        overlay.style.transform = `translate(${currentX * 10}px, ${currentY * 10}px)`;
      }
      
      requestAnimationFrame(updateParallax);
    };
    
    updateParallax();
  }

  setupGlobalEvents() {
    // Manejo de redimensionamiento de ventana
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
    
    // Manejo de visibilidad de la página
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Manejo de errores globales
    window.addEventListener('error', (event) => {
      console.error('Error global:', event.error);
    });
    
    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
  }

  handleResize() {
    // Notificar a todos los módulos del cambio de tamaño
    this.modules.forEach(module => {
      if (module.handleResize) {
        module.handleResize();
      }
    });
  }

  handleVisibilityChange() {
    if (document.hidden) {
      // Pausar animaciones cuando la página no es visible
      this.modules.forEach(module => {
        if (module.pause) {
          module.pause();
        }
      });
    } else {
      // Reanudar animaciones cuando la página vuelve a ser visible
      this.modules.forEach(module => {
        if (module.resume) {
          module.resume();
        }
      });
    }
  }

  handleKeyboard(event) {
    // Atajos de teclado para navegación
    if (event.altKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          this.showModule('bubbles');
          break;
        case '2':
          event.preventDefault();
          this.showModule('breathing');
          break;
        case '3':
          event.preventDefault();
          this.showModule('cubes');
          break;
        case '4':
          event.preventDefault();
          this.showModule('spinner');
          break;
        case '5':
          event.preventDefault();
          this.showModule('bubblewrap');
          break;
      }
    }
    
    // Espacio para pausar/reanudar el módulo actual
    if (event.code === 'Space' && !event.target.matches('input, textarea, button')) {
      event.preventDefault();
      const currentModuleInstance = this.modules.get(this.currentModule);
      if (currentModuleInstance.toggle) {
        currentModuleInstance.toggle();
      }
    }
  }

  showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(10px);
      ">
        <div style="text-align: center; color: var(--text-primary);">
          <div style="
            width: 50px;
            height: 50px;
            border: 3px solid var(--accent-primary);
            border-top: 3px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          "></div>
          <p style="font-family: var(--font-primary); font-size: 1.1rem;">
            Cargando RelaxaLAB...
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(loader);
    
    // CSS para la animación
    if (!document.querySelector('#loader-styles')) {
      const style = document.createElement('style');
      style.id = 'loader-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  hideLoadingIndicator() {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 500);
    }
  }

  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        padding: 2rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-hover);
        text-align: center;
        z-index: 10000;
        max-width: 400px;
        backdrop-filter: blur(20px);
      ">
        <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">
          ⚠️ Error
        </h3>
        <p style="color: var(--text-primary); margin-bottom: 1.5rem;">
          ${message}
        </p>
        <button onclick="location.reload()" style="
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-primary);
        ">
          Recargar Página
        </button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
  }

  // Utilidad para debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Método para obtener estadísticas de la aplicación
  getStats() {
    return {
      isInitialized: this.isInitialized,
      currentModule: this.currentModule,
      modulesLoaded: Array.from(this.modules.keys()),
      uptime: Date.now() - this.startTime || 0
    };
  }

  // Método para destruir la aplicación (cleanup)
  destroy() {
    this.modules.forEach(module => {
      if (module.destroy) {
        module.destroy();
      }
    });
    
    if (this.settingsModule && this.settingsModule.destroy) {
      this.settingsModule.destroy();
    }
    
    this.modules.clear();
    this.isInitialized = false;
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.relaxaLAB = new RelaxaLAB();
});

// Hacer disponible globalmente para debugging
window.RelaxaLAB = RelaxaLAB;
