# Llanqui API - Documentación para el Frontend

Bienvenido a la documentación de la API REST de **Llanqui**. Esta API está construida sobre ASP.NET Core utilizando una arquitectura limpia (Clean Architecture). 

Este documento detalla todos los endpoints disponibles, sus funcionalidades, parámetros requeridos y formatos de respuesta para facilitar la integración con el frontend.

---

## 🚀 Información General

* **Base URL (Desarrollo):** `http://localhost:5155`
* **Formato de datos:** `application/json`
* **Autenticación:** Cabecera `Authorization: Bearer <JWT_TOKEN>` (para endpoints protegidos).

---

## 🔒 1. Autenticación (`/api/v1/auth`)

Módulo encargado del registro de usuarios, inicio de sesión (email/password y Google OAuth), recuperación de contraseña y consulta ligera de roles.

### Registrar un nuevo usuario (Candidato / Organización)
* **Endpoint:** `POST /api/v1/auth/sign-up`
* **Auth Requerida:** No (Público)
* **Request Body:**
  ```json
  {
    "email": "candidato@example.com",
    "password": "Password123!",
    "userType": "Candidate", // Valores válidos: "Candidate", "Organization"
    "firstName": "Alex", // Opcional (Recomendado si userType es Candidate)
    "lastName": "Llanqui", // Opcional (Recomendado si userType es Candidate)
    "companyName": null // Opcional (Recomendado si userType es Organization)
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
* **Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "VALIDATION_ERROR",
    "message": "La contraseña debe tener al menos una mayúscula, un número y un carácter especial."
  }
  ```

### Iniciar sesión (Obtener Token)
* **Endpoint:** `POST /api/v1/auth/sign-in`
* **Auth Requerida:** No
* **Request Body:**
  ```json
  {
    "email": "candidato@example.com",
    "password": "Password123!"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "...",
    "expiresIn": 3600,
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```

### Obtener URL para Google OAuth
Obtiene la URL para redirigir al usuario al flujo de consentimiento de Google.
* **Endpoint:** `GET /api/v1/auth/google/url`
* **Auth Requerida:** No
* **Query Params:**
  * `userType` (string): Requerido en modo `signup`. Valores: `Candidate` o `Organization`.
  * `mode` (string): Opcional. Valores: `signup` o `login`. (Por defecto: `signup`)
* **Response (200 OK):**
  ```json
  {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  }
  ```

### Intercambiar Código de Google OAuth por Tokens
* **Endpoint:** `POST /api/v1/auth/google/token`
* **Auth Requerida:** No
* **Request Body:**
  ```json
  {
    "code": "4/0AeaYSHI...",
    "userType": "Candidate", // Opcional
    "mode": "signup" // Opcional (signup | login)
  }
  ```
* **Response (200 OK):** Retorna los tokens de acceso de la API.

### Iniciar sesión Google (Directo)
* **Endpoint:** `POST /api/v1/auth/google/sign-in`
* **Auth Requerida:** No
* **Request Body:**
  ```json
  {
    "email": "candidato@gmail.com",
    "userType": "Candidate" // Opcional
  }
  ```
* **Response (200 OK):** Retorna los tokens de acceso.

### Solicitar recuperación de contraseña (Forgot Password)
Envía un correo con el token para resetear la contraseña.
* **Endpoint:** `POST /api/v1/auth/forgot-password`
* **Auth Requerida:** No
* **Request Body:**
  ```json
  {
    "email": "usuario@example.com"
  }
  ```
* **Response (200 OK):** `true` o `false` según el estado de envío.

### Obtener datos del usuario autenticado actual (Me)
* **Endpoint:** `GET /api/v1/auth/me`
* **Auth Requerida:** Sí
* **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "candidato@example.com",
      "userType": "candidate" // Retorna en minúsculas: "candidate" o "organization"
    }
  }
  ```

### Cerrar sesión (Sign Out)
* **Endpoint:** `POST /api/v1/auth/sign-out`
* **Auth Requerida:** Sí
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Sesión cerrada exitosamente"
  }
  ```

### Obtener detalles básicos de un usuario por ID
* **Endpoint:** `GET /api/v1/auth/users/{id}`
* **Auth Requerida:** Sí
* **Response (200 OK):**
  ```json
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "candidato@example.com",
    "userType": "candidate",
    "isActive": true
  }
  ```

### Obtener rol de un usuario por ID (Ligero)
* **Endpoint:** `GET /api/v1/auth/users/{id}/role`
* **Auth Requerida:** Sí
* **Response (200 OK):**
  ```json
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userType": "candidate",
    "isActive": true
  }
  ```

---

## 👤 2. Perfiles (`/api/v1/profile`)

Permite gestionar la información detallada de los usuarios (datos de contacto, DNI/RUC, sector, etc.).

### Crear Perfil de Candidato / Empleado (Requerido para generar CV)
* **Endpoint:** `POST /api/v1/profile/employee`
* **Auth Requerida:** Sí
* **Request Body:**
  ```json
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Debe coincidir con el ID del token
    "firstName": "Alex",
    "lastName": "Llanqui",
    "personType": "Natural", // "Natural" o "Juridica"
    "identificationType": "DNI", // "DNI", "RUC", "CE", etc.
    "identification": "77665544",
    "description": "Desarrollador Full Stack con 5 años de experiencia...", // Opcional
    "keywords": ["React", "Dotnet", "Docker"], // Opcional
    "district": "Lima", // Opcional
    "ruc": "10776655441", // Opcional
    "isRucVerified": false // Opcional
  }
  ```
* **Response (201 Created):** Retorna el objeto `ProfileDto` creado.

### Crear Perfil de Organización / Empresa
* **Endpoint:** `POST /api/v1/profile/organization`
* **Auth Requerida:** Sí
* **Request Body:**
  ```json
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "companyName": "Tech Solutions SAC",
    "description": "Empresa dedicada al desarrollo de software corporativo...", // Opcional
    "keywords": ["SaaS", "AI", "Cloud"], // Opcional
    "ruc": "20776655441", // Opcional
    "isRucVerified": false, // Opcional
    "district": "San Isidro", // Opcional
    "sector": "Tecnología" // Opcional
  }
  ```
* **Response (201 Created):** Retorna el objeto `ProfileDto` creado.

### Obtener Perfil por User ID
* **Endpoint:** `GET /api/v1/profile/{userId}`
* **Auth Requerida:** Sí
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "7fa85f64-5717-4562-b3fc-2c963f66afa7",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "description": "Desarrollador Full Stack...",
      "keywords": ["React", "Dotnet"],
      "ruc": "10776655441",
      "isRucVerified": false,
      "district": "Lima",
      "profilePicture": "https://storage.com/pictures/photo.jpg",
      "firstName": "Alex",
      "lastName": "Llanqui",
      "personType": "Natural",
      "identificationType": "DNI",
      "identification": "77665544",
      "isIdentificationVerified": false,
      "companyName": null,
      "sector": null,
      "isComplete": true,
      "createdAt": "2026-06-22T22:00:00Z",
      "updatedAt": "2026-06-22T22:05:00Z"
    }
  }
  ```

### Actualizar Perfil
Actualiza parcialmente los campos del perfil. Todos los campos del cuerpo son opcionales.
* **Endpoint:** `PUT /api/v1/profile/{userId}`
* **Auth Requerida:** Sí
* **Request Body:**
  ```json
  {
    "description": "Nueva descripción profesional...",
    "keywords": ["React", "Dotnet", "PostgreSQL", "Cloud"],
    "district": "Miraflores",
    "firstName": "Alex",
    "lastName": "Llanqui",
    "ruc": "10776655441",
    "isRucVerified": true
  }
  ```
* **Response (200 OK):** Retorna el perfil actualizado (`ProfileDto`) envuelto en `{ "success": true, "data": ... }`.

### Subir Foto de Perfil
* **Endpoint:** `POST /api/v1/profile/{userId}/upload-photo`
* **Auth Requerida:** Sí
* **Content-Type:** `multipart/form-data`
* **Form-Data Params:**
  * `file`: (Archivo de Imagen)
* **Response (200 OK):** Retorna el perfil actualizado con la URL de la imagen en `profilePicture`.

### Verificar si el perfil está completo
Útil para redirecciones en el onboarding del frontend.
* **Endpoint:** `GET /api/v1/profile/{userId}/is-complete`
* **Auth Requerida:** Sí
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "isComplete": true
  }
  ```

### Validar RUC (Consulta SUNAT/Externa)
* **Endpoint:** `POST /api/v1/profile/validate-ruc`
* **Auth Requerida:** No
* **Request Body:**
  ```json
  {
    "ruc": "20776655441"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "isValid": true,
      "companyName": "Tech Solutions SAC",
      "ruc": "20776655441"
    }
  }
  ```

### Validar formato de DNI
* **Endpoint:** `POST /api/v1/profile/validate-dni`
* **Auth Requerida:** No
* **Request Body:**
  ```json
  {
    "dni": "77665544"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "isValid": true,
    "dni": "77665544"
  }
  ```

---

## 📄 3. Generación de CV (`/api/v1/cv`)

Permite la creación de CVs en formato HTML/PDF optimizados por Inteligencia Artificial de forma asíncrona. **Requiere saldo de créditos** (cada generación consume 1 crédito).

### Generar CV (Inicia proceso asíncrono)
* **Endpoint:** `POST /api/v1/cv`
* **Auth Requerida:** Sí
* **Request Body:**
  ```json
  {
    "mode": "General", // Modos válidos: "General", "JobPosting", "Skills", "Experience"
    "prompt": "Optimiza mi CV para un puesto de Senior Software Engineer enfocado en backend .NET y arquitectura de microservicios."
  }
  ```
* **Response (202 Accepted):**
  ```json
  {
    "cvGenerationId": "6fa85f64-5717-4562-b3fc-2c963f66afa8",
    "status": "Pending", // Puede ser: Pending, Processing, Completed, Failed
    "message": "CV generation started successfully"
  }
  ```
* **Response (402 Payment Required):**
  Si el usuario no tiene saldo suficiente de créditos.
  ```json
  {
    "title": "Sin créditos disponibles",
    "status": 402,
    "detail": "No tienes créditos disponibles en tu cuenta."
  }
  ```

### Consultar estado del proceso del CV
El frontend debe realizar *polling* (ej. cada 3-5 segundos) a este endpoint mientras el estado sea `Pending` o `Processing`.
* **Endpoint:** `GET /api/v1/cv/{id}/status`
* **Auth Requerida:** Sí
* **Response (200 OK):**
  ```json
  {
    "cvGenerationId": "6fa85f64-5717-4562-b3fc-2c963f66afa8",
    "status": "Completed", // Completed | Failed | Processing | Pending
    "errorMessage": null,
    "hasPdf": true,
    "createdAt": "2026-06-22T22:00:00Z",
    "completedAt": "2026-06-22T22:01:15Z"
  }
  ```

### Vista previa del CV en HTML
Obtiene el código HTML crudo para renderizar directamente en el frontend. (Solo disponible si `status` = "Completed").
* **Endpoint:** `GET /api/v1/cv/{id}/preview`
* **Auth Requerida:** Sí
* **Response (200 OK):** Retorna `text/html` con el diseño estructurado.

### Descargar PDF del CV
Descarga el archivo binario PDF del CV. (Solo disponible si `status` = "Completed").
* **Endpoint:** `GET /api/v1/cv/{id}/download`
* **Auth Requerida:** Sí
* **Response (200 OK):** Retorna un stream binario `application/pdf` con la cabecera `Content-Disposition` correspondiente.

---

## 💼 4. Gestión de Empleos (`/api/v1/job`)

Permite registrar, actualizar y listar ofertas de trabajo.

### Crear un nuevo empleo
* **Endpoint:** `POST /api/v1/job`
* **Auth Requerida:** Sí
* **Request Body:**
  ```json
  {
    "companyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Senior C# Backend Developer",
    "description": "Buscamos un programador senior con experiencia en Azure...",
    "jobType": "Remote", // "Remote", "Hybrid", "InPerson"
    "workHours": "FullTime", // "PartTime", "FullTime", "Hourly"
    "skills": [
      { "name": "C#" },
      { "name": "ASP.NET Core" }
    ],
    "experience": "TwoOrMoreYears", // "NoExperienceNeeded", "ThreeMonths", "SixMonths", "OneYear", "TwoOrMoreYears"
    "educationLevel": "University", // "Unspecified", "Primary", "Secondary", "Technical", "University", "Master", "Doctorate"
    "ubigeo": "150101",
    "address": "Calle Las Begonias 456",
    "minSalary": 4000.0,
    "maxSalary": 6000.0,
    "currency": "USD", // "PEN", "USD"
    "salaryPeriod": "Monthly", // "Daily", "Weekly", "Fortnightly", "Monthly", "ForFees"
    "compensationType": "Fixed", // "Fixed", "Commission", "Mixed"
    "opensAt": "2026-06-23T00:00:00Z",
    "closesAt": "2026-07-23T00:00:00Z",
    "jobStatus": "Active", // "Draft", "Scheduled", "Active", "Closed"
    "originPage": "Internal", // "Internal", "EmpleosPeru", "Computrabajo", "Bumeran", "Indeed", "LinkedIn"
    "sourceUrl": null,
    "applyUrl": "http://localhost:5173/jobs/apply"
  }
  ```
* **Response (200 OK):** Retorna `CreateJobResponse` con datos resumidos de la publicación.

### Actualizar un empleo existente
* **Endpoint:** `PUT /api/v1/job/{id}`
* **Auth Requerida:** Sí
* **Request Body:** (Similar a crear, excluye `companyId` y `originPage`)
* **Response (200 OK):** Retorna el empleo actualizado.

### Modificar fechas de visibilidad (Schedule)
* **Endpoint:** `PATCH /api/v1/job/{id}/schedule`
* **Auth Requerida:** Sí
* **Request Body:**
  ```json
  {
    "opensAt": "2026-06-25T00:00:00Z",
    "closesAt": "2026-08-25T00:00:00Z"
  }
  ```

### Eliminar un empleo
* **Endpoint:** `DELETE /api/v1/job/{id}`
* **Auth Requerida:** Sí
* **Response (200 OK):** Confirmación de eliminación.

### Asociar Habilidad a un Empleo
* **Endpoint:** `POST /api/v1/job/{id}/skill`
* **Auth Requerida:** Sí
* **Request Body:**
  ```json
  {
    "skill": "Docker"
  }
  ```

### Quitar Habilidad de un Empleo
* **Endpoint:** `DELETE /api/v1/job/{jobId}/skill/{skillId}`
* **Auth Requerida:** Sí

### Obtener Empleo por ID
* **Endpoint:** `GET /api/v1/job/{id}`
* **Auth Requerida:** Sí

### Listar Todos los Empleos Activos
* **Endpoint:** `GET /api/v1/job`
* **Auth Requerida:** Sí

### Listar Empleos de una Empresa
* **Endpoint:** `GET /api/v1/job/company/{companyId}`
* **Auth Requerida:** Sí

### Listar Habilidades Requeridas por un Empleo
* **Endpoint:** `GET /api/v1/job/{id}/skills`
* **Auth Requerida:** Sí

### Sincronizar Empleos Scrapeados
Utilizado por scrapers externos.
* **Endpoint:** `POST /api/v1/job/sync`
* **Auth Requerida:** Filtro de API-Key interno.
* **Request Body:** Lista de empleos con formato `ScrapedJobRequest`.

---

## 🏷️ 5. Habilidades (`/api/v1/skill`)

Gestión global del catálogo de habilidades/tecnologías del sistema.

* **Crear Habilidad:** `POST /api/v1/skill` (Body: `{ "name": "React" }`)
* **Eliminar Habilidad:** `DELETE /api/v1/skill/{id}`
* **Obtener Habilidad por ID:** `GET /api/v1/skill/{id}`
* **Buscar Habilidad por Nombre exacto:** `POST /api/v1/skill/name` (Body: `{ "name": "React" }`)
* **Listar Todas las Habilidades:** `GET /api/v1/skill`
* **Listar Empleos que requieren una Habilidad:** `GET /api/v1/skill/{id}/jobs`

---

## 💬 6. Mensajería y Conversaciones (`/api/v1/conversation`)

Mensajería instantánea interna entre candidatos y organizaciones relacionada con ofertas laborales.

### Crear una conversación
* **Endpoint:** `POST /api/v1/conversation`
* **Request Body:**
  ```json
  {
    "jobId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "users": [
      "guid-candidato",
      "guid-reclutador"
    ]
  }
  ```

### Enviar Mensaje a una Conversación
* **Endpoint:** `POST /api/v1/conversation/{id}/message`
* **Request Body:**
  ```json
  {
    "senderActorId": "guid-remitente",
    "content": "Hola, estoy interesado en el puesto."
  }
  ```

### Endpoints adicionales de Conversaciones:
* **Eliminar conversación:** `DELETE /api/v1/conversation/{id}`
* **Obtener conversación por ID:** `GET /api/v1/conversation/{id}`
* **Listar conversaciones de un empleo:** `GET /api/v1/conversation/job/{jobId}`
* **Ver usuarios de una conversación:** `GET /api/v1/conversation/{id}/users`
* **Añadir usuarios a conversación:** `POST /api/v1/conversation/{id}/users` (Body: `{ "users": ["guid1", "guid2"] }`)
* **Quitar usuarios de conversación:** `DELETE /api/v1/conversation/{id}/users` (Body: `{ "users": ["guid1", "guid2"] }`)

---

## 📰 7. Publicaciones / Feed de Noticias (`/api/v1/news`)

Módulo que actúa como una red social profesional para publicar actualizaciones y promociones de empleos.

### Crear una Publicación (Post)
* **Endpoint:** `POST /api/v1/news`
* **Request Body:**
  ```json
  {
    "companyId": "guid-empresa",
    "content": "¡Estamos buscando talento! Postula aquí.",
    "postType": "General", // "General" o "JobPromotion"
    "jobId": null // Opcional (Requerido si postType es JobPromotion)
  }
  ```

### Reaccionar / Dar Heart a una Publicación
* **Endpoint:** `PUT /api/v1/news/heart`
* **Request Body:**
  ```json
  {
    "postId": "guid-post",
    "userId": "guid-usuario",
    "isHearted": true // true para dar heart, false para quitar
  }
  ```

### Endpoints adicionales de Noticias:
* **Obtener Feed (Publicaciones ordenadas):** `GET /api/v1/news/feed`
* **Obtener Publicación por ID:** `GET /api/v1/news/{id}`
* **Eliminar Publicación:** `DELETE /api/v1/news/{id}`

---

## 🔔 8. Notificaciones (`/api/v1/notifications`)

Envío de notificaciones y alertas al usuario por base de datos y mensajes de WhatsApp (vía Twilio).

### Obtener mis notificaciones (Listado descendente)
* **Endpoint:** `GET /api/v1/notifications`
* **Response (200 OK):**
  ```json
  [
    {
      "id": "guid-notif",
      "userId": "guid-user",
      "message": "Tu postulación al puesto Senior C# ha sido aprobada.",
      "type": "ApplicationAccepted",
      "status": "Sent",
      "createdAt": "2026-06-22T22:00:00Z",
      "sentAt": "2026-06-22T22:00:02Z"
    }
  ]
  ```

### Enviar/Disparar Notificación Manualmente
* **Endpoint:** `POST /api/v1/notifications/send`
* **Request Body:**
  ```json
  {
    "userId": "guid-usuario-destino",
    "phoneNumber": "+51999888777", // Formato internacional WhatsApp
    "type": "ApplicationAccepted", // Tipos: CandidateSelected, ApplicationAccepted, ApplicationRejected, MessageReceived, NewJobPublished
    "candidateName": "Alex", // Opcional (usado para armar plantilla)
    "jobTitle": "Senior C# Backend Developer", // Opcional
    "companyName": "Tech Solutions SAC", // Opcional
    "url": "https://llanqui.com/jobs/1" // Opcional
  }
  ```

---

## 💳 9. Compras y Créditos PayPal (`/api/payments`)

Control de recarga de créditos utilizando la pasarela de pagos de PayPal para la posterior generación de CVs.

### Iniciar la compra de un plan (Crear Orden)
Crea una transacción en los servidores de PayPal y devuelve una URL de redirección.
* **Endpoint:** `POST /api/payments/create`
* **Request Body:**
  ```json
  {
    "planName": "Starter", // Planes en config: "Starter" (5 cred), "Pro" (15 cred), "Max" (35 cred)
    "returnUrl": "http://localhost:5173/payment/success", // URL frontend éxito
    "cancelUrl": "http://localhost:5173/payment/cancel" // URL frontend cancelación
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "orderId": "PAYPAL-ORDER-ID-12345",
    "approvalUrl": "https://www.paypal.com/checkoutnow?token=PAYPAL-ORDER-ID-12345"
  }
  ```
  *El frontend debe redirigir al usuario a `approvalUrl`.*

### Capturar / Confirmar Pago Aprobado
Una vez que el usuario aprueba el pago en PayPal y vuelve al frontend a la ruta `returnUrl?token=ORDER_ID`, el frontend debe golpear este endpoint para consolidar la transacción y abonar los créditos correspondientes.
* **Endpoint:** `POST /api/payments/capture`
* **Request Body:**
  ```json
  {
    "orderId": "PAYPAL-ORDER-ID-12345"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "creditsAdded": 5,
    "newBalance": 7,
    "transactionId": "TX-9988776655"
  }
  ```

### Consultar Saldo Actual de Créditos
* **Endpoint:** `GET /api/payments/balance`
* **Response (200 OK):**
  ```json
  {
    "userId": "guid-usuario",
    "balance": 7
  }
  ```

---

## 🤝 10. Reclutamiento y Postulaciones (`/api/v1/recruitment/applications`)

Flujo de postulación de candidatos a ofertas laborales y control del proceso de selección por parte de las organizaciones.

### Crear una Postulación
* **Endpoint:** `POST /api/v1/recruitment/applications`
* **Request Body:**
  ```json
  {
    "jobId": "guid-empleo",
    "candidateId": "guid-candidato",
    "candidateName": "Alex Llanqui",
    "candidatePhoneNumber": "+51999888777",
    "jobTitle": "Senior C# Backend Developer",
    "companyName": "Tech Solutions SAC"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "id": "guid-postulacion",
    "status": "Applied" // Estados típicos: Applied, Approved, Rejected, Selected
  }
  ```

### Aprobar Postulación (Paso intermedio)
* **Endpoint:** `POST /api/v1/recruitment/applications/{id}/approve`
* **Response (200 OK):** `{ "id": "guid", "status": "Approved" }`
* *Nota: Este cambio de estado dispara una notificación automática de WhatsApp al candidato.*

### Rechazar Postulación
* **Endpoint:** `POST /api/v1/recruitment/applications/{id}/reject`
* **Response (200 OK):** `{ "id": "guid", "status": "Rejected" }`

### Seleccionar Candidato (Finalizar Selección)
* **Endpoint:** `POST /api/v1/recruitment/applications/{id}/select`
* **Response (200 OK):** `{ "id": "guid", "status": "Selected" }`
* *Nota: Este cambio de estado dispara una notificación automática de WhatsApp al candidato.*
