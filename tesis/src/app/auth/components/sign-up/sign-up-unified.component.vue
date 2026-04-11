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
    beforeGoogleFromSignUp,
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
      <h2 class="card-title">Crea tu cuenta</h2>

      <form @submit.prevent="onSignUp" class="sign-up-form">
        <div v-if="!areAllFieldsFilled" class="error-message">
          Por favor, completa todos los campos
        </div>
        <div v-if="!doPasswordsMatch" class="error-message">
          Las contraseñas no coinciden
        </div>
        <div v-if="!isPasswordValid" class="error-message">
          La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número
        </div>
        <div v-if="serverError" class="error-message">
          {{ serverError }}
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="tu@email.com"
            class="form-input"
            :class="{ error: email && !isEmailValid }"
          />
          <small v-if="email && !isEmailValid" class="field-error">
            Por favor, ingresa un correo válido
          </small>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            class="form-input"
            :class="{ error: password && !isPasswordValid }"
          />
          <small v-if="password && !isPasswordValid" class="field-error">
            Mínimo 8 caracteres, 1 mayúscula, 1 número
          </small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="form-input"
            :class="{ error: confirmPassword && password !== confirmPassword }"
          />
          <small v-if="confirmPassword && password !== confirmPassword" class="field-error">
            Las contraseñas no coinciden
          </small>
        </div>

        <div class="role-section">
          <p class="role-question">¿Eres?</p>
          <div class="role-buttons">
            <button
              type="button"
              class="role-btn"
              :class="{ selected: role === 'employee' }"
              @click="selectRole('employee')"
            >
              Un Empleado / Profesional
            </button>
            <button
              type="button"
              class="role-btn"
              :class="{ selected: role === 'organization' }"
              @click="selectRole('organization')"
            >
              Una Organización
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="!isFormValid || loading"
        >
          {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>

        <div class="google-section">
          <GoogleLoginComponent
            :user-type="role ?? undefined"
            :prepare-redirect="beforeGoogleFromSignUp"
          />
        </div>
      </form>

      <footer class="sign-up-footer">
        <div class="already-account">
          <p>¿Ya tienes cuenta?</p>
          <button type="button" class="btn-sign-in" @click="goToSignIn">
            Inicia sesión
          </button>
        </div>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.sign-up-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sign-up-header {
  text-align: center;
}

.brand-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.brand-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--main-color-dark);
  margin: 0;
  letter-spacing: -0.02em;
}

.brand-sub {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color-medium);
}

.sign-up-card {
  background: var(--background-color-default);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(18, 41, 116, 0.08);
  border: 1px solid var(--gray-02);
}

.card-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color-default);
  margin: 0 0 2rem;
  text-align: center;
}

.sign-up-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-dark);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-02);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--background-color-default);
  color: var(--text-color-default);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--main-color);
  box-shadow: 0 0 0 3px rgba(30, 61, 173, 0.12);
}

.form-input.error {
  border-color: var(--red-color);
}

.field-error {
  color: var(--red-color);
  font-size: 0.75rem;
  margin: 0;
}

.error-message {
  padding: 1rem;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid var(--red-color);
  border-radius: 8px;
  color: var(--red-color);
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}

.role-section {
  margin: 1.5rem 0;
}

.role-question {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color-dark);
  margin: 0 0 1rem;
  text-align: center;
}

.role-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.role-btn {
  padding: 1rem;
  border: 2px solid var(--gray-02);
  border-radius: 8px;
  background: var(--background-color-default);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color-dark);
  transition: all 0.3s ease;
  text-align: center;
}

.role-btn:hover {
  border-color: var(--main-color);
  background: rgba(30, 61, 173, 0.05);
}

.role-btn.selected {
  border-color: var(--main-color);
  background: var(--main-color);
  color: white;
}

.role-btn.selected:hover {
  background: var(--main-color-dark);
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: var(--main-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
  background: var(--main-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(30, 61, 173, 0.2);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.google-section {
  margin: 1.5rem 0;
}

.sign-up-footer {
  margin-top: 2rem;
  text-align: center;
}

.already-account {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.already-account p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-medium);
}

.btn-sign-in {
  background: none;
  border: none;
  color: var(--main-color);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: underline;
  padding: 0;
}

.btn-sign-in:hover {
  color: var(--main-color-dark);
}

@media (max-width: 640px) {
  .sign-up-container {
    padding: 1rem;
  }

  .brand-title {
    font-size: 1.75rem;
  }

  .sign-up-card {
    padding: 1.5rem;
  }

  .role-buttons {
    grid-template-columns: 1fr;
  }

  .role-btn {
    padding: 0.75rem;
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
    padding: 1rem;
  }
}
</style>
