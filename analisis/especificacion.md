# Especificacion Conceptual De Alto Nivel En Alloy

## 1. Objetivo

Este documento resume el modelo conceptual actual del sistema de asistencia para una unica organizacion.

El foco esta en:

- administracion de profesores por parte de un unico administrador;
- asignacion de profesores a salas;
- definicion de horario por sala;
- toma de asistencia por sala y fecha;
- alumnos presentes explicitados y ausentes implicitos.

## 2. Alcance Del Modelo

El modelo Alloy:

- no fija una tecnologia de base de datos;
- no modela interfaz;
- no modela cifrado real de claves;
- no modela historial temporal de cambios;
- no modela multiples organizaciones.

Si modela:

- estructura del dominio;
- permisos conceptuales minimos;
- restricciones de unicidad;
- consistencia de la toma de asistencia.

## 3. Conceptos Del Dominio

### 3.1 Administrador

Existe un unico `Administrador`.

Sus responsabilidades conceptuales son:

- definir las credenciales de los profesores;
- mantener el conjunto de `profesoresInhabilitados`;
- modificar la asistencia.

En diseño e implementación:

- la clave del administrador se mantiene fuera de la base de datos, mediante variable de entorno;
- las credenciales de profesores se almacenan en base de datos de forma encriptada;
- el administrador puede reemplazar la credencial de un profesor, pero no volver a verla luego de guardarla.

### 3.2 Profesor

Cada `Profesor` no almacena su clave directamente. La credencial es administrada por `Administrador.credencialesProfesores`.

Un profesor puede:

- iniciar sesion si su credencial coincide;
- crear una `TomaAsistencia` solo si no esta inhabilitado;
- estar asignado a varias salas.

### 3.3 Alumno

Cada `Alumno` tiene:

- `nombre`;
- `apellido`.

Cada alumno pertenece exactamente a una sala.

### 3.4 Sala

Cada `Sala` tiene:

- un `profesor`;
- una `horaInicio`;
- una `horaFin`;
- un conjunto de `alumnos`.

La sala es la unidad principal para organizar la asistencia.

### 3.5 TomaAsistencia

Cada `TomaAsistencia` representa la asistencia de una sala en una fecha y hora de creacion determinadas.

Incluye:

- la `sala`;
- el `creador`;
- la `fecha`;
- la `horaCreacion`;
- el conjunto `presentes`.

La ausencia se interpreta por complemento:

- si un alumno de la sala esta en `presentes`, esta presente;
- si pertenece a la sala y no esta en `presentes`, esta ausente.

## 4. Modelo Alloy Base

```alloy
module asistencia/conceptual

open util/ordering[Hora]

sig Clave {}
sig Dia {}
sig Hora {}
sig Nombre {}
sig Apellido {}

sig Profesor {}

one sig Administrador {
  profesoresInhabilitados: set Profesor,
  credencialesProfesores: Profesor -> one Clave
}

sig Alumno {
  nombre: one Nombre,
  apellido: one Apellido
}

sig Sala {
  profesor: one Profesor,
  horaInicio: one Hora,
  horaFin: one Hora,
  alumnos: set Alumno
}

sig TomaAsistencia {
  sala: one Sala,
  creador: one Profesor,
  fecha: one Dia,
  horaCreacion: one Hora,
  presentes: set Alumno
}
```

## 5. Restricciones Estructurales

Las invariantes principales son:

- dos profesores no comparten credencial;
- cada alumno pertenece a una sola sala;
- cada sala tiene un intervalo horario valido;
- solo puede existir una toma por sala y fecha;
- la toma la crea el profesor de la sala;
- el profesor creador no puede estar inhabilitado;
- la toma se crea dentro del horario de la sala;
- solo alumnos de la sala pueden figurar como presentes.

## 6. Predicados Relevantes

```alloy
pred profesorPuedeIniciarSesion[p: Profesor, c: Clave] {
  Administrador.credencialesProfesores[p] = c
  p not in Administrador.profesoresInhabilitados
}

pred administradorPuedeModificarAsistencia[a: lone Administrador, p: lone Profesor, t: TomaAsistencia] {
  some a
  no p
  some t
}

pred alumnoEstaPresenteEnToma[a: Alumno, t: TomaAsistencia] {
  a in t.presentes
}

pred alumnoEstaAusenteEnToma[a: Alumno, t: TomaAsistencia] {
  a in t.sala.alumnos
  a not in t.presentes
}
```

## 7. Aserciones De Verificacion

Los `check` actuales validan que:

- un profesor inhabilitado no inicia sesion;
- la toma respeta profesor y horario de la sala;
- el administrador puede modificar la asistencia;
- un profesor no puede modificar la asistencia;
- un alumno fuera de la sala no puede quedar presente;
- todo alumno de la sala queda presente o ausente;
- nadie puede estar presente y ausente a la vez.

## 8. Observaciones

El modelo actual prioriza simplicidad conceptual:

- no usa estados abstractos;
- no guarda registros individuales por alumno;
- interpreta ausencia como falta de pertenencia al conjunto `presentes`;
- centraliza credenciales e inhabilitaciones en `Administrador`.

Los mockups actuales son consistentes con este enfoque:

- pantalla de administrador con pestanas para `Salas` y `Profesores`;
- listado de salas con accion para registrar una nueva;
- listado de profesores con detalle de salas asignadas;
- pantalla de profesor con busqueda, toma de asistencia y registro de alumnos.

## 9. Proximo Paso Recomendado

Las mejoras naturales del modelo son:

1. agregar historial formal de modificaciones;
2. decidir si una sala puede cambiar de profesor en el tiempo;
3. modelar si el administrador tambien inicia sesion, aun cuando su clave viva fuera de la base de datos;
4. definir si conviene agregar identidad mas rica de alumno.
