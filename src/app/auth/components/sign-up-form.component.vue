<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ROUTE_CONSTANTS } from '@/app/common/router/route-constants';
import { ProfileType } from '@/app/profiles/enums/profile-type.enum';
import GoogleLoginComponent from './google-login.component.vue';

const router = useRouter();
const authStore = useAuthenticationStore();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const profileType = ref<ProfileType | null>(null);

const loading = ref(false);
const serverError = ref('');

// Validaciones reactivas
const isEmailValid = computed(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.value);
});

const isPasswordValid = computed(() => {
  return (
    password.value.length >= 8 &&
    /[A-Z]/.test(password.value) &&
    /[0-9]/.test(password.value)
  );
});

const doPasswordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

const isFormValid = computed(() => {
  return (
    !!email.value &&
    !!password.value &&
    !!confirmPassword.value &&
    isEmailValid.value &&
    isPasswordValid.value &&
    doPasswordsMatch.value &&
    !!profileType.value
  );
});

function selectRole(role: ProfileType) {
  profileType.value = role;
}

async function handleSignUp() {
  serverError.value = '';

  if (!isFormValid.value) {
    serverError.value = 'Por favor, completa todos los campos correctamente.';
    return;
  }

  loading.value = true;

  try {
    const success = await authStore.signUp({
      email: email.value,
      password: password.value,
      profileType: profileType.value
    });

    if (!success) {
      serverError.value = 'El correo ya se encuentra registrado o los datos son inválidos.';
    } else {
      router.push(ROUTE_CONSTANTS.HOME);
    }
  } catch (error) {
    console.error('Sign up error:', error);
    serverError.value = 'Ocurrió un error al intentar conectar con el servidor';
  } finally {
    loading.value = false;
  }
}

function goToSignIn() {
  router.push(ROUTE_CONSTANTS.SIGN_IN_PAGE);
}
</script>

<template>
  <div class="sign-up-form-wrapper">
    <form class="auth-form" @submit.prevent="handleSignUp">
      <!-- Error general -->
      <div v-if="serverError" class="alert" role="alert">
        {{ serverError }}
      </div>

      <!-- Email Field -->
      <div class="field">
        <label for="su-email">{{ $t('auth.email') }}</label>
        <input
          id="su-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="nombre@empresa.com"
          :class="{ 'is-valid': email && isEmailValid, 'is-error': email && !isEmailValid }"
          required
        />
        <small v-if="email && !isEmailValid" class="field-error">Ingresa un correo válido</small>
      </div>

      <!-- Password Field -->
      <div class="field">
        <label for="su-password">{{ $t('auth.password') }}</label>
        <input
          id="su-password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="Mínimo 8 caracteres"
          :class="{ 'is-valid': password && isPasswordValid, 'is-error': password && !isPasswordValid }"
          required
        />
        <div v-if="password" class="password-requirements">
          <span class="req" :class="{ 'req-met': password.length >= 8 }">8+ caracteres</span>
          <span class="req" :class="{ 'req-met': /[A-Z]/.test(password) }">1 mayúscula</span>
          <span class="req" :class="{ 'req-met': /[0-9]/.test(password) }">1 número</span>
        </div>
      </div>

      <!-- Confirm Password Field -->
      <div class="field">
        <label for="su-confirm-password">{{ $t('auth.confirmPassword') }}</label>
        <input
          id="su-confirm-password"
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          placeholder="Repite tu contraseña"
          :class="{ 'is-valid': confirmPassword && doPasswordsMatch && password, 'is-error': confirmPassword && !doPasswordsMatch }"
          required
        />
        <small v-if="confirmPassword && !doPasswordsMatch" class="field-error">Las contraseñas no coinciden</small>
      </div>

      <!-- Role Selection -->
      <div class="field">
        <label>{{ $t('auth.roleQuestion') }}</label>
        <div class="role-buttons">
          <button
            type="button"
            class="role-btn"
            :class="{ selected: profileType === ProfileType.Candidate }"
            @click="selectRole('employee')"
          >
            <strong>{{ $t('auth.roleEmployee') }}</strong>
          </button>
          <button
            type="button"
            class="role-btn"
            :class="{ selected: profileType === ProfileType.Company }"
            @click="selectRole('organization')"
          >
            <strong>{{ $t('auth.roleOrganization') }}</strong>
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
        <span v-if="!loading">{{ $t('auth.createAccount') }}</span>
        <span v-else class="loading-spinner">
          <span class="spinner"></span> {{ $t('common.loading') }}
        </span>
      </button>

      <div class="divider">
        <span>{{ $t('auth.orWithEmail') }}</span>
      </div>

      <!-- Google Sign Up -->
      <GoogleLoginComponent
        :user-type="profileType ?? undefined"
        mode="signup"
        label-key="auth.signUpWithGoogle"
      />
    </form>

    <p class="foot-note">
      {{ $t('auth.alreadyOnRecord') }}
      <button type="button" class="link-btn" @click="goToSignIn">
        {{ $t('auth.login') }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.sign-up-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(210, 38, 38, 0.08);
  border-left: 4px solid var(--red-color, #ff4d4f);
  color: var(--red-color, #ff4d4f);
  font-size: 0.875rem;
}

.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray-07, #262626);
  margin-bottom: 0.4rem;
}

.field input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--gray-02, #d9d9d9);
  border-radius: 10px;
  font-size: 0.95rem;
  background: #fff;
  color: var(--main-color-07, #0c1145);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field input:focus {
  outline: none;
  border-color: var(--main-color, #1890ff);
  box-shadow: 0 0 0 3px rgba(30, 61, 173, 0.12);
}

.field input.is-valid {
  border-color: var(--green-color, #52c41a);
}

.field input.is-error {
  border-color: var(--red-color, #ff4d4f);
}

.field-error {
  display: block;
  margin-top: 0.35rem;
  color: var(--red-color, #ff4d4f);
  font-size: 0.78rem;
}

.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.req {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--gray-01, #fafafa);
  color: var(--gray-05, #8c8c8c);
}

.req-met {
  background: rgba(59, 156, 32, 0.12);
  color: var(--green-color-dark, #277c14);
}

.role-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.role-btn {
  padding: 0.8rem 0.75rem;
  border: 1px solid var(--gray-02, #d9d9d9);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--gray-07, #262626);
  transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease, transform 100ms ease-out;
  text-align: center;
}

.role-btn:active {
  transform: scale(0.97);
}

.role-btn strong {
  font-weight: 600;
  color: inherit;
}

.role-btn:hover {
  border-color: var(--main-color, #1890ff);
  background: rgba(30, 61, 173, 0.04);
}

.role-btn.selected {
  border-color: var(--main-color, #1890ff);
  background: var(--main-color, #1890ff);
  color: #fff;
}

.btn-primary {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 10px;
  background: var(--main-color, #1890ff);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease, transform 100ms ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover:not(:disabled) {
    background: var(--main-color-04, #1255cc);
  }
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.25rem 0;
  color: var(--gray-05, #8c8c8c);
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-02, #e8e8e8);
}

.foot-note {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--gray-06, #595959);
  text-align: center;
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

@media (max-width: 860px) {
  .role-buttons {
    grid-template-columns: 1fr;
  }
}
</style>