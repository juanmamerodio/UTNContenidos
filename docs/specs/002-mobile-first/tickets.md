# Tickets — Refactor UX Mobile-First (Fase Post-T)

> Fuente: `docs/specs/002-mobile-first/spec.md`. Orden de ejecución secuencial.
> Pre-requisito: Errores de consola (CSP, Reveal.js history) resueltos ✅.

---

## M1 — Dashboard & Tarjetas 3D ✅ (verificado)
**Spec refs:** §2, §3.1
**Skill owner:** `utn-frontend-ux50`, `smooth-ae`

- [x] Instalar e integrar `framer-motion` en el layout raíz o asegurarse de que las directivas `use client` estén donde se necesitan.
- [x] Aplicar físicas de spring (`whileHover`, `whileTap`) a las `MateriaCardPro`.
- [x] Refactor del Grid del Dashboard (`app/dashboard/page.tsx` o equivalente) para asegurar un fallback a 1 columna pura en `< 768px`.
- **DoD:** Dashboard renderiza perfecto en mobile, sin overflow horizontal; tarjetas reaccionan al toque.

---

## M2 — CRUD de Apuntes Responsive ✅ (verificado)
**Spec refs:** §3.2
**Skill owner:** `utn-frontend-ux50`

- [x] Ajustar anchos y `z-index` de los modales/alertas al agregar apuntes.
- [x] Asegurar que el input de pegar texto `textarea` crezca sin romper el layout y sea scrolleable en mobile.
- **DoD:** Agregar apunte en celular es cómodo a 1 mano y el teclado on-screen no tapa el botón de "Guardar".

---

## M3 — Generador (Formulario y Stepper) ✅ (verificado)
**Spec refs:** §3.3
**Skill owner:** `utn-frontend-ux50`

- [x] Adaptar `StepperDidactico.tsx` para mobile (ocultar etiquetas largas, dejar iconos, scroll x si es necesario).
- [x] Convertir `FormularioConfiguracion.tsx` a un flexbox `flex-col` estricto en pantallas chicas con botones de 48px de alto.
- **DoD:** Todo el formulario entra en viewport sin scroll horizontal, inputs accesibles.

---

## M4 — Visor de Resultados Inmersivo (El Core) ✅ (verificado)
**Spec refs:** §2, §3.4
**Skill owner:** `smooth-ae`, `utn-frontend-ux50`

- [x] Reestructurar `VisorResultado.tsx` en mobile: Listado de tarjetas de Slides con stagger animation.
- [x] Convertir `ModalEditarSlide.tsx` en un **Bottom Sheet de pantalla completa** utilizando `motion.div` con físicas de resorte.
- [x] Convertir `ModalReformular.tsx` bajo el mismo esquema de transición inmersiva (`layoutId`).
- **DoD:** La edición de una slide es una experiencia "iOS" fluida sin recargar ni romper el stack de navegación de UI.
