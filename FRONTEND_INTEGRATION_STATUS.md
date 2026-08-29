# Estado de integración frontend–backend

Última actualización: 29 de agosto de 2026

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
- [x] `/news` es compartida.
- [x] `/settings` es compartida y cambia secciones según el rol.
- [x] `/job/:id` es compartida, con acciones diferentes para candidato y company.
- [x] El mapeo autoritativo reconoce `Candidate` y `Company`; las rutas no autorizadas regresan a `/home`.

## Autenticación y sesión

- [x] `POST /api/v1/auth/sign-up` consume `email` y `password`.
- [x] `POST /api/v1/auth/sign-in` consume `email` y `password`.
- [x] `GET /api/v1/auth/me` se utiliza para restaurar la sesión.
- [x] El frontend consume `profileType` y conserva compatibilidad con `userType`.
- [x] Se reconocen `Candidate`, `Company`, `employee` y `organization` sin depender de capitalización.
- [x] El logout es local y ya no llama a `POST /auth/sign-out`.
- [x] `GET /auth/me` acepta la respuesta directa de `UserData` y también el formato anidado usado por sign-in/sign-up.
- [ ] Implementar renovación con `POST /api/v1/auth/refresh` o retirar supuestos de sesión no soportados.
- [ ] Eliminar o dejar fuera de uso `GET /auth/users/{id}` y `GET /auth/users/{id}/role`; no existen.

## Contraseñas

- [x] La recuperación usa `POST /api/v1/password/forgot` y valida la respuesta booleana.
- [x] El código se verifica con `POST /api/v1/password/verify`.
- [x] La nueva contraseña se establece con `POST /api/v1/password/reset` y maneja `204 No Content`.
- [x] El servicio autenticado dispone de `POST /api/v1/password/change` con `currentPassword` y `newPassword`.
- [!] El servicio dispone de `POST /api/v1/password/set`; falta una vista que determine cuándo debe usarse y el backend actualmente recibe `ChangePasswordRequest` también para esta operación.

## Perfiles compartidos

- [!] `GET /api/v1/profile/{id}` existe; confirmar si cada vista conserva correctamente el `profileId` en lugar del `userId`.
- [x] Crear candidato con `POST /api/v1/profile/candidate` y `multipart/form-data`.
- [x] Crear company con `POST /api/v1/profile/company` y `multipart/form-data`.
- [x] Actualizar candidato con `PUT /api/v1/profile/candidate`, sin `userId` en la URL.
- [x] Actualizar company con `PUT /api/v1/profile/company`, sin `userId` en la URL.
- [x] Subir foto con `PATCH /api/v1/profile/upload-photo`; en perfiles nuevos se incluye en el formulario de creación.
- [x] Verificar company mediante `POST /api/v1/profile/{profileId}/verify`, usando el `profileId` conservado.
- [x] Validar RUC mediante `POST /api/v1/profile/ruc/{ruc}/validate`.
- [ ] Sustituir el CRUD ficticio de idiomas por `PATCH /api/v1/profile/language` con la lista completa.
- [ ] Sustituir el CRUD ficticio de educación por `PATCH /api/v1/profile/education` con la lista completa.
- [ ] Sustituir el CRUD ficticio de experiencia por `PATCH /api/v1/profile/experience` con la lista completa.
- [-] Certificaciones no tienen endpoint en el contrato actual; deben ocultarse o conservarse solo localmente como borrador no persistido, indicándolo claramente.
- [-] `/profile/{userId}/bootstrap` no existe; la completitud debe calcularse con `ProfileResponse` real.
- [x] La UI bloquea edición de experiencia, educación, idiomas y certificaciones para evitar reemplazar datos que la API no permite recuperar.
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
- [-] No existe endpoint para listar las postulaciones del candidato autenticado.
- [-] `GET /applications/{id}` descarga el CV; no representa el historial del candidato.
- [x] `/my-applications` informa la limitación sin mostrar registros ficticios.

### Mensajes del candidato

- [-] No existe endpoint para listar todas las conversaciones del candidato.
- [-] `GET /conversation/{id}` no devuelve el historial de mensajes.
- [x] La vista informa que la bandeja no está disponible con el contrato actual.
- [!] `POST /conversation/send-message` puede utilizarse cuando ya se conoce un `conversationId` válido.

### Currículum

- [ ] Crear CV estructurado con `POST /api/v1/cv/structured`.
- [ ] Subir CV con `POST /api/v1/cv/uploaded` y `multipart/form-data`.
- [ ] Consultar CV estructurado con `GET /api/v1/cv/{id}/structured`.
- [ ] Descargar archivo con `GET /api/v1/cv/{cvId}/file`.
- [ ] Eliminar CV con `DELETE /api/v1/cv/{id}`.
- [ ] Adecuar generación asistida a `POST /api/v1/cv` y su respuesta `202 Accepted`.
- [-] Los endpoints `/status`, `/preview` y `/download` usados actualmente no existen.

## Flujo de company

### Publicación y administración de empleos

- [x] La creación usa `CreateInternalJobRequest`.
- [x] Se envían `workHours`, `educationLevel`, `location` y `payment` con la estructura del backend.
- [x] No se envía `companyId`; el backend obtiene la company desde la sesión.
- [!] `PUT /api/v1/job/{id}` existe; validar el DTO de edición antes de habilitar la vista.
- [x] `DELETE /api/v1/job/{id}` maneja correctamente la respuesta `204 No Content`.
- [!] `PATCH /api/v1/job/{id}/schedule` existe, pero no está conectado a una vista activa.
- [x] Las habilidades usan `PATCH /api/v1/job/{id}/skill` enviando `skills: string[]`.
- [-] `GET /job/{id}/skills` y `DELETE /job/{jobId}/skill/{skillId}` no existen.
- [!] `PATCH /api/v1/job/{id}/claim` existe y todavía no tiene acción frontend.
- [x] La sincronización del scraper fue retirada del servicio frontend; solo corresponde al proceso de scraping.

### Gestión de postulantes

- [x] La company selecciona primero una vacante propia obtenida con su `companyProfileId`.
- [x] Las postulaciones se cargan mediante `GET /api/v1/recruitment/applications/job/{jobId}`.
- [x] La respuesta se adapta únicamente desde `id`, `candidateId`, `status` y `createdAt`.
- [x] La UI no asume nombre, fotografía, correo, teléfono, ubicación ni mensajes que la API no devuelve.
- [!] Aprobar utiliza `POST /api/v1/recruitment/applications/{id}/approve`, pero el caso de uso actual termina lanzando `NotImplementedException` después de guardar; el frontend vuelve a consultar para reflejar el estado persistido.
- [x] Rechazar utiliza `POST /api/v1/recruitment/applications/{id}/reject`.
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
- [ ] Capturar orden debe usar `POST /api/payments/capture/{orderId}`.
- [-] `GET /api/payments/balance` no existe; no mostrar un saldo obtenido de esa ruta.

## Novedades y notificaciones

- [x] Feed: `GET /api/v1/news/feed/{profileId}`.
- [x] Detalle: `GET /api/v1/news/{id}`.
- [x] Crear: `POST /api/v1/news`.
- [x] Eliminar: `DELETE /api/v1/news/{id}/{profileId}`.
- [-] Reacciones o “me gusta” no tienen endpoint.
- [ ] Revisar si búsqueda y publicaciones por empleo/perfil deben exponerse en alguna vista real.
- [x] Notificaciones propias: `GET /api/v1/notifications`.
- [!] Envío: `POST /api/v1/notifications/send`; validar permisos y `profileId` antes de activarlo para company.
- [ ] Reemplazar los contadores estáticos del navbar por la respuesta real de notificaciones.

## Endpoints existentes todavía sin vista conectada

- [ ] `GET /api/v1/skill`.
- [ ] `POST /api/v1/news/search`.
- [ ] `GET /api/v1/news/job/{jobId}/profile/{profileId}`.
- [ ] `GET /api/v1/news/profile/{profileId}/own/{ownId}`.
- [ ] `POST /api/v1/conversation/{id}/users`.
- [ ] `DELETE /api/v1/conversation/{id}/users`.
- [ ] `POST /api/v1/auth/refresh`.

## Registro de validaciones

- [x] 28/08/2026 — Inventario estático de controladores de `backend-v2/clean`.
- [x] 28/08/2026 — Cruce de servicios, vistas y rutas del frontend.
- [x] 28/08/2026 — `npm run type-check` completado correctamente.
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
