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
| Registrar alumno | Si | No | No |
| Editar alumno | Si | No | No |
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

1. Cada alumno pertenece a una unica sala.
2. Cada sala tiene un profesor asignado.
3. Cada sala tiene una hora de inicio y una hora de fin validas.
4. Un profesor puede estar asignado a varias salas.
5. Solo puede existir una toma de asistencia por sala y fecha.

### 2. Reglas De Asistencia

1. La toma de asistencia la crea el profesor asignado a la sala.
2. La toma debe registrarse dentro del horario de la sala.
3. Un profesor inhabilitado no puede iniciar sesion ni crear tomas.
4. Solo alumnos de la sala pueden quedar registrados en la toma.
5. Los alumnos de la sala no marcados como presentes se consideran ausentes.

### 3. Reglas De Seguridad

1. La clave del administrador no se almacena en la base de datos.
2. La clave del administrador se obtiene desde variable de entorno.
3. Las claves de profesores se almacenan de forma protegida.
4. El administrador puede reemplazar la clave de un profesor.
5. La interfaz no debe mostrar la clave actual del profesor.

### 4. Reglas De Modificacion

1. Solo el administrador puede modificar una asistencia ya registrada.
2. Si se permite modificacion posterior, debe quedar al menos constancia de fecha y responsable en una version futura.
3. La primera etapa no requiere auditoria completa, pero el diseno la deja contemplada.

## Reglas De Validacion En Interfaz Y Backend

- No permitir guardar alumno sin nombre, apellido o sala.
- No permitir guardar sala sin profesor u horario valido.
- No permitir iniciar toma duplicada para la misma sala y fecha.
- No permitir marcar alumnos ajenos a la sala.
- No permitir acceso a vistas de administracion desde un profesor.

## Observaciones

- Este documento consolida reglas ya definidas en `../analisis/analisis.md` y `diseno-claves.md`.
- Las reglas se deben implementar tanto en interfaz como en backend, pero la validacion definitiva debe quedar del lado del servidor o logica central.
