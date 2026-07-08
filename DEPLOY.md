# Deploy con Render (Backend), Neon (BD) y Vercel (Frontend)

## Pre-requisitos
1. Cuenta en GitHub
2. Cuenta en Render (https://render.com) - para Backend
3. Cuenta en Neon (https://neon.tech) - para Base de Datos
4. Cuenta en Vercel (https://vercel.com) - para Frontend

---

## Paso 1: Subir el repo a GitHub
1. Inicializar Git (ya hecho)
2. Hacer commit inicial
3. Crear repo en GitHub y pushear
   - Asegúrate de que los `pnpm-lock.yaml` estén incluidos en el repo

---

## Paso 2: Configurar la base de datos en Neon
1. Crear una base de datos en Neon
2. Copiar la `DATABASE_URL` (debe incluir `?sslmode=require` al final)
3. Aplicar el schema con el comando:
   ```bash
   cd develop/backend
   pnpm db:schema
   ```
   (Si estás en tu máquina local, anteponer la variable de entorno: `DATABASE_URL=tu_url_de_neon pnpm db:schema`)

---

## Paso 3: Configurar Render para el Backend
1. Crear un `Web Service` en Render
2. Conectar el repo de GitHub
3. Configurar el servicio:
   - **Root Directory**: `develop/backend`
   - **Runtime**: Node
   - **Build Command**: `pnpm install`
   - **Start Command**: `pnpm start`
4. Agregar variables de entorno en la sección **Environment** de Render:
   - `ADMIN_PASSWORD`: (tu clave de administrador)
   - `DATABASE_URL`: (la URL de Neon, con `sslmode=require`)
   - `FRONTEND_URL`: (la URL del frontend en Vercel, ej: `https://tu-proyecto.vercel.app`)
   - `JWT_SECRET`: (una clave secreta larga y segura para JWT)
   - `NODE_ENV`: `production`
5. Hacer deploy inicial

---

## Paso 4: Configurar Vercel para el Frontend
1. Ir a Vercel y conectar tu repo de GitHub
2. Configurar el proyecto:
   - **Root Directory**: `develop/frontend`
   - **Framework Preset**: Vite (se detecta automáticamente)
3. Agregar variables de entorno en la sección **Environment Variables** de Vercel:
   - `VITE_API_URL`: (la URL del backend en Render, ej: `https://tu-backend.onrender.com/api`)
4. Hacer deploy inicial

---

## Paso 5: Actualizar variables de entorno en Render después de tener la URL de Vercel
Después de que el frontend esté deployado en Vercel, actualiza la variable `FRONTEND_URL` en el backend de Render con la URL final de Vercel.

---

## Deploy automático
Al hacer push a la rama principal (`main` o `master`):
- Render hará automáticamente build y deploy del backend
- Vercel hará automáticamente build y deploy del frontend

---

## Scripts útiles
- Backend:
  - `pnpm dev`: desarrollo local
  - `pnpm start`: producción
  - `pnpm db:schema`: aplicar el schema a la base

- Frontend:
  - `pnpm dev`: desarrollo local
  - `pnpm build`: build para producción

---

## Notas importantes
1. **SSL en Neon**: La URL de Neon ya incluye `sslmode=require` por defecto, es necesario para conectarse desde Render/Vercel.
2. **CORS**: El backend está configurado para aceptar solicitudes solo desde la URL del frontend especificada en `FRONTEND_URL`.
3. **Variables de entorno sensibles**: Nunca guardes claves o URLs sensibles en el repositorio.
