# Llanqui API — Documentación para Frontend

**Base URL producción:** `https://ca-llanqui-backend.wittytree-b712258b.centralus.azurecontainerapps.io`  
**Base URL local:** `http://localhost:5155`  
**Swagger UI:** `{baseUrl}/swagger`

---

## Autenticación

Todos los endpoints marcados con 🔒 requieren el header:
```
Authorization: Bearer <access_token>
```
El `access_token` se obtiene en sign-in o sign-up. Expira en **1 hora**.

---

## Enums globales (siempre como string)

| Enum | Valores |
|---|---|
| `userType` | `"Candidate"` \| `"Company"` |
| `jobType` | `"Remote"` \| `"Hybrid"` \| `"InPerson"` |
| `workHours` | `"FullTime"` \| `"PartTime"` |
| `experience` | `"NoExperience"` \| `"OneToThree"` \| `"ThreeToFive"` \| `"FiveOrMore"` |
| `educationLevel` | `"None"` \| `"Elementary"` \| `"HighSchool"` \| `"Technical"` \| `"Bachelor"` \| `"Master"` \| `"PhD"` |
| `currency` | `"PEN"` \| `"USD"` |
| `salaryPeriod` | `"Monthly"` \| `"Weekly"` \| `"Daily"` \| `"Hourly"` |
| `compensationType` | `"Fixed"` \| `"Range"` |
| `jobStatus` | `"Draft"` \| `"Scheduled"` \| `"Active"` \| `"Closed"` |
| `postType` | `"General"` \| `"JobOffer"` |
| `cvMode` | `"General"` \| `"JobPosting"` \| `"Skills"` \| `"Experience"` |
| `notificationType` | `"CandidateSelected"` \| `"ApplicationAccepted"` \| `"ApplicationRejected"` \| `"NewJobPublished"` \| `"MessageReceived"` \| `"VerificationCode"` \| `"PasswordReset"` \| `"PaymentSuccess"` \| `"PaymentFailure"` |

---

## 1. Auth

### Registro con email
```
POST /api/v1/auth/sign-up
```
**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123",
  "userType": "Candidate"
}
```
**Respuesta 201:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "emailVerified": false,
    "userType": "Candidate",
    "isActive": true,
    "createdAt": "2026-07-01T00:00:00Z"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 3600
}
```
> El usuario nace con **2 créditos gratuitos** para generar CVs.

---

### Login con email
```
POST /api/v1/auth/sign-in
```
**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```
**Respuesta 200:** igual estructura que sign-up.

---

### Obtener usuario autenticado 🔒
```
GET /api/v1/auth/me
```
**Respuesta 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "emailVerified": false,
    "userType": "Candidate",
    "isActive": true,
    "createdAt": "2026-07-01T00:00:00Z"
  }
}
```

---

### Cerrar sesión 🔒
```
POST /api/v1/auth/sign-out
```
> El token JWT no tiene blocklist server-side. Este endpoint solo confirma la acción; el frontend debe eliminar el token del storage.

**Respuesta 200:**
```json
{ "success": true, "message": "Sesión cerrada exitosamente" }
```

---

### Recuperar contraseña
```
POST /api/v1/auth/forgot-password
```
**Body:**
```json
{ "email": "usuario@ejemplo.com" }
```
**Respuesta 200:** Siempre devuelve 200 (no revela si el email existe).
> ⚠️ El envío de email no está implementado aún. Solo registra el intento.

---

### Google OAuth — Flujo redirect (web)

**Paso 1 — Obtener URL de Google:**
```
GET /api/v1/auth/google/url?userType=Candidate&mode=signup
```
| Query param | Valores | Cuándo |
|---|---|---|
| `userType` | `"Candidate"` \| `"Company"` | Solo en `mode=signup` |
| `mode` | `"signup"` \| `"login"` | Siempre |

**Respuesta 200:**
```json
{ "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

**Paso 2 — Redirigir al usuario a esa URL.**

**Paso 3 — Google redirige al frontend en:**
```
{frontendUrl}/auth/callback?access_token=...&refresh_token=...&expires_in=3600
```
En caso de error redirige a:
```
{frontendUrl}/auth/error?message=...
```

---

### Google OAuth — Flujo token (mobile / SPA con popup)
```
POST /api/v1/auth/google/token
```
**Body:**
```json
{
  "code": "4/0AX...",
  "userType": "Candidate",
  "mode": "signup"
}
```
**Respuesta 200:** misma estructura que sign-in.

---

### Obtener usuario por ID 🔒
```
GET /api/v1/auth/users/{userId}
```
**Respuesta 200:**
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "userType": "candidate",
  "isActive": true
}
```

---

### Obtener rol de usuario 🔒
```
GET /api/v1/auth/users/{userId}/role
```
**Respuesta 200:**
```json
{
  "userId": "uuid",
  "userType": "candidate",
  "isActive": true
}
```

---

## 2. Perfil

### ⚠️ Nota importante
`GET /api/v1/profile/{userId}` devuelve `data.id` que es el **Profile ID** (diferente al User ID).  
El **Profile ID** es el que se usa como `companyId` en News.

---

### Crear perfil candidato 🔒
```
POST /api/v1/profile/employee
```
**Body:**
```json
{
  "userId": "uuid-del-user",
  "firstName": "Ana",
  "lastName": "Torres",
  "dni": "12345678",
  "description": "Desarrolladora frontend con 3 años de experiencia",
  "ubigeo": "150101",
  "profilePicture": null,
  "skills": ["React", "TypeScript", "CSS"]
}
```
**Respuesta 201:** ProfileResponse (ver abajo).

---

### Crear perfil empresa 🔒
```
POST /api/v1/profile/organization
```
**Body:**
```json
{
  "userId": "uuid-del-user",
  "companyName": "Tech SAC",
  "sector": "Tecnología",
  "ruc": "20123456789",
  "description": "Empresa de desarrollo de software",
  "ubigeo": "150101",
  "profilePicture": null,
  "skills": []
}
```
**Respuesta 201:** ProfileResponse (ver abajo).

---

### Obtener perfil por userId 🔒
```
GET /api/v1/profile/{userId}
```
**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-profile-id",
    "userId": "uuid-user-id",
    "description": "...",
    "keywords": ["React", "TypeScript"],
    "profilePicture": null,
    "firstName": "Ana",
    "lastName": "Torres",
    "companyName": null,
    "sector": null,
    "ruc": null,
    "isVerified": null,
    "workExperiences": [
      {
        "id": "uuid",
        "role": "Backend Developer",
        "organization": "Acme Corp",
        "startDate": "2022-03-01",
        "endDate": null,
        "description": "Desarrollo de APIs REST con .NET",
        "location": "Lima"
      }
    ],
    "educations": [
      { "id": "uuid", "institution": "UPC", "degree": "Ingeniería de Software", "startDate": "2019-03-01", "endDate": "2024-12-01" }
    ],
    "certifications": [
      { "id": "uuid", "name": "AWS Certified Developer", "issuingOrganization": "Amazon", "issueDate": "2023-05-01" }
    ],
    "languages": [
      { "id": "uuid", "name": "Inglés", "level": "Avanzado" }
    ],
    "isComplete": true,
    "createdAt": "2026-07-01T00:00:00Z",
    "updatedAt": "2026-07-01T00:00:00Z"
  }
}
```
> `keywords` contiene las skills del perfil.  
> `data.id` = Profile ID — úsalo como `companyId` en News.  
> `workExperiences`, `educations`, `certifications` y `languages` se administran con los endpoints CRUD dedicados de abajo — no se editan desde `PUT .../candidate`.

---

### Actualizar perfil candidato 🔒
```
PUT /api/v1/profile/{userId}/candidate
```
**Body:**
```json
{
  "firstName": "Ana",
  "lastName": "Torres",
  "dni": "12345678",
  "description": "Actualizado",
  "ubigeo": "150101",
  "skills": ["React", "Vue"]
}
```
**Respuesta 200:** `{ "success": true, "data": ProfileResponse }`

---

### Actualizar perfil empresa 🔒
```
PUT /api/v1/profile/{userId}/company
```
**Body:**
```json
{
  "companyName": "Tech SAC",
  "sector": "Fintech",
  "ruc": "20123456789",
  "description": "Actualizado"
}
```
**Respuesta 200:** `{ "success": true, "data": ProfileResponse }`

---

### Subir foto de perfil 🔒
```
POST /api/v1/profile/{userId}/upload-photo
Content-Type: multipart/form-data
```
**Form field:** `file` (imagen JPG/PNG)  
**Respuesta 200:** `{ "success": true, "data": ProfileResponse }`

---

### Verificar empresa 🔒
```
POST /api/v1/profile/{userId}/verify
```
**Respuesta 200:** `{ "success": true }`

---

### Bootstrap de perfil tras OAuth 🔒
```
GET /api/v1/profile/{userId}/bootstrap?userType=Candidate&givenName=Ana&familyName=Torres&pictureUrl=https://...
```
Crea un perfil inicial con los datos de Google si aún no existe.  
**Respuesta 200:** `{ "success": true, "data": ProfileResponse }`

---

### Experiencia laboral, educación, certificaciones e idiomas 🔒

> Estos 4 recursos alimentan directamente al **generador de CV** (sección 6): en cuanto el
> candidato guarda al menos una entrada, el próximo CV que genere la incluye automáticamente.
> No hace falta ningún cambio en el flujo de generación de CV — solo llenar estos formularios.

Los 4 siguen el mismo patrón CRUD: `POST` crea, `PUT .../{id}` edita, `DELETE .../{id}` borra.
Todas las respuestas tienen la forma `{ "success": true, "data": {...} }`. El `id` que devuelve
el `POST` es el que se usa después en `PUT`/`DELETE`.

#### Experiencia laboral
```
POST   /api/v1/profile/{userId}/work-experience
PUT    /api/v1/profile/{userId}/work-experience/{id}
DELETE /api/v1/profile/{userId}/work-experience/{id}
```
**Body (POST y PUT):**
```json
{
  "role": "Backend Developer",
  "organization": "Acme Corp",
  "startDate": "2022-03-01",
  "endDate": null,
  "description": "Desarrollo de APIs REST con .NET, integración con PostgreSQL y despliegue en Azure.",
  "location": "Lima"
}
```
| Campo | Requerido | Notas |
|---|---|---|
| `role`, `organization` | Sí | Máx. 150 caracteres |
| `startDate` | Sí | Formato `yyyy-MM-dd` |
| `endDate` | No | `null` = trabajo actual. Si se manda, debe ser `>= startDate` |
| `description`, `location` | No | — |

---

#### Educación
```
POST   /api/v1/profile/{userId}/education
PUT    /api/v1/profile/{userId}/education/{id}
DELETE /api/v1/profile/{userId}/education/{id}
```
**Body (POST y PUT):**
```json
{
  "institution": "UPC",
  "degree": "Ingeniería de Software",
  "startDate": "2019-03-01",
  "endDate": "2024-12-01"
}
```
| Campo | Requerido | Notas |
|---|---|---|
| `institution`, `degree` | Sí | Máx. 150 caracteres |
| `startDate`, `endDate` | No | `endDate` null = en curso |

---

#### Certificaciones
```
POST   /api/v1/profile/{userId}/certification
PUT    /api/v1/profile/{userId}/certification/{id}
DELETE /api/v1/profile/{userId}/certification/{id}
```
**Body (POST y PUT):**
```json
{
  "name": "AWS Certified Developer",
  "issuingOrganization": "Amazon",
  "issueDate": "2023-05-01"
}
```
| Campo | Requerido | Notas |
|---|---|---|
| `name` | Sí | Máx. 200 caracteres |
| `issuingOrganization`, `issueDate` | No | — |

---

#### Idiomas
```
POST   /api/v1/profile/{userId}/language
PUT    /api/v1/profile/{userId}/language/{id}
DELETE /api/v1/profile/{userId}/language/{id}
```
**Body (POST y PUT):**
```json
{
  "name": "Inglés",
  "level": "Avanzado"
}
```
| Campo | Requerido | Notas |
|---|---|---|
| `name` | Sí | Máx. 50 caracteres |
| `level` | Sí | Debe ser exactamente uno de: `"Básico"`, `"Intermedio"`, `"Avanzado"`, `"Nativo"` |

---

## 3. Jobs

### Crear oferta de trabajo 🔒
```
POST /api/v1/job
```
**Body:**
```json
{
  "title": "Desarrollador Frontend",
  "description": "Buscamos desarrollador con experiencia en React",
  "jobType": "Remote",
  "workHours": "FullTime",
  "skills": ["React", "TypeScript"],
  "experience": "OneToThree",
  "educationLevel": "Bachelor",
  "ubigeo": "150101",
  "address": "Lima, Perú",
  "minSalary": 3000.00,
  "maxSalary": 5000.00,
  "currency": "PEN",
  "salaryPeriod": "Monthly",
  "compensationType": "Range",
  "opensAt": "2026-07-01T00:00:00Z",
  "closesAt": "2026-08-01T00:00:00Z",
  "jobStatus": "Active",
  "originPage": "Llanqui",
  "sourceUrl": null,
  "applyUrl": null
}
```

---

### Obtener todas las ofertas 🔒
```
GET /api/v1/job
```
**Respuesta 200:** Array de jobs.

---

### Obtener oferta por ID 🔒
```
GET /api/v1/job/{id}
```

---

### Obtener ofertas por empresa 🔒
```
GET /api/v1/job/company/{companyId}
```
> `companyId` es el **Profile ID** de la empresa (de `GET /api/v1/profile/{userId}` → `data.id`).

---

### Actualizar oferta 🔒
```
PUT /api/v1/job/{id}
```
**Body:** mismos campos que POST.

---

### Actualizar fechas de una oferta 🔒
```
PATCH /api/v1/job/{id}/schedule
```
**Body:**
```json
{
  "opensAt": "2026-07-15T00:00:00Z",
  "closesAt": "2026-08-15T00:00:00Z"
}
```

---

### Eliminar oferta 🔒
```
DELETE /api/v1/job/{id}
```

---

### Agregar skill a una oferta 🔒
```
POST /api/v1/job/{id}/skill
```
**Body:**
```json
{ "skillId": "uuid-skill" }
```

---

### Quitar skill de una oferta 🔒
```
DELETE /api/v1/job/{jobId}/skill/{skillId}
```

---

### Skills de una oferta 🔒
```
GET /api/v1/job/{id}/skills
```

---

## 4. Skills

### Listar todas 🔒
```
GET /api/v1/skill
```

### Obtener por ID 🔒
```
GET /api/v1/skill/{id}
```

### Buscar por nombre 🔒
```
POST /api/v1/skill/name
```
**Body:**
```json
{ "name": "React" }
```

### Crear skill 🔒
```
POST /api/v1/skill
```
**Body:**
```json
{ "name": "Vue.js" }
```

### Eliminar skill 🔒
```
DELETE /api/v1/skill/{id}
```

### Jobs que usan una skill 🔒
```
GET /api/v1/skill/{id}/jobs
```

---

## 5. Recruitment (Postulaciones)

### Postular a una oferta 🔒
```
POST /api/v1/recruitment/applications
```
**Body:**
```json
{
  "jobId": "uuid-del-job",
  "candidateId": "uuid-del-user"
}
```
> `candidateId` es el **User ID** del candidato (el que devuelve sign-in).

**Respuesta 200:**
```json
{
  "id": "uuid-application",
  "status": "Pending"
}
```

---

### Aprobar postulación 🔒
```
POST /api/v1/recruitment/applications/{id}/approve
```

---

### Rechazar postulación 🔒
```
POST /api/v1/recruitment/applications/{id}/reject
```

---

### Seleccionar candidato 🔒
```
POST /api/v1/recruitment/applications/{id}/select
```

---

## 6. CV Generation

### Flujo completo de generación

**Paso 1 — Iniciar generación (consume 1 crédito)** 🔒
```
POST /api/v1/cv
```
**Body:**
```json
{
  "mode": "General",
  "prompt": "Busco posición como desarrollador frontend en empresa de tecnología"
}
```

| Modo | Uso |
|---|---|
| `General` | CV balanceado para cualquier postulación |
| `JobPosting` | Adaptado a una oferta — poner el texto de la oferta en `prompt` |
| `Skills` | Destaca habilidades técnicas |
| `Experience` | Destaca trayectoria y logros |

**Respuesta 202:**
```json
{
  "cvGenerationId": "uuid",
  "status": "Queued",
  "message": "CV en cola de generación"
}
```
**Respuesta 402:** Sin créditos disponibles — redirigir a Payments.

---

**Paso 2 — Consultar estado (polling)** 🔒
```
GET /api/v1/cv/{cvGenerationId}/status
```
**Respuesta 200:**
```json
{
  "cvGenerationId": "uuid",
  "status": "Completed",
  "errorMessage": null,
  "hasPdf": true,
  "createdAt": "2026-07-01T10:00:00Z",
  "completedAt": "2026-07-01T10:00:45Z"
}
```
| `status` | Significado |
|---|---|
| `Queued` | En cola, esperando procesamiento |
| `Processing` | Generando con IA |
| `Completed` | Listo para descargar |
| `Failed` | Error en generación |

---

**Paso 3a — Ver preview HTML** 🔒
```
GET /api/v1/cv/{cvGenerationId}/preview
```
**Respuesta:** HTML crudo del CV (renderizar en `<iframe>` o `<div>`).

---

**Paso 3b — Descargar PDF** 🔒
```
GET /api/v1/cv/{cvGenerationId}/download
```
**Respuesta:** Archivo PDF (`application/pdf`).

---

## 7. News (Publicaciones)

> ⚠️ `companyId` en este módulo es el **Profile ID** de la empresa, no el User ID.  
> Obtenerlo con `GET /api/v1/profile/{userId}` → `data.id`.

### Crear publicación 🔒
```
POST /api/v1/news
```
**Body:**
```json
{
  "companyId": "uuid-profile-id-empresa",
  "content": "¡Abrimos nueva vacante de desarrollador!",
  "postType": "General",
  "jobId": null
}
```
> Si `postType` es `"JobOffer"`, incluir `jobId`.

---

### Feed de publicaciones 🔒
```
GET /api/v1/news/feed
```
**Respuesta 200:** Array de posts ordenados por fecha.

---

### Obtener publicación por ID 🔒
```
GET /api/v1/news/{id}
```

---

### Dar/quitar like 🔒
```
PUT /api/v1/news/heart
```
**Body:**
```json
{
  "postId": "uuid-post",
  "userId": "uuid-user",
  "isHearted": true
}
```

---

### Eliminar publicación 🔒
```
DELETE /api/v1/news/{id}
```

---

## 8. Conversations (Mensajería)

### Crear conversación 🔒
```
POST /api/v1/conversation
```
**Body:**
```json
{
  "jobId": "uuid-job",
  "users": ["uuid-user1", "uuid-user2"]
}
```

---

### Obtener conversación por ID 🔒
```
GET /api/v1/conversation/{id}
```

---

### Conversaciones de una oferta 🔒
```
GET /api/v1/conversation/job/{jobId}
```

---

### Enviar mensaje 🔒
```
POST /api/v1/conversation/send-message
```
**Body:**
```json
{
  "conversationId": "uuid-conversacion",
  "senderId": "uuid-user",
  "content": "Hola, me interesa la posición"
}
```

---

### Agregar usuarios a conversación 🔒
```
POST /api/v1/conversation/{id}/users
```
**Body:**
```json
{ "userIds": ["uuid-user3"] }
```

---

### Quitar usuarios de conversación 🔒
```
DELETE /api/v1/conversation/{id}/users
```
**Body:**
```json
{ "userIds": ["uuid-user3"] }
```

---

### Eliminar conversación 🔒
```
DELETE /api/v1/conversation/{id}
```

---

## 9. Notifications

### Ver mis notificaciones 🔒
```
GET /api/v1/notifications
```
**Respuesta 200:** Array de notificaciones del usuario autenticado.

---

### Enviar notificación WhatsApp 🔒
```
POST /api/v1/notifications/send
```
**Body:**
```json
{
  "userId": "uuid-user",
  "phoneNumber": "+51999999999",
  "type": "MessageReceived",
  "message": "Tienes un nuevo mensaje"
}
```
> Requiere número registrado en el sandbox de Twilio.

---

## 10. Payments (Créditos)

### Ver saldo de créditos 🔒
```
GET /api/payments/balance
```
**Respuesta 200:**
```json
{
  "userId": "uuid",
  "balance": 2
}
```

---

### Crear orden de pago 🔒
```
POST /api/payments/create
```
**Body:**
```json
{
  "planName": "Starter",
  "returnUrl": "https://mifrontend.com/payment/success",
  "cancelUrl": "https://mifrontend.com/payment/cancel"
}
```

| Plan | Créditos | Precio |
|---|---|---|
| `Starter` | 5 | $2.70 USD |
| `Pro` | 15 | $6.80 USD |
| `Max` | 35 | $13.60 USD |

**Respuesta 200:**
```json
{
  "orderId": "PAYPAL-ORDER-ID",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=..."
}
```
> Redirigir al usuario a `approvalUrl` para aprobar el pago en PayPal.

---

### Capturar pago y acreditar créditos 🔒
```
POST /api/payments/capture
```
**Body:**
```json
{
  "orderId": "PAYPAL-ORDER-ID"
}
```
**Respuesta 200:**
```json
{
  "success": true,
  "creditsAdded": 5,
  "newBalance": 7,
  "transactionId": "PAYPAL-TX-ID"
}
```

---

## Flujos completos para el frontend

### Flujo: Candidato se registra y genera su CV

```
1. POST /api/v1/auth/sign-up  { userType: "Candidate" }
   → guarda access_token

2. POST /api/v1/profile/employee  { userId, firstName, lastName, dni, skills }
   → crea perfil con 2 créditos gratuitos

3. POST /api/v1/cv  { mode: "General", prompt: "..." }
   → recibe cvGenerationId

4. Polling: GET /api/v1/cv/{cvGenerationId}/status
   → esperar hasta status = "Completed"

5. GET /api/v1/cv/{cvGenerationId}/preview   → mostrar HTML
   GET /api/v1/cv/{cvGenerationId}/download  → descargar PDF
```

---

### Flujo: Empresa publica una oferta

```
1. POST /api/v1/auth/sign-up  { userType: "Company" }

2. POST /api/v1/profile/organization  { userId, companyName, ruc, ... }
   → guarda data.id como companyProfileId

3. POST /api/v1/job  { title, description, jobType: "Remote", ... }
   → guarda jobId

4. POST /api/v1/news  { companyId: companyProfileId, postType: "JobOffer", jobId }
```

---

### Flujo: Candidato postula y empresa gestiona

```
1. (Candidato) GET /api/v1/job → listar ofertas
2. (Candidato) POST /api/v1/recruitment/applications  { jobId, candidateId: userId }
3. (Empresa)   POST /api/v1/recruitment/applications/{id}/approve  → aprueba
4. (Empresa)   POST /api/v1/conversation  { jobId, users: [empresaUserId, candidatoUserId] }
5. (Ambos)     POST /api/v1/conversation/send-message  { conversationId, senderId, content }
```

---

### Flujo: Candidato compra créditos para generar más CVs

```
1. GET /api/payments/balance → ver saldo actual (0 = necesita comprar)
2. POST /api/payments/create  { planName: "Starter", returnUrl, cancelUrl }
   → redirigir usuario a approvalUrl
3. (PayPal aprueba y redirige a returnUrl?token=...)
4. POST /api/payments/capture  { orderId }
   → créditos acreditados automáticamente
5. POST /api/v1/cv → generar nuevo CV
```

---

## Códigos de respuesta frecuentes

| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Creado |
| 202 | Aceptado (operación asíncrona) |
| 400 | Error de validación |
| 401 | Token ausente o expirado |
| 402 | Sin créditos — redirigir a Payments |
| 403 | Sin permisos sobre el recurso |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

