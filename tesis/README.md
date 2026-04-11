# Auth y Profile: bounded contexts y contrato con el backend

Este documento describe cómo el frontend separa **Autenticación (Auth)** y **Perfiles (Profile)** y **cómo se enlazan entre sí** para que tu backend pueda alinearse con los mismos identificadores y rutas.

---

## 1. Bounded context: Autenticación (Auth)

**Responsabilidad:** identidad, sesión y autorización de peticiones.

**Base URL API (ejemplo):** `VITE_API_URL` o por defecto `http://localhost:5155/api/v1`  
Todas las rutas de este documento son relativas a ese prefijo. El prefijo de auth en código es **`/auth`** → p. ej. `POST /api/v1/auth/sign-in`.

### 1.1 Almacenamiento en el cliente (después de login / signup / OAuth)

| Dónde | Claves / valor |
|--------|----------------|
| `localStorage` | `accessToken`, `refreshToken`, `expiresIn` (login/sign-up con contraseña). |
| `localStorage` | Tras callback Google: también `idToken` (y `accessToken` si el backend los manda en la URL de retorno). |
| `localStorage` | `userType` (`employee` \| `organization`) — UX; debería coincidir con el usuario en servidor. |
| `localStorage` | `currentRoleId` — id auxiliar generado en cliente para flujos de registro (no sustituye a `user.id`). |
| Cabecera HTTP | `Authorization: Bearer <accessToken>` en todas las peticiones salientes (interceptor Axios), usando el token del store. |

Sesión actual del usuario en memoria (Pinia): objeto **`user`** alineado con `UserResponse`; **`currentUserId`** = `user.id`.

---

### 1.2 Sign-in (inicio de sesión con email y contraseña)

| | |
|--|--|
| **Método / ruta** | `POST /auth/sign-in` |
| **Cuerpo (JSON)** | `{ "email": string, "password": string }` |

**Respuesta esperada (JSON)** — el servicio lee `response.data` así:

| Campo | Tipo | Notas |
|--------|------|--------|
| `accessToken` | string | JWT u otro bearer; se guarda y se usa en el interceptor. |
| `refreshToken` | string | Se persiste para renovación si tu API lo usa. |
| `expiresIn` | number | Segundos o valor acordado con el backend. |
| `user` | objeto | Ver **§1.8**; debe incluir al menos `id`, `email`. |

Tras éxito, el store guarda tokens, rellena `user` y redirige (p. ej. a noticias).

---

### 1.3 Sign-up (registro)

| | |
|--|--|
| **Método / ruta** | `POST /auth/sign-up` |
| **Cuerpo (JSON)** | Ver tabla siguiente (`SignUpRequest` en el front). |

**Cuerpo que envía el frontend:**

| Campo | Tipo | Obligatorio | Notas |
|--------|------|-------------|--------|
| `email` | string | Sí | |
| `password` | string | Sí | |
| `userType` | `"employee"` \| `"organization"` | Sí | Tipo de cuenta. |
| `firstName` | string | No | Suele usarse si `userType` es empleado. |
| `lastName` | string | No | |
| `companyName` | string | No | Suele usarse si `userType` es organización. |

**Respuesta esperada:** misma forma que **sign-in** (`accessToken`, `refreshToken`, `expiresIn`, `user`). El store persiste tokens y usuario y redirige como en login.

---

### 1.4 Recuperación de contraseña (forgot password)

| | |
|--|--|
| **Método / ruta** | `POST /auth/forgot-password` |
| **Cuerpo (JSON)** | `{ "email": string }` |

**Respuesta esperada:** el front usa `response.data.message` (texto informativo para el usuario). Si no viene, el cliente muestra un mensaje por defecto. No requiere tokens.

El flujo de **definir nueva contraseña con un token** (enlace del correo) depende de rutas adicionales en tu backend; si las añades al front, documenta aquí las rutas `GET/POST` correspondientes.

---

### 1.5 Usuario actual (sesión ya autenticada)

| | |
|--|--|
| **Método / ruta** | `GET /auth/me` |
| **Cabecera** | `Authorization: Bearer <token>` |

El store llama a este endpoint con el token guardado. En código, el servicio espera que el JSON tenga el usuario anidado:

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "emailVerified": true,
    "firstName": "...",
    "lastName": "...",
    "companyName": "...",
    "userType": "employee",
    "picture": "...",
    "locale": "es",
    "createdAt": "..."
  }
}
```

**Nota:** Tras **Google OAuth**, el callback en el navegador guarda tokens en `localStorage` y luego se usa `loadCurrentUser()`, que prioriza **`idToken`** si existe, si no **`accessToken`**, para llamar a `GET /auth/me` y rellenar `user`.

---

### 1.6 Google OAuth (flujo en el navegador)

Google **no envía** el tipo de cuenta (`employee` / `organization`) en el callback; solo devuelve `code` y, si se configuró, **`state`**. El backend debe codificar el tipo de cuenta en **`state`** al armar la URL de autorización.

**Petición obligatoria desde el frontend** (el proyecto ya lo hace):

| Contexto | Ejemplo |
|-----------|---------|
| Login con Google (pantalla sign-in) | `GET /auth/google/url?userType=employee` |
| Registro con Google tras elegir rol | `GET /auth/google/url?userType=employee` o `?userType=organization` |

- Query **opcional**: `?userType=employee` \| `?userType=organization` (en el backend a veces existe alias `role`).
- Si **no** se envía query, el backend puede asumir **`employee`** por defecto.
- El JSON de respuesta sigue siendo `{ "authUrl": "…" }` o `{ "url": "…" }`; el front redirige a ese valor.

**Flujo:**

| Paso | Qué ocurre |
|------|------------|
| 1 | `GET /auth/google/url?userType=…` → el backend incluye el tipo en **`state`** y responde **`authUrl`** / **`url`**. |
| 2 | El front hace `window.location` a esa URL (Google `/o/oauth2/v2/auth`, etc.). |
| 3 | Tras autenticar, el backend recibe el callback (p. ej. `/api/v1/auth/google/callback`), lee `code` y **`state`**, y resuelve `userType` sin exigir un query `role` en la URL de Google. |
| 4 | El backend redirige al front con **query** `id_token`, `access_token`, `expires_in` (según tu implementación). |
| 5 | El front guarda tokens en `localStorage` y llama a `GET /auth/me`. |

**Google Cloud Console:** en OAuth 2.0, la URI de redirección autorizada debe coincidir con la del backend, p. ej. `http://localhost:5155/api/v1/auth/google/callback`.

#### Dos URLs distintas (no confundir)

| URL | Quién la usa | Qué lleva |
|-----|----------------|-----------|
| `https://accounts.google.com/o/oauth2/v2/auth?...` | El **navegador del usuario** (tras `authUrl` del paso 1) | Pantalla de login de Google. |
| `…/api/v1/auth/google/callback` | **Solo Google** (redirección OAuth) | Query **`code`** (y **`state`**). Es el endpoint del backend (`GoogleCallback(code, …)`). |
| `…/auth/callback` (ruta del **SPA Vue**, p. ej. `http://localhost:5173/auth/callback`) | El **backend**, después de intercambiar el `code` | Tokens en query (`id_token`, `access_token`, etc.) para que el front guarde sesión. |

**Qué no hacer**

- **No** abras directamente en el navegador `/api/v1/auth/google/callback` (sin `code` el backend no puede completar el flujo y puede responder error).
- **No** enlaces el botón “Continuar con Google” a esa ruta: el flujo correcto es siempre **primero** `GET /auth/google/url` → redirigir al usuario a **Google** → Google redirige al callback del **API** con `?code=…`.

**Backend (.NET):** el callback debe exigir `code` presente; si falta, devolver error claro. El `code` **solo** llega cuando la petición viene de Google tras el login, no cuando alguien entra a mano a la URL.

---

### 1.7 Resumen rápido de endpoints Auth

| Acción | Método | Ruta | Body / headers |
|--------|--------|------|----------------|
| Login | POST | `/auth/sign-in` | `{ email, password }` |
| Registro | POST | `/auth/sign-up` | `{ email, password, userType, firstName?, lastName?, companyName? }` |
| Olvidé contraseña | POST | `/auth/forgot-password` | `{ email }` |
| Yo (sesión) | GET | `/auth/me` | `Authorization: Bearer …` |
| URL Google | GET | `/auth/google/url?userType=employee` (u `organization`; opcional, default backend) | — |

---

### 1.8 Modelo de usuario que espera el frontend (`UserResponse`)

Objeto **`user`** dentro de las respuestas de sign-in, sign-up y (anidado) en `/me`:

| Campo | Uso |
|--------|-----|
| `id` | **Clave de unión** con Profile (`userId` en `/profile/{userId}`). |
| `email`, `emailVerified` | Identidad y verificación. |
| `userType` | `'employee'` \| `'organization'` — forma del perfil extendido. |
| `firstName`, `lastName` | Persona / empleado. |
| `companyName` | Organización. |
| `picture`, `locale`, `createdAt` | Opcionales. |

El código de mapeo en `AuthenticationService` también acepta nombres alternativos del backend en lectura (`name` / `givenName` / `familyName` mezclados con `firstName` / `lastName`); lo ideal es que tu API devuelva **`firstName`**, **`lastName`** y **`userType`** de forma estable para evitar ambigüedad.

---

## 2. Bounded context: Perfiles (Profile)

**Responsabilidad:** datos de negocio del perfil profesional o de la organización (biografía, distrito, foto, etc.), **separados** del login.

- No “inventa” identidad: **siempre** se colgó de un **usuario ya autenticado**.
- En el frontend, las operaciones habituales usan **`userId`** = `UserResponse.id` del store de auth (`currentUserId`).
- El backend puede exponer además un **`profileId`** interno; el frontend también tiene métodos para leer por `profileId` en rutas específicas de empleado/organización, pero el flujo principal de edición es **por `userId`**.

**Tipos de perfil (alineados con `userType`):**

- **Empleado:** datos personales/profesionales (nombre, DNI, distrito, profesión, bio, foto…).
- **Organización:** datos de empresa (razón social, web, industria, tamaño, descripción, foto…).

---

## 3. Cómo se conectan Auth y Profile

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
│  Auth: emite JWT / tokens + UserResponse { id, userType, ... } │
│  Profile: agrega/actualiza datos enlazados a ese mismo user id   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │  Bearer token (Auth)
                              │  user.id en URL o derivado del token (Profile)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                        │
│  Pinia: user.id  ──────────────►  ProfileService.get/update/...  │
│         currentUserId              (path: /profile/{userId})       │
└─────────────────────────────────────────────────────────────────┘
```

**Regla clave:** el **mismo `id`** que devuelve el endpoint de autenticación (`user.id`) es el **`userId`** que el frontend usa en:

- `GET /profile/{userId}`
- `PUT /profile/{userId}`
- `POST /profile/{userId}/upload-photo`

Así el backend puede:

1. Validar el JWT y obtener el **subject** (user id).
2. Comprobar que el `userId` de la ruta **coincide** con el usuario del token (autorización).
3. Resolver internamente si existe fila en `Profiles` con **FK a Users** y devolver o persistir el agregado de perfil.

**`userType`:** el frontend lo guarda también en `localStorage` (`userType`) para UX (mostrar formulario empleado vs organización). El backend debería ser la fuente de verdad; idealmente `UserResponse.userType` y el perfil persistido están alineados.

---

## 4. Contrato de API que el frontend asume (resumen)

| Área | Método | Ruta (bajo `/api/v1`) | Rol |
|------|--------|------------------------|-----|
| Auth | — | Login, sign-up, refresh, OAuth según tu diseño | Emite `user` + tokens |
| Profile | GET | `/profile/{userId}` | Cargar perfil del usuario autenticado |
| Profile | PUT | `/profile/{userId}` | Actualizar datos del perfil |
| Profile | POST | `/profile/{userId}/upload-photo` | Subir foto (multipart) |
| Profile | POST | `/profile/employee` | Crear perfil empleado (si el flujo lo usa) |
| Profile | POST | `/profile/organization` | Crear perfil organización (si el flujo lo usa) |

Peticiones salientes llevan **`Authorization: Bearer <accessToken>`** salvo rutas públicas explícitas.

---

## 5. Checklist para que “funcione todo” con tu backend

1. **Mismo `id`:** el `id` de usuario en respuestas Auth es el que se usa en `/profile/{userId}`.
2. **JWT:** el token que guarda el frontend es el que tu API valida; mismos claims (p. ej. `sub` = `user.id`).
3. **CORS:** origen del front (p. ej. Vite en `localhost:5173`) permitido hacia la API.
4. **`userType`:** coherente entre `UserResponse` y la forma del perfil (empleado vs organización).
5. **OAuth Google:** si el callback deposita tokens en `localStorage`, el siguiente `GET /auth/me` debe devolver `user` con el mismo esquema para enlazar perfil.

Con esto, los bounded contexts **Auth** (quién es y si puede llamar) y **Profile** (datos de negocio del usuario) quedan integrados por **`user.id` / `userId`** y por el **token** en cabecera.
