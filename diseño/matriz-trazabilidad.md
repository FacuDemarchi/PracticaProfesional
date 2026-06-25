# Matriz De Trazabilidad

## Objetivo

Relacionar casos de uso, pantallas, entidades y reglas para asegurar consistencia entre analisis y diseno.

## Matriz

| Caso De Uso | Pantalla Principal | Entidades | Reglas Asociadas |
| --- | --- | --- | --- |
| CU01. Registrar alumno | Formulario Alumno | Alumno, Sala | alumno debe tener nombre, apellido y una unica sala |
| CU02. Editar alumno | Formulario Alumno | Alumno, Sala | mantener asignacion valida a una sala |
| CU03. Buscar alumno | Lista De Alumnos | Alumno, Sala | busqueda por nombre y apellido |
| CU04. Crear sala | Formulario Sala | Sala, Profesor | sala debe tener profesor y horario valido |
| CU05. Asignar profesor y horario a sala | Formulario Sala, Detalle De Sala | Sala, Profesor | una sala tiene un profesor asignado y horario valido |
| CU06. Iniciar toma de asistencia | Toma De Asistencia | TomaAsistencia, Sala, Profesor | solo una toma por sala y fecha; solo profesor asignado; profesor habilitado; dentro de horario |
| CU07. Marcar presentes | Toma De Asistencia | TomaAsistencia, DetalleAsistencia, Alumno | solo alumnos de la sala; ausentes por complemento o detalle en falso |
| CU08. Consultar historial | Historial | TomaAsistencia, DetalleAsistencia, Sala, Alumno | consulta por fecha y sala; visibilidad segun rol |
| CU09. Cambiar credencial de profesor | Gestion De Profesores, Cambiar Clave | Profesor, CredencialProfesor | clave protegida; no mostrar clave actual; reemplazo total de credencial |
| CU10. Inhabilitar profesor | Gestion De Profesores | Profesor | profesor inhabilitado no puede iniciar sesion ni crear tomas |

## Reglas Referenciadas

### R01

Cada alumno pertenece a una unica sala.

### R02

Cada sala tiene un profesor asignado.

### R03

Cada sala tiene horario valido con hora de inicio menor que hora de fin.

### R04

Solo puede existir una toma por sala y fecha.

### R05

La toma la crea el profesor asignado a la sala.

### R06

La toma se crea dentro del horario de la sala.

### R07

Un profesor inhabilitado no puede iniciar sesion ni registrar asistencia.

### R08

Solo alumnos de la sala pueden figurar en la asistencia.

### R09

La ausencia se deduce por complemento o por detalle persistido.

### R10

Solo el administrador puede cambiar credenciales e inhabilitar profesores.

### R11

La clave del administrador se mantiene fuera de la base de datos.

### R12

La clave del profesor se almacena protegida y no se vuelve a mostrar.

## Uso De La Matriz

- Verificar que cada caso de uso tenga al menos una pantalla asociada.
- Verificar que cada pantalla tenga entidades y reglas identificables.
- Detectar rapidamente requisitos sin soporte en diseno.
