<script setup lang="ts">
import GoogleLoginComponent from '@/app/auth/components/google-login.component.vue';
import AuthBrandPanelComponent from '@/app/auth/components/auth-brand-panel.component.vue';
import { useSignUpUnified } from '@/app/auth/composables/useSignUpUnified';

const {
    role,
    email,
    password,
    confirmPassword,
    loading,
    serverError,
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
    <AuthBrandPanelComponent
      :title="$t('auth.signUpBrandTitle')"
      :note="$t('auth.signUpBrandNote')"
    />

    <section class="form-panel">
      <header class="form-head">
        <span class="form-eyebrow">{{ $t('auth.signUpPageSubtitle') }}</span>
        <h1 class="welcome">{{ $t('auth.signUpCardTitle') }}</h1>
      </header>

      <form @submit.prevent="onSignUp" class="auth-form">
        <div v-if="serverError" class="alert">{{ serverError }}</div>

        <!-- Hero decision: which side of the network are you? -->
        <div class="field">
          <label>{{ $t('auth.roleQuestion') }}</label>
          <div class="role-buttons">
            <button
              type="button"
              class="role-btn role-btn--pro"
              :class="{ selected: role === 'employee' }"
              :aria-pressed="role === 'employee'"
              @click="selectRole('employee')"
            >
              <svg class="role-icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.8"/>
                <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor"
                      stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <strong>{{ $t('auth.roleEmployee') }}</strong>
            </button>
            <button
              type="button"
              class="role-btn role-btn--org"
              :class="{ selected: role === 'organization' }"
              :aria-pressed="role === 'organization'"
              @click="selectRole('organization')"
            >
              <svg class="role-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="4" width="14" height="16" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
                <path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 20v-3h4v3" fill="none"
                      stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <strong>{{ $t('auth.roleOrganization') }}</strong>
            </button>
          </div>
        </div>

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

        <!-- Submit Button -->
        <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
          <span v-if="!loading">{{ $t('auth.createAccount') }}</span>
          <span v-else class="loading-spinner"><span class="spinner"></span> {{ $t('common.loading') }}</span>
        </button>

        <div class="divider"><span>{{ $t('auth.orWithEmail') }}</span></div>

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
  max-width: 940px;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 30px 70px -24px rgba(12, 22, 57, 0.45);
  overflow: hidden;
}

.auth-card :where(h1, p, span, label, input, button, a, small, strong) {
  font-family: var(--font-body);
}

/* Form panel */
.form-panel {
  padding: 2.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-head {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.2rem;
}

.form-eyebrow {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--secondary-color);
}

.welcome {
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 600;
  color: var(--main-color-07);
  margin: 0;
  letter-spacing: -0.02em;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: rgba(210, 38, 38, 0.08);
  border-left: 4px solid var(--red-color);
  color: var(--red-color);
  font-size: 0.875rem;
}

.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray-07);
  margin-bottom: 0.45rem;
}

.field input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--gray-02);
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--gray-01);
  color: var(--main-color-07);
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}

.field input::placeholder {
  color: var(--gray-04);
}

.field input:focus {
  outline: none;
  background: #fff;
  border-color: var(--main-color);
  box-shadow: 0 0 0 3px rgba(236, 78, 16, 0.16);
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
  transition: background 0.18s, color 0.18s;
}

.req-met {
  background: rgba(59, 156, 32, 0.12);
  color: var(--green-color-dark);
}

/* Role choice — the hero decision */
.role-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.role-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.95rem 0.9rem;
  border: 1.5px solid var(--gray-02);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--gray-07);
  transition: border-color 0.18s, background 0.18s, transform 0.1s;
  text-align: left;
}

.role-icon {
  width: 24px;
  height: 24px;
  color: var(--gray-05);
  transition: color 0.18s;
}

.role-btn strong {
  font-weight: 600;
  line-height: 1.2;
}

.role-btn:hover {
  border-color: var(--gray-03);
  transform: translateY(-1px);
}

.role-btn--pro.selected {
  border-color: var(--main-color);
  background: rgba(30, 61, 173, 0.06);
  color: var(--main-color-07);
}

.role-btn--pro.selected .role-icon {
  color: var(--main-color);
}

.role-btn--org.selected {
  border-color: var(--secondary-color);
  background: rgba(236, 78, 16, 0.07);
  color: var(--main-color-07);
}

.role-btn--org.selected .role-icon {
  color: var(--secondary-color);
}

.btn-primary {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 12px;
  background: var(--main-color);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--main-color-04);
  box-shadow: 0 10px 22px -10px rgba(30, 61, 173, 0.7);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* base.css `* { color: black }` repaints the inner span — keep it white. */
.btn-primary span {
  color: #fff;
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
  gap: 0.9rem;
  margin: 0.25rem 0;
  color: var(--gray-05);
  font-size: 0.78rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-02);
}

.foot-note {
  margin: 0.5rem 0 0;
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

@media (prefers-reduced-motion: reduce) {
  .role-btn,
  .btn-primary,
  .spinner {
    transition: none;
    animation: none;
  }
}

/* Responsive */
@media (max-width: 860px) {
  .auth-card {
    grid-template-columns: 1fr;
    max-width: 460px;
  }

  .form-panel {
    padding: 2.25rem 1.75rem;
  }
}

@media (max-width: 420px) {
  .role-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
