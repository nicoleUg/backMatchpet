# MatchPet Backend (NestJS + Firebase)

Backend API de MatchPet, diseñada para reemplazar la lógica demo basada en localStorage con cambios mínimos en un frontend web hecho en Parcel + JavaScript vanilla.

## Stack

- NestJS + TypeScript
- Firebase Authentication (register/login)
- Firebase Admin SDK (verificación de tokens)
- Firestore (persistencia principal)
- class-validator + class-transformer
- Swagger/OpenAPI

## Colecciones Firestore

Se eligió mantener `matches` y `adoptions` embebidos en el documento del usuario por compatibilidad con el contrato del frontend y simplicidad de lectura del perfil.

- `users/{uid}`
  - `fullName`, `displayName`, `email`
  - `matches: string[]` (ids de mascotas)
  - `adoptions: string[]` (ids de mascotas)
  - `phone`, `location`, `bio`
  - `createdAt`, `updatedAt` (ISO)
- `pets/{petId}`
  - `name`, `species`, `gender`, `age`, `breed`, `personality`
  - `status`: `available | adopted`
  - `ownerId`
  - `photoUrl`
  - `createdAt`, `updatedAt` (ISO)

## Reglas de negocio implementadas

- Crear mascota requiere sesión (`401` si falta token).
- `ownerId` de una mascota nueva siempre sale del token autenticado.
- Like de mascota agrega el `petId` a `users.matches` sin duplicar (`arrayUnion`).
- Adoptar mascota:
  - cambia `status` a `adopted`
  - asigna `ownerId` al usuario que adopta
  - agrega `petId` a `users.adoptions`
  - elimina `petId` de `users.matches`
  - elimina ese `petId` de matches de otros usuarios para que no aparezca más en Match
- Nunca se devuelve `passwordHash` ni secretos.

## Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)
- `POST /auth/logout` (Bearer token, revoca refresh tokens)

### Users

- `GET /users/:id`
- `PATCH /users/me` (Bearer token)
- `GET /users/:id/profile`
- `GET /users/:id/matches`
- `GET /users/:id/adoptions`

### Pets

- `POST /pets` (Bearer token)
- `GET /pets`
- `GET /pets/:id`
- `PATCH /pets/:id` (Bearer token, solo owner)
- `DELETE /pets/:id` (Bearer token, solo owner)
- `POST /pets/:id/like` (Bearer token)
- `POST /pets/:id/adopt` (Bearer token)

### Auxiliares

- `GET /matches/me` (Bearer token)
- `GET /adoptions/me` (Bearer token)
- `GET /health`

## Filtros soportados en `/pets`

- Principales: `species`, `status`, `ownerId`
- Secundarios: `name`, `breed`, `gender`, `minAge`, `maxAge`

## Variables de entorno

Copiar y completar [`.env.example`](.env.example):

- `FIREBASE_WEB_API_KEY` (obligatoria para `/auth/register` y `/auth/login`)
- Credenciales Admin SDK:
  - Opción A: `FIREBASE_SERVICE_ACCOUNT_JSON`
  - Opción B: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

## Arranque

```bash
npm install
npm run start:dev
```

Swagger:

- `http://localhost:3000/docs`

## Seed

El seed crea/actualiza un usuario de prueba y mascotas demo.

```bash
# obligatorio para el seed (evita password hardcodeada)
set SEED_TEST_PASSWORD=TuPasswordSegura123!
npm run seed
```

## Ajustes mínimos en frontend (Parcel + vanilla)

1. Reemplazar lecturas/escrituras de localStorage por llamadas HTTP a esta API.
2. Guardar `idToken` de Firebase retornado por `/auth/login` o `/auth/register`.
3. Enviar `Authorization: Bearer <idToken>` en:
   - crear/editar/eliminar mascota
   - like
   - adopt
   - `/auth/me`, `/users/me`
4. Match/Search:
   - usar `GET /pets?status=available` para tarjetas de swipe
   - usar `GET /pets` con filtros de query para búsqueda
5. Perfil:
   - usar `GET /users/:id/profile` para estadísticas
   - usar `GET /users/:id/matches` y `GET /users/:id/adoptions` para listados

## Notas de compatibilidad

- El backend usa Firebase Auth; no persiste contraseñas en Firestore.
- Fechas se devuelven en formato ISO.
- Contratos modelados para mantener nombres de campos esperados por el frontend actual.
