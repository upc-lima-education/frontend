<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { JobService } from '@/app/job/services/job.service';
import { messageService } from '../services/message.service';
import { ConversationResponse } from '../model/conversation.response';
import { MessageResponse } from '../model/message.response';
import ConversationListComponent from '../components/conversation-list.component.vue';
import MessageListComponent from '../components/message-list.component.vue';
import MessageInputComponent from '../components/message-input.component.vue';
import { ChevronLeft, MessageCircle, RefreshCw, Trash2, UserMinus, UserPlus, UsersRound } from 'lucide-vue-next';

const route = useRoute();
const authStore = useAuthenticationStore();
const jobService = new JobService();
const conversations = ref<ConversationResponse[]>([]);
const currentConversation = ref<ConversationResponse | null>(null);
const messages = ref<MessageResponse[]>([]);
const loading = ref(false);
const error = ref('');
const success = ref('');
const userId = ref('');
const managingParticipants = ref(false);
const participantUserId = ref('');
const participantPending = ref(false);
const actionError = ref('');
const deleteArmed = ref(false);
const mobileView = ref<'list' | 'chat'>('list');

async function getConversations(): Promise<ConversationResponse[]> {
    const companyProfileId = localStorage.getItem('profileId');
    if (!companyProfileId) throw new Error('No se encontró el perfil de la empresa. Completa o vuelve a cargar tu perfil.');
    const jobs = await jobService.getJobsByCompany(companyProfileId);
    const grouped = await Promise.all(jobs.map((job) => messageService.getConversationsByJob(job.id, job.title).catch(() => [])));
    return grouped.flat();
}

function mergeConversation(updated: ConversationResponse, previous: ConversationResponse): void {
    updated.title = previous.title;
    updated.subtitle = previous.subtitle;
    updated.userImage = previous.userImage;
    conversations.value = conversations.value.map((conversation) => conversation.id === updated.id ? updated : conversation);
    currentConversation.value = updated;
}

async function selectConversation(conversation: ConversationResponse): Promise<void> {
    actionError.value = '';
    deleteArmed.value = false;
    mobileView.value = 'chat';
    currentConversation.value = conversation;
    try {
        const detail = await messageService.getConversationById(conversation.id, conversation.title);
        mergeConversation(detail.conversation, conversation);
        messages.value = detail.messages;
    } catch (cause) {
        console.error('Error loading conversation:', cause);
        messages.value = [];
        actionError.value = 'No se pudo cargar el detalle de la conversación.';
    }
}

async function sendMessage(content: string): Promise<void> {
    if (!currentConversation.value) return;
    success.value = '';
    actionError.value = '';
    try {
        await messageService.sendMessage(currentConversation.value.id, content);
        const detail = await messageService.getConversationById(currentConversation.value.id, currentConversation.value.title);
        mergeConversation(detail.conversation, currentConversation.value);
        messages.value = detail.messages;
        success.value = 'Mensaje enviado.';
    } catch (cause) {
        console.error('Error sending message:', cause);
        actionError.value = 'No se pudo enviar el mensaje. Inténtalo nuevamente.';
    }
}

async function addParticipant(): Promise<void> {
    const conversation = currentConversation.value;
    const candidateUserId = participantUserId.value.trim();
    if (!conversation || !candidateUserId) return;
    if (conversation.participantIds.includes(candidateUserId)) {
        actionError.value = 'Ese usuario ya forma parte de la conversación.';
        return;
    }
    participantPending.value = true;
    actionError.value = '';
    try {
        const updated = await messageService.addUsersToConversation(conversation.id, [candidateUserId]);
        mergeConversation(updated, conversation);
        participantUserId.value = '';
        success.value = 'Participante añadido a la conversación.';
    } catch (cause) {
        console.error('No se pudo añadir el participante:', cause);
        actionError.value = 'No se pudo añadir el participante. Verifica el identificador de usuario.';
    } finally {
        participantPending.value = false;
    }
}

async function removeParticipant(candidateUserId: string): Promise<void> {
    const conversation = currentConversation.value;
    if (!conversation || candidateUserId === userId.value) return;
    participantPending.value = true;
    actionError.value = '';
    try {
        const updated = await messageService.removeUsersFromConversation(conversation.id, [candidateUserId]);
        mergeConversation(updated, conversation);
        success.value = 'Participante retirado de la conversación.';
    } catch (cause) {
        console.error('No se pudo retirar el participante:', cause);
        actionError.value = 'No se pudo retirar el participante. Inténtalo nuevamente.';
    } finally {
        participantPending.value = false;
    }
}

async function deleteCurrentConversation(): Promise<void> {
    const conversation = currentConversation.value;
    if (!conversation) return;
    if (!deleteArmed.value) {
        deleteArmed.value = true;
        actionError.value = 'Confirma la eliminación para borrar esta conversación.';
        return;
    }
    participantPending.value = true;
    actionError.value = '';
    try {
        await messageService.deleteConversation(conversation.id);
        conversations.value = conversations.value.filter((item) => item.id !== conversation.id);
        currentConversation.value = null;
        messages.value = [];
        managingParticipants.value = false;
        deleteArmed.value = false;
        success.value = 'Conversación eliminada.';
    } catch (cause) {
        console.error('No se pudo eliminar la conversación:', cause);
        actionError.value = 'No se pudo eliminar la conversación. Inténtalo nuevamente.';
    } finally {
        participantPending.value = false;
    }
}

async function loadConversations(): Promise<void> {
    loading.value = true;
    error.value = '';
    try {
        conversations.value = await getConversations();
        const requestedConversation = String(route.query.conversation ?? '');
        const initial = conversations.value.find((conversation) => conversation.id === requestedConversation);
        if (initial) await selectConversation(initial);
    } catch (cause) {
        console.error('Error loading conversations:', cause);
        error.value = 'No se pudieron cargar las conversaciones. Comprueba el perfil y las vacantes de la empresa.';
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    userId.value = authStore.currentUserId;
    await loadConversations();
});
</script>

<template>
    <div class="msg-company-page">
        <div class="msg-company-backdrop" aria-hidden="true">
            <div class="company-orb company-orb--primary"></div>
            <div class="company-orb company-orb--lime"></div>
        </div>

        <div class="msg-company-workspace">
            <header class="msg-company-hero" aria-labelledby="company-messages-title">
                <div>
                    <h1 id="company-messages-title">Mensajes de selección</h1>
                    <p>Gestiona las conversaciones con postulantes de tus vacantes activas.</p>
                </div>
                <button type="button" class="company-refresh-btn" :disabled="loading" @click="loadConversations">
                    <RefreshCw :size="15" :class="{ 'spin-loader': loading }" aria-hidden="true" />
                    <span>Actualizar</span>
                </button>
            </header>

            <div class="message-page">
                <p v-if="success" class="message-status" role="status">{{ success }}</p>
                <aside class="conversation-panel" :class="{ 'is-mobile-hidden': mobileView === 'chat' }" :aria-busy="loading">
            <ConversationListComponent :conversations="conversations" :selected-id="currentConversation?.id" @select="selectConversation" />
                </aside>

                <main class="chat-panel" :class="{ 'is-mobile-hidden': mobileView === 'list' }">
            <template v-if="currentConversation">
                <header class="chat-header">
                    <button type="button" class="company-mobile-back" @click="mobileView = 'list'" aria-label="Volver a la lista de conversaciones">
                        <ChevronLeft :size="20" aria-hidden="true" />
                        <span>Conversaciones</span>
                    </button>
                    <div class="chat-contact-info">
                        <span class="chat-contact-avatar" aria-hidden="true"><MessageCircle :size="19" /></span>
                        <div>
                            <h1 class="chat-contact-name">{{ currentConversation.title }}</h1>
                            <p class="chat-contact-status">{{ currentConversation.subtitle }}</p>
                        </div>
                    </div>
                    <div class="chat-actions">
                        <button type="button" class="header-action" :aria-expanded="managingParticipants" @click="managingParticipants = !managingParticipants">
                            <UsersRound :size="17" aria-hidden="true" /><span>Participantes</span>
                        </button>
                        <button type="button" class="header-action header-action--danger" :disabled="participantPending" @click="deleteCurrentConversation">
                            <Trash2 :size="17" aria-hidden="true" /><span>{{ deleteArmed ? 'Confirmar eliminación' : 'Eliminar' }}</span>
                        </button>
                    </div>
                </header>

                <section v-if="managingParticipants" class="participant-manager" aria-label="Administrar participantes">
                    <div><h2>Participantes</h2><p>La API entrega identificadores de usuario. Úsalos solo cuando provengan de una acción válida de Llanqui.</p></div>
                    <form class="participant-form" @submit.prevent="addParticipant">
                        <label for="participant-user-id">ID de usuario</label>
                        <div><input id="participant-user-id" v-model="participantUserId" type="text" autocomplete="off" placeholder="Identificador UUID" :disabled="participantPending" /><button type="submit" :disabled="participantPending || !participantUserId.trim()"><UserPlus :size="16" /> Añadir</button></div>
                    </form>
                    <ul class="participant-list">
                        <li v-for="participantId in currentConversation.participantIds" :key="participantId">
                            <code>{{ participantId }}</code><span v-if="participantId === userId" class="self-label">Tú</span>
                            <button v-else type="button" :disabled="participantPending" :aria-label="`Retirar participante ${participantId}`" @click="removeParticipant(participantId)"><UserMinus :size="16" /></button>
                        </li>
                    </ul>
                </section>

                <p v-if="actionError" class="chat-error" role="alert">{{ actionError }}</p>
                <section class="chat-messages" aria-label="Mensajes de la conversación">
                    <MessageListComponent :messages="messages" :user-id="userId" />
                </section>
                <footer class="chat-input"><MessageInputComponent @send="sendMessage" /></footer>
            </template>

            <section v-else class="empty-chat" aria-labelledby="empty-chat-title">
                <div class="empty-chat-content">
                    <span class="empty-icon-circle" aria-hidden="true"><MessageCircle :size="32" /></span>
                    <h1 id="empty-chat-title">Conversaciones de vacantes</h1>
                    <p v-if="error">{{ error }}</p><p v-else-if="loading">Cargando conversaciones…</p><p v-else>Selecciona una conversación o inicia una desde el seguimiento de postulantes.</p>
                </div>
            </section>
                </main>
            </div>
        </div>
    </div>
</template>

<style scoped>
.message-page { width: min(calc(100% - (var(--page-gutter) * 2)), var(--page-max)); height: 680px; max-height: calc(100vh - 150px); min-height: 540px; margin: clamp(24px, 5vh, 56px) auto; display: grid; grid-template-columns: minmax(270px, 320px) minmax(0, 1fr); overflow: hidden; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-card-lg); box-shadow: var(--shadow-card); }
.message-status { position: fixed; right: 20px; bottom: 20px; z-index: 5; margin: 0; padding: 10px 14px; border-radius: 10px; color: var(--color-state-success-dark); background: rgba(59, 156, 32, .12); font-size: var(--fs-body-sm); }
.conversation-panel { min-width: 0; border-right: 1px solid var(--color-border); }
.chat-panel { display: flex; flex-direction: column; min-width: 0; background: var(--color-bg); }
.chat-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 15px 18px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
.chat-contact-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
.chat-contact-avatar { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 42px; border-radius: 12px; color: var(--color-primary); background: var(--color-ai-bg); }
.chat-contact-name, .chat-contact-status { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-contact-name { color: var(--color-text-primary); font-size: var(--fs-body-sm); font-weight: var(--fw-bold); }
.chat-contact-status { margin-top: 3px; color: var(--color-text-secondary); font-size: var(--fs-caption); }
.chat-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.header-action { min-height: 46px; display: inline-flex; align-items: center; gap: 7px; padding: 0 11px; border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-secondary); background: var(--color-surface); font: inherit; font-size: var(--fs-caption); font-weight: var(--fw-semibold); cursor: pointer; }
.header-action:hover:not(:disabled) { color: var(--color-primary); border-color: var(--color-primary); }
.header-action--danger:hover:not(:disabled) { color: var(--color-state-error-dark); border-color: var(--color-state-error); }
.header-action:focus-visible, .participant-manager button:focus-visible { outline: 3px solid rgba(40, 56, 211, .28); outline-offset: 2px; }
.participant-manager { display: grid; gap: 14px; padding: 16px 18px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
.participant-manager h2, .participant-manager p { margin: 0; }.participant-manager h2 { color: var(--color-text-primary); font-size: var(--fs-body-sm); }.participant-manager p { margin-top: 3px; max-width: 70ch; color: var(--color-text-secondary); font-size: var(--fs-caption); line-height: 1.45; }
.participant-form { display: grid; gap: 7px; }.participant-form label { color: var(--color-text-primary); font-size: var(--fs-caption); font-weight: var(--fw-semibold); }.participant-form > div { display: flex; gap: 8px; }
.participant-form input { min-width: 0; flex: 1; min-height: 48px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-primary); background: var(--color-bg); font: inherit; font-size: var(--fs-body-sm); }.participant-form input:focus { outline: 3px solid rgba(40, 56, 211, .18); outline-offset: 1px; border-color: var(--color-primary); }
.participant-form button { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 13px; border: 0; border-radius: 8px; color: #fff; background: var(--color-primary); font: inherit; font-size: var(--fs-caption); font-weight: var(--fw-semibold); cursor: pointer; }
.participant-list { display: grid; gap: 6px; padding: 0; margin: 0; list-style: none; }.participant-list li { display: flex; align-items: center; gap: 8px; min-width: 0; padding: 8px 10px; border-radius: 8px; background: var(--color-bg); }.participant-list code { min-width: 0; overflow: hidden; color: var(--color-text-secondary); font: var(--fs-caption)/1.4 var(--font-family); text-overflow: ellipsis; white-space: nowrap; }.self-label { padding: 2px 6px; border-radius: 5px; color: var(--color-primary); background: var(--color-ai-bg); font-size: 11px; font-weight: var(--fw-semibold); }.participant-list button { display: inline-grid; place-items: center; width: 32px; height: 32px; margin-left: auto; flex: 0 0 auto; border: 0; border-radius: 7px; color: var(--color-state-error-dark); background: transparent; cursor: pointer; }.participant-list button:hover:not(:disabled) { background: rgba(210, 38, 38, .08); }.participant-list button:disabled, .participant-form button:disabled, .header-action:disabled { opacity: .58; cursor: not-allowed; }
.chat-error { margin: 12px 18px 0; padding: 10px 12px; border-radius: 8px; color: var(--color-state-error-dark); background: rgba(210, 38, 38, .08); font-size: var(--fs-caption); line-height: 1.4; }.chat-messages { flex: 1; min-height: 220px; overflow-y: auto; background: var(--color-bg); }.history-note { margin: 0; padding: 12px 18px; color: var(--color-text-secondary); font-size: var(--fs-caption); text-align: center; }.chat-input { background: var(--color-surface); border-top: 1px solid var(--color-border); }
.empty-chat { display: grid; place-items: center; flex: 1; min-height: 360px; padding: var(--space-4); text-align: center; }.empty-chat-content { display: grid; justify-items: center; gap: 11px; max-width: 390px; }.empty-icon-circle { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 16px; color: var(--color-primary); background: var(--color-ai-bg); }.empty-chat-content h1, .empty-chat-content p { margin: 0; }.empty-chat-content h1 { color: var(--color-text-primary); font-size: var(--fs-subtitle); }.empty-chat-content p { color: var(--color-text-secondary); font-size: var(--fs-body-sm); line-height: 1.5; }
@media (max-width: 760px) { .message-page { width: 100%; height: calc(100dvh - 70px); max-height: none; min-height: 540px; margin: 0; grid-template-columns: 1fr; grid-template-rows: minmax(220px, 34vh) minmax(0, 1fr); border-right: 0; border-left: 0; border-radius: 0; } .conversation-panel { border-right: 0; border-bottom: 1px solid var(--color-border); } }
@media (max-width: 540px) { .chat-header { align-items: flex-start; flex-direction: column; }.chat-actions { width: 100%; justify-content: stretch; }.header-action { flex: 1; justify-content: center; }.participant-form > div { flex-direction: column; }.participant-form button { width: 100%; } }

/* La empresa comparte la misma consola clara y enfocada de la bandeja del candidato. */
.msg-company-page {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    min-height: calc(100dvh - 70px);
    padding: clamp(28px, 4vw, 56px) 0;
    overflow-x: clip;
    font-family: var(--font-family);
    display: grid;
    justify-items: center;
    align-content: center;
}

.msg-company-backdrop {
    position: absolute;
    inset: 0 0 auto;
    height: 420px;
    overflow: hidden;
    pointer-events: none;
}

.company-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(1px);
    opacity: .72;
}

.company-orb--primary {
    top: -230px;
    right: 4%;
    width: 430px;
    height: 430px;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 68%);
}

.company-orb--lime {
    top: -185px;
    left: 7%;
    width: 340px;
    height: 340px;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-brand-lime) 22%, transparent), transparent 70%);
}

.msg-company-workspace {
    position: relative;
    z-index: 1;
    width: min(100%, 1180px);
    padding-inline: var(--page-gutter);
    box-sizing: border-box;
    margin: 0 auto;
}

.msg-company-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin: 0 0 20px;
}

.msg-company-hero h1,
.msg-company-hero p {
    margin: 0;
}

.msg-company-hero h1 {
    font-family: var(--font-display);
    font-size: clamp(25px, 3.2vw, 34px);
    font-weight: var(--fw-bold);
    letter-spacing: -0.025em;
    color: var(--color-text-primary);
}

.msg-company-hero p {
    margin-top: 5px;
    color: var(--color-text-secondary);
    font-size: 14px;
}

.company-refresh-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 40px;
    padding: 0 13px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-button);
    background: var(--color-surface);
    color: var(--color-primary);
    font: inherit;
    font-size: 12px;
    font-weight: var(--fw-semibold);
    cursor: pointer;
}

.company-refresh-btn:hover:not(:disabled) {
    background: var(--color-lavender);
    border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
}

.company-refresh-btn:disabled {
    opacity: .58;
    cursor: not-allowed;
}

.spin-loader {
    animation: company-spin .8s linear infinite;
}

@keyframes company-spin {
    to { transform: rotate(360deg); }
}

.message-page {
    width: 100%;
    height: clamp(520px, calc(100dvh - 260px), 680px);
    max-height: calc(100dvh - 220px);
    min-height: 540px;
    margin: 0 auto;
    grid-template-columns: 360px minmax(0, 1fr);
}

.conversation-panel {
    display: flex;
    min-height: 0;
    background: var(--color-surface);
}

.chat-panel {
    min-height: 0;
    background: var(--color-surface-subtle);
}

.chat-header {
    min-height: 68px;
    padding: 13px 20px;
    background: var(--color-surface);
}

.chat-contact-avatar {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
    border-radius: 11px;
    color: #fff;
    background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
}

.chat-contact-name {
    font-family: var(--font-display);
    font-size: 16px;
    line-height: 1.25;
}

.chat-contact-status {
    margin-top: 3px;
    font-size: 12px;
}

.chat-actions {
    flex-wrap: nowrap;
}

.header-action {
    min-height: 38px;
    padding: 0 10px;
    border-radius: var(--radius-button);
    background: var(--color-surface-subtle);
}

.participant-manager {
    gap: 12px;
    padding: 14px 20px;
    background: var(--color-surface);
}

.chat-messages {
    min-height: 0;
    padding: 0;
    background: var(--color-surface-subtle);
}

/* En conversaciones cortas, el historial ocupa el centro visual del panel. */
.chat-messages :deep(.messages) {
    min-height: 100%;
}

.chat-messages :deep(.messages::before),
.chat-messages :deep(.messages::after) {
    content: '';
    flex: 1 1 24px;
}

.chat-input {
    border-top: 1px solid var(--color-border);
}

.history-note {
    padding: 0 20px 14px;
}

.empty-chat {
    background: var(--color-surface-subtle);
}

.empty-icon-circle {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--color-lavender);
}

.company-mobile-back {
    display: none;
}

@media (max-width: 768px) {
    .msg-company-page {
        min-height: calc(100dvh - 64px);
        padding: 12px 0 0;
        align-content: start;
    }

    .msg-company-backdrop,
    .msg-company-hero {
        display: none;
    }

    .msg-company-workspace {
        width: 100%;
        padding-inline: 0;
    }

    .message-page {
        height: calc(100dvh - 76px);
        max-height: none;
        min-height: 520px;
        border-right: 0;
        border-left: 0;
        border-radius: 0;
        grid-template-columns: 1fr;
    }

    .conversation-panel.is-mobile-hidden,
    .chat-panel.is-mobile-hidden {
        display: none;
    }

    .chat-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas: "back back" "details actions";
        gap: 8px 10px;
        padding: 10px 14px 12px;
    }

    .company-mobile-back {
        grid-area: back;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        min-height: 30px;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--color-primary);
        font: inherit;
        font-size: 13px;
        font-weight: var(--fw-semibold);
    }

    .chat-contact-info {
        grid-area: details;
    }

    .chat-actions {
        grid-area: actions;
        gap: 5px;
    }

    .header-action {
        width: 38px;
        min-height: 38px;
        padding: 0;
        justify-content: center;
    }

    .header-action span {
        display: none;
    }

    .participant-manager {
        padding: 12px 14px;
    }
}
</style>
