<script setup lang="ts">
defineProps<{
    title?: string;
    note?: string;
    badge?: string;
}>();
</script>

<template>
    <aside class="brand-panel" aria-label="Información de Llanqui">

        <!-- ── Capas decorativas de fondo ── -->

        <!-- Textura de puntos matriciales (lado derecho) -->
        <div class="dot-matrix" aria-hidden="true"></div>

        <!-- Glow azul principal centrado-derecha (el gran arco de aurora del mockup) -->
        <div class="arc-glow" aria-hidden="true"></div>

        <!-- Halo azul secundario superior-izq -->
        <div class="halo-top" aria-hidden="true"></div>

        <!-- Curvas orgánicas de auroras fluidas y destellos azulados tal cual logindesign.png -->
        <svg class="aurora-card-svg" viewBox="0 0 320 680" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id="cardAuroraGrad1" x1="0%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.15" />
                    <stop offset="30%" stop-color="#4F75FF" stop-opacity="0.85" />
                    <stop offset="50%" stop-color="#60A5FA" stop-opacity="1" />
                    <stop offset="70%" stop-color="#3866FF" stop-opacity="0.85" />
                    <stop offset="100%" stop-color="#2563EB" stop-opacity="0.15" />
                </linearGradient>
                <linearGradient id="cardAuroraGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#60A5FA" stop-opacity="0.05" />
                    <stop offset="50%" stop-color="#3B82F6" stop-opacity="0.45" />
                    <stop offset="100%" stop-color="#1D4ED8" stop-opacity="0.05" />
                </linearGradient>
                <filter id="cardFlareFilter" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" result="blur1" />
                    <feGaussianBlur stdDeviation="12" result="blur2" />
                    <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <!-- Curva aurora primaria: fluye elegantemente por el lateral derecho -->
            <path d="M305 80 C 275 190, 240 270, 275 350 C 310 430, 255 530, 290 640"
                stroke="url(#cardAuroraGrad1)" stroke-width="2.4" filter="url(#cardFlareFilter)" />

            <!-- Curva aurora secundaria paralela más suave -->
            <path d="M315 140 C 285 230, 255 295, 288 375 C 322 455, 270 560, 305 660"
                stroke="url(#cardAuroraGrad2)" stroke-width="1.5" />

            <!-- Destello brillante 1: centro vertical cerca del borde (y=350) -->
            <circle cx="275" cy="350" r="18" fill="#3B82F6" fill-opacity="0.38" filter="url(#cardFlareFilter)" />
            <circle cx="275" cy="350" r="7" fill="#60A5FA" fill-opacity="0.85" />
            <circle cx="275" cy="350" r="3" fill="#FFFFFF" />

            <!-- Rayos de luz en cruz para el destello 1 -->
            <line x1="258" y1="350" x2="292" y2="350" stroke="#FFFFFF" stroke-width="1.2" opacity="0.9" filter="url(#cardFlareFilter)" />
            <line x1="275" y1="333" x2="275" y2="367" stroke="#FFFFFF" stroke-width="1.2" opacity="0.9" filter="url(#cardFlareFilter)" />

            <!-- Destello brillante 2: zona inferior (y=535) -->
            <circle cx="265" cy="535" r="15" fill="#3866FF" fill-opacity="0.35" filter="url(#cardFlareFilter)" />
            <circle cx="265" cy="535" r="5.5" fill="#60A5FA" fill-opacity="0.8" />
            <circle cx="265" cy="535" r="2.5" fill="#FFFFFF" />
        </svg>

        <!-- ── Partículas y destellos flotantes ── -->
        <span class="spark spark--diamond spark--blue-1" aria-hidden="true"></span>
        <span class="spark spark--diamond spark--lime-1" aria-hidden="true"></span>
        <span class="spark spark--diamond spark--blue-2" aria-hidden="true"></span>
        <span class="spark spark--diamond spark--blue-3" aria-hidden="true"></span>
        <span class="spark spark--diamond spark--lime-2" aria-hidden="true"></span>
        <span class="spark spark--dot spark--blue-4" aria-hidden="true"></span>
        <span class="spark spark--dot spark--lime-3" aria-hidden="true"></span>
        <span class="spark spark--star spark--blue-5" aria-hidden="true"></span>
        <span class="spark spark--star spark--lime-4" aria-hidden="true"></span>
        <span class="spark spark--chip spark--blue-6" aria-hidden="true"></span>
        <span class="spark spark--chip spark--lime-5" aria-hidden="true"></span>

        <!-- ── Contenido ── -->

        <!-- Logo -->
        <div class="brand-head">
            <svg class="brand-logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <!-- Left person (Lime Green head & Royal Blue body) -->
                <circle cx="20" cy="15" r="5.5" fill="#B9EF4A"/>
                <path d="M7 47C7 33.5 17 26 27 26C31.5 26 35.5 27.8 38.5 31C35.2 33.8 32.5 37.8 31 43.5L30.2 47H7Z" fill="#3B82F6"/>

                <!-- Right person (Sky Blue head & Royal Blue body) -->
                <circle cx="44" cy="15" r="5.5" fill="#60A5FA"/>
                <path d="M57 47C57 33.5 47 26 37 26C32.5 26 28.5 27.8 25.5 31C28.8 33.8 31.5 37.8 33 43.5L33.8 47H57Z" fill="#2563EB"/>

                <!-- Growth bars in center -->
                <rect x="23.5" y="37" width="4" height="10" rx="2" fill="#60A5FA"/>
                <rect x="30" y="31" width="4" height="16" rx="2" fill="#3B82F6"/>
                <rect x="36.5" y="25" width="4" height="22" rx="2" fill="#2563EB"/>
            </svg>
            <span class="brand-name">Llanqui</span>
        </div>

        <!-- Badge -->
        <div class="brand-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="#B9EF4A" stroke-width="2"/>
                <path d="M12 7v5l3 3" stroke="#B9EF4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Plataforma de empleo inteligente</span>
        </div>

        <!-- Hero copy -->
        <div class="brand-copy">
            <h2 class="brand-title">
                Conectamos talento<br>con oportunidades<br>
                <span class="brand-title-accent">verificadas</span>
            </h2>
            <p class="brand-note">
                Impulsamos tu crecimiento profesional con vacantes confiables, empresas verificadas y herramientas inteligentes.
            </p>
        </div>

        <!-- Metric cards (1: Lime Briefcase, 2: Blue Building, 3: Lime Users) -->
        <div class="metrics-grid">
            <div class="metric-card">
                <span class="metric-icon metric-icon--lime" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="7" width="18" height="13" rx="2" stroke="#B9EF4A" stroke-width="1.8"/>
                        <path d="M8 7V5a4 4 0 018 0v2" stroke="#B9EF4A" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M12 12v2" stroke="#B9EF4A" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                </span>
                <span class="metric-number">12K+</span>
                <span class="metric-label">Oportunidades verificadas</span>
            </div>
            <div class="metric-card">
                <span class="metric-icon metric-icon--blue" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#60A5FA" stroke-width="1.8"/>
                        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" stroke="#60A5FA" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M10 21v-3h4v3" stroke="#60A5FA" stroke-width="1.8"/>
                    </svg>
                </span>
                <span class="metric-number">2.5K+</span>
                <span class="metric-label">Empresas activas</span>
            </div>
            <div class="metric-card">
                <span class="metric-icon metric-icon--lime" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#B9EF4A" stroke-width="1.8" stroke-linecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="#B9EF4A" stroke-width="1.8"/>
                        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#B9EF4A" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                </span>
                <span class="metric-number">35K+</span>
                <span class="metric-label">Talentos conectados</span>
            </div>
        </div>

        <!-- Security card -->
        <div class="security-card">
            <span class="security-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                        fill="#A3E635" stroke="#B9EF4A" stroke-width="1.5"/>
                    <path d="M9 12l2 2 4-4" stroke="#091838" stroke-width="2.4"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </span>
            <div class="security-copy">
                <span class="security-title">Entorno seguro y confiable</span>
                <p class="security-text">Verificamos cada empresa y oportunidad para que postules con tranquilidad.</p>
            </div>
        </div>

        <!-- Footer de protección con botón de candado estilizado tal cual logindesign.png -->
        <div class="brand-footer">
            <div class="brand-shield-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="rgba(240, 246, 255, 0.95)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="rgba(240, 246, 255, 0.95)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="brand-footer-copy">
                <span class="brand-footer-title">Tus datos están protegidos</span>
                <span class="brand-footer-text">Usamos cifrado de nivel empresarial y nunca compartimos tu información.</span>
            </div>
            <div class="brand-lock-btn" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="#3B82F6" stroke-width="1.8"/>
                    <path d="M8 11V7a4 4 0 018 0v4" stroke="#3B82F6" stroke-width="1.8" stroke-linecap="round"/>
                    <circle cx="12" cy="16" r="1.5" fill="#3B82F6"/>
                </svg>
            </div>
        </div>

    </aside>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   BRAND PANEL — dark column
═══════════════════════════════════════════════════════════════ */
.brand-panel {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 48px 44px;
    color: #fff;
    background:
        radial-gradient(circle at 20% 12%, rgba(41, 82, 255, 0.35), transparent 42%),
        radial-gradient(circle at 90% 70%, rgba(30, 64, 230, 0.25), transparent 50%),
        linear-gradient(150deg, #0E2472 0%, #081648 42%, #040C26 100%);
}

/* All text inside stays white */
.brand-panel :where(span, h2, p, div) {
    color: #fff;
}

/* ── Dot-matrix texture (right third) ── */
.dot-matrix {
    position: absolute;
    inset: 0 0 0 52%;
    background-image: radial-gradient(rgba(102, 129, 255, 0.22) 1.2px, transparent 1.2px);
    background-size: 14px 14px;
    pointer-events: none;
    z-index: 0;
}

/* ── Large arc glow — replicates the intense circular blue light in the mockup ── */
.arc-glow {
    position: absolute;
    right: -130px;
    top: 50%;
    transform: translateY(-50%);
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: radial-gradient(
        circle,
        rgba(37, 75, 255, 0.65) 0%,
        rgba(41, 82, 255, 0.38) 35%,
        rgba(29, 78, 216, 0.15) 55%,
        transparent 72%
    );
    filter: blur(44px);
    pointer-events: none;
    z-index: 0;
}

/* ── Halo superior-izquierdo ── */
.halo-top {
    position: absolute;
    left: -60px;
    top: -60px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(63, 82, 255, 0.25) 0%, transparent 70%);
    filter: blur(50px);
    pointer-events: none;
    z-index: 0;
}

/* ── SVG auroras y destellos luminosos — borde derecho del panel ── */
.aurora-card-svg {
    position: absolute;
    right: 0;
    top: 0;
    width: 320px;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

/* ── Elevate content above decorations ── */
.brand-head,
.brand-badge,
.brand-copy,
.metrics-grid,
.security-card,
.brand-footer {
    position: relative;
    z-index: 2;
}

/* ═══════════════════════════════════════════════════════════════
   PARTÍCULAS / DESTELLOS
   Posicionadas para replicar la distribución del mockup:
   - rombos azules: dispersos hacia la zona derecha y central
   - rombos verdes: parte superior y parte inferior
   - destellos estrella: esquinas y bordes
═══════════════════════════════════════════════════════════════ */
.spark {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    display: block;
}

/* ── Rombo diamante ── */
.spark--diamond {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

/* ── Punto redondo ── */
.spark--dot {
    border-radius: 50%;
}

/* ── Fragmento chip pequeño ── */
.spark--chip {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    transform: rotate(45deg);
}

/* ── Destello tipo estrella ── */
.spark--star::before,
.spark--star::after {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    border-radius: inherit;
}
.spark--star {
    /* Usamos el mismo shape diamante pero más largo en un eje */
    clip-path: polygon(50% 0%, 56% 44%, 100% 50%, 56% 56%, 50% 100%, 44% 56%, 0% 50%, 44% 44%);
}

/* ── Colores ── */
.spark--blue-1,
.spark--blue-2,
.spark--blue-3,
.spark--blue-4,
.spark--blue-5,
.spark--blue-6 {
    background: #6284FF;
}

.spark--lime-1,
.spark--lime-2,
.spark--lime-3,
.spark--lime-4,
.spark--lime-5 {
    background: #C7F36B;
}

/* ═══ POSICIONES INDIVIDUALES (replicando el mockup) ═══ */

/* Rombo azul — parte superior derecha del panel (cerca del texto del logo) */
.spark--blue-1 {
    width: 7px;
    height: 7px;
    top: 12%;
    right: 22%;
    opacity: 0.75;
    animation: floatA 7s ease-in-out infinite;
}

/* Rombo verde — parte superior, al lado del badge */
.spark--lime-1 {
    width: 5px;
    height: 5px;
    top: 8%;
    right: 38%;
    opacity: 0.70;
    animation: floatB 9s ease-in-out infinite;
}

/* Rombo azul — zona central del panel, borde derecho */
.spark--blue-2 {
    width: 8px;
    height: 8px;
    top: 46%;
    right: 8%;
    opacity: 0.65;
    animation: floatC 6s ease-in-out infinite;
    filter: blur(0.2px);
}

/* Rombo azul — zona inferior-izquierda (debajo de la security card) */
.spark--blue-3 {
    width: 6px;
    height: 6px;
    bottom: 18%;
    left: 6%;
    opacity: 0.55;
    animation: floatA 10s ease-in-out infinite reverse;
}

/* Rombo verde — zona inferior */
.spark--lime-2 {
    width: 5px;
    height: 5px;
    bottom: 12%;
    left: 18%;
    opacity: 0.65;
    animation: floatB 8s ease-in-out infinite;
}

/* Punto azul pequeño — zona central, a la izquierda */
.spark--blue-4 {
    width: 4px;
    height: 4px;
    top: 55%;
    left: 12%;
    opacity: 0.50;
    animation: floatC 11s ease-in-out infinite;
}

/* Punto verde — zona derecha, media-baja */
.spark--lime-3 {
    width: 4px;
    height: 4px;
    top: 65%;
    right: 15%;
    opacity: 0.60;
    animation: floatA 8.5s ease-in-out infinite reverse;
}

/* Destello estrella azul — borde superior-derecho */
.spark--blue-5 {
    width: 9px;
    height: 9px;
    top: 17%;
    right: 12%;
    opacity: 0.80;
    animation: twinkle 5s ease-in-out infinite;
}

/* Destello estrella lima — lado derecho, zona media */
.spark--lime-4 {
    width: 7px;
    height: 7px;
    top: 38%;
    right: 14%;
    opacity: 0.70;
    animation: twinkle 7s ease-in-out infinite 2s;
}

/* Chip azul pequeño — borde derecho superior */
.spark--blue-6 {
    width: 5px;
    height: 5px;
    top: 30%;
    right: 5%;
    opacity: 0.55;
    animation: floatB 12s ease-in-out infinite;
}

/* Chip lime — borde derecho inferior */
.spark--lime-5 {
    width: 4px;
    height: 4px;
    bottom: 30%;
    right: 6%;
    opacity: 0.50;
    animation: floatC 9s ease-in-out infinite 3s;
}

/* ═══ ANIMACIONES ═══ */
@keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-7px) rotate(8deg); }
    66%       { transform: translateY(4px) rotate(-5deg); }
}

@keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    40%       { transform: translateY(-10px) rotate(-10deg); }
    70%       { transform: translateY(5px) rotate(6deg); }
}

@keyframes floatC {
    0%, 100% { transform: translateY(0px) rotate(45deg); }
    50%       { transform: translateY(-8px) rotate(55deg); }
}

@keyframes twinkle {
    0%, 100% { opacity: 0.75; transform: scale(1) rotate(0deg); }
    25%       { opacity: 1;    transform: scale(1.3) rotate(10deg); }
    50%       { opacity: 0.5;  transform: scale(0.85) rotate(-5deg); }
    75%       { opacity: 0.9;  transform: scale(1.15) rotate(8deg); }
}

/* ═══════════════════════════════════════════════════════════════
   CONTENIDO
═══════════════════════════════════════════════════════════════ */

/* ── Logo ── */
.brand-head {
    display: flex;
    align-items: center;
    gap: 10px;
}

.brand-logo {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
}

.brand-name {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #fff;
}

/* ── Badge ── */
.brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    width: fit-content;
    padding: 6px 12px;
    border: 1px solid rgba(199, 243, 107, 0.55);
    background: rgba(199, 243, 107, 0.05);
    border-radius: 999px;
}

.brand-badge span {
    font-size: 12px;
    font-weight: 600;
    color: #C7F36B;
    letter-spacing: 0.01em;
}

/* ── Hero copy ── */
.brand-copy {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.brand-title {
    font-size: clamp(28px, 2.6vw, 44px);
    font-weight: 750;
    line-height: 1.08;
    letter-spacing: -0.025em;
    margin: 0;
    color: #fff;
    text-wrap: balance;
}

.brand-title-accent {
    color: #C7F36B;
    font-weight: 750;
}

.brand-note {
    margin: 0;
    font-size: 15px;
    line-height: 1.55;
    color: rgba(232, 239, 255, 0.76);
    max-width: 400px;
}

/* ── Metrics ── */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.metric-card {
    background: rgba(12, 30, 69, 0.48);
    border: 1px solid rgba(107, 132, 196, 0.32);
    backdrop-filter: blur(8px);
    border-radius: 14px;
    padding: 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
}

.metric-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
}

.metric-icon--blue { background: rgba(79, 100, 255, 0.15); }
.metric-icon--lime { background: rgba(199, 243, 107, 0.10); }

.metric-number {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1;
}

.metric-label {
    font-size: 12px;
    color: rgba(228, 235, 255, 0.72);
    line-height: 1.3;
}

/* ── Security card ── */
.security-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: rgba(13, 32, 72, 0.55);
    border: 1px solid rgba(99, 126, 197, 0.32);
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 0 30px rgba(199, 243, 107, 0.06);
}

.security-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: rgba(199, 243, 107, 0.08);
    border-radius: 12px;
    border: 1px solid rgba(199, 243, 107, 0.2);
}

.security-copy {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.security-title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
}

.security-text {
    font-size: 13px;
    line-height: 1.5;
    color: rgba(228, 235, 255, 0.72);
    margin: 0;
}

/* ── Footer ── */
.brand-footer {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: auto;
    padding-top: 6px;
    position: relative;
    z-index: 2;
}

.brand-shield-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.brand-footer-copy {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
}

.brand-footer-title {
    font-size: 13px;
    font-weight: 600;
    color: rgba(220, 232, 255, 0.95);
}

.brand-footer-text {
    font-size: 11px;
    color: rgba(180, 195, 235, 0.7);
    line-height: 1.4;
}

.brand-lock-btn {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid rgba(77, 99, 255, 0.4);
    background: rgba(41, 62, 175, 0.25);
    box-shadow: 0 0 15px rgba(61, 90, 255, 0.15);
}

/* ── Tablet ── */
@media (max-width: 1100px) {
    .brand-panel {
        padding: 32px 28px;
        gap: 16px;
    }
    .brand-title { font-size: clamp(22px, 3vw, 34px); }
    .metric-number { font-size: 18px; }
    .metric-card { padding: 14px 10px; }
}

/* ── Mobile ── */
@media (max-width: 768px) {
    .brand-panel {
        flex-direction: column;
        padding: 28px 24px 20px;
        gap: 12px;
        background:
            radial-gradient(circle at 80% 20%, rgba(63, 82, 255, 0.22), transparent 50%),
            linear-gradient(145deg, #13268A 0%, #071839 100%);
    }
    .brand-title { font-size: 26px; }
    .aurora-card-svg { display: none; }
    .brand-note,
    .metrics-grid,
    .security-card,
    .brand-footer { display: none; }
    /* Ocultar la mayoría de partículas en mobile para no saturar */
    .spark--blue-2,
    .spark--blue-3,
    .spark--blue-4,
    .spark--blue-5,
    .spark--blue-6,
    .spark--lime-2,
    .spark--lime-3,
    .spark--lime-4,
    .spark--lime-5 { display: none; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
    .spark { animation: none !important; }
    .aurora-card-svg { display: none; }
}
</style>
