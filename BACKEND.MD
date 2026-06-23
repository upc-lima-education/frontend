# Llanqui API — Referencia de endpoints

**Base URL (Azure):** `https://ca-llanqui-backend.wittytree-b712258b.centralus.azurecontainerapps.io`
**Prefijo de versión:** `/api/v1` (excepto Payments, que usa `/api/payments`)
**Swagger:** `…/swagger/v1/swagger.json`
**Arquitectura:** REST — Clean Architecture (Domain / Application / Infrastructure / Api)

El frontend resuelve la base con `VITE_API_URL` en `.env`
(ver `src/app/shared/services/base.service.ts`). Por defecto, sin `.env`, usa `http://localhost:5155/api/v1`.

---

## Auth (Google OAuth)
| Método | Ruta | Uso |
|---|---|---|
| GET  | `/auth/google/url` | Obtener la URL de autorización de Google |
| GET  | `/auth/google/callback` | Callback del flujo OAuth |
| POST | `/auth/google/token` | Intercambiar code por tokens (`ExchangeCodeRequest`) |

## Auth — Users
| Método | Ruta | Uso |
|---|---|---|
| GET | `/auth/users/{id}` | Datos de un usuario |
| GET | `/auth/users/{id}/role` | Rol del usuario |

## Authentication
| Método | Ruta | Uso |
|---|---|---|
| POST | `/auth/sign-up` | Registro (`SignUpRequest` → `AuthResponse`) |
| POST | `/auth/sign-in` | Login (`SignInRequest` → `AuthResponse`) |
| POST | `/auth/google/sign-in` | Login con Google (`GoogleSignInRequest`) |
| POST | `/auth/forgot-password` | Recuperar contraseña (`ForgotPasswordRequest`) |
| GET  | `/auth/me` | Usuario autenticado actual (`UserDto`) |
| POST | `/auth/sign-out` | Cerrar sesión |

## Conversation (mensajería)
| Método | Ruta | Uso |
|---|---|---|
| POST   | `/conversation` | Crear conversación (`CreateConversationRequest`) |
| GET    | `/conversation/{id}` | Obtener conversación |
| DELETE | `/conversation/{id}` | Eliminar conversación |
| GET    | `/conversation/job/{jobId}` | Conversaciones de una oferta |
| GET    | `/conversation/{id}/users` | Participantes |
| POST   | `/conversation/{id}/users` | Agregar participantes (`AddUsersRequest`) |
| DELETE | `/conversation/{id}/users` | Quitar participantes (`RemoveUsersRequest`) |
| POST   | `/conversation/{id}/message` | Enviar mensaje (`AddMessageRequest`) |

## CV Generation (IA)
| Método | Ruta | Uso |
|---|---|---|
| POST | `/cv` | Generar CV (`GenerateCvRequest` → `GenerateCvResponse`) |
| GET  | `/cv/{id}/status` | Estado de generación (`CvStatusResponse`) |
| GET  | `/cv/{id}/preview` | Previsualización |
| GET  | `/cv/{id}/download` | Descargar CV |

## Job (ofertas de empleo)
| Método | Ruta | Uso |
|---|---|---|
| POST   | `/job` | Crear oferta (`CreateJobCommand`) |
| GET    | `/job` | Listar ofertas |
| GET    | `/job/{id}` | Detalle de oferta (`Job`) |
| PUT    | `/job/{id}` | Actualizar (`UpdateJobCommand`) |
| DELETE | `/job/{id}` | Eliminar |
| PATCH  | `/job/{id}/schedule` | Programar publicación (`PatchJobScheduleCommand`) |
| POST   | `/job/{id}/skill` | Agregar skill (`AddSkillToJobCommand`) |
| DELETE | `/job/{jobId}/skill/{skillId}` | Quitar skill |
| GET    | `/job/{id}/skills` | Skills de la oferta |
| GET    | `/job/company/{companyId}` | Ofertas de una empresa |
| POST   | `/job/sync` | Sincronizar ofertas scrapeadas (`ScrapedJobRequest`) |

## News (novedades / feed)
| Método | Ruta | Uso |
|---|---|---|
| POST   | `/news` | Crear post (`CreatePostRequest`) |
| GET    | `/news/{id}` | Obtener post |
| DELETE | `/news/{id}` | Eliminar post |
| GET    | `/news/feed` | Feed de novedades |
| PUT    | `/news/heart` | Dar/quitar like (`HeartPostRequest`) |

## Notifications
| Método | Ruta | Uso |
|---|---|---|
| GET  | `/notifications` | Listar notificaciones (`NotificationResponse`) — campana del Navbar |
| POST | `/notifications/send` | Enviar notificación (`SendNotificationRequest`) |

## Payments (prefijo `/api/payments`, sin `/v1`)
| Método | Ruta | Uso |
|---|---|---|
| POST | `/api/payments/create` | Crear pago (`CreatePaymentRequest` → `CreatePaymentResult`) |
| POST | `/api/payments/capture` | Capturar pago (`CapturePaymentRequest` → `CapturePaymentResult`) |
| GET  | `/api/payments/balance` | Consultar balance |

## Profiles
| Método | Ruta | Uso |
|---|---|---|
| POST | `/profile/employee` | Crear perfil de empleado (`EmployeeProfileRequest`) |
| POST | `/profile/organization` | Crear perfil de organización (`OrganizationProfileRequest`) |
| GET  | `/profile/{userId}` | Obtener perfil |
| PUT  | `/profile/{userId}` | Actualizar perfil (`UpdateProfileRequest`) |
| POST | `/profile/{userId}/upload-photo` | Subir foto |
| GET  | `/profile/{userId}/is-complete` | ¿Perfil completo? |
| POST | `/profile/validate-ruc` | Validar RUC (`RucValidationRequest`) |
| POST | `/profile/validate-dni` | Validar DNI (`DniValidationRequest`) |

## Recruitment (postulaciones)
| Método | Ruta | Uso |
|---|---|---|
| POST | `/recruitment/applications` | Postular (`CreateApplicationRequest`) |
| POST | `/recruitment/applications/{id}/approve` | Aprobar postulación |
| POST | `/recruitment/applications/{id}/reject` | Rechazar postulación |
| POST | `/recruitment/applications/{id}/select` | Seleccionar candidato |

## Skill
| Método | Ruta | Uso |
|---|---|---|
| POST   | `/skill` | Crear skill (`CreateSkillCommand`) |
| GET    | `/skill` | Listar skills |
| GET    | `/skill/{id}` | Obtener skill |
| DELETE | `/skill/{id}` | Eliminar skill |
| POST   | `/skill/name` | Buscar por nombre (`GetSkillByNameQuery`) |
| GET    | `/skill/{id}/jobs` | Ofertas que requieren la skill |

---

## Schemas (DTOs)
Requests/commands y enums definidos en el Swagger. Enums clave para la UI:

- **Enums:** `CompensationType`, `Currency`, `EducationLevel`, `Experience`, `JobStatus`, `JobType`,
  `PostType`, `SalaryPeriod`, `WorkHours`, `OriginPage`.
- **Auth:** `SignUpRequest`, `SignInRequest`, `GoogleSignInRequest`, `ExchangeCodeRequest`,
  `ForgotPasswordRequest`, `AuthResponse`, `UserDto`.
- **Job:** `CreateJobCommand`, `UpdateJobCommand`, `PatchJobScheduleCommand`, `AddSkillToJobCommand`,
  `ScrapedJobRequest`, `Job`.
- **Conversation:** `CreateConversationRequest`, `AddMessageRequest`, `AddUsersRequest`, `RemoveUsersRequest`.
- **CV (IA):** `GenerateCvRequest`, `GenerateCvResponse`, `CvStatusResponse`.
- **News:** `CreatePostRequest`, `HeartPostRequest`.
- **Notifications:** `SendNotificationRequest`, `NotificationResponse`.
- **Payments:** `CreatePaymentRequest`, `CreatePaymentResult`, `CapturePaymentRequest`, `CapturePaymentResult`.
- **Profiles:** `EmployeeProfileRequest`, `OrganizationProfileRequest`, `UpdateProfileRequest`,
  `RucValidationRequest`, `DniValidationRequest`.
- **Recruitment:** `CreateApplicationRequest`.
- **Skill:** `CreateSkillCommand`, `GetSkillByNameQuery`, `Skill`.
- **Comunes:** `GenericResponse`, `ErrorResponse`, `ProblemDetails`.

> Para shapes exactos (campos y tipos de cada DTO), consultar el Swagger en
> `…/swagger/v1/swagger.json`. Este archivo es el índice de navegación de endpoints.
