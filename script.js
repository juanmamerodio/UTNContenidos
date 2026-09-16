/**
 * ============================================================================
 * UTN Contenidos - Asistente de Planificación Didáctica (Frontend)
 * Versión: 3.0 — Híbrida y optimizada para Vercel (API REST + CORS)
 * ============================================================================
 */

// CONFIGURACIÓN: URL de la Web App de Google Apps Script (Backend)
// La constante es la fuente de verdad de producción. Si quedó una URL vieja
// guardada en localStorage (de un deployment anterior), la descartamos: cada
// vez que se republica el Apps Script, las URLs viejas quedan desactivadas y
// provocan "Failed to fetch" en el login.
// ÚLTIMA URL FUNCIONAL (pendiente: el deploy nuevo dio 401 por acceso restringido)
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbyCqWYhWMi5NOvjd120ToBoGyshdC54kTgdadgp9UAMaca1oQppuJfZqwrDZcFIhJOc/exec"

/**
 * Realiza llamadas HTTP POST al backend en Google Apps Script
 */
async function callBackend(action, data = {}) {
    // Usamos SIEMPRE la URL del código; un override viejo en localStorage
    // apunta a un Web App desactivado y rompe todo el flujo.
    const url = GAS_API_URL;
    try { localStorage.removeItem('utn_gas_api_url'); } catch (e) { /* no crítico */ }

    if (!url || url.includes('XXXXXXXXXXXXXXXXXXXX')) {
        const errorMsg = "Falta configurar la URL del Web App de Google Apps Script (GAS_API_URL en script.js).";
        showNotification('error', errorMsg, 10000);
        throw new Error(errorMsg);
    }

    const payload = { action, ...data };

    console.log("Backend URL:", url);
    console.log("Payload:", payload);

    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
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

// Sanitización de URLs: solo permite protocolos http/https (evita javascript:)
function sanitizeURL(url) {
    const str = String(url || '').trim();
    if (/^https?:\/\//i.test(str)) return str;
    return '#';
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

    // Referencias para el Modal de Contexto Dinámico
    const modalContexto = document.getElementById('modal-contexto');
    const textareaContexto = document.getElementById('textarea-contexto');
    const btnContextoConfirm = document.getElementById('btn-contexto-confirm');
    const btnContextoCancel = document.getElementById('btn-contexto-cancel');

    // Referencias del Configurador de Clase (Sprint B)
    const cfgDuracion = document.getElementById('cfg-duracion');
    const cfgSlides = document.getElementById('cfg-slides');
    const cfgSlidesVal = document.getElementById('cfg-slides-val');
    const cfgEstilo = document.getElementById('cfg-estilo');
    const cfgNivel = document.getElementById('cfg-nivel');
    const cfgEjemplos = document.getElementById('cfg-ejemplos');
    const cfgImagenes = document.getElementById('cfg-imagenes');
    const cfgUrlTeoria = document.getElementById('cfg-url-teoria');
    const cfgTemasExtra = document.getElementById('cfg-temas-extra');
    const btnTemplateSave = document.getElementById('btn-template-save');
    const btnTemplateLoad = document.getElementById('btn-template-load');
    const btnTemplateClear = document.getElementById('btn-template-clear');

    // Referencias para el Modal de Reclamar Materias
    const modalReclamar = document.getElementById('modal-reclamar');
    const btnOpenClaimModal = document.getElementById('btn-open-claim-modal');
    const catalogContainer = document.getElementById('catalog-container');
    const btnReclamarConfirm = document.getElementById('btn-reclamar-confirm');
    const btnReclamarCancel = document.getElementById('btn-reclamar-cancel');

    // VARIABLES GLOBALES
    let claseGeneradaActual = null;
    let temaSeleccionadoActual = null; // Guardará el tema clickeado temporalmente
    let contextoClaseActual = null;    // IDs relacionales del tema/materia en curso
    let sesionToken = null;            // Token efímero de sesión (sólo esto se persiste)
    let claseHistorialCache = null;    // Última respuesta del historial (para reabrir clases)
    let configuracionGeneracion = {};  // Configuración elegida (para aplicar el estilo al exportar)

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
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="var(--utn-green-primary)" stroke-width="4.5"></circle>
                    </svg>
                </div>
                <p>Cargando historial...</p>
            </div>
        `;

        try {
            const respuesta = await callBackend('obtenerHistorialDocente', { token: sesionToken });
            if (respuesta && respuesta.success) {
                claseHistorialCache = respuesta.historial;
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

        // Distintivo visual: verde = reciente/activo, celeste = usado, gris = archivado (>15 días)
        const badges = {
            nuevo: '<span class="badge" style="background: rgba(6,162,138,0.14); color:#047a68;">● Reciente</span>',
            usado: '<span class="badge" style="background: rgba(59,130,246,0.14); color:#1d4ed8;">● Usado</span>',
            archivado: '<span class="badge" style="background: rgba(100,116,139,0.14); color:#475569;">● Archivado (+15 días)</span>'
        };
        const diasDesde = (fecha) => Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000));

        historialGrid.innerHTML = historial.map(item => {
            const dias = diasDesde(item.fechaCreacion);
            let estado = 'nuevo';
            if (dias > 15) estado = 'archivado';
            else if (item.carpeta && item.carpeta !== '') estado = 'usado';

            const botonReabrir = item.datosClase ? `
                <button type="button" class="btn-reabrir-clase btn-secondary" data-historial-id="${sanitizeHTML(item.idHistorial)}" style="font-size:0.8rem; padding:8px 12px;">↩ Reabrir clase</button>
            ` : '';
            const botonCarpeta = `
                <button type="button" class="btn-mover-carpeta btn-secondary" data-historial-id="${sanitizeHTML(item.idHistorial)}" data-carpeta-actual="${sanitizeHTML(item.carpeta || '')}" style="font-size:0.8rem; padding:8px 12px;">📁 ${sanitizeHTML(item.carpeta || 'Agregar a carpeta')}</button>
            `;

            return `
            <article class="subject-card">
                <div class="subject-header">
                    <h2>${sanitizeHTML(item.temaNombre)}</h2>
                    <span style="display:inline-block; margin-top:6px;">${badges[estado]}</span>
                </div>
                <div class="subject-body">
                    <p>Materia: ${sanitizeHTML(item.materiaId || 'N/A')}</p>
                    <p>Fecha: ${sanitizeHTML(item.fechaCreacion)}</p>
                    <p style="color: var(--text-tertiary); font-size:0.8rem;">Antigüedad: ${dias} día(s)</p>
                    <div style="margin-top: 15px; display:flex; gap:8px; flex-wrap:wrap;">
                        <a href="${sanitizeURL(item.urlSlides)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display:inline-block; text-align:center; padding: 10px 15px; border-radius: 8px; text-decoration:none;">Ver Slides</a>
                        ${botonReabrir}
                        ${botonCarpeta}
                    </div>
                </div>
            </article>
            `;
        }).join('');

        // Eventos del historial
        document.querySelectorAll('.btn-reabrir-clase').forEach(btn => {
            btn.addEventListener('click', reabrirClaseDesdeHistorial);
        });
        document.querySelectorAll('.btn-mover-carpeta').forEach(btn => {
            btn.addEventListener('click', pedirCarpetaParaHistorial);
        });
    }

    // --- 4b. REABRIR UNA CLASE DESDE EL HISTORIAL (Feedback #2) ---
    async function reabrirClaseDesdeHistorial(e) {
        const btn = e.target.closest ? e.target.closest('.btn-reabrir-clase') : e.target;
        const id = btn.getAttribute('data-historial-id');
        const item = claseHistorialCache?.find(h => String(h.idHistorial) === String(id));
        if (!item || !item.datosClase) {
            showNotification('warning', 'Esta presentación no guardó su contenido para reabrirlo.');
            return;
        }
        claseGeneradaActual = item.datosClase;
        breadcrumbSubject.textContent = item.materiaId || 'Materia';
        breadcrumbTopic.textContent = item.temaNombre || 'Tema';
        renderizarContenidoGenerado();
        showNotification('success', 'Clase reabierta. Podés editarla y volver a exportarla.');
    }

    async function pedirCarpetaParaHistorial(e) {
        const btn = e.target.closest ? e.target.closest('.btn-mover-carpeta') : e.target;
        const id = btn.getAttribute('data-historial-id');
        const carpetaActual = btn.getAttribute('data-carpeta-actual') || '';
        const nuevaCarpeta = prompt('¿A qué carpeta querés mover esta presentación?', carpetaActual);
        if (nuevaCarpeta === null) return;
        try {
            const res = await callBackend('actualizarHistorial', {
                token: sesionToken,
                idHistorial: id,
                carpeta: nuevaCarpeta
            });
            if (res.success) {
                showNotification('success', 'Carpeta actualizada.');
                cargarHistorial();
            } else {
                showNotification('error', res.error || 'No se pudo mover a la carpeta.');
            }
        } catch (err) {
            showNotification('error', 'Error de conexión al mover de carpeta.');
        }
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
                { idTema: '', nombreTema: 'Contenido General / Introducción', linkTeoria: '' }
            ];

            let temasHTML = temas.map(tema => `
                <li>
                    <span>${sanitizeHTML(tema.nombreTema)}</span>
                    <button class="btn-select-topic" 
                            data-materia-id="${sanitizeHTML(materia.id)}" 
                            data-materia="${sanitizeHTML(materia.nombre)}" 
                            data-tema-id="${sanitizeHTML(tema.idTema || '')}"
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
                        <button type="button" class="btn-agregar-tema btn-secondary" data-materia-id="${sanitizeHTML(materia.id)}" data-materia="${sanitizeHTML(materia.nombre)}" style="margin-top:12px; font-size:0.85rem; width:100%;">＋ Agregar tema a esta materia</button>
                    </div>
                </article>
            `;
            dashboardGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Asignar eventos a los botones de selección
        document.querySelectorAll('.btn-select-topic').forEach(btn => {
            btn.addEventListener('click', abrirModalContexto);
        });
        document.querySelectorAll('.btn-agregar-tema').forEach(btn => {
            btn.addEventListener('click', abrirModalNuevoTema);
        });
    }

    // --- 4c. AGREGAR TEMA DE CÁTEDRA (Feedback #1) ---
    const modalNuevoTema = document.getElementById('modal-nuevo-tema');
    const inputNuevoTemaNombre = document.getElementById('nuevo-tema-nombre');
    const inputNuevoTemaDesc = document.getElementById('nuevo-tema-descripcion');
    const inputNuevoTemaLink = document.getElementById('nuevo-tema-link');
    const btnNuevoTemaGuardar = document.getElementById('btn-nuevo-tema-guardar');
    const btnNuevoTemaCancelar = document.getElementById('btn-nuevo-tema-cancelar');
    let materiaParaNuevoTema = null;

    function abrirModalNuevoTema(e) {
        const btn = e.target.closest ? e.target.closest('.btn-agregar-tema') : e.target;
        materiaParaNuevoTema = {
            id: btn.getAttribute('data-materia-id'),
            nombre: btn.getAttribute('data-materia')
        };
        inputNuevoTemaNombre.value = '';
        inputNuevoTemaDesc.value = '';
        inputNuevoTemaLink.value = '';
        modalNuevoTema.showModal();
    }

    if (btnNuevoTemaGuardar) {
        btnNuevoTemaGuardar.addEventListener('click', async () => {
            if (!materiaParaNuevoTema) return;
            const nombreTema = inputNuevoTemaNombre.value.trim();
            if (!nombreTema) {
                showNotification('warning', 'Escribí el nombre del tema.');
                return;
            }
            document.getElementById('loader-title').textContent = "Guardando tema...";
            document.getElementById('loader-title').nextElementSibling.textContent = "Agregando el tema a tu materia.";
            modalLoader.showModal();
            try {
                const res = await callBackend('agregarTema', {
                    token: sesionToken,
                    materiaId: materiaParaNuevoTema.id,
                    nombreTema: nombreTema,
                    descripcion: inputNuevoTemaDesc.value.trim(),
                    linkTeoria: inputNuevoTemaLink.value.trim()
                });
                modalLoader.close();
                if (res.success) {
                    modalNuevoTema.close();
                    showNotification('success', res.mensaje || '¡Tema agregado!');
                    // Refrescar dashboard
                    const dash = await callBackend('revalidarSesionConDashboard', { token: sesionToken });
                    if (dash.success) renderizarDashboard(dash.dashboard);
                } else {
                    showNotification('error', res.error || 'No se pudo agregar el tema.');
                }
            } catch (err) {
                modalLoader.close();
                showNotification('error', 'Error de conexión al guardar el tema.');
            }
        });
    }
    if (btnNuevoTemaCancelar) {
        btnNuevoTemaCancelar.addEventListener('click', () => {
            modalNuevoTema.close();
            materiaParaNuevoTema = null;
        });
    }

    // --- 5. MODAL DE CONTEXTO / CONFIGURADOR DE CLASE ---
    function abrirModalContexto(e) {
        const btn = e.target;
        temaSeleccionadoActual = {
            materiaId: btn.getAttribute('data-materia-id') || btn.getAttribute('data-materia'),
            materiaNombre: btn.getAttribute('data-materia'),
            temaId: btn.getAttribute('data-tema-id'),
            temaNombre: btn.getAttribute('data-tema'),
            linkTeoria: btn.getAttribute('data-link')
        };

        // Restaurar plantilla guardada del docente (si existe)
        restaurarPlantillaConfigurador();

        textareaContexto.value = ''; // Limpiar instrucciones libres previas
        modalContexto.showModal();
    }

    // --- 5a. PLANTILLAS DEL CONFIGURADOR (localStorage, múltiples con nombre) ---
    const PLANTILLA_KEY = 'utn_plantillas';

    function leerPlantillas() {
        try {
            const raw = localStorage.getItem(PLANTILLA_KEY);
            const obj = raw ? JSON.parse(raw) : {};
            return (obj && typeof obj === 'object') ? obj : {};
        } catch (e) {
            localStorage.removeItem(PLANTILLA_KEY);
            return {};
        }
    }

    function guardarPlantillas(obj) {
        try {
            localStorage.setItem(PLANTILLA_KEY, JSON.stringify(obj));
        } catch (e) {
            showNotification('error', 'No se pudo guardar la plantilla (almacenamiento lleno).');
        }
    }

    function refrescarSelectorPlantillas() {
        const select = document.getElementById('cfg-plantilla-select');
        if (!select) return;
        const plantillas = leerPlantillas();
        select.innerHTML = '<option value="">(Predeterminada)</option>';
        Object.keys(plantillas).sort().forEach(nombre => {
            const opt = document.createElement('option');
            opt.value = nombre;
            opt.textContent = nombre;
            select.appendChild(opt);
        });
    }

    // Sync con la BD (Feedback #4): carga las plantillas guardadas en la hoja 'Plantillas'
    async function sincronizarPlantillasDesdeBD() {
        try {
            const res = await callBackend('obtenerPlantillas', { token: sesionToken });
            if (res.success && res.plantillas) {
                guardarPlantillas(res.plantillas);
                refrescarSelectorPlantillas();
            }
        } catch (e) { /* si no hay BD, seguimos con localStorage */ }
    }

    async function guardarPlantillaEnBD(nombre, configuracion) {
        try {
            const res = await callBackend('guardarPlantilla', {
                token: sesionToken,
                nombre,
                configuracion
            });
            return res.success;
        } catch (e) {
            return false;
        }
    }

    async function borrarPlantillaEnBD(nombre) {
        try {
            const res = await callBackend('borrarPlantilla', { token: sesionToken, nombre });
            return res.success;
        } catch (e) {
            return false;
        }
    }

    function recolectarConfiguracion() {
        const momentos = [];
        const mapaMomentos = [
            ['mom-hook', 'hook'],
            ['mom-concepto', 'concepto_nucleo'],
            ['mom-caso', 'caso_aplicado'],
            ['mom-esquema', 'esquema_proceso'],
            ['mom-desafio', 'desafio_aula']
        ];
        mapaMomentos.forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el && el.checked) momentos.push(valor);
        });

        return {
            duracion: cfgDuracion.value,
            numSlides: parseInt(cfgSlides.value, 10) || 7,
            estilo: cfgEstilo.value,
            nivel: cfgNivel.value,
            ejemplos: cfgEjemplos.value,
            imagenes: cfgImagenes.value,
            urlTeoria: cfgUrlTeoria.value.trim(),
            temasAdicionales: cfgTemasExtra.value.split(';').map(s => s.trim()).filter(Boolean),
            momentos: momentos,
            instrucciones: textareaContexto.value.trim()
        };
    }

    function aplicarConfiguracionEnForm(cfg) {
        if (!cfg || typeof cfg !== 'object') return;
        cfgDuracion.value = cfg.duracion || '';
        cfgSlides.value = String(cfg.numSlides || 7);
        cfgSlidesVal.textContent = String(cfg.numSlides || 7);
        cfgEstilo.value = cfg.estilo || '';
        cfgNivel.value = cfg.nivel || '';
        cfgEjemplos.value = cfg.ejemplos || '';
        cfgImagenes.value = cfg.imagenes || '';
        cfgUrlTeoria.value = cfg.urlTeoria || '';
        cfgTemasExtra.value = (cfg.temasAdicionales || []).join('; ');
        textareaContexto.value = cfg.instrucciones || '';

        const mapaMomentos = ['hook', 'concepto_nucleo', 'caso_aplicado', 'esquema_proceso', 'desafio_aula'];
        mapaMomentos.forEach(m => {
            const el = document.getElementById('mom-' + m);
            if (el) el.checked = !cfg.momentos || cfg.momentos.includes(m);
        });
    }

    function restaurarPlantillaConfigurador() {
        refrescarSelectorPlantillas();
        const inputNombre = document.getElementById('cfg-plantilla-nombre');
        if (inputNombre) inputNombre.value = '';
        // Feedback #4: las plantillas viven en la cuenta del docente (BD)
        sincronizarPlantillasDesdeBD();
    }

    const inputPlantillaNombre = document.getElementById('cfg-plantilla-nombre');
    const selectPlantilla = document.getElementById('cfg-plantilla-select');

    if (btnTemplateSave) {
        btnTemplateSave.addEventListener('click', async () => {
            const nombre = (inputPlantillaNombre.value || '').trim();
            if (!nombre) {
                showNotification('warning', 'Escribí un nombre para tu plantilla.');
                return;
            }
            const plantillas = leerPlantillas();
            plantillas[nombre] = recolectarConfiguracion();
            guardarPlantillas(plantillas);
            refrescarSelectorPlantillas();
            const enBD = await guardarPlantillaEnBD(nombre, plantillas[nombre]);
            showNotification('success', enBD ? `Plantilla "${nombre}" guardada en tu cuenta.` : `Plantilla "${nombre}" guardada localmente (sin BD).`);
        });
    }
    if (btnTemplateLoad) {
        btnTemplateLoad.addEventListener('click', async () => {
            const nombre = selectPlantilla.value;
            if (!nombre) {
                showNotification('warning', 'Elegí una plantilla para cargar.');
                return;
            }
            const plantillas = leerPlantillas();
            if (plantillas[nombre]) {
                aplicarConfiguracionEnForm(plantillas[nombre]);
                showNotification('success', `Plantilla "${nombre}" cargada.`);
            } else {
                // Reintento desde BD antes de dar error
                await sincronizarPlantillasDesdeBD();
                const plantillas2 = leerPlantillas();
                if (plantillas2[nombre]) {
                    aplicarConfiguracionEnForm(plantillas2[nombre]);
                    showNotification('success', `Plantilla "${nombre}" cargada desde tu cuenta.`);
                } else {
                    showNotification('error', 'Esa plantilla ya no existe.');
                    refrescarSelectorPlantillas();
                }
            }
        });
    }
    if (btnTemplateClear) {
        btnTemplateClear.addEventListener('click', async () => {
            const nombre = selectPlantilla.value;
            if (!nombre) {
                showNotification('warning', 'Elegí una plantilla para borrar.');
                return;
            }
            const plantillas = leerPlantillas();
            delete plantillas[nombre];
            guardarPlantillas(plantillas);
            await borrarPlantillaEnBD(nombre);
            refrescarSelectorPlantillas();
            showNotification('success', `Plantilla "${nombre}" borrada.`);
        });
    }

    // Actualizar el valor visual del slider de diapositivas
    if (cfgSlides && cfgSlidesVal) {
        cfgSlides.addEventListener('input', () => {
            cfgSlidesVal.textContent = cfgSlides.value;
        });
    }

    btnContextoConfirm.addEventListener('click', () => {
        if (!temaSeleccionadoActual) return;
        // Recolectamos la configuración completa del configurador
        const configuracion = recolectarConfiguracion();
        // Guardamos los IDs relacionales para usarlos en la exportación
        contextoClaseActual = {
            materiaId: temaSeleccionadoActual.materiaId,
            temaId: temaSeleccionadoActual.temaId
        };
        modalContexto.close();

        ejecutarGeneracionIA(
            temaSeleccionadoActual.materiaNombre,
            temaSeleccionadoActual.temaNombre,
            configuracion
        );
    });

    btnContextoCancel.addEventListener('click', () => {
        modalContexto.close();
        temaSeleccionadoActual = null;
    });

    // --- 5c. REFORMULAR UNA DIAPOSITIVA (Espiral 2) ---
    const modalReformular = document.getElementById('modal-reformular');
    const textareaReformular = document.getElementById('textarea-reformular');
    const btnReformularConfirm = document.getElementById('btn-reformular-confirm');
    const btnReformularCancel = document.getElementById('btn-reformular-cancel');
    let slideIndexEnEdicion = null;

    function abrirModalReformular(e) {
        const btn = e.target.closest ? e.target.closest('.btn-reformular-slide') : e.target;
        if (!btn) return;
        slideIndexEnEdicion = parseInt(btn.getAttribute('data-slide-index'), 10);
        textareaReformular.value = '';
        modalReformular.showModal();
    }

    if (btnReformularConfirm) {
        btnReformularConfirm.addEventListener('click', async () => {
            if (slideIndexEnEdicion === null || !claseGeneradaActual || !claseGeneradaActual.slides) return;
            const instruccion = textareaReformular.value.trim();
            if (!instruccion) {
                showNotification('warning', 'Escribí qué querés cambiar de la diapositiva.');
                return;
            }

            const slideActual = claseGeneradaActual.slides[slideIndexEnEdicion];
            modalReformular.close();

            document.getElementById('loader-title').textContent = "Reformulando diapositiva...";
            document.getElementById('loader-title').nextElementSibling.textContent = "La IA está ajustando esa diapositiva puntual. No se tocan las demás.";
            modalLoader.showModal();

            try {
                // 1. Intentar Vercel Serverless
                let nuevaSlide = null;
                try {
                    const respGemini = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            modo: 'regenerarSlide',
                            materia: breadcrumbSubject.textContent,
                            tema: breadcrumbTopic.textContent,
                            slideIndex: slideIndexEnEdicion,
                            slideActual,
                            instruccion
                        })
                    });
                    if (respGemini.ok) {
                        const json = await respGemini.json();
                        if (json && json.success) nuevaSlide = json.slide;
                    }
                } catch (errLocal) {
                    console.warn("Fallo /api/gemini en regenerarSlide. Fallback a GAS...", errLocal);
                }

                // 2. Fallback a Google Apps Script
                if (!nuevaSlide) {
                    const resGAS = await callBackend('regenerarSlideIA', {
                        token: sesionToken,
                        materia: breadcrumbSubject.textContent,
                        tema: breadcrumbTopic.textContent,
                        slideIndex: slideIndexEnEdicion,
                        slideActual,
                        instruccion
                    });
                    if (resGAS && resGAS.success) nuevaSlide = resGAS.slide;
                }

                modalLoader.close();

                if (nuevaSlide) {
                    // Reemplazo quirúrgico: solo esa slide cambia
                    claseGeneradaActual.slides[slideIndexEnEdicion] = nuevaSlide;
                    renderizarSlidesGrid(claseGeneradaActual.slides);
                    showNotification('success', '¡Diapositiva reformulada! El resto quedó igual.');
                } else {
                    showNotification('error', 'No se pudo reformular la diapositiva. Intentá de nuevo.');
                }
            } catch (error) {
                modalLoader.close();
                showNotification('error', 'Error de conexión al reformular la diapositiva.');
                console.error('regenerarSlide failure:', error);
            }
        });
    }

    if (btnReformularCancel) {
        btnReformularCancel.addEventListener('click', () => {
            modalReformular.close();
            slideIndexEnEdicion = null;
        });
    }

    // --- 5d. EDITAR UNA DIAPOSITIVA MANUALMENTE (Espiral 3) ---
    const modalEditar = document.getElementById('modal-editar');
    const editarTitulo = document.getElementById('editar-titulo');
    const editarSubtitulo = document.getElementById('editar-subtitulo');
    const editarContenido = document.getElementById('editar-contenido');
    const editarNotas = document.getElementById('editar-notas');
    const btnEditarGuardar = document.getElementById('btn-editar-guardar');
    const btnEditarCancelar = document.getElementById('btn-editar-cancelar');
    let slideIndexEnEdicionManual = null;

    function abrirModalEditar(e) {
        const btn = e.target.closest ? e.target.closest('.btn-editar-slide') : e.target;
        if (!btn) return;
        slideIndexEnEdicionManual = parseInt(btn.getAttribute('data-slide-index'), 10);
        if (!claseGeneradaActual || !claseGeneradaActual.slides || !claseGeneradaActual.slides[slideIndexEnEdicionManual]) return;

        const slide = claseGeneradaActual.slides[slideIndexEnEdicionManual];
        editarTitulo.value = slide.titulo || '';
        editarSubtitulo.value = slide.subtitulo || '';
        editarContenido.value = slide.contenido || '';
        editarNotas.value = slide.notasOrador || '';
        modalEditar.showModal();
    }

    if (btnEditarGuardar) {
        btnEditarGuardar.addEventListener('click', () => {
            if (slideIndexEnEdicionManual === null) return;
            const slide = claseGeneradaActual.slides[slideIndexEnEdicionManual];
            // Sanitización server-side la hace GAS al exportar; acá validamos longitud
            slide.titulo = String(editarTitulo.value || '').slice(0, 120);
            slide.subtitulo = String(editarSubtitulo.value || '').slice(0, 200);
            slide.contenido = String(editarContenido.value || '').slice(0, 2000);
            slide.notasOrador = String(editarNotas.value || '').slice(0, 2000);

            modalEditar.close();
            renderizarSlidesGrid(claseGeneradaActual.slides);
            showNotification('success', '¡Cambios guardados! Se exportarán con tu presentación.');
        });
    }

    if (btnEditarCancelar) {
        btnEditarCancelar.addEventListener('click', () => {
            modalEditar.close();
            slideIndexEnEdicionManual = null;
        });
    }

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
                    <h3 style="font-size: 1.1rem; color: var(--utn-green-dark); margin-bottom: 10px; border-bottom: 2px solid var(--utn-green-primary); padding-bottom: 4px;">${sanitizeHTML(nivel)}</h3>
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
    // Renderiza secciones A/B/C/D del generador (reutilizable para reabrir clases)
    function renderizarContenidoGenerado(respuesta) {
        if (!respuesta) return;
        const codeBlocksContainer = document.querySelector('#view-generator .code-blocks');
        if (codeBlocksContainer && respuesta.busqueda) {
            codeBlocksContainer.innerHTML = respuesta.busqueda.map((idea, index) => `
                <pre><code><span class="prompt-label">Idea de enfoque ${index + 1}:</span>&quot;${sanitizeHTML(idea)}&quot;</code></pre>
            `).join('');
        }

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
                        <td data-label="Momento"><strong>${sanitizeHTML(item.fase)}</strong></td>
                        <td data-label="Duración">${sanitizeHTML(item.duracion)}</td>
                        <td data-label="¿Qué hacemos en clase?">${sanitizeHTML(item.actividad)}</td>
                    </tr>
                `).join('');
            }
        }

        renderizarSlidesGrid(respuesta.slides);

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
    }

    // Renderiza las tarjetas de diapositivas (reutilizable tras regenerar una slide)
    function renderizarSlidesGrid(slides) {
        const slidesGrid = document.querySelector('#view-generator .slides-grid');
        if (!slidesGrid || !slides || slides.length === 0) return;

        slidesGrid.innerHTML = slides.map((slide, index) => {
            let contentHTML = '';
            let categoriaBadge = slide.categoria ? `<span class="badge" style="background: rgba(6, 162, 138, 0.12); color: var(--utn-green-dark); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px; display: inline-block;">${sanitizeHTML(slide.categoria)}</span>` : '';

            if (slide.tipo === 'portada') {
                contentHTML = `
                    <h4>Portada Institucional UTN FRD</h4>
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
                <div style="margin-top: 14px; padding: 12px 14px; background: var(--utn-green-surface); border-left: 3px solid var(--utn-green-primary); border-radius: 6px;">
                    <strong style="font-size: 0.82rem; color: var(--utn-green-dark); display: block; margin-bottom: 4px;">🎙️ GUÍA DOCENTE (NOTAS DE AULA):</strong>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; font-style: italic; line-height: 1.4;">${sanitizeHTML(slide.notasOrador)}</p>
                </div>
            ` : '';

            // Botones de edición y reformulación (toda slide editable; reformular solo contenido)
            const btnEditar = `
                <button type="button" class="btn-editar-slide btn-secondary" data-slide-index="${index}" style="margin-top: 10px; font-size: 0.8rem; padding: 6px 12px;">
                    ✏️ Editar contenido
                </button>
            `;
            const btnReformular = slide.tipo !== 'portada' ? `
                <button type="button" class="btn-reformular-slide btn-secondary" data-slide-index="${index}" style="margin-top: 10px; font-size: 0.8rem; padding: 6px 12px;">
                    🔄 Reformular esta diapositiva
                </button>
            ` : '';

            return `
                <article class="slide-card" style="display: flex; flex-direction: column; justify-content: space-between; border-radius: 14px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                    <div>
                        <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div>
                                ${categoriaBadge}
                                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--utn-green-dark); margin: 0;">Diap. ${index + 1}: ${sanitizeHTML(slide.titulo)}</h3>
                            </div>
                        </header>
                        <div class="slide-content">
                            ${contentHTML}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${btnEditar}
                        ${btnReformular}
                    </div>
                    ${notasHTML}
                </article>
            `;
        }).join('');

        // Asignar eventos de edición y reformulación
        document.querySelectorAll('.btn-editar-slide').forEach(btn => {
            btn.addEventListener('click', abrirModalEditar);
        });
        document.querySelectorAll('.btn-reformular-slide').forEach(btn => {
            btn.addEventListener('click', abrirModalReformular);
        });
    }

    async function ejecutarGeneracionIA(materiaNombre, temaNombre, configuracion) {
        // Configuración opcional del configurador (Sprint B)
        configuracion = (configuracion && typeof configuracion === 'object') ? configuracion : {};
        configuracionGeneracion = configuracion; // se reutiliza al exportar (estilo visual)
        const contextoDinamico = configuracion.instrucciones || '';
        // Si el docente no overrideó la URL de teoría, usamos la del temario
        const linkTeoria = configuracion.urlTeoria || temaSeleccionadoActual.linkTeoria;

        // Loader muy cálido y no técnico (Sprint C: etapas con feedback)
        const setLoader = (titulo, detalle) => {
            document.getElementById('loader-title').textContent = titulo;
            document.getElementById('loader-title').nextElementSibling.textContent = detalle;
        };
        setLoader("Preparando tus materiales...", "Armando el plan de clase y estructurando tus diapositivas sugeridas.");
        modalLoader.showModal();

        try {
            // 1. OBTENER CONTEXTO (RAG) DESDE EL BACKEND (Google Apps Script)
            setLoader("Buscando el material de tu cátedra...", "Estamos leyendo tu apunte oficial de teoría.");
            const respuestaContexto = await callBackend('obtenerContextoTema', {
                token: sesionToken,
                linkTeoria
            });

            if (!respuestaContexto || !respuestaContexto.success) {
                throw new Error(respuestaContexto?.error || "Error al obtener la teoría oficial de la materia.");
            }

            // 2. GENERAR CLASE IA (Estrategia Híbrida: Vercel Serverless con fallback automático a GAS)
            let respuesta = null;

            setLoader("Generando tu clase con IA...", "Esto puede tardar unos segundos. Estamos armando el plan y las diapositivas.");
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
                        contextoDinamico,
                        configuracion
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
                    contextoDinamico,
                    configuracion
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

                renderizarContenidoGenerado(respuesta);
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
                materiaId: (contextoClaseActual && contextoClaseActual.materiaId) || breadcrumbSubject.textContent,
                materiaNombre: breadcrumbSubject.textContent,
                temaNombre: breadcrumbTopic.textContent,
                configuracion: configuracionGeneracion,
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
                    let notasPDF = s.notasOrador ? `<p style="margin:6px 0 0;font-size:12px;color:#035a4d;font-style:italic;"><strong>Guía docente:</strong> ${sanitizeHTML(s.notasOrador)}</p>` : '';
                    let categoriaPDF = s.categoria ? `<span style="font-size:11px;color:#666;text-transform:uppercase;">[${sanitizeHTML(s.categoria)}]</span> ` : '';
                    return `
                        <div style="margin-bottom:16px; padding:12px; border-left:4px solid #06a28a; background:#f0f8f6; border-radius: 4px;">
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
                <div style="text-align:center;border-bottom:3px solid #06a28a;padding-bottom:16px;margin-bottom:24px;">
                    <img src="UTN.jpg" alt="UTN" style="width:52px;height:52px;border-radius:10px;object-fit:cover;margin-bottom:8px;display:inline-block;">
                    <h1 style="font-size:22px;color:#06a28a;margin:0;">UTN Facultad Regional Delta</h1>
                    <h2 style="font-size:16px;color:#035a4d;margin:4px 0 0;">Guía de Planificación Didáctica</h2>
                    <p style="font-size:13px;color:#666;margin:4px 0 0;">${sanitizeHTML(materia)} &mdash; ${sanitizeHTML(tema)}</p>
                </div>

                <h3 style="color:#06a28a;">Plan de Clase (${sanitizeHTML(clase.plan ? clase.plan.duracion : '')})</h3>
                <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
                    <thead><tr style="background:#06a28a;color:#fff;">
                        <th style="padding:8px;text-align:left;">Momento</th>
                        <th style="padding:8px;text-align:left;">Duración</th>
                        <th style="padding:8px;text-align:left;">Actividad</th>
                    </tr></thead>
                    <tbody>${estructuraHTML}</tbody>
                </table>

                <h3 style="color:#06a28a;">Estructura de Diapositivas</h3>
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

    // --- 8b. ACCESIBILIDAD: enfoque inicial en los dialogs (Sprint C) ---
    // Al abrir cada dialog, movemos el foco al primer campo/acción útil.
    const primerCampoDe = (id) => {
        const modal = document.getElementById(id);
        if (!modal) return;
        const modalOriginalShow = modal.showModal;
        modal.showModal = function () {
            modalOriginalShow.call(this);
            const focusable = modal.querySelector('input, select, textarea, button:not([hidden])');
            if (focusable) setTimeout(() => focusable.focus(), 50);
        };
    };
    // Devolvemos el foco al botón que abrió el modal al cerrarse (los <dialog> nativos
    // ya lo hacen automáticamente, esto refuerza para el caso de select/textarea).
    ['modal-contexto', 'modal-reformular', 'modal-editar', 'modal-reclamar'].forEach(primerCampoDe);

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
