# ROADMAP CIERRE BETA 0.1.0 — Checklist final (modelo espiral)

> Estado del espiral: B1→B6 implementados. Este doc lista lo que queda para
> declarar la Beta **cerrada y entregable**. Chequear y tachar en orden.

## F6-6 — Rendimiento (EN CURSO → OK)
- [x] Bundle liviano: First Load JS = 103 kB total (gama baja OK)
- [x] Reveal.js NO en el bundle inicial (se carga en iframe on-demand en /generar)
- [x] `backdrop-filter` con fallback sólido (@supports + prefers-contrast)
- [ ] Lighthouse real en navegador (validación manual del humano en gama baja — opcional)

## Pendientes técnicos
- [x] `patch_b4.sql` (RAG pgvector) — EJECUTADO por el humano (match_apuntes existe)
- [x] `seed:apuntes` corrido → embedding 3072d guardado, RAG semántico operativo (similitud 0.744)
- [ ] Cron keep-alive confirmado activo (`/api/health` — vercel.json `0 12 * * *`)

## QA final con docente real (B5 pendiente)
- [ ] Docente 50+ loguea root/root y recorre: login → materia → generar → deck → descargar
- [ ] Medir clics: llegar a "Preparar Clase" en ≤2 clics
- [ ] Errores muestran mensajes en "vos", nunca stacktrace

## Legal / institucional (B5)
- [ ] Ley 25.326: dni/email = PII → verificar que no se loguea ni expone
- [ ] `DocumentoCronologico.md` actualizado con hitos Beta

## Deploy / entrega
- [ ] `CHECKLIST_DEPLOY.md` actualizado al stack Next.js (hoy está en prototype-alpha)
- [ ] `PLAN_BETA_FINAL.md` marcando B1→B6 completados (checkboxes)

## Backlog post-Beta (futuro, NO bloquea)
- OpenRouter real (B4 lo dejó como fallback; falta streaming nativo de Gemini)
- Export .pptx (PPTXGenJS) — pedido, prioridad B4, no hecho
- Auth Microsoft Entra ID (WALKTHROUGH_FASE2)
- Entornos de prueba (test suite automatizada con vitest/playwright)
- CDN de fuentes (Montserrat/Inter vía next/font) para no depender de Google Fonts