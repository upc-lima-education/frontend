<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

export interface ParticlesProps {
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
  dpr?: number;
}

const props = withDefaults(defineProps<ParticlesProps>(), {
  quantity: 350,
  staticity: 50,
  ease: 50,
  size: 1.2,
  refresh: false,
  color: '#ffffff',
  vx: 0,
  vy: 0,
  dpr: undefined,
});

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainerRef = ref<HTMLDivElement | null>(null);
let context: CanvasRenderingContext2D | null = null;
let circles: Circle[] = [];
const mouse = { x: 0, y: 0 };
const canvasSize = { w: 0, h: 0 };
let rafID: number | null = null;
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

const getDpr = (): number => {
  if (props.dpr && props.dpr > 0) {
    return props.dpr;
  }
  if (typeof window !== 'undefined') {
    return Math.max(window.devicePixelRatio || 1, 2);
  }
  return 2;
};

function hexToRgb(hex: string): number[] {
  let cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const hexInt = parseInt(cleanHex, 16);
  if (Number.isNaN(hexInt)) {
    return [255, 255, 255];
  }
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

const rgb = computed(() => hexToRgb(props.color));

const circleParams = (fromCenter = false): Circle => {
  const w = canvasSize.w || window.innerWidth || 1000;
  const h = canvasSize.h || window.innerHeight || 800;

  let x: number;
  let y: number;

  if (fromCenter) {
    // Al reaparecer, nacen en el área central y viajan hacia los lados
    x = Math.floor(w * 0.35 + Math.random() * (w * 0.3));
    y = Math.floor(h * 0.15 + Math.random() * (h * 0.7));
  } else {
    // Distribución inicial en todo el lienzo
    x = Math.floor(Math.random() * w);
    y = Math.floor(Math.random() * h);
  }

  // Dirección hacia afuera: izquierda o derecha desde el centro
  const dirX = x <= w / 2 ? -1 : 1;
  const speedX = Math.random() * 0.22 + 0.06;
  const dx = dirX * speedX;
  const dy = (Math.random() - 0.5) * 0.2;

  const translateX = 0;
  const translateY = 0;
  const pSize = parseFloat((Math.random() * 2 + props.size).toFixed(1));
  const alpha = 0;
  const targetAlpha = parseFloat((Math.random() * 0.45 + 0.45).toFixed(2));
  const magnetism = 0.1 + Math.random() * 3;

  return {
    x,
    y,
    translateX,
    translateY,
    size: pSize,
    alpha,
    targetAlpha,
    dx,
    dy,
    magnetism,
  };
};

const drawCircle = (circle: Circle, update = false) => {
  if (context) {
    const dpr = getDpr();
    const { x, y, translateX, translateY, size, alpha } = circle;
    context.translate(translateX, translateY);
    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI);
    context.fillStyle = `rgba(${rgb.value.join(', ')}, ${alpha})`;
    context.fill();
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!update) {
      circles.push(circle);
    }
  }
};

const clearContext = () => {
  if (context) {
    context.clearRect(0, 0, canvasSize.w, canvasSize.h);
  }
};

const drawParticles = () => {
  clearContext();
  const particleCount = props.quantity;
  circles = [];
  for (let i = 0; i < particleCount; i++) {
    const circle = circleParams();
    drawCircle(circle);
  }
};

const remapValue = (
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number
): number => {
  const remapped =
    ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
  return remapped > 0 ? remapped : 0;
};

const animate = () => {
  clearContext();
  circles.forEach((circle: Circle, i: number) => {
    // Handle the alpha value
    const edge = [
      circle.x + circle.translateX - circle.size, // distance from left edge
      canvasSize.w - circle.x - circle.translateX - circle.size, // distance from right edge
      circle.y + circle.translateY - circle.size, // distance from top edge
      canvasSize.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
    ];
    const closestEdge = edge.reduce((a, b) => Math.min(a, b));
    const remapClosestEdge = parseFloat(
      remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
    );
    if (remapClosestEdge > 1) {
      circle.alpha += 0.02;
      if (circle.alpha > circle.targetAlpha) {
        circle.alpha = circle.targetAlpha;
      }
    } else {
      circle.alpha = circle.targetAlpha * remapClosestEdge;
    }
    circle.x += circle.dx + props.vx;
    circle.y += circle.dy + props.vy;
    circle.translateX +=
      (mouse.x / (props.staticity / circle.magnetism) - circle.translateX) /
      props.ease;
    circle.translateY +=
      (mouse.y / (props.staticity / circle.magnetism) - circle.translateY) /
      props.ease;

    drawCircle(circle, true);

    // circle gets out of the canvas
    if (
      circle.x < -circle.size ||
      circle.x > canvasSize.w + circle.size ||
      circle.y < -circle.size ||
      circle.y > canvasSize.h + circle.size
    ) {
      // remove the circle from the array
      circles.splice(i, 1);
      // create a new circle originating from center
      const newCircle = circleParams(true);
      drawCircle(newCircle);
    }
  });
  rafID = window.requestAnimationFrame(animate);
};

const resizeCanvas = () => {
  if (canvasContainerRef.value && canvasRef.value && context) {
    const dpr = getDpr();
    canvasSize.w = canvasContainerRef.value.offsetWidth;
    canvasSize.h = canvasContainerRef.value.offsetHeight;

    canvasRef.value.width = canvasSize.w * dpr;
    canvasRef.value.height = canvasSize.h * dpr;
    canvasRef.value.style.width = `${canvasSize.w}px`;
    canvasRef.value.style.height = `${canvasSize.h}px`;
    context.scale(dpr, dpr);

    circles = [];
    for (let i = 0; i < props.quantity; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  }
};

const onMouseMove = (event: MouseEvent) => {
  if (canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect();
    const { w, h } = canvasSize;
    const x = event.clientX - rect.left - w / 2;
    const y = event.clientY - rect.top - h / 2;
    const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
    if (inside) {
      mouse.x = x;
      mouse.y = y;
    }
  }
};

const initCanvas = () => {
  resizeCanvas();
  drawParticles();
};

const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    initCanvas();
  }, 200);
};

onMounted(() => {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d');
  }
  initCanvas();
  animate();

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
});

onBeforeUnmount(() => {
  if (rafID !== null) {
    window.cancelAnimationFrame(rafID);
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', onMouseMove);
});

watch(() => props.refresh, () => {
  initCanvas();
});

watch(() => props.quantity, () => {
  initCanvas();
});

watch(() => props.dpr, () => {
  initCanvas();
});
</script>

<template>
  <div ref="canvasContainerRef" class="particles-container" aria-hidden="true">
    <canvas ref="canvasRef" class="particles-canvas" />
  </div>
</template>

<style scoped>
.particles-container {
  pointer-events: none;
  width: 100%;
  height: 100%;
}

.particles-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
