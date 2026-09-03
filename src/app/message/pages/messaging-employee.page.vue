<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { ROUTE_CONSTANTS } from '@/app/shared/router/route-constants';
import { messageService } from '../services/message.service';
import type { ConversationResponse } from '../model/conversation.response';
import type { MessageResponse } from '../model/message.response';
import {
  Search,
  Send,
  CheckCheck,
  MessageSquare,
  Sparkles,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  Briefcase,
  Compass,
} from 'lucide-vue-next';

const authStore = useAuthenticationStore();

const conversations = ref<ConversationResponse[]>([]);
const currentConversation = ref<ConversationResponse | null>(null);
const messages = ref<MessageResponse[]>([]);
const loading = ref(false);
const error = ref('');
const userId = ref('');
const inputMessage = ref('');
const searchQuery = ref('');
const mobileView = ref<'list' | 'chat'>('list');
const messagesScrollArea = ref<HTMLElement | null>(null);

const quickReplies = [
  '¡Hola! Con mucho gusto.',
  'Quedo atento/a a sus indicaciones.',
  '¿Cuándo coordinamos la entrevista?',
  'Muchas gracias por contactarme.',
];

const totalUnread = computed(() => {
  return conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
});

const filteredConversations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const list = conversations.value;
  if (!query) return list;
  return list.filter((c) =>
    c.title.toLowerCase().includes(query) ||
    c.subtitle?.toLowerCase().includes(query)
  );
});

function scrollToBottom() {
  nextTick(() => {
    if (messagesScrollArea.value) {
      messagesScrollArea.value.scrollTop = messagesScrollArea.value.scrollHeight;
    }
  });
}

function selectConversation(conv: ConversationResponse) {
  currentConversation.value = conv;
  mobileView.value = 'chat';
  void loadConversationDetails(conv.id);
}

async function loadConversationDetails(convId: string) {
  try {
    const detail = await messageService.getConversationById(convId);
    messages.value = detail.messages || [];
    scrollToBottom();
  } catch (err) {
    console.error('Error loading conversation messages:', err);
    messages.value = [];
  }
}

async function handleSend(text?: string) {
  const content = (text || inputMessage.value).trim();
  if (!content || !currentConversation.value) return;

  try {
    await messageService.sendMessage(currentConversation.value.id, content);
    inputMessage.value = '';
    const detail = await messageService.getConversationById(currentConversation.value.id, currentConversation.value.title);
    const updated = { ...detail.conversation, title: currentConversation.value.title, subtitle: currentConversation.value.subtitle };
    currentConversation.value = updated;
    conversations.value = conversations.value.map((conversation) =>
      conversation.id === updated.id ? updated : conversation,
    );
    messages.value = detail.messages;
    scrollToBottom();
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    error.value = 'No se pudo enviar el mensaje.';
  }
}

function useQuickReply(replyText: string) {
  inputMessage.value = replyText;
}

function formatTime(sentAtVal: Date | string): string {
  try {
    const d = typeof sentAtVal === 'string' ? new Date(sentAtVal) : sentAtVal;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function conversationInitials(conversation: ConversationResponse): string {
  return conversation.title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'LL';
}

function lastMessageTime(conversation: ConversationResponse): string {
  const value = (conversation as ConversationResponse & { lastMessageTime?: Date | string }).lastMessageTime;
  return value ? formatTime(value) : '';
}

async function fetchConversations() {
  userId.value = authStore.currentUserId;
  loading.value = true;
  error.value = '';
  try {
    const list = await messageService.getConversationsForEmployee();
    if (list && list.length > 0) {
      conversations.value = list;
      if (!currentConversation.value && list[0]) {
        selectConversation(list[0]);
        if (window.innerWidth <= 768) {
          mobileView.value = 'list';
        }
      }
    } else {
      conversations.value = [];
    }
  } catch (err) {
    console.error('Error loading conversations:', err);
    conversations.value = [];
    error.value = 'No se pudieron cargar tus conversaciones. Inténtalo nuevamente.';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchConversations();
});
</script>

<template>
  <div class="msg-workspace-page">
    <!-- Ambient Animated Mesh Atmosphere -->
    <div class="msg-ambient-backdrop" aria-hidden="true">
      <div class="ambient-orb ambient-orb--primary"></div>
      <div class="ambient-orb ambient-orb--lime"></div>
      <div class="ambient-mesh-pattern"></div>
    </div>

    <div class="msg-workspace-container">
      <!-- Command Hero Header -->
      <header class="msg-command-hero" aria-labelledby="msg-page-title">
        <div class="msg-hero-topline">
          <div class="hero-chip-badge">
            <Sparkles :size="13" class="hero-chip-icon" aria-hidden="true" />
            <span class="hero-chip-text">Comunicación Directa</span>
          </div>
          <button
            type="button"
            class="hero-refresh-btn"
            :disabled="loading"
            @click="fetchConversations"
            title="Actualizar mensajes"
          >
            <RefreshCw :size="14" :class="{ 'spin-loader': loading }" aria-hidden="true" />
            <span>Actualizar</span>
          </button>
        </div>

        <div class="msg-hero-main">
          <h1 id="msg-page-title" class="msg-page-title">
            Bandeja de <span class="highlight-lime">mensajes y contacto</span>
          </h1>
          <p class="msg-page-subtitle">
            Conversa directamente con los equipos de selección y empresas sobre tus postulaciones y oportunidades laborales.
          </p>
        </div>
      </header>

      <!-- 4-Tile Bento Pipeline Overview -->
      <section class="pipeline-bento-grid" aria-label="Resumen de mensajería">
        <!-- Tile 1: Total -->
        <div class="bento-stat-tile">
          <div class="bento-tile-top">
            <div class="tile-icon-box tile-icon-box--primary">
              <MessageSquare :size="18" aria-hidden="true" />
            </div>
            <span class="tile-metric-value">{{ conversations.length }}</span>
          </div>
          <div class="tile-meta-body">
            <span class="tile-metric-label">Bandeja activa</span>
            <span class="tile-metric-caption">Conversaciones en curso</span>
          </div>
        </div>

        <!-- Tile 2: Unread -->
        <div class="bento-stat-tile">
          <div class="bento-tile-top">
            <div class="tile-icon-box" :class="totalUnread > 0 ? 'tile-icon-box--pending' : 'tile-icon-box--lime'">
              <CheckCircle2 :size="18" aria-hidden="true" />
            </div>
            <span class="tile-metric-value">{{ totalUnread > 0 ? totalUnread : '0' }}</span>
          </div>
          <div class="tile-meta-body">
            <span class="tile-metric-label">Sin leer</span>
            <span class="tile-metric-caption">{{ totalUnread > 0 ? 'Mensajes pendientes' : 'Al día con tus avisos' }}</span>
          </div>
        </div>

        <!-- Tile 3: Active Focus -->
        <div class="bento-stat-tile">
          <div class="bento-tile-top">
            <div class="tile-icon-box tile-icon-box--neutral">
              <Building2 :size="18" aria-hidden="true" />
            </div>
            <span class="tile-metric-value tile-metric-value--text">
              {{ currentConversation ? currentConversation.title : '—' }}
            </span>
          </div>
          <div class="tile-meta-body">
            <span class="tile-metric-label">Empresa en foco</span>
            <span class="tile-metric-caption truncate">
              {{ currentConversation?.subtitle || 'Ningún chat seleccionado' }}
            </span>
          </div>
        </div>

        <!-- Tile 4: Security Guarantee -->
        <div class="bento-stat-tile">
          <div class="bento-tile-top">
            <div class="tile-icon-box tile-icon-box--lime">
              <ShieldCheck :size="18" aria-hidden="true" />
            </div>
            <span class="tile-metric-value tile-metric-value--text">Verificado</span>
          </div>
          <div class="tile-meta-body">
            <span class="tile-metric-label">Canal Oficial</span>
            <span class="tile-metric-caption">Contacto profesional seguro</span>
          </div>
        </div>
      </section>

      <!-- Zero Conversations Empty State -->
      <section
        v-if="!loading && conversations.length === 0"
        class="empty-pipeline-card"
        aria-labelledby="empty-conv-title"
      >
        <div class="empty-icon-orbit">
          <MessageSquare :size="32" class="empty-icon-main" aria-hidden="true" />
        </div>
        <div class="empty-badge-pill">Bandeja de postulante</div>
        <h2 id="empty-conv-title" class="empty-title">Aún no tienes conversaciones activas</h2>
        <p class="empty-description">
          Cuando una empresa revise tu postulación o decida contactarte para una entrevista de trabajo, el canal de comunicación se activará automáticamente en esta bandeja.
        </p>
        <div class="empty-actions-row">
          <RouterLink :to="ROUTE_CONSTANTS.JOB_SEARCH" class="btn-primary-action">
            <Compass :size="16" aria-hidden="true" />
            <span>Explorar ofertas laborales</span>
          </RouterLink>
          <RouterLink :to="ROUTE_CONSTANTS.MY_APPLICATIONS" class="btn-secondary-action">
            <Briefcase :size="16" aria-hidden="true" />
            <span>Ver mis postulaciones</span>
          </RouterLink>
        </div>
      </section>

      <!-- Messaging Console (Sidebar + Active Chat) -->
      <div v-else class="msg-console-card">
        <!-- LEFT PANEL: CONVERSATIONS SIDEBAR -->
        <aside
          class="msg-sidebar"
          :class="{ 'is-mobile-hidden': mobileView === 'chat' }"
          aria-label="Lista de conversaciones"
        >
          <header class="msg-sidebar-head">
            <div class="msg-sidebar-head-row">
              <h2 class="msg-sidebar-title">Chats directos</h2>
              <span class="msg-sidebar-count">{{ filteredConversations.length }}</span>
            </div>

            <div class="msg-search-box">
              <Search :size="15" class="msg-search-icon" aria-hidden="true" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar empresa o vacante…"
                class="msg-search-input"
                aria-label="Buscar en conversaciones"
              />
            </div>
          </header>

          <div class="msg-conversations-list" role="list">
            <div
              v-for="conv in filteredConversations"
              :key="conv.id"
              class="msg-conv-item"
              :class="{ 'is-active': currentConversation?.id === conv.id }"
              role="listitem"
              tabindex="0"
              @click="selectConversation(conv)"
              @keydown.enter.space="selectConversation(conv)"
            >
              <!-- Avatar Logo Monogram -->
              <div class="msg-avatar-logo">
                {{ conversationInitials(conv) }}
              </div>

              <div class="msg-conv-info">
                <div class="msg-conv-topline">
                  <strong class="msg-conv-title">{{ conv.title }}</strong>
                  <span v-if="lastMessageTime(conv)" class="msg-conv-time">{{ lastMessageTime(conv) }}</span>
                </div>
                <p class="msg-conv-subtitle">{{ conv.subtitle }}</p>
                <p class="msg-conv-preview">{{ (conv as any).lastMessage || 'Conversación abierta' }}</p>
              </div>

              <!-- Unread badge pill -->
              <span v-if="conv.unreadCount && conv.unreadCount > 0" class="msg-unread-pill" :title="`${conv.unreadCount} no leídos`">
                {{ conv.unreadCount }}
              </span>
            </div>

            <div v-if="filteredConversations.length === 0" class="msg-no-results">
              <p>No se encontraron conversaciones con "{{ searchQuery }}".</p>
            </div>
          </div>
        </aside>

        <!-- RIGHT PANEL: ACTIVE CHAT -->
        <main
          class="msg-chat-panel"
          :class="{ 'is-mobile-hidden': mobileView === 'list' }"
          aria-label="Área de conversación"
        >
          <template v-if="currentConversation">
            <!-- Chat Header -->
            <header class="msg-chat-head">
              <div class="msg-chat-head-left">
                <!-- Mobile back button -->
                <button
                  type="button"
                  class="msg-mobile-back-btn"
                  @click="mobileView = 'list'"
                  aria-label="Volver a la lista de conversaciones"
                >
                  <ChevronLeft :size="20" aria-hidden="true" />
                  <span>Conversaciones</span>
                </button>

                <div class="msg-chat-avatar">
                  {{ conversationInitials(currentConversation) }}
                </div>

                <div class="msg-chat-head-text">
                  <div class="msg-chat-head-title-row">
                    <h2 class="msg-chat-head-title">{{ currentConversation.title }}</h2>
                    <span class="msg-verified-pill">Empresa verificada</span>
                  </div>
                  <span class="msg-chat-head-sub">{{ currentConversation.subtitle }}</span>
                </div>
              </div>

              <div class="msg-chat-head-right">
                <RouterLink
                  v-if="currentConversation.jobId"
                  :to="`${ROUTE_CONSTANTS.JOB_DETAIL}/${currentConversation.jobId}`"
                  class="msg-view-job-btn"
                  title="Ver detalle de la vacante"
                >
                  <Briefcase :size="14" aria-hidden="true" />
                  <span>Ver vacante</span>
                  <ExternalLink :size="12" aria-hidden="true" />
                </RouterLink>
              </div>
            </header>

            <!-- Message Stream Area -->
            <div ref="messagesScrollArea" class="msg-stream-scroll" tabindex="0">
              <div class="msg-security-notice" role="note">
                <ShieldCheck :size="15" aria-hidden="true" />
                <span>Conversación protegida bajo las políticas de contacto profesional de Llanqui.</span>
              </div>

              <div
                v-for="msg in messages"
                :key="msg.id"
                class="msg-message-row"
                :class="{ 'is-mine': msg.userId === userId }"
              >
                <div class="msg-bubble">
                  <p class="msg-bubble-text">{{ msg.content }}</p>
                  <div class="msg-bubble-meta">
                    <span class="msg-bubble-time">{{ formatTime(msg.sentAt) }}</span>
                    <CheckCheck
                      v-if="msg.userId === userId"
                      :size="14"
                      class="msg-check-read"
                      aria-label="Enviado"
                    />
                  </div>
                </div>
              </div>

              <div v-if="messages.length === 0" class="msg-empty-messages">
                <p>Aún no hay mensajes en esta conversación. ¡Envía un saludo para iniciar el contacto!</p>
              </div>
            </div>

            <!-- Quick replies bar -->
            <div class="msg-quick-replies-bar" aria-label="Sugerencias de respuesta rápida">
              <span class="msg-quick-label">Sugerencias:</span>
              <button
                v-for="reply in quickReplies"
                :key="reply"
                type="button"
                class="msg-quick-chip"
                @click="useQuickReply(reply)"
              >
                {{ reply }}
              </button>
            </div>

            <!-- Chat Input Footer -->
            <footer class="msg-input-footer">
              <form class="msg-input-form" @submit.prevent="() => handleSend()">
                <input
                  v-model="inputMessage"
                  type="text"
                  placeholder="Escribe tu mensaje profesional aquí…"
                  class="msg-text-input"
                  aria-label="Escribe tu mensaje"
                />

                <button
                  type="submit"
                  class="msg-btn-send"
                  :disabled="!inputMessage.trim()"
                  aria-label="Enviar mensaje"
                >
                  <Send :size="16" aria-hidden="true" />
                </button>
              </form>
            </footer>
          </template>

          <div v-else class="msg-placeholder-state">
            <div class="msg-placeholder-icon-wrap">
              <MessageSquare :size="36" aria-hidden="true" />
            </div>
            <h3 class="msg-placeholder-title">Selecciona una conversación</h3>
            <p class="msg-placeholder-desc">
              Elige una empresa del panel izquierdo para consultar el historial y responder directamente.
            </p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V5 */

.msg-workspace-page {
  position: relative;
  min-height: calc(100vh - 70px);
  width: 100%;
  background: transparent;
  padding-bottom: var(--space-6);
  font-family: var(--font-family);
  overflow-x: clip;
}

/* Ambient Animated Mesh Atmosphere */
.msg-ambient-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 480px;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.ambient-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.ambient-orb--primary {
  top: -120px;
  right: 8%;
  width: 440px;
  height: 440px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-primary) 32%, transparent) 0%,
    color-mix(in srgb, var(--color-primary) 14%, transparent) 38%,
    color-mix(in srgb, var(--color-primary) 3%, transparent) 68%,
    transparent 85%
  );
  animation: orbDrift 18s ease-in-out infinite alternate;
}

.ambient-orb--lime {
  top: 40px;
  left: 5%;
  width: 380px;
  height: 380px;
  background: radial-gradient(
    circle closest-side,
    color-mix(in srgb, var(--color-brand-lime) 38%, transparent) 0%,
    color-mix(in srgb, var(--color-brand-lime) 16%, transparent) 38%,
    color-mix(in srgb, var(--color-brand-lime) 3%, transparent) 68%,
    transparent 85%
  );
  animation: orbDrift 22s ease-in-out infinite alternate-reverse;
}

.ambient-mesh-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, color-mix(in srgb, var(--color-text-muted) 15%, transparent) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.35;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
}

@keyframes orbDrift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(25px, 20px, 0) scale(1.06); }
  100% { transform: translate3d(-15px, 35px, 0) scale(0.95); }
}

/* Page Layout Container */
.msg-workspace-container {
  position: relative;
  z-index: 1;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-4) var(--page-gutter) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Command Hero Header */
.msg-command-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.msg-hero-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-chip-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  background: var(--color-lavender);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
  border-radius: var(--radius-pill);
  color: var(--color-primary);
  font-size: var(--fs-label);
  font-weight: var(--fw-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: var(--transition);
}

.hero-refresh-btn:hover:not(:disabled) {
  background: var(--color-surface-subtle);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  color: var(--color-primary);
}

.hero-refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-loader {
  animation: spinRotate 0.8s linear infinite;
}

@keyframes spinRotate {
  to { transform: rotate(360deg); }
}

.msg-hero-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.msg-page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(24px, 3.2vw, 36px);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.highlight-lime {
  position: relative;
  display: inline-block;
  white-space: nowrap;
}

.highlight-lime::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 8px;
  background: var(--color-brand-lime);
  opacity: 0.65;
  border-radius: var(--radius-xs);
  z-index: -1;
}

.msg-page-subtitle {
  margin: 0;
  max-width: 68ch;
  color: var(--color-text-secondary);
  font-size: var(--fs-body);
  line-height: 1.5;
}

/* 4-Tile Bento Pipeline Grid */
.pipeline-bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.bento-stat-tile {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: var(--transition);
}

.bento-stat-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  border-color: color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
}

.bento-tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tile-icon-box {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tile-icon-box--primary {
  background: var(--color-lavender);
  color: var(--color-primary);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
}

.tile-icon-box--lime {
  background: var(--color-brand-lime-soft);
  color: var(--color-state-success-dark);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 40%, var(--color-border));
}

.tile-icon-box--pending {
  background: var(--color-state-pending-bg);
  color: var(--color-state-pending-dark);
  border: 1px solid color-mix(in srgb, var(--color-state-pending) 30%, transparent);
}

.tile-icon-box--neutral {
  background: var(--color-surface-subtle);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.tile-metric-value {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.tile-metric-value--text {
  font-size: 16px;
  font-weight: var(--fw-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.tile-meta-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tile-metric-label {
  font-size: var(--fs-label);
  font-weight: var(--fw-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tile-metric-caption {
  font-size: var(--fs-caption);
  color: var(--color-text-muted);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Zero Conversations Empty State */
.empty-pipeline-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  padding: clamp(36px, 6vw, 64px) var(--space-4);
  text-align: center;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  max-width: 760px;
  margin: var(--space-2) auto var(--space-4);
}

.empty-icon-orbit {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--color-lavender);
  border: 2px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(37, 52, 199, 0.12);
}

.empty-badge-pill {
  display: inline-flex;
  padding: 4px 12px;
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
  border-radius: var(--radius-pill);
  color: var(--color-state-success-dark);
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empty-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(20px, 2.5vw, 24px);
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.empty-description {
  margin: 0;
  max-width: 52ch;
  color: var(--color-text-secondary);
  font-size: var(--fs-body);
  line-height: 1.55;
}

.empty-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 8px;
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-button);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  text-decoration: none;
  transition: var(--transition);
  box-shadow: 0 4px 12px rgba(37, 52, 199, 0.22);
}

.btn-primary-action:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  text-decoration: none;
  transition: var(--transition);
}

.btn-secondary-action:hover {
  background: var(--color-surface-subtle);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
}

/* Messaging Console (Two-Panel Workspace) */
.msg-console-card {
  height: 680px;
  max-height: calc(100vh - 120px);
  min-height: 540px;
  display: grid;
  grid-template-columns: 360px 1fr;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

/* ============================================================
   LEFT PANEL: CONVERSATIONS SIDEBAR
   ============================================================ */
.msg-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  min-width: 0;
}

.msg-sidebar-head {
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.msg-sidebar-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.msg-sidebar-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.msg-sidebar-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  background: var(--color-lavender);
  color: var(--color-primary);
  font-size: var(--fs-caption);
  font-weight: var(--fw-bold);
  border-radius: var(--radius-pill);
}

.msg-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 8px);
  transition: var(--transition);
}

.msg-search-box:focus-within {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.msg-search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.msg-search-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--fs-body-sm);
  color: var(--color-text-primary);
}

.msg-conversations-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.msg-conv-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle);
  cursor: pointer;
  position: relative;
  transition: background-color 150ms ease;
  outline-offset: -2px;
}

.msg-conv-item:hover {
  background: var(--color-surface-subtle);
}

.msg-conv-item.is-active {
  background: var(--color-lavender);
  border-left: 3px solid var(--color-primary);
  padding-left: 15px;
}

.msg-avatar-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: var(--fw-bold);
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.msg-conv-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.msg-conv-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.msg-conv-title {
  font-size: 14px;
  font-weight: var(--fw-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-conv-time {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.msg-conv-subtitle {
  margin: 0;
  font-size: 12px;
  font-weight: var(--fw-medium);
  color: var(--color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-conv-preview {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.msg-unread-pill {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  background: var(--color-brand-lime);
  color: var(--color-text-primary);
  font-size: 11px;
  font-weight: var(--fw-bold);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.msg-no-results {
  padding: 32px 18px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--fs-body-sm);
}

/* ============================================================
   RIGHT PANEL: ACTIVE CHAT
   ============================================================ */
.msg-chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: var(--color-surface-subtle);
}

.msg-chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.msg-chat-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.msg-mobile-back-btn {
  display: none;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  color: var(--color-primary);
  font-family: var(--font-family);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  cursor: pointer;
}

.msg-chat-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: var(--fw-bold);
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: #ffffff;
}

.msg-chat-head-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.msg-chat-head-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.msg-chat-head-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-verified-pill {
  font-size: 10px;
  font-weight: var(--fw-bold);
  color: var(--color-state-success-dark);
  background: var(--color-brand-lime-soft);
  border: 1px solid color-mix(in srgb, var(--color-brand-lime) 45%, var(--color-border));
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.msg-chat-head-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-view-job-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: var(--fw-semibold);
  text-decoration: none;
  transition: var(--transition);
  white-space: nowrap;
}

.msg-view-job-btn:hover {
  background: var(--color-lavender);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
}

/* Stream scroll area */
.msg-stream-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  outline: none;
}

.msg-security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  font-size: 12px;
  margin: 0 auto 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}

.msg-security-notice svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.msg-message-row {
  display: flex;
  width: 100%;
}

.msg-message-row.is-mine {
  justify-content: flex-end;
}

.msg-message-row:not(.is-mine) {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: min(72%, 560px);
  padding: 12px 18px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Incoming */
.msg-message-row:not(.is-mine) .msg-bubble {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: 4px;
  color: var(--color-text-primary);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

/* Outgoing */
.msg-message-row.is-mine .msg-bubble {
  background: var(--color-primary);
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.msg-bubble-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.msg-bubble-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  align-self: flex-end;
}

.msg-bubble-time {
  font-size: 11px;
  opacity: 0.82;
}

.msg-check-read {
  color: var(--color-brand-lime);
}

.msg-empty-messages {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-muted);
  font-size: var(--fs-body-sm);
}

/* Quick Replies */
.msg-quick-replies-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-subtle);
  overflow-x: auto;
  white-space: nowrap;
}

.msg-quick-label {
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.msg-quick-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-family: var(--font-family);
  font-size: 12px;
  font-weight: var(--fw-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.msg-quick-chip:hover {
  background: var(--color-lavender);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  color: var(--color-primary);
}

/* Input Footer */
.msg-input-footer {
  padding: 14px 20px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.msg-input-form {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 4px 6px 4px 18px;
  transition: var(--transition);
}

.msg-input-form:focus-within {
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.msg-text-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-family);
  font-size: 14px;
  color: var(--color-text-primary);
}

.msg-text-input::placeholder {
  color: var(--color-text-muted);
}

.msg-btn-send {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-primary);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
  flex-shrink: 0;
}

.msg-btn-send:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.msg-btn-send:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

/* Placeholder State */
.msg-placeholder-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 32px;
  color: var(--color-text-secondary);
}

.msg-placeholder-icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--color-lavender);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(37, 52, 199, 0.1);
}

.msg-placeholder-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: var(--fw-bold);
  color: var(--color-text-primary);
}

.msg-placeholder-desc {
  margin: 0;
  max-width: 42ch;
  font-size: var(--fs-body-sm);
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1024px) {
  .pipeline-bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .msg-workspace-container {
    padding-top: var(--space-3);
  }

  .pipeline-bento-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .msg-console-card {
    grid-template-columns: 1fr;
    height: calc(100vh - 160px);
    min-height: 520px;
  }

  .msg-sidebar.is-mobile-hidden {
    display: none;
  }

  .msg-chat-panel.is-mobile-hidden {
    display: none;
  }

  .msg-mobile-back-btn {
    display: inline-flex;
  }

  .msg-bubble {
    max-width: 86%;
  }
}
</style>
