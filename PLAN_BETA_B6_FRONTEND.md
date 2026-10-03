# PLAN BETA B6 — Rediseño Frontend "Híbrido Android 17 + iOS 27"

> **Brief del diseñador senior:** reconstruir la UI de la Beta mezclando lo mejor
> de los dos mundos — **Material Design 4** (Android 17: elevación, estados
> táctiles, ripple, tipografía jerárquica) y **Glassmorphism** (iOS 27: paneles
> translúcidos, blur satinado, microinteracciones elásticas) — sobre el sistema
> de diseño UTN de la Alpha (`--utn-*` verdes), con rendimiento máximo en
> dispositivos de gama baja.
>
> **Regla de oro:** el glass nunca debe costar FPS. Todo efecto tiene fallback
> sólido (sin `backdrop-filter` en gama baja → fondos sólidos opacos).

---

## 1. Fundamentos de diseño

### Fusión de estilos (qué se toma de cada mundo)
| Mundo | Se toma |
|-------|---------|
| **Android 17 / Material 4** | Elevación por capas (`--elev-*`), estados de presión/ripple, botones táctiles ≥48px, tipografía jerárquica (display/headline/title/body), focus states con anillo |
| **iOS 27 / Glassmorphism** | Paneles `glass` translúcidos con blur satinado (solo en pantallas capaces), botones píldora, microinteracciones elásticas (`cubic-bezier(0.16,1,0.3,1)`), esquinas grandes |
| **Alpha UTN (herencia)** | Paleta verde `--utn-*`, branding institucional, stepper didáctico, toasts, modales, "vos" argentino |

### Tokens de diseño (design system unificado)
```css
:root {
  /* Superficies */
  --surface-0: #ffffff;            /* sólida (fallback gama baja) */
  --surface-glass: rgba(255,255,255,.72);
  --surface-glass-strong: rgba(255,255,255,.88);
  --blur-glass: 24px;              /* se desactiva en low-end */

  /* Elevación Material 4 */
  --elev-1: 0 1px 2px rgba(15,31,28,.05), 0 2px 6px rgba(15,31,28,.04);
  --elev-2: 0 2px 8px rgba(15,31,28,.08), 0 6px 20px rgba(15,31,28,.06);
  --elev-3: 0 8px 24px rgba(15,31,28,.10), 0 16px 48px rgba(15,31,28,.08);

  /* Tipografía (jerarquía) */
  --font-display: 'Montserrat', system-ui;  /* títulos de portada */
  --font-ui: 'Inter', system-ui;            /* interfaz */
  --step-0: .875rem; --step-1: 1rem; --step-2: 1.25rem; --step-3: 1.5rem;
  --step-4: 2rem;  --step-5: 2.75rem;

  /* Acento UTN (herencia Alpha) */
  --utn-primary: #06a28a; --utn-dark: #047a68; --utn-ink: #0f1f1c;
}
```

### Accesibilidad 50+ (no negociable)
- Texto base ≥1rem, contraste ≥4.5:1, targets ≥48×48px.
- `prefers-reduced-motion` desactiva animaciones.
- `prefers-contrast` → fondos sólidos (sin glass).

---

## 2. Arquitectura de componentes (React)

```
app/
├── components/
│   ├── ui/                      # primitivos reutilizables
│   │   ├── GlassCard.tsx        # panel glass con fallback sólido
│   │   ├── MaterialButton.tsx   # botón con ripple + estados (píldora)
│   │   ├── Chip.tsx, Badge.tsx, Stepper.tsx, Toast.tsx
│   │   ├── InputField.tsx       # campo Material con label flotante
│   │   └── Skeleton.tsx         # loaders esqueletales (no spinners)
│   ├── layout/
│   │   ├── AppShell.tsx         # header flotante glass + nav
│   │   └── FooterInstitucional.tsx
│   ├── dashboard/
│   │   ├── MateriaCard.tsx      # tarjeta elevada Material + badge
│   │   └── TemaRow.tsx          # fila táctil con "Preparar Clase"
│   ├── generador/
│   │   ├── ConfigPanel.tsx      # configurador iOS-27 (pills/chips)
│   │   └── DeckPreview.tsx      # iframe Reveal + barra de acciones
│   └── historial/
│       └── HistorialItem.tsx    # distintivos estado + carpetas
└── globals.css                  # tokens + utilidades
```

---

## 3. Estrategia de rendimiento (gama baja)

| Técnica | Detalle |
|---------|---------|
| **CSS nativo, cero frameworks** | Sin Tailwind/Bootstrap: 1 `globals.css` con tokens (menos JS, menos bytes) |
| **Detector low-end** | `@supports not (backdrop-filter: blur(1px))` → `--surface-glass` se vuelve opaca; CSS vars deciden sin JS |
| **Fuentes del sistema primero** | `system-ui` en producción; Inter/Montserrat solo si ya están cacheadas (Google Fonts con `display=swap`) |
| **Cero librerías de animación** | Microinteracciones solo CSS (`transform`/`opacity`, nunca `width/height` animados) |
| **Reveal solo cuando hace falta** | El deck se genera en `iframe` on-demand (no en el bundle inicial) |
| **Lazy components** | `next/dynamic` para `DeckPreview` y `ConfigPanel` (solo se cargan en /generar) |
| **Imágenes** | Sin imágenes pesadas; iconos en SVG inline; logos comprimidos |
| **Objetivo** | Lighthouse Performance ≥90 en gama baja simulada (CPU 4x throttle) |

---

## 4. Pantallas a rediseñar (sprints de trabajo)

| # | Pantalla | Fusión aplicada |
|---|----------|-----------------|
| 1 | **Login** | Panel glass centrado (fallback sólido), logo con glow suave, inputs Material con label flotante, botón píldora con ripple |
| 2 | **Dashboard** | Header glass flotante + grid de `MateriaCard` con elevación Material, badges de nivel, stepper didáctico heredado de Alpha, filas táctiles |
| 3 | **Configurador (/generar)** | Pills iOS 27 (selects dentro de píldoras), chips de momentos, slider con thumb grande, texto de progreso streaming estilo chat |
| 4 | **Resultado/Deck** | Vista previa iframe con marco glass, botones descargar/PDF/pantalla completa, notas de orador plegables |
| 5 | **Historial** | Tarjetas con distintivos de estado (reciente/usado/archivado), carpetas visuales, botón reabrir |
| 6 | **Toasts y modales** | Toasts glass con borde de acento por tipo, dialogs con backdrop blur (fallback oscuro) |

---

## 5. Microinteracciones (el "wow" con 0 costo)

- **Ripple Material** en botones (pseudo-elemento `::after`, escala al presionar).
- **Press scale** iOS (`transform: scale(.97)` al tocar tarjetas).
- **Entrada de vistas** — fade + slide-up 12px (ya en Alpha, conservado).
- **Stepper animado** — la pastilla activa hace un "saltito" elástico.
- **Skeleton loaders** en dashboard/historial (en vez de spinner — se siente más rápido).
- **Sticky header que se "compacta"** al hacer scroll (blur mayor).

---

## 6. Plan de ejecución (fases)

| Fase | Entregable | DoD |
|------|-----------|-----|
| **F6-1 Tokens + base** | `globals.css` reescrito (tokens, glass con fallback, elevación, tipografía) | Build OK, sin regresiones |
| **F6-2 UI primitives** | `components/ui/*` (GlassCard, MaterialButton, Input, Chip, Stepper, Skeleton) | Componentes usados en ≥2 pantallas |
| **F6-3 Login + Dashboard** | Pantallas 1 y 2 con la fusión | Login root/root E2E OK |
| **F6-4 Generador + Deck** | Pantallas 3 y 4, lazy-load | Flujo generar→preview→descarga OK |
| **F6-5 Historial + Modales** | Pantallas 5 y 6 | Historial con distintivos OK |
| **F6-6 QA rendimiento** | Lighthouse gama baja + auditoría UX 50+ + `utn-security-audit` | Perf ≥90 · QA humano aprobado |

---

## 7. Recursos de inspiración (equipo de diseño)
- Material Design 4 / Android 17: elevation, states, focus rings.
- iOS 26/27: glass panels, blur, elastic curves, pill buttons.
- Alpha UTN: paleta, glassmorphism previo, stepper, toasts (recuperar lo bueno).

---

## 8. Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| `backdrop-filter` mata FPS en gama baja | `@supports` gate + fallback opaco (definido en F6-1) |
| El rediseño rompe flujos de B2/B3 | QA E2E en cada fase (login, generar, descargar) |
| Fonts externas lentas | `system-ui` primero, `display=swap`, preconnect |
| Scope grande | Fases independientes con DoD; cada una se pushea sola |