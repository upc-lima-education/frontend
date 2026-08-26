# Plan semanal de avance — Tesis TP2 / Llanqui

> Semana de ejecución: 7 días consecutivos desde el inicio del trabajo.
> 
> Objetivo: cerrar una versión demostrable de Llanqui con una experiencia visual coherente, un flujo de recomendación más personalizado y un plan de validación ejecutable con 80 usuarios.

## 1. Resultado esperado al terminar la semana

Al finalizar la semana debemos poder demostrar este flujo completo:

```text
Registro / login
    ↓
Perfil de candidato completo
    ↓
Preguntas de preferencias laborales
    ↓
Recomendaciones personalizadas
    ↓
Explorar detalle de una oferta
    ↓
Guardar / postular
    ↓
Dar feedback sobre la recomendación
    ↓
Medir utilidad y satisfacción
```

El entregable no debe limitarse a “el frontend se ve mejor”. Debe demostrar que el usuario entiende por qué recibe una recomendación, puede actuar sobre ella y puede decir si fue útil.

## 2. Estado actual de los proyectos

### Frontend

Ya se avanzó en:

- Dashboard de inicio orientado a oportunidades.
- Búsqueda de empleos con filtros y estados vacíos.
- Detalle de empleo con CTA de postulación.
- Vista “Mis postulaciones”.
- Comunidad rediseñada como “Radar laboral”.
- Configuración local de API en `http://localhost:5000/api/v1`.
- Sistema visual basado en la paleta Llanqui.

Pendientes principales:

- Consolidar tokens de color, tipografía y componentes.
- Validar el flujo completo en móvil y escritorio.
- Evitar datos de demostración en pantallas de producción.
- Reemplazar el historial local de postulaciones cuando exista el endpoint real del backend.

### Backend

Actualmente existen módulos para:

- Auth y perfiles.
- Empleos.
- Postulaciones.
- Noticias y reacciones.
- Mensajes.
- Notificaciones.

Pendientes relevantes para esta semana:

- Exponer un listado de postulaciones por candidato.
- Alinear los estados de postulación entre frontend y backend.
- Definir endpoints para preferencias del candidato.
- Definir endpoints para feedback de recomendaciones.
- Definir cómo se almacenan eventos de interacción para mejorar el modelo.

### Motor de recomendación

El frontend consume actualmente:

- `POST /recommendations/general`
- `POST /recommendations/specific`

El motor recibe historial de títulos y filtros. Para mejorar la personalización necesita también señales explícitas del usuario: preferencias, exclusiones y feedback sobre las recomendaciones.

## 3. Prioridades de la semana

### P0 — Bloqueantes

Estas tareas deben resolverse antes de cerrar la semana:

1. Alinear el contrato de postulaciones.
2. Definir el requisito de perfil completo para usar recomendaciones personalizadas.
3. Validar que login, perfil, búsqueda, detalle y postulación funcionen con la API local.
4. Definir el instrumento de evaluación para los 80 usuarios.

### P1 — Entregables principales

1. Completar el sistema visual del frontend.
2. Crear el flujo de preferencias del candidato.
3. Mostrar recomendaciones explicables.
4. Registrar feedback de utilidad.
5. Ejecutar un piloto pequeño antes de la prueba con 80 usuarios.

### P2 — Mejoras posteriores

1. Entrenar o recalibrar el modelo usando feedback.
2. Implementar personalización avanzada por comportamiento.
3. Añadir un panel analítico para evaluar el recomendador.
4. Recuperar postulaciones desde cualquier dispositivo.

## 4. Línea de trabajo A — Finalizar el frontend visual

### Objetivo

Consolidar una interfaz reconocible como Llanqui: una brújula laboral, no una copia de LinkedIn.

### Tareas

- Centralizar colores, tipografías, bordes, sombras y espaciado en `variables.css`.
- Mantener Inter para texto funcional y seleccionar una fuente secundaria para titulares si la identidad de marca lo permite.
- Eliminar estilos duplicados y valores hardcodeados.
- Revisar estados de loading, error, vacío y éxito en todas las pantallas.
- Revisar responsive en 375 px, 768 px y escritorio.
- Revisar foco de teclado, contraste y labels accesibles.
- Sustituir emojis de interfaz por iconos consistentes.
- Revisar navegación por rol: candidato y organización.

### Criterios de terminado

- El usuario puede completar login → dashboard → búsqueda → detalle → postulación sin perder contexto.
- Ninguna pantalla principal muestra datos ficticios sin indicarlo.
- Cada acción tiene un estado visible de éxito o error.
- La interfaz es usable en móvil sin scroll horizontal.
- Los títulos y CTA utilizan lenguaje orientado a acciones.

## 5. Línea de trabajo B — Perfil completo como requisito del recomendador

### Problema

El modelo no puede personalizar de forma confiable si el candidato no tiene suficientes datos. Recomendar desde un perfil vacío produce resultados genéricos y reduce la confianza.

### Definición propuesta de perfil suficiente

Un perfil se considera apto para recibir recomendaciones personalizadas cuando tiene:

- Nombre y apellidos.
- Profesión o área de interés.
- Al menos 3 habilidades o palabras clave.
- Ubicación o preferencia remota.
- Descripción profesional de al menos 100 caracteres.
- Preferencia de modalidad: remoto, híbrido o presencial.
- Rango salarial deseado, si el usuario está dispuesto a compartirlo.

No todos los campos deben ser obligatorios para usar la plataforma. Se recomienda separar:

- **Perfil mínimo:** permite explorar ofertas generales.
- **Perfil recomendado:** habilita recomendaciones personalizadas.
- **Perfil completo:** mejora el ranking y permite mejores explicaciones.

### Experiencia de usuario

Cuando el perfil no esté listo, mostrar:

> “Todavía no conocemos suficiente sobre tus preferencias. Completa 3 datos para recibir recomendaciones más útiles.”

Acciones:

- Completar perfil.
- Responder preferencias rápidas.
- Explorar ofertas generales mientras tanto.

No se debe bloquear toda la búsqueda. Se debe limitar únicamente el mensaje de “recomendación personalizada”.

## 6. Línea de trabajo C — Personalizar el modelo híbrido

### Enfoque recomendado

El modelo debe combinar tres fuentes de señal:

1. **Filtrado por contenido:** habilidades, profesión, ubicación, modalidad y salario.
2. **Filtrado colaborativo:** comportamiento de usuarios con intereses similares.
3. **Preferencias explícitas:** respuestas del propio candidato.

La fórmula inicial puede mantener el modelo actual y sumar una capa de ranking:

```text
Puntaje final =
  50% coincidencia de habilidades y título
  20% ubicación, modalidad y salario
  20% preferencias declaradas
  10% señales colaborativas
```

Estos porcentajes son una hipótesis inicial, no una verdad definitiva. Deben ajustarse con los resultados de validación.

### Preguntas de personalización

La encuesta no debe parecer un formulario largo. Se recomienda un flujo de 5 a 7 preguntas, con respuestas rápidas.

#### Preguntas obligatorias para el primer prototipo

1. **¿Qué tipo de oportunidad buscas principalmente?**
   - Primer empleo.
   - Cambiar de trabajo.
   - Crecer en mi área.
   - Trabajo temporal o por proyecto.

2. **¿Qué pesa más al elegir una oferta?**
   - Salario.
   - Modalidad.
   - Ubicación.
   - Tipo de empresa.
   - Aprendizaje y crecimiento.

3. **¿Qué modalidad prefieres?**
   - Remoto.
   - Híbrido.
   - Presencial.
   - Me es indiferente.

4. **¿Qué áreas o habilidades quieres usar?**
   - Selección múltiple desde las habilidades del perfil.
   - Opción para agregar una habilidad.

5. **¿Qué ofertas no quieres recibir?**
   - Ubicaciones.
   - Modalidades.
   - Rangos salariales.
   - Sectores o tipos de puesto.

6. **¿Qué tan flexible es tu búsqueda?**
   - Muy específica.
   - Moderadamente flexible.
   - Quiero explorar opciones distintas.

7. **¿Quieres recibir oportunidades parecidas a las que guardes o consultes?**
   - Sí.
   - Solo si coinciden con mis habilidades.
   - No por ahora.

### Reglas de personalización

- Las preguntas deben aparecer después del perfil mínimo o al iniciar la primera búsqueda.
- Debe existir “Saltar por ahora”.
- Se debe guardar la fecha de actualización de preferencias.
- El usuario debe poder editar sus respuestas.
- Las recomendaciones deben explicar qué señal fue usada.

### Explicación visible al usuario

Cada recomendación debería poder mostrar una razón breve:

> “Te la mostramos porque coincide con React y TypeScript, está dentro de tu modalidad preferida y se encuentra en tu rango salarial.”

La explicación es más importante que mostrar únicamente un porcentaje.

## 7. Línea de trabajo D — Feedback y encuesta de satisfacción

### No preguntar solo “¿te gustó?”

La satisfacción debe medirse en distintos momentos:

1. Después de revisar varias recomendaciones.
2. Después de guardar una oferta.
3. Después de postularse.
4. Después de descartar una oferta.

### Feedback mínimo por recomendación

Después de que el usuario revise 3 o 5 recomendaciones:

> “¿Qué tan útiles fueron estas recomendaciones?”

Escala de 1 a 5:

- 1 — Nada útiles.
- 2 — Poco útiles.
- 3 — Regular.
- 4 — Útiles.
- 5 — Muy útiles.

Pregunta opcional:

> “¿Qué influyó más en tu respuesta?”

- Coincidían con mis habilidades.
- Coincidían con mi salario esperado.
- Coincidían con mi ubicación o modalidad.
- Eran ofertas relevantes, aunque no perfectas.
- No se parecían a lo que busco.
- Faltaban ofertas de mi área.

### Métricas recomendadas

- **Utilidad percibida:** promedio de la escala 1–5.
- **Tasa de clic:** recomendaciones abiertas / recomendaciones mostradas.
- **Tasa de guardado:** ofertas guardadas / ofertas abiertas.
- **Tasa de postulación:** postulaciones / ofertas abiertas.
- **Tasa de descarte:** ofertas descartadas / ofertas mostradas.
- **Precisión percibida:** proporción de respuestas 4 o 5.
- **NPS adaptado:** “¿Qué tan probable es que recomiendes esta función a otra persona?” escala 0–10.

Para la tesis, la métrica principal recomendada es la utilidad percibida promedio y como métricas secundarias el clic, guardado y postulación.

## 8. Línea de trabajo E — Backend y contrato de datos

### Endpoints que deben definirse

#### Preferencias

```text
GET  /api/v1/profile/{userId}/preferences
PUT  /api/v1/profile/{userId}/preferences
```

Payload sugerido:

```json
{
  "goal": "career_growth",
  "priority": "salary",
  "preferredJobTypes": ["Remote", "Hybrid"],
  "targetSkills": ["React", "TypeScript"],
  "excludedTerms": ["ventas"],
  "salaryMinimum": 3000,
  "flexibility": "moderate"
}
```

#### Feedback de recomendaciones

```text
POST /api/v1/recommendations/feedback
```

Payload sugerido:

```json
{
  "recommendationId": "...",
  "userId": "...",
  "event": "viewed",
  "rating": 4,
  "reason": "matches_skills",
  "createdAt": "2026-08-25T12:00:00Z"
}
```

Eventos mínimos:

- `shown`
- `viewed`
- `saved`
- `applied`
- `dismissed`
- `rated`

#### Postulaciones del candidato

```text
GET /api/v1/recruitment/applications/mine
```

Este endpoint debe usar el usuario autenticado del JWT y no aceptar un `candidateId` arbitrario desde el cliente.

### Inconsistencia que debe corregirse

Actualmente el frontend usa estados:

```text
Applied, Approved, Selected, Rejected
```

El backend usa:

```text
Pending, Accepted, Selected, Rejected
```

Debe elegirse un contrato único. Recomendación:

```text
Pending, Accepted, Selected, Rejected
```

El frontend puede mostrar etiquetas amigables:

```text
Pending   → En revisión
Accepted  → Avanzaste de etapa
Selected  → Seleccionado
Rejected  → No seleccionado
```

## 9. Plan de validación con 80 usuarios

### Objetivo de la validación

Evaluar si los usuarios:

- Entienden el propósito de Llanqui.
- Pueden completar su perfil.
- Entienden por qué reciben una recomendación.
- Consideran útiles las recomendaciones.
- Pueden encontrar una oferta y postularse.
- Perciben una mejora frente a una búsqueda laboral tradicional.

### Muestra sugerida

Para 80 participantes:

- 60 candidatos o personas en búsqueda laboral.
- 20 representantes de empresas o reclutadores.

Dentro de los 60 candidatos:

- 20 con poca experiencia laboral.
- 20 con experiencia intermedia.
- 20 con experiencia avanzada o en transición laboral.

Registrar como variables de segmentación:

- Edad por rangos.
- Nivel de experiencia.
- Área profesional.
- Uso previo de plataformas de empleo.
- Modalidad de trabajo preferida.

No recolectar más datos personales de los necesarios para el análisis.

### Fases

#### Fase 1 — Piloto de 5 usuarios

Antes de contactar a los 80:

- Probar login y registro.
- Completar perfil.
- Responder preferencias.
- Ver recomendaciones.
- Abrir detalle.
- Guardar o postularse.
- Responder feedback.

Corregir problemas críticos antes de continuar.

#### Fase 2 — Prueba controlada con 80 usuarios

Cada candidato debe completar estas tareas:

1. Crear una cuenta o iniciar sesión.
2. Completar el perfil mínimo.
3. Responder las preguntas de preferencias.
4. Revisar cinco recomendaciones.
5. Explicar por qué recibió una recomendación.
6. Guardar la recomendación más útil.
7. Descartar una recomendación poco relevante.
8. Abrir el detalle de una oferta.
9. Postularse a una oferta.
10. Responder la encuesta de satisfacción.

Los representantes de empresa deben:

1. Crear o revisar el perfil de organización.
2. Publicar o revisar una vacante.
3. Revisar postulantes.
4. Cambiar el estado de una postulación.
5. Evaluar si la información del candidato es suficiente.

### Cuestionario posterior para candidatos

Usar una escala de 1 a 5:

1. Fue fácil completar mi perfil.
2. Entendí qué información necesitaba Llanqui.
3. Las recomendaciones coincidieron con mis intereses.
4. Las recomendaciones coincidieron con mis habilidades.
5. Las recomendaciones coincidieron con mi modalidad preferida.
6. Entendí por qué se me mostró cada oferta.
7. Encontré al menos una oferta relevante.
8. Me resultó fácil revisar el detalle de una oferta.
9. Me resultó fácil postularme.
10. Considero útil recibir recomendaciones personalizadas.

Preguntas adicionales:

11. ¿Qué fue lo más útil de la experiencia?
12. ¿Qué fue lo más confuso?
13. ¿Qué información faltó en las recomendaciones?
14. ¿Qué cambiarías de Llanqui?
15. ¿Qué tan probable es que recomiendes esta función a otra persona? Escala 0–10.

### Cuestionario posterior para organizaciones

1. Fue fácil publicar o revisar una vacante.
2. La información del candidato fue suficiente.
3. El seguimiento de postulaciones fue comprensible.
4. Los estados del proceso fueron claros.
5. La plataforma facilita contactar candidatos.
6. La información mostrada ayuda a tomar decisiones.
7. Usaría Llanqui para gestionar procesos de selección.

### Métricas de éxito sugeridas

- Al menos 85% completa las tareas principales sin ayuda.
- Al menos 70% encuentra una recomendación relevante.
- Promedio mínimo de 3.5/5 en utilidad percibida.
- Al menos 60% entiende correctamente por qué recibió una recomendación.
- Al menos 50% guarda o abre una recomendación.
- Al menos 40% llega al flujo de postulación.
- No más de 10% abandona por problemas técnicos.

Estos valores son metas de evaluación, no resultados anticipados.

## 10. Cronograma de siete días

### Día 1 — Alinear alcance y contratos

- Congelar el flujo que se evaluará.
- Revisar endpoints actuales en Swagger.
- Definir estados oficiales de postulaciones.
- Definir perfil mínimo y perfil recomendado.
- Crear issues o tareas técnicas para backend y frontend.

**Entregable:** contrato funcional aprobado y lista de bloqueantes.

### Día 2 — Preferencias y perfil

- Diseñar el componente de preguntas rápidas.
- Guardar preferencias temporalmente en frontend si el endpoint aún no existe.
- Definir payload definitivo para backend.
- Mostrar progreso y mensajes de perfil incompleto.

**Entregable:** flujo de perfil mínimo + preferencias navegable.

### Día 3 — Recomendaciones explicables

- Integrar preferencias al request del recomendador.
- Mostrar razones de recomendación.
- Definir eventos de interacción.
- Crear el componente de feedback.

**Entregable:** usuario puede ver una recomendación, entenderla y evaluarla.

### Día 4 — Backend y persistencia

- Implementar endpoint de preferencias.
- Implementar feedback de recomendaciones.
- Implementar `GET /recruitment/applications/mine`.
- Alinear estados frontend/backend.
- Actualizar contratos y Swagger.

**Entregable:** datos principales persistidos en backend.

### Día 5 — Integración y corrección

- Conectar dashboard, búsqueda, detalle, postulación y recomendaciones.
- Eliminar datos demostrativos.
- Probar errores de API y estados vacíos.
- Revisar responsive y accesibilidad.

**Entregable:** flujo completo de candidato funcional.

### Día 6 — Piloto

- Ejecutar la prueba con 5 usuarios.
- Registrar bloqueos y observaciones.
- Ajustar preguntas, copy y navegación.
- Congelar la versión para validación.

**Entregable:** informe corto del piloto y correcciones aplicadas.

### Día 7 — Instrumento y preparación de 80 usuarios

- Publicar cuestionario final.
- Preparar consentimiento informado.
- Preparar instrucciones para moderadores.
- Definir distribución de los 80 participantes.
- Preparar hoja de resultados y códigos de participante.

**Entregable:** protocolo listo para ejecutar la validación formal.

## 11. Backlog priorizado

### P0 — Hacer primero

- [ ] Alinear `Pending/Accepted` contra `Applied/Approved`.
- [ ] Definir perfil mínimo para recomendaciones.
- [ ] Definir preguntas de preferencias.
- [ ] Definir endpoint de feedback.
- [ ] Crear protocolo de validación con 80 usuarios.
- [ ] Ejecutar piloto con 5 usuarios.

### P1 — Hacer esta semana

- [ ] Implementar preferencias en frontend.
- [ ] Implementar razones de recomendación.
- [ ] Implementar encuesta de utilidad.
- [ ] Implementar `GET /recruitment/applications/mine`.
- [ ] Conectar postulaciones reales al dashboard.
- [ ] Consolidar sistema visual.
- [ ] Revisar responsive y accesibilidad.

### P2 — Después del piloto

- [ ] Recalibrar pesos del modelo híbrido.
- [ ] Analizar comportamiento colaborativo.
- [ ] Añadir exclusiones y preferencias avanzadas.
- [ ] Crear dashboard de métricas del recomendador.
- [ ] Ejecutar segunda ronda de validación.

## 12. Riesgos y decisiones

### Riesgo: perfil incompleto

**Decisión:** no bloquear la exploración general, pero sí explicar que la personalización será limitada.

### Riesgo: pocos datos colaborativos

**Decisión:** iniciar con contenido + preferencias explícitas y activar la señal colaborativa gradualmente.

### Riesgo: feedback insuficiente

**Decisión:** pedir feedback después de un pequeño conjunto de recomendaciones, no después de cada tarjeta.

### Riesgo: el usuario confía demasiado en el porcentaje

**Decisión:** mostrar razones concretas junto al porcentaje o reemplazarlo por “coincide con tus habilidades”.

### Riesgo: datos de postulaciones solo locales

**Decisión:** priorizar `GET /recruitment/applications/mine` en backend antes de presentar la funcionalidad como historial definitivo.

## 13. Definición de terminado de la semana

La semana se considera completada cuando:

- El frontend tiene una identidad visual coherente en Inicio, Empleos, Detalle, Postulaciones y Comunidad.
- El candidato puede completar su perfil mínimo y preferencias.
- El motor recibe señales de perfil y preferencias.
- Cada recomendación tiene una explicación visible.
- El usuario puede calificar la utilidad de las recomendaciones.
- Las postulaciones se consultan desde backend o la limitación local está claramente documentada.
- Se ejecutó un piloto con 5 usuarios.
- El cuestionario para 80 usuarios está aprobado.
- Existen métricas, criterios de éxito y responsables para analizar los resultados.

