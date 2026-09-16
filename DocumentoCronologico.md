# **Documento Cronológico de UTN Contenidos.**

## **Relevamiento y Entendimiento del Sistema.**

La idea principal del sistema es resolver el problema principal de las clases en la UTN y en demás facultades: El entendimiento de los alumnos para maximizar su aprendizaje con una documentación adecuada para la clase, como una presentaciòn adecuada, dinámica y explicativa, un cronograma de la clase, organizaciòn, enfoques, estructura y explicación de diapositivas, entre otras cosas de mucha utilidad para facilitarle el aprendizaje a los alumnos y ahorrarle tiempo de planificación al profesor .

UTNContenidos resuelve el del tiempo de planificación de la clase y de la creación de presentaciones, de manera de que cualquier profesor solamente con 3 toques crea un Google Slides para cualquier materia de Ingenierìa en Sistemas (por ahora) impulsado por inteligencia artificial, para un mejor aprendizaje y mucho más llevadero, optimizando el tiempo, la retención y la creación de la clase por tema de la materia.

## **Principio de Idea del Sistema.**

En principio, en el primer relevamiento del sistema llevado a cabo el 08-05-26 sobre el sistema, se iba a implementar un sistema integral de resolución y planificación de contenidos mediante una presentación formal creada con tecnologías HTML estáticas, levantando un servidor local (“[http://localhost:8080/](http://localhost:8080/)”) para mostrar la web de formato presentaciòn. conexión con Google Calendar para organización de clases, Gemma 4 (Model 31B IT) como inteligencia artificial corriendo sin conexión para garantizar la toma completa de datos sin alucinaciones y respuesta “on-server”, conexión con bases de datos (profesores, materias, temas y contenido) de UTN.

En un caso, el profesor se conecta al sistema con su legajo y dni para previamente ver su calendario con sus materias cargadas. El mismo debería seleccionar una materia y el tema del que se tratarà la clase, para que Gemma 4 procese los documentos cargados (BD temas) y devuelva una presentación lista en un servidor local (a ejecutar), un documento completo con todo el informe sobre el tema, imágenes referidas y audios explicativos. Cuando termine la creación, la presentación se guarda y se envía una notificación por email comunicando la “tarea completa” y un recordatorio en Google Calendar con el link de la presentación y los PDFs correspondientes. Cuando entre al sistema otra vez, el profesor verá en su calendario como “clase creada” con facilidad de acceder a los datos desde ahí y en la pestaña “historial” lo mismo, concluyendo así con un caso de uso del sistema.

## **La Problemática y el Pivot.**

El problema principal del sistema de la idea anterior era que no preví los problemas y las carencias de lo necesario para la implementación. Fué solamente una idea basándose en posibles conexiones comunicativas dentro del sistema.

**Analizando falencias:**

1. **Tecnologías HTML:** Crear un sistema capaz de guardar y editar archivos HTML y ejecutarlo en un servidor local iba en contra de mi conocer y proponía un gasto significativo de espacio en el servidor (inexistente). esto causaría posibles problemas a la hora de editar diferentes cosas y requeriría la creación de una interfaz de edición de archivos HTML.  
2. **Motor de IA (Gemma 4 Local)**: Gemma 4 es una herramienta muy potente, pero no hay un servidor que lo corra localmente, que analice todos los documentos y que admita una disponibilidad continua. Además, tiene problemas con la ventana de contexto, por lo que sería un gasto de tiempo administrar una IA incapaz.  
3. **Barrera de UX**: Hay usuarios (profesores) que no acostumbran utilizar tecnologías de google, con lo cual, la utilización de herramientas como Google Calendar sería una barrera de diseño y de implementación importante.  
4. **BD de UTN inexistente**: Según la información del relevamiento realizado en dicho día, se entiende que no hay tales bases de datos organizativas. Esto mata completamente la posibilidad de toma de datos 100% correctos y automatización de contenido acertada.

El sistema arrancó con ambición pero **entendiendo las limitaciones**: IA local sin servidor, base de datos UTN inexistente, presentaciones en HTML servidas localmente, Google Calendar como interfaz principal y un modelo de 31B corriendo offline. Tenía el qué, pero no el cómo.

# **Ahora: Julio 2026\.**

El pivot fue acertado. **UTNContenidos** hoy es un sistema en beta pero funcional y desplegado, con una arquitectura sostenible:

| Componente | Antes (idea) | Ahora (real) |
| :---- | :---- | :---- |
| **IA** | Gemma 4 local, 31B, offline | Gemini API (Flash Lite), cloud, costo $0 |
| **Presentaciones** | HTML en servidor local propio | Google Slides vía GAS, nativo |
| **Base de datos** | BD UTN inexistente | Google Sheets como BD relacional |
| **Frontend** | Servidor local \`localhost:8080\` | SPA desplegada en **Vercel**, accesible online |
| **Backend** | Sin definición clara | Google Apps Script \+ Vercel Serverless (\`api/gemini.js\`) |
| **Autenticación** | Legajo \+ DNI (idea) | Legajo \+ DNI vía GAS con Sheets (implementado) |
| **Calendario** | Google Calendar | Eliminado — historial de clases dentro de la propia app |
| **Costo** | Indefinido | $0 absoluto — arquitectura JAMstack \+ Workspace gratuito |

**¿Qué se logró concretamente?**

El stack actual es:

* Login real contra Sheets  
  \- Dashboard con materias y temas del docente.  
  \- Generación de Google Slides automática por IA con RAG real.  
  \- Descarga de guía didáctica en PDF (html2pdf.js).  
  \- Historial de clases creadas por docente.  
  \- Diseño premium con glassmorphism, glow orbs y microinteracciones.  
  \- Desplegado online (Vercel), no local.  
  \- Costo $0 verificable.

¿Qué queda pendiente?

El trabajo en curso es el **rediseño,** orientado a accesibilidad para docentes mayores de 50 años:

La idea era pasar de una idea con 4 falencias críticas a algo funcional, desplegada, sin costo y arquitectónicamente sólida. El único riesgo abierto es la dependencia de la cuenta institucional Google del docente para el GAS (Google Appscript), que hay que validar en el entorno de la UTN.

---

# **Cómo Se Fue Haciendo, y el Porqué de Cada Decisión**

Retomo el hilo donde lo dejé. Porque un sistema no se entiende solo por lo que hace hoy, sino por todo lo que pasó para llegar hasta acá. **por qué lo hice así**:

## Por qué esto es (y tiene que ser) una beta

Cuando pivoté, lo primero que dije es: *"no necesito el sistema perfecto, necesito saber si esta idea funciona"*. Y no hay mejor forma de averiguarlo que con la versión más rápida, barata y honesta posible. Está SPA (single page application) es exactamente eso: **una beta experimental**, y ese es el porqué de la decisión:

1. **Validar con docentes:** toda esta arquitectura existe para que un profesor abra la página, se loguee con su legajo y DNI, y en tres clics tenga una clase armada. la idea es probarla con docentes a partir de cuando la beta esté completamente blindada de ciertos bugs o problemas en la capa de ux.  
2. **Validar sin gastar un peso:** si la idea no resultaba, no perdíamos nada. Si resultaba, seguía costando $0. Las herramientas elegidas (Vercel gratis, Google Workspace, Gemini con plan gratuito) lo hacen posible.  
3. **Validar sin atarse a nada:** al ser la beta una SPA estática con el backend desacoplado, si mañana hace falta pasar a una base de datos de verdad, el frontend se queda casi igual. Es decir: todo lo invertido hasta acá no se tira, la idea es transformarlo..  
4. **Validar de a poquito:** cada funcionalidad se sumó cuando la anterior ya andaba..

Dicho simple: **la beta es el experimento más barato posible para demostrar que la idea tiene sentido**, y recién cuando los profesores digan "esto me sirve", tiene sentido invertir en la versión definitiva.

## La forma en la que se fue construyendo..

- **Todo queda registrado.** Cada cambio, por chico que sea, tiene su fecha y su mensaje en git. Es mi red de contención: si algo se rompe, puedo volver atrás y ver qué toqué, y sobre todo **por qué** lo toqué.  
- **Primero escribo, después codifico.** Antes de tocar el código redacto el plan (de ahí los archivos plan\_(*fecha\_del\_plan*).md que acompañan al repositorio). Escribir me obliga a pensar el problema antes de querer resolverlo.  
- **En pedacitos.** Avanzo por hitos cortos: que prenda, que funcione la idea, que se pueda desplegar, que sea estable. Cada hito se valida antes de seguir con el siguiente.  
- **Errores.** Los conflictos que aparecieron, se arreglaron de manera completa: algo que estuvimos hablando con los tutores es que cada uno de los errores, algo me enseñó y algo terminó reordenando la arquitectura para mejor.

## El viaje, momento a momento (el cambio y su porqué)

### Del 5 al 9 de junio — "Que exista, y que quede escrito"

Los primeros días fueron los más humildes y también los más fundamentales: subir los archivos al repositorio (05/06) y lograr que el esqueleto de la app tuviera **algo** funcional (09/06). Y en el mismo día, dos cosas que marcan el estilo de trabajo para siempre:

- **Se crea la documentación inicial**: por más mínima que sea, toda herramienta hecha para una facultad tiene que poder entenderse sin depender de la memoria de nadie.  
- **Se redacta el “Plan de Implementación”**: acá ya se ve la idea de **pensar antes de hacer**. El sistema ya había crecido lo suficiente como para que la planificación escrita sea lo que realmente haga el cambio.

El orden se debe a que sin una base funcional no hay nada que planificar, y sin documentación no hay nada que pueda sostenerse en el tiempo.

### El 12 de junio — "El día que salió de la compu"

Con el despliegue se sumó el vercel.json: el sistema dejó de ser algo que corría en una máquina y pasó a estar **desplegado en internet**, accesible desde cualquier computadora de la facultad.

*Por qué:* la idea original dependía de un servidor local (localhost:8080), los profesores no tienen un servidor corriendo en su casa. Que la app viva en una URL pública fue el primer gran síntoma de que el sistema empezaba a ser *usable de verdad*.

### El 16 de junio — "el sprint largo”

Solo, en un día, se acomodaron cuatro capas distintas del sistema a la vez:

1. **Backend**: Cambié el endpoint de Appscript ya que la idea principal es que la misma maneje sus propios datos sin que dependa de una web app de Google Appscript, si no mas bien conectar el backend de manera más simple y escalable.  
2. **Historial**: se cambió la generación de clases de IA y se agregó la vista de historial con su navegación. *Por qué:* ninguna clase que un profesor arma una vez vale solo para esa vez. Poder volver a las presentaciones generadas es lo que convierte a la herramienta en un recurso acumulable.  
3. **Front**: actualización de style.css rumbo al diseño más minimalista y simple para docentes.. *Por qué:* una herramienta para docentes tiene que invitar a usarse.   
4. **Datos**: nace la función normalizarId(). *Por qué:* el Sheets nos "regala" datos con .0 o espacios de más, y comparar un ID "123" contra "123.0" rompe el sistema entero.

Hubo también commits de prueba y calibración (mensajes tipo *"Hello"* / *"Goodbye"*), que son la huella honesta de alguien que estaba aprendiendo a usar bien la herramienta de versionado. Los dejo registrados porque también son parte de la historia: **no todo es el resultado final, también cuenta el proceso de aprender**.

### El 23 de junio — "Ordenar la casa y planear la casa"

Dos movimientos de cierre de fase:

- **23/06.1** — se renombró app.js a app.md. Un detalle chico, pero revelador: el backend de Google Apps Script quedó como documento Markdown dentro del repositorio.  
- **23/06.2**— se revisó el Plan de Implementación y se definió la **v3.0 Beta**, que es el punto donde estamos parados hoy.

La idea era que antes de seguir sumando funcionalidades había que ordenar, consolidar y decidir la dirección. Cualquier sistema que crece sin pausas técnicas termina siendo un quilombo.

## Tabla de referencia rápida (por si alguien quiere el detalle técnico)

| Fecha | Cambios | Cambio registrado (git commit) |
| :---- | :---- | :---- |
| 05-06-26 | Carga inicial | f41b7b3 — Se suben los primeros archivos. El repositorio nace. |
| 09-06-26 | Primer funcionamiento | 3733508 — Funcionalidad principal de la app. |
| 12-06-26 | Documentación base | 606e59e — Documentación inicial del sistema. |
| 16-06-26 | Plan v2.0 | 25e6946 / 16cc5e0 — Plan de Implementación y definición de la v2.0. |
| 19-06-26 | Despliegue | ce4ce53 — vercel.json: la app sale a internet. |
| 23-06-26 | Backend | c70580a / 6c0b135 — Endpoint de Google Apps Script actualizado. |
| 26-06-26 | Historial | fe2d3bc / b375c3d — Generación de IA refactorizada \+ vista de historial. |
| 30-06-26 | Estilos | 413f788 — Actualización de style.css (diseño premium). |
| 03-07-26 | Datos | 60e0db7 — Nace normalizarId() para datos confiables de Sheets. |
| 14-07-26 | IA | 114c340 — Clave de Gemini actualizada y mejora del manejo de errores. |
| 17-07-26 | Orden interno | 0c50b50 — Renombramiento de app.js a app.md. |
| 23-07-26 | Plan v3.0 | 0af10ca — Revisión del plan para la **v3.0 Beta**. |

## Lo que deja el cuatrimestre anterior.

- **Constancia.** las semanas de avances chicos acumulados hizo que guardarlos a todos permitió ver el proceso completo y explicarlo hoy.  
- **Google Sheets** como base de datos de emergencia. No es ideal, pero permitió validar el flujo completo sin costo y sin depender de nada complejo. Cuando la idea esté confirmada, el paso a Postgresql será nuestro gran salto.  
- El **límite** de 6 minutos de GAS nos obligó a desacoplar la IA a vercel. La IA devolviendo markdown nos obligó a pedirle JSON puro. Cada límite encontró su solución **estructural**, no un parche.


A partir de este momento, todos los cambios que vayamos realizando en el sistema se registran acá, con fecha, motivo y archivos tocados, para mantener viva esta cronología.

Slides.

El avance en Google Slides realmente se nota. Pasamos de una Slides que realmente no provocaba nada a un Slides que realmente se nota el cambio

---

# **Cronología Alpha 0.5 — Segunda Etapa**

## **El 8 de septiembre — "La auditoría que marcó el rumbo"**

Después de meses de construir "de a pedacitos", llegó el momento de hacer un alto y mirar el sistema con ojos de ingeniero senior. El resultado fue la **Auditoría Profesional Alpha 0.5** (registrada en `PLAN_ALPHA_5.md`): una revisión completa de los 11 archivos del proyecto que encontró lo que ya sospechaba pero no tenía sistematizado:

1. **Seguridad**: el login no tenía protección contra intentos repetidos, la función de depuración (`debugSheetData`) estaba expuesta sin control y cualquier persona con la URL del Web App podía invocar el backend y gastar la cuota gratuita de la IA.
2. **Datos**: el historial mostraba el texto "EXITOSO" como si fuera la fecha de creación, la revalidación de sesión no usaba el modelo relacional nuevo, y se guardaba el nombre de la materia donde debería ir su ID.
3. **Personalización**: la única manera de "configurar" una clase era una cajita de texto libre. La razón de ser del sistema (que el profesor arme la clase a su manera) todavía no existía.

*Por qué:* después de meses de sumar funcionalidades, la plataforma necesitaba **blindarse antes de abrirse a los docentes**. No se puede invitar a un profesor a usar algo que no resiste un intento de acceso indebido, ni que le muestre una fecha rota en el historial.

## **El 8 de septiembre (segunda parte) — "El Sprint A: blindar para poder crecer"**

Con la auditoría aprobada, se ejecutó el **Sprint A (Blindaje)**, la primera de las cuatro etapas del plan. Los cambios fueron quirúrgicos y, sobre todo, pensados para que la arquitectura quedara *a prueba de balas sin cambiar nada de lo que ya funcionaba*:

| Cambio | Archivo | Para qué |
| :---- | :---- | :---- |
| **Rate-limit + lockout en el login** | `app.md` | Tras 5 intentos fallidos con el mismo legajo, se bloquea 15 minutos. Además hay un tope global: máximo 20 intentos por minuto. El brute-force (probar DNIs al azar) se vuelve inviable. |
| **`debugSheetData` protegido** | `app.md` | Solo se puede ejecutar si la propiedad `ALLOW_DEBUG=true` está seteada. En producción queda desactivada, así no se filtra la estructura de la planilla ni datos de muestra. |
| **Tope de tamaño de solicitudes** | `app.md` | El backend rechaza payloads de más de 500 KB y presentaciones de más de 30 diapositivas. Ya no se puede saturar el servidor con una petición gigante. |
| **`LockService` en las escrituras** | `app.md` | Cuando un docente reasigna sus materias, el sistema "bloquea" la planilla durante la operación. Dos pestañas abiertas a la vez ya no pueden pisarse los datos. |
| **Anti prompt-injection** | `app.md` y `api/gemini.js` | El material de cátedra (los apuntes) ahora está delimitado y la IA tiene orden explícita de ignorar cualquier instrucción que aparezca *dentro* del material. Un apunte "trucado" ya no puede manipular a la IA. |
| **Parse seguro de JSON** | `app.md` y `api/gemini.js` | La respuesta de la IA se limpia antes de interpretarse: tolera cercos de código accidentales y valida que traiga diapositivas. Si viene mal, avisa en vez de explotar. |
| **Cache-Control corregido** | `vercel.json` | Se eliminó la caché "inmutable" de un año. Ahora los navegadores vuelven a pedir los archivos actualizados y nadie se queda clavado con una versión vieja de la app. |
| **Política de Seguridad de Contenido (CSP)** | `index.html` | Se define de qué dominios se puede cargar código y a cuáles conectarse. Una capa extra contra ataques XSS (inyección de código malicioso). |
| **Corrección del historial** | `app.md` | Se arregló el índice de columnas: la fecha ahora sale de su columna real y el orden cronológico funciona. También se guarda el **ID** de la materia (no su nombre) para mantener la integridad relacional. |
| **IDs relacionales hasta el export** | `script.js` | El botón "Preparar Clase" ahora arrastra el ID real de la materia y el tema hasta el momento de guardar en Google Slides. |
| **Sanitización de URLs** | `script.js` | Los enlaces del historial solo admiten protocolos seguros (`https://`). Un link manipulado en la planilla ya no puede ejecutar código. |

*Por qué este orden:* la seguridad y la integridad de los datos son la base de todo lo que viene. El Sprint B (el Configurador de Clase) se va a construir sobre un sistema que ya sabe que nadie entra donde no debe y que los datos que muestra son los correctos.

**Lo que quedó documentado para el futuro:**

- **Auth con Microsoft Entra ID (Fase 2 Beta)**: como la UTN tiene convenio con Microsoft (no con Google), la autenticación definitiva va a usar las cuentas institucionales de los docentes. El login por legajo y DNI se mantiene como puente mientras tanto, ahora ya protegido.
- **Configurador de Clase (Sprint B)**: duración, cantidad de diapositivas, estilo visual, nivel de profundidad, ejemplos cotidianos o de industria, imágenes sí o no, momentos a incluir y plantillas guardadas. Todo opcional: si el profesor no toca nada, la presentación sale con el formato predeterminado.
- **Diagramas de arquitectura actualizados** (`diagramas.html`): se regeneraron con la versión moderna de Mermaid, reflejando la capa de blindaje, el modelo relacional y el flujo completo del docente.

## **El 8 de septiembre (tercera parte) — "El Sprint B: que el profesor arme la clase a su manera"**

Con el sistema blindado, llegó el turno de la **mejora fundamental del producto**: que el docente deje de recibir una plantilla única y pueda **personalizar la clase** antes de generarla. Se trabajó con el **modelo espiral**: cada ciclo planea, analiza riesgos, desarrolla y verifica, sin romper lo que ya andaba (plan completo en `PLAN_ALPHA_5_SPRINT_B.md`).

**La Espiral 1 — el Configurador de Clase:**

La vieja "cajita de instrucciones" se transformó en un **configurador completo**, donde el profesor elige (y si no toca nada, todo sale con el formato predeterminado de la UTN):

| Opción | Cómo se elige | Si se deja vacío |
| :---- | :---- | :---- |
| **Duración de la clase** | Select (40, 60, 80–90, 120 min, bloque doble) | 80–90 min |
| **Cantidad de diapositivas** | Slider del 5 al 20 | 7 |
| **Estilo visual** | Select (Minimalista, Clásica, Contemporánea, Alta carga) | Clásica UTN |
| **Nivel de profundidad** | Select (Intro, Intermedio, Avanzado, Mixto) | Intermedio |
| **Ejemplos** | Select (Cotidianos, Industria regional, Ambos, Sin ejemplos) | Ambos |
| **Imágenes** | Select (Fotos HD, Ilustraciones, Diagramas, Sin imágenes) | Fotos HD |
| **URL de teoría** | Input (reemplaza la del temario) | La del temario |
| **Temas adicionales** | Texto (separados por ;) | Ninguno |
| **Momentos de la clase** | Checkboxes (Gancho, Concepto, Caso, Esquema, Desafío) | Los 5 |
| **Instrucciones libres** | Texto libre | Formato llamativo predeterminado |

Y dos detalles que marcan la experiencia docente:

- **Plantillas personales**: el profesor puede *guardar su configuración favorita* y recuperarla en cada clase. Todo se guarda en su navegador (sin costo ni cuentas).
- **La IA ahora respeta la cantidad**: la diapositiva de portada y el cierre (takeaway) siempre están; en el medio se distribuyen los momentos elegidos en el orden solicitado. Si hay más diapositivas que momentos, la IA profundiza el tema correspondiente.

*Por qué en espiral:* porque personalizar toca el corazón del sistema (el prompt de la IA, el backend, la interfaz) y un error ahí rompería todo. Cada giro agrega una capa probada: primero el contrato y la interfaz, después la regeneración de diapositivas individuales, luego el editor manual y por último las plantillas avanzadas.

**Lo que viene (Espirales 2 a 4):**
1. ~~**Regenerar una sola diapositiva** ("Me gustó, pero reformulá solo la número 4").~~ ✅
2. **Editor previo a exportar**: cambiar títulos y contenido a mano antes de guardar en Slides.
3. **Plantillas con nombre** y cierre del flujo completo en menos de 6 clics.

## **El 8 de septiembre (cuarta parte) — "El Sprint B, Espiral 2: reformular sin tirar todo"**

La segunda vuelta del modelo espiral agregó el poder que más va a usar un profesor exigente: **retocar una sola diapositiva sin regenerar la clase completa**.

Cada diapositiva de contenido ahora tiene su botón **"🔄 Reformular esta diapositiva"**. Al tocarlo, el profesor escribe qué quiere cambiar (por ejemplo: *"hacela más corta, usá un ejemplo cotidiano"*) y la inteligencia artificial devuelve **únicamente esa diapositiva reformulada**. El resto de la presentación queda intacta, y lo exportado a Google Slides refleja el cambio.

| Cambio | Archivo | Para qué |
| :---- | :---- | :---- |
| **Botón "Reformular" por diapositiva** | `script.js` | La tarjeta de cada diapositiva ahora puede regenerarse por separado |
| **Ventana de reformulación** | `index.html` | El profesor escribe qué cambiar y confirma |
| **Reformulación quirúrgica en la IA** | `app.md` y `api/gemini.js` | La IA recibe solo esa diapositiva y devuelve solo esa diapositiva (schema propio) |
| **Render reutilizable** | `script.js` | La grilla de diapositivas se redibuja tras el cambio sin recargar todo |

*Por qué en espiral:* la reformulación toca el contrato de datos y el prompt de la IA. Al hacerlo como giro cerrado y probado, se evita que un cambio mínimo rompa la generación completa de clases.

**Lo que sigue (Espiral 3):** el **editor previo a exportar** — poder modificar a mano los títulos y contenidos de cualquier diapositiva antes de guardarla en Google Slides, sin depender de la IA para cada retoque fino.

## **El 8 de septiembre (quinta parte) — "El Sprint B, Espiral 3: la última palabra la tiene el profesor"**

La tercera vuelta del espiral agregó el control fino que cierra la personalización: **editar cualquier diapositiva a mano antes de exportarla**.

Cada tarjeta tiene ahora su botón **"✏️ Editar contenido"** (incluso la portada). Al tocarlo se abre una ventana con cuatro campos editables: título, subtítulo, contenido (un punto por línea) y notas del orador. Lo que el profesor escriba ahí **es lo que se exporta**, tal cual, a Google Slides y al PDF.

| Cambio | Archivo | Para qué |
| :---- | :---- | :---- |
| **Botón "Editar" en cada diapositiva** | `script.js` | Toda la presentación queda editable a mano |
| **Ventana de edición** | `index.html` | Título, subtítulo, contenido y notas, con límite de caracteres |
| **Guardado directo en la clase** | `script.js` | Los cambios se aplican sobre la presentación ya generada, sin pasar por la IA |
| **Exportación de lo editado** | `script.js` (flujo existente) | Slides y PDF usan exactamente lo que el profesor dejó |

*Por qué en espiral:* la combinación de las tres espirales (configurador → reformular → editar) cubre el recorrido completo de un profesor exigente: **configurar el estilo, pedirle a la IA un retoque puntual y retocar a mano el último detalle** — sin perder nunca el control del resultado final.

**Lo que cierra (Espiral 4):** el **cierre del flujo completo** — plantillas con nombre, verificación del recorrido en menos de 6 clics y el checklist de QA del Sprint B.

## **El 15 de septiembre — "El Sprint C: pulir lo que ya funciona"**

Con el configurador aprobado y en producción, el siguiente paso fue la **fiabilidad** (Sprint C): no sumar funciones nuevas, sino hacer que las que ya existen no fallen ni frustren al docente.

| Cambio | Archivo | Para qué |
| :---- | :---- | :---- |
| **Portada robusta en Google Slides** | `app.md` | Antes la portada dependía de que la plantilla en blanco trajera recuadros de título; si no los traía, quedaba una slide azul vacía. Ahora el título y el subtítulo se **crean siempre** (textos autoajustados) y nunca más queda una portada en blanco. |
| **Imágenes con límite de espera** | `app.md` | Cada imagen tiene máximo 6 segundos para descargarse. Si el servicio de imágenes está lento o caído, la diapositiva se arma igual sin esa imagen en vez de trabar todo el export. |
| **Temperatura unificada** | `app.md` y `api/gemini.js` | La IA ahora responde con el mismo nivel de creatividad en los dos caminos (Vercel y GAS), así el resultado es consistente. |
| **Carga por etapas** | `script.js` | El mensaje de espera cambia según el paso: "Buscando el material de tu cátedra..." y luego "Generando tu clase con IA...". El profesor siempre sabe en qué etapa está. |
| **Enfoque accesible en las ventanas** | `script.js` | Al abrir cada ventana, el cursor se coloca automáticamente en el primer campo. Menos clics y más claro para los docentes de 50+. |

También se actualizó el backend en Google Apps Script con una **nueva dirección de Web App** (la anterior cambió al volver a publicar), ya conectada en el frontend y verificada en vivo: responde correctamente y mantiene activo el blindaje del Sprint A.

*Por qué en este orden:* primero se arma la funcionalidad completa (Sprint A y B), y recién después se pule la estabilidad (Sprint C). Un sistema que funciona a medias no sirve, pero tampoco sirve uno que funciona perfecto a veces y se cae de golpe: la fiabilidad es lo que hace que un docente confíe en usarla delante de sus alumnos.

**Lo que viene (Sprint D):** distribución y telemetría — versionar el backend con `clasp` para que el código del repo y el de producción nunca se desincronicen, un registro de eventos (audit log) en la planilla y un checklist de despliegue documentado.

## **El 15 de septiembre (segunda parte) — "El sprint del feedback: la plataforma escucha al docente"**

Después de la prueba de campo, llegaron las observaciones del usuario y se convirtieron en el **sprint α0.6**, el primero construido 100% a partir de feedback real. Cada punto se resolvió de punta a punta:

| Observación | Solución |
| :---- | :---- |
| **El profesor no podía agregar temas** | Botón "＋ Agregar tema a esta materia" en cada materia + ventana de carga (nombre, descripción, link del apunte). El tema se guarda en la planilla y aparece al instante. |
| **El historial era pobre** | Cada presentación tiene ahora un **distintivo de estado** (verde = reciente, celeste = usada, gris = archivada después de 15 días), botón **"Reabrir clase"** (vuelve a la pantalla completa del plan de clase para editarla y reexportarla) y botón **"Agregar a carpeta"** para organizarla. |
| **Personalizar no cambiaba nada** | Se reforzó el motor de IA: si el modelo no respeta la cantidad de diapositivas pedidas, se re-intenta automáticamente hasta lograrlo. La configuración del docente ahora sí se nota en el resultado. |
| **Las plantillas no estaban en ninguna base de datos** | Se creó la hoja **Plantillas** (modelo relacional) y las plantillas del docente ahora viajan con su cuenta, no solo en su navegador. |
| **Los diagramas estaban desactualizados** | `diagramas.html` se regeneró con el nuevo modelo de datos (entidad Plantillas, campos carpeta y contenido del historial) y el flujo completo del docente. |
| **La pantalla de personalización era fea** | Rediseño minimalista estilo iOS 27: opciones en píldoras, momentos en chips, opciones avanzadas plegadas, sin barra de scroll y un botón ✕ circular para cerrar. |

*Por qué este sprint importa:* la diferencia entre una herramienta que se usa una vez y una que se adopta está en estos detalles. Un profesor que puede **cargar su propio tema, guardar su plantilla favorita, encontrar su clase pasada por color y reabrirla para reutilizarla** ya no está probando un prototipo: está usando una herramienta de trabajo.

**Pendiente para el humano:** desplegar el backend actualizado en Google Apps Script (las nuevas acciones de temas, plantillas e historial) para que todo el flujo quede activo en producción.

## **El 8 de septiembre (sexta parte) — "El Sprint B, Espiral 4: plantillas con nombre y cierre"**

La cuarta y última vuelta del espiral cerró el Sprint B con el detalle que convierte al configurador en una herramienta personal: **plantillas con nombre**.

El profesor ya no tiene una sola configuración guardada: puede crear varias (por ejemplo, *"Práctica de laboratorio"*, *"Clase teórica"*, *"Repaso final"*), elegirlas de una lista, cargarlas, sobrescribirlas o borrarlas. Todo se guarda en su navegador, sin cuentas ni costo.

Con esto quedó completo el recorrido que el docente hace en menos de seis clics: **elegir materia y tema → configurar el estilo → generar la clase → reformular una diapositiva puntual si hace falta → editar a mano el detalle final → exportar a Google Slides o PDF**.

**El cierre fue una verificación de calidad (QA) del Sprint B completo:**

- La configuración vacía produce el mismo resultado que el formato predeterminado de antes (sin romper nada).
- El configurador, la reformulación, el editor y las plantillas conviven sin pisarse.
- La cantidad de diapositivas solicitada se respeta en la generación y en la exportación.
- El checklist de seguridad del Sprint A se mantiene en verde (rate-limit, sanitización, topes de payload).

**Y el siguiente paso:** someter el sistema al **QA real con docentes de la UTN FRD**, empezando por un profesor de matemáticas de 65 años — el caso de uso más exigente de todo: letra grande, flujo simple, cero ambigüedad. Si él puede preparar su clase solo, el sistema está listo para todos.

**De paso, el futuro Microsoft:**

Como la UTN tiene convenio con **Microsoft 365** (y no con Google), se documentó el camino de migración por capas en `WALKTHROUGH_FASE2.md`: la autenticación pasará a **Microsoft Entra ID** (cada docente entra con su cuenta institucional), y a futuro los archivos podrían generarse en OneDrive (PPTX) manteniendo Google como respaldo. La inteligencia artificial (Gemini) se mantiene igual en ambos mundos. Todo a costo $0 y sin tirar lo ya construido.  