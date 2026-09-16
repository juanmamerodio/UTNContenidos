# PLAN_ALPHA_5_SPRINT_D — Distribución & Telemetría (α0.7)

> **Meta:** cerrar el roadmap de la Alpha 0.5: auditabilidad, límites de uso y despliegue reproducible.
> **Estado:** EN CURSO — backend implementado + QA 8/8 PASS.

## Sprint D — Tareas

| ID | Tarea | Estado |
|----|-------|--------|
| D-F1 | **Versionar GAS con clasp** (`gas/app.gs`) | 🔲 pendiente (necesita credenciales clasp) |
| D-F2 | **Audit Log en Sheets** (`Log_Eventos`: fecha, legajo, acción, éxito, detalle) | ✅ implementado en `app.md` (`registrarLog`) |
| D-F3 | **Tope diario de generaciones IA** (máx 20/día por docente, CacheService TTL 24h) | ✅ implementado en `app.md` |
| D-F4 | **Checklist de despliegue** (`CHECKLIST_DEPLOY.md`) | 🔲 pendiente (documento) |
| D-F5 | **Transferencia de propiedad del Slides al docente** (`DriveApp.setOwner`) | ✅ implementado |
| D-F6 | **Auditoría de seguridad final** (skill `utn-security-audit`) | 🔲 pendiente |

## Registro de eventos (acciones logueadas)
`LOGIN` (OK/ERROR) · `GENERAR_CLASE` (OK/ERROR + límite) · `EXPORTAR_SLIDES` (OK/ERROR) · `AGREGAR_TEMA` · `GUARDAR_PLANTILLA` · `BORRAR_PLANTILLA` · `ACTUALIZAR_HISTORIAL`

## Costo
$0 (GAS, Sheets, CacheService). Sin dependencias de pago.

## Próximos pasos sugeridos
1. Generar `CHECKLIST_DEPLOY.md` (paso a paso para replicar el deploy).
2. Cuando haya credenciales de `clasp`, versionar el backend (D-F1).
3. Correr `utn-security-audit` final antes de la entrega a docentes.