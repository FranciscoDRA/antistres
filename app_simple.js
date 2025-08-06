// ===============================
// Aplicación Principal RelaxaLAB - Versión Simplificada
// ===============================

class RelaxaLAB {
    constructor() {
        this.modules = new Map();
        this.currentModule = 'bubbles';
        this.isInitialized = false;
        this.audioManager = null;
        
        console.log('RelaxaLAB constructor iniciado');
    }

    async init() {
        try {
            console.log('Iniciando RelaxaLAB...');
            
            // Inicializar audio
            this.audioManager = new AudioManager();
            await this.audioManager.init();
            
            // Inicializar módulos
            await this.initializeModules();
            
            // Configurar navegación
            this.setupNavigation();
            
            // Mostrar módulo inicial
            this.showModule('bubbles');
            
            this.isInitialized = true;
            console.log('RelaxaLAB inicializado correctamente');
            
        } catch (error) {
            console.error('Error inicializando RelaxaLAB:', error);
        }
    }

    async initializeModules() {
        console.log('Inicializando módulos...');
        
        try {
            // Inicializar cada módulo con manejo de errores individual
            const moduleInits = [
                { name: 'bubbles', class: BubblesModule },
                { name: 'breathing', class: BreathingModule },
                { name: 'cubes', class: CubesModule },
                { name: 'spinner', class: SpinnerModule },
                { name: 'bubblewrap', class: BubbleWrapModule }
            ];

            for (const moduleInfo of moduleInits) {
                try {
                    if (typeof moduleInfo.class !== 'undefined') {
                        console.log(`Inicializando módulo: ${moduleInfo.name}`);
                        const module = new moduleInfo.class();
                        
                        if (module.init) {
                            const initSuccess = await module.init(this.audioManager);
                            if (initSuccess !== false) {
                                this.modules.set(moduleInfo.name, module);
                                console.log(`✓ Módulo ${moduleInfo.name} inicializado`);
                            } else {
                                console.warn(`⚠ Módulo ${moduleInfo.name} falló en init`);
                            }
                        } else {
                            this.modules.set(moduleInfo.name, module);
                            console.log(`✓ Módulo ${moduleInfo.name} creado (sin init)`);
                        }
                    } else {
                        console.warn(`⚠ Clase ${moduleInfo.class} no encontrada para ${moduleInfo.name}`);
                    }
                } catch (moduleError) {
                    console.error(`Error inicializando módulo ${moduleInfo.name}:`, moduleError);
                }
            }
            
            console.log(`Módulos inicializados: ${this.modules.size}`);
            
        } catch (error) {
            console.error('Error general inicializando módulos:', error);
        }
    }

    setupNavigation() {
        console.log('Configurando navegación...');
        
        const navButtons = document.querySelectorAll('.nav-btn[data-module]');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const moduleName = button.dataset.module;
                this.showModule(moduleName);
            });
        });

        // Configurar botón de settings
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.toggleSettings();
            });
        }
    }

    showModule(moduleName) {
        console.log(`Mostrando módulo: ${moduleName}`);
        
        try {
            // Desactivar módulo actual
            if (this.currentModule && this.modules.has(this.currentModule)) {
                const currentModuleInstance = this.modules.get(this.currentModule);
                if (currentModuleInstance.deactivate) {
                    currentModuleInstance.deactivate();
                }
            }

            // Ocultar todos los módulos
            document.querySelectorAll('.module').forEach(module => {
                module.classList.remove('active');
            });

            // Desactivar todos los botones de navegación
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Mostrar módulo seleccionado
            const moduleElement = document.getElementById(`${moduleName}-module`);
            if (moduleElement) {
                moduleElement.classList.add('active');
            }

            // Activar botón de navegación
            const navButton = document.querySelector(`[data-module="${moduleName}"]`);
            if (navButton) {
                navButton.classList.add('active');
            }

            // Activar módulo
            if (this.modules.has(moduleName)) {
                const moduleInstance = this.modules.get(moduleName);
                if (moduleInstance.activate) {
                    moduleInstance.activate();
                }
            }

            this.currentModule = moduleName;
            
        } catch (error) {
            console.error(`Error mostrando módulo ${moduleName}:`, error);
        }
    }

    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('active');
        }
    }
}

// Función de inicialización global
async function initRelaxaLAB() {
    try {
        console.log('Iniciando aplicación RelaxaLAB...');
        
        // Verificar que todas las clases estén disponibles
        const requiredClasses = ['AudioManager'];
        for (const className of requiredClasses) {
            if (typeof window[className] === 'undefined') {
                console.error(`Clase requerida no encontrada: ${className}`);
                return;
            }
        }
        
        const app = new RelaxaLAB();
        await app.init();
        
        // Hacer la app accesible globalmente para debug
        window.relaxaLAB = app;
        
    } catch (error) {
        console.error('Error fatal inicializando RelaxaLAB:', error);
        
        // Mostrar mensaje de error al usuario
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif;">
                <h1 style="color: #e74c3c;">Error de Inicialización</h1>
                <p style="color: #666;">Ha ocurrido un error cargando la aplicación.</p>
                <p style="color: #666; font-size: 0.9em;">Revisa la consola para más detalles.</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recargar Página
                </button>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelaxaLAB);
} else {
    initRelaxaLAB();
}

console.log('app_simple.js cargado');
