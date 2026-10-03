---
name: utn-frontend-ux50
description: "Use when designing, implementing, reviewing, or improving responsive frontend UX in UTNContenidos (Next.js/React Beta or Vanilla JS Alpha), including Apple/Google-inspired visual systems, CSS, motion, accessibility, and mobile layouts."
---

# UTNContenidos — Frontend, React y UX Docente

## Mision

Construir interfaces institucionales claras, actuales y sobrias para docentes de UTN FRD, con especial cuidado para personas de 50+ años. Tomar los principios de claridad de Apple, la adaptabilidad de Android y la jerarquia de Material como referencias; no imitar pantallas, marcas, iconos ni componentes propietarios. Usar glassmorphism como material puntual, nunca como excusa para reducir contraste o convertir toda la interfaz en vidrio.

La calidad visual no justifica romper el stack, la accesibilidad, el costo objetivo de $0 ni los flujos existentes. No prometer una mejora "del 100%": definir cambios observables y validarlos.

## 1. Detectar el stack antes de editar

Este repositorio tiene dos frontends. Identificar la ruta solicitada y seguir solamente sus convenciones:

| Superficie | Stack y archivos | Convencion |
|---|---|---|
| Beta actual | Next.js App Router, React, TypeScript; `app/`, `app/globals.css` | Server Components por defecto; interaccion cliente aislada |
| Alpha heredada | Vanilla JS SPA; `prototype-alpha/index.html`, `script.js`, `style.css` | Sin frameworks; router y helpers existentes |

- No migrar Alpha a React ni introducir React en ella.
- No copiar patrones Alpha dentro de Beta si contradicen el App Router.
- No agregar dependencias, frameworks CSS o librerias de animacion sin necesidad demostrable y compatibilidad con el costo $0.
- Leer el componente, estilos y flujo vecinos antes de decidir una abstraccion. Reutilizar tokens, componentes y utilidades existentes.

## 2. Direccion visual

Usar `prototype-alpha/style.css` como referencia de identidad y tokens, no como hoja para copiar indiscriminadamente. Su paleta institucional incluye verde UTN (`#06a28a`, `#047a68`), superficies claras, texto oscuro, estados semanticos, foco visible y radios/sombras definidos. Beta conserva su propio `app/globals.css`; extender sus tokens en lugar de duplicar resets o crear un segundo sistema paralelo.

- Mantener una jerarquia tipografica legible y consistente. Preferir las familias ya cargadas por el proyecto; evitar sumar fuentes o dependencias por decoracion.
- Usar superficies translucidas solo donde aporten profundidad. Asegurar fondo suficientemente estable, borde visible y fallback cuando `backdrop-filter` no exista.
- Reservar sombras, gradientes, bordes y radios para comunicar jerarquia. Evitar tarjetas anidadas y convertir cada seccion en una tarjeta.
- Conservar la marca UTN y el tono institucional; no hacer que el parecido a iOS o Android desplace la identidad del producto.
- Mantener texto en espanol argentino, trato de "vos" y rotulos comprensibles para docentes; no usar adornos, etiquetas tecnicas o mayusculas sostenidas sin funcion.

## 3. Arquitectura React / Next.js

Aplicar estas reglas solo a Beta u otra superficie React ya existente:

- En App Router, dejar paginas y layouts como Server Components por defecto. Agregar `'use client'` solo cuando el subarbol necesite estado, eventos, efectos o APIs del navegador; mantener el limite cliente lo mas abajo posible.
- Separar lectura de datos, mutaciones y presentacion segun los patrones existentes (`app/actions.ts`, `app/datos.ts`, route handlers y componentes). No mover logica de servidor al navegador ni duplicar llamadas en cliente y servidor.
- Preferir componentes con una responsabilidad y props tipadas. Evitar `any`, estado derivable duplicado, componentes gigantes y fragmentacion prematura en componentes de una sola linea.
- Mantener estado local cerca de quien lo usa. Usar estado compartido solo cuando haya mas de un consumidor real; efectos solo para sincronizar con sistemas externos.
- No agregar `useMemo` o `useCallback` por defecto. Elegir `startTransition`, `useDeferredValue` o `useEffectEvent` solo cuando resuelvan un problema concreto, esten disponibles en la version instalada y encajen con las convenciones del proyecto.
- No convertir una pagina completa en cliente para habilitar una animacion. Preferir CSS y respetar la frontera Server/Client.
- Para estilos, seguir `app/globals.css` salvo que el repo ya haya adoptado otro patron. No introducir CSS Modules, Tailwind o una libreria UI de forma aislada.

## 4. Reglas UX no negociables

- Letra comoda y escalable por zoom del navegador; contraste suficiente en texto, controles, estados y superficies translucidas.
- Controles tactiles de al menos 44 x 44 px, con etiqueta visible o nombre accesible; no depender solo del color, hover o icono.
- Mantener el camino a "Preparar Clase" en un maximo de 2 acciones desde el dashboard cuando el flujo existente lo permita.
- Comunicar carga, exito, error, vacio y deshabilitado con feedback inmediato. Usar `showNotification(type, msg)` y loaders existentes en Alpha; en React, reutilizar el mecanismo de feedback ya presente.
- Formularios con `label`, instrucciones y errores asociados; no borrar entradas ante un error recuperable.
- Soportar teclado, foco visible, orden de tabulacion logico y lectores de pantalla. Preferir elementos HTML semanticos antes que controles custom.

## 5. Responsive y media queries

Mobile-first. Adaptar el contenido al espacio real y no a marcas de dispositivos; usar breakpoints existentes antes de inventar otros. En Alpha ya existen cortes en 400, 640, 768, 1024 y 1280 px.

- Revisar como minimo 320/360 px, 390 px, 640/768 px, 1024 px y escritorio ancho. Comprobar retrato y apaisado cuando el contenido lo requiera.
- Usar Grid/Flex con `minmax()`, `min-width: 0`, `max-width` y dimensiones estables para evitar desbordes; no fijar anchos que rompan textos, tablas, dialogs o botones.
- Aplicar media queries para cambios reales de composicion: navegacion, columnas, acciones, tablas, modales, espaciado y densidad. Evitar reglas duplicadas o breakpoints para cada dispositivo.
- Usar container queries solo cuando un componente deba responder a su contenedor y el soporte del proyecto lo permita.
- No escalar tipografia con el ancho de viewport. Usar una escala legible y fluida solo para espaciado/layout cuando ayude; respetar zoom y preferencias del usuario.
- Comprobar que los botones no se achiquen al envolver, el texto no se corte, no haya scroll horizontal accidental y los dialogs quepan con teclado abierto en movil.

## 6. Movimiento y estados

- Animaciones suaves, breves y funcionales: priorizar `transform` y `opacity`; evitar animar propiedades que fuerzan layout, bucles decorativos y movimiento permanente.
- Reservar movimiento de entrada para un momento significativo; usar transiciones de accion para abrir, cerrar, expandir, confirmar o mostrar progreso.
- Definir estados hover, focus-visible, active, disabled, loading, error y success de manera coherente. No comunicar una accion solo con movimiento.
- Respetar `prefers-reduced-motion: reduce`: reducir o retirar animaciones no esenciales sin ocultar feedback funcional.
- Evitar agregar una libreria de motion si CSS resuelve el caso y el proyecto no la usa.

## 7. Seguridad y patrones existentes

Alpha:
- Renderizar datos externos con `sanitizeHTML(text)` y URLs con `sanitizeURL(url)`; nunca interpolar datos no confiables en HTML.
- Guardar el token de sesion en `sessionStorage`, nunca en `localStorage`.
- Pasar IDs relacionales mediante `data-*` (`data-materia-id`, `data-tema-id`), no nombres visibles.
- Router: `navigateTo('view-x')`; vistas como `<section class="spa-view" hidden>`.
- Backend: `callBackend(action, data)` con POST JSON y `text/plain;charset=utf-8`.
- IA: intentar `fetch('/api/gemini')` y mantener el fallback existente a `callBackend('generarClaseIA', ...)`.
- Dialogos: usar `<dialog>` con `.showModal()` y `.close()`; no reemplazar modales nativos sin motivo.
- Plantillas Alpha existentes: respetar la clave `localStorage.utn_template_clase`; no guardar alli tokens.

Beta:
- Mantener secretos, credenciales y acceso privilegiado en servidor. Validar datos en el servidor aunque exista validacion de formulario.
- No usar `dangerouslySetInnerHTML` con contenido no confiable; reutilizar sanitizacion existente para contenido HTML generado.
- Respetar las acciones, route handlers, autenticacion y politicas de Supabase existentes.

## 8. Flujo de trabajo y validacion

1. Identificar Alpha o Beta, leer el componente/estilo cercano y comprobar si hay instrucciones locales.
2. Formular una hipotesis concreta del cambio y el chequeo mas barato que pueda refutarla.
3. Hacer el cambio minimo, conservar APIs y comportamiento no relacionados.
4. Ejecutar primero una verificacion enfocada: diagnosticos, test del flujo tocado, lint o build segun lo que exista.
5. Para cambios visuales, revisar capturas en movil y escritorio cuando haya navegador disponible; comprobar desbordes, contraste, foco y estados interactivos.
6. Informar que se cambio, que validacion corrio y que queda sin verificar. No afirmar que se probo algo que no se ejecuto.

## Criterio de terminado

La interfaz conserva la identidad UTN y la arquitectura del stack; funciona con teclado y touch; se adapta a movil, tablet y escritorio; respeta movimiento reducido; no expone datos inseguros; y tiene feedback legible en estados de carga, error, exito y vacio.

## Reglas de UX innegociables (docente 50+)
- Letra grande (`clamp()`), contraste alto, botones ≥ 44px.
- Máximo 2 clics hasta "Preparar Clase".
- Feedback visual inmediato: `showNotification(type, msg)` + loaders por etapa.
- Idioma: español argentino, trato de "vos".
- Sin manual: la app debe autoexplicarse (stepper didáctico).

## Seguridad frontend (siempre)
- Render de datos externos: `sanitizeHTML(text)`.
- Hrefs de datos: `sanitizeURL(url)` (solo http/https).
- `sessionStorage` para token (nunca localStorage).
- `data-*` attributes para pasar IDs relacionales (ej: `data-materia-id`, `data-tema-id`).

## Patrones existentes
- Router: `navigateTo('view-x')` con vistas `<section class="spa-view" hidden>`.
- `callBackend(action, data)` → POST JSON a GAS con header `text/plain;charset=utf-8`.
- IA: intentar `fetch('/api/gemini')` → si falla, `callBackend('generarClaseIA', ...)`.
- Dialogs: `<dialog>` con `.showModal()`/`.close()`.
- Templates de usuario: `localStorage` con clave `utn_template_clase`.

## Vistas y sus IDs
- `view-login` · `view-dashboard` · `view-generator` · `view-historial`
- Modales: `modal-loader`, `modal-success`, `modal-contexto` (Configurador), `modal-reclamar`