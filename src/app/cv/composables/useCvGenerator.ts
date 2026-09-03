import { onBeforeUnmount, ref } from 'vue';
import { cvService } from '@/app/cv/services/cv.service';

export type CvState = 'idle' | 'generating' | 'ready' | 'error';

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutos

/**
 * Cada ejecución crea una nueva versión mejorada con IA desde el perfil real
 * del candidato. El historial solo lista esas versiones para descargarlas o
 * eliminarlas; no modifica versiones previas desde esta interfaz.
 */
export function useCvGenerator() {
    const state = ref<CvState>('idle');
    const errorMessage = ref('');
    const errorStatus = ref<number | null>(null);
    const isCreditError = ref(false);
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
        errorStatus.value = null;
        isCreditError.value = false;
        state.value = 'idle';
    }

    function fail(message: string, status?: number) {
        stopPolling();
        errorMessage.value = message;
        errorStatus.value = status || null;
        const msgLower = message.toLowerCase();
        isCreditError.value = 
            status === 402 || 
            msgLower.includes('credit') || 
            msgLower.includes('crédit') || 
            msgLower.includes('saldo') || 
            msgLower.includes('pagar') ||
            msgLower.includes('paga') ||
            msgLower.includes('insuficiente');
        state.value = 'error';
    }

    async function generate(jobId?: string | null) {
        reset();
        state.value = 'generating';
        try {
            const res = await cvService.generate(jobId);
            cvId.value = res.cvId;
            pollCount = 0;
            schedulePoll();
        } catch (e: any) {
            fail(
                e?.response?.data?.detail || e?.response?.data?.message || 'No se pudo iniciar la generación del CV.',
                e?.response?.status,
            );
        }
    }

    function schedulePoll() {
        pollTimer = setTimeout(checkStatus, POLL_INTERVAL_MS);
    }

    async function checkStatus() {
        if (!cvId.value) return;
        try {
            // El contenido estructurado se crea de forma asíncrona. Cuando ya
            // existe, esta llamada solo lo convierte a PDF; no invoca la IA.
            await cvService.transformToPdf(cvId.value);
            const blob = await cvService.getFile(cvId.value);
            revokePreview();
            previewUrl.value = URL.createObjectURL(blob);
            state.value = 'ready';
            stopPolling();
            return;
        } catch (error: any) {
            if (error?.response?.status === 404 && ++pollCount < MAX_POLLS) {
                schedulePoll();
                return;
            }
            fail(
                pollCount >= MAX_POLLS
                    ? 'La generación está tardando demasiado. Revisa que RabbitMQ y OpenRouter estén disponibles e inténtalo nuevamente.'
                    : 'No se pudo recuperar el CV procesado.',
                error?.response?.status,
            );
        }
    }

    async function download() {
        if (!cvId.value) return;
        const blob = await cvService.getFile(cvId.value);
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

    return {
        state,
        errorMessage,
        isCreditError,
        previewUrl,
        generate,
        download,
        reset,
    };
}
