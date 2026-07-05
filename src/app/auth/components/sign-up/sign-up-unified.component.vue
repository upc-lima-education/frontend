<script setup lang="ts">
import GoogleLoginComponent from '@/app/auth/components/google-login.component.vue';
import { useSignUpUnified } from '@/app/auth/composables/useSignUpUnified';

const {
    role,
    email,
    password,
    confirmPassword,
    loading,
    serverError,
    areAllFieldsFilled,
    doPasswordsMatch,
    isPasswordValid,
    isEmailValid,
    isFormValid,
    beforeGoogleSignUp,
    selectRole,
    onSignUp,
    goToSignIn,
} = useSignUpUnified();
</script>

<template>
  <div class="auth-card">
    <!-- Brand / illustration panel -->
    <aside class="brand-panel">
      <div class="brand-head">
        <img class="brand-logo" src="../../../shared/assets/icons/logo.svg" alt="Llanqui" />
        <span class="brand-name">{{ $t('auth.brandName') }}</span>
      </div>
      <div class="brand-art">
        <img src="../../../shared/assets/icons/Usuario.svg" alt="" />
      </div>
      <p class="brand-tagline">{{ $t('auth.signUpPageSubtitle') }}</p>
    </aside>

    <!-- Form panel -->
    <section class="form-panel">
      <header class="form-head">
        <h1 class="welcome">{{ $t('auth.signUpCardTitle') }}</h1>
        <p class="welcome-sub">{{ $t('auth.signUpPageSubtitle') }}</p>
      </header>

      <form @submit.prevent="onSignUp" class="auth-form">
        <!-- Error Messages -->
        <div v-if="serverError" class="alert">{{ serverError }}</div>

        <!-- Email Field -->
        <div class="field">
          <label for="email">{{ $t('auth.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="nombre@empresa.com"
            :class="{ 'is-valid': email && isEmailValid, 'is-error': email && !isEmailValid }"
          />
          <small v-if="email && !isEmailValid" class="field-error">Ingresa un correo válido</small>
        </div>

        <!-- Password Field -->
        <div class="field">
          <label for="password">{{ $t('auth.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
            :class="{ 'is-valid': password && isPasswordValid, 'is-error': password && !isPasswordValid }"
          />
          <div v-if="password" class="password-requirements">
            <span class="req" :class="{ 'req-met': password.length >= 8 }">8+ caracteres</span>
            <span class="req" :class="{ 'req-met': /[A-Z]/.test(password) }">1 mayúscula</span>
            <span class="req" :class="{ 'req-met': /[0-9]/.test(password) }">1 número</span>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="field">
          <label for="confirmPassword">{{ $t('auth.confirmPassword') }}</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Repite tu contraseña"
            :class="{ 'is-valid': confirmPassword && doPasswordsMatch && password, 'is-error': confirmPassword && !doPasswordsMatch }"
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
              :class="{ selected: role === 'employee' }"
              @click="selectRole('employee')"
            >
              <strong>{{ $t('auth.roleEmployee') }}</strong>
            </button>
            <button
              type="button"
              class="role-btn"
              :class="{ selected: role === 'organization' }"
              @click="selectRole('organization')"
            >
              <strong>{{ $t('auth.roleOrganization') }}</strong>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
          <span v-if="!loading">{{ $t('auth.createAccount') }}</span>
          <span v-else class="loading-spinner"><span class="spinner"></span> {{ $t('common.loading') }}</span>
        </button>

        <div class="divider"><span>o</span></div>

        <!-- Google Sign Up -->
        <GoogleLoginComponent
          :user-type="role ?? undefined"
          mode="signup"
          :prepare-redirect="beforeGoogleSignUp"
          label-key="auth.signUpWithGoogle"
        />
      </form>

      <p class="foot-note">
        {{ $t('auth.alreadyOnRecord') }}
        <button type="button" class="link-btn" @click="goToSignIn">{{ $t('auth.login') }}</button>
      </p>
    </section>
  </div>
</template>

<style scoped>
.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 920px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(18, 41, 116, 0.18);
  overflow: hidden;
}

/* Brand panel */
.brand-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem 2rem;
  background: linear-gradient(160deg, var(--main-color) 0%, var(--main-color-06) 100%);
  color: #fff;
}

/* base.css aplica * { color: var(--text-color) } que sobreescribe la herencia.
   Forzamos blanco en todos los elementos textuales del panel oscuro. */
.brand-panel :where(span, p, h1, h2, h3, small) {
  color: #fff;
}

.brand-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  align-self: flex-start;
}

.brand-logo {
  width: 34px;
  height: 34px;
  filter: brightness(0) invert(1);
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #fff;
}

.brand-art {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  padding: 1.5rem 0;
}

.brand-art img {
  width: 55%;
  max-width: 180px;
  filter: brightness(0) invert(1);
  opacity: 0.95;
}

.brand-tagline {
  margin: 0;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

/* Form panel */
.form-panel {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
}

.form-head {
  margin-bottom: 1.25rem;
}

.welcome {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--main-color-07);
  margin: 0 0 0.35rem;
  letter-spacing: -0.02em;
}

.welcome-sub {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray-05);
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
  border-left: 4px solid var(--red-color);
  color: var(--red-color);
  font-size: 0.875rem;
}

.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray-07);
  margin-bottom: 0.4rem;
}

.field input {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--gray-02);
  border-radius: 10px;
  font-size: 0.95rem;
  background: #fff;
  color: var(--main-color-07);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field input:focus {
  outline: none;
  border-color: var(--main-color);
  box-shadow: 0 0 0 3px rgba(30, 61, 173, 0.12);
}

.field input.is-valid {
  border-color: var(--green-color);
}

.field input.is-error {
  border-color: var(--red-color);
}

.field-error {
  display: block;
  margin-top: 0.35rem;
  color: var(--red-color);
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
  background: var(--gray-01);
  color: var(--gray-05);
}

.req-met {
  background: rgba(59, 156, 32, 0.12);
  color: var(--green-color-dark);
}

.role-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.role-btn {
  padding: 0.8rem 0.75rem;
  border: 1px solid var(--gray-02);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--gray-07);
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
  border-color: var(--main-color);
  background: rgba(30, 61, 173, 0.04);
}

.role-btn.selected {
  border-color: var(--main-color);
  background: var(--main-color);
  color: #fff;
}

.btn-primary {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 10px;
  background: var(--main-color);
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
    background: var(--main-color-04);
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
  margin: 0.5rem 0;
  color: var(--gray-05);
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-02);
}

.foot-note {
  margin: 1.25rem 0 0;
  font-size: 0.9rem;
  color: var(--gray-06);
  text-align: center;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--main-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    grid-template-columns: 1fr;
    max-width: 460px;
  }

  .brand-panel {
    flex-direction: row;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem;
  }

  .brand-head { align-self: center; }
  .brand-art { display: none; }
  .brand-tagline { display: none; }

  .form-panel {
    padding: 2rem 1.5rem;
  }

  .role-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
