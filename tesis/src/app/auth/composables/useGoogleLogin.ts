import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AuthenticationService } from '@/app/auth/services/authentication.service';

export type GoogleLoginProps = {
    /** If it returns false, the redirect to Google is cancelled (e.g. validation). */
    prepareRedirect?: () => boolean | void;
    labelKey?: string;
    /** Sent as GET /auth/google/url?userType=… so the backend can put it in OAuth state. */
    userType?: 'employee' | 'organization';
};

export function useGoogleLogin(props: GoogleLoginProps) {
    const { t } = useI18n();
    const authService = new AuthenticationService();
    const loading = ref(false);
    const error = ref('');

    const buttonLabel = computed(() => {
        if (loading.value) {
            return t('auth.googleConnecting');
        }
        return t(props.labelKey || 'auth.continueWithGoogle');
    });

    async function handleGoogleLogin() {
        if (props.prepareRedirect) {
            const ok = props.prepareRedirect();
            if (ok === false) {
                return;
            }
        }

        loading.value = true;
        error.value = '';

        try {
            const url = await authService.getGoogleAuthUrl(
                props.userType ? { userType: props.userType } : undefined
            );
            window.location.href = url;
        } catch (err) {
            console.error('Google login error:', err);
            error.value = t('auth.googleError');
            loading.value = false;
        }
    }

    return {
        loading,
        error,
        buttonLabel,
        handleGoogleLogin,
    };
}
