# 4.2.6.3. Guías de estilos

A continuación, se presentan las directrices que garantizan la coherencia visual y de
interacción de la plataforma **Llanqui (ProConnect)** en todas sus vistas y componentes.
Estas guías constituyen la fuente de verdad del equipo de frontend: cualquier
componente nuevo o refactorizado debe ajustarse a ellas sin excepción. Los valores aquí
documentados se implementan como *design tokens* en
`src/app/shared/assets/variables.css`.

---

## 4.2.6.3.1. Identidad y principios

La interfaz se dirige a **todo tipo de trabajadores del Perú** —profesionales,
operativos y personas con poca o ninguna formación— además de a las empresas que los
contratan. Por ello, los tres principios rectores son:

| Principio | Descripción |
|-----------|-------------|
| **Accesible y claro** | Lenguaje plano, jerarquía evidente y controles grandes. Nada debe requerir conocimiento técnico para entenderse. |
| **Confiable y sobrio** | Estética limpia, sin recargo visual. Transmite seriedad sin parecer un portal corporativo frío. |
| **Identidad propia** | El producto **no debe parecerse a LinkedIn ni a Computrabajo**. La personalidad se logra con la paleta azul profunda, la tipografía única y el tratamiento diferenciado de la IA. |

---

## 4.2.6.3.2. Paleta de colores

La paleta oficial es la **única** fuente de color permitida. Los nombres heredados
(`--main-color*`, `--gray-*`, etc.) se mantienen solo como alias de compatibilidad y se
eliminan a medida que cada componente se refactoriza.

### Colores de marca

| Token | HEX | Uso |
|-------|-----|-----|
| `--color-primary` | `#1E2BAA` | Azul profundo. Paneles, logotipo y elementos clave. |
| `--color-primary-dark` | `#16217A` | Estados activos y *hover* de elementos primarios. |
| `--color-accent` | `#2D3AC7` | Botones de acción principal. |
| `--color-accent-hover` | `#3D4DD4` | *Hover* de botones de acción. |
| `--color-lavender` | `#B8C0E8` | Acentos decorativos suaves. |

### Superficie y texto

| Token | HEX | Uso |
|-------|-----|-----|
| `--color-bg` | `#E8EAF2` | Fondo general de la aplicación. |
| `--color-surface` | `#FFFFFF` | Tarjetas, formularios y paneles. |
| `--color-text-primary` | `#0F0F1A` | Títulos y texto principal. |
| `--color-text-secondary` | `#4A5080` | Texto de apoyo. |
| `--color-text-muted` | `#8890B8` | Etiquetas y *placeholders*. |
| `--color-border` | `#D0D4E8` | Bordes de inputs y divisores. |

### Colores de estado

El naranja vive **exclusivamente** como color de estado/alerta; **nunca** se usa como
branding.

| Token | HEX | Uso |
|-------|-----|-----|
| `--color-state-success` / `-dark` | `#3B9C20` / `#307D1B` | Éxito, confirmaciones, aprobado. |
| `--color-state-error` / `-dark` | `#D22626` / `#B01616` | Errores y acciones destructivas. |
| `--color-state-warning` / `-dark` | `#DCAE08` / `#C29810` | Advertencias. |
| `--color-state-alert` / `-dark` | `#EC4E10` / `#D0420E` | Acento de alerta puntual. |

> **Regla:** no se permiten colores fuera de esta paleta. Cualquier matiz adicional debe
> derivarse de un token existente (p. ej. con opacidad: `rgba(45, 58, 199, 0.08)`).

---

## 4.2.6.3.3. Tipografía

Se utiliza **una sola familia tipográfica** en toda la plataforma: **Inter**
(`--font-family: 'Inter', sans-serif`). Se eliminó la familia *Bricolage Grotesque*.

### Pesos

| Token | Valor | Uso |
|-------|-------|-----|
| `--fw-regular` | 400 | Cuerpo de texto. |
| `--fw-medium` | 500 | Énfasis ligero, enlaces de navegación. |
| `--fw-semibold` | 600 | Subtítulos, botones, etiquetas. |
| `--fw-bold` | 700 | Títulos y números destacados. |

### Escala

| Token | Tamaño | Uso |
|-------|--------|-----|
| `--fs-caption` | 12 px | Notas, metadatos, etiquetas. |
| `--fs-body-sm` | 14 px | Texto secundario y de formularios. |
| `--fs-body` | 16 px | Cuerpo base. |
| `--fs-subtitle` | 20 px | Subtítulos de sección. |
| `--fs-title` | 28 px | Títulos de página. |
| `--fs-display` | 40 px | Encabezados destacados. |

---

## 4.2.6.3.4. Espaciado y maquetación

El sistema de espaciado se basa en una **unidad de 8 px**.

| Token | Valor |
|-------|-------|
| `--space-1` … `--space-6` | 8 / 16 / 24 / 32 / 40 / 48 px |

- Las secciones usan **48 px** de relleno vertical y **24 px** horizontal en móvil.
- El ancho de página se unifica con tokens para no dejar espacio muerto a los lados:
  - `--page-max: 1200px` para feeds y listas anchas.
  - `--page-max-narrow: 820px` para formularios y lectura (65–75 caracteres por línea).
  - `--page-gutter: clamp(16px, 4vw, 32px)` como relleno lateral fluido.

---

## 4.2.6.3.5. Forma, bordes y sombras

| Elemento | Radio | Token |
|----------|-------|-------|
| Botones | 6 px | `--radius-button` |
| Tarjetas e inputs | 8 px | `--radius-card` / `--radius-input` |
| Navbar | 0 px | `--radius-navbar` |

- **Sombras:** se prohíben las sombras salvo **una única** permitida en las tarjetas de
  contenido principal: `--shadow-card: 0 1px 3px rgba(30, 43, 170, 0.08)`.
- La separación entre bloques se logra con **bordes de 1 px** (`#D0D4E8`), no con sombras.
- Los botones **nunca** llevan radio del 100 % (forma de píldora completa).

---

## 4.2.6.3.6. Componentes base

### Botones

| Tipo | Estilo | Hover |
|------|--------|-------|
| **Primario** | Fondo `--color-accent`, texto blanco, radio 6 px. | `--color-accent-hover`. |
| **Secundario** | Fondo transparente + borde 1 px `--color-accent`. | Fondo `--color-bg`. |
| **Destructivo** | Fondo/borde `--color-state-error`. | `--color-state-error-dark`. |
| **Éxito** | Fondo `--color-state-success`. | `--color-state-success-dark`. |

Estados deshabilitados: opacidad reducida y `cursor: not-allowed`.

### Inputs y formularios

- Fondo `--color-bg`, borde 1 px `--color-border`, radio 8 px.
- *Focus*: borde `--color-accent` y anillo suave `0 0 0 3px rgba(45, 58, 199, 0.12)`.
- Toda etiqueta (`label`) usa 12 px, peso 600, color `--color-text-secondary`.

### Tarjetas (cards)

- Fondo `--color-surface`, borde 1 px `--color-border`, radio 8 px y `--shadow-card`.

### Navbar (navegación global)

Es la **única** navegación global de la plataforma; **no** existen *sidebars* ni doble menú.

- **Estructura:** logo a la izquierda · **máximo 4 enlaces** al centro · acciones de
  usuario a la derecha (notificaciones + avatar + CTA).
- Fondo blanco, borde inferior de 1 px, **nunca cambia al hacer scroll**.
- Los enlaces se filtran por rol (empleado / organización); la acción primaria del rol
  vive en el botón CTA y no se duplica entre los enlaces.
- En móvil colapsa a un **menú vertical** cuyo botón se transforma en una **X** al abrirse
  (no se usa el clásico ícono hamburguesa estático).

---

## 4.2.6.3.7. Iconografía

- Biblioteca única: **Lucide**.
- Tamaño base **20 px** y grosor de trazo **1.5**.
- **Prohibido el uso de emojis** en cualquier parte de la interfaz de producción.
- No se utilizan ilustraciones de stock.

---

## 4.2.6.3.8. Componentes de Inteligencia Artificial

Las funciones de IA reciben un tratamiento visual **diferenciado y discreto**:

- Borde izquierdo de **3 px** color `--color-ai-border` (`#2D3AC7`).
- Pequeña etiqueta **"IA"** en mayúsculas, 11 px, peso 600, color `--color-ai-label`.
- Bloques de sugerencia con fondo `--color-ai-bg` (`#F0F2FA`) y borde 1 px
  `--color-ai-outline` (`#B8C0E8`).
- **Nunca** se usan íconos de destello, estrella ni adornos decorativos para señalar IA:
  solo la etiqueta y el borde.

---

## 4.2.6.3.9. Movimiento e interacción

- Transición **única** permitida: `--transition: all 0.15s ease`, aplicada solo a cambios
  de estado (hover, focus, active).
- **Prohibidas** las animaciones decorativas (parpadeos, brillos, partículas flotantes).
- Se respeta `prefers-reduced-motion`: cuando el usuario lo solicita, las animaciones se
  desactivan.
- La retroalimentación de las acciones debe ser inmediata y clara (estados de carga,
  *toasts* de éxito/error), evitando diálogos `alert()` del navegador.

---

## 4.2.6.3.10. Diseño adaptable (responsive)

- Enfoque *mobile-first* sobre el sistema de 8 px.
- Puntos de quiebre habituales: 640 px, 768 px, 820 px y 980 px según el componente.
- Las rejillas multicolumna (feed, tablero de postulaciones, perfil) colapsan
  progresivamente a una sola columna en pantallas estrechas.
- Los anchos máximos (`--page-max`, `--page-max-narrow`) mantienen la legibilidad y la
  alineación con el navbar en todas las resoluciones.

---

## 4.2.6.3.11. Accesibilidad

- Contraste suficiente entre texto y fondo según la jerarquía de color definida.
- Áreas táctiles cómodas (botones e íconos de acción de 36–40 px).
- Etiquetas `aria-label` en botones de solo ícono (p. ej. notificaciones, menú).
- Estados de *focus* siempre visibles mediante el anillo de enfoque.
- Lenguaje plano y directo, coherente con la audiencia diversa de la plataforma.

---

## 4.2.6.3.12. Restricciones absolutas

Las siguientes prácticas están **prohibidas** en todo el frontend:

1. **Gradientes**, salvo la excepción ya existente del panel izquierdo del login.
2. **Glassmorphism** o desenfoques de fondo (*backdrop blur*).
3. **Animaciones decorativas**; solo se permiten transiciones de estado de 0.15 s.
4. **Ilustraciones de stock** y **emojis**.
5. **Colores fuera de la paleta** oficial.
6. Cualquier diseño que **imite a LinkedIn o Computrabajo**.

---

## 4.2.6.3.13. Flujo de trabajo de diseño

Al crear o modificar un componente, el procedimiento acordado es:

1. Presentar primero un **plan de 3 líneas**: estructura, colores usados y comportamiento.
2. Implementar el código respetando los tokens de `variables.css`.
3. Si el resultado parece una plantilla genérica, **rediseñarlo** antes de integrarlo.

> Los wireframes y mockups de referencia de cada vista se encuentran en
> `design-artifacts/wireframes/` y `design-artifacts/mockups/` (abrir el `index.html` de
> cada carpeta).
