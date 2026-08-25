<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ROUTE_CONSTANTS } from '@/app/common/router/route-constants';
import GoogleLoginComponent from './google-login.component.vue';

const router = useRouter();
const authStore = useAuthenticationStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleSignIn() {
  if (!email.value || !password.value) {
    error.value = 'Por favor, ingresa tu correo y contraseña';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const success = await authStore.signIn({
      email: email.value,
      password: password.value,
    });

    if (!success) {
      error.value = 'Correo o contraseña incorrectos';
    } else {
      router.push(ROUTE_CONSTANTS.NEWS_PAGE);
    }
  } catch (err) {
    console.error('Sign-in error:', err);
    error.value = 'Ocurrió un error al intentar iniciar sesión';
  } finally {
    loading.value = false;
  }
}

function goToSignUp() {
  router.push(ROUTE_CONSTANTS.SIGN_UP_PAGE);
}
</script>

<template>
  <div class="sign-in-form-wrapper">
    <GoogleLoginComponent mode="login" />

    <div class="divider">
      <span>{{ $t('auth.orWithEmail') }}</span>
    </div>

    <form class="auth-form" @submit.prevent="handleSignIn">
      <div class="field">
        <label for="si-email">{{ $t('auth.email') }}</label>
        <input
          id="si-email"
          v-model="email"
          type="email"
          autocomplete="username"
          :placeholder="$t('auth.emailPlaceholder')"
          required
        />
      </div>

      <div class="field">
        <label for="si-password">{{ $t('auth.password') }}</label>
        <input
          id="si-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <div class="form-options">
        <RouterLink class="forgot-link" to="/forgot-password">
          {{ $t('auth.forgotPassword') }}
        </RouterLink>
      </div>

      <div v-if="error" class="error-alert" role="alert">
        {{ error }}
      </div>

      <button type="submit" class="btn-primary" :disabled="loading">
        <span>{{ loading ? $t('common.loading') : $t('auth.login') }}</span>
        <svg v-if="!loading" class="btn-arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </form>

    <p class="foot-note">
      {{ $t('auth.noAccountYet') }}
      <button type="button" class="link-btn" @click="goToSignUp">
        {{ $t('auth.createAccount') }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.sign-in-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: var(--gray-05, #8c8c8c);
  font-size: 0.78rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-02, #e8e8e8);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray-07, #262626);
  margin-bottom: 0.4rem;
}

.field input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--gray-02, #d9d9d9);
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--gray-01, #fafafa);
  transition: border-color 0.18s, box-shadow 0.18s;
}

.field input:focus {
  outline: none;
  background: #fff;
  border-color: var(--main-color, #1890ff);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.16);
}

.form-options {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  font-size: 0.83rem;
  color: var(--main-color, #1890ff);
  text-decoration: none;
  font-weight: 600;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-primary {
  width: 100%;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 12px;
  background: var(--main-color, #1890ff);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.18s, transform 0.1s;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-arrow {
  width: 18px;
  height: 18px;
}

.foot-note {
  font-size: 0.9rem;
  color: var(--gray-06, #595959);
  text-align: center;
  margin: 0;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--main-color, #1890ff);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.error-alert {
  color: var(--red-color, #ff4d4f);
  font-size: 0.8125rem;
  text-align: center;
}
</style>