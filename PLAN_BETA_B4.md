# PLAN B4 — IA v2: RAG + Streaming (Beta 0.1.0)

> **Meta:** la IA trabaja sobre el material real de la cátedra (RAG semántico) y
> la generación se ve en vivo (streaming). Modelo: `gemini-3.5-flash-lite` (env).
> Costo $0 (Gemini Pro plan del usuario, pgvector en Supabase free).

## B4-1. Apuntes con embeddings (pgvector)
- `supabase/patch_b4.sql`: columna `embedding vector(768)` en `apuntes` + función
  `match_apuntes(p_materia, p_consulta, p_limite)` (distancia coseno).
- `scripts/seed_apuntes.mjs`: inserta apunte de prueba e indexa embeddings
  con `text-embedding-004` (768 dims, gratis en plan Pro).
- DoD: query semántica devuelve el fragmento correcto.

## B4-2. RAG en api/ia
- En `app/api/ia/route.ts`: antes de armar el prompt, llamar `match_apuntes()`
  con (materia + tema) y usar los top-3 fragmentos como `textoOficial`.
- Si no hay apuntes: fallback al texto actual (sin RAG).
- DoD: con apunte cargado, la clase cita el material.

## B4-3. Streaming SSE
- `api/ia` acepta `?stream=1` y responde `text/event-stream`:
  `event: inicio` → `event: chunk` (texto parcial) → `event: done` (JSON final).
- Gemini: `streamGenerateContent?alt=sse` (soporte nativo).

## B4-4. Frontend con progreso
- `GeneradorClase`: si `stream=1`, lee el stream con `ReadableStream` y muestra
  el texto en vivo (reemplaza el "Generando..." en negro).

## B4-5. Fallback OpenRouter
- Si Gemini responde error/timeout → intentar OpenRouter (key en env) con el
  mismo prompt. Modelo configurable: `OPENROUTER_MODELO`.

## QA B4
- [ ] Apunte indexado → RAG devuelve fragmentos relevantes.
- [ ] Generación con RAG ≠ generación sin RAG.
- [ ] Streaming muestra texto en vivo (<2s al primer chunk).
- [ ] Fallback OpenRouter funciona con Gemini caído (simulado).
- [ ] `npm run build` OK · costo $0.