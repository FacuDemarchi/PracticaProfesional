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

pred puedeIniciarSesion[p: Profesor, c: Clave] {
  p.clave = c
  p.estado = ProfesorActivo
}

pred puedeModificarToma[p: Profesor, t: TomarAsistencia] {
  p.estado = ProfesorActivo
  some t
}

pred ninoPresenteEnFecha[n: Nino, d: Dia] {
  some i: n.asistencias | i.fecha = d
}

pred profesorInhabilitado[p: Profesor] {
  p.estado = ProfesorInhabilitado
}

pred ninoInactivo[n: Nino] {
  n.estado = NinoInactivo
}

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

run {} for 5

check ProfesorInhabilitadoNoIniciaSesion for 5
check NoHayDosTomasParaElMismoDia for 5
check NoHayDosAsistenciasDeLaMismaFechaParaUnNino for 5
check TodaAsistenciaApuntaAUnaTomaExistente for 5
check TodoHistorialRefiereProfesoresActivos for 5
check TodaTomaTieneCreador for 5
