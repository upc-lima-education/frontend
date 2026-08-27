<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { messageService } from '../services/message.service';
import { ConversationResponse } from '../model/conversation.response';
import { MessageResponse } from '../model/message.response';
import {
  Search,
  Edit3,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  CheckCheck,
  MessageSquare,
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

// Mock sample demo conversations if backend is empty
const defaultDemoConversations: ConversationResponse[] = [
  {
    id: 'conv-1',
    title: 'Empresa ABC',
    subtitle: 'Atención al Cliente / Capacitación Pagada',
    lastMessage: 'Hola Mariana, revisamos tu perfil y nos gustaría invitarte a una entrevista.',
    lastMessageTime: '10:30 a.m.',
    unreadCount: 1,
    companyLogo: { initials: 'abc', bg: '#0F172A', color: '#FFFFFF' },
  } as unknown as ConversationResponse,
  {
    id: 'conv-2',
    title: 'TechCorp Solutions',
    subtitle: 'Asistente Administrativo',
    lastMessage: 'Gracias por tu interés, ¿Tienes disponibilidad para empezar la próxima semana?',
    lastMessageTime: 'Ayer',
    unreadCount: 0,
    companyLogo: { initials: 'tc', bg: '#4338CA', color: '#FFFFFF' },
  } as unknown as ConversationResponse,
  {
    id: 'conv-3',
    title: 'Distribuidora Progreso',
    subtitle: 'Operario de Almacén',
    lastMessage: 'Te invitamos a una entrevista técnica este jueves a las 3:00 p.m.',
    lastMessageTime: '2 días',
    unreadCount: 0,
    companyLogo: { initials: 'dp', bg: '#EA580C', color: '#FFFFFF' },
  } as unknown as ConversationResponse,
];

const defaultDemoMessages: Record<string, MessageResponse[]> = {
  'conv-1': [
    {
      id: 'm-1',
      userId: 'company-abc',
      conversationId: 'conv-1',
      content: 'Hola Mariana, revisamos tu perfil y nos gustaría invitarte a una entrevista.',
      sentAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: 'm-2',
      userId: 'user-me',
      conversationId: 'conv-1',
      content: '¡Hola! Muchas gracias, estaré atenta a los detalles.',
      sentAt: new Date(Date.now() - 1000 * 60 * 15),
    },
  ],
};

const quickReplies = [
  'Estoy disponible',
  '¿Qué horario sería?',
  'Gracias, confirmaré',
];

const filteredConversations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const list = conversations.value.length > 0 ? conversations.value : defaultDemoConversations;
  if (!query) return list;
  return list.filter((c) =>
    c.title.toLowerCase().includes(query) ||
    c.subtitle?.toLowerCase().includes(query)
  );
});

function selectConversation(conv: ConversationResponse) {
  currentConversation.value = conv;
  const demoList = defaultDemoMessages[conv.id];
  if (demoList && demoList.length > 0) {
    messages.value = [...demoList];
  } else {
    loadConversationDetails(conv.id);
  }
}

async function loadConversationDetails(convId: string) {
  try {
    const detail = await messageService.getConversationById(convId);
    messages.value = detail.messages || [];
  } catch (err) {
    console.error('Error loading conversation messages:', err);
    messages.value = [];
  }
}

function handleSend(text?: string) {
  const content = (text || inputMessage.value).trim();
  if (!content || !currentConversation.value) return;

  const newMsg: MessageResponse = {
    id: `msg-${Date.now()}`,
    conversationId: currentConversation.value.id,
    userId: userId.value || 'user-me',
    content,
    sentAt: new Date(),
  };

  messages.value.push(newMsg);
  inputMessage.value = '';

  // Attempt to send to backend service in background
  if (currentConversation.value.id.length > 10) {
    messageService.sendMessage(currentConversation.value.id, userId.value, content).catch((e) => {
      console.warn('Backend message save skipped or simulated:', e);
    });
  }
}

function formatTime(sentAtVal: Date | string): string {
  try {
    const d = typeof sentAtVal === 'string' ? new Date(sentAtVal) : sentAtVal;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '10:45 a.m.';
  }
}

onMounted(async () => {
  userId.value = authStore.currentUserId || 'user-me';
  loading.value = true;
  error.value = '';
  try {
    const list = await messageService.getConversationsForEmployee(userId.value);
    if (list && list.length > 0) {
      conversations.value = list;
      if (list[0]) selectConversation(list[0]);
    } else {
      conversations.value = defaultDemoConversations;
      if (defaultDemoConversations[0]) selectConversation(defaultDemoConversations[0]);
    }
  } catch (err) {
    console.error('Error loading conversations:', err);
    conversations.value = defaultDemoConversations;
    if (defaultDemoConversations[0]) selectConversation(defaultDemoConversations[0]);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="messaging-page">
    <div class="messaging-container">
      <!-- LEFT PANEL: Conversaciones -->
      <aside class="conversations-sidebar">
        <header class="conv-header">
          <div class="conv-header-top">
            <h2 class="conv-title">Conversaciones</h2>
            <button type="button" class="icon-btn-ghost" title="Nuevo mensaje">
              <Edit3 :size="18" />
            </button>
          </div>
          <div class="conv-search-wrap">
            <Search :size="15" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar mensajes..."
              class="search-input"
            />
          </div>
        </header>

        <div class="conv-list">
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="conv-item"
            :class="{ 'is-active': currentConversation?.id === conv.id }"
            @click="selectConversation(conv)"
          >
            <!-- Logo Box -->
            <div
              class="conv-logo-box"
              :style="{
                backgroundColor: (conv as any).companyLogo?.bg || '#0F172A',
                color: (conv as any).companyLogo?.color || '#FFFFFF',
              }"
            >
              {{ (conv as any).companyLogo?.initials || conv.title.slice(0, 2).toLowerCase() }}
            </div>

            <div class="conv-main-info">
              <div class="conv-row-top">
                <strong class="conv-name">{{ conv.title }}</strong>
                <span class="conv-time">{{ (conv as any).lastMessageTime || 'Hoy' }}</span>
              </div>
              <p class="conv-preview">{{ (conv as any).lastMessage || conv.subtitle }}</p>
            </div>

            <span v-if="conv.unreadCount && conv.unreadCount > 0" class="unread-dot"></span>
          </div>
        </div>

        <footer class="conv-footer">
          <button type="button" class="btn-all-convs">
            Ver todas las conversaciones
          </button>
        </footer>
      </aside>

      <!-- RIGHT PANEL: Active Chat -->
      <main class="chat-main-panel">
        <template v-if="currentConversation">
          <!-- Chat Header -->
          <header class="chat-header">
            <div class="chat-header-info">
              <div
                class="chat-header-logo"
                :style="{
                  backgroundColor: (currentConversation as any).companyLogo?.bg || '#0F172A',
                  color: (currentConversation as any).companyLogo?.color || '#FFFFFF',
                }"
              >
                {{ (currentConversation as any).companyLogo?.initials || currentConversation.title.slice(0, 2).toLowerCase() }}
              </div>
              <div>
                <h3 class="chat-title">{{ currentConversation.title }}</h3>
                <span class="chat-subtitle">{{ currentConversation.subtitle }}</span>
              </div>
            </div>

            <div class="chat-header-actions">
              <button type="button" class="icon-btn-ghost" title="Opciones">
                <MoreVertical :size="20" />
              </button>
            </div>
          </header>

          <!-- Messages Scroll Area -->
          <div class="messages-scroll-area">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-row"
              :class="{ 'is-mine': msg.userId === userId || msg.userId === 'user-me' }"
            >
              <div class="message-bubble">
                <p class="message-text">{{ msg.content }}</p>
                <div class="message-meta">
                  <span class="message-time">{{ formatTime(msg.sentAt) }}</span>
                  <CheckCheck
                    v-if="msg.userId === userId || msg.userId === 'user-me'"
                    :size="14"
                    class="read-check"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Reply Suggestion Chips -->
          <div class="quick-replies-bar">
            <button
              v-for="reply in quickReplies"
              :key="reply"
              type="button"
              class="quick-reply-chip"
              @click="handleSend(reply)"
            >
              {{ reply }}
            </button>
          </div>

          <!-- Chat Input Bar -->
          <footer class="chat-input-bar">
            <form class="chat-input-form" @submit.prevent="() => handleSend()">
              <input
                v-model="inputMessage"
                type="text"
                placeholder="Escribe un mensaje..."
                class="chat-text-input"
              />

              <div class="chat-input-actions">
                <button type="button" class="icon-btn-ghost" title="Emojis">
                  <Smile :size="20" />
                </button>
                <button type="button" class="icon-btn-ghost" title="Adjuntar">
                  <Paperclip :size="20" />
                </button>
                <button
                  type="submit"
                  class="btn-send-msg"
                  :disabled="!inputMessage.trim()"
                >
                  <Send :size="17" />
                </button>
              </div>
            </form>
          </footer>
        </template>

        <div v-else class="empty-chat-placeholder">
          <MessageSquare :size="48" class="empty-chat-icon" />
          <h3>Tus Conversaciones</h3>
          <p>Selecciona una conversación del panel izquierdo para comenzar a chatear.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.messaging-page {
  min-height: calc(100vh - 70px);
  width: 100%;
  background: var(--color-bg);
  padding: var(--space-3) 0 var(--space-4);
  font-family: var(--font-family);
}

.messaging-container {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--page-gutter);
  height: calc(100vh - 106px);
  display: grid;
  grid-template-columns: 360px 1fr;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

/* ============================================================
   LEFT PANEL: CONVERSATIONS
   ============================================================ */
.conversations-sidebar {
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-surface);
}

.conv-header {
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conv-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.conv-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.conv-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
}

.search-icon {
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--color-text-primary);
}

.conv-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.conv-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-subtle);
  cursor: pointer;
  position: relative;
  transition: background-color 150ms ease;
}

.conv-item:hover {
  background: var(--color-bg);
}

.conv-item.is-active {
  background: #F0F4FF;
}

.conv-logo-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}

.conv-main-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.conv-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.conv-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-time {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.conv-preview {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unread-dot {
  position: absolute;
  top: 18px;
  right: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-brand-lime);
  box-shadow: 0 0 0 2px #fff;
}

.conv-footer {
  padding: 12px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.btn-all-convs {
  background: transparent;
  border: none;
  color: #1E2BAA;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* ============================================================
   RIGHT PANEL: CHAT
   ============================================================ */
.chat-main-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FAFAFD;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-header-logo {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
}

.chat-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.chat-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.messages-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;
  width: 100%;
}

.message-row.is-mine {
  justify-content: flex-end;
}

.message-row:not(.is-mine) {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 65%;
  padding: 12px 18px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Incoming */
.message-row:not(.is-mine) .message-bubble {
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-bottom-left-radius: 4px;
  color: var(--color-text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Outgoing */
.message-row.is-mine .message-bubble {
  background: #1E2BAA;
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(30, 43, 170, 0.2);
}

.message-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: flex-end;
}

.message-time {
  font-size: 11px;
  opacity: 0.8;
}

.read-check {
  color: #C7F36B;
}

/* Quick Replies */
.quick-replies-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #FAFAFD;
  overflow-x: auto;
}

.quick-reply-chip {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  background: #EEF2FF;
  border: 1px solid #D0DBFF;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #1E2BAA;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms ease;
}

.quick-reply-chip:hover {
  background: #1E2BAA;
  color: #ffffff;
  border-color: #1E2BAA;
}

/* Chat Input Bar */
.chat-input-bar {
  padding: 12px 20px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.chat-input-form {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 4px 6px 4px 18px;
}

.chat-text-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--color-text-primary);
}

.chat-input-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn-ghost {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease;
}

.icon-btn-ghost:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #1E2BAA;
}

.btn-send-msg {
  width: 38px;
  height: 38px;
  border: none;
  background: #1E2BAA;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 2px 6px rgba(30, 43, 170, 0.25);
}

.btn-send-msg:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.btn-send-msg:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

.empty-chat-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 24px;
  color: var(--color-text-secondary);
}

.empty-chat-icon {
  color: #1E2BAA;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 768px) {
  .messaging-container {
    grid-template-columns: 1fr;
    height: calc(100vh - 86px);
  }

  .conversations-sidebar {
    display: none;
  }
}
</style>
