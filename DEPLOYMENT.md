# Guía de Despliegue a Producción y Uso del Emulador - MatchPet

Esta guía detalla los pasos para ejecutar la aplicación de forma local utilizando el emulador de Firebase, configurar credenciales reales para producción, y desplegar el backend y el frontend.

---

## 1. Ejecución Local con Firebase Emulator Suite

Para desarrollar y realizar pruebas (como JMeter o OWASP ZAP) de manera local y offline sin depender de la nube de Firebase, configuramos los emuladores de **Auth** y **Firestore**.

### Requisitos previos:
- Tener instalado [Node.js](https://nodejs.org/).
- Tener instalado Java JRE (requerido por el Firebase Emulator Suite).
- Instalar la herramienta CLI de Firebase globalmente si no la tienes:
  ```bash
  npm install -g firebase-tools
  ```

### Pasos para iniciar localmente:

1. **Configurar el archivo `.env`:**
   Asegúrate de que en tu archivo `backMatchpet/.env` estén configuradas las siguientes variables:
   ```env
   PORT=3000
   NODE_ENV=development
   
   # Habilitar emuladores
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
   
   # Opcional: Para evitar autenticación real en pruebas de carga (JMeter)
   BYPASS_AUTH_FOR_TESTS=true
   ```

2. **Iniciar los Emuladores de Firebase:**
   Desde la carpeta `backMatchpet`, ejecuta:
   ```bash
   npx firebase emulators:start
   ```
   *Esto iniciará el emulador de Firestore (puerto 8080), Auth (puerto 9099) y la consola UI en `http://localhost:4000` donde puedes ver los usuarios y documentos en tiempo real.*

3. **Iniciar el Backend de NestJS:**
   En otra terminal dentro de `backMatchpet`, ejecuta:
   ```bash
   npm run start:dev
   ```
   *El backend detectará automáticamente las variables `FIRESTORE_EMULATOR_HOST` y `FIREBASE_AUTH_EMULATOR_HOST` y se conectará al emulador local en lugar de la nube.*

---

## 2. Configuración de Firebase para Producción

Para llevar el backend a producción, debes conectar la aplicación a un proyecto real de Firebase.

### Paso 2.1: Crear Proyecto en Firebase
1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Haz clic en **Crear un proyecto** y asígnale un nombre (ej. `matchpet-prod`).
3. Activa **Cloud Firestore** en el menú lateral izquierdo (inicia en modo de prueba o producción).
4. Activa **Authentication** en el menú lateral izquierdo y habilita el proveedor de **Correo electrónico/Contraseña**.

### Paso 2.2: Obtener Web API Key (Requerido para registro/login)
1. En la consola de Firebase, ve a la **Configuración del proyecto** (icono de engranaje).
2. En la pestaña **General**, verás la **Clave de API web** (esta será tu variable `FIREBASE_WEB_API_KEY`).

### Paso 2.3: Generar la Clave Privada del Service Account (Admin SDK)
1. En **Configuración del proyecto**, ve a la pestaña **Cuentas de servicio**.
2. Haz clic en **Generar nueva clave privada**. Esto descargará un archivo JSON con las credenciales de administrador de tu proyecto.
3. Abre el JSON y extrae los campos necesarios para tu servidor de producción:
   - `projectId` -> `FIREBASE_PROJECT_ID`
   - `clientEmail` -> `FIREBASE_CLIENT_EMAIL`
   - `privateKey` -> `FIREBASE_PRIVATE_KEY` (copia la cadena completa con saltos de línea `\n`).

---

## 3. Despliegue del Backend (NestJS)

El backend cuenta con un `Dockerfile` optimizado con un build multi-etapa para generar una imagen ligera y segura.

Puedes desplegarlo en cualquier plataforma que soporte contenedores Docker (Render, Railway, Google Cloud Run).

### Ejemplo con Railway o Render:
1. Conecta tu repositorio de GitHub a la plataforma de despliegue.
2. Agrega un nuevo servicio web apuntando a la carpeta `backMatchpet`.
3. La plataforma detectará automáticamente el `Dockerfile`.
4. Configura las siguientes variables de entorno en producción:
   ```env
   NODE_ENV=production
   PORT=3000
   FIREBASE_PROJECT_ID=tu_project_id_real
   FIREBASE_CLIENT_EMAIL=tu_client_email_real
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_private_key_real\n-----END PRIVATE KEY-----\n"
   FIREBASE_WEB_API_KEY=tu_web_api_key_real
   CORS_ALLOWED_ORIGINS=https://tu-frontend.netlify.app (URL de tu frontend desplegado)
   ```

---

## 4. Despliegue del Frontend (Netlify)

El frontend está configurado para Parcel y Netlify (`netlify.toml` y redirecciones para SPA listas).

1. Abre tu código de frontend y edita la URL del backend en tu capa de servicios para que apunte a la URL de producción de tu NestJS (ej. `https://matchpet-api.onrender.com`) en lugar de `http://localhost:3000`.
2. Sube el frontend a GitHub.
3. Ve a [Netlify](https://www.netlify.com/) y crea un nuevo sitio desde Git.
4. Selecciona el repositorio de frontend, directorio de publicación: `dist`, comando de construcción: `npm run build`.
5. Haz el despliegue.
