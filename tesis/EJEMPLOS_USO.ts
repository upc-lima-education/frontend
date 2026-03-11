// ====================================================================
// EJEMPLOS DE USO - Consumiendo Backend .NET desde Frontend Vue
// ====================================================================

// ============================================================
// 1. SIGN UP - Registrar usuario
// ============================================================
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { SignUpRequest } from '@/app/auth/model/sign-up/sign-up.request';

const authStore = useAuthenticationStore();

const handleSignUp = async () => {
  const request = new SignUpRequest(
    'usuario@example.com',          // email
    'miPassword123',                // password
    'Juan García',                  // name (opcional)
    'Juan',                         // givenName (opcional)
    'García'                        // familyName (opcional)
  );

  const success = await authStore.signUp(request);
  
  if (success) {
    // Usuario registrado y autenticado
    // Se redirige automáticamente a NEWS_PAGE
    console.log('Bienvenido:', authStore.currentUser?.name);
  } else {
    // Error en el sign up
    console.error('Fallo en registro');
  }
};

// ============================================================
// 2. SIGN IN - Iniciar sesión
// ============================================================
import { SignInRequest } from '@/app/auth/model/sign-in/sign-in.request';

const handleSignIn = async (email: string, password: string) => {
  const request = new SignInRequest(email, password);
  
  const success = await authStore.signIn(request);
  
  if (success) {
    // Autenticado correctamente
    console.log('Token:', authStore.currentAccessToken);
    console.log('Datos usuario:', {
      id: authStore.currentUserId,
      email: authStore.currentUserEmail,
      nombre: authStore.currentUser?.name
    });
  }
};

// ============================================================
// 3. PASSWORD RESET - Solicitar recuperación de contraseña
// ============================================================
const handlePasswordReset = async (email: string) => {
  const success = await authStore.requestPasswordReset(email);
  
  if (success) {
    console.log('Email de recuperación enviado a:', email);
  } else {
    console.error('Error al solicitar reset');
  }
};

// ============================================================
// 4. SIGN OUT - Cerrar sesión
// ============================================================
const handleSignOut = async () => {
  await authStore.signOut();
  // Se redirige automáticamente a SIGN_IN_PAGE
  // Los tokens se eliminan de localStorage
};

// ============================================================
// 5. GET CURRENT USER - Obtener datos usuario autenticado
// ============================================================
const handleLoadUser = async () => {
  const success = await authStore.loadCurrentUser();
  
  if (success) {
    const user = authStore.currentUser;
    console.log('Usuario cargado:', {
      id: user?.id,
      email: user?.email,
      nombre: user?.givenName + ' ' + user?.familyName,
      foto: user?.picture,
      emailVerificado: user?.emailVerified
    });
  } else {
    console.log('Token expirado - usuario no autenticado');
  }
};

// ============================================================
// 6. GOOGLE OAUTH - Flujo de login con Google
// ============================================================

// Paso 1: Obtener URL de Google
const getGoogleLoginUrl = async () => {
  const url = await authenticationService.getGoogleAuthUrl();
  // Redirigir usuario a: url
  window.location.href = url;
};

// Paso 2: Manejar callback de Google (en una página callback)
const handleGoogleCallback = async () => {
  // Obtener el 'code' de los parámetros de URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    const success = await authStore.signInWithGoogleCode(code);
    if (success) {
      console.log('Google signup exitoso');
      // Se redirige automáticamente a NEWS_PAGE
    }
  }
};

// Paso 3: Verificar Google Token (opcional)
const verifyGoogleToken = async (idToken: string) => {
  const user = await authenticationService.verifyGoogleToken(idToken);
  console.log('Usuario Google verificado:', user.email);
};

// ============================================================
// 7. ACCEDER DATOS DESDE COMPONENTES
// ============================================================

// En setup() de componente Vue
const userEmail = authStore.currentUserEmail;
const userId = authStore.currentUserId;
const isLoggedIn = authStore.isSignedIn;
const token = authStore.currentAccessToken;
const userData = authStore.currentUser; // UserResponse completo

// ============================================================
// 8. INTERCEPTOR - Tokens automáticos en requests
// ============================================================
// Con el interceptor activado, TODOS los requests incluyen:
// Authorization: Bearer {accessToken}

// Ejemplo - Servicio que usa http:
import http from "@/app/shared/services/base.service";

async function fetchUserProfile() {
  // El token se añade automáticamente por el interceptor
  const response = await http.get('/users/me');
  return response.data;
}

// ============================================================
// 9. STORAGE PERSISTENTE
// ============================================================

// Los tokens se guardan en localStorage:
localStorage.getItem('accessToken');   // JWT token para requests
localStorage.getItem('refreshToken');  // Token para refresh (opcional)
localStorage.getItem('expiresIn');    // Exp time en segundos

// Al hacer signOut() se limpian automáticamente

// ============================================================
// 10. MANEJO DE ERRORES
// ============================================================

const handleLoginWithErrorHandling = async () => {
  try {
    const request = new SignInRequest('usuario@example.com', 'password');
    const success = await authStore.signIn(request);
    
    if (!success) {
      // El store ya mostró el error en la consola
      // Mostrar notificación al usuario
      console.error('Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    // Mostrar: "No se pudo conectar con el servidor"
  }
};

// ============================================================
// 11. COMPONENTE COMPLETO - Sign In Form
// ============================================================

/*
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    
    <button :disabled="loading" type="submit">
      {{ loading ? 'Ingresando...' : 'Ingresar' }}
    </button>
    
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { SignInRequest } from '@/app/auth/model/sign-in/sign-in.request';

const authStore = useAuthenticationStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const request = new SignInRequest(email.value, password.value);
    const success = await authStore.signIn(request);
    
    if (!success) {
      error.value = 'Email o contraseña incorrectos';
    }
  } catch (err) {
    error.value = 'Error de conexión con el servidor';
  } finally {
    loading.value = false;
  }
};
</script>
*/

// ============================================================
// NOTAS IMPORTANTES
// ============================================================

/*
1. BASE URL
   - Default: http://localhost:5000/api/v1
   - Cambiar en .env.local: VITE_API_URL=...

2. TOKENS
   - accessToken: Usa en requests (automático con interceptor)
   - refreshToken: Guardar para refresh (si backend lo requiere)

3. RUTAS PROTEGIDAS
   - GET /api/v1/me requiere Authorization: Bearer token

4. ERRORES COMUNES
   - 401: Token expirado o inválido
   - 400: Datos de request incorrectos
   - 500: Error del servidor

5. DESARROLLO LOCAL
   - Backend .NET debe estar en localhost:5000
   - Frontend en localhost:5173 (por defecto Vite)
   - CORS debe permitir localhost:5173
*/
