# Reglas De Negocio Y Permisos

## Objetivo

Consolidar las reglas operativas del sistema y dejar explicitos los permisos de cada actor.

## Actores

- `Administrador`
- `Profesor`
- `Alumno` como entidad del dominio, sin acceso interactivo

## Matriz De Permisos

| Accion | Administrador | Profesor | Alumno |
| --- | --- | --- | --- |
| Iniciar sesion | Si | Si, si esta habilitado | No aplica |
| Registrar alumno | Si | Si, desde su pantalla y para una sala habilitada | No |
| Editar alumno | Si | Si, sobre alumnos de sus salas segun reglas de aplicacion | No |
| Buscar alumno | Si | Si, limitado a su sala si se implementa | No |
| Crear sala | Si | No | No |
| Asignar profesor a sala | Si | No | No |
| Definir horario de sala | Si | No | No |
| Iniciar toma de asistencia | No | Si, si es profesor de la sala y esta en horario | No |
| Marcar presentes | No | Si, sobre alumnos de su sala | No |
| Consultar historial | Si | Si, de sus salas | No |
| Modificar asistencia ya registrada | Si | No | No |
| Cambiar clave de profesor | Si | No | No |
| Inhabilitar o habilitar profesor | Si | No | No |

## Reglas De Negocio Principales

### 1. Reglas Estructurales

1. El alta de alumno puede realizarse desde la pantalla del profesor y el alumno queda asociado a la sala desde la que fue registrado.
2. Cada sala puede tener uno o mas profesores asignados.
3. Cada sala tiene una hora de inicio y una hora de fin validas.
4. Un profesor puede estar asignado a varias salas.
5. Solo puede existir una toma de asistencia por sala y fecha.

### 2. Reglas De Asistencia

1. La toma de asistencia la crea uno de los profesores asignados a la sala.
2. La toma debe registrarse dentro del horario de la sala.
3. Un profesor inhabilitado no puede iniciar sesion ni crear tomas.
4. Solo alumnos de la sala pueden quedar registrados en la toma.
5. Los alumnos de la sala no marcados como presentes se consideran ausentes.

### 3. Reglas De Seguridad

1. Administrador y profesores inician sesion desde la misma pantalla.
2. El sistema intenta autenticar primero como administrador y, si no coincide, como profesor.
3. La clave del administrador no se almacena en la base de datos y se obtiene desde variable de entorno.
4. Las claves de profesores se almacenan de forma protegida.
5. El administrador puede reemplazar la clave de un profesor.
6. La interfaz no debe mostrar la clave actual del profesor.

### 4. Reglas De Modificacion

1. El profesor puede reabrir y modificar una toma durante el mismo dia de su creacion.
2. Despues de esa fecha, solo el administrador puede modificar la asistencia.
3. En esta primera etapa no se requiere constancia ni auditoria de modificaciones.

## Reglas De Validacion En Interfaz Y Backend

- No permitir guardar alumno sin nombre, apellido o sala.
- No permitir guardar sala sin al menos un profesor asignado o sin horario valido.
- No permitir iniciar toma duplicada para la misma sala y fecha.
- No permitir marcar alumnos ajenos a la sala.
- No permitir acceso a vistas de administracion desde un profesor.

## Observaciones

- Este documento consolida reglas ya definidas en `../analisis/analisis.md` y `diseno-claves.md`.
- Las reglas se deben implementar tanto en interfaz como en backend, pero la validacion definitiva debe quedar del lado del servidor o logica central.
