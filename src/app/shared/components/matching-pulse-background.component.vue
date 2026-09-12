<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Control de preferencia de movimiento reducido (prefers-reduced-motion y configuración manual)
const isReducedMotion = ref(false);

function checkMotionPreference() {
  if (typeof window === 'undefined') return;
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const manualReduced = localStorage.getItem('llanqui-reduced-motion') === 'true'
    || document.documentElement.getAttribute('data-reduced-motion') === 'true';
  isReducedMotion.value = mediaQuery.matches || manualReduced;
}

let mql: MediaQueryList | null = null;
const handleMqlChange = (e: MediaQueryListEvent) => {
  const manualReduced = localStorage.getItem('llanqui-reduced-motion') === 'true'
    || document.documentElement.getAttribute('data-reduced-motion') === 'true';
  isReducedMotion.value = e.matches || manualReduced;
};

onMounted(() => {
  checkMotionPreference();
  if (typeof window !== 'undefined') {
    mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.addEventListener) {
      mql.addEventListener('change', handleMqlChange);
    } else {
      mql.addListener(handleMqlChange);
    }
  }
});

onUnmounted(() => {
  if (mql) {
    if (mql.removeEventListener) {
      mql.removeEventListener('change', handleMqlChange);
    } else {
      mql.removeListener(handleMqlChange);
    }
  }
});
</script>

<template>
  <div
    class="matching-pulse-bg"
    :class="{ 'is-reduced-motion': isReducedMotion }"
    aria-hidden="true"
  >
    <svg
      class="matching-pulse-svg"
      viewBox="0 0 1440 680"
      fill="none"
      preserveAspectRatio="none"
    >
      <defs>
        <!-- Halo suave: suficiente presencia sin competir con la interfaz. -->
        <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feGaussianBlur stdDeviation="2" result="sharpGlow" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="sharpGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- El color se desvanece dentro de cada curva: no hay corte artificial en el centro. -->
        <!-- Gradiente Pulso Central Izquierdo: Azul #3B82F6 a Verde Limón Llanqui #B9EF4A -->
        <linearGradient id="pulseGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#4F62F6" stop-opacity="0" />
          <stop offset="22%" stop-color="#4F62F6" stop-opacity="0.94" />
          <stop offset="48%" stop-color="#22D3EE" stop-opacity="1" />
          <stop offset="72%" stop-color="#B9EF4A" stop-opacity="0.98" />
          <stop offset="90%" stop-color="#B9EF4A" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#B9EF4A" stop-opacity="0" />
        </linearGradient>

        <!-- 4. Gradiente Pulso Central Derecho: Reflejado (Fade-out hacia el centro) -->
        <linearGradient id="pulseGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#4F62F6" stop-opacity="0" />
          <stop offset="22%" stop-color="#4F62F6" stop-opacity="0.94" />
          <stop offset="48%" stop-color="#22D3EE" stop-opacity="1" />
          <stop offset="72%" stop-color="#B9EF4A" stop-opacity="0.98" />
          <stop offset="90%" stop-color="#B9EF4A" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#B9EF4A" stop-opacity="0" />
        </linearGradient>

        <!-- 5. Gradiente Curva Superior Izquierda: Tono Violeta/Índigo #6366F1 translúcido -->
        <linearGradient id="topGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366F1" stop-opacity="0.1" />
          <stop offset="25%" stop-color="#6975FF" stop-opacity="0.74" />
          <stop offset="70%" stop-color="#4F62F6" stop-opacity="0.48" />
          <stop offset="100%" stop-color="#4F46E5" stop-opacity="0" />
        </linearGradient>

        <!-- 6. Gradiente Curva Superior Derecha: Reflejado -->
        <linearGradient id="topGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#6366F1" stop-opacity="0.1" />
          <stop offset="25%" stop-color="#6975FF" stop-opacity="0.74" />
          <stop offset="70%" stop-color="#4F62F6" stop-opacity="0.48" />
          <stop offset="100%" stop-color="#4F46E5" stop-opacity="0" />
        </linearGradient>

        <!-- 7. Gradiente Curva Inferior Izquierda: Azul Eléctrico #3B82F6 -->
        <linearGradient id="bottomGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.1" />
          <stop offset="25%" stop-color="#3B82F6" stop-opacity="0.72" />
          <stop offset="75%" stop-color="#22D3EE" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#00D2FF" stop-opacity="0" />
        </linearGradient>

        <!-- 8. Gradiente Curva Inferior Derecha: Reflejado -->
        <linearGradient id="bottomGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.1" />
          <stop offset="25%" stop-color="#3B82F6" stop-opacity="0.72" />
          <stop offset="75%" stop-color="#22D3EE" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#00D2FF" stop-opacity="0" />
        </linearGradient>

      </defs>

      <!-- Las rutas viven en los laterales y se pierden de forma natural hacia el centro. -->
      <g class="pulse-waves-group">
        <!-- ================= ONDAS LATERALES IZQUIERDAS ================= -->
        <!-- Curva Superior Izquierda: Trazo fino (1px a 1.5px), violeta/índigo translúcido -->
        <g class="pulse-wave-item pulse-wave-item--top">
          <path
            class="wave-path wave-path--carrier wave-path--top"
            d="M-60,136 C92,146 170,278 290,370 C388,445 456,478 550,506"
            stroke="url(#topGradLeft)"
          />
          <path
            v-if="!isReducedMotion"
            class="wave-path wave-path--pulse wave-path--pulse-top-left"
            d="M-60,136 C92,146 170,278 290,370 C388,445 456,478 550,506"
            stroke="url(#topGradLeft)"
            pathLength="1000"
          />
        </g>

        <!-- Curva Central Izquierda (Núcleo del Pulso): 2.5px - 3px, degradado turquesa a verde limón #B9EF4A, halo difuminado -->
        <g class="pulse-wave-item pulse-wave-item--core">
          <path
            class="wave-path wave-path--carrier-core"
            d="M-60,184 C106,196 192,332 320,432 C412,504 480,528 574,548"
            stroke="url(#pulseGradLeft)"
            filter="url(#pulseGlow)"
          />
          <path
            v-if="!isReducedMotion"
            class="wave-path wave-path--pulse-core wave-path--pulse-core-left"
            d="M-60,184 C106,196 192,332 320,432 C412,504 480,528 574,548"
            stroke="url(#pulseGradLeft)"
            filter="url(#pulseGlow)"
            pathLength="1000"
          />
        </g>

        <!-- Curva Inferior Izquierda: Trazo fino (1.5px), azul eléctrico #3B82F6 -->
        <g class="pulse-wave-item pulse-wave-item--bottom">
          <path
            class="wave-path wave-path--carrier wave-path--bottom"
            d="M-60,230 C118,244 216,386 348,478 C438,538 502,552 600,568"
            stroke="url(#bottomGradLeft)"
          />
          <path
            v-if="!isReducedMotion"
            class="wave-path wave-path--pulse wave-path--pulse-bottom-left"
            d="M-60,230 C118,244 216,386 348,478 C438,538 502,552 600,568"
            stroke="url(#bottomGradLeft)"
            pathLength="1000"
          />
        </g>

        <!-- ================= ONDAS LATERALES DERECHAS (REFLEJADAS) ================= -->
        <!-- Curva Superior Derecha: Trazo fino (1px a 1.5px), violeta/índigo translúcido -->
        <g class="pulse-wave-item pulse-wave-item--top">
          <path
            class="wave-path wave-path--carrier wave-path--top"
            d="M1500,136 C1348,146 1270,278 1150,370 C1052,445 984,478 890,506"
            stroke="url(#topGradRight)"
          />
          <path
            v-if="!isReducedMotion"
            class="wave-path wave-path--pulse wave-path--pulse-top-right"
            d="M1500,136 C1348,146 1270,278 1150,370 C1052,445 984,478 890,506"
            stroke="url(#topGradRight)"
            pathLength="1000"
          />
        </g>

        <!-- Curva Central Derecha (Núcleo del Pulso): 2.5px - 3px, degradado turquesa a verde limón #B9EF4A, halo difuminado -->
        <g class="pulse-wave-item pulse-wave-item--core">
          <path
            class="wave-path wave-path--carrier-core"
            d="M1500,184 C1334,196 1248,332 1120,432 C1028,504 960,528 866,548"
            stroke="url(#pulseGradRight)"
            filter="url(#pulseGlow)"
          />
          <path
            v-if="!isReducedMotion"
            class="wave-path wave-path--pulse-core wave-path--pulse-core-right"
            d="M1500,184 C1334,196 1248,332 1120,432 C1028,504 960,528 866,548"
            stroke="url(#pulseGradRight)"
            filter="url(#pulseGlow)"
            pathLength="1000"
          />
        </g>

        <!-- Curva Inferior Derecha: Trazo fino (1.5px), azul eléctrico #3B82F6 -->
        <g class="pulse-wave-item pulse-wave-item--bottom">
          <path
            class="wave-path wave-path--carrier wave-path--bottom"
            d="M1500,230 C1322,244 1224,386 1092,478 C1002,538 938,552 840,568"
            stroke="url(#bottomGradRight)"
          />
          <path
            v-if="!isReducedMotion"
            class="wave-path wave-path--pulse wave-path--pulse-bottom-right"
            d="M1500,230 C1322,244 1224,386 1092,478 C1002,538 938,552 840,568"
            stroke="url(#bottomGradRight)"
            pathLength="1000"
          />
        </g>

      </g>

    </svg>
  </div>
</template>

<style scoped>
/* ============================================================
   1. COMPOSICIÓN Y POSICIÓN (Fijo, pantalla completa, z-index -1)
   ============================================================ */
.matching-pulse-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
  contain: strict;
  transform: translateZ(0);
  background: linear-gradient(180deg, #f8faff 0%, #f4f7fc 58%, #eaf1fa 100%);
  transition: background 300ms ease;
}

html[data-theme="dark"] .matching-pulse-bg {
  /* Profundidad vertical continua: evita que el pie se perciba como un vacío. */
  background: linear-gradient(180deg, #081120 0%, #0a1628 56%, #102844 100%);
}

.matching-pulse-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

/* ============================================================
   2. ANATOMÍA DE LAS ONDAS Y REGLAS DE TRAZO
   ============================================================ */
.wave-path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ── MODO CLARO (Default): Opacidad 35%–45%, trazos reducidos ── */
.pulse-waves-group {
  opacity: 0.54;
  transition: opacity 300ms ease;
}

/* Curva Superior (Violeta / Índigo) */
.wave-path--top {
  stroke-width: 1.1px;
}

/* Curva central: el único pulso protagonista. */
.wave-path--carrier-core {
  stroke-width: 2.2px;
}

.wave-path--pulse-core {
  stroke-width: 2.4px;
}

/* Curva Inferior (Azul Eléctrico) */
.wave-path--bottom {
  stroke-width: 1.2px;
}

/* Pulso viajero secundario */
.wave-path--pulse {
  display: none;
}

/* Un solo pulso viajero, lento y sutil. */
.wave-path--pulse-core {
  stroke-dasharray: 240 760;
  will-change: stroke-dashoffset;
}

/* ── MODO OSCURO (html[data-theme="dark"]): Contrastes calibrados ── */
html[data-theme="dark"] .pulse-waves-group {
  opacity: 0.82;
}

html[data-theme="dark"] .wave-path--top {
  stroke-width: 1.5px;
}

html[data-theme="dark"] .wave-path--carrier-core {
  stroke-width: 2.65px;
}

html[data-theme="dark"] .wave-path--pulse-core {
  stroke-width: 2.85px;
}

html[data-theme="dark"] .wave-path--bottom {
  stroke-width: 1.5px;
}

html[data-theme="dark"] .wave-path--pulse {
  stroke-width: 1.5px;
}

/* ============================================================
   3. DINÁMICA Y RENDIMIENTO (Ciclo ultra lento y elegante de 12s a 16s)
   ============================================================ */
.wave-path--pulse-core-left {
  animation: pulseTravelLeft 14s linear infinite;
}

.wave-path--pulse-core-right {
  animation: pulseTravelRight 14s linear infinite;
}

@keyframes pulseTravelLeft {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes pulseTravelRight {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* ============================================================
   4. RESPONSIVE (< 768px): misma composición, con contraste legible
   ============================================================ */
@media (max-width: 768px) {
  .pulse-waves-group {
    opacity: 0.68 !important;
    transform: scale(0.98);
    transform-origin: center center;
  }

  html[data-theme="dark"] .pulse-waves-group {
    opacity: 0.9 !important;
  }

  html[data-theme="dark"] .wave-path--carrier-core {
    stroke-width: 3px;
  }

  html[data-theme="dark"] .wave-path--pulse-core {
    stroke-width: 3.2px;
  }
}

/* ============================================================
   5. ACCESIBILIDAD Y REDUCED MOTION (prefers-reduced-motion)
   Pausa completamente la animación si el usuario lo solicita
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .wave-path--pulse,
  .wave-path--pulse-core {
    animation: none !important;
    stroke-dasharray: none !important;
    display: none !important;
  }

  .wave-path--carrier,
  .wave-path--carrier-core {
    opacity: 0.6 !important;
  }
}

.is-reduced-motion .wave-path--pulse,
.is-reduced-motion .wave-path--pulse-core,
:global([data-reduced-motion="true"]) .wave-path--pulse,
:global([data-reduced-motion="true"]) .wave-path--pulse-core {
  animation: none !important;
  stroke-dasharray: none !important;
  display: none !important;
}

.is-reduced-motion .wave-path--carrier,
.is-reduced-motion .wave-path--carrier-core,
:global([data-reduced-motion="true"]) .wave-path--carrier,
:global([data-reduced-motion="true"]) .wave-path--carrier-core {
  opacity: 0.6 !important;
}
</style>
