/**
 * ============================================================================
 * UTN Contenidos - Asistente de Planificación Didáctica (Frontend)
 * Versión: 2.0 — Segura, robusta y lista para producción (GAS + Vercel-ready)
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// SISTEMA DE NOTIFICACIONES (reemplaza a alert() del sistema)
// ---------------------------------------------------------------------------
function showNotification(type, message, duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error:   '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info:    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${sanitizeHTML(message)}</span>
        <button class="toast-close" aria-label="Cerrar aviso">&times;</button>
    `;

    container.appendChild(toast);

    // Entrada animada
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Auto-dismiss
    const timer = setTimeout(() => dismissToast(toast), duration);
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

// ---------------------------------------------------------------------------
// SANITIZACIÓN XSS BÁSICA
// ---------------------------------------------------------------------------
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. REFERENCIAS AL DOM ---
    const viewLogin = document.getElementById('view-login');
    const viewDashboard = document.getElementById('view-dashboard');
    const viewGenerator = document.getElementById('view-generator');

    const mainNav = document.getElementById('main-nav');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-name-display');
    const btnLogout = document.getElementById('btn-logout');

    const formLogin = document.getElementById('form-login');
    const inputLegajo = document.getElementById('input-legajo');
    const inputDni = document.getElementById('input-dni');
    const errorLegajo = document.getElementById('error-legajo');
    const errorDni = document.getElementById('error-dni');

    const dashboardGrid = document.querySelector('.dashboard-grid');
    const breadcrumbSubject = document.getElementById('breadcrumb-subject');
    const breadcrumbTopic = document.getElementById('breadcrumb-topic');
    const btnBackDashboard = document.getElementById('btn-back-dashboard');

    const modalLoader = document.getElementById('modal-loader');
    const modalSuccess = document.getElementById('modal-success');
    const btnExportSlides = document.getElementById('btn-export-slides');
    const btnCloseSuccess = document.getElementById('btn-close-success');
    const linkOpenSlides = document.getElementById('link-open-slides');

    // Nuevas referencias para el Modal de Contexto Dinámico
    const modalContexto = document.getElementById('modal-contexto');
    const textareaContexto = document.getElementById('textarea-contexto');
    const btnContextoConfirm = document.getElementById('btn-contexto-confirm');
    const btnContextoCancel = document.getElementById('btn-contexto-cancel');

    // VARIABLES GLOBALES
    let claseGeneradaActual = null;
    let temaSeleccionadoActual = null; // Guardará el tema clickeado temporalmente
    let sesionToken = null;            // Token efímero de sesión (sólo esto se persiste)

    // --- 2. CONTROLADOR DE VISTAS (SPA ROUTER) ---
    const navigateTo = (viewId) => {
        [viewLogin, viewDashboard, viewGenerator].forEach(view => {
            view.setAttribute('hidden', '');
            view.classList.remove('spa-view');
        });
        const targetView = document.getElementById(viewId);
        targetView.removeAttribute('hidden');
        void targetView.offsetWidth; // Force reflow
        targetView.classList.add('spa-view');
        window.scrollTo(0, 0);
    };

    // --- 3. INGRESO DOCENTE (CONEXIÓN BACKEND) ---
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();

        errorLegajo.setAttribute('hidden', '');
        errorDni.setAttribute('hidden', '');
        inputLegajo.style.borderColor = '';
        inputDni.style.borderColor = '';

        const legajo = inputLegajo.value.trim();
        const dni = inputDni.value.trim();

        if (!legajo || !dni) {
            if (!legajo) { errorLegajo.removeAttribute('hidden'); inputLegajo.style.borderColor = 'var(--error)'; }
            if (!dni) { errorDni.removeAttribute('hidden'); inputDni.style.borderColor = 'var(--error)'; }
            return;
        }

        // Mostramos loader amigable mientras validamos
        document.getElementById('loader-title').textContent = "Validando tus datos...";
        document.getElementById('loader-title').nextElementSibling.textContent = "Conectando con la base de datos de la Facultad.";
        modalLoader.showModal();

        // LLAMADA AL BACKEND (app.gs)
        google.script.run
            .withSuccessHandler((respuesta) => {
                modalLoader.close();
                if (respuesta.success) {
                    // Ingreso exitoso — guardar token y datos mínimos de usuario
                    sesionToken = respuesta.token;
                    sessionStorage.setItem('utn_token', respuesta.token);
                    sessionStorage.setItem('utn_nombre', respuesta.usuario.nombre);

                    userNameDisplay.textContent = respuesta.usuario.nombre;
                    mainNav.removeAttribute('hidden');
                    userMenu.removeAttribute('hidden');

                    // Renderizar el dashboard
                    renderizarDashboard(respuesta.dashboard);
                    navigateTo('view-dashboard');

                    // Avisar si hay advertencia (ej: materias vacías)
                    if (respuesta.warning) showNotification('warning', respuesta.warning);
                } else {
                    // Credenciales no válidas
                    errorDni.removeAttribute('hidden');
                    errorDni.textContent = respuesta.error;
                    inputLegajo.style.borderColor = 'var(--error)';
                    inputDni.style.borderColor = 'var(--error)';
                }
            })
            .withFailureHandler((error) => {
                modalLoader.close();
                errorDni.removeAttribute('hidden');
                errorDni.textContent = "No pudimos conectar con la Facultad. Por favor, intentá de nuevo.";
                console.error('Login failure:', error);
            })
            .validarDocente(legajo, dni);
    });

    btnLogout.addEventListener('click', () => {
        formLogin.reset();
        mainNav.setAttribute('hidden', '');
        userMenu.setAttribute('hidden', '');

        // Cerrar dropdown si está abierto
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.setAttribute('hidden', '');

        dashboardGrid.innerHTML = '';
        claseGeneradaActual = null;
        temaSeleccionadoActual = null;
        sesionToken = null;

        sessionStorage.removeItem('utn_token');
        sessionStorage.removeItem('utn_nombre');
        navigateTo('view-login');
    });

    // --- DROPDOWN DE USUARIO (toggle al click, cierra al click afuera) ---
    const userMenuBtn = document.querySelector('#user-menu button');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = userDropdown.hasAttribute('hidden');
            userDropdown.toggleAttribute('hidden', !isHidden);
            userMenuBtn.setAttribute('aria-expanded', String(isHidden));
        });
        document.addEventListener('click', () => {
            userDropdown.setAttribute('hidden', '');
            userMenuBtn.setAttribute('aria-expanded', 'false');
        });
        userDropdown.addEventListener('click', (e) => e.stopPropagation());
    }


    // --- 4. RENDERIZADO DINÁMICO DEL DASHBOARD (iOS WIDGET STYLE) ---
    function renderizarDashboard(materias) {
        dashboardGrid.innerHTML = '';

        // EMPTY STATE: sin materias asignadas
        if (!materias || materias.length === 0) {
            dashboardGrid.innerHTML = `
                <div class="empty-state" role="status">
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>
                    <h2>Sin materias asignadas</h2>
                    <p>Todavía no tenés materias configuradas en el sistema. Comunicate con el área de sistemas para que te asignen tus materias y temas.</p>
                    <a href="mailto:sistemas@frd.utn.edu.ar" class="btn-secondary">Contactar Sistemas</a>
                </div>
            `;
            return;
        }

        materias.forEach(materia => {
            // Usamos sanitizeHTML para proteger contra XSS en datos de la BD
            let temasHTML = materia.temas.map(tema => `
                <li>
                    <span>${sanitizeHTML(tema.nombreTema)}</span>
                    <button class="btn-select-topic" 
                            data-materia="${sanitizeHTML(materia.nombre)}" 
                            data-tema="${sanitizeHTML(tema.nombreTema)}" 
                            data-link="${sanitizeHTML(tema.linkTeoria || '')}">
                        Preparar Clase
                    </button>
                </li>
            `).join('');

            const cardHTML = `
                <article class="subject-card">
                    <div class="subject-header">
                        <span class="badge">${sanitizeHTML(materia.nivel)}</span>
                        <h2>${sanitizeHTML(materia.nombre)}</h2>
                    </div>
                    <div class="subject-body">
                        <p>${sanitizeHTML(materia.descripcion)}</p>
                        <h3>Temas del programa:</h3>
                        <ul class="topic-list">${temasHTML}</ul>
                    </div>
                </article>
            `;
            dashboardGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Asignar eventos a los botones de selección
        document.querySelectorAll('.btn-select-topic').forEach(btn => {
            btn.addEventListener('click', abrirModalContexto);
        });
    }

    // --- 5. MODAL DE CONTEXTO DINÁMICO ---
    function abrirModalContexto(e) {
        const btn = e.target;
        temaSeleccionadoActual = {
            materiaNombre: btn.getAttribute('data-materia'),
            temaNombre: btn.getAttribute('data-tema'),
            linkTeoria: btn.getAttribute('data-link')
        };

        textareaContexto.value = ''; // Limpiar entrada previa
        modalContexto.showModal();
    }

    btnContextoConfirm.addEventListener('click', () => {
        if (!temaSeleccionadoActual) return;
        const contextoDinamico = textareaContexto.value.trim();
        modalContexto.close();

        ejecutarGeneracionIA(
            temaSeleccionadoActual.materiaNombre,
            temaSeleccionadoActual.temaNombre,
            contextoDinamico,
            temaSeleccionadoActual.linkTeoria
        );
    });

    btnContextoCancel.addEventListener('click', () => {
        modalContexto.close();
        temaSeleccionadoActual = null;
    });

    // --- 6. ASISTENTE INTELIGENTE: CREACIÓN DE CONTENIDO ---
    function ejecutarGeneracionIA(materiaNombre, temaNombre, contextoDinamico, linkTeoria) {
        // Loader muy cálido y no técnico
        document.getElementById('loader-title').textContent = "Preparando tus materiales...";
        document.getElementById('loader-title').nextElementSibling.textContent = "Armando el plan de clase y estructurando tus diapositivas sugeridas.";
        modalLoader.showModal();

        // LLAMADA AL BACKEND (app.gs) — pasamos el token de sesión
        google.script.run
            .withSuccessHandler((respuesta) => {
                modalLoader.close();

                if (respuesta && respuesta.success) {
                    claseGeneradaActual = respuesta;

                    // Mostrar advertencia del RAG si existe
                    if (respuesta.warning) showNotification('warning', respuesta.warning, 8000);

                    // Actualizar rutas superiores (breadcrumbs) — XSS safe via textContent
                    breadcrumbSubject.textContent = materiaNombre;
                    breadcrumbTopic.textContent = temaNombre;

                    // A. Enfoques sugeridos
                    const codeBlocksContainer = document.querySelector('#view-generator .code-blocks');
                    if (codeBlocksContainer && respuesta.busqueda) {
                        codeBlocksContainer.innerHTML = respuesta.busqueda.map((idea, index) => `
                            <pre><code><span class="prompt-label">Idea de enfoque ${index + 1}:</span>&quot;${sanitizeHTML(idea)}&quot;</code></pre>
                        `).join('');
                    }

                    // B. Plan de Trabajo (Duración y Objetivos)
                    const planDetails = document.querySelector('#view-generator .plan-details');
                    if (planDetails && respuesta.plan) {
                        const durationEl = planDetails.querySelector('p');
                        if (durationEl) {
                            durationEl.innerHTML = `<strong>Tiempo de clase estimado:</strong> ${sanitizeHTML(respuesta.plan.duracion)}`;
                        }

                        const objetivosList = planDetails.querySelector('ul');
                        if (objetivosList && respuesta.plan.objetivos) {
                            objetivosList.innerHTML = respuesta.plan.objetivos.map(obj => `<li>${sanitizeHTML(obj)}</li>`).join('');
                        }

                        const tableBody = planDetails.querySelector('.table-plan tbody');
                        if (tableBody && respuesta.plan.estructura) {
                            tableBody.innerHTML = respuesta.plan.estructura.map(item => `
                                <tr>
                                    <td><strong>${sanitizeHTML(item.fase)}</strong></td>
                                    <td>${sanitizeHTML(item.duracion)}</td>
                                    <td>${sanitizeHTML(item.actividad)}</td>
                                </tr>
                            `).join('');
                        }
                    }

                    // C. Estructura de Diapositivas Sugerida
                    const slidesGrid = document.querySelector('#view-generator .slides-grid');
                    if (slidesGrid && respuesta.slides) {
                        slidesGrid.innerHTML = respuesta.slides.map((slide, index) => {
                            let contentHTML = '';
                            if (slide.tipo === 'portada') {
                                contentHTML = `
                                    <h4>Título de portada:</h4>
                                    <p><strong>${sanitizeHTML(slide.titulo)}</strong></p>
                                    <h4>Detalle complementario:</h4>
                                    <p>${sanitizeHTML(slide.subtitulo || '')}</p>
                                `;
                            } else if (slide.tipo === 'esquema') {
                                contentHTML = `
                                    <p><em>${sanitizeHTML(slide.contenido)}</em></p>
                                    <p class="slide-note"><strong>Recomendación al hablar:</strong> Explicar el gráfico paso a paso en el pizarrón o pantalla.</p>
                                `;
                            } else {
                                const lineas = (slide.contenido || '').split('\n').filter(l => l.trim());
                                contentHTML = `
                                    <ul>
                                        ${lineas.map(line => `<li>${sanitizeHTML(line)}</li>`).join('')}
                                    </ul>
                                `;
                            }

                            return `
                                <article class="slide-card">
                                    <header>Diapositiva ${index + 1}: ${sanitizeHTML(slide.titulo)}</header>
                                    <div class="slide-content">
                                        ${contentHTML}
                                    </div>
                                </article>
                            `;
                        }).join('');
                    }

                    // D. Ideas para imágenes de apoyo
                    const promptList = document.querySelector('#view-generator .prompt-list');
                    if (promptList && respuesta.promptsImagenes) {
                        const labels = ["Para la Portada", "Para el Esquema explicativo", "Para el Ejemplo práctico", "Apoyo General"];
                        promptList.innerHTML = respuesta.promptsImagenes.map((prompt, index) => {
                            const label = labels[index] || `Ilustración sugerida ${index + 1}`;
                            return `
                                <div>
                                    <p><strong>${sanitizeHTML(label)}:</strong></p>
                                    <blockquote>
                                        &quot;${sanitizeHTML(prompt)}&quot;
                                    </blockquote>
                                </div>
                            `;
                        }).join('');
                    }

                    navigateTo('view-generator');
                } else {
                    const errMsg = (respuesta && respuesta.error) ? respuesta.error : "Tuvimos un inconveniente al armar tu clase. Por favor, reintentá.";
                    showNotification('error', errMsg);
                }
            })
            .withFailureHandler((error) => {
                modalLoader.close();
                showNotification('error', "Error de conexión al generar la clase. Revisá tu red e intentá de nuevo.");
                console.error('generarClaseIA failure:', error);
            })
            // CRÍTICO: se pasa el sesionToken para que el servidor valide la sesión
            .generarClaseIA(sesionToken, materiaNombre, temaNombre, contextoDinamico, linkTeoria);
    }

    btnBackDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('view-dashboard');
    });

    // --- 7. EXPORTACIÓN A GOOGLE SLIDES (DRIVE INSTITUCIONAL) ---
    btnExportSlides.addEventListener('click', () => {
        if (!claseGeneratedCheck()) return;

        document.getElementById('loader-title').textContent = "Guardando presentación...";
        document.getElementById('loader-title').nextElementSibling.textContent = "Creando tus diapositivas en Google Drive institucional. Por favor, esperá.";
        modalLoader.showModal();

        // LLAMADA AL BACKEND (app.gs) — token requerido para autorización
        google.script.run
            .withSuccessHandler((respuesta) => {
                modalLoader.close();
                if (respuesta.success) {
                    linkOpenSlides.href = respuesta.url;
                    modalSuccess.showModal();
                } else {
                    showNotification('error', "No pudimos guardar las diapositivas: " + (respuesta.error || 'Error desconocido.'));
                }
            })
            .withFailureHandler((error) => {
                modalLoader.close();
                showNotification('error', "Error de conexión al guardar. Por favor, intentá de nuevo.");
                console.error('exportarAGoogleSlides failure:', error);
            })
            // CRÍTICO: se pasa el sesionToken para que el servidor valide la sesión
            .exportarAGoogleSlides(sesionToken, claseGeneradaActual);
    });

    // --- 7b. EXPORTACIÓN A PDF (CLIENTE, sin costo) ---
    const btnExportPdf = document.getElementById('btn-export-pdf');
    if (btnExportPdf) {
        btnExportPdf.addEventListener('click', () => {
            if (!claseGeneratedCheck()) return;

            const clase = claseGeneradaActual;
            const tema = breadcrumbTopic.textContent || 'Clase';
            const materia = breadcrumbSubject.textContent || 'Materia';

            // Construir un HTML temporal limpio y bien estructurado para el PDF
            const pdfContent = document.createElement('div');
            pdfContent.style.fontFamily = 'Arial, sans-serif';
            pdfContent.style.color = '#1a1a2e';
            pdfContent.style.padding = '20px';

            let slidesHTML = '';
            if (clase.slides) {
                slidesHTML = clase.slides.map((s, i) => `
                    <div style="margin-bottom:12px; padding:10px; border-left:4px solid #0055A6;">
                        <strong>Diap. ${i + 1}: ${sanitizeHTML(s.titulo)}</strong>
                        <p style="margin:4px 0 0;font-size:13px;">${sanitizeHTML(s.subtitulo || s.contenido || '')}</p>
                    </div>
                `).join('');
            }

            let estructuraHTML = '';
            if (clase.plan && clase.plan.estructura) {
                estructuraHTML = clase.plan.estructura.map(e => `
                    <tr>
                        <td style="border:1px solid #ccc;padding:6px;"><strong>${sanitizeHTML(e.fase)}</strong></td>
                        <td style="border:1px solid #ccc;padding:6px;">${sanitizeHTML(e.duracion)}</td>
                        <td style="border:1px solid #ccc;padding:6px;">${sanitizeHTML(e.actividad)}</td>
                    </tr>
                `).join('');
            }

            pdfContent.innerHTML = `
                <div style="text-align:center;border-bottom:3px solid #0055A6;padding-bottom:16px;margin-bottom:24px;">
                    <h1 style="font-size:22px;color:#0055A6;margin:0;">UTN Facultad Regional Delta</h1>
                    <h2 style="font-size:16px;color:#555;margin:4px 0 0;">Guía de Planificación Didáctica</h2>
                    <p style="font-size:13px;color:#888;margin:4px 0 0;">${sanitizeHTML(materia)} &mdash; ${sanitizeHTML(tema)}</p>
                </div>

                <h3 style="color:#0055A6;">Plan de Clase (${sanitizeHTML(clase.plan ? clase.plan.duracion : '')})</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
                    <thead><tr style="background:#0055A6;color:#fff;">
                        <th style="padding:8px;text-align:left;">Momento</th>
                        <th style="padding:8px;text-align:left;">Duración</th>
                        <th style="padding:8px;text-align:left;">Actividad</th>
                    </tr></thead>
                    <tbody>${estructuraHTML}</tbody>
                </table>

                <h3 style="color:#0055A6;">Estructura de Diapositivas</h3>
                ${slidesHTML}

                <p style="margin-top:32px;font-size:11px;color:#999;text-align:center;">
                    Generado con UTN Contenidos &copy; 2026 &bull; Facultad Regional Delta
                </p>
            `;

            const opt = {
                margin:       [10, 10, 10, 10],
                filename:     `UTN_Clase_${tema.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            if (typeof html2pdf === 'undefined') {
                showNotification('error', 'La librería de PDF no está disponible. Verificá tu conexión a Internet.');
                return;
            }

            html2pdf().set(opt).from(pdfContent).save()
                .then(() => showNotification('success', '¡PDF generado y descargado correctamente!'))
                .catch(err => {
                    showNotification('error', 'Ocurrió un error al generar el PDF.');
                    console.error('html2pdf error:', err);
                });
        });
    }

    function claseGeneratedCheck() {
        if (!claseGeneradaActual) {
            showNotification('warning', "Primero generá el contenido de una clase antes de exportar.");
            return false;
        }
        return true;
    }

    btnCloseSuccess.addEventListener('click', () => {
        modalSuccess.close();
    });

    // Cerrar el modal al hacer clic fuera del recuadro
    [modalLoader, modalSuccess, modalContexto].forEach(modal => {
        modal.addEventListener('click', (e) => {
            const dialogDimensions = modal.getBoundingClientRect();
            if (e.clientX < dialogDimensions.left || e.clientX > dialogDimensions.right || e.clientY < dialogDimensions.top || e.clientY > dialogDimensions.bottom) {
                if (modal.id === 'modal-success' || modal.id === 'modal-contexto') modal.close();
            }
        });
    });

    // --- 8. REINICIO DE SESIÓN ACTIVA ---
    // Sólo recuperamos el token y el nombre del docente (datos mínimos, sin dashboard cacheado)
    const tokenGuardado = sessionStorage.getItem('utn_token');
    const nombreGuardado = sessionStorage.getItem('utn_nombre');
    if (tokenGuardado && nombreGuardado) {
        sesionToken = tokenGuardado;
        userNameDisplay.textContent = nombreGuardado;
        mainNav.removeAttribute('hidden');
        userMenu.removeAttribute('hidden');

        // Re-obtenemos el dashboard en vivo desde el servidor usando el token
        google.script.run
            .withSuccessHandler((respuesta) => {
                if (respuesta && respuesta.success) {
                    renderizarDashboard(respuesta.dashboard);
                    navigateTo('view-dashboard');
                } else {
                    // Token expiró — limpiar sesión
                    sessionStorage.removeItem('utn_token');
                    sessionStorage.removeItem('utn_nombre');
                    sesionToken = null;
                    mainNav.setAttribute('hidden', '');
                    userMenu.setAttribute('hidden', '');
                    showNotification('warning', 'Tu sesión expiró. Por favor, volvé a ingresar.');
                    navigateTo('view-login');
                }
            })
            .withFailureHandler(() => {
                // Error de red — navegamos al login como fallback seguro
                sessionStorage.removeItem('utn_token');
                sessionStorage.removeItem('utn_nombre');
                sesionToken = null;
                navigateTo('view-login');
            })
            .revalidarSesionConDashboard(tokenGuardado);
    }

});/**
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
