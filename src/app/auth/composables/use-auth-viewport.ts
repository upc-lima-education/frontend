import { onBeforeUnmount, onMounted } from 'vue';

const AUTH_VIEWPORT_CLASS = 'auth-flow';

/**
 * Keeps authentication screens self-contained: they can scroll when content
 * genuinely exceeds the viewport without reserving a browser scrollbar.
 */
export function useAuthViewport() {
    onMounted(() => document.documentElement.classList.add(AUTH_VIEWPORT_CLASS));
    onBeforeUnmount(() => document.documentElement.classList.remove(AUTH_VIEWPORT_CLASS));
}
