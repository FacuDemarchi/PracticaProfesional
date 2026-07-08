# Versión de Organización: Centro Comunitario Base

## Información General de la Versión

- **Nombre de la Organización**: Centro Comunitario Base (Versión Genérica)
- **Rama Git**: `main`
- **Fecha de Creación**: 2026-07-08
- **Versión Base**: Esta es la versión base
- **Autor**: [Tu nombre]

## Características del Sistema

### Funcionalidades Principales
- [x] Gestión de usuarios y asistencias
- [x] Roles de usuario (Administrador, Profesor)
- [x] Gestión de salas/espacios
- [ ] Reportes y estadísticas
- [ ] Integración con otros sistemas

### Características Específicas de la Organización
- Versión genérica adaptable a diferentes centros comunitarios
- Arquitectura modular para facilitar modificaciones

### Configuración Técnica
- **Base de Datos**: PostgreSQL (Neon)
- **Autenticación**: JWT
- **Despliegue**: Backend en Render, Frontend en Vercel
- **Infraestructura**: Node.js + Express + React (Vite)

## Modificaciones Respecto a la Versión Base

Esta es la versión base.

## Requisitos de la Organización

### Necesidades Funcionales
1. Gestión de asistencias de alumnos
2. Control de acceso por roles (Administrador y Profesor)
3. Gestión de salas y asignación de profesores

### Restricciones y Limitaciones
- Despliegue en la nube
- Base de datos PostgreSQL

## Notas de Mantenimiento
- Esta versión sirve como punto de partida para adaptaciones a otras organizaciones
- Las mejoras generales deben incorporarse a esta rama `main`

## Decisiones de Diseño Específicas
- Uso de arquitectura en capas (Controllers, Services, Repositories) para facilitar mantenimiento
- Separación clara entre frontend y backend para independencia tecnológica