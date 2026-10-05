# Constitución del Proyecto — UTNContenidos

Plataforma institucional que permite a docentes UTN FRD generar clases con IA.

## 1. Simplicidad del stack (innegociable)
- Un solo lenguaje (TypeScript), un solo framework (Next.js), una sola base (Supabase).
- Sin ORM, sin microservicios, sin colas ni infraestructura propia.
- Toda dependencia nueva debe justificarse por escrito; por defecto, se rechaza.
- Costo operativo **$0**: Supabase free, Vercel free, Gemini/OpenRouter free tier.

## 2. Alcance (MVP)
**Dentro:** login docente, selección de materia/tema, generación de clase (7 momentos), RAG limitado a la materia del docente, exportación de presentación.

**Fuera (hasta nuevo aviso):** multi-institución, pagos, app móvil nativa, analítica avanzada, edición colaborativa en tiempo real, entrenamiento de modelos propios.

Todo ítem fuera de alcance requiere enmendar este documento antes de especificarse.

## 3. Idiomas
- **Código** (identificadores, comentarios, commits, nombres de archivo): inglés.
- **Interfaz y mensajes al usuario:** español rioplatense ("vos").

## 4. Invariantes del sistema
1. **Aislamiento por materia:** la búsqueda RAG solo accede a contenido de la materia del docente autenticado.
2. **RLS siempre activo** en toda tabla con datos de usuario; el service key nunca llega al cliente.
3. **PII protegida:** `docentes.dni` y `docentes.email` nunca aparecen en respuestas de API ni en logs (Ley 25.326).
4. **Secretos fuera del repo:** solo `.env.example` con valores vacíos.
5. **Accesibilidad 50+:** letra grande, máximo 2 clics por acción principal, feedback visual en cada acción.
6. **Contrato de slide estable:** toda salida de IA se valida contra el esquema antes de renderizarse.
7. **Tests primero:** ningún código fuente sin test rojo previo (ver `CLAUDE.md`).

## 5. Proceso
- Specs en `docs/specs/`, una por vertical slice.
- Cada slice: persistencia/API → UI, verificada en runtime con `curl`.
- Enmiendas a esta constitución: commit dedicado `docs: amend constitution`.
