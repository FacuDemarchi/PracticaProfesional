# Diseno De Pantallas Y Navegacion

## Objetivo

Definir las vistas principales del sistema y la forma en que el usuario navega entre ellas.

## Mapa De Navegacion

```mermaid
flowchart TD
    I[Inicio] --> LU[Login Unificado]

    LU --> PA[Panel Administrador]
    LU --> PP[Panel Profesor]

    PA --> AL1[Lista De Alumnos]
    PA --> SA1[Lista De Salas]
    PA --> PR1[Gestion De Profesores]
    PA --> HI1[Historial]

    AL1 --> FA[Formulario Alumno]
    SA1 --> FS[Formulario Sala]
    SA1 --> TA[Detalle De Sala]
    PR1 --> FP[Detalle Profesor]
    FP --> CP[Cambiar Clave]

    PP --> AA[Alta De Alumno]
    PP --> SA2[Mis Salas]
    PP --> HI2[Historial De Mi Sala]
    SA2 --> TO[Toma De Asistencia]
    TO --> RS[Resumen De Toma]
```

## Pantallas Principales

### 1. Login Unificado

- administrador y profesores ingresan desde la misma pantalla;
- el sistema intenta autenticar primero como administrador;
- si no coincide, intenta autenticar como profesor;
- bloqueo si el profesor esta inhabilitado.

### 2. Panel Administrador

- acceso rapido a salas, profesores e historial;
- resumen simple con acciones frecuentes;
- entrada principal para operaciones de gestion.

### 3. Lista De Alumnos

- buscador por nombre y apellido;
- listado de alumnos con su sala;
- accion para crear o editar alumno.

### 4. Formulario Alumno

- nombre;
- apellido;
- sala asignada;
- estado activo o inactivo si se desea manejar baja logica;
- disponible tanto en administracion como en el flujo de alta y edicion desde pantalla de profesor.

### 5. Lista De Salas

- nombre de sala;
- profesores asignados;
- horario;
- acceso a detalle o edicion.

### 6. Formulario Sala

- nombre de sala;
- uno o mas profesores asignados;
- hora de inicio;
- hora de fin.

### 7. Gestion De Profesores

- listado de profesores;
- estado habilitado o inhabilitado;
- detalle de salas asignadas;
- accion para cambiar clave.

### 8. Cambiar Clave

- ingreso de nueva clave;
- confirmacion;
- sin visualizacion de la clave actual.

### 9. Mis Salas

- vista para profesor con solo las salas que tiene asignadas;
- acceso a iniciar toma, consultar historial o dar de alta y editar alumnos segun la sala.

### 10. Toma De Asistencia

- seleccion de sala si el profesor tiene varias;
- fecha actual;
- listado de alumnos de la sala;
- marcado de presentes;
- guardado de la toma.

### 11. Resumen De Toma

- confirmacion de presentes registrados;
- total de presentes y ausentes;
- acceso a historial.

### 12. Historial

- filtro por sala y fecha;
- consulta de tomas anteriores;
- modificacion por profesor solo el mismo dia de la toma;
- modificacion por administrador despues de esa fecha.

## Reglas De Navegacion

- El administrador accede a todas las pantallas de gestion.
- El profesor solo ve sus propias salas y tomas.
- La pantalla de cambio de clave solo aparece dentro de gestion de profesores.
- La pantalla de toma no debe abrirse si el profesor esta fuera del horario permitido.

## Criterio Responsive

- La interfaz debe ser responsive y adaptarse al menos a escritorio, tablet y movil.
- Las pantallas principales deben mantener legibilidad, navegacion clara y acciones accesibles en distintos tamanos de pantalla.
- En pantallas reducidas, los listados y formularios deben reorganizarse sin perder informacion critica ni acciones principales.

## Relacion Con Mockups

- Los mockups actuales de `mockups/` representan la base visual de `Panel Administrador`, `Gestion De Profesores` y `Toma De Asistencia`.
- Este documento extiende esos mockups con el flujo completo de navegacion.
