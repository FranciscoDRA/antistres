// ===============================
// Módulo Bubble Wrap Digital
// ===============================

class BubbleWrapModule {
  constructor() {
    // Inicializar propiedades pero no buscar elementos DOM todavía
    this.bubbles = [];
    this.isActive = false;
    this.totalBubbles = 0;
    this.poppedBubbles = 0;
    
    // Configuración de la grilla
    this.gridConfig = {
      rows: 15,
      cols: 20,
      mobile: {
        rows: 12,
        cols: 10
      }
    };
    
    // Solo inicializar si estamos en el navegador y el DOM está listo
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        // DOM ya está listo, inicializar inmediatamente
        setTimeout(() => this.init(), 0);
      }
    }
  }

  init() {
    // Buscar elementos DOM
    this.container = document.getElementById('bubblewrapContainer');
    this.grid = document.getElementById('bubblewrapGrid');
    this.resetBtn = document.getElementById('resetBubbleWrap');
    this.popAllBtn = document.getElementById('popAllBubbles');
    this.bubblesLeftCounter = document.getElementById('bubblesLeft');
    
    // Solo continuar si encontramos los elementos principales
    if (!this.container || !this.grid) {
      console.warn('BubbleWrapModule: Elementos DOM no encontrados, esperando activación...');
      return;
    }
    
    this.addEventListeners();
    this.createBubbleWrapGrid();
    this.updateCounter();
  }

  addEventListeners() {
    // Botón de reinicio
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.resetAllBubbles();
      });
    }

    // Botón de explotar todas
    if (this.popAllBtn) {
      this.popAllBtn.addEventListener('click', () => {
        this.popAllBubbles();
      });
    }

    // Redimensionamiento de ventana
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // Atajos de teclado específicos
    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      
      switch (e.key) {
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.resetAllBubbles();
          }
          break;
        case ' ':
          if (!e.target.matches('button, input, textarea')) {
            e.preventDefault();
            this.popRandomBubble();
          }
          break;
        case 'Escape':
          this.popAllBubbles();
          break;
      }
    });
  }

  createBubbleWrapGrid() {
    if (!this.grid) return;

    // Limpiar grilla existente
    this.grid.innerHTML = '';
    this.bubbles = [];
    this.poppedBubbles = 0;

    // Determinar tamaño de grilla según el dispositivo
    const isMobile = window.innerWidth <= 768;
    const config = isMobile ? this.gridConfig.mobile : this.gridConfig;
    
    this.totalBubbles = config.rows * config.cols;

    // Configurar CSS Grid
    this.grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

    // Crear burbujas
    for (let i = 0; i < this.totalBubbles; i++) {
      this.createBubbleWrapItem(i);
    }

    this.updateCounter();
  }

  createBubbleWrapItem(index) {
    const item = document.createElement('div');
    item.className = 'bubble-wrap-item';
    item.dataset.index = index;

    const bubble = document.createElement('div');
    bubble.className = 'bubble-wrap-bubble';

    item.appendChild(bubble);

    // Propiedades de la burbuja
    const bubbleData = {
      index: index,
      isPopped: false,
      element: item,
      bubble: bubble
    };

    // Event listeners
    this.addBubbleEventListeners(item, bubbleData);

    // Agregar al DOM y array
    this.grid.appendChild(item);
    this.bubbles.push(bubbleData);
  }

  addBubbleEventListeners(item, bubbleData) {
    // Click para explotar
    item.addEventListener('click', (e) => {
      e.preventDefault();
      this.popBubble(bubbleData);
    });

    // Touch para dispositivos móviles
    item.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.popBubble(bubbleData);
    });

    // Hover para efecto visual (solo en desktop)
    if (!('ontouchstart' in window)) {
      item.addEventListener('mouseenter', () => {
        if (!bubbleData.isPopped) {
          this.addHoverEffect(bubbleData);
        }
      });

      item.addEventListener('mouseleave', () => {
        if (!bubbleData.isPopped) {
          this.removeHoverEffect(bubbleData);
        }
      });
    }

    // Prevenir selección de texto
    item.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
  }

  addHoverEffect(bubbleData) {
    if (bubbleData.bubble) {
      bubbleData.bubble.style.transform = 'scale(1.05)';
    }
  }

  removeHoverEffect(bubbleData) {
    if (bubbleData.bubble && !bubbleData.isPopped) {
      bubbleData.bubble.style.transform = 'scale(1)';
    }
  }

  popBubble(bubbleData) {
    if (bubbleData.isPopped) return;

    bubbleData.isPopped = true;
    this.poppedBubbles++;

    // Agregar clase de animación
    bubbleData.element.classList.add('popping');

    // Sonido de pop con variación
    const variant = bubbleData.index % 5;
    window.audioManager?.playSound('bubbleWrapPop', {
      pitch: 0.9 + Math.random() * 0.3,
      volume: 0.4 + Math.random() * 0.2,
      variant: variant
    });

    // Eliminar clase de animación y agregar clase de explotado
    setTimeout(() => {
      bubbleData.element.classList.remove('popping');
      bubbleData.element.classList.add('popped');
      this.updateCounter();
      
      // Verificar si todas las burbujas están explotadas
      if (this.poppedBubbles >= this.totalBubbles) {
        this.onAllBubblesPopped();
      }
    }, 400);

    // Efecto de ondas en burbujas cercanas
    this.createRippleEffect(bubbleData.index);
  }

  createRippleEffect(centerIndex) {
    const config = window.innerWidth <= 768 ? this.gridConfig.mobile : this.gridConfig;
    const centerRow = Math.floor(centerIndex / config.cols);
    const centerCol = centerIndex % config.cols;

    // Afectar burbujas en un radio de 2
    for (let row = centerRow - 2; row <= centerRow + 2; row++) {
      for (let col = centerCol - 2; col <= centerCol + 2; col++) {
        if (row >= 0 && row < config.rows && col >= 0 && col < config.cols) {
          const bubbleIndex = row * config.cols + col;
          const bubble = this.bubbles[bubbleIndex];
          
          if (bubble && !bubble.isPopped && bubbleIndex !== centerIndex) {
            const distance = Math.sqrt(
              Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
            );
            
            if (distance <= 2) {
              // Pequeña animación de ondas
              setTimeout(() => {
                if (bubble.bubble && !bubble.isPopped) {
                  bubble.bubble.style.transform = 'scale(1.1)';
                  setTimeout(() => {
                    if (bubble.bubble && !bubble.isPopped) {
                      bubble.bubble.style.transform = 'scale(1)';
                    }
                  }, 100);
                }
              }, distance * 50);
            }
          }
        }
      }
    }
  }

  popRandomBubble() {
    const availableBubbles = this.bubbles.filter(bubble => !bubble.isPopped);
    if (availableBubbles.length > 0) {
      const randomBubble = availableBubbles[Math.floor(Math.random() * availableBubbles.length)];
      this.popBubble(randomBubble);
    }
  }

  popAllBubbles() {
    if (this.poppedBubbles >= this.totalBubbles) return;

    const availableBubbles = this.bubbles.filter(bubble => !bubble.isPopped);
    
    // Agregar clase para efecto de masa
    this.grid.classList.add('mass-popping');

    // Sonido de múltiples pops
    window.audioManager?.playSound('bubbleWrapMultiPop', {
      count: Math.min(availableBubbles.length, 20),
      volume: 0.3,
      spread: 0.8
    });

    // Explotar burbujas en ondas desde el centro
    const config = window.innerWidth <= 768 ? this.gridConfig.mobile : this.gridConfig;
    const centerRow = Math.floor(config.rows / 2);
    const centerCol = Math.floor(config.cols / 2);

    availableBubbles.forEach((bubble, index) => {
      const bubbleRow = Math.floor(bubble.index / config.cols);
      const bubbleCol = bubble.index % config.cols;
      
      const distance = Math.sqrt(
        Math.pow(bubbleRow - centerRow, 2) + Math.pow(bubbleCol - centerCol, 2)
      );
      
      const delay = distance * 50 + Math.random() * 100;
      
      // Configurar delay personalizado para CSS
      bubble.element.style.setProperty('--delay', `${delay}ms`);
      
      setTimeout(() => {
        this.popBubble(bubble);
      }, delay);
    });

    // Remover clase después de la animación
    setTimeout(() => {
      this.grid.classList.remove('mass-popping');
    }, 2000);
  }

  resetAllBubbles() {
    // Sonido de reinicio
    window.audioManager?.playSound('spinnerClick', { 
      volume: 0.3, 
      pitch: 1.3 
    });

    this.bubbles.forEach((bubble, index) => {
      if (bubble.isPopped) {
        bubble.isPopped = false;
        bubble.element.classList.remove('popped');
        bubble.element.classList.add('resetting');
        
        // Delay escalonado para efecto visual
        setTimeout(() => {
          bubble.element.classList.remove('resetting');
        }, (index * 10) + 600);
      }
    });

    this.poppedBubbles = 0;
    this.updateCounter();

    // Mensaje de reinicio
    this.showTemporaryMessage('¡Bubble Wrap reiniciado! 🎈');
  }

  onAllBubblesPopped() {
    // Efecto de celebración
    this.showTemporaryMessage('¡Todas las burbujas explotadas! 🎉');
    
    // Sonido de celebración
    setTimeout(() => {
      window.audioManager?.playSound('bubbleWrapMultiPop', {
        count: 8,
        volume: 0.4,
        spread: 0.3
      });
    }, 500);

    // Auto-reinicio después de 3 segundos
    setTimeout(() => {
      this.resetAllBubbles();
    }, 3000);
  }

  showTemporaryMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg-card);
      color: var(--text-primary);
      padding: 1rem 2rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-hover);
      font-size: 1.2rem;
      font-weight: 600;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border: 1px solid var(--border-color);
      animation: messagePopIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

    // Agregar keyframes si no existen
    if (!document.querySelector('#message-styles')) {
      const style = document.createElement('style');
      style.id = 'message-styles';
      style.textContent = `
        @keyframes messagePopIn {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    this.container.appendChild(messageDiv);

    // Eliminar después de 2 segundos
    setTimeout(() => {
      messageDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      messageDiv.style.opacity = '0';
      messageDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
      
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv);
        }
      }, 500);
    }, 2000);
  }

  updateCounter() {
    const remaining = this.totalBubbles - this.poppedBubbles;
    if (this.bubblesLeftCounter) {
      this.bubblesLeftCounter.textContent = remaining;
    }
  }

  handleResize() {
    // Solo recrear la grilla si está inicializada
    if (this.grid && this.container) {
      this.createBubbleWrapGrid();
    }
  }

  activate() {
    this.isActive = true;
    
    // Si no se inicializó correctamente antes, intentar ahora
    if (!this.container || !this.grid) {
      this.init();
    }
    
    // Si aún no se puede inicializar, mostrar error
    if (!this.container || !this.grid) {
      console.error('BubbleWrapModule: No se pudieron encontrar los elementos DOM necesarios');
      return;
    }
  }

  deactivate() {
    this.isActive = false;
  }

  destroy() {
    this.bubbles = [];
    this.isActive = false;
    if (this.grid) {
      this.grid.innerHTML = '';
    }
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

  // Método para obtener estadísticas
  getStats() {
    return {
      totalBubbles: this.totalBubbles,
      poppedBubbles: this.poppedBubbles,
      remaining: this.totalBubbles - this.poppedBubbles,
      completionPercentage: (this.poppedBubbles / this.totalBubbles * 100).toFixed(1)
    };
  }

  // Método para configurar dificultad (tamaño de grilla)
  setDifficulty(difficulty) {
    const configs = {
      easy: { rows: 10, cols: 15, mobile: { rows: 8, cols: 8 } },
      normal: { rows: 15, cols: 20, mobile: { rows: 12, cols: 10 } },
      hard: { rows: 20, cols: 25, mobile: { rows: 15, cols: 12 } }
    };

    if (configs[difficulty]) {
      this.gridConfig = configs[difficulty];
      this.createBubbleWrapGrid();
    }
  }
}

// Exportar para uso global
window.BubbleWrapModule = BubbleWrapModule;
