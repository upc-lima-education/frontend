# Validación local y despliegue del recomendador

Documento de control previo a producción para los proyectos `recommendation`, `backend-v2`, `frontend` y `web-scraping`.

## 0. Evidencia de esta revisión

Validación ejecutada el 15 de septiembre de 2026:

- `frontend`: `npm run type-check` pasó.
- `frontend`: `npm run build` pasó fuera del aislamiento; Vite generó `dist` correctamente.
- `recommendation`: análisis AST de 39 archivos Python pasó.
- `recommendation`: `pytest` no pudo ejecutarse porque el entorno local no tiene `pytest` instalado.
- `recommendation`: la imagen nueva no estaba disponible localmente al verificarla.
- Azure: `ca-llanqui-recommendation` está `Running`, pero usa la imagen antigua `20260701.1`, puerto 8080 e ingress externo.
- Smoke test Azure: el Swagger del backend responde `200`, pero los endpoints nuevos `/api/v1/recommendations/for-me` y `/api/v1/job-interactions` responden `404`; todavía no están desplegados.
- Smoke test Azure: el recomendador antiguo responde `/` y `/docs`, pero `/api/v1/recommendations/personalized` responde `404`.
- El script ALS obtiene `0` interacciones en la configuración local y después falla por usar la firma antigua de `ALSRecommendationAdapter.filter`; no es una prueba automatizada válida todavía.
- Pruebas ALS automatizadas: `5 passed`.
- Integración ALS contra la base local: `5` interacciones, `2` candidatos y `4` empleos; los candidatos obtuvieron resultados, todos los scores fueron positivos y los empleos consumidos fueron excluidos.
- CBF completo: pendiente; no existe `cc.es.300.bin` localmente y el entorno Python 3.11 disponible no es ejecutable. Debe validarse en Docker con el modelo completo.
- Backend: `dotnet test --no-build --no-restore` pasó con 20 pruebas.
- Backend: se agregó respuesta `503 Service Unavailable` para fallos HTTP del recomendador y excepciones de perfil se mapearon a errores de dominio.

Estas evidencias no sustituyen la prueba funcional contra una base de datos de desarrollo.

### Validación adicional del backend local

- `http://localhost:5000/swagger/index.html`: `200`.
- `GET /api/v1/recommendations/for-me?limit=10`: `401` sin token.
- `GET /api/v1/recommendations/for-me?limit=0`: `401` sin token.
- `GET /api/v1/recommendations/for-me?limit=999`: `401` sin token.
- `POST /api/v1/job-interactions`: `401` sin token.

La autenticación está activa. La validación funcional de la respuesta requiere un token de candidato de desarrollo y debe ejecutarse con datos de desarrollo, nunca con credenciales de producción.

## 1. Alcance

- ALS: recomendaciones colaborativas mediante `JobInteractions`, excluyendo empleos consumidos y scores no positivos.
- CBF: recomendaciones por query y filtros, con paginación.
- El backend es la única entrada pública del frontend.
- `news.page.vue` queda fuera de esta integración y no debe invocar el recomendador.
- No existe fallback que descargue o procese el catálogo completo de empleos.
- No se incluyen IDs, URLs, credenciales, scores ni empleos hardcodeados.

## 2. Estado verificado

### Recommendation

- Rama esperada: `v2`.
- El repositorio contiene endpoints `/api/v1/recommendations/personalized` y `/api/v1/recommendations/search`.
- El Dockerfile instala Python 3.12 y descarga `cc.es.300.bin`.
- El modelo FastText es grande; no se debe descargar durante cada arranque del contenedor.
- La imagen `acrllanqui1299.azurecr.io/recommendation:v2` debe existir antes de actualizar Azure.

### Backend

- `GET /api/v1/recommendations/for-me` entrega ALS al frontend.
- `POST /api/v1/job-interactions` registra interacciones.
- El backend consulta el recomendador por una URL configurable (`Recommendation__BaseUrl`).
- Debe comprobarse que el endpoint CBF del backend esté implementado antes de activar búsqueda por recomendaciones.

### Frontend

- La vista de recomendaciones del candidato debe consumir `/api/v1/recommendations/for-me`.
- La vista de búsqueda debe consumir el backend para CBF.
- La vista de noticias no forma parte del alcance.
- Debe eliminarse cualquier uso de `jobs.value` como fallback cuando una recomendación no devuelve resultados; se debe mostrar estado vacío o error controlado.

### Scraper

- No se modifica salvo que falten campos obligatorios de empleo para CBF o ALS.
- Antes de producción se valida que los empleos sincronizados tengan identificador estable, título, descripción y estado activo.

## 3. Pruebas locales

Abrir cuatro terminales. Todos los comandos son para PowerShell.

### 3.1 Recomendador ALS/CBF

```powershell
cd "C:\Users\alexa\OneDrive\Desktop\TP2TESIS\recommendation"
git switch v2
git pull origin v2
docker build --progress=plain -t recommendation:local .
```

Configurar la conexión real a la base de datos sin escribirla en el repositorio:

```powershell
$DATABASE_URL = Read-Host "DATABASE_URL de la base de datos de desarrollo"
docker run --rm --name recommendation-local `
  -p 8000:8000 `
  -e DATABASE_URL=$DATABASE_URL `
  -e FASTTEXT_MODEL_PATH=/app/models/cc.es.300.bin `
  recommendation:local
```

Validar desde otra terminal:

```powershell
Invoke-RestMethod http://localhost:8000/docs
Invoke-RestMethod "http://localhost:8000/api/v1/recommendations/personalized?candidateProfileId=<ID_REAL>&limit=10"
Invoke-RestMethod "http://localhost:8000/api/v1/recommendations/search?query=software&page=1&page_size=10"
```

Reemplazar `<ID_REAL>` únicamente durante la prueba local por un UUID existente. No guardar ese valor en código ni documentación de producción.

### 3.2 Prueba específica de ALS

La prueba debe usar datos existentes en `JobInteractions` y verificar:

1. Se leen interacciones de más de un usuario.
2. El empleo ya consumido por el usuario objetivo no aparece.
3. No aparece ningún resultado con score menor o igual a cero.
4. La cantidad de resultados no supera `limit`.
5. Un usuario sin vecinos similares devuelve lista vacía, no el catálogo completo.

### 3.3 Backend

```powershell
cd "C:\Users\alexa\OneDrive\Desktop\TP2TESIS\backend-v2"
git switch main
dotnet restore
dotnet build --no-restore
dotnet ef database update
dotnet run
```

En `appsettings.Development.json`, la URL local debe ser configurable:

```json
{
  "Recommendation": {
    "BaseUrl": "http://localhost:8000"
  }
}
```

Validar el backend:

```powershell
Invoke-RestMethod "http://localhost:5000/api/v1/recommendations/for-me?limit=10"
```

El puerto real debe tomarse del mensaje de `dotnet run`; no se debe hardcodear si cambia.

Registrar una interacción usando un empleo real:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:<PUERTO_BACKEND>/api/v1/job-interactions" `
  -ContentType "application/json" `
  -Body '{"jobId":"<JOB_ID_REAL>","type":"View"}'
```

### 3.4 Frontend

```powershell
cd "C:\Users\alexa\OneDrive\Desktop\TP2TESIS\frontend"
git switch main
npm ci
npm run type-check
npm run build
npm run dev
```

Casos manuales obligatorios:

- Sin query: la vista muestra “Empleos recomendados según tus anteriores búsquedas” y llama al backend ALS.
- Con query o filtros: la vista muestra resultados CBF paginados.
- Usuario sin similitud: se muestra estado vacío, no 60K empleos.
- Usuario no autenticado o perfil inexistente: se muestra error controlado.
- Al abrir un empleo se registra una interacción sin duplicar llamadas innecesarias.
- `news.page.vue` no se modifica ni se usa para validar esta funcionalidad.

## 4. Criterios de aprobación local

No pasar a producción hasta que:

- `dotnet build` termine sin errores.
- `npm run type-check` y `npm run build` terminen correctamente.
- El contenedor responda en el puerto 8000.
- ALS devuelva solo IDs de empleos activos, no el catálogo.
- CBF devuelva paginación válida.
- El backend traduzca IDs a datos de empleo sin consultar todos los empleos.
- No haya fallback a `Get All Jobs` ni datos hardcodeados.
- `DATABASE_URL`, API keys y credenciales del ACR estén fuera del código.

## 5. Despliegue en Azure

Recursos existentes verificados:

- Resource group: `rg-llanqui-backend`
- ACR: `acrllanqui1299`
- Container Apps environment: `cae-llanqui-backend`
- Container App del recomendador: `ca-llanqui-recommendation`

Construir y publicar:

```powershell
cd "C:\Users\alexa\OneDrive\Desktop\TP2TESIS\recommendation"
docker build --progress=plain -t acrllanqui1299.azurecr.io/recommendation:v2 .
az acr login --name acrllanqui1299
docker push acrllanqui1299.azurecr.io/recommendation:v2
```

Configurar el secreto sin imprimirlo:

```powershell
$DATABASE_URL = Read-Host "DATABASE_URL de producción"
az containerapp secret set `
  --name ca-llanqui-recommendation `
  --resource-group rg-llanqui-backend `
  --secrets database-url=$DATABASE_URL
```

Actualizar el Container App usando el puerto real del Dockerfile:

```powershell
az containerapp update `
  --name ca-llanqui-recommendation `
  --resource-group rg-llanqui-backend `
  --image acrllanqui1299.azurecr.io/recommendation:v2 `
  --set-env-vars DATABASE_URL=secretref:database-url FASTTEXT_MODEL_PATH=/app/models/cc.es.300.bin
```

Después de validar la aplicación, preferir ingress interno para que el frontend no acceda directamente al recomendador:

```powershell
az containerapp ingress enable `
  --name ca-llanqui-recommendation `
  --resource-group rg-llanqui-backend `
  --type internal `
  --target-port 8000 `
  --transport auto
```

Obtener la URL interna y configurarla en el backend mediante `Recommendation__BaseUrl`. No copiar credenciales ni valores secretos en comandos guardados.

## 6. Riesgo pendiente del modelo FastText

La imagen actual descarga un archivo de varios GB durante el build. Para una primera prueba controlada puede funcionar, pero para producción se recomienda:

- almacenar el modelo en Blob Storage privado o un volumen persistente;
- descargarlo una sola vez durante una etapa controlada de preparación;
- validar checksum y versión;
- no descargarlo en cada réplica ni en cada reinicio;
- mantener `FASTTEXT_MODEL_PATH` configurable.

Si el tamaño impide construir o publicar la imagen, no se debe reducir el catálogo ni activar un fallback. Se debe separar el modelo del contenedor.

## 7. Rollback

Conservar siempre el tag anterior y volver a él si falla el smoke test:

```powershell
az containerapp update `
  --name ca-llanqui-recommendation `
  --resource-group rg-llanqui-backend `
  --image acrllanqui.azurecr.io/recommendation:<TAG_ANTERIOR>
```

El tag anterior debe obtenerse de Azure; no inventarlo.

## 8. Evidencias que deben guardarse

- salida de `git status --short --branch` de cada proyecto;
- resultado de `dotnet build`;
- resultado de `npm run type-check` y `npm run build`;
- respuesta de los tres endpoints;
- nombre de revisión de Azure;
- estado `Running` del Container App;
- logs sin secretos;
- fecha, imagen y tag desplegados.
