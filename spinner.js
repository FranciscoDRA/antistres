// ===============================
// Módulo Spinner Interactivo 3D
// ===============================

class SpinnerModule {
  constructor() {
    this.container = document.getElementById('spinner-module');
    this.spinner = document.getElementById('spinner3d');
    this.spinButton = document.getElementById('spinButton');
    this.randomSpinButton = document.getElementById('randomSpin');
    
    this.isActive = false;
    this.isSpinning = false;
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    this.currentRotationZ = 0;
    this.spinAnimationFrame = null;
    
    this.colors = [
      '#81c784', '#64b5f6', '#f48fb1', 
      '#ffb74d', '#a5d6a7', '#90caf9',
      '#ce93d8', '#80cbc4', '#ffcc02'
    ];
    
    this.init();
  }

  init() {
    this.addEventListeners();
    this.setupSpinnerFaces();
    this.startIdleAnimation();
  }

  addEventListeners() {
    // Botón de giro normal
    this.spinButton?.addEventListener('click', () => {
      this.spin();
    });

    // Botón de giro aleatorio
    this.randomSpinButton?.addEventListener('click', () => {
      this.randomSpin();
    });

    // Click directo en el spinner
    this.spinner?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.spin();
    });

    // Arrastrar para girar manualmente
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    this.spinner?.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      this.spinner.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging && !this.isSpinning) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        this.currentRotationY += deltaX * 0.5;
        this.currentRotationX -= deltaY * 0.5;
        
        this.updateSpinnerRotation();
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.spinner.style.cursor = 'pointer';
        
        // Sonido suave al terminar de arrastrar
        window.audioManager?.playSound('spinnerClick', { volume: 0.2 });
      }
    });

    // Soporte táctil
    let lastTouchX = 0;
    let lastTouchY = 0;

    this.spinner?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDragging = true;
      const touch = e.touches[0];
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && !this.isSpinning && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchX;
        const deltaY = touch.clientY - lastTouchY;
        
        this.currentRotationY += deltaX * 0.5;
        this.currentRotationX -= deltaY * 0.5;
        
        this.updateSpinnerRotation();
        
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
      }
    });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        window.audioManager?.playSound('spinnerClick', { volume: 0.2 });
      }
    });

    // Hover effects
    this.spinner?.addEventListener('mouseenter', () => {
      if (!this.isSpinning) {
        this.spinner.style.transform += ' scale(1.05)';
      }
    });

    this.spinner?.addEventListener('mouseleave', () => {
      if (!this.isSpinning) {
        this.spinner.style.transform = this.spinner.style.transform.replace(' scale(1.05)', '');
      }
    });
  }

  setupSpinnerFaces() {
    if (!this.spinner) return;

    const faces = this.spinner.querySelectorAll('.spinner-face');
    faces.forEach((face, index) => {
      // Asignar colores aleatorios a cada cara
      const color = this.colors[index % this.colors.length];
      face.style.backgroundColor = color;
      
      // Agregar patrón de textura sutil
      face.style.backgroundImage = `
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 2px, transparent 2px),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 1px, transparent 1px)
      `;
      face.style.backgroundSize = '20px 20px, 15px 15px';
      
      // Agregar efecto de brillo
      face.style.boxShadow = `
        inset 0 0 20px rgba(255,255,255,0.1),
        0 0 20px rgba(0,0,0,0.1)
      `;
    });
  }

  spin() {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    this.stopIdleAnimation();
    
    // Sonido de inicio de giro
    window.audioManager?.playSound('spinnerClick', { volume: 0.4 });
    
    // Animación de giro
    const rotations = 2 + Math.random() * 3; // 2-5 rotaciones
    const duration = 1500 + Math.random() * 1000; // 1.5-2.5 segundos
    
    this.animateSpin(rotations * 360, duration);
    
    // Cambiar colores durante el giro
    this.animateColorChange(duration);
    
    setTimeout(() => {
      this.isSpinning = false;
      this.startIdleAnimation();
      
      // Sonido final
      window.audioManager?.playSound('spinnerClick', { 
        volume: 0.3, 
        pitch: 0.8 
      });
    }, duration);
  }

  randomSpin() {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    this.stopIdleAnimation();
    
    // Sonido más intenso para giro aleatorio
    window.audioManager?.playSound('spinnerClick', { volume: 0.5, pitch: 1.2 });
    
    // Giro en múltiples ejes con velocidades aleatorias
    const rotationX = (Math.random() - 0.5) * 720;
    const rotationY = (Math.random() - 0.5) * 720;
    const rotationZ = (Math.random() - 0.5) * 360;
    const duration = 2000 + Math.random() * 2000; // 2-4 segundos
    
    this.animateRandomSpin(rotationX, rotationY, rotationZ, duration);
    this.animateColorChange(duration);
    this.animateScalePulse(duration);
    
    setTimeout(() => {
      this.isSpinning = false;
      this.startIdleAnimation();
      window.audioManager?.playSound('spinnerClick', { 
        volume: 0.3, 
        pitch: 0.7 
      });
    }, duration);
  }

  animateSpin(rotation, duration) {
    const startTime = Date.now();
    const startRotationY = this.currentRotationY;
    const targetRotationY = startRotationY + rotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.currentRotationY = startRotationY + (targetRotationY - startRotationY) * easeOut;
      this.updateSpinnerRotation();
      
      if (progress < 1) {
        this.spinAnimationFrame = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  animateRandomSpin(rotX, rotY, rotZ, duration) {
    const startTime = Date.now();
    const startRotationX = this.currentRotationX;
    const startRotationY = this.currentRotationY;
    const startRotationZ = this.currentRotationZ;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing con rebote
      const easeOutBounce = progress < 0.5 
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      this.currentRotationX = startRotationX + rotX * easeOutBounce;
      this.currentRotationY = startRotationY + rotY * easeOutBounce;
      this.currentRotationZ = startRotationZ + rotZ * easeOutBounce;
      
      this.updateSpinnerRotation();
      
      if (progress < 1) {
        this.spinAnimationFrame = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  animateColorChange(duration) {
    if (!this.spinner) return;
    
    const faces = this.spinner.querySelectorAll('.spinner-face');
    const colorChangeInterval = setInterval(() => {
      faces.forEach(face => {
        const newColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        face.style.backgroundColor = newColor;
      });
    }, 200);
    
    setTimeout(() => {
      clearInterval(colorChangeInterval);
    }, duration);
  }

  animateScalePulse(duration) {
    if (!this.spinner) return;
    
    const startTime = Date.now();
    
    const pulse = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
        this.spinner.style.transform = this.spinner.style.transform.replace(/scale\([^)]*\)/, '') + ` scale(${scale})`;
        requestAnimationFrame(pulse);
      } else {
        this.spinner.style.transform = this.spinner.style.transform.replace(/scale\([^)]*\)/, '');
      }
    };
    
    pulse();
  }

  updateSpinnerRotation() {
    if (!this.spinner) return;
    
    this.spinner.style.transform = `
      rotateX(${this.currentRotationX}deg) 
      rotateY(${this.currentRotationY}deg) 
      rotateZ(${this.currentRotationZ}deg)
    `;
  }

  startIdleAnimation() {
    if (this.isSpinning) return;
    
    let startTime = Date.now();
    const baseRotationY = this.currentRotationY;
    
    const animate = () => {
      if (this.isSpinning) return;
      
      const elapsed = (Date.now() - startTime) / 1000;
      this.currentRotationY = baseRotationY + Math.sin(elapsed * 0.5) * 5;
      this.currentRotationX = Math.sin(elapsed * 0.3) * 3;
      
      this.updateSpinnerRotation();
      
      if (this.isActive) {
        this.spinAnimationFrame = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  stopIdleAnimation() {
    if (this.spinAnimationFrame) {
      cancelAnimationFrame(this.spinAnimationFrame);
      this.spinAnimationFrame = null;
    }
  }

  activate() {
    this.isActive = true;
    if (!this.isSpinning) {
      this.startIdleAnimation();
    }
  }

  deactivate() {
    this.isActive = false;
    this.stopIdleAnimation();
  }

  destroy() {
    this.deactivate();
    this.isSpinning = false;
  }

  // Método para cambiar los colores del spinner
  setColors(newColors) {
    if (Array.isArray(newColors) && newColors.length > 0) {
      this.colors = newColors;
      this.setupSpinnerFaces();
    }
  }

  // Método para obtener el estado actual
  getState() {
    return {
      isSpinning: this.isSpinning,
      rotation: {
        x: this.currentRotationX,
        y: this.currentRotationY,
        z: this.currentRotationZ
      },
      colors: this.colors
    };
  }

  // Método para resetear la rotación
  resetRotation() {
    if (this.isSpinning) return false;
    
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    this.currentRotationZ = 0;
    this.updateSpinnerRotation();
    
    window.audioManager?.playSound('spinnerClick', { volume: 0.2, pitch: 1.5 });
    return true;
  }
}

// Exportar para uso global
window.SpinnerModule = SpinnerModule;
