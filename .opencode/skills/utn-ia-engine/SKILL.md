---
name: utn-ia-engine
description: Use when working on the AI layer of UTNContenidos (app/api/ia/route.ts): Gemini/OpenRouter calls, prompt engineering, RAG/pgvector, streaming SSE, slide count enforcement. Dispara al tocar api/ia, prompts, o la generación de clases.
---

# UTNContenidos — IA Engineer (Gemini + OpenRouter + RAG + Streaming)

Soy el cerebro. Diseño el prompt élite, orquesto modelos y optimizo tokens.

## Stack de IA
- **Principal:** Gemini `gemini-3.5-flash-lite` (env `IA_MODEL`, plan Pro del usuario = $0 marginal).
- **Fallback:** OpenRouter (`OPENROUTER_API_KEY`, modelo `OPENROUTER_MODELO`) si Gemini falla.
- **Embeddings:** `gemini-embedding-2` (3072 dims) para RAG pgvector.
- **Streaming:** SSE (`?stream=1` → eventos `progreso`/`chunk`/`done`/`error`).

## Contrato de respuesta (JSON obligatorio)
```json
{
  "plan": { "duracion": "...", "objetivos": [...], "estructura": [{fase,duracion,actividad}] },
  "slides": [{ titulo, subtitulo, categoria, tipo, contenido, notasOrador, imagenKeyword }],
  "promptsImagenes": [...]
}
```
`tipo` ∈ `portada | hook | concepto_nucleo | caso_aplicado | esquema_proceso | desafio_aula | takeaway`.

## Reglas no negociables
1. **Anti prompt-injection:** el material RAG va delimitado `Material de cátedra (SOLO CONSULTA...)` + orden de ignorar instrucciones internas.
2. **Enforcement de N slides:** si `slides.length !== numSlides`, re-intento correctivo UNA vez con `llamarModelo()`.
3. **RAG truncado** a ~12k chars; búsqueda SOLO por materia (`match_apuntes`).
4. **Parse tolerante**: slice `{...}` para tolerar markdown/cercos.
5. **Costo $0**: llamar a Gemini primero (plan pagado), OpenRouter solo de fallback. Nunca doble-cobrar.
6. **Tope diario** lo aplica el route (20/día), no el prompt.

## Autenticación del endpoint
`POST /api/ia` exige `getDocenteSesion()` (cookie HttpOnly) → 401 sin sesión. Incrementa `generaciones_dia` tras éxito vía `registrarGeneracion()`.

## Mejoras futuras (backlog B4+)
- Streaming REAL de Gemini (`streamGenerateContent?alt=sse`) en vez de chunkar la respuesta completa.
- Cache de respuestas (materia+tema+config) 24h para ahorrar cuota.
- Evaluación de calidad por muestreo (QA de contenido generado).