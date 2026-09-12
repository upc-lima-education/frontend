---
target: registro responsive
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-12T02-22-00Z
slug: h-components-sign-up-sign-up-unified-component-vue
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | El envío comunica carga, pero los requisitos no anuncian cambios de estado a tecnologías asistivas. |
| 2 | Match System / Real World | 4/4 | Rol, correo y contraseña siguen el orden mental esperado. |
| 3 | User Control and Freedom | 2/4 | Se puede cambiar el rol y volver a iniciar sesión, pero no hay una salida o recuperación clara del flujo si se interrumpe. |
| 4 | Consistency and Standards | 4/4 | El sistema compartido de banner, tarjeta, controles y estados es consistente con el inicio de sesión. |
| 5 | Error Prevention | 3/4 | Validación y requisitos en vivo previenen errores comunes; faltan anuncios de estado y una semántica exclusiva de rol. |
| 6 | Recognition Rather Than Recall | 4/4 | Etiquetas, placeholders y requisitos mantienen todo el contexto visible. |
| 7 | Flexibility and Efficiency | 2/4 | Autocompletado y envío por formulario ayudan, pero los objetivos táctiles compactos penalizan el uso móvil. |
| 8 | Aesthetic and Minimalist Design | 3/4 | La jerarquía es limpia; en móvil, el bloque de marca aún compite un poco con la tarea de crear la cuenta. |
| 9 | Error Recovery | 3/4 | Los errores son cercanos al campo y el foco vuelve al primer problema; varios `aria-describedby` apuntan a mensajes que no existen hasta que se muestran. |
| 10 | Help and Documentation | 1/4 | No hay ayuda contextual para elegir un rol ni para explicar el estándar de contraseña. |
| **Total** | | **29/40** | **Good — base sólida; faltan mejoras de accesibilidad y recuperación.** |

## Design Specificity Verdict

La pantalla se siente propia de Llanqui: el contraste azul profundo, el verde de confianza y el tono de oportunidades verificadas conectan con empleabilidad sin caer en una plantilla SaaS genérica. La composición es más clara que la versión previa, con una tarjeta única y una decisión principal evidente.

El detector devolvió cero hallazgos para el componente. Su aviso `COMP_ROUND_OPEN` pertenece al flujo de build-phase del hero de Candidate Search, no a este registro. La revisión visual móvil a 390×700 confirmó que el CTA “Crear cuenta” aparece dentro del primer viewport.

## Overall Impression

El registro ya es operativo, consistente y considerablemente más compacto. La siguiente mejora debe priorizar inclusión y robustez, no seguir reduciendo píxeles: mantener 44px de interacción y hacer que los estados de validación se entiendan también sin ver el color.

## What's Working

- El bloque de marca y el formulario son una sola pieza visual; el cambio de fondo a tarjeta queda limpio, sin el escalón de radios que debilitaba el diseño.
- La decisión de rol está antes de pedir datos, en un formato de dos columnas que disminuye altura sin ocultar significado.
- Las validaciones, iconos y chips convierten requisitos abstractos de contraseña en feedback inmediato y localizado.

## Priority Issues

- **[P1] Estado accesible de validación incompleto.** Los chips cambian solo de color y los inputs de correo/confirmación siempre referencian IDs de error que aún no existen. Una persona con lector de pantalla no recibe una descripción fiable de qué requisito cambió ni del error actual. **Fix:** usar `aria-live="polite"` para un resumen textual de requisitos; enlazar el error con `aria-describedby` solo cuando esté presente, conservando siempre la ayuda persistente. **Suggested command:** `$impeccable harden`.
- **[P2] Targets táctiles demasiado pequeños.** En móvil, los botones de rol quedan en 40px y el botón del ojo en 28px. El diseño ahorra espacio, pero baja de los 44×44px recomendados y aumenta toques fallidos. **Fix:** conservar el control visual compacto, pero dar al ojo una caja táctil de 44px sin invadir el texto y subir los roles a 44px; recuperar altura reduciendo solo márgenes no interactivos. **Suggested command:** `$impeccable adapt`.
- **[P2] Selector exclusivo modelado como botones.** “Candidato” y “Empresa” son mutuamente excluyentes; `aria-pressed` funciona visualmente pero no expresa tan bien la elección única como un `radiogroup` con radios. **Fix:** usar radios accesibles estilizados, o un `role="radiogroup"` con `role="radio"`, `aria-checked` y navegación con flechas. **Suggested command:** `$impeccable harden`.
- **[P2] La segunda vía de registro queda bajo el pliegue.** A 390×700 el CTA principal sí es visible, pero Google, el retorno a inicio de sesión y el aviso legal empiezan a quedar fuera. No es un bloqueo, pero la experiencia de cuenta existente o social requiere un scroll extra. **Fix:** conservar “Crear cuenta” como prioridad y, si la conversión de Google es importante, mover “Registrarse con Google” antes del formulario o mostrar un enlace compacto “Continuar con Google” cerca del divisor. **Suggested command:** `$impeccable shape`.
- **[P3] Ayuda preventiva insuficiente.** “Usaré Llanqui como” no aclara el impacto de cada rol, y la política de contraseña se muestra como reglas sin una breve razón. **Fix:** añadir una línea discreta por rol en el estado seleccionado, por ejemplo “Postula y gestiona tus oportunidades” / “Publica vacantes y administra postulaciones.” **Suggested command:** `$impeccable clarify`.

## Persona Red Flags

**Jordan (primera vez):** entiende el formulario, pero podría dudar qué cambia entre Candidato y Empresa. La interfaz muestra la opción sin explicar su consecuencia.

**Sam (accesibilidad):** los requisitos satisfechos dependen de verde y check visual; no hay anuncio vivo. Además, las referencias ARIA hacia errores condicionales pueden quedar huérfanas antes de validar.

**Casey (móvil distraído):** la acción principal ya está visible a 390×700, una mejora importante. Aun así, el ojo de 28px y los roles de 40px exigen precisión y el registro social queda después del primer pliegue.

## Minor Observations

- Evita ocultar las condiciones de contraseña solo por compresión: las chips compactas funcionan mejor que una ayuda desplegable.
- El mensaje legal es correcto en 11px, pero no debería reducirse más; es el límite práctico de lectura cómoda.
- El banner móvil es ahora suficientemente breve; no lo comprimas más, porque la marca perdería anclaje y confianza.

## Questions to Consider

- ¿El rol elegido durante el registro puede cambiarse después sin soporte? Si no, la ayuda contextual se vuelve P1.
- ¿Qué vía tiene mayor conversión en tu producto: correo o Google? Esa respuesta debe definir cuál aparece primero en móvil.
