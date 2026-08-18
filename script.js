/**
 * ============================================================================
 * UTN Contenidos - Asistente de Planificación Didáctica (Frontend)
 * Versión: 3.0 — Híbrida y optimizada para Vercel (API REST + CORS)
 * ============================================================================
 */

// CONFIGURACIÓN: URL de la Web App de Google Apps Script (Backend)
// Podés hardcodear la URL aquí o establecerla dinámicamente en la consola con:
// localStorage.setItem('utn_gas_api_url', 'https://script.google.com/macros/s/.../exec')
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwikcFYhvZ92DAi1YD_LQrjNC8lmekWpOAANNC3Xd-nrtXTEyvkBcIHqciRXbJU9wJj/exec"

/**
 * Realiza llamadas HTTP POST al backend en Google Apps Script
 */
async function callBackend(action, data = {}) {
    const url = localStorage.getItem('utn_gas_api_url') || GAS_API_URL;

    if (!url || url.includes('XXXXXXXXXXXXXXXXXXXX')) {
        const errorMsg = "Falta configurar la URL del Web App de Google Apps Script (GAS_API_URL en script.js).";
        showNotification('error', errorMsg, 10000);
        throw new Error(errorMsg);
    }

    const payload = { action, ...data };

    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8" // Evita OPTIONS preflight complejo en Apps Script
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Error en el servidor backend (${response.status} ${response.statusText})`);
    }

    const resJson = await response.json();
    return resJson;
}

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
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
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
    const viewHistorial = document.getElementById('view-historial');

    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav.querySelectorAll('a');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-name-display');
    const btnLogout = document.getElementById('btn-logout');

    const formLogin = document.getElementById('form-login');
    const inputLegajo = document.getElementById('input-legajo');
    const inputDni = document.getElementById('input-dni');
    const errorLegajo = document.getElementById('error-legajo');
    const errorDni = document.getElementById('error-dni');

    const dashboardGrid = document.querySelector('.dashboard-grid');
    const historialGrid = document.getElementById('historial-grid');
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

    // Referencias para el Modal de Reclamar Materias
    const modalReclamar = document.getElementById('modal-reclamar');
    const btnOpenClaimModal = document.getElementById('btn-open-claim-modal');
    const catalogContainer = document.getElementById('catalog-container');
    const btnReclamarConfirm = document.getElementById('btn-reclamar-confirm');
    const btnReclamarCancel = document.getElementById('btn-reclamar-cancel');

    // VARIABLES GLOBALES
    let claseGeneradaActual = null;
    let temaSeleccionadoActual = null; // Guardará el tema clickeado temporalmente
    let sesionToken = null;            // Token efímero de sesión (sólo esto se persiste)

    // --- 2. CONTROLADOR DE VISTAS (SPA ROUTER) ---
    const navigateTo = (viewId) => {
        [viewLogin, viewDashboard, viewGenerator, viewHistorial].forEach(view => {
            view.setAttribute('hidden', '');
            view.classList.remove('spa-view');
        });

        // Update nav links active state
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${viewId.replace('view-', '')}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        const targetView = document.getElementById(viewId);
        targetView.removeAttribute('hidden');
        void targetView.offsetWidth; // Force reflow
        targetView.classList.add('spa-view');
        window.scrollTo(0, 0);
    };

    // --- 3. INGRESO DOCENTE (CONEXIÓN BACKEND) ---
    formLogin.addEventListener('submit', async (e) => {
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

        try {
            // LLAMADA AL BACKEND (HTTP POST)
            const respuesta = await callBackend('validarDocente', { legajo, dni });
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
        } catch (error) {
            modalLoader.close();
            errorDni.removeAttribute('hidden');
            errorDni.textContent = "No pudimos conectar con la Facultad. Por favor, intentá de nuevo.";
            console.error('Login failure:', error);
        }
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

    // --- NAVEGACIÓN PRINCIPAL ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').replace('#', 'view-');

            if (targetId === 'view-historial') {
                cargarHistorial();
            } else if (targetId === 'view-dashboard') {
                navigateTo('view-dashboard');
            }
        });
    });

    async function cargarHistorial() {
        navigateTo('view-historial');
        historialGrid.innerHTML = `
            <div class="empty-state" role="status">
                <div class="spinner-wrapper" style="margin: 0 auto 20px;">
                    <svg class="spinner" viewBox="0 0 50 50" style="width:40px;height:40px;">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="#007AFF" stroke-width="4.5"></circle>
                    </svg>
                </div>
                <p>Cargando historial...</p>
            </div>
        `;

        try {
            const respuesta = await callBackend('obtenerHistorialDocente', { token: sesionToken });
            if (respuesta && respuesta.success) {
                renderizarHistorial(respuesta.historial);
            } else {
                showNotification('error', "No se pudo cargar el historial.");
                historialGrid.innerHTML = `<p class="error-message">Error al cargar el historial.</p>`;
            }
        } catch (error) {
            console.error(error);
            showNotification('error', "Error de conexión al cargar el historial.");
            historialGrid.innerHTML = `<p class="error-message">Error de conexión.</p>`;
        }
    }

    function renderizarHistorial(historial) {
        if (!historial || historial.length === 0) {
            historialGrid.innerHTML = `
                <div class="empty-state" role="status">
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <h2>No hay presentaciones generadas</h2>
                    <p>Todavía no generaste ninguna presentación. Creá tu primera clase desde "Mis Materias".</p>
                </div>
            `;
            return;
        }

        historialGrid.innerHTML = historial.map(item => `
            <article class="subject-card">
                <div class="subject-header">
                    <h2>${sanitizeHTML(item.temaNombre)}</h2>
                </div>
                <div class="subject-body">
                    <p>Materia ID: ${sanitizeHTML(item.materiaId || 'N/A')}</p>
                    <p>Fecha: ${sanitizeHTML(item.fechaCreacion)}</p>
                    <div style="margin-top: 15px;">
                        <a href="${item.urlSlides}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:inline-block; text-align:center; padding: 10px 15px; border-radius: 8px; text-decoration:none;">Ver Slides</a>
                    </div>
                </div>
            </article>
        `).join('');
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
            let temas = (materia.temas && materia.temas.length > 0) ? materia.temas : [
                { nombreTema: 'Contenido General / Introducción', linkTeoria: '' }
            ];

            let temasHTML = temas.map(tema => `
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
                        <span class="badge">${sanitizeHTML(materia.nivel || 'UTN')}</span>
                        <h2>${sanitizeHTML(materia.nombre)}</h2>
                    </div>
                    <div class="subject-body">
                        <p>${sanitizeHTML(materia.descripcion || '')}</p>
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

    // --- 5b. MODAL DE RECLAMAR MATERIAS (OFERTA ACADÉMICA) ---
    if (btnOpenClaimModal && modalReclamar) {
        btnOpenClaimModal.addEventListener('click', async () => {
            document.getElementById('loader-title').textContent = "Cargando plan de estudios...";
            document.getElementById('loader-title').nextElementSibling.textContent = "Obteniendo las materias ordenadas por año.";
            modalLoader.showModal();

            try {
                const res = await callBackend('obtenerOfertaAcademica', { token: sesionToken });
                modalLoader.close();

                if (res.success && res.catalogo) {
                    renderizarCatalogoMaterias(res.catalogo);
                    modalReclamar.showModal();
                } else {
                    showNotification('error', res.error || "No se pudo recuperar la oferta académica.");
                }
            } catch (err) {
                modalLoader.close();
                showNotification('error', "Error de conexión al cargar las materias.");
                console.error(err);
            }
        });
    }

    function renderizarCatalogoMaterias(catalogo) {
        catalogContainer.innerHTML = '';
        const niveles = Object.keys(catalogo);

        if (niveles.length === 0) {
            catalogContainer.innerHTML = '<p>No hay materias disponibles en el plan de estudio.</p>';
            return;
        }

        niveles.forEach(nivel => {
            const materias = catalogo[nivel];
            let listHTML = materias.map(m => `
                <label style="display: flex; align-items: flex-start; gap: 12px; padding: 10px; border-radius: 8px; border: 1px solid var(--border-glass-dark); margin-bottom: 8px; cursor: pointer; background: rgba(255,255,255,0.6);">
                    <input type="checkbox" class="chk-claim-materia" value="${sanitizeHTML(m.id)}" ${m.asignada ? 'checked' : ''} style="width: 20px; height: 20px; margin-top: 2px;">
                    <div>
                        <strong style="display: block; font-size: 1rem; color: var(--text-primary);">${sanitizeHTML(m.nombre)} (${sanitizeHTML(m.id)})</strong>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">${sanitizeHTML(m.descripcion || '')}</span>
                    </div>
                </label>
            `).join('');

            const sectionHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 1.1rem; color: var(--ios-blue); margin-bottom: 10px; border-bottom: 2px solid var(--ios-blue); padding-bottom: 4px;">${sanitizeHTML(nivel)}</h3>
                    ${listHTML}
                </div>
            `;
            catalogContainer.insertAdjacentHTML('beforeend', sectionHTML);
        });
    }

    if (btnReclamarConfirm) {
        btnReclamarConfirm.addEventListener('click', async () => {
            const checkedBoxes = catalogContainer.querySelectorAll('.chk-claim-materia:checked');
            const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

            modalReclamar.close();
            document.getElementById('loader-title').textContent = "Guardando tus materias...";
            document.getElementById('loader-title').nextElementSibling.textContent = "Actualizando tu perfil docente en el sistema.";
            modalLoader.showModal();

            try {
                const res = await callBackend('reclamarMaterias', {
                    token: sesionToken,
                    materiasIdsSeleccionadas: selectedIds
                });
                modalLoader.close();

                if (res.success) {
                    showNotification('success', res.mensaje || "¡Materias actualizadas!");
                    if (res.dashboard) {
                        renderizarDashboard(res.dashboard);
                    }
                } else {
                    showNotification('error', res.error || "No se pudo actualizar las materias.");
                }
            } catch (err) {
                modalLoader.close();
                showNotification('error', "Error de conexión al guardar materias.");
                console.error(err);
            }
        });
    }

    if (btnReclamarCancel) {
        btnReclamarCancel.addEventListener('click', () => {
            modalReclamar.close();
        });
    }

    // --- 6. ASISTENTE INTELIGENTE: CREACIÓN DE CONTENIDO ---
    async function ejecutarGeneracionIA(materiaNombre, temaNombre, contextoDinamico, linkTeoria) {
        // Loader muy cálido y no técnico
        document.getElementById('loader-title').textContent = "Preparando tus materiales...";
        document.getElementById('loader-title').nextElementSibling.textContent = "Armando el plan de clase y estructurando tus diapositivas sugeridas.";
        modalLoader.showModal();

        try {
            // 1. OBTENER CONTEXTO (RAG) DESDE EL BACKEND (Google Apps Script)
            const respuestaContexto = await callBackend('obtenerContextoTema', {
                token: sesionToken,
                linkTeoria
            });

            if (!respuestaContexto || !respuestaContexto.success) {
                throw new Error(respuestaContexto?.error || "Error al obtener la teoría oficial de la materia.");
            }

            // 2. GENERAR CLASE IA (Estrategia Híbrida: Vercel Serverless con fallback automático a GAS)
            let respuesta = null;

            try {
                const responseGemini = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        materia: materiaNombre,
                        tema: temaNombre,
                        textoOficial: respuestaContexto.textoOficial,
                        contextoDinamico
                    })
                });

                if (responseGemini.ok) {
                    respuesta = await responseGemini.json();
                } else {
                    console.warn(`/api/gemini respondió HTTP ${responseGemini.status}. Activando fallback a Google Apps Script...`);
                }
            } catch (errLocal) {
                console.warn("Fallo de conexión a /api/gemini local. Activando fallback a Google Apps Script...", errLocal);
            }

            // Si Vercel no respondió (ej: Live Server local o 405), ejecutamos vía backend GAS
            if (!respuesta || !respuesta.success) {
                respuesta = await callBackend('generarClaseIA', {
                    token: sesionToken,
                    materia: materiaNombre,
                    tema: temaNombre,
                    textoOficial: respuestaContexto.textoOficial,
                    contextoDinamico
                });
            }

            modalLoader.close();

            if (respuesta && respuesta.success) {
                claseGeneradaActual = respuesta;

                // Mostrar advertencia del RAG si existe
                if (respuestaContexto.warning) showNotification('warning', respuestaContexto.warning, 8000);

                // Actualizar rutas superiores (breadcrumbs)
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

                // C. Estructura de Diapositivas Sugerida (Diseño Universitario de Alto Impacto)
                const slidesGrid = document.querySelector('#view-generator .slides-grid');
                if (slidesGrid && respuesta.slides) {
                    slidesGrid.innerHTML = respuesta.slides.map((slide, index) => {
                        let contentHTML = '';
                        let categoriaBadge = slide.categoria ? `<span class="badge" style="background: rgba(0, 85, 166, 0.1); color: var(--ios-blue); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px; display: inline-block;">${sanitizeHTML(slide.categoria)}</span>` : '';

                        if (slide.tipo === 'portada') {
                            contentHTML = `
                                <h4>Portada Institucional UTN</h4>
                                <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-top: 5px;">${sanitizeHTML(slide.titulo)}</p>
                                <p style="color: var(--text-secondary);">${sanitizeHTML(slide.subtitulo || '')}</p>
                            `;
                        } else {
                            const lineas = (slide.contenido || '').split('\n').filter(l => l.trim());
                            contentHTML = `
                                <ul style="padding-left: 18px; margin: 10px 0; color: var(--text-primary);">
                                    ${lineas.map(line => `<li style="margin-bottom: 6px; line-height: 1.4;">${sanitizeHTML(line.replace(/^[•\-\*]\s*/, ''))}</li>`).join('')}
                                </ul>
                            `;
                        }

                        let notasHTML = slide.notasOrador ? `
                            <div style="margin-top: 14px; padding: 10px 12px; background: rgba(0, 122, 255, 0.05); border-left: 3px solid var(--ios-blue); border-radius: 6px;">
                                <strong style="font-size: 0.8rem; color: var(--ios-blue); display: block; margin-bottom: 3px;">🎙️ GUÍA DOCENTE (NOTAS DE AULA):</strong>
                                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; font-style: italic;">${sanitizeHTML(slide.notasOrador)}</p>
                            </div>
                        ` : '';

                        return `
                            <article class="slide-card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                                <div>
                                    <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                        <div>
                                            ${categoriaBadge}
                                            <h3 style="font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin: 0;">Diap. ${index + 1}: ${sanitizeHTML(slide.titulo)}</h3>
                                        </div>
                                    </header>
                                    <div class="slide-content">
                                        ${contentHTML}
                                    </div>
                                </div>
                                ${notasHTML}
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
        } catch (error) {
            modalLoader.close();
            showNotification('error', error.message || "Error de conexión al generar la clase. Revisá tu red e intentá de nuevo.");
            console.error('generarClaseIA failure:', error);
        }
    }

    btnBackDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('view-dashboard');
    });

    // --- 7. EXPORTACIÓN A GOOGLE SLIDES (DRIVE INSTITUCIONAL) ---
    btnExportSlides.addEventListener('click', async () => {
        if (!claseGeneratedCheck()) return;

        document.getElementById('loader-title').textContent = "Guardando presentación...";
        document.getElementById('loader-title').nextElementSibling.textContent = "Creando tus diapositivas en Google Drive institucional. Por favor, esperá.";
        modalLoader.showModal();

        try {
            // LLAMADA AL BACKEND (HTTP POST) — token requerido para autorización
            const respuesta = await callBackend('exportarAGoogleSlides', {
                token: sesionToken,
                materiaId: breadcrumbSubject.textContent, // usamos el nombre como ID simplificado
                materiaNombre: breadcrumbSubject.textContent,
                temaNombre: breadcrumbTopic.textContent,
                datosClase: claseGeneradaActual
            });

            modalLoader.close();
            if (respuesta.success) {
                linkOpenSlides.href = respuesta.url;
                modalSuccess.showModal();
            } else {
                showNotification('error', "No pudimos guardar las diapositivas: " + (respuesta.error || 'Error desconocido.'));
            }
        } catch (error) {
            modalLoader.close();
            showNotification('error', "Error de conexión al guardar. Por favor, intentá de nuevo.");
            console.error('exportarAGoogleSlides failure:', error);
        }
    });

    // --- 7b. EXPORTACIÓN A PDF (CLIENTE, sin costo) ---
    const btnExportPdf = document.getElementById('btn-export-pdf');
    if (btnExportPdf) {
        btnExportPdf.addEventListener('click', () => {
            if (!claseGeneratedCheck()) return;

            const clase = claseGeneradaActual;
            const tema = breadcrumbTopic.textContent || 'Clase';
            const materia = breadcrumbSubject.textContent || 'Materia';

            const pdfContent = document.createElement('div');
            pdfContent.style.fontFamily = 'Arial, sans-serif';
            pdfContent.style.color = '#1a1a2e';
            pdfContent.style.padding = '20px';

            let slidesHTML = '';
            if (clase.slides) {
                slidesHTML = clase.slides.map((s, i) => {
                    let notasPDF = s.notasOrador ? `<p style="margin:6px 0 0;font-size:12px;color:#0055A6;font-style:italic;"><strong>Guía docente:</strong> ${sanitizeHTML(s.notasOrador)}</p>` : '';
                    let categoriaPDF = s.categoria ? `<span style="font-size:11px;color:#666;text-transform:uppercase;">[${sanitizeHTML(s.categoria)}]</span> ` : '';
                    return `
                        <div style="margin-bottom:16px; padding:12px; border-left:4px solid #0055A6; background:#f8fafc;">
                            <strong style="color:#1e293b;font-size:14px;">Diap. ${i + 1}: ${categoriaPDF}${sanitizeHTML(s.titulo)}</strong>
                            <p style="margin:6px 0 0;font-size:13px;color:#334155;white-space:pre-line;">${sanitizeHTML(s.subtitulo || s.contenido || '')}</p>
                            ${notasPDF}
                        </div>
                    `;
                }).join('');
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
                margin: [10, 10, 10, 10],
                filename: `UTN_Clase_${tema.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
    const tokenGuardado = sessionStorage.getItem('utn_token');
    const nombreGuardado = sessionStorage.getItem('utn_nombre');

    if (tokenGuardado && nombreGuardado) {
        sesionToken = tokenGuardado;
        userNameDisplay.textContent = nombreGuardado;
        mainNav.removeAttribute('hidden');
        userMenu.removeAttribute('hidden');

        // Re-obtenemos el dashboard en vivo desde el servidor usando el token
        callBackend('revalidarSesionConDashboard', { token: tokenGuardado })
            .then((respuesta) => {
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
            .catch(() => {
                // Error de red — navegamos al login como fallback seguro
                sessionStorage.removeItem('utn_token');
                sessionStorage.removeItem('utn_nombre');
                sesionToken = null;
                navigateTo('view-login');
            });
    }

});
