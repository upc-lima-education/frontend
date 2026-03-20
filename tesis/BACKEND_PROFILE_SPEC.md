# Especificación Backend - Módulo Profile

## Extracción de ID de Usuario

En el frontend se obtiene con:
```typescript
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
const authStore = useAuthenticationStore();
const userId = authStore.currentUserId; // Viene de: user.value?.id
```

El `userId` se envía en cada petición al backend.

---

## Endpoints Requeridos

### Base URL
```
/profile
```

---

## 1. CREAR PERFIL DE EMPLEADO

**Endpoint:** `POST /profile/employee`

**Body (Request):**
```json
{
  "userId": "string (id del usuario autenticado)",
  "profileId": "string (id del perfil)",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "profilePicture": "string? (URL o base64)",
  "description": "string? (max 500 caracteres)",
  "keywords": ["string?"] (max 10 palabras clave),
  "ruc": "string? (11 dígitos, ej: 20123456789)",
  "isVerified": "boolean? (true si RUC validado)",
  "district": "string? (distrito del usuario)"
}
```

**Response (éxito 201):**
```json
{
  "profileId": "string",
  "userId": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "profilePicture": "string?",
  "description": "string?",
  "keywords": ["string?"],
  "ruc": "string?",
  "isVerified": "boolean?",
  "district": "string?",
  "createdAt": "timestamp"
}
```

---

## 2. CREAR PERFIL DE ORGANIZACIÓN

**Endpoint:** `POST /profile/organization`

**Body (Request):**
```json
{
  "userId": "string (id del usuario autenticado)",
  "profileId": "string (id del perfil)",
  "companyName": "string",
  "email": "string",
  "password": "string",
  "profilePicture": "string? (URL o base64)",
  "description": "string? (max 500 caracteres)",
  "keywords": ["string?"] (max 10 palabras clave),
  "ruc": "string? (11 dígitos)",
  "isVerified": "boolean? (true si RUC validado)",
  "district": "string? (distrito de la organización)",
  "sector": "string? (ej: Tecnología, Retail, etc.)"
}
```

**Response (éxito 201):**
```json
{
  "profileId": "string",
  "userId": "string",
  "companyName": "string",
  "email": "string",
  "profilePicture": "string?",
  "description": "string?",
  "keywords": ["string?"],
  "ruc": "string?",
  "isVerified": "boolean?",
  "district": "string?",
  "sector": "string?",
  "createdAt": "timestamp"
}
```

---

## 3. OBTENER PERFIL POR USER ID

**Endpoint:** `GET /profile/{userId}`

**URL Params:**
- `userId`: string (id del usuario)

**Response (éxito 200):**
Retorna el perfil completo (empleado u organización con todos los campos)

```json
{
  "profileId": "string",
  "userId": "string",
  "firstName": "string?",
  "lastName": "string?",
  "companyName": "string?",
  "email": "string",
  "profilePicture": "string?",
  "description": "string?",
  "keywords": ["string?"],
  "ruc": "string?",
  "isVerified": "boolean?",
  "district": "string?",
  "sector": "string?",
  "userType": "employee|organization"
}
```

---

## 4. ACTUALIZAR PERFIL POR USER ID

**Endpoint:** `PUT /profile/{userId}`

**URL Params:**
- `userId`: string (id del usuario autenticado)

**Body (todos los campos opcionales):**
```json
{
  "firstName": "string?",
  "lastName": "string?",
  "companyName": "string?",
  "profilePicture": "string?",
  "description": "string?",
  "keywords": ["string?"],
  "ruc": "string?",
  "district": "string?",
  "sector": "string?"
}
```

**Response (éxito 200):**
```json
{
  "success": true,
  "message": "Perfil actualizado correctamente",
  "profile": {
    "profileId": "string",
    "userId": "string",
    "firstName": "string?",
    "lastName": "string?",
    "companyName": "string?",
    "email": "string",
    "profilePicture": "string?",
    "description": "string?",
    "keywords": ["string?"],
    "ruc": "string?",
    "isVerified": "boolean?",
    "district": "string?",
    "sector": "string?",
    "updatedAt": "timestamp"
  }
}
```

---

## 5. SUBIR FOTO DE PERFIL

**Endpoint:** `POST /profile/{userId}/upload-photo`

**URL Params:**
- `userId`: string (id del usuario autenticado)

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: File (imagen, máx 5MB, formatos: JPG, PNG, GIF)

**Response (éxito 200):**
```json
{
  "success": true,
  "url": "string (URL de la foto subida)",
  "message": "Foto de perfil actualizada correctamente"
}
```

---

## 6. VALIDAR RUC

**Endpoint:** `POST /profile/validate-ruc`

**Body (Request):**
```json
{
  "ruc": "string (11 dígitos, ej: 20123456789)"
}
```

**Response (éxito 200 - RUC válido):**
```json
{
  "valid": true,
  "ruc": "string",
  "isVerified": true,
  "message": "RUC validado correctamente"
}
```

**Response (error 400 - RUC inválido):**
```json
{
  "valid": false,
  "ruc": "string",
  "isVerified": false,
  "error": "RUC inválido o no encontrado",
  "message": "El RUC no coincide con registros conocidos"
}
```

---

## Atributos de Perfil - Resumen Completo

### Campos comunes (Empleado + Organización):
- `userId` (string, requerido) - ID del usuario autenticado
- `profileId` (string, requerido) - ID único del perfil
- `email` (string, requerido)
- `password` (string, requerido en creación)
- `profilePicture` (string?, opcional) - URL de la foto de perfil
- `description` (string?, opcional) - Bio/descripción (max 500 caracteres)
- `keywords` (string[]?, opcional) - Palabras clave (max 10)
- `ruc` (string?, opcional) - RUC para verificación (11 dígitos)
- `isVerified` (boolean?, opcional) - True si RUC fue validado
- `district` (string?, opcional) - Distrito del usuario/organización

### Campos específicos Empleado:
- `firstName` (string, requerido)
- `lastName` (string, requerido)

### Campos específicos Organización:
- `companyName` (string, requerido)
- `sector` (string?, opcional) - Ej: Tecnología, Retail

---

## Flujo de Uso en Frontend

```typescript
// 1. El userId se obtiene del store de autenticación
const authStore = useAuthenticationStore();
const userId = authStore.currentUserId; // Ej: "user123"

// 2. Al crear perfil
const employeeData = {
  userId,
  profileId,
  firstName,
  lastName,
  email,
  password,
  // ... otros campos opcionales
};
await service.createEmployeeProfile(employeeData);

// 3. Al obtener perfil
await service.getProfileByUserId(userId); // GET /profile/user123

// 4. Al actualizar perfil
const updates = {
  firstName,
  lastName,
  description,
  keywords,
  district,
  ruc,
  profilePicture
};
await service.updateProfileDataByUserId(userId, updates); // PUT /profile/user123

// 5. Al subir foto
await service.uploadProfilePhoto(userId, file); // POST /profile/user123/upload-photo

// 6. Al validar RUC
await service.validateRUC(ruc); // POST /profile/validate-ruc
```

---

## Consideraciones de Base de Datos

### Tabla: profiles
```sql
CREATE TABLE profiles (
  profileId VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL UNIQUE,
  userType ENUM('employee', 'organization') NOT NULL,
  
  -- Campos de Empleado
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  
  -- Campos de Organización
  companyName VARCHAR(255),
  sector VARCHAR(255),
  
  -- Campos comunes
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  profilePicture TEXT,
  description TEXT,
  keywords JSON,
  ruc VARCHAR(11),
  isVerified BOOLEAN DEFAULT FALSE,
  district VARCHAR(255),
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Códigos de Error HTTP

- `200` - OK (GET, PUT, POST exitosos)
- `201` - Created (perfil creado exitosamente)
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (usuario no autenticado)
- `403` - Forbidden (acceso denegado)
- `404` - Not Found (perfil no encontrado)
- `409` - Conflict (perfil ya existe)
- `500` - Internal Server Error
