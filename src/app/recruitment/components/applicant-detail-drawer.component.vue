<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    X, MapPin, Mail, Phone, Briefcase, Check, Ban, UserCheck,
    MessageSquare, Send, FileText,
} from 'lucide-vue-next';
import {
    ApplicationStatus,
    APPLICATION_PIPELINE,
    APPLICATION_STATUS_LABEL,
} from '../enums/application-status.enum';
import type { ApplicationResponse } from '../model/application.response';
import { NotificationType } from '../model/notification.model';

const props = defineProps<{
    application: ApplicationResponse;
    actionPending?: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'approve', application: ApplicationResponse): void;
    (e: 'select', application: ApplicationResponse): void;
    (e: 'reject', application: ApplicationResponse): void;
    (e: 'message', application: ApplicationResponse): void;
    (e: 'notify', payload: { application: ApplicationResponse; type: NotificationType; title: string; message: string }): void;
}>();

const initials = computed(() => {
    const parts = props.application.applicant.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? (parts[1]?.[0] ?? '') : (parts[0]?.[1] ?? '');
    return (first + second).toUpperCase() || '?';
});

/** Pasos visibles del proceso (descartado se muestra aparte). */
const steps = computed(() =>
    APPLICATION_PIPELINE.filter((s) => s !== ApplicationStatus.Rejected),
);

function stepState(step: ApplicationStatus): 'done' | 'current' | 'todo' {
    const order = [ApplicationStatus.Applied, ApplicationStatus.Approved, ApplicationStatus.Selected];
    const current = order.indexOf(props.application.status);
    const idx = order.indexOf(step);
    if (props.application.status === ApplicationStatus.Rejected) return 'todo';
    if (idx < current) return 'done';
    if (idx === current) return 'current';
    return 'todo';
}

// ---- Notificación del proceso ----
const NOTIFY_OPTIONS: { type: NotificationType; label: string }[] = [
    { type: NotificationType.ApplicationAccepted, label: 'Postulación aprobada' },
    { type: NotificationType.CandidateSelected, label: 'Seleccionado para el puesto' },
    { type: NotificationType.ApplicationRejected, label: 'No continúa en el proceso' },
];

function defaultTypeFor(status: ApplicationStatus): NotificationType {
    if (status === ApplicationStatus.Selected) return NotificationType.CandidateSelected;
    if (status === ApplicationStatus.Rejected) return NotificationType.ApplicationRejected;
    return NotificationType.ApplicationAccepted;
}

/** 'auto' = mensaje según el tipo (como antes). 'custom' = redactar título + mensaje. */
const notifyMode = ref<'auto' | 'custom'>('auto');
const notifyType = ref<NotificationType>(defaultTypeFor(props.application.status));
const title = ref('');
const message = ref('');

/** Plantilla (título + mensaje) sugerida para cada tipo. Editable luego. */
function templateFor(type: NotificationType): { title: string; message: string } {
    const name = props.application.applicant.fullName.split(/\s+/)[0] || props.application.applicant.fullName;
    const job = props.application.jobTitle;
    switch (type) {
        case NotificationType.CandidateSelected:
            return {
                title: '¡Has sido seleccionado(a)!',
                message: `Hola ${name}, ¡felicitaciones! Has sido seleccionado(a) para el puesto de ${job}. Pronto te contactaremos con los siguientes pasos.`,
            };
        case NotificationType.ApplicationRejected:
            return {
                title: 'Resultado de tu postulación',
                message: `Hola ${name}, gracias por postular al puesto de ${job}. En esta ocasión continuamos con otros candidatos. Te deseamos mucho éxito.`,
            };
        default:
            return {
                title: 'Tu postulación avanzó',
                message: `Hola ${name}, tu postulación al puesto de ${job} fue aprobada y avanzas a la siguiente etapa. Te contactaremos para coordinar.`,
            };
    }
}

function applyTemplate(): void {
    const t = templateFor(notifyType.value);
    title.value = t.title;
    message.value = t.message;
}

// Al cambiar de postulante o estado: re-sugiere el tipo y rellena la plantilla.
watch(
    () => [props.application.id, props.application.status] as const,
    () => { notifyType.value = defaultTypeFor(props.application.status); applyTemplate(); },
    { immediate: true },
);

// Al cambiar el tipo manualmente: rellena título y mensaje sugeridos.
watch(notifyType, () => applyTemplate());

const hasPhone = computed(() => Boolean(props.application.applicant.phone));

/** Vista previa del modo automático (mensaje armado por tipo). */
const preview = computed(() => templateFor(notifyType.value));

const canSend = computed(() =>
    notifyMode.value === 'auto' ? true : message.value.trim().length > 0,
);

function emitNotify(): void {
    if (!canSend.value) return;
    const payload = notifyMode.value === 'auto'
        ? { title: preview.value.title, message: preview.value.message }
        : { title: title.value.trim(), message: message.value.trim() };
    emit('notify', {
        application: props.application,
        type: notifyType.value,
        ...payload,
    });
}
</script>

<template>
    <div class="drawer-root">
        <div class="scrim" @click="$emit('close')"></div>

        <aside class="drawer" role="dialog" aria-label="Detalle de la postulación">
            <header class="drawer-head">
                <h2 class="head-title">Seguimiento del postulante</h2>
                <button type="button" class="icon-btn" aria-label="Cerrar" @click="$emit('close')">
                    <X :size="20" :stroke-width="1.5" />
                </button>
            </header>

            <div class="drawer-body">
                <!-- Identidad -->
                <section class="who-block">
                    <img
                        v-if="application.applicant.pictureUrl"
                        :src="application.applicant.pictureUrl"
                        :alt="application.applicant.fullName"
                        class="avatar"
                    />
                    <span v-else class="avatar avatar--placeholder">{{ initials }}</span>
                    <div class="who-text">
                        <h3 class="who-name">{{ application.applicant.fullName }}</h3>
                        <p v-if="application.applicant.headline" class="who-headline">
                            <Briefcase :size="14" :stroke-width="1.5" />
                            <span>{{ application.applicant.headline }}</span>
                        </p>
                        <p class="who-job">Postuló a: <strong>{{ application.jobTitle }}</strong></p>
                    </div>
                </section>

                <!-- Contacto -->
                <ul class="contact-list">
                    <li v-if="application.applicant.location">
                        <MapPin :size="16" :stroke-width="1.5" />
                        <span>{{ application.applicant.location }}</span>
                    </li>
                    <li v-if="application.applicant.email">
                        <Mail :size="16" :stroke-width="1.5" />
                        <span>{{ application.applicant.email }}</span>
                    </li>
                    <li v-if="application.applicant.phone">
                        <Phone :size="16" :stroke-width="1.5" />
                        <span>{{ application.applicant.phone }}</span>
                    </li>
                </ul>

                <div v-if="application.message" class="message-quote">
                    <span class="quote-label">Mensaje del postulante</span>
                    <p>{{ application.message }}</p>
                </div>

                <a v-if="application.cvUrl" :href="application.cvUrl" target="_blank" rel="noopener" class="cv-link">
                    <FileText :size="16" :stroke-width="1.5" />
                    <span>Ver CV adjunto</span>
                </a>

                <!-- Timeline del proceso -->
                <section class="timeline-block">
                    <span class="block-label">Estado del proceso</span>
                    <div v-if="application.status === ApplicationStatus.Rejected" class="rejected-banner">
                        <Ban :size="16" :stroke-width="1.5" />
                        <span>Postulación descartada</span>
                    </div>
                    <ol v-else class="timeline">
                        <li v-for="step in steps" :key="step" class="t-step" :class="stepState(step)">
                            <span class="t-dot">
                                <Check v-if="stepState(step) === 'done'" :size="12" :stroke-width="2.5" />
                            </span>
                            <span class="t-label">{{ APPLICATION_STATUS_LABEL[step] }}</span>
                        </li>
                    </ol>
                </section>

                <!-- Decisiones -->
                <section class="actions-block">
                    <span class="block-label">Decisión</span>
                    <div class="decision-grid">
                        <button
                            type="button" class="btn-decision approve"
                            :disabled="actionPending || application.status === ApplicationStatus.Approved"
                            @click="$emit('approve', application)"
                        >
                            <Check :size="16" :stroke-width="1.5" />
                            <span>Aprobar</span>
                        </button>
                        <button
                            type="button" class="btn-decision select"
                            :disabled="actionPending || application.status === ApplicationStatus.Selected"
                            @click="$emit('select', application)"
                        >
                            <UserCheck :size="16" :stroke-width="1.5" />
                            <span>Seleccionar</span>
                        </button>
                        <button
                            type="button" class="btn-decision reject"
                            :disabled="actionPending || application.status === ApplicationStatus.Rejected"
                            @click="$emit('reject', application)"
                        >
                            <Ban :size="16" :stroke-width="1.5" />
                            <span>Descartar</span>
                        </button>
                    </div>
                    <p class="auto-note">Aprobar, seleccionar o descartar envía una notificación de WhatsApp automática al postulante.</p>
                    <button type="button" class="btn-message" @click="$emit('message', application)">
                        <MessageSquare :size="16" :stroke-width="1.5" />
                        <span>Abrir chat con el postulante</span>
                    </button>
                </section>

                <!-- Notificación manual -->
                <section class="notify-block">
                    <span class="block-label">Reenviar notificación del proceso</span>
                    <p class="notify-hint">Envía manualmente un aviso por WhatsApp y a la app. El sistema arma el mensaje según el tipo.</p>

                    <label class="field">
                        <span class="field-label">Tipo de notificación</span>
                        <select v-model="notifyType" class="field-input">
                            <option v-for="opt in NOTIFY_OPTIONS" :key="opt.type" :value="opt.type">{{ opt.label }}</option>
                        </select>
                    </label>

                    <div class="mode-toggle" role="tablist">
                        <button
                            type="button" class="mode-btn" :class="{ on: notifyMode === 'auto' }"
                            role="tab" :aria-selected="notifyMode === 'auto'"
                            @click="notifyMode = 'auto'"
                        >Automático</button>
                        <button
                            type="button" class="mode-btn" :class="{ on: notifyMode === 'custom' }"
                            role="tab" :aria-selected="notifyMode === 'custom'"
                            @click="notifyMode = 'custom'"
                        >Redactar</button>
                    </div>

                    <!-- Modo automático: mensaje según el tipo -->
                    <div v-if="notifyMode === 'auto'" class="preview-box">
                        <span class="preview-label">{{ preview.title }}</span>
                        <p>{{ preview.message }}</p>
                    </div>

                    <!-- Modo redactar: título + mensaje editables -->
                    <template v-else>
                        <label class="field">
                            <span class="field-label">Título</span>
                            <input v-model="title" type="text" class="field-input" maxlength="80" placeholder="Ej: Resultado de tu postulación" />
                        </label>
                        <label class="field">
                            <span class="field-label">Mensaje</span>
                            <textarea v-model="message" class="field-input" rows="4" maxlength="600" placeholder="Escribe el mensaje para el postulante"></textarea>
                        </label>
                    </template>

                    <p v-if="!hasPhone" class="no-phone-warn">
                        Sin número registrado: solo se enviará la notificación dentro de la app.
                    </p>

                    <button type="button" class="btn-send" :disabled="!canSend || actionPending" @click="emitNotify">
                        <Send :size="16" :stroke-width="1.5" />
                        <span>{{ actionPending ? 'Enviando…' : 'Enviar notificación' }}</span>
                    </button>
                </section>
            </div>
        </aside>
    </div>
</template>

<style scoped>
.drawer-root {
    position: fixed;
    inset: 0;
    z-index: 200;
}

.scrim {
    position: absolute;
    inset: 0;
    background: rgba(15, 15, 26, 0.4);
}

.drawer {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 100%;
    max-width: 440px;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.15s ease;
}

@keyframes slideIn {
    from { transform: translateX(16px); opacity: 0.6; }
    to { transform: translateX(0); opacity: 1; }
}

.drawer-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
}

.head-title {
    margin: 0;
    font-size: var(--fs-body);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid transparent;
    border-radius: var(--radius-button);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: var(--transition);
}

.icon-btn:hover {
    background: var(--color-bg);
    color: var(--color-text-primary);
}

.drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

/* Identidad */
.who-block {
    display: flex;
    gap: var(--space-2);
    align-items: center;
}

.avatar,
.avatar--placeholder {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.avatar--placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: #fff;
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
}

.who-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.who-name {
    margin: 0;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.who-headline {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
}

.who-job {
    margin: 2px 0 0;
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
}

.who-job strong {
    color: var(--color-accent);
    font-weight: var(--fw-semibold);
}

/* Contacto */
.contact-list {
    list-style: none;
    margin: 0;
    padding: var(--space-2);
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
}

.contact-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
}

.contact-list li svg {
    color: var(--color-text-muted);
    flex-shrink: 0;
}

/* Mensaje del postulante */
.message-quote {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: var(--space-2);
    background: var(--color-ai-bg);
    border: 1px solid var(--color-ai-outline);
    border-left: 3px solid var(--color-ai-border);
    border-radius: var(--radius-card);
}

.quote-label {
    font-size: 11px;
    font-weight: var(--fw-bold);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-ai-label);
}

.message-quote p {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
}

.cv-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 8px 14px;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-accent);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-button);
    text-decoration: none;
    transition: var(--transition);
}

.cv-link:hover {
    border-color: var(--color-accent);
    background: var(--color-ai-bg);
}

/* Bloques */
.block-label {
    display: block;
    font-size: var(--fs-caption);
    font-weight: var(--fw-bold);
    color: var(--color-text-secondary);
    margin-bottom: 10px;
}

/* Timeline */
.timeline {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.t-step {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    padding: 6px 0;
}

.t-step:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 11px;
    top: 26px;
    bottom: -6px;
    width: 2px;
    background: var(--color-border);
}

.t-step.done:not(:last-child)::after {
    background: var(--color-state-success);
}

.t-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    color: #fff;
    flex-shrink: 0;
    z-index: 1;
}

.t-step.done .t-dot {
    background: var(--color-state-success);
    border-color: var(--color-state-success);
}

.t-step.current .t-dot {
    background: var(--color-accent);
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(45, 58, 199, 0.15);
}

.t-label {
    font-size: var(--fs-body-sm);
    color: var(--color-text-muted);
}

.t-step.done .t-label,
.t-step.current .t-label {
    color: var(--color-text-primary);
    font-weight: var(--fw-semibold);
}

.rejected-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--color-state-error-dark);
    background: rgba(210, 38, 38, 0.06);
    border: 1px solid rgba(210, 38, 38, 0.15);
    border-radius: var(--radius-card);
}

/* Decisiones */
.decision-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
}

.btn-decision {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 6px;
    border-radius: var(--radius-button);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    font-family: var(--font-family);
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.btn-decision:hover:not(:disabled) {
    background: var(--color-bg);
}

.btn-decision:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.btn-decision.approve:hover:not(:disabled) {
    border-color: var(--color-state-success);
    color: var(--color-state-success-dark);
}

.btn-decision.select:hover:not(:disabled) {
    border-color: var(--color-accent);
    color: var(--color-accent);
}

.btn-decision.reject:hover:not(:disabled) {
    border-color: var(--color-state-error);
    color: var(--color-state-error-dark);
}

.auto-note {
    margin: 10px 0 0;
    font-size: 11px;
    color: var(--color-text-muted);
    line-height: 1.4;
}

.btn-message {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    margin-top: 10px;
    padding: 10px 16px;
    border-radius: var(--radius-button);
    border: 1px solid var(--color-accent);
    background: var(--color-surface);
    color: var(--color-accent);
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.btn-message:hover {
    background: var(--color-ai-bg);
}

/* Notificación */
.notify-block {
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-3);
}

.notify-hint {
    margin: -6px 0 12px;
    font-size: var(--fs-caption);
    color: var(--color-text-muted);
    line-height: 1.4;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
}

.field-label {
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    color: var(--color-text-secondary);
}

.field-input {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    color: var(--color-text-primary);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    box-sizing: border-box;
    transition: var(--transition);
}

.field-input:focus {
    outline: none;
    border-color: var(--color-accent);
    background: var(--color-surface);
}

textarea.field-input {
    resize: vertical;
}

/* Toggle Automático / Redactar */
.mode-toggle {
    display: flex;
    gap: 4px;
    padding: 4px;
    margin-bottom: 12px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-button);
}

.mode-btn {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: var(--radius-button);
    background: transparent;
    color: var(--color-text-secondary);
    font-family: var(--font-family);
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.mode-btn:hover:not(.on) {
    color: var(--color-text-primary);
}

.mode-btn.on {
    background: var(--color-surface);
    color: var(--color-accent);
    box-shadow: var(--shadow-card);
}

.preview-box {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: var(--space-2);
    margin-bottom: 12px;
    background: var(--color-ai-bg);
    border: 1px solid var(--color-ai-outline);
    border-left: 3px solid var(--color-ai-border);
    border-radius: var(--radius-card);
}

.preview-label {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    color: var(--color-text-primary);
}

.preview-box p {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
}

.no-phone-warn {
    margin: -4px 0 12px;
    font-size: 11px;
    color: var(--color-state-alert-dark);
}

.btn-send {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-radius: var(--radius-button);
    background: var(--color-state-success);
    color: #fff;
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.btn-send:hover:not(:disabled) {
    background: var(--color-state-success-dark);
}

.btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 480px) {
    .drawer {
        max-width: 100%;
    }
}
</style>
