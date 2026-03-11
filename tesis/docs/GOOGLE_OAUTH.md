# Google OAuth Integration Guide

## 🔧 Flujo de Google OAuth

Tu API maneja el flujo OAuth. El frontend solo necesita:

### Paso 1: Usuario hace clic en "Sign in with Google"
```vue
<!-- Automático con: -->
<GoogleLoginComponent />
```

### Paso 2: Backend obtiene URL de Google
```
GET http://localhost:5155/api/v1/auth/google/url
Response: { "url": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

### Paso 3: Google redirige al callback
```
GET http://localhost:5174/auth/google/callback?code=...&state=...
```

El frontend captura el `code` automáticamente.

### Paso 4: Intercambiar código por tokens
```
POST http://localhost:5155/api/v1/auth/google/token
Body: { "code": "..." }
Response: { "accessToken": "...", "refreshToken": "..." }
```

### Paso 5: Usuario autenticado ✅

## 📋 Configuración Necesaria en .env.local

```env
VITE_API_URL=http://localhost:5155/api/v1
```

## 🚀 Componentes Implementados

### 1. GoogleLoginComponent
**Ubicación:** `src/app/auth/components/google-login.component.vue`

Botón que obtiene la URL de Google y redirige al usuario.

```vue
<GoogleLoginComponent />
```

**Lo que hace:**
- Obtiene URL de `GET /auth/google/url`
- Redirige a Google
- Muestra estado de carga

### 2. Google Callback Page
**Ubicación:** `src/app/auth/pages/google-callback.page.vue`

Página que maneja el callback de Google automáticamente.

**Ruta:** `/auth/google/callback`

**Lo que hace:**
- Captura el `code` de la URL
- Llama a `signInWithGoogleCode(code)`
- Redirige a `/news` si es exitoso
- Muestra error si falla

## 🔗 Rutas Afectadas

| Ruta | Componente | Propósito |
|------|-----------|----------|
| `/sign-in` | SignInPage | Login con email/password + Google |
| `/auth/google/callback` | GoogleCallbackPage | Maneja callback de Google |

## 📝 Implementación en Backend

Tu backend debe:

1. **GET /auth/google/url**
   - Generar URL de consentimiento de Google
   - Incluir redirect_uri: `http://localhost:5174/auth/google/callback`

2. **POST /auth/google/token**
   - Recibir `code`
   - Intercambiarlo por tokens en Google
   - Retornar: `accessToken`, `refreshToken`, user

3. **POST /auth/google/verify** (opcional)
   - Verificar que un token de Google es válido

## ✅ Verificación

### Test en Frontend
1. Ve a `http://localhost:5174/sign-in`
2. Haz clic en "Continuar con Google"
3. Deberías ir a Google
4. Luego volverá a `http://localhost:5174/auth/google/callback?code=...`
5. Si todo funciona, te redirige a `/news`

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "No se recibió código" | código no enviado desde Google | Verificar Google Cloud Console |
| "Error al autenticarse" | Backend no devuelve tokens | Revisar logs del backend |
| "Error de conexión" | Backend offline | Verificar que está corriendo |

## 🔐 Security Notes

- Google redirige a `http://localhost:5174/auth/google/callback`
- Este debe estar registrado en Google Cloud Console
- El código expira rápidamente (minutos)
- El token se guarda en localStorage

## 📚 Métodos Disponibles en Store

```typescript
const authStore = useAuthenticationStore();

// Intercambiar código por tokens
await authStore.signInWithGoogleCode(code);

// Verificar un token (opcional)
const user = await authenticationService.verifyGoogleToken(idToken);

// Obtener URL (interno)
const url = await authenticationService.getGoogleAuthUrl();
```

## 🎯 Próximos Pasos

1. Registra tu app en Google Cloud Console
2. Obtén Client ID y Secret
3. Configura redirect URI: `http://localhost:5174/auth/google/callback`
4. Prueba el flujo completo
