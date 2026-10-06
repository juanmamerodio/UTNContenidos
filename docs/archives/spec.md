# Spec del Producto (MVP) — UTNContenidos

Fuente de verdad de producto. Reemplaza a los `PLAN_BETA_*` (pendiente archivar). Principios e invariantes: `docs/constitution.md`.

## 1. Visión
Un docente UTN FRD genera, edita y proyecta una clase completa (7 momentos) con IA, a partir de apuntes propios, en pocos clics.

## 2. Usuarios
- **Docente** (único usuario con cuenta funcional) y **admin/root** (operación).
- **Alumnos:** sin cuenta ni enlaces públicos. Ven la clase cuando el docente **proyecta** o comparte un **PDF** por sus propios medios.

## 3. Alta y autenticación
- Registro abierto con email `@frd.utn.edu.ar` **verificado** (Supabase Auth).
- Dominio validado en servidor, no solo en el cliente.

## 4. Flujo principal (vertical slices, en orden)
1. **Auth:** registro/login docente.
2. **Materias y apuntes:** el docente define sus materias y agrega apuntes **por URL** (principal) o **texto pegado** (fallback). PDF: posterior.
3. **Generación:** elige materia + tema, indicaciones libres opcionales → clase de 7 momentos usando RAG (pgvector) **solo sobre sus apuntes de esa materia**.
4. **Historial y edición:** la clase se guarda; el docente edita el texto de cada slide o regenera una slide con una indicación.
5. **Salida:** modo presentación en navegador (con notas de orador) y **PDF vía impresión del navegador**.

## 5. Ingesta por URL (requisitos de seguridad)
- Solo `http`/`https`; bloquear localhost, IPs privadas/link-local y redirecciones hacia ellas (anti-SSRF).
- Timeout y tope de tamaño de respuesta; extracción de texto en servidor.
- Páginas que requieren login/JS: error claro en español, ofrecer texto pegado.
- Solo se guarda el texto indexado y la URL de origen.

## 6. Privacidad de datos
- Apuntes **privados por docente** (RLS por `docente_id`). Sin compartir entre docentes en el MVP.

## 7. Cuota y costo ($0)
- Límite por docente en DB (inicial: 10 generaciones/día, configurable).
- Fallback Gemini → OpenRouter. Mensaje en español al agotar cupo.

## 8. Fuera del MVP
PPTX, enlaces públicos, cuentas de alumno, subida de PDF/Word, recopilación/aprendizaje agregado entre docentes, editor visual de slides, multi-institución.

## 9. Preguntas abiertas
- Valor definitivo del límite diario y de tamaño de apunte/URL.
- Estructura exacta de los 7 momentos y esquema de slide (ver skill `utn-class-builder` / `memory.md`).
- Qué hacer con `/api/pptx` y `pptxgenjs` existentes (retirar).
- Archivar/eliminar `PLAN_BETA_*` y `ROADMAP_CIERRE_BETA.md` tras revisar su contenido.
