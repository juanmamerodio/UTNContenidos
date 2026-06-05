/**
 * ============================================================================
 * UTNContenidos - Motor de Orquestación Frontend (Vanilla JS)
 * Facultad Regional Delta - Universidad Tecnológica Nacional
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. REFERENCIAS AL DOM ---
    
    // Vistas (SPA)
    const viewLogin = document.getElementById('view-login');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewGenerator = document.getElementById('view-generator');
    
    // Elementos del Header
    const mainNav = document.getElementById('main-nav');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-name-display');
    const btnLogout = document.getElementById('btn-logout');
    
    // Formulario de Login
    const formLogin = document.getElementById('form-login');
    const inputLegajo = document.getElementById('input-legajo');
    const inputDni = document.getElementById('input-dni');
    const errorLegajo = document.getElementById('error-legajo');
    const errorDni = document.getElementById('error-dni');
    
    // Elementos del Dashboard y Generador
    const btnsSelectTopic = document.querySelectorAll('.btn-select-topic');
    const btnBackDashboard = document.getElementById('btn-back-dashboard');
    const breadcrumbSubject = document.getElementById('breadcrumb-subject');
    const breadcrumbTopic = document.getElementById('breadcrumb-topic');
    
    // Modales y Acciones
    const modalLoader = document.getElementById('modal-loader');
    const modalSuccess = document.getElementById('modal-success');
    const btnExportSlides = document.getElementById('btn-export-slides');
    const btnCloseSuccess = document.getElementById('btn-close-success');

    // --- 2. CONTROLADOR DE VISTAS (ROUTER SPA) ---
    
    const navigateTo = (viewId) => {
        // Ocultar todas las vistas
        [viewLogin, viewDashboard, viewGenerator].forEach(view => {
            view.setAttribute('hidden', '');
            view.classList.remove('spa-view'); // Reinicia animación
        });
        
        // Mostrar la vista solicitada
        const targetView = document.getElementById(viewId);
        targetView.removeAttribute('hidden');
        
        // Forzar reflow para reiniciar la animación CSS
        void targetView.offsetWidth; 
        targetView.classList.add('spa-view');
        
        // Scrollear arriba
        window.scrollTo(0, 0);
    };

    // --- 3. LÓGICA DE AUTENTICACIÓN ---
    
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita recarga de página
        
        // Resetear errores
        errorLegajo.setAttribute('hidden', '');
        errorDni.setAttribute('hidden', '');
        inputLegajo.style.borderColor = '';
        inputDni.style.borderColor = '';

        const legajo = inputLegajo.value.trim();
        const dni = inputDni.value.trim();
        
        let hasError = false;

        if (!legajo) {
            errorLegajo.removeAttribute('hidden');
            errorLegajo.textContent = "El legajo es obligatorio.";
            inputLegajo.style.borderColor = 'var(--error)';
            hasError = true;
        }
        
        if (!dni) {
            errorDni.removeAttribute('hidden');
            errorDni.textContent = "El DNI es obligatorio.";
            inputDni.style.borderColor = 'var(--error)';
            hasError = true;
        }

        if (hasError) return;

        // Validación Backdoor solicitada ("root" / "root")
        if (legajo === 'root' && dni === 'root') {
            // Login Exitoso
            userNameDisplay.textContent = "Prof. Root (Admin)";
            
            // Mostrar elementos del header
            mainNav.removeAttribute('hidden');
            userMenu.removeAttribute('hidden');
            
            // Navegar al Dashboard
            navigateTo('view-dashboard');
        } else {
            // Simulación de error de credenciales
            errorDni.removeAttribute('hidden');
            errorDni.textContent = "Credenciales inválidas. Verifique en Sysacad.";
            inputLegajo.style.borderColor = 'var(--error)';
            inputDni.style.borderColor = 'var(--error)';
        }
    });

    btnLogout.addEventListener('click', () => {
        // Limpiar formulario
        formLogin.reset();
        
        // Ocultar elementos del header
        mainNav.setAttribute('hidden', '');
        userMenu.setAttribute('hidden', '');
        
        // Volver al login
        navigateTo('view-login');
    });

    // --- 4. LÓGICA DEL DASHBOARD Y GENERACIÓN IA ---
    
    btnsSelectTopic.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Extraer datos del DOM para los breadcrumbs
            const topicName = e.target.previousElementSibling.textContent;
            const subjectCard = e.target.closest('.subject-card');
            const subjectName = subjectCard.querySelector('h2').textContent;
            
            // Mostrar Modal de Carga (Simulando llamada a la API de Gemini)
            modalLoader.showModal();
            
            // Simular tiempo de procesamiento de IA (2.5 segundos)
            setTimeout(() => {
                // Actualizar Breadcrumbs
                breadcrumbSubject.textContent = subjectName;
                breadcrumbTopic.textContent = topicName;
                
                // Cerrar loader y navegar a la vista de resultados
                modalLoader.close();
                navigateTo('view-generator');
            }, 2500);
        });
    });

    btnBackDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('view-dashboard');
    });

    // --- 5. LÓGICA DE EXPORTACIÓN (GOOGLE SLIDES) ---
    
    btnExportSlides.addEventListener('click', () => {
        // Reutilizamos el loader cambiando el texto temporalmente
        const loaderTitle = document.getElementById('loader-title');
        const originalTitle = loaderTitle.textContent;
        const loaderDesc = loaderTitle.nextElementSibling;
        const originalDesc = loaderDesc.textContent;

        loaderTitle.textContent = "Exportando a Google Slides...";
        loaderDesc.textContent = "Conectando con Google Drive institucional. Por favor, espere.";
        
        modalLoader.showModal();

        // Simular tiempo de creación de Slides vía Apps Script (2 segundos)
        setTimeout(() => {
            modalLoader.close();
            
            // Restaurar textos originales del loader
            loaderTitle.textContent = originalTitle;
            loaderDesc.textContent = originalDesc;
            
            // Mostrar modal de éxito
            modalSuccess.showModal();
        }, 2000);
    });

    btnCloseSuccess.addEventListener('click', () => {
        modalSuccess.close();
    });

    // Cerrar modales al hacer clic fuera de ellos (UX)
    [modalLoader, modalSuccess].forEach(modal => {
        modal.addEventListener('click', (e) => {
            const dialogDimensions = modal.getBoundingClientRect();
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                // Solo permitimos cerrar el de éxito haciendo clic afuera. 
                // El loader no debe cerrarse para no romper el flujo.
                if (modal.id === 'modal-success') {
                    modal.close();
                }
            }
        });
    });

});