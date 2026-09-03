<script setup lang="ts">
import { ref } from 'vue';
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

const showPassword = ref(false);
const showConfirm = ref(false);
</script>

<template>
  <div class="auth-card">
    <!-- ── Dark Brand Panel ── -->
    <aside class="brand-panel" aria-label="Información de Llanqui">
      <div class="dot-matrix" aria-hidden="true"></div>
      <div class="inner-glow" aria-hidden="true"></div>

      <div class="brand-head">
        <img class="brand-logo" src="../../../shared/assets/icons/logo.svg" alt="" />
        <span class="brand-name">Llanqui</span>
      </div>

      <div class="brand-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="#C7F36B" stroke-width="2"/>
          <path d="M8 12l3 3 5-5" stroke="#C7F36B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Plataforma de empleo inteligente</span>
      </div>

      <div class="brand-copy">
        <h2 class="brand-title">
          Tu próximo<br>gran empleo<br>
          <span class="brand-title-accent">te espera</span>
        </h2>
        <p class="brand-note">
          Únete a miles de profesionales que encontraron su oportunidad ideal con Llanqui.
        </p>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-icon metric-icon--blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="18" height="13" rx="2" stroke="#7EA2FF" stroke-width="1.8"/>
              <path d="M8 7V5a4 4 0 018 0v2" stroke="#7EA2FF" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="metric-number">12K+</span>
          <span class="metric-label">Oportunidades verificadas</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon metric-icon--lime" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="9" width="20" height="12" rx="2" stroke="#C7F36B" stroke-width="1.8"/>
              <path d="M16 9V7a4 4 0 00-8 0v2" stroke="#C7F36B" stroke-width="1.8"/>
            </svg>
          </span>
          <span class="metric-number">2.5K+</span>
          <span class="metric-label">Empresas activas</span>
        </div>
        <div class="metric-card">
          <span class="metric-icon metric-icon--blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="4" stroke="#7EA2FF" stroke-width="1.8"/>
              <circle cx="17" cy="9" r="3" stroke="#7EA2FF" stroke-width="1.8"/>
              <path d="M2 21c0-4 3.13-7 7-7" stroke="#7EA2FF" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M14 21c0-2.76 1.79-5 4-5s4 2.24 4 5" stroke="#7EA2FF" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="metric-number">35K+</span>
          <span class="metric-label">Talentos conectados</span>
        </div>
      </div>

      <div class="security-card">
        <span class="security-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(199,243,107,0.15)" stroke="#C7F36B" stroke-width="1.8"/>
            <path d="M9 12l2 2 4-4" stroke="#C7F36B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="security-copy">
          <span class="security-title">Entorno seguro y confiable</span>
          <p class="security-text">Verificamos cada empresa y oportunidad para que postules con tranquilidad.</p>
        </div>
      </div>
    </aside>

    <!-- ── Light Form Panel ── -->
    <section class="form-panel">
      <div class="form-inner">
        <span class="form-eyebrow">CREA TU CUENTA</span>

        <header class="form-head">
          <h1 class="welcome">{{ $t('auth.signUpCardTitle') }}</h1>
          <p class="welcome-sub">Comienza a conectar tu talento con oportunidades verificadas.</p>
        </header>

        <!-- Error -->
        <div v-if="serverError" class="alert" role="alert">{{ serverError }}</div>

        <form @submit.prevent="onSignUp" class="auth-form" novalidate>
          <!-- Email -->
          <div class="field">
            <label for="su-email">{{ $t('auth.email') }}</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="#98A3B9" stroke-width="1.8"/>
                  <path d="M2 8l10 6 10-6" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <input
                id="su-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="nombre@empresa.com"
                class="has-icon-left"
                :class="{ 'is-valid': email && isEmailValid, 'is-error': email && !isEmailValid }"
              />
            </div>
            <small v-if="email && !isEmailValid" class="field-error">Ingresa un correo válido</small>
          </div>

          <!-- Password -->
          <div class="field">
            <label for="su-password">{{ $t('auth.password') }}</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="#98A3B9" stroke-width="1.8"/>
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <input
                id="su-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Mínimo 8 caracteres"
                class="has-icon-left has-icon-right"
                :class="{ 'is-valid': password && isPasswordValid, 'is-error': password && !isPasswordValid }"
              />
              <button type="button" class="eye-toggle" :aria-label="showPassword ? 'Ocultar' : 'Mostrar'" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#98A3B9" stroke-width="1.8"/>
                  <circle cx="12" cy="12" r="3" stroke="#98A3B9" stroke-width="1.8"/>
                </svg>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div v-if="password" class="password-requirements">
              <span class="req" :class="{ 'req-met': password.length >= 8 }">8+ caracteres</span>
              <span class="req" :class="{ 'req-met': /[A-Z]/.test(password) }">1 mayúscula</span>
              <span class="req" :class="{ 'req-met': /[a-z]/.test(password) }">1 minúscula</span>
              <span class="req" :class="{ 'req-met': /[0-9]/.test(password) }">1 número</span>
              <span class="req" :class="{ 'req-met': /[^a-zA-Z0-9]/.test(password) }">1 símbolo</span>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="field">
            <label for="su-confirm">{{ $t('auth.confirmPassword') }}</label>
            <div class="input-wrapper">
              <span class="input-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="#98A3B9" stroke-width="1.8"/>
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </span>
              <input
                id="su-confirm"
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Repite tu contraseña"
                class="has-icon-left has-icon-right"
                :class="{ 'is-valid': confirmPassword && doPasswordsMatch && password, 'is-error': confirmPassword && !doPasswordsMatch }"
              />
              <button type="button" class="eye-toggle" :aria-label="showConfirm ? 'Ocultar' : 'Mostrar'" @click="showConfirm = !showConfirm">
                <svg v-if="!showConfirm" width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#98A3B9" stroke-width="1.8"/>
                  <circle cx="12" cy="12" r="3" stroke="#98A3B9" stroke-width="1.8"/>
                </svg>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="#98A3B9" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <small v-if="confirmPassword && !doPasswordsMatch" class="field-error">Las contraseñas no coinciden</small>
          </div>

          <!-- Role -->
          <div class="field">
            <label>{{ $t('auth.roleQuestion') }}</label>
            <div class="role-buttons">
              <button type="button" class="role-btn" :class="{ selected: role === 'employee' }" @click="selectRole('employee')">
                <strong>{{ $t('auth.roleEmployee') }}</strong>
              </button>
              <button type="button" class="role-btn" :class="{ selected: role === 'organization' }" @click="selectRole('organization')">
                <strong>{{ $t('auth.roleOrganization') }}</strong>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn-primary" :disabled="!isFormValid || loading">
            <span v-if="!loading">{{ $t('auth.createAccount') }}</span>
            <span v-else class="loading-spinner">
              <span class="spinner"></span>
              {{ $t('common.loading') }}
            </span>
          </button>

          <!-- Divider -->
          <div class="divider"><span>o</span></div>

          <!-- Google -->
          <GoogleLoginComponent
            :user-type="role ?? undefined"
            mode="signup"
            :prepare-redirect="beforeGoogleSignUp"
            label-key="auth.signUpWithGoogle"
          />
        </form>

        <!-- Login link -->
        <p class="foot-note">
          {{ $t('auth.alreadyOnRecord') }}&nbsp;
          <button type="button" class="link-btn" @click="goToSignIn">{{ $t('auth.login') }}</button>
        </p>

        <!-- Trust -->
        <div class="trust-strip">
          <span class="trust-divider" aria-hidden="true"></span>
          <ul class="trust-list">
            <li class="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#91D51B" stroke-width="2"/>
                <path d="M9 12l2 2 4-4" stroke="#91D51B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Verificación de empresas
            </li>
            <li class="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#91D51B" stroke-width="2"/>
                <path d="M8 11V7a4 4 0 018 0v4" stroke="#91D51B" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Cifrado de datos
            </li>
            <li class="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="9" cy="7" r="4" stroke="#91D51B" stroke-width="2"/>
                <circle cx="17" cy="9" r="3" stroke="#91D51B" stroke-width="2"/>
                <path d="M2 21c0-4 3.13-7 7-7" stroke="#91D51B" stroke-width="2" stroke-linecap="round"/>
                <path d="M14 21c0-2.76 1.79-5 4-5s4 2.24 4 5" stroke="#91D51B" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Privacidad garantizada
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ─── Card shell ────────────────────────────────────────────── */
.auth-card {
  position: relative;
  z-index: 1;
  width: min(1160px, 86vw);
  min-height: 700px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 24px;
  border: 1px solid rgba(120, 160, 255, 0.26);
  box-shadow:
    0 45px 110px -15px rgba(0, 0, 0, 0.85),
    0 25px 55px -10px rgba(0, 0, 0, 0.70),
    0 0 75px 5px rgba(37, 75, 255, 0.32),
    0 20px 45px -5px rgba(29, 78, 216, 0.38),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

/* ─── Dark brand panel ──────────────────────────────────────── */
.brand-panel {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 48px 44px;
  color: #fff;
  background:
    radial-gradient(circle at 15% 10%, rgba(63, 82, 255, 0.32), transparent 38%),
    linear-gradient(145deg, #13268A 0%, #0E205E 38%, #071839 100%);
}

.brand-panel :where(span, h2, p, div) { color: #fff; }

.dot-matrix {
  position: absolute;
  inset: 0 0 0 55%;
  background-image: radial-gradient(rgba(102, 129, 255, 0.17) 1px, transparent 1px);
  background-size: 14px 14px;
  pointer-events: none;
  z-index: 0;
}

.inner-glow {
  position: absolute;
  right: -80px;
  bottom: 40px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 85, 255, 0.22) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
}

.brand-head,
.brand-badge,
.brand-copy,
.metrics-grid,
.security-card {
  position: relative;
  z-index: 1;
}

.brand-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
  flex-shrink: 0;
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #fff;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  padding: 6px 12px;
  border: 1px solid rgba(199, 243, 107, 0.55);
  background: rgba(199, 243, 107, 0.05);
  border-radius: 999px;
}

.brand-badge span {
  font-size: 12px;
  font-weight: 600;
  color: #C7F36B;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand-title {
  font-size: clamp(28px, 2.6vw, 44px);
  font-weight: 750;
  line-height: 1.08;
  letter-spacing: -0.025em;
  margin: 0;
  color: #fff;
  text-wrap: balance;
}

.brand-title-accent { color: #C7F36B; font-weight: 750; }

.brand-note {
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: rgba(232, 239, 255, 0.76);
  max-width: 400px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.metric-card {
  background: rgba(12, 30, 69, 0.48);
  border: 1px solid rgba(107, 132, 196, 0.32);
  backdrop-filter: blur(8px);
  border-radius: 14px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.metric-icon--blue { background: rgba(79, 100, 255, 0.15); }
.metric-icon--lime { background: rgba(199, 243, 107, 0.1); }

.metric-number {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1;
}

.metric-label {
  font-size: 12px;
  color: rgba(228, 235, 255, 0.72);
  line-height: 1.3;
}

.security-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: rgba(13, 32, 72, 0.55);
  border: 1px solid rgba(99, 126, 197, 0.32);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 0 30px rgba(199, 243, 107, 0.06);
}

.security-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(199, 243, 107, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(199, 243, 107, 0.2);
}

.security-copy { display: flex; flex-direction: column; gap: 5px; }
.security-title { font-size: 14px; font-weight: 700; color: #fff; }

.security-text {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(228, 235, 255, 0.72);
  margin: 0;
}

/* ─── Light Form Panel ──────────────────────────────────────── */
.form-panel {
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 52px;
  overflow-y: auto;
  color-scheme: light;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 2;
  color: #98A3B9;
}

.input-wrapper input {
  width: 100%;
  height: 48px;
  border: 1.5px solid #D6DDEA;
  border-radius: 10px;
  font-family: var(--font-family);
  font-size: 14px;
  background: #FFFFFF !important;
  background-color: #FFFFFF !important;
  color: #17213A !important;
  color-scheme: light !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  box-sizing: border-box;
  padding: 0 16px;
}

.input-wrapper input.has-icon-left {
  padding-left: 46px !important;
}

.input-wrapper input.has-icon-right {
  padding-right: 46px !important;
}

.input-wrapper input.has-icon-left.has-icon-right {
  padding-left: 46px !important;
  padding-right: 46px !important;
}

.input-wrapper input::placeholder {
  color: #98A3B9;
  opacity: 1;
}

.input-wrapper input:focus,
.input-wrapper input:active {
  outline: none !important;
  border-color: #2563EB !important;
  background: #FFFFFF !important;
  background-color: #FFFFFF !important;
  color: #17213A !important;
  box-shadow: 0 0 0 3.5px rgba(37, 99, 235, 0.12) !important;
}

/* Evitar que autofill del navegador oscurezca el input */
.input-wrapper input:-webkit-autofill,
.input-wrapper input:-webkit-autofill:hover,
.input-wrapper input:-webkit-autofill:focus,
.input-wrapper input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
  -webkit-text-fill-color: #17213A !important;
  box-shadow: 0 0 0 1000px #FFFFFF inset !important;
  caret-color: #17213A !important;
  transition: background-color 5000s ease-in-out 0s;
}

.input-wrapper input.is-valid { border-color: #3B9C20; }
.input-wrapper input.is-error { border-color: #D0420E; }

.field-error {
  font-family: var(--font-family);
  font-size: 12px;
  color: #D0420E;
}

.eye-toggle {
  position: absolute;
  right: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #98A3B9;
  border-radius: 6px;
  transition: color 0.15s ease, background-color 0.15s ease;
  z-index: 2;
}

.eye-toggle:hover {
  color: #65708A;
  background-color: rgba(0, 0, 0, 0.04);
}

.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.req {
  font-family: var(--font-family);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  background: #EEF1F6;
  color: #77829A;
}

.req-met {
  background: rgba(48, 70, 232, 0.08);
  color: #3046E8;
}

.role-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.role-btn {
  padding: 12px;
  border: 1px solid #D6DDEA;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 13px;
  color: #65708A;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  text-align: center;
}

.role-btn:hover {
  border-color: #3046E8;
  background: rgba(48, 70, 232, 0.04);
}

.role-btn.selected {
  border-color: #3046E8;
  background: #3046E8;
  color: #fff;
}

.role-btn strong { font-weight: 600; color: inherit; }

.btn-primary {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #2441E8 0%, #263EF0 50%, #304AF4 100%);
  color: #fff;
  font-family: var(--font-family);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 22px rgba(38, 63, 232, 0.18);
  transition: transform 0.18s, box-shadow 0.18s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 11px 28px rgba(38, 63, 232, 0.24);
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.loading-spinner { display: flex; align-items: center; gap: 8px; }

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7C879E;
  font-family: var(--font-family);
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #E5EAF4;
}

.foot-note {
  font-family: var(--font-family);
  font-size: 14px;
  color: #69748C;
  margin: 0;
  text-align: center;
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: #2447EB;
  font-family: var(--font-family);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.link-btn:hover { text-decoration: underline; }

.trust-strip {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trust-divider {
  display: block;
  height: 1px;
  background: #E5EAF4;
}

.trust-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-family);
  font-size: 11px;
  color: #6C778E;
}

/* ─── Tablet ─── */
@media (max-width: 1100px) and (min-width: 769px) {
  .auth-card {
    grid-template-columns: 45% 55%;
    width: min(980px, 92vw);
  }
  .brand-panel { padding: 32px 28px; gap: 16px; }
  .brand-title { font-size: clamp(22px, 3vw, 34px); }
  .metric-number { font-size: 18px; }
  .metric-card { padding: 14px 10px; }
  .form-panel { padding: 36px 32px; }
  .welcome { font-size: 28px; }
}

/* ─── Mobile ─── */
@media (max-width: 768px) {
  .auth-card {
    grid-template-columns: 1fr;
    width: calc(100% - 32px);
    max-width: 460px;
    min-height: unset;
    border-radius: 20px;
  }
  .brand-panel {
    padding: 28px 24px 20px;
    gap: 12px;
  }
  .brand-title { font-size: 26px; }
  .brand-note, .metrics-grid, .security-card { display: none; }
  .form-panel { padding: 32px 24px 40px; }
  .welcome { font-size: 28px; }
  .role-buttons { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .btn-primary, .spinner { transition: none; animation: none; }
}
</style>
