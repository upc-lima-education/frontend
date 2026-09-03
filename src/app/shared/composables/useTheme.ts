import { ref, computed } from 'vue';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'llanqui-theme';

// Estado singleton reactivo compartido en toda la aplicación
const themePreference = ref<ThemePreference>('system');
const systemIsDark = ref(false);
let isInitialized = false;

export function useTheme() {
  // Tema efectivo resuelto ('light' o 'dark')
  const resolvedTheme = computed<ResolvedTheme>(() => {
    if (themePreference.value === 'system') {
      return systemIsDark.value ? 'dark' : 'light';
    }
    return themePreference.value;
  });

  const isDark = computed(() => resolvedTheme.value === 'dark');

  function applyThemeToDOM(theme: ResolvedTheme) {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.colorScheme = 'light';
    }
  }

  function setTheme(preference: ThemePreference) {
    themePreference.value = preference;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch (e) {
      console.warn('No se pudo guardar la preferencia de tema en localStorage', e);
    }
    applyThemeToDOM(resolvedTheme.value);
  }

  function toggleTheme() {
    // Alternancia rápida para el botón del Navbar
    if (resolvedTheme.value === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  function initTheme() {
    if (isInitialized || typeof window === 'undefined') return;
    isInitialized = true;

    // 1. Cargar preferencia guardada en cliente
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        themePreference.value = stored;
      } else {
        themePreference.value = 'system';
      }
    } catch {
      themePreference.value = 'system';
    }

    // 2. Escuchar cambios de preferencia del sistema operativo en tiempo real
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemIsDark.value = mediaQuery.matches;

    const handleSystemChange = (e: MediaQueryListEvent) => {
      systemIsDark.value = e.matches;
      if (themePreference.value === 'system') {
        applyThemeToDOM(systemIsDark.value ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else {
      mediaQuery.addListener(handleSystemChange);
    }

    // 3. Sincronizar DOM inicial
    applyThemeToDOM(resolvedTheme.value);
  }

  return {
    themePreference,
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
    initTheme,
  };
}
