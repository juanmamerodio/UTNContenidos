---
name: utn-class-builder
description: Use when working on the Class Configurator (Sprint B), the Gemini prompt, or slide generation of UTNContenidos. Defines the config contract, the 7 pedagogical moments, and how to wire fields end-to-end.
---

# UTNContenidos — Configurador de Clase (contrato)

## Contrato del objeto `configuracion` (frontend → backend → Gemini)
```js
{
  duracion: "",            // "" | "40" | "60" | "120" | "bloque-doble"
  numSlides: 7,            // 5..20 (slider)
  estilo: "",              // "" | "minimalista" | "contemporanea" | "alta-carga"
  nivel: "",               // "" | "intro" | "intermedio" | "avanzado" | "mixto"
  ejemplos: "",            // "" | "cotidianos" | "industria" | "ambos" | "ninguno"
  imagenes: "",            // "" | "fotos" | "ilustraciones" | "diagramas" | "ninguna"
  urlTeoria: "",           // override del link del temario
  temasAdicionales: [],    // array de strings
  momentos: [],            // subset de ["hook","concepto_nucleo","caso_aplicado","esquema_proceso","desafio_aula"]
  instrucciones: ""        // texto libre (máx 2000)
}
```
Regla: TODOS los campos son opcionales → "vacío" = plantilla predeterminada.

## Los 7 momentos pedagógicos
1. `portada` (SIEMPRE, slide 1) · 7. `takeaway` (SIEMPRE, última)
2. `hook` (gancho) · 3. `concepto_nucleo` · 4. `caso_aplicado` · 5. `esquema_proceso` · 6. `desafio_aula`

## Dónde se inyecta
- `api/gemini.js`: destructure `configuracion` de `req.body`, inyectar en `userPrompt` como bloque `--- CONFIGURACIÓN SOLICITADA POR EL DOCENTE ---`.
- `app.md` `generarClaseConGeminiGAS`: 6º parámetro `configuracion`, misma inyección + regla de N diapositivas dinámicas.
- `doPost` (app.md): pasar `params.configuracion` al generarClaseIA.
- `script.js`: `ejecutarGeneracionIA(materia, tema, configuracion)`; `instrucciones`→`contextoDinamico`; `urlTeoria`→`linkTeoria` si no vacío.

## Post-generación (plan Sprint B, spirals 3-4)
- Regenerar slide individual (pasar `slideIndex` + nueva instrucción).
- Editor previo a exportar (cambiar títulos/contenido en cliente).
- Plantillas: `localStorage.utn_template_clase` (guardar/cargar/borrar).
- Export PDF/Slides consume el MISMO objeto `claseGeneradaActual`.