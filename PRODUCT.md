# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Candidatos que buscan oportunidades laborales y necesitan comprender qué acción aumenta sus posibilidades de postular.
- Empresas que publican vacantes, revisan postulaciones y toman decisiones sobre candidatos.

## Product Purpose

Llanqui conecta talento con oportunidades laborales. Permite explorar, publicar y gestionar empleos, perfiles, currículums y postulaciones desde flujos distintos para candidato y empresa.

## Positioning

La plataforma está orientada al matching laboral y a recomendaciones híbridas para candidatos, con foco declarado en oportunidades y perfiles del contexto de Lima Metropolitana.

## Operating Context

- Aplicación web autenticada con navegación superior y rutas protegidas por rol.
- Los candidatos exploran empleos, crean su perfil, generan o cargan CV y postulan.
- Las empresas completan su perfil, publican vacantes y gestionan postulaciones por vacante.
- Los datos se consumen desde `backend-v2`; las vistas no deben inventar datos o reemplazar respuestas reales con mocks.

## Capabilities and Constraints

- Vue 3, TypeScript, Vite, Pinia, Vue Router y Axios.
- Los flujos de candidato y company no son intercambiables.
- Las rutas, autenticación, endpoints y modelos existentes se preservan durante el rediseño.
- Estados sin endpoint disponible deben informar la limitación con claridad.
- La aplicación debe funcionar en desktop, tablet y móvil; la navegación móvil no usa un sidebar permanente.

## Brand Commitments

- Nombre: Llanqui.
- Paleta definida: azul primario `#2838D3`, acento lima `#B9EF4A` y fondo general `#F6F7FB`.
- Tipografía de interfaz: Inter.
- Voz: clara, laboral, cercana y orientada a la acción.
- El navbar superior y el logotipo Llanqui se conservan como elementos de reconocimiento.

## Evidence on Hand

- Logo actual: `src/app/shared/assets/icons/logo.svg`.
- Vistas y componentes existentes en `src/app/`.
- Datos reales a través de los servicios y contratos registrados en `FRONTEND_INTEGRATION_STATUS.md`.
- No se deben fabricar nombres de empresas, postulantes, métricas, ofertas ni testimonios.

## Product Principles

- Cada pantalla debe orientar al siguiente paso laboral concreto.
- La información real prevalece sobre decoración o métricas sin respaldo.
- Las decisiones de empresa deben mostrar sus consecuencias y estado con claridad.
- La interfaz reduce incertidumbre: explica vacíos, errores y capacidades no disponibles.

## Accessibility & Inclusion

- Controles utilizables por teclado, foco visible y etiquetas accesibles.
- Objetivos táctiles de al menos 44 px cuando corresponde.
- Respeto por `prefers-reduced-motion`.
- Contraste legible y mensajes de estado comprensibles.
