import { unref, watch, type Ref, type MaybeRef } from 'vue';
import { RecommendationService } from '../services/recommendation.service';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';

const recommendationService = new RecommendationService();
const trackedJobViews = new Set<string>();

/**
 * Composable para registrar automáticamente una visualización ('View')
 * de una oferta de empleo para el modelo colaborativo (ALS).
 * 
 * Cumple con las reglas del backend:
 * 1. Solo candidatos autenticados registran interacción.
 * 2. Previene duplicaciones en la sesión frontend.
 */
export function useTrackJobView(jobId: MaybeRef<string | undefined>) {
    const auth = useAuthenticationStore();

    function track(id?: string) {
        if (!id || trackedJobViews.has(id)) return;

        // Solo candidatos (no organizaciones/empresas) pueden registrar interacciones
        const isCandidate = auth.signedIn && auth.currentUserType !== 'organization';
        if (!isCandidate) return;

        trackedJobViews.add(id);
        void recommendationService.createJobInteraction(id, 'View');
    }

    watch(
        () => unref(jobId),
        (newId) => {
            if (newId) {
                track(newId);
            }
        },
        { immediate: true },
    );

    return {
        track,
    };
}
