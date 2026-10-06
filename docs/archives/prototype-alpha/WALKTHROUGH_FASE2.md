# WALKTHROUGH FASE 2 — Migración al Ecosistema Microsoft (Entra ID / M365)

> **Contexto:** la UTN NO tiene convenio con Google, pero sí con **Microsoft 365**. Los docentes ya tienen cuenta institucional Microsoft. Esta guía documenta cómo migrar progresivamente UTNContenidos al ecosistema Microsoft **sin romper el costo $0** y manteniendo Google como fallback.

---

## 1. ¿Es posible convivir con Google? Sí — por capas

La SPA no está "atada" a una nube: habla con 3 artesas (seams) intercambiables:

| Capa | Hoy | Migrable a Microsoft | Costo |
|------|-----|----------------------|-------|
| **Auth** | Legajo+DNI contra Sheets | **Microsoft Entra ID (OAuth2/OpenID)** | $0 (tenant M365 UTN) |
| **Datos** | Google Sheets vía GAS | Excel Online / SharePoint Lists vía **Microsoft Graph API** | $0 (Graph gratuito con el tenant) |
| **Generación** | Google Slides/Docs vía GAS | **PPTXGenJS (cliente) + OneDrive vía Graph** | $0 |
| **IA** | Gemini (key independiente de Google) | **Gemini SIEMPRE** (no requiere convenio) | $0 |

**Clave:** `GEMINI_API_KEY` es de Google AI Studio (producto aparte), no de Google Workspace. Se mantiene en ambos mundos.

## 2. Por qué migrar la AUTH primero (fase 2 Beta)
- Hoy el Web App de GAS corre como *dueño del script* → los Slides caen en UN solo Drive. Eso no escala.
- Con **Entra ID**, cada docente se autentica con su cuenta @utn.edu.ar y autoriza (OAuth) el alcance de Drive/OneDrive.
- Legajo+DNI queda como fallback transicional (ya blindado con rate-limit).

## 3. Hoja de ruta de migración (por capas, manteniendo Google activo)

### Paso 1 — Entra ID (Auth) [Fase 2 Beta]
1. Registrar la SPA en el tenant M365 (Azure AD → App Registrations), redirect a Vercel.
2. Flujo **Authorization Code + PKCE** desde `script.js` (o `msal.js` vía CDN, costo $0).
3. Backend valida el `id_token` (JWT) firmado por el tenant → mapea `email` a la hoja `Docentes` → emite token propio.
4. `validarDocente` (legajo+DNI) se desactiva por defecto, queda como flag `AUTH_MODE=legajo` transicional.

### Paso 2 — Graph API (datos) [Fase 3, opcional]
- Leer la planilla **Excel en SharePoint** vía `GET /sites/{id}/drive/items/{id}/content` o **Lists**.
- O mantener Sheets y exponerla solo como API interna (migración sin urgencia).

### Paso 3 — Generación [Fase 3, opcional]
- **PPTXGenJS** (librería JS cliente, $0) genera el `.pptx` con el branding UTN.
- Subida a **OneDrive** del docente vía Graph (`PUT /me/drive/items`).
- Google Slides sigue siendo el motor por defecto mientras tanto (fallback configurable).

## 4. Costos y límites (verificar con el área de IT de la UTN)
- Entra ID Free: incluido en el tenant M365 institucional. Sin costo adicional.
- Microsoft Graph: llamadas gratuitas dentro del límite de uso razonable.
- Requisito humano: alguien con permisos de **Admin del tenant** para registrar la app y crear el App Registration.

## 5. Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| IT rechaza el App Registration | Usar el **Google Workspace educativo** si UTN finalmente lo habilita; Entra queda documentado |
| Docentes sin licencia M365 asignada | Validar con IT que todos tengan cuenta activa en el tenant |
| Cambio de motor de Slides | Mantener GAS como fallback hasta que PPTXGenJS+Graph estén QA'd |

## 6. DoD de la Fase 2
- [ ] Login con Entra ID funciona en producción (Vercel) contra el tenant UTN.
- [ ] Legajo+DNI desactivado (o tras flag).
- [ ] Los Slides/PPTX se crean en la cuenta del docente.
- [ ] Costo total sigue en $0.
- [ ] Checklist de seguridad aprobado (`utn-security-audit`).