# 4.5. Despliegue y Mantenimiento
Descripción

Este documento describe de manera exhaustiva el proceso de despliegue, configuración y mantenimiento futuro del frontend de la plataforma **ProConnect (Llanqui)**, construida sobre Vue 3, Vite y TypeScript. El objetivo es asegurar que el personal técnico pueda instalar, operar, administrar y dar soporte continuo a la aplicación en entornos locales y productivos.

---

## 4.5.1. Guía de Instalación/Despliegue
Instrucciones paso a paso para instalar y configurar el software en diferentes entornos.

La aplicación de frontend se comporta como una SPA (*Single Page Application*), lo que significa que el código fuente se compila en recursos estáticos (HTML, CSS, JavaScript) que se sirven a través de un servidor web o CDN.

### A. Entorno de Desarrollo Local

#### Requisitos Previos:
- **Node.js**: Versión `20.19.0` o superior (se recomienda la LTS activa).
- **npm**: Versión `10.x` o superior (instalado automáticamente con Node.js).
- **Git**: Para el control de versiones.

#### Pasos para la Instalación:
1. **Clonar el repositorio** en su máquina local:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd frontend
   ```
2. **Instalar dependencias** de Node.js mediante npm:
   ```bash
   npm install
   ```
   *Nota: Esto instalará todos los paquetes necesarios definidos en [package.json](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/package.json).*

3. **Configurar las Variables de Entorno**:
   - Copie el archivo de ejemplo `.env.example` y nómbrelo `.env`:
     ```bash
     copy .env.example .env
     ```
   - Abra el archivo `.env` y configure la URL de su API de backend local:
     ```env
     VITE_API_URL=http://localhost:5155/api/v1
     ```

4. **Iniciar el Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```
   - Por defecto, Vite levantará el servidor en `http://localhost:5173`.
   - Abra dicha dirección en un navegador web para validar el funcionamiento local.

---

### B. Entorno de Producción (Despliegue en Netlify)

El despliegue en producción se realiza mediante integración continua (CI/CD) conectando el repositorio de GitHub con **Netlify**, lo que permite desplegar automáticamente la rama `main` tras cada cambio.

#### Pasos para la Configuración en Netlify:
1. **Crear o iniciar sesión** en el portal de [Netlify](https://www.netlify.com/).
2. Hacer clic en **"Add new site"** → **"Import an existing project"**.
3. Seleccionar **GitHub** como proveedor e iniciar sesión para autorizar la lectura de repositorios.
4. Seleccionar el repositorio del proyecto.
5. Configurar los **Build Settings** en el panel de Netlify:
   - **Branch to deploy**: `main`
   - **Base directory**: `frontend` (si el frontend está dentro de una carpeta del repositorio, de lo contrario dejar en blanco).
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Configurar las **Variables de Entorno** (Site settings → Environment variables):
   - Agregar `VITE_API_URL` apuntando a la dirección HTTPS pública del backend productivo:
     ```env
     VITE_API_URL=https://api.proconnect.pe/api/v1
     ```
7. **Redirecciones para la SPA (Importante)**:
   - Para evitar errores **404** al recargar o acceder directamente a rutas internas del enrutador (como `/jobs` o `/profile`), la aplicación incluye un archivo `_redirects` en la carpeta `public/` con la siguiente regla:
     ```text
     /*    /index.html   200
     ```
   - Esto indica a Netlify que redirija cualquier solicitud hacia el archivo central `index.html` para que `vue-router` gestione la carga de la vista correspondiente.
8. Hacer clic en **"Deploy site"**. Netlify iniciará el proceso de compilación y entregará una URL pública tipo `https://tu-app.netlify.app`.

---

## 4.5.2. Guía de Usuario
Manual para los usuarios finales sobre cómo utilizar el software.

La plataforma **ProConnect (Llanqui)** está diseñada para dos tipos de usuarios finales: **Candidatos (Profesionales/Freelancers)** y **Organizaciones (Empresas)**.

### A. Manual del Candidato (Employee/Candidate)

1. **Registro y Autenticación**:
   - Acceda a `/sign-up`.
   - Seleccione obligatoriamente el rol **Candidato** (💼).
   - Complete el formulario manual con su email y contraseña, o haga clic en **"Registrarse con Google"**.
2. **Dashboard de Noticias**:
   - Una vez autenticado, ingresará al feed principal donde podrá ver publicaciones y ofertas de interés.
3. **Gestión de Currículum (Mi CV)**:
   - Ingrese al apartado **"Mi Currículum"** en el Navbar.
   - Complete sus datos de contacto, educación, experiencia laboral y habilidades.
   - Si requiere apoyo en la redacción, lea las sugerencias dinámicas de la **Asistencia de IA** ubicadas en el recuadro diferenciado con borde azul.
   - Haga clic en **"Descargar PDF"** para obtener su currículum maquetado.
4. **Búsqueda y Postulación a Ofertas**:
   - Diríjase a **"Buscar Empleos"**.
   - Filtre las vacantes de su interés, revise los requisitos y presione el botón **"Postular"**.

---

### B. Manual de la Organización (Empresa/Organization)

1. **Registro e Inicio de Sesión**:
   - En la pantalla de registro, seleccione el rol **Empresa** (🏢) y complete sus datos corporativos o use Google OAuth.
2. **Publicación de Ofertas de Trabajo**:
   - Diríjase a la sección **"Publicar Empleo"** del menú principal.
   - Rellene el formulario con el título del puesto, la descripción de funciones, los requisitos mínimos y el rango salarial.
   - Haga clic en **"Publicar"** para que la oferta se visualice en el buscador de los candidatos.
3. **Gestión y Seguimiento de Postulantes**:
   - Ingrese a **"Seguimiento de Postulantes"**.
   - Seleccione una oferta activa para desplegar la lista de profesionales inscritos.
   - Evalúe los perfiles de los candidatos y actualice su estado del proceso de selección (en opciones de: *Aprobado*, *En Proceso* o *Descartado*).

---

## 4.5.3. Guía de Administración
Para los administradores del sistema, incluye información sobre configuración, respaldo, monitoreo y resolución de problemas.

### A. Configuración y Variables de Entorno
El comportamiento del cliente web se administra mediante variables que se inyectan en tiempo de compilación. Cualquier cambio requiere reconstruir el sitio (`npm run build`).

- **`VITE_API_URL`**: Punto de acceso de la API. Debe modificarse si el backend migra de servidor.
- **Configuración de Google Client ID**: Para modificar la cuenta de Google Cloud asociada al OAuth, se edita en la consola de Google la URI de redirección autorizada, apuntando al backend correspondiente.

### B. Estrategia de Respaldo (Backup)
Dado que el frontend es una aplicación sin estado (*stateless SPA*), no almacena bases de datos ni archivos de usuarios de manera persistente en su servidor (Netlify).
- **Código Fuente**: El respaldo principal reside en el repositorio de **GitHub**. Se debe activar la protección de la rama `main` para requerir Pull Requests aprobados antes de fusionar código.
- **Configuraciones de Entorno**: Es recomendable guardar un registro seguro de las variables de entorno de Netlify fuera de la plataforma.

### C. Monitoreo del Sistema
1. **Logs de Compilación**: Revisar el historial de construcciones en la pestaña **Deploys** de Netlify para detectar fallos al integrar código nuevo.
2. **Monitoreo en Tiempo Real**: Se recomienda integrar herramientas de monitoreo en el cliente (como *Sentry* o *LogRocket*) mediante scripts en el `index.html` para capturar errores de JavaScript y excepciones de red no controladas en los dispositivos de los usuarios.
3. **Verificación de Conexión**: Para realizar diagnósticos rápidos en entornos de pruebas o producción, el administrador puede utilizar la consola del navegador y llamar a la función [verifyBackendConnection()](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/src/app/shared/services/connection-verifier.ts#L7) para verificar el estado de CORS y la API.

### D. Resolución de Problemas Comunes (Troubleshooting)

* **Error 404 al recargar la página en producción**:
  - *Causa*: Falta el archivo de redirecciones de la SPA.
  - *Solución*: Verificar que el archivo `public/_redirects` existe y contiene `/* /index.html 200`.
* **Error de CORS en la consola del navegador al llamar a la API**:
  - *Causa*: El backend no tiene registrado el dominio de Netlify en sus políticas de orígenes permitidos.
  - *Solución*: Agregar la URL de producción de Netlify en la sección de configuración de CORS del servidor backend.
* **Pantalla en blanco al iniciar la aplicación**:
  - *Causa*: Error de sintaxis JavaScript en el navegador o fallo al cargar recursos CDN.
  - *Solución*: Abrir la consola de desarrollador (`F12`) y verificar el archivo/línea que genera el error. Comprobar que la versión del navegador es compatible con ES6+.

---

## 4.5.4. Plan de Mantenimiento
Estrategias para el mantenimiento futuro del software (corrección de errores, mejoras, actualizaciones).

Para garantizar la longevidad y seguridad del frontend, se establece un plan de mantenimiento estructurado en tres niveles.

### 1. Corrección de Errores (Correctivo)
- **Reporte**: Los errores reportados por usuarios o detectados mediante monitoreo se registrarán como *Issues* en el repositorio de código.
- **Flujo de Trabajo (Hotfixes)**:
  1. Crear una rama de mantenimiento desde `main` con el formato `hotfix/nombre-error`.
  2. Resolver el problema y probarlo localmente.
  3. Ejecutar `npm run type-check` y `npm run build` localmente para confirmar que compila correctamente.
  4. Realizar un Pull Request y, una vez aprobado, fusionarlo a `main`. Netlify desplegará la solución en minutos.

### 2. Implementación de Mejoras (Evolutivo)
- **Flujo de Características (Features)**:
  - Las nuevas pantallas o componentes se desarrollarán en ramas independientes (`feature/nombre-mejora`).
  - Se debe validar que todo componente nuevo respete los lineamientos visuales de la [guía de estilos](file:///C:/Users/alexa/OneDrive/Desktop/junio/frontend/design-artifacts/guia-de-estilos.md).
  - Se requiere realizar pruebas de regresión manuales en las pantallas de registro y login antes de liberar cambios mayores.

### 3. Actualización y Parches de Seguridad (Preventivo)
- **Auditoría de Dependencias**: Ejecutar mensualmente `npm audit` para escanear posibles vulnerabilidades de seguridad en los paquetes de terceros instalados. Aplicar soluciones con `npm audit fix`.
- **Actualización de Librerías**:
  - Revisar actualizaciones de dependencias clave (Vue, Vite, Pinia, Axios) cada trimestre mediante `npm outdated`.
  - Realizar las actualizaciones de versiones mayores en ramas aisladas y ejecutar pruebas exhaustivas de integración con el backend antes de fusionar.
- **Monitoreo de Versión de Node.js**: Mantener alineada la versión del motor de Node en el archivo `package.json` (`engines`) y en las opciones de Netlify según las directrices de seguridad de Node.js.
