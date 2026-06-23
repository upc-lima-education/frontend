<script setup lang="ts">
defineProps<{
    title: string;
    note: string;
}>();

// The signature: workers (pro) and the companies hiring them (org) meeting on
// a shared spine. Grounded in the platform's real audience — operational and
// everyday jobs, not just office roles.
type Node = { side: 'left' | 'right'; kind: 'pro' | 'org'; label: string };

const nodes: Node[] = [
    { side: 'left', kind: 'pro', label: 'Operario' },
    { side: 'right', kind: 'org', label: 'Almacén' },
    { side: 'left', kind: 'pro', label: 'Mesera' },
    { side: 'right', kind: 'org', label: 'Restaurante' },
    { side: 'left', kind: 'pro', label: 'Conductor' },
    { side: 'right', kind: 'org', label: 'Constructora' },
];
</script>

<template>
    <aside class="brand-panel">
        <div class="brand-head">
            <img class="brand-logo" src="../../shared/assets/icons/logo.svg" alt="" />
            <span class="brand-name">{{ $t('auth.brandName') }}</span>
        </div>

        <div class="brand-copy">
            <span class="brand-eyebrow">{{ $t('auth.brandEyebrow') }}</span>
            <h2 class="brand-title">{{ title }}</h2>
            <p class="brand-note">{{ note }}</p>
        </div>

        <ul class="spine" aria-hidden="true">
            <li
                v-for="node in nodes"
                :key="node.label"
                class="spine-row"
                :class="`spine-row--${node.side}`"
            >
                <span class="chip" :class="`chip--${node.kind}`">{{ node.label }}</span>
                <span class="spine-node"></span>
            </li>
        </ul>
    </aside>
</template>

<style scoped>
.brand-panel {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: 44px 40px;
    color: #fff;
    /* Único gradiente permitido en la plataforma: el panel del login. */
    background:
        radial-gradient(110% 80% at 100% 0%, var(--color-primary) 0%, transparent 55%),
        linear-gradient(165deg, var(--color-primary-dark) 0%, #0C1145 100%);
}

/* base.css aplica un `* { color: var(--text-color) }` (negro) que rompe la
   herencia de color hacia este panel — por eso fijamos el blanco aquí. */
.brand-panel :where(span, h2, p, li) {
    font-family: var(--font-family);
    color: #fff;
}

/* Wordmark */
.brand-head {
    display: flex;
    align-items: center;
    gap: var(--space-1);
}

.brand-logo {
    width: 30px;
    height: 30px;
    filter: brightness(0) invert(1);
}

.brand-name {
    font-size: var(--fs-subtitle);
    font-weight: var(--fw-bold);
    letter-spacing: -0.01em;
}

/* Copy block */
.brand-copy {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.brand-eyebrow {
    font-size: 11px;
    font-weight: var(--fw-semibold);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-lavender);
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.brand-eyebrow::before {
    content: '';
    width: 22px;
    height: 2px;
    background: var(--color-lavender);
}

.brand-title {
    font-size: var(--fs-title);
    font-weight: var(--fw-bold);
    line-height: 1.12;
    letter-spacing: -0.02em;
    margin: 0;
    text-wrap: balance;
}

.brand-note {
    margin: 0;
    font-size: var(--fs-body);
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.72);
    max-width: 32ch;
}

/* Signature: the network spine */
.spine {
    position: relative;
    list-style: none;
    margin: auto 0 0;
    padding: var(--space-1) 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.spine::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    transform: translateX(-0.5px);
    background: linear-gradient(
        to bottom,
        transparent,
        rgba(184, 192, 232, 0.35) 12%,
        rgba(184, 192, 232, 0.35) 88%,
        transparent
    );
}

.spine-row {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 1.9rem;
}

.spine-row--left {
    justify-content: flex-start;
    padding-right: 50%;
}

.spine-row--right {
    justify-content: flex-end;
    padding-left: 50%;
}

.chip {
    position: relative;
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-medium);
    line-height: 1;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid transparent;
    white-space: nowrap;
}

/* connector from chip to the central node */
.chip::after {
    content: '';
    position: absolute;
    top: 50%;
    width: clamp(10px, 4vw, 26px);
    height: 1px;
    background: rgba(184, 192, 232, 0.35);
}

.spine-row--left .chip::after {
    left: 100%;
}

.spine-row--right .chip::after {
    right: 100%;
}

/* Workers: filled lavender accent. */
.chip--pro {
    color: #fff;
    border-color: rgba(184, 192, 232, 0.45);
    background: rgba(184, 192, 232, 0.14);
}

/* Companies: quieter, outlined — differentiated without leaving the palette. */
.chip--org {
    color: var(--color-lavender);
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.03);
}

/* node on the spine */
.spine-node {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-lavender);
}

/* On narrow screens the panel becomes a slim banner; drop the spine. */
@media (max-width: 860px) {
    .brand-panel {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-2);
        padding: var(--space-3) 28px;
    }

    .brand-copy {
        gap: 6px;
    }

    .brand-title {
        font-size: var(--fs-subtitle);
    }

    .brand-note,
    .spine {
        display: none;
    }
}
</style>
