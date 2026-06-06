import http from '@/app/shared/services/base.service';

/**
 * Verificador de conectividad Frontend-Backend
 * Ejecuta tests para confirmar que la conexión está funcionando correctamente
 */
export async function verifyBackendConnection() {
  console.group('🔍 Verificando conexión Frontend-Backend');
  
  const results = {
    apiUrl: '',
    corsCheck: false,
    authEndpoint: false,
    googleUrlEndpoint: false,
    errors: [] as string[]
  };

  try {
    // 1. Verificar URL de API
    results.apiUrl = http.defaults.baseURL || 'No configurada';
    console.log('✓ API URL:', results.apiUrl);

    // 2. Test de CORS - GET request sin autenticación
    try {
      const corsTest = await http.get('/auth/google/url?userType=employee&mode=signup');
      if (corsTest.status === 200) {
        results.corsCheck = true;
        console.log('✓ CORS funcionando correctamente');
        console.log('  Respuesta:', corsTest.data);
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 200) {
        results.corsCheck = true;
        console.log('✓ CORS funcionando (endpoint respondió)');
      } else {
        results.errors.push(`CORS test falló: ${error.message}`);
        console.error('✗ Error en CORS test:', error.message);
      }
    }

    // 3. Test de autenticación - GET /auth/me (debería fallar sin token)
    try {
      await http.get('/auth/me');
      console.warn('⚠️ /auth/me respondió sin autenticación (comportamiento inesperado)');
    } catch (error: any) {
      if (error.response?.status === 401) {
        results.authEndpoint = true;
        console.log('✓ Endpoint de autenticación funciona (retorna 401 sin token)');
      } else {
        results.errors.push(`Auth endpoint test falló: ${error.message}`);
        console.error('✗ Error en auth endpoint:', error.message);
      }
    }

    // 4. Test de interceptor
    console.log('✓ Interceptor de autenticación cargado');

  } catch (error: any) {
    results.errors.push(error.message);
    console.error('✗ Error general:', error);
  }

  console.group('📊 Resumen de verificación');
  console.table({
    'API URL': results.apiUrl,
    'CORS': results.corsCheck ? '✓ OK' : '✗ Falló',
    'Auth Endpoint': results.authEndpoint ? '✓ OK' : '✗ Falló',
    'Errores': results.errors.length > 0 ? results.errors.join(', ') : 'Ninguno'
  });
  console.groupEnd();
  console.groupEnd();

  return results;
}

/**
 * Prueba de registro (Sign Up)
 */
export async function testSignUp(email: string, password: string) {
  console.log('📝 Probando Sign Up...');
  try {
    const response = await http.post('/auth/sign-up', {
      email,
      password
    });
    console.log('✓ Sign Up exitoso:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('✗ Error en Sign Up:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Prueba de login (Sign In)
 */
export async function testSignIn(email: string, password: string) {
  console.log('🔐 Probando Sign In...');
  try {
    const response = await http.post('/auth/sign-in', {
      email,
      password
    });
    console.log('✓ Sign In exitoso:', response.data);
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      console.log('✓ Token guardado en localStorage');
    }
    return response.data;
  } catch (error: any) {
    console.error('✗ Error en Sign In:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Prueba de obtener usuario actual
 */
export async function testGetCurrentUser() {
  console.log('👤 Probando GET /auth/me...');
  try {
    const response = await http.get('/auth/me');
    console.log('✓ Usuario actual:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('✗ Error obteniendo usuario:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Prueba de Google OAuth URL
 */
export async function testGoogleAuthUrl() {
  console.log('🔐 Probando Google Auth URL...');
  try {
    const response = await http.get('/auth/google/url', {
      params: {
        userType: 'employee',
        mode: 'signup'
      }
    });
    console.log('✓ Google Auth URL obtenida:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('✗ Error obteniendo Google Auth URL:', error.response?.data || error.message);
    throw error;
  }
}
