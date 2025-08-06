// ===============================
// Módulo de Burbujas Antiestrés
// ===============================

class BubblesModule {
  constructor() {
    this.container = document.getElementById('bubblesContainer');
    this.addBubbleBtn = document.getElementById('addBubble');
    this.clearBubblesBtn = document.getElementById('clearBubbles');
    this.bubbles = [];
    this.isActive = false;
    this.animationFrame = null;
    this.colors = [
      '#81c784', '#64b5f6', '#f48fb1', 
      '#ffb74d', '#a5d6a7', '#90caf9',
      '#ffab91', '#ce93d8', '#80cbc4'
    ];
    
    this.init();
  }

  init() {
    this.addEventListeners();
    this.createInitialBubbles();
    this.startAnimation();
  }

  addEventListeners() {
    // Botón para agregar más burbujas
    this.addBubbleBtn?.addEventListener('click', () => {
      this.createBubbles(5);
      window.audioManager?.playSound('bubblePop', { pitch: 1.2, volume: 0.2 });
    });

    // Botón para limpiar burbujas
    this.clearBubblesBtn?.addEventListener('click', () => {
      this.clearAllBubbles();
    });

    // Crear burbujas al hacer clic en el contenedor
    this.container?.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.createBubbleAt(e.clientX, e.clientY);
      }
    });

    // Soporte para dispositivos táctiles
    this.container?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.container.getBoundingClientRect();
      this.createBubbleAt(
        touch.clientX - rect.left, 
        touch.clientY - rect.top
      );
    });
  }

  createInitialBubbles() {
    // Crear burbujas iniciales
    this.createBubbles(8);
  }

  createBubbles(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createBubble();
      }, i * 100);
    }
  }

  createBubble() {
    if (!this.container) return;

    const bubble = document.createElement('div');
    bubble.className = 'bubble floating';
    
    // Propiedades aleatorias
    const size = 30 + Math.random() * 80;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const x = Math.random() * (this.container.clientWidth - size);
    const y = Math.random() * (this.container.clientHeight - size);
    
    // Estilos
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.backgroundColor = color;
    bubble.style.animationDelay = `${Math.random() * 8}s`;
    
    // Propiedades físicas para movimiento
    bubble.bubbleData = {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: size,
      color: color,
      isDragging: false,
      life: 1.0
    };

    // Event listeners
    this.addBubbleEventListeners(bubble);
    
    // Agregar al DOM y array
    this.container.appendChild(bubble);
    this.bubbles.push(bubble);
    
    // Animación de aparición
    requestAnimationFrame(() => {
      bubble.style.transform = 'scale(0)';
      bubble.style.opacity = '0';
      requestAnimationFrame(() => {
        bubble.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s ease';
        bubble.style.transform = 'scale(1)';
        bubble.style.opacity = '1';
      });
    });
  }

  createBubbleAt(x, y) {
    if (!this.container) return;

    const rect = this.container.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    const bubble = document.createElement('div');
    bubble.className = 'bubble floating';
    
    const size = 40 + Math.random() * 60;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.max(0, Math.min(localX - size/2, this.container.clientWidth - size))}px`;
    bubble.style.top = `${Math.max(0, Math.min(localY - size/2, this.container.clientHeight - size))}px`;
    bubble.style.backgroundColor = color;
    
    bubble.bubbleData = {
      x: localX - size/2,
      y: localY - size/2,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      size: size,
      color: color,
      isDragging: false,
      life: 1.0
    };

    this.addBubbleEventListeners(bubble);
    this.container.appendChild(bubble);
    this.bubbles.push(bubble);

    // Animación de aparición con efecto
    bubble.style.transform = 'scale(0)';
    bubble.style.opacity = '0';
    requestAnimationFrame(() => {
      bubble.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.6s ease';
      bubble.style.transform = 'scale(1)';
      bubble.style.opacity = '1';
    });

    // Sonido de creación
    window.audioManager?.playSound('bubblePop', { pitch: 0.8, volume: 0.3 });
  }

  addBubbleEventListeners(bubble) {
    let isDragging = false;
    let startX, startY, offsetX, offsetY;

    // Mouse events
    bubble.addEventListener('mousedown', (e) => {
      isDragging = true;
      bubble.bubbleData.isDragging = true;
      const rect = bubble.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      bubble.style.cursor = 'grabbing';
      bubble.style.zIndex = '1000';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging && bubble.bubbleData) {
        const containerRect = this.container.getBoundingClientRect();
        const newX = e.clientX - containerRect.left - offsetX;
        const newY = e.clientY - containerRect.top - offsetY;
        
        bubble.bubbleData.x = Math.max(0, Math.min(newX, this.container.clientWidth - bubble.bubbleData.size));
        bubble.bubbleData.y = Math.max(0, Math.min(newY, this.container.clientHeight - bubble.bubbleData.size));
        
        bubble.style.left = `${bubble.bubbleData.x}px`;
        bubble.style.top = `${bubble.bubbleData.y}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (bubble.bubbleData) {
          bubble.bubbleData.isDragging = false;
          bubble.bubbleData.vx = (Math.random() - 0.5) * 2;
          bubble.bubbleData.vy = (Math.random() - 0.5) * 2;
        }
        bubble.style.cursor = 'pointer';
        bubble.style.zIndex = 'auto';
      }
    });

    // Touch events
    bubble.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDragging = true;
      bubble.bubbleData.isDragging = true;
      const touch = e.touches[0];
      const rect = bubble.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      bubble.style.zIndex = '1000';
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && bubble.bubbleData) {
        e.preventDefault();
        const touch = e.touches[0];
        const containerRect = this.container.getBoundingClientRect();
        const newX = touch.clientX - containerRect.left - offsetX;
        const newY = touch.clientY - containerRect.top - offsetY;
        
        bubble.bubbleData.x = Math.max(0, Math.min(newX, this.container.clientWidth - bubble.bubbleData.size));
        bubble.bubbleData.y = Math.max(0, Math.min(newY, this.container.clientHeight - bubble.bubbleData.size));
        
        bubble.style.left = `${bubble.bubbleData.x}px`;
        bubble.style.top = `${bubble.bubbleData.y}px`;
      }
    });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        if (bubble.bubbleData) {
          bubble.bubbleData.isDragging = false;
          bubble.bubbleData.vx = (Math.random() - 0.5) * 2;
          bubble.bubbleData.vy = (Math.random() - 0.5) * 2;
        }
        bubble.style.zIndex = 'auto';
      }
    });

    // Click to pop
    bubble.addEventListener('click', (e) => {
      if (!isDragging) {
        e.stopPropagation();
        this.popBubble(bubble);
      }
    });
  }

  popBubble(bubble) {
    if (!bubble.bubbleData || bubble.classList.contains('popping')) return;

    // Agregar clase de animación
    bubble.classList.add('popping');
    
    // Sonido de pop
    window.audioManager?.playSound('bubblePop', { 
      pitch: 0.8 + Math.random() * 0.4, 
      volume: 0.4 
    });

    // Eliminar después de la animación
    setTimeout(() => {
      this.removeBubble(bubble);
    }, 600);

    // Crear pequeñas burbujas de efecto
    this.createPopEffect(bubble.bubbleData.x, bubble.bubbleData.y);
  }

  createPopEffect(x, y) {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const miniSize = 10 + Math.random() * 15;
        const miniX = x + (Math.random() - 0.5) * 50;
        const miniY = y + (Math.random() - 0.5) * 50;
        
        if (miniX >= 0 && miniX <= this.container.clientWidth - miniSize &&
            miniY >= 0 && miniY <= this.container.clientHeight - miniSize) {
          
          const miniBubble = document.createElement('div');
          miniBubble.className = 'bubble';
          miniBubble.style.width = `${miniSize}px`;
          miniBubble.style.height = `${miniSize}px`;
          miniBubble.style.left = `${miniX}px`;
          miniBubble.style.top = `${miniY}px`;
          miniBubble.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
          miniBubble.style.opacity = '0.8';
          
          this.container.appendChild(miniBubble);
          
          // Animar hacia arriba y desvanecer
          setTimeout(() => {
            miniBubble.style.transition = 'transform 1s ease-out, opacity 1s ease-out';
            miniBubble.style.transform = 'translateY(-100px) scale(0)';
            miniBubble.style.opacity = '0';
            
            setTimeout(() => {
              if (miniBubble.parentNode) {
                miniBubble.parentNode.removeChild(miniBubble);
              }
            }, 1000);
          }, 50);
        }
      }, i * 100);
    }
  }

  removeBubble(bubble) {
    const index = this.bubbles.indexOf(bubble);
    if (index > -1) {
      this.bubbles.splice(index, 1);
    }
    if (bubble.parentNode) {
      bubble.parentNode.removeChild(bubble);
    }
  }

  clearAllBubbles() {
    this.bubbles.forEach(bubble => {
      if (bubble.parentNode) {
        bubble.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        bubble.style.transform = 'scale(0)';
        bubble.style.opacity = '0';
        
        setTimeout(() => {
          if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
          }
        }, 500);
      }
    });
    this.bubbles = [];
  }

  startAnimation() {
    if (!this.isActive) return;
    
    this.bubbles.forEach(bubble => {
      if (!bubble.bubbleData || bubble.bubbleData.isDragging) return;

      // Física simple: movimiento y rebotes
      bubble.bubbleData.x += bubble.bubbleData.vx;
      bubble.bubbleData.y += bubble.bubbleData.vy;

      // Rebotes en los bordes
      if (bubble.bubbleData.x <= 0 || bubble.bubbleData.x >= this.container.clientWidth - bubble.bubbleData.size) {
        bubble.bubbleData.vx *= -0.8;
        bubble.bubbleData.x = Math.max(0, Math.min(bubble.bubbleData.x, this.container.clientWidth - bubble.bubbleData.size));
      }
      
      if (bubble.bubbleData.y <= 0 || bubble.bubbleData.y >= this.container.clientHeight - bubble.bubbleData.size) {
        bubble.bubbleData.vy *= -0.8;
        bubble.bubbleData.y = Math.max(0, Math.min(bubble.bubbleData.y, this.container.clientHeight - bubble.bubbleData.size));
      }

      // Aplicar fricción
      bubble.bubbleData.vx *= 0.995;
      bubble.bubbleData.vy *= 0.995;

      // Actualizar posición en el DOM
      bubble.style.left = `${bubble.bubbleData.x}px`;
      bubble.style.top = `${bubble.bubbleData.y}px`;
    });

    this.animationFrame = requestAnimationFrame(() => this.startAnimation());
  }

  activate() {
    this.isActive = true;
    this.startAnimation();
  }

  deactivate() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  destroy() {
    this.deactivate();
    this.clearAllBubbles();
  }
}

// Exportar para uso global
window.BubblesModule = BubblesModule;
