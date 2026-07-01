<script setup lang="ts">
import { MessageCircle } from "lucide-vue-next";
</script>

<template>
    <div class="message-page">
        <div class="unavailable-state">
            <div class="unavailable-content">
                <div class="empty-icon-circle">
                    <MessageCircle :size="36" />
                </div>
                <h3>Mensajería próximamente</h3>
                <p>
                    Aún no puedes ver aquí tus conversaciones con empresas: el backend no expone todavía
                    un listado de conversaciones por candidato. Esta sección se activará en cuanto ese
                    endpoint esté disponible.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.message-page {
    width: 100%;
    height: calc(100vh - 65px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
}

.unavailable-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fc;
    padding: var(--space-4);
    text-align: center;
    height: 100%;
    width: 100%;
}

.unavailable-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    max-width: 420px;
}

.empty-icon-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--color-ai-bg);
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-ai-outline);
    box-shadow: var(--shadow-card);
}

.unavailable-content h3 {
    margin: 0;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.unavailable-content p {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
}
</style>
