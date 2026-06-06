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
  <div class="sign-up-container">
    <header class="sign-up-header">
      <div class="brand-block">
        <h1 class="brand-title">{{ $t('auth.brandName') }}</h1>
        <p class="brand-sub">{{ $t('auth.signUpPageSubtitle') }}</p>
      </div>
    </header>

    <main class="sign-up-card">
      <div class="card-header">
        <h2 class="card-title">Crea tu cuenta</h2>
        <p class="card-subtitle">Completa los datos para comenzar</p>
      </div>

      <form @submit.prevent="onSignUp" class="sign-up-form">
        <!-- Error Messages -->
        <transition name="fade" v-if="serverError || !areAllFieldsFilled || !doPasswordsMatch || !isPasswordValid">
          <div v-if="serverError" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            <span>{{ serverError }}</span>
          </div>
          <div v-else-if="!areAllFieldsFilled" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            <span>Por favor, completa todos los campos requeridos</span>
          </div>
          <div v-else-if="!doPasswordsMatch" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            <span>Las contraseñas no coinciden</span>
          </div>
          <div v-else-if="!isPasswordValid" class="alert alert-error">
            <span class="alert-icon">⚠️</span>
            <span>Usa al menos 8 caracteres, 1 mayúscula y 1 número</span>
          </div>
        </transition>

        <!-- Email Field -->
        <div class="form-group">
          <div class="label-wrapper">
            <label for="email">📧 Correo electrónico</label>
            <span v-if="email && isEmailValid" class="check-icon">✓</span>
          </div>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="nombre@empresa.com"
            class="form-input"
            :class="{ 
              'is-valid': email && isEmailValid,
              'is-error': email && !isEmailValid 
            }"
          />
          <small v-if="email && !isEmailValid" class="field-error">
            ✗ Ingresa un correo válido
          </small>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <div class="label-wrapper">
            <label for="password">🔒 Contraseña</label>
            <span v-if="password && isPasswordValid" class="check-icon">✓</span>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
            class="form-input"
            :class="{ 
              'is-valid': password && isPasswordValid,
              'is-error': password && !isPasswordValid 
            }"
          />
          <!-- Password Requirements -->
          <div v-if="password" class="password-requirements">
            <div class="req" :class="{ 'req-met': password.length >= 8 }">
              <span>{{ password.length >= 8 ? '✓' : '○' }}</span> 8+ caracteres
            </div>
            <div class="req" :class="{ 'req-met': /[A-Z]/.test(password) }">
              <span>{{ /[A-Z]/.test(password) ? '✓' : '○' }}</span> Una mayúscula
            </div>
            <div class="req" :class="{ 'req-met': /[0-9]/.test(password) }">
              <span>{{ /[0-9]/.test(password) ? '✓' : '○' }}</span> Un número
            </div>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <div class="label-wrapper">
            <label for="confirmPassword">🔒 Confirmar contraseña</label>
            <span v-if="confirmPassword && doPasswordsMatch && password" class="check-icon">✓</span>
          </div>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Repite tu contraseña"
            class="form-input"
            :class="{ 
              'is-valid': confirmPassword && doPasswordsMatch && password,
              'is-error': confirmPassword && !doPasswordsMatch
            }"
          />
          <small v-if="confirmPassword && !doPasswordsMatch" class="field-error">
            ✗ Las contraseñas no coinciden
          </small>
        </div>

        <!-- Role Selection -->
        <div class="role-section">
          <p class="role-question">👤 ¿Qué tipo de cuenta necesitas?</p>
          <div class="role-buttons">
            <button
              type="button"
              class="role-btn"
              :class="{ selected: role === 'employee' }"
              @click="selectRole('employee')"
            >
              <span class="role-icon">💼</span>
              <span class="role-text">
                <strong>Profesional</strong>
                <small>Empleado o Freelancer</small>
              </span>
            </button>
            <button
              type="button"
              class="role-btn"
              :class="{ selected: role === 'organization' }"
              @click="selectRole('organization')"
            >
              <span class="role-icon">🏢</span>
              <span class="role-text">
                <strong>Empresa</strong>
                <small>Organización u Negocio</small>
              </span>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-submit"
          :disabled="!isFormValid || loading"
        >
          <span v-if="!loading">✓ Crear cuenta</span>
          <span v-else class="loading-spinner">
            <span class="spinner"></span> Creando cuenta...
          </span>
        </button>

        <!-- Divider -->
        <div class="divider">
          <span>o</span>
        </div>

        <!-- Google Sign Up -->
        <GoogleLoginComponent
          :user-type="role ?? undefined"
          mode="signup"
          :prepare-redirect="beforeGoogleSignUp"
          label-key="auth.signUpWithGoogle"
        />
      </form>

      <!-- Footer -->
      <footer class="sign-up-footer">
        <p class="footer-text">¿Ya tienes cuenta?</p>
        <button type="button" class="btn-sign-in" @click="goToSignIn">
          Inicia sesión aquí
        </button>
      </footer>
    </main>
  </div>
</template>

<style scoped>
/* Container & Layout */
.sign-up-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(30, 61, 173, 0.03) 0%, rgba(30, 61, 173, 0.08) 100%);
}

.sign-up-header {
  text-align: center;
  animation: slideDown 0.6s ease-out;
}

.brand-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.brand-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--main-color-dark);
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--main-color) 0%, var(--main-color-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-sub {
  margin: 0;
  font-size: 1.025rem;
  color: var(--text-color-medium);
  font-weight: 500;
}

/* Card */
.sign-up-card {
  background: var(--background-color-default);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 12px 48px rgba(18, 41, 116, 0.12);
  border: 1px solid rgba(30, 61, 173, 0.1);
  animation: fadeIn 0.6s ease-out 0.1s both;
  backdrop-filter: blur(10px);
}

.card-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.card-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color-default);
  margin: 0 0 0.5rem;
}

.card-subtitle {
  font-size: 0.95rem;
  color: var(--text-color-medium);
  margin: 0;
}

/* Form */
.sign-up-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Alerts */
.alert {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  animation: slideIn 0.3s ease-out;
  border-left: 4px solid;
}

.alert-error {
  background: rgba(220, 53, 69, 0.1);
  border-left-color: var(--red-color);
  color: var(--red-color);
}

.alert-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.label-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-color-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.check-icon {
  color: #10b981;
  font-size: 1.1rem;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 2px solid var(--gray-02);
  border-radius: 12px;
  font-size: 0.95rem;
  background: var(--background-color-default);
  color: var(--text-color-default);
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input::placeholder {
  color: var(--text-color-medium);
  opacity: 0.7;
}

.form-input:focus {
  outline: none;
  border-color: var(--main-color);
  box-shadow: 0 0 0 4px rgba(30, 61, 173, 0.15);
}

.form-input.is-valid {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.03);
}

.form-input.is-error {
  border-color: var(--red-color);
  background: rgba(220, 53, 69, 0.03);
}

.field-error {
  color: var(--red-color);
  font-size: 0.8rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Password Requirements */
.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(30, 61, 173, 0.04);
  border-radius: 8px;
  font-size: 0.8rem;
}

.req {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-medium);
  transition: color 0.2s ease;
}

.req span {
  font-weight: 600;
  min-width: 1.2rem;
}

.req-met {
  color: #10b981;
  font-weight: 600;
}

/* Role Section */
.role-section {
  margin: 1rem 0;
  padding: 1.5rem;
  background: rgba(30, 61, 173, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(30, 61, 173, 0.1);
}

.role-question {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-dark);
  margin: 0 0 1.25rem;
  text-align: center;
}

.role-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-btn {
  padding: 1.25rem 1rem;
  border: 2px solid var(--gray-02);
  border-radius: 12px;
  background: var(--background-color-default);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-color-dark);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}

.role-icon {
  font-size: 1.8rem;
}

.role-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.role-text strong {
  font-weight: 600;
  color: var(--text-color-dark);
}

.role-text small {
  font-size: 0.75rem;
  color: var(--text-color-medium);
}

.role-btn:hover {
  border-color: var(--main-color);
  background: rgba(30, 61, 173, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(30, 61, 173, 0.12);
}

.role-btn.selected {
  border-color: var(--main-color);
  background: var(--main-color);
  color: white;
}

.role-btn.selected strong {
  color: white;
}

.role-btn.selected small {
  color: rgba(255, 255, 255, 0.9);
}

.role-btn.selected:hover {
  background: var(--main-color-dark);
  border-color: var(--main-color-dark);
}

/* Submit Button */
.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--main-color) 0%, var(--main-color-dark) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  box-shadow: 0 4px 15px rgba(30, 61, 173, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 61, 173, 0.4);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 0.5rem 0;
}

.divider span {
  display: inline-block;
  padding: 0 1rem;
  color: var(--text-color-medium);
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--background-color-default);
  position: relative;
  z-index: 1;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gray-02);
  z-index: 0;
}

/* Footer */
.sign-up-footer {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-02);
}

.footer-text {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: var(--text-color-medium);
}

.btn-sign-in {
  background: none;
  border: none;
  color: var(--main-color);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0;
  transition: all 0.2s ease;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}

.btn-sign-in:hover {
  color: var(--main-color-dark);
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .sign-up-container {
    padding: 1rem;
    gap: 1.5rem;
  }

  .brand-title {
    font-size: 1.85rem;
  }

  .sign-up-card {
    padding: 1.75rem 1.25rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .role-buttons {
    grid-template-columns: 1fr;
  }

  .role-btn {
    padding: 1rem 0.75rem;
  }

  .form-group {
    gap: 0.4rem;
  }

  .form-input {
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: 1.5rem;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .sign-up-card {
    padding: 1.5rem 1rem;
  }

  .card-subtitle {
    font-size: 0.85rem;
  }

  .form-group label {
    font-size: 0.85rem;
  }

  .password-requirements {
    font-size: 0.75rem;
  }

  .role-section {
    padding: 1rem;
  }

  .role-question {
    font-size: 0.9rem;
  }
}
</style>
