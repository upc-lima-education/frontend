import { onBeforeUnmount, ref } from 'vue';
import { cvService } from '@/app/cv/services/cv.service';

export type CvState = 'idle' | 'generating' | 'ready' | 'error';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutos

/**
 * Orquesta la generación asíncrona del CV: lanza la generación, hace polling
 * acotado al estado, y expone la URL de preview y la descarga. Limpia los
 * object URLs y el timer al desmontar.
 */
export function useCvGenerator() {
    const state = ref<CvState>('idle');
    const errorMessage = ref('');
    const cvId = ref<string | null>(null);
    const previewUrl = ref<string | null>(null);

    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let pollCount = 0;

    function stopPolling() {
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }
    }

    function revokePreview() {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
            previewUrl.value = null;
        }
    }

    function reset() {
        stopPolling();
        revokePreview();
        cvId.value = null;
        errorMessage.value = '';
        state.value = 'idle';
    }

    function fail(message: string) {
        stopPolling();
        errorMessage.value = message;
        state.value = 'error';
    }

    async function generate(prompt?: string) {
        reset();
        state.value = 'generating';
        try {
            const res = await cvService.generate({ prompt: prompt?.trim() || null });
            cvId.value = res.cvGenerationId;
            pollCount = 0;
            schedulePoll();
        } catch (e: any) {
            fail(e?.response?.data?.message || 'No se pudo iniciar la generación del CV.');
        }
    }

    function schedulePoll() {
        pollTimer = setTimeout(checkStatus, POLL_INTERVAL_MS);
    }

    async function checkStatus() {
        if (!cvId.value) return;
        try {
            const s = await cvService.getStatus(cvId.value);
            const status = (s.status || '').toLowerCase();

            if (s.errorMessage || status.includes('fail') || status.includes('error')) {
                return fail(s.errorMessage || 'La generación del CV falló.');
            }
            if (s.hasPdf || ['complete', 'done', 'ready', 'success'].some((k) => status.includes(k))) {
                return loadPreview();
            }
            if (++pollCount >= MAX_POLLS) {
                return fail('La generación está tardando demasiado. Inténtalo de nuevo.');
            }
            schedulePoll();
        } catch {
            fail('Error consultando el estado del CV.');
        }
    }

    async function loadPreview() {
        if (!cvId.value) return;
        try {
            const blob = await cvService.getPreviewBlob(cvId.value);
            revokePreview();
            previewUrl.value = URL.createObjectURL(blob);
            state.value = 'ready';
        } catch {
            fail('El CV se generó, pero no se pudo cargar la vista previa.');
        }
    }

    async function download() {
        if (!cvId.value) return;
        const blob = await cvService.getDownloadBlob(cvId.value);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${cvId.value}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    onBeforeUnmount(() => {
        stopPolling();
        revokePreview();
    });

    return { state, errorMessage, previewUrl, generate, download, reset };
}
