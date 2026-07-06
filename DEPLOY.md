# Deploy con Render y Neon

## Pre-requisitos
1. Cuenta en GitHub
2. Cuenta en Render (https://render.com)
3. Cuenta en Neon (https://neon.tech)

---

## Paso 1: Subir el repo a GitHub
1. Inicializar Git (ya hecho)
2. Hacer commit inicial
3. Crear repo en GitHub y pushear

---

## Paso 2: Configurar la base de datos en Neon
1. Crear una base de datos en Neon
2. Copiar la `DATABASE_URL`
3. Aplicar el schema con el comando:
   ```bash
   cd develop/backend
   pnpm db:schema
   ```
   (anteponer la variable de entorno: `DATABASE_URL=... pnpm db:schema`)

---

## Paso 3: Configurar Render para el Backend
1. Crear un `Web Service` en Render
2. Conectar el repo de GitHub
3. Configurar el servicio:
   - **Root Directory**: `develop/backend`
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start`
4. Agregar variables de entorno en Render:
   - `ADMIN_PASSWORD`
   - `DATABASE_URL` (de Neon)
   - `FRONTEND_URL` (URL del frontend en Render)
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (Render usa `PORT` por defecto, pero lo podemos aclarar)
5. Hacer deploy inicial

---

## Paso 4: Configurar Render para el Frontend
1. Crear un `Static Site` en Render
2. Conectar el repo de GitHub
3. Configurar el servicio:
   - **Root Directory**: `develop/frontend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Publish Directory**: `dist`
4. Agregar variable de entorno (si es necesario):
   - `VITE_API_URL` (URL del backend en Render)
5. Hacer deploy inicial

---

## Deploy automático
Al hacer push a la rama principal (`main` o `master`), Render hará automáticamente:
1. Build del frontend/backend
2. Deploy

---

## Scripts útiles
- Backend:
  - `pnpm dev`: desarrollo local
  - `pnpm start`: producción
  - `pnpm db:schema`: aplicar el schema a la base

- Frontend:
  - `pnpm dev`: desarrollo local
  - `pnpm build`: build para producción
