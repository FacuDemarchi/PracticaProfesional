
# Plan de Colaboración - Sistema de Asistencia

## 📋 Contexto General
- **Proyecto**: Sistema de gestión de asistencia para centro comunitario
- **Stack**: Backend (Express.js + PostgreSQL/Neon), Frontend (React + Vite)
- **Despliegue**: Backend en Render, Frontend en Vercel/Render, BD en Neon

## 🎯 Tareas Asignables (Paralelas y Secuenciales)

---

### Tarea 1: Configuración Completa de la Base de Datos
- **Objetivo**: Aplicar el schema SQL y verificar la estructura
- **Archivos clave**: `diseño/schema.sql`, `develop/backend/scripts/apply-schema.js`
- **Pasos**:
  1. Revisar que `schema.sql` esté completo
  2. Actualizar `apply-schema.js` para ejecutar el schema
  3. Probar conexión y ejecutar el schema
- **Entregable**: BD con todas las tablas creadas

---

### Tarea 2: Sistema de Autenticación (Backend)
- **Objetivo**: Login unificado para admin y profesores
- **Archivos clave**: `diseño/diseno-claves.md`, `diseño/reglas-y-permisos.md`
- **Pasos**:
  1. Instalar dependencias: `bcrypt`, `jsonwebtoken`
  2. Crear middleware de autenticación
  3. Implementar `POST /login`
  4. Implementar endpoints para cambiar clave y habilitar/inhabilitar profesores
- **Entregable**: Middleware y endpoints de auth

---

### Tarea 3: Módulo de Profesores y Salas (Backend)
- **Objetivo**: CRUD para profesores y salas (relación many-to-many)
- **Archivos clave**: `diseño/base-de-datos-logica.md`, `diseño/arquitectura.md`
- **Pasos**:
  1. Crear repositorios para `profesor`, `sala`, `sala_profesor`
  2. Crear servicios con lógica de negocio
  3. Implementar endpoints REST
- **Entregable**: Endpoints y lógica para profesores y salas

---

### Tarea 4: Módulo de Alumnos (Backend)
- **Objetivo**: CRUD para alumnos con permisos diferenciados
- **Archivos clave**: `diseño/arquitectura.md`, `diseño/reglas-y-permisos.md`
- **Pasos**:
  1. Crear repositorio para `alumno`
  2. Crear servicios con permisos (admin = todos, profesor = solo sus salas)
  3. Implementar endpoints con búsqueda por nombre/apellido
- **Entregable**: Endpoints y lógica para alumnos

---

### Tarea 5: Módulo de Asistencia (Backend)
- **Objetivo**: Toma de asistencia, historial y modificaciones
- **Archivos clave**: `diseño/reglas-y-permisos.md`, `diseño/base-de-datos-logica.md`
- **Pasos**:
  1. Crear repositorios para `toma_asistencia` y `detalle_asistencia`
  2. Crear servicios con todas las reglas de negocio
  3. Implementar endpoints REST
- **Entregable**: Endpoints y lógica para asistencia

---

### Tarea 6: Interfaz de Login y Autenticación (Frontend)
- **Objetivo**: Pantalla de login y gestión de sesiones
- **Archivos clave**: `diseño/pantallas-y-navegacion.md`
- **Pasos**:
  1. Configurar React Router
  2. Crear componente de Login
  3. Implementar manejo de tokens y contexto de sesión
  4. Crear rutas protegidas
- **Entregable**: Login y gestión de sesiones frontend

---

### Tarea 7: Panel de Administrador (Frontend)
- **Objetivo**: Todas las pantallas del administrador
- **Archivos clave**: `diseño/pantallas-y-navegacion.md`, `diseño/mockups/`
- **Pasos**:
  1. Crear Panel Administrador con navegación
  2. Implementar Lista de Alumnos (con buscador)
  3. Implementar Formulario de Alumno
  4. Implementar Lista de Salas y Formulario de Sala
  5. Implementar Gestión de Profesores y Cambio de Clave
  6. Implementar Historial
- **Entregable**: Todas las pantallas del admin

---

### Tarea 8: Panel de Profesor (Frontend)
- **Objetivo**: Todas las pantallas del profesor
- **Archivos clave**: `diseño/pantallas-y-navegacion.md`, `diseño/mockups/`
- **Pasos**:
  1. Crear Panel Profesor
  2. Implementar Mis Salas
  3. Implementar Toma de Asistencia y Resumen
  4. Implementar Historial de Mi Sala
  5. Implementar Alta de Alumno
- **Entregable**: Todas las pantallas del profesor

---

### Tarea 9: Integración y Pruebas End-to-End
- **Objetivo**: Integrar todo, probar y deployar
- **Archivos clave**: `DEPLOY.md`
- **Pasos**:
  1. Integrar frontend y backend
  2. Realizar pruebas funcionales
  3. Probar seguridad y permisos
  4. Deployar en Render/Neon
- **Entregable**: Sistema completo deployado

---

## 📅 Orden de Ejecución
1. **Primero (Paralelo)**: Tarea 1, Tarea 2, Tarea 6
2. **Segundo (Paralelo)**: Tarea 3, Tarea 4
3. **Tercero (Paralelo)**: Tarea 5, Tarea 7, Tarea 8
4. **Último**: Tarea 9

---

## 📋 Reglas Comunes
- Backend: Estructura `controllers/`, `services/`, `repositories/`, `middleware/`, `domain/`
- Frontend: React + Vite, responsive, manejo de errores
- Usar `pnpm` para dependencias
- Variables de entorno basadas en `.env.example`
