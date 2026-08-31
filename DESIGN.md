# Llanqui design system

## Direction

**Guided opportunity workspace.** Llanqui se comporta como una mesa de trabajo para avanzar en una oportunidad laboral, no como una red social ni un feed. La interfaz prioriza la siguiente acción, el estado verificable y el contexto de cada empleo o postulación.

## Palette

- `Llanqui blue` — `#2838D3`: acciones principales, navegación activa y superficies de decisión.
- `Llanqui blue deep` — `#17237E`: hover, contraste y énfasis de texto sobre azul.
- `Opportunity lime` — `#B9EF4A`: progreso, confirmación y señales positivas; nunca como color de texto de cuerpo.
- `Paper` — `#F6F7FB`: fondo de aplicación.
- `Surface` — `#FFFFFF`: formularios, listas y paneles operativos.
- `Ink` — `#15203B`: texto y jerarquía principal.

## Typography

- Inter para interfaz, datos y encabezados. Usa pesos y escala antes que cambios de familia.
- Títulos compactos, con tracking negativo moderado; texto de ayuda en tono secundario legible.
- La información de empleo utiliza medidas tabulares y etiquetas breves para facilitar el escaneo.

## Layout and components

- Navbar superior como ancla global; en móvil se transforma en panel de navegación.
- Contenedor amplio de hasta 1360 px, con espacio de lectura y paneles laterales solo cuando aportan una decisión concreta.
- Superficies con radios de 14–16 px; se usa borde o sombra suave, no ambos como decoración redundante.
- Botones principales de 46 px o más; controles de formulario de 48 px o más.
- JobCard, Card, Badge, ProgressBar, EmptyState y ProfileSection comparten los mismos tokens de espaciado, foco y estados.

## Signature interaction

La **ruta de oportunidad** conecta visualmente el siguiente paso y la acción principal. Se expresa como una línea azul/lima discreta en el dashboard y transiciones cortas de estado; no se usa como decoración repetida en listados.

## Motion

- Una transición breve de entrada para el contenido principal y realce en hover para acciones disponibles.
- Estados cargando, vacío, error y éxito permanecen visibles por defecto.
- Se reduce a transiciones instantáneas con `prefers-reduced-motion`.

## Constraints

- Datos, rutas, autenticación y endpoints existentes se conservan.
- Nada de métricas, perfiles, empresas u ofertas ficticias.
- Las capacidades que el backend no ofrece se explican como estados de producto, sin controles engañosos.
