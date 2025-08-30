// ===============================
// Módulo Bubble Wrap Digital - Versión Simplificada
// ===============================

class BubbleWrapModule {
    constructor() {
        this.isActive = false;
        this.bubbles = [];
        this.poppedCount = 0;
        this.totalBubbles = 100;
        this.audioManager = null;
        
        // Elementos DOM - se inicializan en init()
        this.container = null;
        this.grid = null;
        this.resetBtn = null;
        this.popAllBtn = null;
        this.counter = null;
        
        console.log('BubbleWrapModule creado');
    }

    init(audioManager) {
        try {
            console.log('Inicializando BubbleWrapModule...');
            this.audioManager = audioManager;
            
            // Obtener elementos DOM
            this.container = document.getElementById('bubblewrapContainer');
            this.grid = document.getElementById('bubblewrapGrid');
            this.resetBtn = document.getElementById('resetBubbleWrap');
            this.popAllBtn = document.getElementById('popAllBubbles');
            this.counter = document.getElementById('bubblesLeft');
            
            if (!this.container || !this.grid) {
                console.error('Elementos DOM del bubble wrap no encontrados');
                return false;
            }
            
            this.setupEventListeners();
            this.createBubbleWrapGrid();
            
            console.log('BubbleWrapModule inicializado correctamente');
            return true;
        } catch (error) {
            console.error('Error inicializando BubbleWrapModule:', error);
            return false;
        }
    }

    setupEventListeners() {
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetBubbleWrap());
        }
        
        if (this.popAllBtn) {
            this.popAllBtn.addEventListener('click', () => this.popAllBubbles());
        }
    }

    createBubbleWrapGrid() {
        if (!this.grid) return;
        
        // Limpiar grid
        this.grid.innerHTML = '';
        this.bubbles = [];
        this.poppedCount = 0;
        
        // Calcular columnas según el ancho
        const containerWidth = this.container.clientWidth;
        const bubbleSize = 30;
        const gap = 3;
        const cols = Math.floor((containerWidth - 40) / (bubbleSize + gap));
        const rows = Math.ceil(this.totalBubbles / cols);
        
        this.grid.style.gridTemplateColumns = `repeat(${cols}, ${bubbleSize}px)`;
        this.grid.style.gap = `${gap}px`;
        this.grid.style.justifyContent = 'center';
        
        // Crear burbujas
        for (let i = 0; i < this.totalBubbles; i++) {
            this.createBubble(i);
        }
        
        this.updateCounter();
    }

    createBubble(index) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-wrap-item';
        bubble.dataset.index = index;
        bubble.dataset.popped = 'false';
        
        // Estilos
        bubble.style.cssText = `
            width: 30px;
            height: 30px;
            background: radial-gradient(circle at 30% 30%, 
                rgba(255,255,255,0.9) 0%,
                rgba(200,220,255,0.4) 40%,
                rgba(100,150,255,0.2) 100%);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            box-shadow: inset 0 0 10px rgba(255,255,255,0.3), 0 2px 5px rgba(0,0,0,0.1);
        `;
        
        // Eventos
        bubble.addEventListener('click', () => this.popBubble(bubble));
        bubble.addEventListener('mouseenter', () => this.hoverBubble(bubble, true));
        bubble.addEventListener('mouseleave', () => this.hoverBubble(bubble, false));
        
        this.grid.appendChild(bubble);
        this.bubbles.push(bubble);
    }

    popBubble(bubble) {
        if (bubble.dataset.popped === 'true') return;
        
        bubble.dataset.popped = 'true';
        bubble.style.background = 'rgba(200,200,200,0.3)';
        bubble.style.transform = 'scale(0.9)';
        bubble.style.cursor = 'default';
        bubble.style.boxShadow = 'inset 0 0 5px rgba(0,0,0,0.3)';
        
        this.poppedCount++;
        this.updateCounter();
        
        // Sonido
        if (this.audioManager) {
            this.audioManager.playBubbleWrapPop();
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

    hoverBubble(bubble, isHover) {
        if (bubble.dataset.popped === 'true') return;
        
        if (isHover) {
            bubble.style.transform = 'scale(1.1)';
            bubble.style.filter = 'brightness(1.1)';
        } else {
            bubble.style.transform = 'scale(1)';
            bubble.style.filter = 'brightness(1)';
        }
    }

    createPopEffect(bubble) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #fff, transparent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: popEffect 0.5s ease-out forwards;
            pointer-events: none;
            z-index: 10;
        `;
        
        // Agregar animación CSS si no existe
        if (!document.getElementById('popEffectStyle')) {
            const style = document.createElement('style');
            style.id = 'popEffectStyle';
            style.textContent = `
                @keyframes popEffect {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(2); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        bubble.appendChild(effect);
        setTimeout(() => effect.remove(), 500);
    }

    resetBubbleWrap() {
        console.log('Reiniciando bubble wrap...');
        this.createBubbleWrapGrid();
    }

    popAllBubbles() {
        console.log('Explotando todas las burbujas...');
        this.bubbles.forEach((bubble, index) => {
            if (bubble.dataset.popped === 'false') {
                setTimeout(() => {
                    this.popBubble(bubble);
                }, index * 20);
            }
        });
    }

    updateCounter() {
        const remaining = this.totalBubbles - this.poppedCount;
        if (this.counter) {
            this.counter.textContent = remaining;
        }
    }

    activate() {
        this.isActive = true;
        console.log('Bubble wrap activado');
    }

    deactivate() {
        this.isActive = false;
        console.log('Bubble wrap desactivado');
    }

    resize() {
        if (this.isActive && this.grid) {
            this.createBubbleWrapGrid();
        }
    }
}

// No crear instancia automáticamente, dejar que app.js la maneje
console.log('bubblewrap_simple.js cargado');

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
