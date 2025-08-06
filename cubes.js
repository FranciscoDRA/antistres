// ===============================
// Módulo de Cubos que Caen
// ===============================

class CubesModule {
  constructor() {
    this.container = document.getElementById('cubesContainer');
    this.spawnArea = document.getElementById('cubeSpawnArea');
    this.playground = document.getElementById('cubesPlayground');
    
    this.cubes = [];
    this.isActive = false;
    this.animationFrame = null;
    this.gravity = 0.3;
    this.bounce = 0.7;
    this.friction = 0.98;
    
    this.cubeColors = [
      '#81c784', '#64b5f6', '#f48fb1', 
      '#ffb74d', '#a5d6a7', '#90caf9',
      '#ce93d8', '#80cbc4', '#ffcc02'
    ];
    
    this.init();
  }

  init() {
    this.addEventListeners();
    this.startPhysics();
  }

  addEventListeners() {
    // Crear cubo al hacer clic en el área de spawn
    this.spawnArea?.addEventListener('click', (e) => {
      const rect = this.spawnArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.createCube(x, 50);
    });

    // Soporte táctil para el área de spawn
    this.spawnArea?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.spawnArea.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      this.createCube(x, 50);
    });

    // Crear múltiples cubos con doble clic
    this.spawnArea?.addEventListener('dblclick', (e) => {
      e.preventDefault();
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const x = Math.random() * this.spawnArea.clientWidth;
          this.createCube(x, 20 + Math.random() * 60);
        }, i * 100);
      }
    });

    // Limpiar cubos con clic derecho en el playground
    this.playground?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.clearAllCubes();
    });
  }

  createCube(x, y) {
    if (!this.playground) return;

    const cube = document.createElement('div');
    cube.className = 'cube';
    
    // Propiedades aleatorias
    const size = 30 + Math.random() * 30;
    const color = this.cubeColors[Math.floor(Math.random() * this.cubeColors.length)];
    
    // Asegurar que el cubo esté dentro de los límites
    const clampedX = Math.max(0, Math.min(x - size/2, this.playground.clientWidth - size));
    
    // Estilos
    cube.style.width = `${size}px`;
    cube.style.height = `${size}px`;
    cube.style.backgroundColor = color;
    cube.style.left = `${clampedX}px`;
    cube.style.top = `${y}px`;
    
    // Propiedades físicas
    cube.cubeData = {
      x: clampedX,
      y: y,
      vx: (Math.random() - 0.5) * 4, // Velocidad X inicial
      vy: Math.random() * 2 + 1,     // Velocidad Y inicial (hacia abajo)
      size: size,
      color: color,
      isDragging: false,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 10,
      isOnGround: false,
      life: 1.0
    };

    // Event listeners para interacción
    this.addCubeEventListeners(cube);
    
    // Agregar al DOM y array
    this.playground.appendChild(cube);
    this.cubes.push(cube);
    
    // Efecto de aparición
    cube.style.transform = 'scale(0) rotate(0deg)';
    cube.style.opacity = '0';
    requestAnimationFrame(() => {
      cube.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.3s ease';
      cube.style.transform = 'scale(1) rotate(0deg)';
      cube.style.opacity = '1';
      
      // Quitar transición después de la animación inicial
      setTimeout(() => {
        cube.style.transition = '';
      }, 300);
    });

    // Sonido de creación
    window.audioManager?.playSound('cubeFall', { volume: 0.2 });
  }

  addCubeEventListeners(cube) {
    let isDragging = false;
    let startX, startY, offsetX, offsetY;

    // Mouse events
    cube.addEventListener('mousedown', (e) => {
      isDragging = true;
      cube.cubeData.isDragging = true;
      cube.cubeData.vx = 0;
      cube.cubeData.vy = 0;
      
      const rect = cube.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      cube.style.cursor = 'grabbing';
      cube.style.zIndex = '1000';
      cube.style.transform += ' scale(1.1)';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging && cube.cubeData) {
        const playgroundRect = this.playground.getBoundingClientRect();
        const newX = e.clientX - playgroundRect.left - offsetX;
        const newY = e.clientY - playgroundRect.top - offsetY;
        
        cube.cubeData.x = Math.max(0, Math.min(newX, this.playground.clientWidth - cube.cubeData.size));
        cube.cubeData.y = Math.max(0, Math.min(newY, this.playground.clientHeight - cube.cubeData.size));
        
        this.updateCubePosition(cube);
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (cube.cubeData) {
          cube.cubeData.isDragging = false;
          // Dar impulso inicial al soltar
          cube.cubeData.vx = (Math.random() - 0.5) * 6;
          cube.cubeData.vy = Math.random() * 3;
          cube.cubeData.rotationSpeed = (Math.random() - 0.5) * 15;
        }
        cube.style.cursor = 'grab';
        cube.style.zIndex = 'auto';
        cube.style.transform = cube.style.transform.replace(' scale(1.1)', '');
      }
    });

    // Touch events
    cube.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDragging = true;
      cube.cubeData.isDragging = true;
      cube.cubeData.vx = 0;
      cube.cubeData.vy = 0;
      
      const touch = e.touches[0];
      const rect = cube.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      
      cube.style.zIndex = '1000';
      cube.style.transform += ' scale(1.1)';
    });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && cube.cubeData) {
        e.preventDefault();
        const touch = e.touches[0];
        const playgroundRect = this.playground.getBoundingClientRect();
        const newX = touch.clientX - playgroundRect.left - offsetX;
        const newY = touch.clientY - playgroundRect.top - offsetY;
        
        cube.cubeData.x = Math.max(0, Math.min(newX, this.playground.clientWidth - cube.cubeData.size));
        cube.cubeData.y = Math.max(0, Math.min(newY, this.playground.clientHeight - cube.cubeData.size));
        
        this.updateCubePosition(cube);
      }
    });

    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        if (cube.cubeData) {
          cube.cubeData.isDragging = false;
          cube.cubeData.vx = (Math.random() - 0.5) * 6;
          cube.cubeData.vy = Math.random() * 3;
          cube.cubeData.rotationSpeed = (Math.random() - 0.5) * 15;
        }
        cube.style.zIndex = 'auto';
        cube.style.transform = cube.style.transform.replace(' scale(1.1)', '');
      }
    });

    // Doble clic para eliminar cubo
    cube.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.removeCube(cube);
    });
  }

  updateCubePosition(cube) {
    if (!cube.cubeData) return;
    
    cube.style.left = `${cube.cubeData.x}px`;
    cube.style.top = `${cube.cubeData.y}px`;
    cube.style.transform = `rotate(${cube.cubeData.rotation}deg)`;
  }

  startPhysics() {
    if (!this.isActive) return;

    this.cubes.forEach(cube => {
      if (!cube.cubeData || cube.cubeData.isDragging) return;

      const data = cube.cubeData;
      
      // Aplicar gravedad
      data.vy += this.gravity;
      
      // Actualizar posición
      data.x += data.vx;
      data.y += data.vy;
      
      // Actualizar rotación
      data.rotation += data.rotationSpeed;
      
      // Colisiones con los bordes
      const playgroundWidth = this.playground.clientWidth;
      const playgroundHeight = this.playground.clientHeight;
      
      // Borde izquierdo y derecho
      if (data.x <= 0) {
        data.x = 0;
        data.vx *= -this.bounce;
        data.rotationSpeed *= -this.bounce;
        this.playBounceSound();
      } else if (data.x >= playgroundWidth - data.size) {
        data.x = playgroundWidth - data.size;
        data.vx *= -this.bounce;
        data.rotationSpeed *= -this.bounce;
        this.playBounceSound();
      }
      
      // Borde inferior (suelo)
      if (data.y >= playgroundHeight - data.size) {
        data.y = playgroundHeight - data.size;
        data.vy *= -this.bounce;
        data.rotationSpeed *= this.friction;
        data.isOnGround = true;
        
        // Sonido de rebote más fuerte en el suelo
        this.playBounceSound(true);
        
        // Si la velocidad es muy baja, detener el cubo
        if (Math.abs(data.vy) < 0.5) {
          data.vy = 0;
          data.rotationSpeed *= 0.9;
        }
      } else {
        data.isOnGround = false;
      }
      
      // Aplicar fricción cuando está en el suelo
      if (data.isOnGround) {
        data.vx *= this.friction;
        data.rotationSpeed *= 0.98;
      }
      
      // Aplicar resistencia del aire
      data.vx *= 0.999;
      data.vy *= 0.999;
      
      // Actualizar posición en el DOM
      this.updateCubePosition(cube);
    });

    // Colisiones entre cubos (simplificada)
    this.handleCubeCollisions();

    this.animationFrame = requestAnimationFrame(() => this.startPhysics());
  }

  handleCubeCollisions() {
    for (let i = 0; i < this.cubes.length; i++) {
      for (let j = i + 1; j < this.cubes.length; j++) {
        const cube1 = this.cubes[i];
        const cube2 = this.cubes[j];
        
        if (!cube1.cubeData || !cube2.cubeData || 
            cube1.cubeData.isDragging || cube2.cubeData.isDragging) continue;
        
        const dx = cube1.cubeData.x - cube2.cubeData.x;
        const dy = cube1.cubeData.y - cube2.cubeData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (cube1.cubeData.size + cube2.cubeData.size) / 2;
        
        if (distance < minDistance) {
          // Colisión detectada - separar cubos
          const overlap = minDistance - distance;
          const separationX = (dx / distance) * overlap * 0.5;
          const separationY = (dy / distance) * overlap * 0.5;
          
          cube1.cubeData.x += separationX;
          cube1.cubeData.y += separationY;
          cube2.cubeData.x -= separationX;
          cube2.cubeData.y -= separationY;
          
          // Intercambiar velocidades (simplificado)
          const tempVx = cube1.cubeData.vx;
          const tempVy = cube1.cubeData.vy;
          cube1.cubeData.vx = cube2.cubeData.vx * this.bounce;
          cube1.cubeData.vy = cube2.cubeData.vy * this.bounce;
          cube2.cubeData.vx = tempVx * this.bounce;
          cube2.cubeData.vy = tempVy * this.bounce;
          
          // Sonido de colisión
          this.playBounceSound();
        }
      }
    }
  }

  playBounceSound(isGround = false) {
    if (Math.random() > 0.7) { // No reproducir sonido en cada rebote
      const volume = isGround ? 0.3 : 0.2;
      const pitch = isGround ? 0.8 : 1.0 + Math.random() * 0.4;
      window.audioManager?.playSound('cubeFall', { volume, pitch });
    }
  }

  removeCube(cube) {
    // Animación de desaparición
    cube.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
    cube.style.transform += ' scale(0) rotate(720deg)';
    cube.style.opacity = '0';
    
    // Eliminar del array y DOM
    const index = this.cubes.indexOf(cube);
    if (index > -1) {
      this.cubes.splice(index, 1);
    }
    
    setTimeout(() => {
      if (cube.parentNode) {
        cube.parentNode.removeChild(cube);
      }
    }, 500);
    
    // Sonido de desaparición
    window.audioManager?.playSound('bubblePop', { pitch: 1.2, volume: 0.3 });
  }

  clearAllCubes() {
    this.cubes.forEach((cube, index) => {
      setTimeout(() => {
        this.removeCube(cube);
      }, index * 50);
    });
  }

  activate() {
    this.isActive = true;
    this.startPhysics();
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
    this.clearAllCubes();
  }

  // Método para ajustar la física
  setPhysicsSettings(gravity, bounce, friction) {
    this.gravity = gravity || 0.3;
    this.bounce = bounce || 0.7;
    this.friction = friction || 0.98;
  }

  // Método para obtener estadísticas
  getStats() {
    return {
      totalCubes: this.cubes.length,
      activeCubes: this.cubes.filter(cube => 
        cube.cubeData && !cube.cubeData.isDragging
      ).length,
      physics: {
        gravity: this.gravity,
        bounce: this.bounce,
        friction: this.friction
      }
    };
  }
}

// Exportar para uso global
window.CubesModule = CubesModule;
