# Estado de integración frontend–backend

Última actualización: 31 de agosto de 2026

Este documento registra el estado real de la comunicación entre el frontend de Llanqui y `backend-v2` en la rama `clean`. No es un plan de trabajo ni modifica el contrato del backend.

## Reglas de integración

- Solo se modifica el proyecto `frontend`.
- `backend-v2` no se modifica.
- No se utiliza mock data para reemplazar información que debería venir de la API.
- El frontend se adapta únicamente a los endpoints, métodos HTTP y DTO existentes.
- Candidato y company tienen navegación y capacidades diferentes.
- Una funcionalidad sin endpoint equivalente debe mostrar un estado informativo real y no simular resultados.
- Cada corrección debe actualizar este documento y registrar su validación.

## Significado de los estados

- `[x] Funciona`: contrato y consumo compatibles.
- `[ ] Pendiente frontend`: existe soporte en backend y el frontend debe adecuarse.
- `[-] No disponible`: backend no ofrece el flujo; el frontend debe deshabilitarlo o explicarlo.
- `[!] Verificar`: integración aparentemente compatible, pero falta una prueba local completa.

## Cambios detectados tras actualizar `backend-v2/clean` (31/08/2026)

- [x] **Sesión y perfil propio**: `sign-in`, `auth/me` y `refresh` ahora resuelven `profileType` y `profileId`; el frontend los persiste desde la respuesta real. `GET /profile/me` sustituye la lectura dependiente de un `profileId` local.
- [x] **Conversaciones propias**: `GET /conversation/me` habilita la bandeja del candidato y devuelve mensajes ordenados en cada conversación. Ambas vistas cargan el historial real después de seleccionar o enviar un mensaje.
- [x] **Historial de postulaciones**: `GET /recruitment/applications/me` alimenta `/my-applications` con cargo, empresa, estado y fechas reales del candidato autenticado.
- [x] **Biblioteca de CV**: `GET /cv/me` muestra los CV guardados del candidato, usando los endpoints existentes de transformar, descargar y eliminar para cada documento.
- [x] **Resumen de postulante**: el tablero company usa nombre, foto, teléfono y habilidades únicamente cuando el nuevo campo `candidate` los devuelve; mantiene un estado honesto para perfiles incompletos.

- [!] **Aprobar postulación**: `POST /api/v1/recruitment/applications/{id}/approve` recibe body JSON `{ "channels": ["Email", "WhatsApp"] }`. El frontend ya permite seleccionar canales externos opcionales y usa el estado devuelto; falta la prueba local con una company propietaria de la vacante.
- [!] **Rechazar postulación**: `POST /api/v1/recruitment/applications/{id}/reject` recibe `{ "message": "opcional", "channels": ["Email", "WhatsApp"] }`. El frontend envía el mensaje opcional omitido y los canales seleccionados; falta validar la respuesta real.
- [!] **Estados de postulación y avisos**: aprobar/rechazar ahora persisten `Accepted`/`Rejected` antes de publicar la notificación asíncrona en RabbitMQ. Validar que la lista de la company se refresque con el estado devuelto incluso si el envío externo de Email o WhatsApp falla.
- [!] **CV estructurado**: `POST /api/v1/cv/structured` ya usa en el servicio el DTO actual con `header`, `summary`, `experience[]`, `education[]`, `skills`, `languages`, `certifications`, `projects`, `awards` y `customSections[]`. Falta una prueba de creación real, pues aún no hay un formulario que lo invoque desde la UI.
- [!] **PDF de CV estructurado**: `POST /api/v1/cv/{id}/transform` ya se ejecuta desde el generador antes de `GET /api/v1/cv/{id}/file`; falta comprobar localmente que Playwright y el almacenamiento generen el PDF.
- [!] **Eliminar CV**: `DELETE /api/v1/cv/{id}` ahora borra también el contenido estructurado y el PDF almacenado. Validar eliminación y posterior `GET /file` con un CV real.
- [-] **Recomendaciones**: se añadieron entidades y repositorio de dominio, pero todavía no existe un controlador REST para que el frontend solicite o registre interacciones. El frontend no debe asumir disponibilidad del recomendador interno.

## Acceso y separación por usuario

### Candidato

- [x] Ruta exclusiva `/job-search` protegida con rol `employee`.
- [x] Ruta exclusiva `/my-applications` protegida con rol `employee`.
- [x] Ruta exclusiva `/message/e` protegida con rol `employee`.
- [x] La vista de empleo oculta acciones administrativas y permite postular.
- [x] El rol se mapea desde `profileType = Candidate` hacia `employee`.

### Company

- [x] Ruta exclusiva `/job-publish` protegida con rol `organization`.
- [x] Ruta exclusiva `/applications` protegida con rol `organization`.
- [x] Ruta exclusiva `/message/c` protegida con rol `organization`.
- [x] La vista de empleo muestra acciones administrativas y oculta la postulación.
- [x] El rol se mapea desde `profileType = Company` hacia `organization`.

### Vistas compartidas

- [x] `/home` es compartida y adapta sus acciones al rol.
- [x] `/home` renderiza un dashboard distinto: oportunidades para candidato y administración de vacantes para company.
- [x] `/news` es exclusiva de candidato. No se muestra en la navegación de company y el guard redirige a `/home` ante acceso directo.
- [x] `/settings` es compartida y cambia secciones según el rol.
- [x] `/job/:id` es compartida, con acciones diferentes para candidato y company.
- [x] El mapeo autoritativo reconoce `Candidate` y `Company`; las rutas no autorizadas regresan a `/home`.

## Auditoría de exposición por endpoint y rol (30/08/2026)

Esta auditoría distingue un endpoint consumido desde una vista de uno que solo existe en el backend. No se agrega una acción al frontend si no corresponde al rol, no tiene datos suficientes o pertenece a otro proceso.

### Compartidos: autenticación y sesión

- [x] Candidato y company consumen `POST /auth/sign-up`, `POST /auth/sign-in`, `GET /auth/me` y `POST /auth/refresh`.
- [x] Google OAuth consume `GET /auth/google/url` y `POST /auth/google/authenticate` desde las pantallas de acceso.
- [x] Recuperación de contraseña usa `POST /password/forgot`, `/verify` y `/reset`.
- [x] `POST /password/change` y `POST /password/set` tienen una vista autenticada en Configuración > Seguridad. Ambas envían `currentPassword` y `newPassword`, tal como el controlador actual exige.

### Candidato: perfil, oportunidades y CV

- [x] Inicio, exploración y detalle consumen `GET /job` y `GET /job/{id}` con datos reales para el candidato.
- [x] La postulación consume `POST /recruitment/applications/send` con `jobId` y CV en `multipart/form-data`.
- [x] `/my-applications` consume `GET /recruitment/applications/me` y muestra el historial real del candidato autenticado.
- [x] El candidato puede crear y actualizar su perfil con `POST/PUT /profile/candidate`, además de `PATCH /profile/upload-photo`.
- [x] `GET /profile/me` carga el perfil de la sesión actual y actualiza el `profileId` local. `GET /profile/{id}` se conserva para consultas explícitas, como el perfil de un postulante desde company.
- [x] `POST /profile/ruc/{ruc}/validate` se usa únicamente cuando corresponde validar RUC; no se presenta como verificación de DNI.
- [x] `GET /profile/{profileId}` devuelve `languages`, `educations` y `workExperiences`; Configuración carga las colecciones reales y cada edición reemplaza la lista completa mediante `PATCH /profile/language`, `/education` o `/experience`.
- [-] Certificaciones no tienen endpoint y se mantienen ocultas.
- [x] El generador y la biblioteca de CV consumen `GET /cv/me`, `POST /cv`, `POST /cv/uploaded`, `GET /cv/{id}/structured`, `POST /cv/{id}/transform`, `GET /cv/{id}/file` y `DELETE /cv/{id}` según la acción disponible.
- [ ] `POST /cv/structured` está alineado en el servicio, pero aún no cuenta con formulario de creación estructurada.
- [x] Novedades es solo de candidato: usa feed, creación y búsqueda con `GET /news/feed/{profileId}`, `POST /news` y `POST /news/search`. El título se deriva del contenido real, no de un texto fijo.
- [ ] `GET /news/{id}` y `DELETE /news/{id}/{profileId}` están disponibles en el servicio, pero no tienen acción visible en la vista actual.
- [x] La bandeja del candidato usa `GET /conversation/me`, carga el historial con `GET /conversation/{id}` y envía con `POST /conversation/send-message`.

### Company: vacantes, postulantes y pagos

- [x] La company crea vacantes con `POST /job`, consulta las propias con `GET /job/company/{companyId}` y elimina con `DELETE /job/{id}`.
- [x] La vista de detalle compartida usa `GET /job/{id}` y oculta la postulación para company.
- [ ] `PUT /job/{id}`, `PATCH /job/{id}/schedule` y `PATCH /job/{id}/skill` cuentan con cliente alineado, pero no tienen una pantalla de edición publicada.
- [-] `PATCH /job/{id}/claim` requiere una confirmación de propiedad que la UI no ofrece; no se ejecuta automáticamente.
- [-] `POST /job/sync` pertenece al scraper y nunca se expone en el navegador.
- [x] Seguimiento de postulantes consulta `GET /recruitment/applications/job/{jobId}` y usa aprobar/rechazar con sus cuerpos reales.
- [x] El tablero presenta el resumen `candidate` devuelto por la API (nombre, foto, teléfono y habilidades) y no completa información ausente con valores ficticios.
- [x] `GET /recruitment/applications/{id}` se usa en el detalle de postulante para descargar el CV real enviado. No se usa como historial ni ficha del candidato porque la respuesta es un archivo.
- [x] El envío manual de avisos usa `POST /notifications/send` con el `candidateId` real como `profileId`; el listado propio del navbar usa `GET /notifications`.
- [x] Company crea pagos y captura órdenes con `POST /payments/create` y `POST /payments/capture/{orderId}`.
- [x] Company enumera conversaciones por sus vacantes con `GET /conversation/job/{jobId}`, consulta el detalle e historial con `GET /conversation/{id}` y envía con `POST /conversation/send-message` cuando existe un `conversationId` real.
- [x] Desde el postulante la company puede resolver el `userId` real con `GET /profile/{candidateProfileId}` e iniciar o reutilizar una conversación con `POST /conversation`. La gestión visible permite añadir, retirar y eliminar participantes mediante los identificadores que el contrato devuelve; no se fabrican nombres ni contactos.
- [x] Novedades no se muestra ni se puede abrir para company.

### Capacidades generales aún sin superficie

- [x] `GET /skill` alimenta el selector reutilizable de habilidades de perfil candidato y publicación de vacantes. Si el catálogo falla, la UI informa el error y permite escribir un valor real que el backend acepta como texto.
- [x] `GET /news/job/{jobId}/profile/{profileId}` se muestra en el detalle de vacante y `GET /news/profile/{profileId}/own/{ownId}` en la pestaña “Mis publicaciones” de Novedades.
- [-] La API no expone endpoints REST del recomendador híbrido. Las recomendaciones externas se tratan como complemento y el inicio conserva empleos reales cuando ese servicio no responde.

## Responsive y accesibilidad de las vistas auditadas

- [x] La navbar conserva navegación superior y se transforma en menú móvil; no se utiliza un sidebar global.
- [x] Inicio, explorar empleos, postulaciones de candidato, seguimiento de company, mensajes, ajustes y Novedades cuentan con breakpoints para tablet y móvil.
- [x] Las acciones principales e inputs del sistema visual respetan alturas táctiles mínimas de 46 px y 48 px respectivamente.
- [x] Las vistas nuevas conservan foco visible, etiquetas asociadas y estados informativos cuando la API no ofrece datos suficientes.
- [!] La verificación visual automatizada en el navegador aislado sigue pendiente: el proceso no logra conectarse al servidor Vite local desde ese entorno. La compilación de tipos sí es correcta.

## Autenticación y sesión

- [x] `POST /api/v1/auth/sign-up` consume `email` y `password`.
- [x] `POST /api/v1/auth/sign-in` consume `email` y `password`.
- [x] `GET /api/v1/auth/me` se utiliza para restaurar la sesión.
- [x] El frontend consume `profileType` y conserva compatibilidad con `userType`.
- [x] Se reconocen `Candidate`, `Company`, `employee` y `organization` sin depender de capitalización.
- [x] `sign-in`, `auth/me` y `refresh` devuelven `profileType` y `profileId` para perfiles existentes. El frontend conserva ambos valores reales para restaurar rol, navegación y consultas de perfil.
- [x] El logout es local y ya no llama a `POST /auth/sign-out`.
- [x] `GET /auth/me` acepta la respuesta directa de `UserData` y también el formato anidado usado por sign-in/sign-up.
- [x] La sesión se renueva con `POST /api/v1/auth/refresh`; ante `401` se actualizan tokens y se reintenta una vez.
- [x] Se retiraron `GET /auth/users/{id}` y `GET /auth/users/{id}/role` porque no existen.
- [x] Google OAuth intercambia el `code` mediante `POST /api/v1/auth/google/authenticate`; ya no confunde `id_token` con refresh token.

## Contraseñas

- [x] La recuperación usa `POST /api/v1/password/forgot` y valida la respuesta booleana.
- [x] El código se verifica con `POST /api/v1/password/verify`.
- [x] La nueva contraseña se establece con `POST /api/v1/password/reset` y maneja `204 No Content`.
- [x] La vista de Seguridad de cuenta permite enviar `POST /api/v1/password/change` y `POST /api/v1/password/set` con sus estados de carga, error y éxito.
- [!] Aunque existe `SetPasswordRequest`, el controlador actual conecta `/password/set` al mismo `ChangePasswordUseCase`, por lo que solicita `currentPassword` y `newPassword`. La UI refleja el contrato real; conviene corregirlo en backend si se requiere una contraseña inicial sin contraseña previa.

## Perfiles compartidos

- [x] `GET /api/v1/profile/me` recupera el perfil sin depender de estado local. `GET /api/v1/profile/{id}` sigue requiriendo un `profileId`, nunca un `userId`.
- [x] Crear candidato con `POST /api/v1/profile/candidate` y `multipart/form-data`.
- [x] Crear company con `POST /api/v1/profile/company` y `multipart/form-data`.
- [x] Actualizar candidato con `PUT /api/v1/profile/candidate`, sin `userId` en la URL.
- [x] Actualizar company con `PUT /api/v1/profile/company`, sin `userId` en la URL.
- [x] Subir foto con `PATCH /api/v1/profile/upload-photo`; en perfiles nuevos se incluye en el formulario de creación.
- [ ] `POST /api/v1/profile/{profileId}/verify` está alineado en el servicio, pero todavía no tiene una acción visible de verificación de company.
- [x] Validar RUC mediante `POST /api/v1/profile/ruc/{ruc}/validate`.
- [x] Se retiraron del servicio las rutas CRUD inexistentes de idiomas, educación y experiencia.
- [x] `PATCH /api/v1/profile/language`, `/education` y `/experience` están disponibles para candidato después de cargar las colecciones reales desde `ProfileResponse`; el frontend no envía claves locales de UI ni campos fuera del DTO.
- [-] Certificaciones no tienen endpoint en el contrato actual; deben ocultarse o conservarse solo localmente como borrador no persistido, indicándolo claramente.
- [-] `/profile/{userId}/bootstrap` no existe; la completitud debe calcularse con `ProfileResponse` real.
- [x] La UI permite editar experiencia, educación e idiomas con el contrato real. Certificaciones permanecen ocultas porque no tienen endpoint de persistencia.
- [x] La respuesta real se lee desde los objetos `candidate` y `company`, y las habilidades desde `skills`.

## Flujo de candidato

### Inicio y exploración de empleos

- [x] `GET /api/v1/job` alimenta empleos reales en Inicio y Explorar empleos.
- [x] `GET /api/v1/job/{id}` alimenta el detalle real.
- [x] El listado adapta la respuesta resumida sin inventar empleos.
- [!] El recomendador usa un servicio externo; validar disponibilidad y correspondencia por `source_url`.
- [ ] Conservar un estado vacío cuando el recomendador no responda, usando empleos reales como alternativa si existen.

### Postulación

- [x] `POST /api/v1/recruitment/applications/send` usa `multipart/form-data`.
- [x] Se envían `jobId` y archivo `cv`.
- [x] `GET /api/v1/recruitment/applications/me` lista las postulaciones del candidato autenticado.
- [-] `GET /applications/{id}` descarga el CV; no representa el historial del candidato.
- [x] `/my-applications` informa la limitación sin mostrar registros ficticios.

### Mensajes del candidato

- [x] `GET /conversation/me` lista las conversaciones del candidato autenticado.
- [x] `GET /conversation/{id}` entrega mensajes cronológicos y la UI los presenta como historial real.
- [x] `POST /conversation/send-message` envía el contenido y la UI recarga el detalle confirmado por backend.

### Currículum

- [!] El servicio de `POST /api/v1/cv/structured` usa el DTO estructurado actual, en lugar de `sections[]`; falta una llamada real desde una vista.
- [x] El servicio sube CV con `POST /api/v1/cv/uploaded` y `multipart/form-data`.
- [x] El servicio consulta CV estructurado con `GET /api/v1/cv/{id}/structured`.
- [!] La descarga ejecuta `POST /api/v1/cv/{id}/transform` antes de recuperar el archivo con `GET /api/v1/cv/{cvId}/file`; falta prueba local completa.
- [!] El servicio elimina CV con `DELETE /api/v1/cv/{id}`; validar que el archivo PDF y el contenido asociado no queden accesibles.
- [x] La generación asistida usa `POST /api/v1/cv`, procesa `202 Accepted` y conserva `cvId`.
- [x] `GET /api/v1/cv/me` alimenta una biblioteca de CV del candidato; no lista documentos de company.
- [x] Se retiró el consumo de los endpoints inexistentes `/status`, `/preview` y `/download`; mientras el proceso está pendiente se consulta el archivo de forma acotada.

## Flujo de company

### Publicación y administración de empleos

- [x] La creación usa `CreateInternalJobRequest`.
- [x] Se envían `workHours`, `educationLevel`, `location` y `payment` con la estructura del backend.
- [x] No se envía `companyId`; el backend obtiene la company desde la sesión.
- [x] El servicio `PUT /api/v1/job/{id}` usa el DTO completo real de creación/edición.
- [x] `DELETE /api/v1/job/{id}` maneja correctamente la respuesta `204 No Content`.
- [x] El servicio de agenda usa `PATCH /api/v1/job/{id}/schedule` con ambas fechas requeridas; no se muestra una acción hasta tener formulario de edición.
- [x] Las habilidades usan `PATCH /api/v1/job/{id}/skill` enviando `skills: string[]`.
- [-] `GET /job/{id}/skills` y `DELETE /job/{jobId}/skill/{skillId}` no existen.
- [x] El servicio dispone de `PATCH /api/v1/job/{id}/claim`; la acción no se muestra automáticamente para evitar reclamar ofertas sin confirmación explícita.
- [x] La sincronización del scraper fue retirada del servicio frontend; solo corresponde al proceso de scraping.

### Gestión de postulantes

- [x] La company selecciona primero una vacante propia obtenida con su `companyProfileId`.
- [x] Las postulaciones se cargan mediante `GET /api/v1/recruitment/applications/job/{jobId}`.
- [x] La respuesta se adapta únicamente desde `id`, `candidateId`, `status` y `createdAt`.
- [x] La UI no asume nombre, fotografía, correo, teléfono, ubicación ni mensajes que la API no devuelve.
- [!] Aprobar envía `channels: NotificationChannel[]` (`Email` y/o `WhatsApp`) a `POST /api/v1/recruitment/applications/{id}/approve`, bloquea transiciones que no parten de `Pending` y aplica el estado devuelto; falta prueba local.
- [!] Rechazar envía `message` opcional y `channels: NotificationChannel[]` a `POST /api/v1/recruitment/applications/{id}/reject`, bloquea transiciones que no parten de `Pending` y aplica el estado devuelto; falta prueba local.
- [x] La acción “Seleccionar” fue retirada porque no tiene endpoint ni estado equivalente.
- [x] Las notificaciones usan el `candidateId` real como `profileId`, no un objeto `applicant` inexistente.

### Mensajes de company

- [x] Las vistas de mensajes y promoción obtienen primero el `companyProfileId` real almacenado al cargar el perfil.
- [x] Consultan empleos con `GET /api/v1/job/company/{companyId}` usando el ID de perfil, no el ID de usuario.
- [x] Listar conversaciones por vacante con `GET /api/v1/conversation/job/{jobId}`.
- [x] Crear conversación con `POST /api/v1/conversation` cuando se conocen la vacante y usuarios.
- [x] Enviar contenido con `POST /api/v1/conversation/send-message`.
- [-] El backend no expone mensajes históricos dentro de la conversación.

### Pagos y promoción

- [x] La base correcta de Payments es `/api/payments` sin `/v1`.
- [x] Crear orden usa `POST /api/payments/create`.
- [x] La captura usa `POST /api/payments/capture/{orderId}` sin body ficticio.
- [x] La creación envía `creditPlan`, `platform`, `returnUrl` y `cancelUrl` según el DTO real.
- [x] Se retiró el consumo de `GET /api/payments/balance`; la UI explica que el saldo solo se conoce tras capturar una compra.
- [-] Los planes `Boost7/Boost15/Boost30` no existen; la promoción de vacantes queda deshabilitada sin simular una compra.

## Novedades y notificaciones

- [x] Novedades es candidata únicamente; company no tiene enlace ni acceso a `/news`.
- [x] Feed: `GET /api/v1/news/feed/{profileId}`.
- [x] Detalle: `GET /api/v1/news/{id}`.
- [x] Crear: `POST /api/v1/news`.
- [x] Eliminar: `DELETE /api/v1/news/{id}/{profileId}`.
- [x] Reacciones, comentarios, compartidos y contadores simulados fueron retirados porque no tienen endpoint.
- [x] Novedades usa `POST /api/v1/news/search` para la búsqueda textual real.
- [x] La vista no simula autor, avatar, título ni resultados: utiliza el título y contenido devueltos por la API; en creación, el título se deriva del texto escrito por el usuario.
- [x] Notificaciones propias: `GET /api/v1/notifications`.
- [x] Envío: `POST /api/v1/notifications/send` usa el `candidateId` real como `profileId` desde el seguimiento de company; falta prueba local de permisos.
- [x] El navbar usa `GET /api/v1/notifications`; se retiraron los contadores ficticios de mensajes.
- [-] La configuración de preferencias por usuario, pruebas manuales de WhatsApp y vista previa ficticia se retiraron: el backend no expone un endpoint para esas preferencias.

## Endpoints incorporados en esta ronda

- [x] `GET /api/v1/skill`.
- [x] `GET /api/v1/news/job/{jobId}/profile/{profileId}`.
- [x] `GET /api/v1/news/profile/{profileId}/own/{ownId}`.
- [x] `POST /api/v1/conversation/{id}/users`.
- [x] `DELETE /api/v1/conversation/{id}/users`.
- [x] `POST /api/v1/conversation` y `DELETE /api/v1/conversation/{id}`.
- [x] `GET /api/v1/recruitment/applications/{id}`.
- [x] `POST /api/v1/password/change` y `POST /api/v1/password/set`.
- [x] `POST /api/v1/auth/refresh`.
- [x] `GET /api/v1/profile/me`.
- [x] `GET /api/v1/conversation/me`.
- [x] `GET /api/v1/recruitment/applications/me`.
- [x] `GET /api/v1/cv/me`.

## Registro de validaciones

- [x] 28/08/2026 — Inventario estático de controladores de `backend-v2/clean`.
- [x] 28/08/2026 — Cruce de servicios, vistas y rutas del frontend.
- [x] 28/08/2026 — `npm run type-check` completado correctamente.
- [x] 30/08/2026 — Revisión estática del `git pull` de `clean` (`24ec944..e02edc6`): reclutamiento, CV/PDF, eliminación de CV y dominio de recomendaciones.
- [x] 30/08/2026 — Reclutamiento company — Cuerpos reales de aprobación/rechazo, selección opcional de canales y protección de transiciones fuera de `Pending` — `npm run type-check` correcto.
- [x] 30/08/2026 — CV y postulaciones candidato — DTO de CV estructurado actualizado, generación PDF previa a la descarga y estado informativo sin request inexistente para el historial candidato — `npm run type-check` correcto.
- [x] 30/08/2026 — Auditoría por rol — Rutas de Novedades limitadas a candidato, tablero company sin identidad inventada, título de post real y retiro de preferencias/CRUD inexistentes — `npm run type-check` correcto.
- [x] 30/08/2026 — Endpoints pendientes — Seguridad de cuenta, catálogo de habilidades, publicaciones propias/de vacante, descarga de CV y gestión real de conversaciones company — `npm run type-check` correcto.
- [ ] Prueba local completa de candidato.
- [ ] Prueba local completa de company.
- [ ] Verificación de requests y responses en Network/Swagger después de cada corrección.

## Historial de correcciones frontend

Agregar aquí cada cambio confirmado con el formato:

`AAAA-MM-DD — Área — Cambio realizado — Validación ejecutada — Commit`

- 2026-08-28 — Autenticación — Mapeo real de `profileType`, soporte de respuesta directa de `/auth/me`, logout local y redirección a `/home` — Pendiente commit.
- 2026-08-29 — Perfiles — Rutas y métodos reales para candidate/company, formularios multipart, foto, validación RUC, mapeo de respuesta y protección de historiales no recuperables — Pendiente commit.
- 2026-08-29 — Empleos company — Publicación adaptada al DTO real, detalle separado por rol, eliminación 204, actualización de habilidades e identificación por `companyProfileId` — `npm run type-check` correcto — Pendiente commit.
- 2026-08-29 — Postulantes company — Selección de vacante real, listado por `jobId`, estados `Pending/Accepted/Rejected`, campos reales y retiro de selección ficticia — Pendiente validación final y commit.
- 2026-08-29 — Contraseñas — Recuperación completa por correo, verificación de código y restablecimiento usando `/password/*`; métodos autenticados alineados — Pendiente validación final y commit.
- 2026-08-29 — Currículum — Servicio alineado a CV estructurado/subido, generación 202, archivo real, eliminación y retiro de rutas inexistentes — Pendiente validación final y commit.
- 2026-08-29 — Pagos — DTO real de creación, plataforma PayPal, captura por URL, retiro de saldo inexistente y bloqueo de planes Boost no soportados — Pendiente validación final y commit.
- 2026-08-29 — Flujo por rol — Refresh automático, Google OAuth real, Home company, navbar con notificaciones, contratos de edición de empleo y retiro de interacciones/datos simulados — Pendiente validación final y commit.
- 2026-08-29 — Mensajes y novedades — Mensajería sin historial ficticio, confirmación real de envío y búsqueda de novedades conectada — Pendiente validación final y commit.
- 2026-08-30 — Contratos nuevos de backend — Documentados los bodies obligatorios de aprobación/rechazo, la transformación PDF de CV y la migración pendiente del DTO estructurado — Revisión estática de `clean` completada — Sin cambios funcionales en frontend.
- 2026-08-30 — Reclutamiento company — Decisiones alineadas a `channels`, estado devuelto por backend y transiciones permitidas — `npm run type-check` correcto — Pendiente prueba local y commit.
- 2026-08-30 — CV y candidato — Contrato estructurado de CV, transformación a PDF durante el polling y estado sin historial de postulaciones no disponible — `npm run type-check` correcto — Pendiente prueba local y commit.
- 2026-08-30 — Auditoría endpoint–rol — Novedades restringida a candidato, perfiles consultados solo por `profileId`, postulantes sin datos inventados y preferencias de notificación sin endpoint retiradas — `npm run type-check` correcto — Pendiente prueba local y commit.
- 2026-08-30 — Integración de endpoints restantes — Vista de seguridad para ambos roles, selector de habilidades con catálogo real, novedades propias/de vacante, descarga del CV y ciclo visible de conversación para company — `npm run type-check` correcto — Pendiente prueba local y commit.
- 2026-08-31 — Perfil candidato — Consumo de `languages`, `educations` y `workExperiences` de `ProfileResponse`; reemplazo seguro de cada colección mediante los tres PATCH, niveles CEFR y códigos de idioma del contrato — `npm run type-check` correcto — Pendiente prueba local y commit.
- 2026-08-31 — Sesión, perfil, mensajería, postulaciones y CV — Adaptación al `clean` b022f81: perfil propio, `profileId` de sesión, bandeja/historial, historial de postulaciones, biblioteca de CV y resumen de candidato — `npm run type-check` correcto — Pendiente prueba local y commit.
