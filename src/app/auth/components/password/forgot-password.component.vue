<script setup lang="ts">
import { useForgotPassword } from '@/app/auth/composables/useForgotPassword';

const { step, email, code, newPassword, confirmPassword, loading, serverError, requestCode, verifyCode, submitNewPassword } = useForgotPassword();
</script>

<template>
    <div class="recovery-card">
        <header>
            <span class="eyebrow">Seguridad de cuenta</span>
            <h1>Recupera tu contraseña</h1>
            <p v-if="step === 'email'">Te enviaremos un código de verificación.</p>
            <p v-else-if="step === 'code'">Ingresa el código enviado a {{ email }}.</p>
            <p v-else-if="step === 'password'">Crea una contraseña nueva para tu cuenta.</p>
            <p v-else>Tu contraseña fue actualizada correctamente.</p>
        </header>

        <p v-if="serverError" class="message error" role="alert">{{ serverError }}</p>

        <form v-if="step === 'email'" @submit.prevent="requestCode">
            <label for="recovery-email">Correo electrónico</label>
            <input id="recovery-email" v-model.trim="email" type="email" autocomplete="email" required>
            <button type="submit" :disabled="loading">{{ loading ? 'Enviando…' : 'Enviar código' }}</button>
        </form>

        <form v-else-if="step === 'code'" @submit.prevent="verifyCode">
            <label for="recovery-code">Código de verificación</label>
            <input id="recovery-code" v-model.trim="code" type="text" inputmode="numeric" autocomplete="one-time-code" required>
            <button type="submit" :disabled="loading">{{ loading ? 'Verificando…' : 'Verificar código' }}</button>
        </form>

        <form v-else-if="step === 'password'" @submit.prevent="submitNewPassword">
            <label for="new-password">Nueva contraseña</label>
            <input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" required>
            <small>8 caracteres como mínimo, con mayúscula, minúscula y número.</small>
            <label for="confirm-password">Confirmar contraseña</label>
            <input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required>
            <button type="submit" :disabled="loading">{{ loading ? 'Actualizando…' : 'Cambiar contraseña' }}</button>
        </form>

        <RouterLink v-if="step === 'complete'" class="primary-link" to="/sign-in">Iniciar sesión</RouterLink>
        <RouterLink v-else class="back-link" to="/sign-in">Volver al inicio de sesión</RouterLink>
    </div>
</template>

<style scoped>
.recovery-card { width: min(100%, 480px); margin: auto; padding: 32px; border: 1px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface); box-shadow: var(--shadow-card); }
header { margin-bottom: 24px; }
.eyebrow { color: var(--color-primary); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
h1 { margin: 8px 0; color: var(--color-text-primary); font-size: 30px; }
p { margin: 0; color: var(--color-text-secondary); }
form { display: grid; gap: 10px; }
label { margin-top: 4px; color: var(--color-text-primary); font-weight: 600; }
input { min-height: 48px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: 12px; font: inherit; }
input:focus-visible { outline: 3px solid color-mix(in srgb, var(--color-primary) 24%, transparent); border-color: var(--color-primary); }
button, .primary-link { min-height: 46px; margin-top: 8px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 12px; background: var(--color-primary); color: white; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
button:disabled { opacity: .65; cursor: wait; }
small { color: var(--color-text-muted); }
.message { margin-bottom: 16px; padding: 12px; border-radius: 10px; }
.error { background: #fff1f2; color: #b42318; }
.back-link { display: block; margin-top: 20px; color: var(--color-primary); text-align: center; font-weight: 600; }
@media (max-width: 600px) { .recovery-card { padding: 24px 18px; border: 0; box-shadow: none; } }
</style>
