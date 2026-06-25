module asistencia/conceptual

open util/ordering[Hora]

sig Clave {}
sig Dia {}
sig Hora {}
sig Nombre {}
sig Apellido {}

sig Profesor {
}

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

fact ClavesUnicasPorProfesor {
  all disj p1, p2: Profesor |
    Administrador.credencialesProfesores[p1] != Administrador.credencialesProfesores[p2]
}

fact CadaAlumnoPerteneceAUnaSala {
  all a: Alumno | one s: Sala | a in s.alumnos
}

fact IntervaloHorarioValidoPorSala {
  all s: Sala | lt[s.horaInicio, s.horaFin]
}

fact UnaSolaTomaPorSalaYFecha {
  all disj t1, t2: TomaAsistencia |
    t1.sala != t2.sala or t1.fecha != t2.fecha
}

fact TodaTomaLaCreaElProfesorDeLaSala {
  all t: TomaAsistencia | {
    t.creador = t.sala.profesor
    t.creador not in Administrador.profesoresInhabilitados
    lte[t.sala.horaInicio, t.horaCreacion]
    lte[t.horaCreacion, t.sala.horaFin]
  }
}

fact SoloAlumnosDeLaSalaPuedenEstarPresentes {
  all t: TomaAsistencia | t.presentes in t.sala.alumnos
}

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

assert ProfesorInhabilitadoNoPuedeIniciarSesion {
  all p: Profesor, c: Clave |
    p in Administrador.profesoresInhabilitados implies not profesorPuedeIniciarSesion[p, c]
}

assert TomaAsistenciaRespetaProfesorYHorarioDeSala {
  all t: TomaAsistencia |
    t.creador = t.sala.profesor and
    t.creador not in Administrador.profesoresInhabilitados and
    lte[t.sala.horaInicio, t.horaCreacion] and
    lte[t.horaCreacion, t.sala.horaFin]
}

assert AdministradorPuedeModificarAsistencia {
  all t: TomaAsistencia | administradorPuedeModificarAsistencia[Administrador, none, t]
}

assert ProfesorNoPuedeModificarAsistencia {
  all p: Profesor, t: TomaAsistencia |
    not administradorPuedeModificarAsistencia[none, p, t]
}

assert AlumnoFueraDeLaSalaNoPuedeEstarPresente {
  all t: TomaAsistencia, a: Alumno |
    a not in t.sala.alumnos implies
      a not in t.presentes
}

assert AlumnoDeLaSalaEstaPresenteOAusente {
  all t: TomaAsistencia, a: Alumno |
    a in t.sala.alumnos implies
      (alumnoEstaPresenteEnToma[a, t] or alumnoEstaAusenteEnToma[a, t])
}

assert AlumnoNoPuedeEstarPresenteYAusenteEnLaMismaToma {
  all t: TomaAsistencia, a: Alumno |
    alumnoEstaPresenteEnToma[a, t] implies not alumnoEstaAusenteEnToma[a, t]
}

pred escenarioValidoConProfesorEnVariasSalas {
  some Sala
  some Profesor
  some Alumno
  some TomaAsistencia
  some s: Sala | some s.alumnos
  some t: TomaAsistencia | some t.presentes
  some disj s1, s2: Sala | s1.profesor = s2.profesor
}

run escenarioValidoConProfesorEnVariasSalas for 5

check ProfesorInhabilitadoNoPuedeIniciarSesion for 5
check TomaAsistenciaRespetaProfesorYHorarioDeSala for 5
check AdministradorPuedeModificarAsistencia for 5
check ProfesorNoPuedeModificarAsistencia for 5
check AlumnoFueraDeLaSalaNoPuedeEstarPresente for 5
check AlumnoDeLaSalaEstaPresenteOAusente for 5
check AlumnoNoPuedeEstarPresenteYAusenteEnLaMismaToma for 5
