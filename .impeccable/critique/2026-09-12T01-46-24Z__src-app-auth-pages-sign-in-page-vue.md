---
target: /sign-in
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-09-12T01-46-24Z
slug: src-app-auth-pages-sign-in-page-vue
---
## Design Health Score

| # | Heurística | Puntaje | Hallazgo clave |
|---|---|---:|---|
| 1 | Visibilidad del estado | 3/4 | El botón comunica carga; falta validación visible por campo. |
| 2 | Relación con el mundo real | 4/4 | Lenguaje claro y correcto para acceso laboral en español. |
| 3 | Control y libertad | 3/4 | Hay recuperar contraseña y mostrar contraseña; no hay salida visible al inicio. |
| 4 | Consistencia y estándares | 3/4 | Campos y CTAs son consistentes; el panel de marketing compite con el objetivo de acceso. |
| 5 | Prevención de errores | 1/4 | El formulario usa `novalidate` y los campos no son `required`; Google no recibe `userType`. |
| 6 | Reconocimiento antes que memoria | 4/4 | Etiquetas, iconos y separador Google/correo son claros. |
| 7 | Flexibilidad y eficiencia | 2/4 | Autocomplete es correcto, pero el flujo Google puede fallar y no hay validación anticipada. |
| 8 | Estética y minimalismo | 2/4 | La identidad está presente, pero partículas, métricas, seguridad y pulso suman más capas de las necesarias. |
| 9 | Recuperación de errores | 2/4 | Hay mensaje global, no guía por campo ni recuperación orientada al siguiente paso. |
| 10 | Ayuda y documentación | 1/4 | Solo está la recuperación de contraseña; faltan soporte y enlaces de confianza. |
| **Total** | | **25/40** | Base sólida, con riesgo funcional y exceso visual en escritorio. |

## Veredicto de especificidad

La vista sí se siente propia de Llanqui: el azul profundo, verde lima y el lenguaje de oportunidades verificadas conectan con una plataforma laboral. Sin embargo, el área izquierda se comporta más como un panel de campaña que como una pantalla de acceso. En escritorio, la suma de métricas, tarjeta de seguridad, partículas, matrices y el pulso de fondo reduce la concentración en la única tarea: iniciar sesión.

## Impresión general

La estructura y la base responsive son buenas. El mayor salto de calidad vendrá de priorizar confiabilidad funcional y reducir la cantidad de estímulos, no de añadir otra capa decorativa.

## Lo que funciona

- La jerarquía del formulario es directa: título, Google, separador, campos y CTA.
- El sistema de color permite identificar Llanqui sin caer en un login genérico.
- El rediseño de tablet y móvil hacia un solo contenedor mejora continuidad y lectura.

## Problemas prioritarios

### [P0] Google puede iniciar un flujo incompleto

**Por qué importa:** `GoogleLoginComponent` se monta con `mode="login"` sin `userType`, mientras `useGoogleLogin` documenta ese dato como requerido para la URL OAuth. Es un riesgo de abandono en el método de acceso más visible.

**Arreglo:** resolver el tipo de perfil existente antes de llamar al servicio, o quitar ese requisito del endpoint de login cuando ya no corresponda. Si no puede resolverse, mostrar una elección explícita y breve antes de redirigir.

**Comando sugerido:** `$impeccable harden`.

### [P1] El formulario no evita errores básicos

**Por qué importa:** `novalidate` desactiva el navegador y no hay `required`, mensajes bajo cada campo, ni enfoque al primer error. El usuario descubre el problema después de enviar.

**Arreglo:** validar correo vacío/formato y contraseña vacía antes del request; usar `aria-describedby`, texto de error cerca del campo y foco programático en el primer inválido. Mantener el mensaje general solo para credenciales incorrectas o red.

**Comando sugerido:** `$impeccable harden`.

### [P1] El panel de marca compite con el login en escritorio

**Por qué importa:** cinco mensajes de confianza y decoración animada elevan la carga cognitiva justo antes de una tarea simple y sensible.

**Arreglo:** conservar logo, una promesa concreta y una sola prueba de confianza. Mover métricas y tarjeta de seguridad a registro u onboarding; reducir partículas a una textura estática sutil.

**Comando sugerido:** `$impeccable distill`.

### [P2] La credibilidad está expresada como marketing, no como apoyo de tarea

**Por qué importa:** 12K+, 2.5K+ y 35K+ no ayudan a recuperar una cuenta ni a completar el login; sin contexto pueden sentirse como datos decorativos.

**Arreglo:** reemplazarlos por una línea de utilidad comprobable, por ejemplo enlace a ayuda, privacidad y términos, colocada bajo el CTA.

**Comando sugerido:** `$impeccable clarify`.

### [P2] Falta una ruta de ayuda cuando el usuario queda bloqueado

**Por qué importa:** “¿Olvidaste tu contraseña?” resuelve un caso, pero no explica qué hacer ante problemas con Google, cuenta inexistente o bloqueo.

**Arreglo:** añadir un enlace discreto “¿Problemas para acceder?” que abra soporte, junto con enlaces de privacidad y términos.

**Comando sugerido:** `$impeccable harden`.

## Banderas por persona

**Jordan, primera vez:** puede interpretar la promesa, métricas y seguridad como contenido publicitario antes de saber con rapidez si debe iniciar sesión o crear cuenta. El registro debería estar más claro y el contenido de marca más corto.

**María, candidata que vuelve desde móvil:** tiene buena lectura y tamaños táctiles, pero si ingresa un correo mal formado no recibe corrección inmediata. Puede repetir intentos sin saber qué campo falló.

**Luis, usuario que eligió Google:** encuentra el botón primero, pero el flujo puede romperse si el backend exige `userType`; es una interrupción de alta frustración porque ocurre después de elegir su método preferido.

## Observaciones menores

- Añadir `:focus-visible` consistente a Google, ojo, links y CTA.
- Cambiar “Email o contraseña incorrectos” a “El correo o la contraseña no coinciden” y mantener el texto sin revelar cuál campo existe.
- Evitar el movimiento simultáneo de partículas y pulso; aunque hay reducción de movimiento, una sola animación ambiental es suficiente.
- El botón de Google debería exponer `aria-busy` durante la redirección.

## Preguntas para considerar

- ¿El login debe vender la plataforma o confirmar al usuario que ya llegó al lugar correcto?
- ¿Qué evidencia de confianza ayuda más antes de entrar: una cifra, o una vía clara para recuperar acceso y pedir ayuda?
