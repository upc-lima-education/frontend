<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

interface Props {
  particleCount?: number;
  magneticRadius?: number;
  vortexStrength?: number;
  pullStrength?: number;
  palette?: 'llanqui' | 'asmr' | 'green';
}

const props = withDefaults(defineProps<Props>(), {
  particleCount: 0, // 0 = auto-calculate based on screen width (mobile: ~16, desktop: ~34)
  magneticRadius: 190,
  vortexStrength: 0.07,
  pullStrength: 0.11,
  palette: 'green',
});

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

let animationFrameId: number | null = null;
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let isVisible = true;
let lastFrameTime = 0;

const mouse = { x: -1000, y: -1000, active: false };

class Particle {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  baseSize = 0;
  size = 0;
  alpha = 0;
  color = '';
  strokeColor = '';
  rotation = 0;
  rotationSpeed = 0;
  frictionGlow = 0;
  width = 0;
  height = 0;
  driftAngle = 0;
  driftSpeed = 0;
  palette: 'llanqui' | 'asmr' | 'green';

  constructor(w: number, h: number, palette: 'llanqui' | 'asmr' | 'green') {
    this.width = w;
    this.height = h;
    this.palette = palette;
    this.reset(true);
  }

  reset(randomInit = false) {
    this.x = Math.random() * this.width;
    this.y = randomInit ? Math.random() * this.height : Math.random() * this.height;

    // Generous size for clear visibility on both light & gradient backgrounds
    this.baseSize = Math.random() * 2.2 + 1.8;
    this.size = this.baseSize;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.driftAngle = Math.random() * Math.PI * 2;
    this.driftSpeed = Math.random() * 0.02 + 0.01;

    if (this.palette === 'green') {
      const rand = Math.random();
      if (rand < 0.55) {
        // Official Llanqui Brand Lime #B9EF4A - Vibrant & Glowing
        this.color = '185, 239, 74';
        this.strokeColor = '120, 175, 20';
      } else if (rand < 0.85) {
        // Deep contrast lime #65a30d - High contrast against white cards
        this.color = '101, 163, 13';
        this.strokeColor = '185, 239, 74';
      } else {
        // Emerald Mint #34d399 - Luminous jewel sparkle
        this.color = '52, 211, 153';
        this.strokeColor = '16, 185, 129';
      }
    } else if (this.palette === 'llanqui') {
      const rand = Math.random();
      if (rand < 0.42) {
        // Bright Lime Green diamond shard (#B9EF4A)
        this.color = '185, 239, 74';
        this.strokeColor = '130, 190, 25';
      } else if (rand < 0.78) {
        // Vibrant Electric Blue diamond shard (#4D7CFF)
        this.color = '77, 124, 255';
        this.strokeColor = '37, 75, 240';
      } else {
        // Crisp Icy White / Diamond Sparkle (#F0F6FF)
        this.color = '240, 246, 255';
        this.strokeColor = '160, 195, 255';
      }
    } else {
      const isGlass = Math.random() > 0.7;
      this.color = isGlass ? '240, 245, 255' : '90, 95, 110';
      this.strokeColor = isGlass ? '180, 200, 230' : '50, 55, 65';
    }

    // High baseline opacity so particles are immediately visible
    this.alpha = Math.random() * 0.2 + 0.75;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.frictionGlow = 0;
  }

  update(
    mouseX: number,
    mouseY: number,
    mouseActive: boolean,
    magneticRadius: number,
    pullStrength: number,
    vortexStrength: number,
    w: number,
    h: number,
    dt: number
  ) {
    this.width = w;
    this.height = h;

    // 1. Autonomous Organic Floating Drift
    this.driftAngle += this.driftSpeed * dt;
    this.vx += Math.cos(this.driftAngle) * 0.035 * dt;
    this.vy += Math.sin(this.driftAngle) * 0.035 * dt;

    // 2. Interactive Magnetic Vortex (on mouse or touch near particle)
    if (mouseActive) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distSq = dx * dx + dy * dy;
      const magRadSq = magneticRadius * magneticRadius;

      if (distSq < magRadSq && distSq > 1) {
        const dist = Math.sqrt(distSq);
        const force = (magneticRadius - dist) / magneticRadius;

        // Centripetal magnetic pull
        this.vx += (dx / dist) * force * pullStrength * dt;
        this.vy += (dy / dist) * force * pullStrength * dt;

        // Swirl vortex motion
        this.vx += (dy / dist) * force * vortexStrength * 10 * dt;
        this.vy -= (dx / dist) * force * vortexStrength * 10 * dt;

        // High kinetic glow on acceleration
        this.frictionGlow = Math.min(this.frictionGlow + force * 0.35 * dt, 1.0);
      } else {
        this.frictionGlow *= Math.pow(0.92, dt);
      }
    } else {
      this.frictionGlow *= Math.pow(0.94, dt);
    }

    // Apply velocity scaled by delta time
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Friction damping
    const damping = Math.pow(0.96, dt);
    this.vx *= damping;
    this.vy *= damping;

    // Spin
    this.rotation += (this.rotationSpeed + (Math.abs(this.vx) + Math.abs(this.vy)) * 0.04) * dt;

    // Screen boundary wrap
    const pad = 24;
    if (this.x < -pad) this.x = this.width + pad;
    if (this.x > this.width + pad) this.x = -pad;
    if (this.y < -pad) this.y = this.height + pad;
    if (this.y > this.height + pad) this.y = -pad;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const finalAlpha = Math.min(this.alpha + this.frictionGlow * 0.3, 1.0);
    ctx.fillStyle = `rgba(${this.color}, ${finalAlpha})`;

    // High visibility neon halo (#B9EF4A) only when particle is energized
    if (this.frictionGlow > 0.05) {
      ctx.shadowBlur = 4 + this.frictionGlow * 10;
      ctx.shadowColor = `rgba(185, 239, 74, ${Math.min(finalAlpha, 0.85)})`;
    } else {
      ctx.shadowBlur = 0;
    }

    // Sharp shard diamond geometry
    ctx.beginPath();
    ctx.moveTo(0, -this.size * 2.6);
    ctx.lineTo(this.size, 0);
    ctx.lineTo(0, this.size * 2.6);
    ctx.lineTo(-this.size, 0);
    ctx.closePath();
    ctx.fill();

    // Crisp high-contrast stroke for extreme clarity against light & white cards
    ctx.strokeStyle = `rgba(${this.strokeColor}, ${finalAlpha * 0.85})`;
    ctx.lineWidth = 0.85;
    ctx.stroke();

    ctx.restore();
  }
}

// Cached container offsets — never queried inside scroll events
let containerLeft = 0;
let containerTop = 0;
let isFullscreen = false;

function updateOffsets(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  containerLeft = r.left;
  containerTop = r.top;
  isFullscreen = r.left === 0 && r.top === 0 && Math.abs(r.width - window.innerWidth) < 5;
}

function handlePointerMove(clientX: number, clientY: number) {
  if (isFullscreen) {
    mouse.x = clientX;
    mouse.y = clientY;
  } else {
    mouse.x = clientX - containerLeft;
    mouse.y = clientY - containerTop;
  }
  mouse.active = true;
}

function handleWindowMouseMove(e: MouseEvent) {
  handlePointerMove(e.clientX, e.clientY);
}

function handleWindowTouchStart(e: TouchEvent) {
  if (e.touches[0]) {
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }
}

function handleWindowTouchMove(e: TouchEvent) {
  if (e.touches[0]) {
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }
}

function handlePointerLeave() {
  mouse.x = -1000;
  mouse.y = -1000;
  mouse.active = false;
}

onMounted(() => {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  // Resolution optimization: limit DPR to 1.2 to avoid 4K texture raster overhead
  const isMobile = window.innerWidth <= 768;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.2);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);

  updateOffsets(container);

  // Balanced density: 16 on mobile, 34 on desktop
  const targetCount = props.particleCount > 0
    ? props.particleCount
    : isMobile
      ? 16
      : 34;

  const particles: Particle[] = [];
  for (let i = 0; i < targetCount; i++) {
    particles.push(new Particle(width, height, props.palette));
  }

  // Pre-render immediately for zero pop-in
  for (const particle of particles) {
    particle.draw(ctx);
  }

  if (isReducedMotion) return;

  const render = (currentTime: number) => {
    if (!ctx || !isVisible) return;

    if (!lastFrameTime) lastFrameTime = currentTime;
    const dt = Math.min((currentTime - lastFrameTime) / 16.67, 2.5) || 1;
    lastFrameTime = currentTime;

    ctx.clearRect(0, 0, width, height);

    for (const particle of particles) {
      particle.update(
        mouse.x,
        mouse.y,
        mouse.active,
        props.magneticRadius,
        props.pullStrength,
        props.vortexStrength,
        width,
        height,
        dt
      );
      particle.draw(ctx);
    }

    animationFrameId = requestAnimationFrame(render);
  };

  // Start RAF immediately with zero artificial delay
  animationFrameId = requestAnimationFrame(render);

  window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });
  window.addEventListener('touchstart', handleWindowTouchStart, { passive: true });
  window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
  window.addEventListener('touchend', handlePointerLeave, { passive: true });
  document.addEventListener('mouseleave', handlePointerLeave);

  // Pause when tab is hidden to save 100% CPU/GPU and battery
  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else {
      if (animationFrameId === null && isVisible) {
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Pause when element is scrolled outside the viewport
  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry ? entry.isIntersecting : true;
      if (!isVisible) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        if (animationFrameId === null && !document.hidden) {
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        }
      }
    }, { threshold: 0.02 });

    intersectionObserver.observe(container);
  }

  // Handle resizing without layout thrashing
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const cr = entry.contentRect;
      if (cr.width > 0 && cr.height > 0 && (Math.abs(cr.width - width) > 8 || Math.abs(cr.height - height) > 8)) {
        width = cr.width;
        height = cr.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.scale(dpr, dpr);
        if (container) updateOffsets(container);
      }
    }
  });

  resizeObserver.observe(container);
});

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }
  window.removeEventListener('mousemove', handleWindowMouseMove);
  window.removeEventListener('touchstart', handleWindowTouchStart);
  window.removeEventListener('touchmove', handleWindowTouchMove);
  window.removeEventListener('touchend', handlePointerLeave);
  document.removeEventListener('mouseleave', handlePointerLeave);
});
</script>

<template>
  <div ref="containerRef" class="asmr-particles-container">
    <canvas ref="canvasRef" class="asmr-particles-canvas" aria-hidden="true"></canvas>
  </div>
</template>

<style scoped>
.asmr-particles-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.asmr-particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
}
</style>
