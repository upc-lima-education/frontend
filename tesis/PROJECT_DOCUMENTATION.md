# ProConnect - Documentación del Proyecto

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Flujo de Autenticación OAuth Google](#flujo-de-autenticación-oauth-google)
3. [Validaciones Backend](#validaciones-backend)
4. [Mejoras de UI](#mejoras-de-ui)
5. [Endpoints del Backend](#endpoints-del-backend)
6. [Testing Recomendado](#testing-recomendado)
7. [Arquitectura](#arquitectura)
8. [Notas Importantes](#notas-importantes)

---

## Descripción General

**ProConnect** es una plataforma de conexión profesional que permite a dos tipos de usuarios:
- 💼 **Employees/Profesionales**: Individuos que buscan trabajo o freelance
- 🏢 **Organizations**: Empresas que publican ofertas de empleo

### Características Principales
- ✅ Autenticación con Email/Password
- ✅ Autenticación con Google OAuth
- ✅ Selección obligatoria de tipo de usuario en Sign Up
- ✅ Login simplificado sin selección tipo (backend obtiene automáticamente)
- ✅ UI moderna y responsiva
- ✅ Validación exhaustiva de formularios

---

## Flujo de Autenticación OAuth Google

### 🎯 Problema Inicial
1. ❌ Google OAuth estaba en Sign Up sin validación de tipo
2. ❌ Se asignaba userType por defecto sin selección del usuario
3. ❌ Sign In excluía Organizations con `userType="employee"` hardcodeado

### ✅ Solución Implementada

#### 📝 Crear Cuenta (Sign Up) - PRIMERA VEZ

**URL:** `/sign-up`

```
Flujo:
1. Usuario accede a /sign-up
2. Completa:
   - Email (validación de formato)
   - Contraseña (8+ chars, 1 mayús, 1 número)
   - Confirmar contraseña
   - TIPO OBLIGATORIO: Employee o Organization
3. Dos opciones:
   
   A) Botón "Crear cuenta" (formulario manual)
      POST /auth/sign-up {email, password, userType}
      → Cuenta creada en backend
      
   B) Botón "Registrarse con Google" (OAuth)
      beforeGoogleSignUp() valida que tipo esté seleccionado
      GET /auth/google/url?userType=employee&mode=signup
      → Google autentica
      → Backend crea cuenta con userType del parámetro
      
4. Redirige a /news con tokens JWT
```

**Validaciones Frontend:**
- ✅ Email válido (formato correcto)
- ✅ Contraseña cumple requisitos (visible en tiempo real)
- ✅ Contraseñas coinciden
- ✅ Tipo de usuario seleccionado (obligatorio)
- ✅ beforeGoogleSignUp() previene OAuth sin tipo

#### 🔐 Iniciar Sesión (Sign In) - DESPUÉS DE SIGNUP

**URL:** `/sign-in`

```
Flujo:
1. Usuario accede a /sign-in
2. Dos opciones:
   
   A) Email + Contraseña (manual)
      POST /auth/sign-in {email, password}
      → Backend valida credenciales
      
   B) Google (sin selector de tipo) ← RÁPIDO
      GET /auth/google/url?mode=login
      → Google autentica
      → Backend busca usuario por email
      → Backend retorna userType que tenía guardado
      
3. Redirige a /news con tokens JWT
```

**Ventajas:**
- ✅ UX simplificada (sin preguntar tipo)
- ✅ Backend ya conoce el tipo del usuario
- ✅ Login rápido para usuarios existentes

#### Comparativa Visual

```
SIGNUP (primera vez):
┌─────────────────────────────────────┐
│ Email + Password + Confirm Password │
│ Seleccionar Tipo [OBLIGATORIO]      │
│ ┌─ Botón: Crear cuenta              │
│ └─ Botón: Registrarse con Google    │
└─────────────────────────────────────┘
         ↓ (después)
LOGIN (usuario existente):
┌─────────────────────────────────────┐
│ Email + Password                    │
│ ┌─ Botón: Iniciar sesión            │
│ └─ Botón: Continuar con Google      │
│    (sin preguntar tipo)             │
└─────────────────────────────────────┘
```

---

## Validaciones Backend

### 1. **mode=signup** (Crear cuenta nueva con Google)

**Escenario:** Usuario nuevo quiere registrarse con Google

**Pasos en el Backend:**
1. ✅ Generar Google OAuth URL con state que incluya `mode=signup` y `userType`
2. 🔐 Usuario completa autenticación en Google
3. 🔐 En el callback:
   - Extraer email del idToken de Google
   - **VALIDACIÓN CRÍTICA:** ¿Email ya existe en BD?
     - ❌ SI → Retornar error: `{error: "EmailAlreadyExists", message: "..."}`
     - ✅ NO → Crear cuenta con el `userType` enviado

**Códigos de Respuesta:**
- `200 OK` - Cuenta creada exitosamente
- `409 Conflict` - Email ya existe
- `400 Bad Request` - Faltan datos requeridos

**Ejemplo Respuesta de Error:**
```json
{
  "error": "EmailAlreadyExists",
  "message": "Esta cuenta de correo ya está registrada. Usa el botón 'Iniciar sesión con Google'",
  "statusCode": 409
}
```

### 2. **mode=login** (Loguear con Google existente)

**Escenario:** Usuario existente quiere loguearse con Google

**Pasos en el Backend:**
1. ✅ Generar Google OAuth URL con state que incluya `mode=login`
2. 🔐 Usuario completa autenticación en Google
3. 🔐 En el callback:
   - Extraer email del idToken de Google
   - **VALIDACIÓN CRÍTICA:** ¿Email existe en BD?
     - ❌ NO → Retornar error: `{error: "UserNotFound", message: "..."}`
     - ✅ SI → Loguear usuario existente
   - Retornar tokens JWT + userType del usuario

**Códigos de Respuesta:**
- `200 OK` - Usuario autenticado exitosamente
- `404 Not Found` - Email no existe
- `400 Bad Request` - Faltan datos requeridos

**Ejemplo Respuesta de Error:**
```json
{
  "error": "UserNotFound",
  "message": "Esta cuenta no existe. Usa el botón 'Crear cuenta con Google'",
  "statusCode": 404
}
```

### 3. State Codificado en OAuth

El backend debe codificar el `state` así (en Base64URL como JWT):

```json
{
  "userType": "employee|organization",
  "mode": "signup|login",
  "nonce": "random-string",
  "timestamp": 1712973600,
  "clientId": "..."
}
```

**Decodificación en Backend (pseudocódigo .NET):**
```csharp
var stateData = DecodeState(state); // JSON decodificado
var mode = stateData.mode; // "signup" o "login"
var userType = stateData.userType; // "employee" o "organization"

if (mode == "signup" && userType == null)
    return BadRequest("userType requerido para signup");
```

### Tabla de Validación

| Escenario | Mode | Email Existe | Acción Backend | Status | Error |
|-----------|------|--------------|---|-----|----|
| Usuario nuevo con Google | `signup` | ❌ NO | Crear cuenta | ✅ 200 | — |
| Usuario nuevo con Google | `signup` | ✅ SI | ❌ Rechazar | 409 | `EmailAlreadyExists` |
| Usuario existente con Google | `login` | ✅ SI | Loguear | ✅ 200 | — |
| Usuario existente con Google | `login` | ❌ NO | ❌ Rechazar | 404 | `UserNotFound` |

---

## Mejoras de UI

### 🎨 Sign Up Component Rediseñado

#### Componentes Visuales Mejorados

**1. Header Animado**
- Titulo: "ProConnect" con gradiente azul
- Subtítulo: "Crea tu cuenta en 2 minutos"
- Animación: slideDown (0.6s)

**2. Card Principal**
- Max-width: 500px
- Border-radius: 20px
- Sombra: `0 12px 48px rgba(18,41,116,0.12)`
- Backdrop-filter: blur(10px) - efecto vidrio
- Animación: fadeIn con delay (0.6s)

**3. Validación Visual en Tiempo Real**
- ✅ Green checkmarks (#10b981) cuando campos son válidos
- ❌ Red borders (--red-color) cuando hay error
- Fondos semitransparentes según estado
- Mensajes de error debajo de cada campo

**4. Password Requirements Checker**
```
Mientras escribes la contraseña:
○ 8+ caracteres       (○ = no cumple, ✓ = cumple)
○ Una mayúscula
○ Un número
```
- Animación suave al cambiar estado
- Color verde (#10b981) cuando se cumple

**5. Role Selection con Iconos**
```
┌────────────────┐  ┌─────────────────┐
│      💼        │  │       🏢        │
│ Profesional    │  │    Empresa      │
│ Empleado o     │  │ Organización u  │
│ Freelancer     │  │    Negocio      │
└────────────────┘  └─────────────────┘
```
- Dos botones: grid 1fr 1fr en desktop, 1fr en móbil
- Hover: elevación + sombra (translateY -2px)
- Selected: fondo azul + texto blanco
- Descripciones claras debajo

**6. Alertas de Error**
- Icono: ⚠️
- Borde izquierdo rojo (4px)
- Fondo rojo semitransparente
- Animación: slideIn (0.3s)
- Ejemplos:
  - "Por favor, completa todos los campos"
  - "Las contraseñas no coinciden"
  - "Usa al menos 8 caracteres, 1 mayúscula y 1 número"

**7. Botón Primario**
- Gradiente: linear-gradient(135deg, --main-color → --main-color-dark)
- Sombra: 0 4px 15px rgba(30,61,173,0.3)
- Hover: elevación + sombra aumentada
- Estado loading: spinner animado + texto "Creando cuenta..."
- Deshabilitado: opacity 0.65, cursor not-allowed

**8. Divider Elegante**
```
─────────────────────────
        o  (centrado)
─────────────────────────
```
- Línea horizontal con fondo blanco detrás del "o"
- Separador entre formulario y Google

**9. Responsivo**
- Desktop: max-width 500px
- Tablet (640px): ajustes menoares
- Mobile (480px): 
  - Role buttons en una columna
  - Fonts reducidos
  - Padding optimizado
  - Min-height: 100vh

#### Animaciones Implementadas

| Nombre | Duración | Efecto |
|--------|----------|--------|
| `slideDown` | 0.6s | Header desciende 20px |
| `fadeIn` | 0.6s (con delay 0.1s) | Card aparece |
| `slideIn` | 0.3s | Alertas entran desde izquierda |
| `spin` | 0.8s (infinita) | Spinner de loading |
| Transiciones | 0.3s ease | Todos los hover/focus |

#### Esquema de Colores

```
Principal:    var(--main-color) [Azul #1E3DAD]
Principal Dark: var(--main-color-dark) [Azul oscuro]
Válido:       #10b981 (Verde)
Error:        var(--red-color) (Rojo)
Fondo:        var(--background-color-default) (Blanco)
Texto:        var(--text-color-default) (Gris oscuro)
Borde:        var(--gray-02) (Gris claro)
```

---

## Endpoints del Backend

### Autenticación

#### 1. GET `/auth/google/url`
**Descripción:** Genera la URL para iniciar OAuth con Google

**Query Parámetros:**
```
?userType=employee|organization  (opcional, requerido solo para signup)
&mode=signup|login               (requerido)
```

**Ejemplo:**
```
GET /auth/google/url?userType=employee&mode=signup
GET /auth/google/url?mode=login
```

**Respuesta Exitosa (200):**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "base64-encoded-state-data"
}
```

**Respuesta Error (400):**
```json
{
  "error": "ValidationError",
  "message": "mode es requerido",
  "details": "mode debe ser 'signup' o 'login'"
}
```

#### 2. POST `/auth/sign-up`
**Descripción:** Crea una nueva cuenta con Email/Contraseña

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "userType": "employee|organization"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "user-id-uuid",
  "email": "user@example.com",
  "userType": "employee",
  "createdAt": "2024-04-12T10:30:00Z"
}
```

**Respuesta Error (400/409):**
```json
{
  "error": "EmailAlreadyExists|ValidationError",
  "message": "...",
  "statusCode": 400 | 409
}
```

#### 3. POST `/auth/sign-in`
**Descripción:** Autentica con Email/Contraseña

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "accessToken": "jwt-token-xxx",
  "idToken": "id-token-xxx",
  "expiresIn": 3600,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "userType": "employee"
  }
}
```

**Respuesta Error (401/404):**
```json
{
  "error": "InvalidCredentials|UserNotFound",
  "message": "Email o contraseña incorrectos",
  "statusCode": 401
}
```

#### 4. GET `/auth/callback`
**Descripción:** Frontend callback handler (no endpoint backend, es frontend UI)

**Query Parámetros (retornados por backend):**
```
?id_token=jwt-id-token
&access_token=jwt-access-token
&expires_in=3600
&error=EmailAlreadyExists|UserNotFound  (si hay error)
&message=Error message
```

**Manejo Frontend:**
- Si hay `error`: mostrar mensaje y redirigir a `/sign-up` o `/sign-in`
- Si hay tokens: guardar en localStorage, actualizar store, redirigir a `/news`

#### 5. GET `/auth/me`
**Descripción:** Obtiene datos del usuario autenticado

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Respuesta Exitosa (200):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "userType": "employee|organization",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-04-12T10:30:00Z"
}
```

**Respuesta Error (401):**
```json
{
  "error": "Unauthorized",
  "message": "Token inválido o expirado"
}
```

---

## Testing Recomendado

### ✅ Sign Up - Flujo Manual (Email/Contraseña)

- [ ] Ingresar email válido
- [ ] Validación de email en tiempo real (checkmark aparece)
- [ ] Ingresar contraseña que NO cumple requisitos
- [ ] Ver lista de requisitos con ○ (no cumple)
- [ ] Contraseña con 8+ chars pero sin mayúscula
- [ ] Contraseña con 8+ chars, mayúscula pero sin número
- [ ] Contraseña válida (todos los ✓ en verde)
- [ ] Confirmar contraseña diferente
- [ ] Ver error "Las contraseñas no coinciden"
- [ ] Hacer coincidir contraseñas
- [ ] Ver checkmark en confirm password
- [ ] Seleccionar tipo "Employee"
- [ ] Ver botón azul con fondo en rol seleccionado
- [ ] Click en "Crear cuenta"
- [ ] Ver spinner animado
- [ ] Verificar que cuenta fue creada
- [ ] Usuario redirigido a /news

### ✅ Sign Up - Google OAuth

- [ ] Acceder a /sign-up
- [ ] Click en "Registrarse con Google" sin seleccionar tipo
- [ ] Verificar que NO abre popup (validación frontend)
- [ ] Seleccionar tipo "Employee"
- [ ] Click en "Registrarse con Google"
- [ ] Completar autenticación en Google
- [ ] Backend retorna tokens
- [ ] Usuario redirigido a /news
- [ ] Repetir con tipo "Organization"
- [ ] Intentar crear cuenta con email que ya existe (Google)
- [ ] Ver error "Email ya registrado"

### ✅ Sign In - Flujo Manual (Email/Contraseña)

- [ ] Acceder a /sign-in
- [ ] Ingresar email válido
- [ ] Ingresar contraseña correcta
- [ ] Click en "Iniciar sesión"
- [ ] Usuario redirigido a /news
- [ ] Intentar login con contraseña incorrecta
- [ ] Ver error "Credenciales inválidas"
- [ ] Intentar login con email no registrado
- [ ] Ver error "Usuario no encontrado"

### ✅ Sign In - Google OAuth

- [ ] Acceder a /sign-in
- [ ] Verificar que NO hay selector de tipo
- [ ] Click en "Continuar con Google"
- [ ] Completar autenticación en Google
- [ ] Backend busca usuario por email
- [ ] Backend retorna tokens + userType correcto
- [ ] Usuario redirigido a /news
- [ ] Verificar que /news muestra contenido correcto según userType
- [ ] Intentar login con Google pero email no registrado
- [ ] Ver error "Cuenta no existe. Regístrate primero"

### ✅ Responsive Testing

- [ ] Desktop (1920px): layout completo
- [ ] Tablet (768px): botones role en 2 columnas
- [ ] Mobile (375px): 
  - Botones role en 1 columna
  - Fonts reducidos
  - Padding optimizado
  - Min-height 100vh mantiene

### ✅ Validación

- [ ] Email no válido muestra error
- [ ] Contraseña sin requisitos muestra ○
- [ ] Contraseña válida muestra todos los ✓
- [ ] Botón "Crear cuenta" deshabilitado si falta algo
- [ ] Alertas de error aparecen/desaparecen suavemente
- [ ] No hay console errors

---

## Arquitectura

### Frontend Structure

```
src/app/auth/
├── components/
│   ├── google-login.component.vue          # Componente reutilizable Google
│   ├── sign-up/
│   │   └── sign-up-unified.component.vue   # Formulario Sign Up (EMAIL + GOOGLE)
│   ├── sign-in/
│   │   └── sign-in-form.component.vue      # Formulario Sign In (EMAIL + GOOGLE)
│   └── [otros componentes]
├── composables/
│   ├── useSignUpUnified.ts        # Lógica Sign Up (validación, estado)
│   ├── useSignInForm.ts           # Lógica Sign In (email/pass)
│   ├── useGoogleLogin.ts          # Lógica Google OAuth
│   ├── useGoogleCallback.ts       # Manejo callback OAuth
│   └── [otros composables]
├── services/
│   └── authentication.service.ts  # API calls (sign-up, sign-in, google)
├── pages/
│   ├── sign-up.page.vue
│   ├── sign-in.page.vue
│   └── [otras páginas]
└── constants/
    └── oauth-signup-role.ts       # Constantes OAuth
```

### Flujo de Datos

```
SIGNUP:
┌─────────────────────┐
│ sign-up.page.vue    │
└──────────┬──────────┘
           │
    ┌──────▼──────────┐
    │ sign-up-unified │ (componente)
    │   .component.vue│
    └──────┬──────────┘
           │
    ┌──────▼──────────────┐
    │ useSignUpUnified.ts │ (lógica)
    └──────┬──────────────┘
           │
    ┌──────▼─────────────────────┐
    │ authentication.service.ts   │ (API)
    └──────┬─────────────────────┘
           │
           ├─ POST /auth/sign-up    (formulario)
           │
           └─ GET /auth/google/url  (OAuth)
              └─ GoogleLoginComponent (popup)
```

### State Management

**Pinia Store:** `authentication.store.ts`
```typescript
state: {
  isAuthenticated: boolean
  currentUser: User | null
  userType: 'employee' | 'organization' | null
  accessToken: string | null
  idToken: string | null
}

actions: {
  login(tokens)
  logout()
  loadCurrentUser()
  setUserType(type)
}
```

### LocalStorage Keys

```javascript
// Usuario actual
localStorage.setItem('user', JSON.stringify({id, email, userType}))

// Tokens
localStorage.setItem('accessToken', 'jwt-xxx')
localStorage.setItem('idToken', 'jwt-xxx')

// Preferencias
localStorage.setItem('userType', 'employee|organization')
```

### SessionStorage Keys

```javascript
// Temporal: userType seleccionado en Sign Up (para Google OAuth)
sessionStorage.setItem('OAUTH_SIGNUP_ROLE', 'employee|organization')
// Nota: Ya no se usa en nueva arquitectura, puede removerse
```

---

## Notas Importantes

### ✅ Lo que Está Correcto

1. **Separación de flujos:**
   - Sign Up: selección obligatoria de tipo, manejo manual + Google
   - Sign In: sin selector, login rápido (backend obtiene tipo)

2. **Google OAuth:**
   - mode=signup → Crea nueva cuenta con userType
   - mode=login → Login existente, backend retorna userType

3. **Validación Frontend:**
   - Email formato válido
   - Contraseña: 8+ chars, 1 mayús, 1 número
   - Tipos coinciden
   - beforeGoogleSignUp() valida tipo antes de OAuth

4. **UI Moderno:**
   - Validación visual en tiempo real
   - Password requirements checker
   - Animaciones suaves
   - Responsive design
   - Alertas claras

### 🔄 Cambios Recientes

1. **CSS en sign-up-unified.component.vue:**
   - Removidas líneas duplicadas de `</style>`
   - Consolidado un único bloque `<style scoped>`
   - Todos los estilos en una sección (no fragmentado)

2. **Traducciones:**
   - Agregada clave `auth.signUpWithGoogle` en i18n
   - en.json: "Sign Up with Google"
   - es.json: "Registrarse con Google"

3. **Componentes:**
   - GoogleLoginComponent recibe `userType` opcional
   - `prepare-redirect` callback para Sign Up
   - `label-key` para traducción del botón

### 📋 Checklist de Implementación Backend

- [ ] Endpoint GET /auth/google/url genera URL con state
- [ ] State codificado incluye `mode` y `userType`
- [ ] mode=signup: Valida que email NO exista (crea si no existe)
- [ ] mode=signup: Retorna 409 si email existe
- [ ] mode=login: Valida que email SÍ exista
- [ ] mode=login: Retorna 404 si email no existe
- [ ] Callback maneja parámetros error en URL
- [ ] Backend retorna tokens + userType en response
- [ ] Tokens incluyen información correcta de usuario

### 🚀 Próximos Pasos

1. **Testing E2E:**
   - Selenium/Cypress para signup y login completos
   - Verificar Google OAuth en ambiente real
   - Testing de todos los casos de error

2. **Monitoreo:**
   - Logs de OAuth success/failure
   - Alertas para 409 (email duplicado) y 404 (usuario no existe)
   - Analytics de conversión signup/login

3. **Optimizaciones:**
   - Cache de datos de usuario
   - Refresh token rotation
   - Rate limiting en endpoints auth

4. **Documentación:**
   - Manual de usuario (Sign Up / Sign In)
   - Guía de configuración OAuth en producción
   - Troubleshooting común

---

## 📞 Soporte y Referencias

- **Frontend Framework:** Vue 3 + TypeScript
- **Build Tool:** Vite
- **OAuth Provider:** Google OAuth 2.0
- **State Management:** Pinia
- **HTTP Client:** Axios (via authentication.service.ts)
- **i18n:** vue-i18n

**Última actualización:** Abril 12, 2026
**Status:** ✅ En Producción

