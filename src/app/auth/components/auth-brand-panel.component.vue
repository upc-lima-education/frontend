<template>
    <aside class="brand-panel" aria-label="Llanqui">
        <div class="brand-matrix" aria-hidden="true"></div>

        <div class="brand-head">
            <img class="brand-logo" src="/llanqui-icon-transparent.png" alt="" aria-hidden="true" />
            <span>Llanqui</span>
        </div>

        <div class="brand-copy">
            <p class="brand-badge">Oportunidades verificadas</p>
            <h2>
                <span>Conectamos talento</span>
                <span>con oportunidades</span>
                <span class="brand-accent">reales</span>
            </h2>
            <p class="brand-note">Accede a un espacio laboral diseñado para avanzar con claridad y confianza.</p>
        </div>

        <p class="brand-assurance">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2 4 5.5V11c0 5.3 3.4 9.3 8 11 4.6-1.7 8-5.7 8-11V5.5L12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                <path d="m8.7 12 2.1 2.1 4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Empresas y oportunidades revisadas
        </p>
    </aside>
</template>

<style scoped>
.brand-panel {
    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 32px;
    min-width: 0;
    padding: 48px;
    overflow: hidden;
    background:
        radial-gradient(circle at 12% 14%, rgba(52, 95, 255, 0.42), transparent 40%),
        linear-gradient(145deg, #0e2472 0%, #081648 58%, #040c26 100%);
    color: #ffffff;
}

.brand-matrix {
    position: absolute;
    inset: 0 0 0 48%;
    z-index: -1;
    background-image: radial-gradient(rgba(139, 162, 255, 0.2) 1px, transparent 1px);
    background-size: 16px 16px;
    opacity: 0.45;
}

.brand-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.brand-logo { width: 32px; height: 32px; flex: 0 0 auto; }

.brand-copy { display: flex; flex-direction: column; gap: 16px; }

.brand-badge {
    width: fit-content;
    margin: 0;
    padding: 5px 10px;
    border: 1px solid rgba(199, 243, 107, 0.58);
    border-radius: 999px;
    color: #c7f36b;
    font-size: 12px;
    font-weight: 700;
}

.brand-copy h2 {
    max-width: 13ch;
    margin: 0;
    color: #ffffff;
    font-size: clamp(29px, 3vw, 43px);
    font-weight: 750;
    line-height: 1.08;
    letter-spacing: -0.03em;
    text-wrap: balance;
}

.brand-copy h2 span { display: block; }
.brand-accent { color: #c7f36b; }

.brand-note {
    max-width: 37ch;
    margin: 0;
    color: rgba(232, 239, 255, 0.82);
    font-size: 15px;
    line-height: 1.55;
}

.brand-assurance {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0;
    color: rgba(232, 239, 255, 0.86);
    font-size: 13px;
    line-height: 1.4;
}

.brand-assurance svg { color: #c7f36b; flex: 0 0 auto; }

@media (max-width: 1100px) {
    .brand-panel {
        width: 100%;
        box-sizing: border-box;
        gap: 11px;
        padding: 24px 36px 46px;
        border-radius: 16px 16px 0 0;
        background:
            radial-gradient(circle at 84% 10%, rgba(72, 95, 255, 0.34), transparent 44%),
            linear-gradient(145deg, #13268a 0%, #071839 100%);
    }

    .brand-copy { gap: 10px; }
    .brand-copy h2 { max-width: none; font-size: clamp(24px, 3.2vw, 32px); }
    .brand-copy h2 span { display: inline; }
    .brand-copy h2 span + span::before { content: ' '; white-space: pre; }
    .brand-note,
    .brand-assurance { display: none; }
}

@media (max-width: 768px) {
    .brand-panel { gap: 4px; padding: 12px 20px; }
    .brand-head { gap: 7px; font-size: 18px; }
    .brand-logo { width: 24px; height: 24px; }
    .brand-copy { display: none; }
    .brand-badge { display: none; }
    .brand-copy h2 { font-size: 16px; line-height: 1.18; }
}

@media (max-width: 420px) {
    .brand-panel { padding-block: 12px; }
}
</style>
