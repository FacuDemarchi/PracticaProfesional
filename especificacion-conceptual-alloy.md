# Especificacion Conceptual De Alto Nivel En Alloy

## 1. Objetivo

Este documento presenta una especificacion conceptual de alto nivel para el sistema de asistencia escolar del Centro de Gestion Comunitaria.

El objetivo de esta version es formalizar las reglas estructurales principales del dominio, sin entrar todavia en detalles de implementacion tecnica ni en el modelado completo de estados temporales.

Las reglas que se buscan capturar son:

- acceso de profesores mediante clave;
- gestion de profesores por parte del administrador;
- gestion de ninos;
- toma diaria de asistencia;
- trazabilidad sin eliminacion fisica de profesores;
- unicidad de la toma por fecha;
- registro de presencia de cada nino mediante identificadores de asistencia.

Se conserva el nombre `TomarAsistencia` como concepto principal de la operacion diaria.

## 2. Alcance Del Modelo

La especificacion se mantiene en un nivel conceptual. Por eso:

- no fija una base de datos concreta;
- no modela la interfaz de usuario;
- no modela cifrado ni almacenamiento real de claves;
- no modela aun secuencias de estados antes y despues;
- no modela la serializacion tecnica de JSON;
- no fija la representacion fisica exacta del identificador de asistencia.

Lo que si establece es la estructura del dominio y las invariantes de negocio que no deberian romperse.

## 3. Conceptos Del Dominio

### 3.1 Administrador

El `Administrador` es el actor que puede gestionar profesores. En este nivel se modela como una entidad unica del sistema.

### 3.2 Profesor

Cada `Profesor`:

- tiene una clave de acceso;
- tiene un estado, que puede ser activo o inhabilitado;
- puede crear una `TomarAsistencia`;
- puede modificar una `TomarAsistencia` existente si se encuentra activo.

### 3.3 Nino

Cada `Nino`:

- tiene identidad propia;
- puede estar activo o inactivo;
- puede tener datos adicionales flexibles;
- mantiene una coleccion de identificadores de asistencia asociados a las fechas en las que figura presente.

En el lenguaje del problema puede hablarse de una lista de asistencias. En esta especificacion Alloy se modela esa informacion como un `set`, porque el foco esta puesto en la pertenencia y en la unicidad, no en el orden.

### 3.4 TomarAsistencia

`TomarAsistencia` representa la toma diaria de asistencia para una fecha.

En el analisis funcional acordado:

- solo puede existir una `TomarAsistencia` por fecha;
- la toma tiene un profesor creador;
- la asistencia de cada nino para esa fecha queda reflejada por la presencia de un identificador en `Nino.asistencias`.

### 3.5 IdentificadorDeAsistencia

Cada `IdentificadorDeAsistencia` modela el valor conceptual que representa una asistencia positiva de un nino en una fecha.

Su estructura queda compuesta por:

- el profesor que registro la asistencia;
- la fecha correspondiente a la toma;
- un historial de modificaciones asociado a esa asistencia.

En este nivel conceptual, esa composicion corresponde a la idea `id_profesor + fecha_actual`.

Si un nino no posee un identificador para una fecha dada, se interpreta conceptualmente como ausente para esa fecha.

### 3.6 HistorialModificaciones

`HistorialModificaciones` representa la trazabilidad asociada a un `IdentificadorDeAsistencia`.

Cada entrada de historial registra el profesor involucrado en una modificacion de esa asistencia puntual.

## 4. Modelo Alloy Base

```alloy
module asistencia/conceptual

abstract sig EstadoProfesor {}
one sig ProfesorActivo, ProfesorInhabilitado extends EstadoProfesor {}

abstract sig EstadoNino {}
one sig NinoActivo, NinoInactivo extends EstadoNino {}

sig Clave {}
sig Dia {}
sig DatoExtra {}

one sig Administrador {}

sig Profesor {
  clave: one Clave,
  estado: one EstadoProfesor
}

sig HistorialModificaciones {
  profesor: one Profesor
}

sig IdentificadorDeAsistencia {
  profesor: one Profesor,
  fecha: one Dia,
  historialModificaciones: set HistorialModificaciones
}

sig Nino {
  estado: one EstadoNino,
  datosExtra: set DatoExtra,
  asistencias: set IdentificadorDeAsistencia
}

sig TomarAsistencia {
  fecha: one Dia,
  creador: one Profesor
}
```

## 5. Restricciones Estructurales

En este bloque se formalizan las invariantes centrales del sistema.

```alloy
fact ClavesUnicasPorProfesor {
  all disj p1, p2: Profesor | p1.clave != p2.clave
}

fact UnaSolaTomarAsistenciaPorFecha {
  all disj t1, t2: TomarAsistencia | t1.fecha != t2.fecha
}

fact TodoIdentificadorPerteneceAAlgunNino {
  all i: IdentificadorDeAsistencia | some n: Nino | i in n.asistencias
}

fact TodoHistorialPerteneceAAlgunIdentificador {
  all h: HistorialModificaciones |
    some i: IdentificadorDeAsistencia | h in i.historialModificaciones
}

fact UnSoloIdentificadorPorNinoYFecha {
  all n: Nino |
    all disj i1, i2: n.asistencias | i1.fecha != i2.fecha
}

fact TodaAsistenciaCorrespondeAUnaTomaExistente {
  all n: Nino, i: n.asistencias |
    one t: TomarAsistencia | t.fecha = i.fecha
}

fact TodoProfesorQueRegistraAsistenciaEsActivo {
  all n: Nino, i: n.asistencias | i.profesor.estado = ProfesorActivo
}

fact TodoProfesorEnHistorialEsActivo {
  all i: IdentificadorDeAsistencia, h: i.historialModificaciones |
    h.profesor.estado = ProfesorActivo
}

fact TodaTomaTieneCreadorDefinido {
  all t: TomarAsistencia | one t.creador
}
```

## 6. Predicados De Negocio

Estos predicados no describen una ejecucion completa del sistema, pero permiten expresar reglas operativas relevantes.

### 6.1 Login De Profesor

Un profesor puede iniciar sesion si su clave coincide y su estado es activo.

```alloy
pred puedeIniciarSesion[p: Profesor, c: Clave] {
  p.clave = c
  p.estado = ProfesorActivo
}
```

### 6.2 Profesor Puede Modificar La Toma Del Dia

Una `TomarAsistencia` existente puede ser modificada por un profesor activo.

```alloy
pred puedeModificarToma[p: Profesor, t: TomarAsistencia] {
  p.estado = ProfesorActivo
  some t
}
```

### 6.3 Nino Presente En Una Fecha

Un nino figura presente en una fecha cuando tiene un identificador de asistencia asociado a esa fecha.

```alloy
pred ninoPresenteEnFecha[n: Nino, d: Dia] {
  some i: n.asistencias | i.fecha = d
}
```

### 6.4 Baja Logica De Profesor

No existe eliminacion fisica de profesores en el modelo conceptual. La baja se expresa como cambio de estado.

```alloy
pred profesorInhabilitado[p: Profesor] {
  p.estado = ProfesorInhabilitado
}
```

### 6.5 Baja Logica De Nino

Los ninos pueden quedar inactivos sin perder trazabilidad historica.

```alloy
pred ninoInactivo[n: Nino] {
  n.estado = NinoInactivo
}
```

## 7. Lectura Conceptual De Las Reglas

Las restricciones anteriores expresan estas decisiones del analisis:

- dos profesores no pueden compartir la misma clave;
- no puede haber dos tomas distintas para el mismo dia;
- todo identificador de asistencia debe estar asociado al menos a un nino;
- toda entrada de historial debe estar asociada a algun identificador de asistencia;
- un nino no puede tener mas de una asistencia para la misma fecha;
- toda asistencia referenciada por un nino debe corresponder a una toma existente;
- la asistencia solo puede quedar registrada por un profesor activo;
- los profesores que aparecen en historiales de modificacion deben estar activos;
- la historia de profesores, ninos y asistencias se conserva sin borrado fisico.

## 8. Aserciones Para Verificacion

Estas aserciones permiten usar `check` en Alloy Analyzer para validar propiedades del modelo.

```alloy
assert ProfesorInhabilitadoNoIniciaSesion {
  all p: Profesor, c: Clave |
    p.estado = ProfesorInhabilitado implies not puedeIniciarSesion[p, c]
}

assert NoHayDosTomasParaElMismoDia {
  all disj t1, t2: TomarAsistencia | t1.fecha != t2.fecha
}

assert NoHayDosAsistenciasDeLaMismaFechaParaUnNino {
  all n: Nino |
    all disj i1, i2: n.asistencias | i1.fecha != i2.fecha
}

assert TodaAsistenciaApuntaAUnaTomaExistente {
  all n: Nino, i: n.asistencias |
    one t: TomarAsistencia | t.fecha = i.fecha
}

assert TodoHistorialRefiereProfesoresActivos {
  all i: IdentificadorDeAsistencia, h: i.historialModificaciones |
    h.profesor.estado = ProfesorActivo
}

assert TodaTomaTieneCreador {
  all t: TomarAsistencia | one t.creador
}
```

## 9. Comandos Iniciales De Exploracion

Estos comandos ayudan a explorar instancias validas del modelo.

```alloy
run {} for 5

check ProfesorInhabilitadoNoIniciaSesion for 5
check NoHayDosTomasParaElMismoDia for 5
check NoHayDosAsistenciasDeLaMismaFechaParaUnNino for 5
check TodaAsistenciaApuntaAUnaTomaExistente for 5
check TodoHistorialRefiereProfesoresActivos for 5
check TodaTomaTieneCreador for 5
```

## 10. Observaciones Sobre El Nivel Conceptual

Hay decisiones importantes que todavia no se modelan de forma temporal o procedural:

- si una `TomarAsistencia` queda siempre editable o puede cerrarse;
- como se implementa tecnicamente el identificador conceptual, por ejemplo como string, clave compuesta o valor serializado;
- como se representa temporalmente cada entrada de `HistorialModificaciones`;
- como se serializan los datos flexibles en JSON;
- si el administrador inicia sesion con un mecanismo propio;
- si la coleccion `asistencias` debe mantenerse historica de forma indefinida o con reglas adicionales de depuracion;
- si en una version futura conviene modelar orden real de lista en lugar de simple pertenencia.

En esta primera especificacion, el centro del modelo no es la persistencia, sino la consistencia conceptual del dominio.

## 11. Proximo Paso Recomendado

La siguiente evolucion natural de esta especificacion puede seguir una de estas dos lineas:

1. Refinar el modelo conceptual actual, agregando:
   - administracion formal de profesores;
   - restricciones sobre ninos activos e inactivos en nuevas tomas;
   - reportes de faltas;
   - reglas mas precisas para altas, modificaciones y presencia.

2. Pasar a una especificacion Alloy mas operacional, agregando:
   - estados antes y despues;
   - operaciones de alta, inhabilitacion y toma de asistencia;
   - precondiciones y postcondiciones;
   - eventos de registro y modificacion.

Este documento queda como base formal de alto nivel para discutir el dominio antes de bajar a una especificacion mas detallada.
