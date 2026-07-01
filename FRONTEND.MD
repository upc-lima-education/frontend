# Arquitectura y Mapeo del Frontend - ProConnect (Llanqui)

Este documento sirve como un mapa detallado y guía de referencia para la **reestructuración masiva** del frontend. Contiene el inventario completo de rutas, vistas (páginas y componentes asociados), fuentes de datos simulados (mocks), servicios de API y la estructura de archivos actual.

---

## 1. Estructura General del Proyecto

El frontend está desarrollado sobre **Vue 3 (Composition API, `<script setup>`)** con **TypeScript**, **Vite** como empaquetador, **Pinia** para la gestión del estado global, **Vue Router** para la navegación e internacionalización mediante **Vue I18n**.

A continuación se muestra el árbol de archivos completo del código fuente (`src/`):

```text
src/
├── App.vue (Componente raíz con el layout de la app)
├── main.ts (Punto de entrada de inicialización de Vue, Pinia, Router e i18n)
└── app/
    ├── auth/ (Autenticación y Registro)
    │   ├── components/ (Brand panel, Google Login, formularios de login/registro)
    │   ├── composables/ (Lógica de autenticación reactiva)
    │   ├── constants/ (Constantes de autenticación)
    │   ├── model/ (Modelos y DTOs de autenticación)
    │   ├── pages/ (Páginas de login, registro, recuperación de contraseña)
    │   └── services/ (Guard, Interceptor Axios, Servicio, Pinia Store)
    ├── cv/ (Generación de Currículum Vitae con IA)
    │   ├── components/ (Vista del CV y generador interactivo)
    │   ├── composables/ (Manejo del estado del paso a paso del CV)
    │   ├── model/ (Tipos y modelos para el CV)
    │   └── services/ (Llamadas API de generación y descarga)
    ├── job/ (Gestión y Búsqueda de Ofertas Laborales)
    │   ├── components/ (Tarjetas, filtros, formularios de publicación y detalle)
    │   ├── enums/ (Enums para salario, experiencia, estatus del empleo)
    │   ├── model/ (Peticiones y respuestas de API para empleos)
    │   ├── pages/ (Búsqueda de empleos, detalle y publicación)
    │   └── services/ (Servicios de API para ofertas de empleo)
    ├── message/ (Sistema de Mensajería / Chat Interno)
    │   ├── components/ (Elementos de lista, burbujas de chat, entrada de texto)
    │   ├── model/ (Modelos de mensaje y conversación)
    │   ├── pages/ (Vistas de chat para organizaciones y empleados)
    │   └── services/ (Servicios de chat, actualmente stubs a definir)
    ├── news/ (Noticias y Panel Principal)
    │   ├── components/ (Tarjeta de noticias)
    │   ├── composables/ (Estado del feed de noticias)
    │   ├── model/ (Modelos de datos para noticias)
    │   ├── pages/ (Página principal del feed de noticias)
    │   └── services/ (Servicio de noticias con datos locales simulados)
    ├── profile/ (Perfil de Usuario y Empresa)
    │   ├── mock/ (Datos quemados de empresas reales para demostraciones)
    │   ├── model/ (Estructures de datos para perfiles)
    │   └── services/ (Servicio para creación y edición de perfiles)
    ├── public/ (Páginas de Acceso Público y Comunes)
    │   ├── not_found/ (Página de error 404)
    │   └── pages/ (Página de Inicio / Landing page pública)
    ├── recruitment/ (Seguimiento de Candidatos y Postulaciones)
    │   ├── components/ (Tarjetas de aplicante y cajón de detalle)
    │   ├── composables/ (Manejo de estados y pipeline Kanban)
    │   ├── enums/ (Estados de la postulación: Applied, Approved, Selected, Rejected)
    │   ├── model/ (Estructuras de datos de postulación y notificaciones)
    │   ├── pages/ (Página de seguimiento tipo Kanban para empresas)
    │   ├── services/ (Servicio de reclutamiento y envío de alertas de WhatsApp)
    │   └── utils/ (Utilidad para exportar postulantes aprobados)
    ├── settings/ (Panel de Configuración de Perfil, Pagos e Impulso de Ofertas)
    │   ├── components/ (Formularios de edición, vista general, impulso de empleos, notificaciones)
    │   ├── composables/ (Lógica de edición del perfil y pestañas de configuración)
    │   └── pages/ (Página contenedora de configuración por pestañas)
    └── shared/ (Componentes, Assets y Servicios Transversales)
        ├── assets/ (Estilos CSS globales y variables, iconos SVG)
        ├── components/ (Navbar, Sidebar, Diálogos modales, Tooltips, Headers)
        ├── composables/ (Composables globales como Layout y Logout)
        ├── data/ (JSON de Ubigeo nacional de Perú)
        ├── locale/ (Configuraciones y diccionarios i18n en ES/EN)
        ├── router/ (Configuración y constantes de rutas)
        └── services/ (Cliente Axios base, Verificador de conexión, Ubigeo y pasarela de pago mock)
```

---

## 2. Sistema de Enrutamiento y Roles

La configuración de rutas se gestiona centralizadamente en [index.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/router/index.ts) utilizando las constantes declaradas en [route-constants.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/router/route-constants.ts). 

### Tabla de Rutas

| Ruta URL | Nombre de Ruta | Componente de Página (Vista) | Rol Permitido (`meta.roles`) | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `/` | - | *(Redirecciona a `/home`)* | Cualquiera | Redirección de la raíz. |
| `/home` | `home` | [home.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/public/pages/home.page.vue) | Cualquiera | Landing page pública. |
| `/sign-in` | `sign-in` | [sign-in.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/sign-in.page.vue) | Invitado | Pantalla de inicio de sesión manual y Google OAuth. |
| `/sign-up` | `sign-up` | [sign-up.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/sign-up.page.vue) | Invitado | Registro unificado con selector obligatorio de rol. |
| `/forgot-password` | `forgot-password` | [forgot-password.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/forgot-password.page.vue) | Invitado | Recuperación de contraseña por correo electrónico. |
| `/auth/callback` | `auth-callback` | [google-callback.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/google-callback.page.vue) | Invitado | Receptor de tokens JWT tras el login con Google OAuth. |
| `/news` | `news` | [news.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/news/pages/news.page.vue) | Autenticado | Feed de novedades y dashboard post-login. |
| `/profile` | - | *(Redirecciona a `/settings`)* | Autenticado | Acceso directo al perfil. |
| `/settings` | `settings` | [settings.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/settings/pages/settings.page.vue) | Autenticado | Panel unificado (Detalles, Edición, Pagos, Notificaciones). |
| `/job/:id` | `job-detail-company` | [job-detail.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/pages/job-detail.page.vue) | Autenticado | Vista detallada de una oferta de empleo para postularse. |
| `/job-search` | `job-search` | [find-job.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/pages/find-job.page.vue) | `employee` | Buscador de ofertas exclusivo para candidatos. |
| `/job-publish` | `job-publish` | [publish-job.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/pages/publish-job.page.vue) | `organization` | Formulario de creación de vacantes para empresas. |
| `/applications` | `recruitment-applications` | [applications-tracking.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/pages/applications-tracking.page.vue) | `organization` | Tablero Kanban para gestión de postulantes por la empresa. |
| `/message/c` | `message-company` | [messaging-company.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/pages/messaging-company.page.vue) | `organization` | Bandeja de entrada de chat para empresas. |
| `/message/e` | `message-user` | [messaging-employee.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/pages/messaging-employee.page.vue) | `employee` | Bandeja de entrada de chat para candidatos. |
| `/not-found` | `not-found` | [not-found.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/public/not_found/pages/not-found.page.vue) | Cualquiera | Error 404 si la ruta no existe. |

### Guardia de Navegación (`authenticationGuard`)
Ubicada en [authentication.guard.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/services/authentication.guard.ts), intercepta cada transición de ruta:
- Extrae el token del `localStorage` y valida el estado de sesión en la store de Pinia.
- Si la ruta requiere un rol específico (`meta.roles`), verifica que el `userType` del usuario coincida (`employee` o `organization`). Si no coincide, redirige al Dashboard (`/news`).
- Si un usuario autenticado intenta ingresar a rutas de invitados (`/sign-in`, `/sign-up`), es redirigido a `/news`.

---

## 3. Inventario Detallado de Vistas (Páginas y Componentes)

### 3.1. Módulo de Autenticación (`src/app/auth`)
*   **[sign-in.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/sign-in.page.vue)**
    *   **Propósito:** Interfaz de entrada a la plataforma.
    *   **Subcomponentes:**
        *   [auth-brand-panel.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/components/auth-brand-panel.component.vue): Banner izquierdo publicitario de la marca.
        *   [sign-in-form.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/components/sign-in/sign-in-form.component.vue): Formulario manual de credenciales con validaciones básicas.
        *   [google-login.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/components/google-login.component.vue): Botón que redirige al flujo OAuth de Google.
    *   **Lógica Relacionada:** Composable `useSignInForm.ts` para validación y llamada al servicio.
*   **[sign-up.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/sign-up.page.vue)**
    *   **Propósito:** Creación de nuevas cuentas. Integra el selector obligatorio de roles.
    *   **Subcomponentes:**
        *   [auth-brand-panel.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/components/auth-brand-panel.component.vue).
        *   [sign-up-unified.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/components/sign-up/sign-up-unified.component.vue): Combina la selección visual de roles ("Candidato" o "Empresa") y el formulario de credenciales.
        *   [google-login.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/components/google-login.component.vue): Bloquea el registro de Google OAuth si el usuario no ha seleccionado un rol previamente.
    *   **Lógica Relacionada:** Composable `useSignUpUnified.ts`.
*   **[forgot-password.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/forgot-password.page.vue)**
    *   **Propósito:** Interfaz para solicitar el enlace de restablecimiento de contraseña.
    *   **Subcomponentes:** [forgot-password.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/components/password/forgot-password.component.vue).
*   **[google-callback.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/pages/google-callback.page.vue)**
    *   **Propósito:** Pantalla de espera transicional. Captura los query params de Google (`accessToken`, `refreshToken`, `userType`, `error`) y los guarda en la store de Pinia para iniciar sesión formalmente.

### 3.2. Módulo de Configuración y Perfil (`src/app/settings` & `src/app/cv`)
El perfil y configuraciones del usuario se controlan en la vista multipestaña **[settings.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/settings/pages/settings.page.vue)**.
*   **Pestaña 1: Vista General (`ProfileOverviewComponent`)**
    *   **Propósito:** Muestra los datos consolidados del perfil de usuario (habilidades, educación, experiencia si es candidato; datos fiscales, RUC, sector y verificación si es organización).
    *   **Subcomponentes:**
        *   [cv-generator-card.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/cv/components/cv-generator-card.component.vue): Generador interactivo de CV con IA. **Solo visible para Candidatos (`employee`)**. Permite ver el avance, ingresar datos e iniciar la descarga del PDF estructurado localmente.
*   **Pestaña 2: Editar Perfil (`ProfileEditComponent`)**
    *   **Propósito:** Formulario completo de actualización de datos. Utiliza [ubigeo.json](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/data/ubigeo.json) para autocompletar regiones, provincias y distritos del Perú.
*   **Pestaña 3: Configuración de Notificaciones (`NotificationSettingsComponent`)**
    *   **Propósito:** Controla los canales de comunicación activos (Alertas in-app, correos y notificaciones de postulación por WhatsApp).
*   **Pestaña 4: Métodos de Pago e Impulso (`JobBoostSettingsComponent` / `PaymentsSettingsComponent`)**
    *   **Propósito:** Si el usuario es Empresa, renderiza la pantalla de impulso destacada (`JobBoostSettingsComponent`) para pagar mediante tarjeta mockada y posicionar una oferta de empleo en los primeros lugares. Para candidatos, renderiza la pasarela común de planes (`PaymentsSettingsComponent`).

### 3.3. Módulo de Ofertas de Trabajo (`src/app/job`)
*   **[find-job.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/pages/find-job.page.vue)**
    *   **Propósito:** Buscador interactivo de puestos de trabajo para el candidato.
    *   **Subcomponentes:**
        *   [filter-job.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/components/filter-job.component.vue): Filtros por distrito (Ubigeo), salario mínimo/máximo, rango de experiencia y tipo de jornada.
        *   [job-card-list.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/components/job-card-list.component.vue): Renderiza la cuadrícula de resultados empleando tarjetas individuales.
        *   [job-card.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/components/job-card.component.vue): Tarjeta visual del empleo que indica si la oferta está "Destacada" (Impulsada).
*   **[publish-job.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/pages/publish-job.page.vue)**
    *   **Propósito:** Formulario de creación de ofertas de trabajo para reclutadores.
    *   **Subcomponentes:**
        *   [publish-job-form.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/components/publish-job-form.component.vue): Captura campos como título, descripción, tipo de jornada, salario mínimo/máximo, geolocalización (latitud/longitud) y ubigeo.
        *   [job-preview.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/components/job-preview.component.vue): Previsualización en tiempo real del anuncio tal como lo verá el candidato.
*   **[job-detail.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/pages/job-detail.page.vue)**
    *   **Propósito:** Ficha completa de una vacante. Permite enviar una postulación (`createApplication`) y adjuntar un mensaje de presentación.

### 3.4. Módulo de Reclutamiento (`src/app/recruitment`)
*   **[applications-tracking.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/pages/applications-tracking.page.vue)**
    *   **Propósito:** Tablero de gestión de postulantes (*Applications Tracking*) con interfaz Kanban.
    *   **Subcomponentes:**
        *   [applicant-card.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/components/applicant-card.component.vue): Tarjeta compacta del postulante.
        *   [applicant-detail-drawer.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/components/applicant-detail-drawer.component.vue): Panel lateral deslizable con los datos detallados del candidato (habilidades, CV adjunto, mensaje) y botones de acción rápida para avanzar o descartar.
    *   **Lógica Relacionada:** Utilidad [export-applicants.util.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/utils/export-applicants.util.ts) para generar reportes en formato CSV de candidatos seleccionados.

### 3.5. Módulo de Mensajería (`src/app/message`)
*   **[messaging-company.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/pages/messaging-company.page.vue)** (para reclutadores) y **[messaging-employee.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/pages/messaging-employee.page.vue)** (para candidatos).
    *   **Propósito:** Chat en tiempo real entre candidatos y reclutadores.
    *   **Subcomponentes Compartidos:**
        *   [conversation-list.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/components/conversation-list.component.vue): Lista lateral de chats abiertos.
        *   [conversation-item.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/components/conversation-item.component.vue): Fila del chat con la última conversación, indicador de mensajes no leídos y foto de perfil.
        *   [message-list.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/components/message-list.component.vue): Contenedor de scroll que renderiza burbujas de diálogo.
        *   [message-bubble.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/components/message-bubble.component.vue): Estructura visual de un mensaje enviado/recibido con hora legible.
        *   [message-input.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/components/message-input.component.vue): Caja de texto adaptativa con botón de envío.

### 3.6. Módulo de Noticias / Dashboard Principal (`src/app/news`)
*   **[news.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/news/pages/news.page.vue)**
    *   **Propósito:** Vista post-login principal. Adapta las opciones del Navbar dinámicamente según el tipo de cuenta autenticada y muestra publicaciones relevantes de consejos de carrera, tendencias laborales o anuncios oficiales.
    *   **Subcomponentes:**
        *   [news-card.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/news/components/news-card.component.vue): Tarjeta responsiva que muestra la imagen, autor, contenido del blog y galería de adjuntos de la noticia.

---

## 4. Inventario de Datos Simulados (Mocks)

El sistema utiliza datos locales simulados (mocks) en diversas secciones para permitir la interacción y pruebas de la UI antes de la conexión total con endpoints del backend:

### 4.1. Perfiles de Organización Simulados
*   **Ubicación:** [organization-profiles.mock.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/profile/mock/organization-profiles.mock.ts)
*   **Estructura:** Lista de instancias del modelo `SignUpUserOrganizationRequest` representando empresas peruanas ficticias alineadas al contexto local (operativos, retail, construcción, restaurantes, logística y TI):
    1. **Minimarket Santa Rosa SAC** (Comercio / Miraflores / RUC: 20546789012)
    2. **Restaurante Don Pepe EIRL** (Restaurante / San Isidro / RUC: 20601234567)
    3. **Constructora Andina del Perú SAC** (Construcción / Surco / RUC: 20512345678)
    4. **Almacenes Logística Express SAC** (Logística / Ate / RUC: 20498765432)
    5. **Tech Solutions Perú SAC** (Tecnología / San Borja / RUC: 20776655441)

### 4.2. Solicitudes de Postulantes Simulados (Kanban)
*   **Ubicación:** [useApplicationTracking.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/composables/useApplicationTracking.ts) (función `buildMockApplications()`)
*   **Estructura:** Array de objetos simulando respuestas del tipo `ApplicationResponse[]` asociadas a vacantes activas:
    *   **Carlos Mamani** (Operario de Almacén / Estado: *Applied* / Ubicación: Ate)
    *   **Rosa Quispe** (Operario de Almacén / Estado: *Applied* / Certificación de montacargas / Ubicación: SJL)
    *   **Lucía Flores** (Mesera / Estado: *Approved* / Ubicación: Miraflores)
    *   **Jorge Huamán** (Conductor de Reparto / Estado: *Selected* / Ubicación: Comas)
    *   **María Torres** (Mesera / Estado: *Rejected* / Ubicación: Surco)

### 4.3. Ofertas Destacables para Empresas
*   **Ubicación:** [job-boost-settings.component.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/settings/components/job-boost-settings.component.vue) (función `buildMockJobs()`)
*   **Estructura:** Array de vacantes de la empresa autenticada del tipo `BoostableJob[]`, para simular el proceso de impulso de anuncios:
    *   `job-101`: "Operario de Almacén" (Estado: Activo / Destacado: No)
    *   `job-102`: "Mesera - Turno Tarde" (Estado: Activo / Destacado: Sí - 5 días restantes)
    *   `job-103`: "Conductor de Reparto" (Estado: Activo / Destacado: No)

### 4.4. Noticias del Dashboard
*   **Ubicación:** [news.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/news/services/news.service.ts) (métodos `getAllNewsTest()` y `getNewsByIdTest()`)
*   **Estructura:** Lista de objetos `NewsResponse` que contienen títulos, contenido del post de consejos laborales, imágenes de stock peruanas y avatares del autor.

### 4.5. Mensajes y Chats Abiertos
*   **Ubicación:** [messaging-company.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/pages/messaging-company.page.vue) y [messaging-employee.page.vue](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/message/pages/messaging-employee.page.vue) (funciones locales `getConversations()` y `getMessages()`)
*   **Estructura:** Objetos `ConversationResponse` y `MessageResponse` quemados en los componentes de página para posibilitar la previsualización del layout y flujo de chat (ej. conversaciones de ejemplo con "Pepe Torres" y "Maria Santa Rosa").

---

## 5. Servicios de Conexión HTTP e Integración de API

El cliente HTTP base está implementado con **Axios** en [base.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/services/base.service.ts), configurado con interceptores para inyectar automáticamente el token JWT y capturar respuestas con código HTTP 401 para la renovación del token de sesión.

### 5.1. Listado de Servicios de API

1.  **[authentication.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/auth/services/authentication.service.ts)**
    *   `POST /auth/sign-in`: Inicio de sesión manual.
    *   `POST /auth/sign-up`: Registro manual con el tipo de cuenta (`userType`).
    *   `GET /auth/google/url?userType=X&mode=Y`: Generación de la URI de Google OAuth.
    *   `GET /auth/me`: Obtención de datos del perfil autenticado a partir del token actual.
2.  **[cv.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/cv/services/cv.service.ts)**
    *   `POST /cv`: Inicia el flujo asíncrono de generación del CV con Inteligencia Artificial.
    *   `GET /cv/{id}/status`: Polleo del estado del procesamiento de IA.
    *   `GET /cv/{id}/preview`: Blob de imagen/PDF de visualización rápida.
    *   `GET /cv/{id}/download`: Descarga definitiva en formato PDF.
3.  **[job.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/job/services/job.service.ts)**
    *   `POST /job`: Publicación de una nueva oferta de trabajo.
    *   `GET /job/{id}`: Lectura completa y aumento de visualizaciones de una vacante.
    *   `PUT /job`: Actualización de datos de una oferta de trabajo.
    *   `DELETE /job/{id}`: Eliminación de la oferta laboral seleccionada.
4.  **[recruitment.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/services/recruitment.service.ts)**
    *   `POST /recruitment/applications`: Envío de postulación a una oferta.
    *   `POST /recruitment/applications/{id}/approve`: Aprueba postulante (avanza en pipeline).
    *   `POST /recruitment/applications/{id}/reject`: Rechaza postulante del proceso.
    *   `POST /recruitment/applications/{id}/select`: Selección definitiva del postulante.
5.  **[notification.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/recruitment/services/notification.service.ts)**
    *   `GET /notifications`: Lista de alertas del usuario.
    *   `POST /notifications/send`: Envío forzado de alertas (WhatsApp/Email/In-App).
6.  **[profile.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/profile/services/profile.service.ts)**
    *   `POST /profile/organization`: Registro inicial del perfil empresarial.
    *   `POST /profile/employee`: Registro inicial del perfil de candidato.
7.  **[ubigeo.service.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/services/ubigeo.service.ts)**
    *   Carga y filtrado de la base de datos local de distritos, provincias y departamentos del Perú.

---

## 6. Sistema de Estilos y Diseño Visual

El frontend adopta una estructura de estilos en cascada pura (CSS sin Tailwind) controlada por variables CSS en [variables.css](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/assets/variables.css) y estilos compartidos de controles de formulario y botones.

### Tokens de Diseño Esenciales
*   **Colores Primarios:**
    *   Fondo General (`--color-bg`): `#E8EAF2` (Gris claro azulado para contraste premium).
    *   Fondo de Tarjeta (`--color-surface`): `#FFFFFF` (Blanco puro).
    *   Borde General (`--color-border`): `#D1D5DB`.
    *   Botón Principal (`--color-accent`): `#2D3AC7` (Azul profundo de la marca).
    *   Acción Hover (`--color-accent-hover`): `#3D4DD4`.
*   **Tipografía y Márgenes:**
    *   Familia de Fuente: **Inter**, sans-serif (`--font-family`).
    *   Espaciado base: Basado en grilla de **8px** (`--space-1` = 8px, `--space-2` = 16px, `--space-3` = 24px, `--space-4` = 32px, etc.).
    *   Restricciones: Sin gradientes innecesarios, sin efectos de vidrio ni desenfoques exagerados. Transiciones de cambio de estado estables de `0.15s ease`.

---

## 7. Directrices clave para la Reestructuración Masiva

Al proceder con la reorganización del frontend, ten en cuenta las siguientes directrices y reglas técnicas:
1.  **Preservación de Composition API:** Mantener de forma estricta `<script setup lang="ts">` en todos los componentes Vue reorganizados.
2.  **Modularidad de Servicios y Modelos:** Asegurar que cada módulo del negocio (`auth`, `cv`, `job`, `recruitment`, `message`, `settings`) mantenga sus interfaces DTO aisladas y sus servicios heredando del Axios base.
3.  **Gestión Centralizada de Rutas y Guards:** Al agregar o reorganizar rutas, no hardcodear strings en los componentes; usar siempre el archivo de constantes [route-constants.ts](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/router/route-constants.ts).
4.  **Consumo de Tokens Visuales:** No definir colores ad-hoc o píxeles estáticos en los componentes editados. Usar siempre las variables definidas en `variables.css`.
5.  **Mantenimiento de Mocks:** En caso de cambiar el tipado de los modelos, actualizar sus respectivos archivos de datos simulados (mocks) indicados en la **Sección 4** para evitar errores de compilación de TypeScript (`vue-tsc`).
