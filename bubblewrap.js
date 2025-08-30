// ===============================
// Módulo Bubble Wrap Digital - Revisado
// ===============================

class BubbleWrapModule {
  constructor() {
    this.bubbles = [];
    this.isActive = false;
    this.totalBubbles = 0;
    this.poppedBubbles = 0;
    this.gridConfig = {
      rows: 15,
      cols: 20,
      mobile: {
        rows: 12,
        cols: 10
      }
    };
  }

  init(audioManager) {
    this.audioManager = audioManager || window.audioManager || null;
    this.container = document.getElementById('bubblewrap-module');

    // Crear estructura interna si no existe
    if (!this.container) {
      console.error('BubbleWrapModule: Contenedor #bubblewrap-module no encontrado');
      return false;
    }

    // Crear elementos internos si no existen
    if (!this.container.querySelector('.bubblewrap-controls')) {
      this.container.innerHTML = `
        <div class="bubblewrap-controls">
          <button id="resetBubbleWrap">Reiniciar</button>
          <button id="popAllBubbles">Explotar Todas</button>
          <span>Burbujas restantes: <span id="bubblesLeft"></span></span>
        </div>
        <div id="bubblewrapGrid" class="bubblewrap-grid"></div>
      `;
    }

    this.grid = this.container.querySelector('#bubblewrapGrid');
    this.resetBtn = this.container.querySelector('#resetBubbleWrap');
    this.popAllBtn = this.container.querySelector('#popAllBubbles');
    this.bubblesLeftCounter = this.container.querySelector('#bubblesLeft');

    if (!this.grid) {
      console.error('BubbleWrapModule: No se pudo crear el grid');
      return false;
    }

    this.addEventListeners();
    this.createBubbleWrapGrid();
    this.updateCounter();
    return true;
  }

  activate() {
    this.isActive = true;
    if (!this.container || !this.grid) this.init(this.audioManager);
  }

  deactivate() {
    this.isActive = false;
  }

  destroy() {
    if (this.grid) this.grid.innerHTML = '';
    this.bubbles = [];
    this.isActive = false;
  }

  addEventListeners() {
    this.resetBtn?.addEventListener('click', () => this.resetAllBubbles());
    this.popAllBtn?.addEventListener('click', () => this.popAllBubbles());

    window.addEventListener('resize', this.debounce(() => this.handleResize(), 250));

    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      if ((e.key === 'r' || e.key === 'R') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.resetAllBubbles();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.popRandomBubble();
      } else if (e.key === 'Escape') {
        this.popAllBubbles();
      }
    });
  }

  createBubbleWrapGrid() {
    this.grid.innerHTML = '';
    this.bubbles = [];
    this.poppedBubbles = 0;

    const isMobile = window.innerWidth <= 768;
    const config = isMobile ? this.gridConfig.mobile : this.gridConfig;
    this.totalBubbles = config.rows * config.cols;
    this.grid.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

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

    const bubbleData = {
      index,
      isPopped: false,
      element: item,
      bubble
    };

    item.addEventListener('click', () => this.popBubble(bubbleData));
    item.addEventListener('touchstart', () => this.popBubble(bubbleData));

    if (!('ontouchstart' in window)) {
      item.addEventListener('mouseenter', () => !bubbleData.isPopped && (bubble.style.transform = 'scale(1.05)'));
      item.addEventListener('mouseleave', () => !bubbleData.isPopped && (bubble.style.transform = 'scale(1)'));
    }

    item.addEventListener('selectstart', (e) => e.preventDefault());

    this.grid.appendChild(item);
    this.bubbles.push(bubbleData);
  }

  popBubble(bubbleData) {
    if (bubbleData.isPopped) return;
    bubbleData.isPopped = true;
    this.poppedBubbles++;
    bubbleData.element.classList.add('popping');

    this.audioManager?.playSound?.('bubbleWrapPop');

    setTimeout(() => {
      bubbleData.element.classList.remove('popping');
      bubbleData.element.classList.add('popped');
      this.updateCounter();
    }, 400);
  }

  popAllBubbles() {
    this.bubbles.forEach(b => !b.isPopped && this.popBubble(b));
  }

  resetAllBubbles() {
    this.bubbles.forEach((b, i) => {
      b.isPopped = false;
      b.element.classList.remove('popped');
      b.element.classList.add('resetting');
      setTimeout(() => b.element.classList.remove('resetting'), (i * 10) + 600);
    });
    this.poppedBubbles = 0;
    this.updateCounter();
  }

  popRandomBubble() {
    const available = this.bubbles.filter(b => !b.isPopped);
    if (available.length) {
      const random = available[Math.floor(Math.random() * available.length)];
      this.popBubble(random);
    }
  }

  updateCounter() {
    this.bubblesLeftCounter.textContent = this.totalBubbles - this.poppedBubbles;
  }

  handleResize() {
    this.createBubbleWrapGrid();
  }

  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Exportar
window.BubbleWrapModule = BubbleWrapModule;

// ...dentro de popBubble()
popBubble(bubble) {
    if (bubble.dataset.popped === 'true') return;
    
    bubble.dataset.popped = 'true';
    bubble.style.background = 'rgba(200,200,200,0.3)';
    bubble.style.transform = 'scale(0.9)';
    bubble.style.cursor = 'default';
    bubble.style.boxShadow = 'inset 0 0 5px rgba(0,0,0,0.3)';
    
    this.poppedCount++;
    this.updateCounter();
    
    // Sonido: usa playSound del AudioManager compatible
    if (this.audioManager && typeof this.audioManager.playSound === 'function') {
        this.audioManager.playSound('bubbleWrapPop', { volume: 0.4, pitch: 1 });
    }
    
    // Efecto visual
    this.createPopEffect(bubble);
    
    // Verificar si todas están explotadas
    if (this.poppedCount >= this.totalBubbles) {
        setTimeout(() => {
            alert('¡Todas las burbujas explotadas! 🎉');
            this.resetBubbleWrap();
        }, 500);
    }
}
