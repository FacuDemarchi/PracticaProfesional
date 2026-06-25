# Analisis De Software Simplificado

## 1. Vision Y Alcance

### 1.1 Contexto
El Centro de Gestion Comunitaria necesita ordenar el registro de alumnos y la toma de asistencia de sus clases de apoyo. Hoy la informacion puede quedar dispersa y eso dificulta el seguimiento.

### 1.2 Objetivo
Contar con un sistema simple para:

- registrar alumnos;
- asignarlos a una sala;
- definir profesor y horario por sala;
- tomar asistencia por fecha;
- consultar historial de asistencias.

### 1.3 Alcance
La primera etapa contempla:

- administracion basica de alumnos;
- administracion de profesores por un administrador;
- definicion de salas y horarios;
- toma manual de asistencia;
- consulta por fecha o historial.

Queda fuera de alcance:

- multiples organizaciones;
- integraciones externas;
- reportes avanzados;
- carga masiva;
- mensajeria automatica.

## 2. Actores

### 2.1 Administrador
- define credenciales de profesores;
- inhabilita o habilita profesores;
- modifica asistencias;
- administra salas y asignaciones generales.

En implementación:

- su clave se mantiene como variable de entorno;
- no se almacena en la base de datos;
- puede cambiar la clave de un profesor, que se guarda encriptada;
- no puede volver a visualizar la clave del profesor luego de guardarla.

### 2.2 Profesor
- toma asistencia de su sala;
- puede estar asignado a varias salas;
- solo puede crear la toma dentro del horario de su sala;
- no puede operar si esta inhabilitado.

### 2.3 Alumno
- no interactua con el sistema;
- es la entidad registrada para seguimiento de asistencia.

## 3. Requerimientos Funcionales

1. El sistema debe permitir registrar alumnos con nombre y apellido.
2. El sistema debe permitir organizar alumnos en salas.
3. El sistema debe permitir asignar un profesor a cada sala.
4. El sistema debe permitir definir hora de inicio y fin para cada sala.
5. El sistema debe permitir crear una toma de asistencia por sala y fecha.
6. El sistema debe permitir marcar alumnos presentes.
7. Los alumnos no marcados como presentes deben considerarse ausentes.
8. El sistema debe permitir consultar asistencias anteriores.
9. El administrador debe poder cambiar credenciales de profesores.
10. El administrador debe poder inhabilitar profesores.

## 4. Reglas De Negocio

1. Cada alumno pertenece a una unica sala.
2. Cada sala tiene un profesor, un horario de inicio y un horario de fin.
3. Solo puede existir una toma de asistencia por sala y fecha.
4. La toma de asistencia la crea el profesor asignado a la sala.
5. La toma debe crearse dentro del horario de la sala.
6. Un profesor inhabilitado no puede iniciar sesion ni crear tomas.
7. Solo alumnos de la sala pueden figurar como presentes.
8. Si un alumno de la sala no figura en el conjunto de presentes, se lo considera ausente.
9. La modificacion de asistencia queda reservada al administrador.
10. Las credenciales de profesores son definidas centralmente por el administrador.
11. La clave del administrador se gestiona fuera de la base de datos.
12. Las claves de profesores se almacenan encriptadas y pueden ser reemplazadas por el administrador.

## 5. Modelo De Dominio

### 5.1 Entidades

**Administrador**
- `profesoresInhabilitados`
- `credencialesProfesores`

**Profesor**
- identidad conceptual del docente

**Alumno**
- `nombre`
- `apellido`

**Sala**
- `profesor`
- `horaInicio`
- `horaFin`
- `alumnos`

**TomaAsistencia**
- `sala`
- `creador`
- `fecha`
- `horaCreacion`
- `presentes`

### 5.2 Relaciones
- un administrador gestiona credenciales e inhabilitaciones de profesores;
- una sala agrupa alumnos y tiene un profesor;
- un profesor puede estar asignado a varias salas;
- una toma pertenece a una sola sala;
- una toma registra solo los alumnos presentes de esa sala;
- la ausencia se deduce por complemento.

## 6. Casos De Uso Minimos

- CU01. Registrar alumno.
- CU02. Editar alumno.
- CU03. Buscar alumno.
- CU04. Crear sala.
- CU05. Asignar profesor y horario a sala.
- CU06. Iniciar toma de asistencia.
- CU07. Marcar presentes.
- CU08. Consultar historial.
- CU09. Cambiar credencial de profesor.
- CU10. Inhabilitar profesor.

## 7. Pantallas Minimas

- Lista de alumnos con buscador por nombre y apellido.
- Formulario de alta y edicion de alumno.
- Lista de salas con profesor y horario.
- Pantalla administrativa con pestanas para `Salas` y `Profesores`.
- Vista de profesores con listado y detalle de salas asignadas.
- Pantalla de toma de asistencia por sala y fecha.
- Pantalla de historial.
- Pantalla administrativa para credenciales e inhabilitaciones de profesores.

## 8. Riesgos Y Puntos Abiertos

- Definir si el administrador necesita su propio inicio de sesion.
- Definir si la modificacion de asistencia debe auditarse.
- Definir si una toma ya creada puede volver a abrirse siempre.

### 8.1 Proxima Revision Del Analisis

En la proxima revision del analisis se trabajara especialmente sobre `administradorPuedeModificarAsistencia()` para que deje de ser una regla demasiado conceptual y pase a expresar mejor las condiciones reales de modificacion.

## 9. Validacion Esperada

El analisis se considera satisfactorio si permite comprobar que:

1. se pueden registrar alumnos con nombre y apellido;
2. cada alumno queda asociado a una sala;
3. el profesor correcto puede crear la toma en horario;
4. la presencia se carga de forma rapida marcando solo presentes;
5. el historial puede consultarse por fecha;
6. el administrador puede gestionar credenciales e inhabilitaciones.
