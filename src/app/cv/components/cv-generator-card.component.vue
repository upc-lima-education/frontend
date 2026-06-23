<script setup lang="ts">
import { ref } from 'vue';
import { Download, RotateCcw, AlertCircle } from 'lucide-vue-next';
import { useCvGenerator } from '@/app/cv/composables/useCvGenerator';

const { state, errorMessage, previewUrl, generate, download, reset } = useCvGenerator();
const prompt = ref('');
</script>

<template>
    <section class="cv-card">
        <header class="cv-head">
            <span class="ai-label">{{ $t('cv.aiLabel') }}</span>
            <h3 class="cv-title">{{ $t('cv.title') }}</h3>
            <p class="cv-subtitle">{{ $t('cv.subtitle') }}</p>
        </header>

        <div v-if="state === 'idle'" class="cv-body">
            <label class="field">
                <span class="field-label">{{ $t('cv.promptLabel') }}</span>
                <textarea v-model="prompt" class="field-input" rows="3" :placeholder="$t('cv.promptPlaceholder')"></textarea>
            </label>
            <button type="button" class="btn-primary" @click="generate(prompt)">{{ $t('cv.generate') }}</button>
        </div>

        <div v-else-if="state === 'generating'" class="cv-body cv-status">
            <p class="cv-status-text">{{ $t('cv.generating') }}</p>
            <p class="cv-status-hint">{{ $t('cv.generatingHint') }}</p>
        </div>

        <div v-else-if="state === 'ready'" class="cv-body">
            <div class="cv-preview">
                <embed v-if="previewUrl" :src="previewUrl" type="application/pdf" class="cv-preview-frame" />
            </div>
            <div class="cv-actions">
                <button type="button" class="btn-primary" @click="download">
                    <Download :size="20" :stroke-width="1.5" />
                    <span>{{ $t('cv.download') }}</span>
                </button>
                <button type="button" class="btn-secondary" @click="reset">
                    <RotateCcw :size="20" :stroke-width="1.5" />
                    <span>{{ $t('cv.regenerate') }}</span>
                </button>
            </div>
        </div>

        <div v-else class="cv-body cv-status">
            <p class="cv-error">
                <AlertCircle :size="20" :stroke-width="1.5" />
                <span>{{ errorMessage }}</span>
            </p>
            <button type="button" class="btn-secondary" @click="reset">{{ $t('cv.retry') }}</button>
        </div>
    </section>
</template>

<style scoped>
.cv-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-ai-bg);
    border: 1px solid var(--color-ai-outline);
    border-left: 3px solid var(--color-ai-border);
    border-radius: var(--radius-card);
}

.cv-head {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ai-label {
    font-size: 11px;
    font-weight: var(--fw-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-ai-label);
}

.cv-title {
    margin: 0;
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
}

.cv-subtitle {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-secondary);
}

.cv-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field-label {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    color: var(--color-text-secondary);
}

.field-input {
    width: 100%;
    padding: 10px 12px;
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    color: var(--color-text-primary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-input);
    resize: vertical;
    transition: var(--transition);
}

.field-input:focus {
    outline: none;
    border-color: var(--color-accent);
}

.field-input::placeholder {
    color: var(--color-text-muted);
}

.btn-primary,
.btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px var(--space-3);
    border-radius: var(--radius-button);
    font-family: var(--font-family);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    cursor: pointer;
    transition: var(--transition);
}

.btn-primary {
    background: var(--color-accent);
    color: #fff;
    border: 1px solid var(--color-accent);
}

.btn-primary:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
}

.btn-secondary {
    background: transparent;
    color: var(--color-accent);
    border: 1px solid var(--color-accent);
}

.btn-secondary:hover {
    background: var(--color-surface);
}

.cv-preview {
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1 / 1.414;
    margin: 0 auto;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-card);
    overflow: hidden;
}

.cv-preview-frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}

.cv-actions {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
}

.cv-status {
    align-items: flex-start;
}

.cv-status-text {
    margin: 0;
    font-size: var(--fs-body);
    font-weight: var(--fw-medium);
    color: var(--color-text-primary);
}

.cv-status-hint {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-text-muted);
}

.cv-error {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--color-state-error);
}
</style>
