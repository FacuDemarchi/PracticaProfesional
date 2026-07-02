-- Schema fisico inicial para PostgreSQL.
-- Este archivo materializa las restricciones estructurales del diseno.
--
-- Reglas que quedan en la aplicacion y no se fuerzan por SQL:
-- 1. Administrador y profesores usan la misma pantalla de login.
--    La app intenta primero autenticar como admin con ADMIN_PASSWORD
--    y, si no coincide, intenta autenticar como profesor.
-- 2. El profesor puede reabrir y modificar una toma durante el mismo dia.
--    Despues de esa fecha, solo el administrador puede modificarla.
-- 3. El profesor puede editar alumnos segun sus permisos de aplicacion.

begin;

create table profesor (
  id integer generated always as identity primary key,
  nombre varchar(100) not null,
  apellido varchar(100) not null,
  habilitado boolean not null default true,
  creado_en timestamp not null default current_timestamp,
  actualizado_en timestamp not null default current_timestamp
);

create table credencial_profesor (
  profesor_id integer primary key,
  clave_hash varchar(255) not null,
  actualizada_en timestamp not null default current_timestamp,
  constraint fk_credencial_profesor
    foreign key (profesor_id)
    references profesor(id)
    on delete cascade
);

create table sala (
  id integer generated always as identity primary key,
  nombre varchar(100) not null unique,
  hora_inicio time not null,
  hora_fin time not null,
  activa boolean not null default true,
  constraint ck_sala_horario
    check (hora_inicio < hora_fin)
);

create table sala_profesor (
  sala_id integer not null,
  profesor_id integer not null,
  primary key (sala_id, profesor_id),
  constraint fk_sala_profesor_sala
    foreign key (sala_id)
    references sala(id)
    on delete cascade,
  constraint fk_sala_profesor_profesor
    foreign key (profesor_id)
    references profesor(id)
    on delete restrict
);

create table alumno (
  id integer generated always as identity primary key,
  nombre varchar(100) not null,
  apellido varchar(100) not null,
  sala_id integer not null,
  activo boolean not null default true,
  constraint fk_alumno_sala
    foreign key (sala_id)
    references sala(id)
    on delete restrict
);

create table toma_asistencia (
  id integer generated always as identity primary key,
  sala_id integer not null,
  creador_profesor_id integer not null,
  fecha date not null,
  hora_creacion time not null,
  estado varchar(20) not null default 'cerrada',
  creada_en timestamp not null default current_timestamp,
  actualizada_en timestamp not null default current_timestamp,
  constraint uq_toma_sala_fecha
    unique (sala_id, fecha),
  constraint ck_toma_estado
    check (estado in ('abierta', 'cerrada')),
  constraint fk_toma_sala
    foreign key (sala_id)
    references sala(id)
    on delete restrict,
  constraint fk_toma_creador
    foreign key (creador_profesor_id)
    references profesor(id)
    on delete restrict,
  constraint fk_toma_creador_asignado
    foreign key (sala_id, creador_profesor_id)
    references sala_profesor(sala_id, profesor_id)
    on delete restrict
);

create table detalle_asistencia (
  id integer generated always as identity primary key,
  toma_asistencia_id integer not null,
  alumno_id integer not null,
  presente boolean not null,
  observacion varchar(255),
  constraint uq_detalle_toma_alumno
    unique (toma_asistencia_id, alumno_id),
  constraint fk_detalle_toma
    foreign key (toma_asistencia_id)
    references toma_asistencia(id)
    on delete cascade,
  constraint fk_detalle_alumno
    foreign key (alumno_id)
    references alumno(id)
    on delete restrict
);

create index ix_alumno_apellido_nombre
  on alumno(apellido, nombre);

create index ix_sala_profesor_profesor
  on sala_profesor(profesor_id);

create index ix_toma_sala_fecha
  on toma_asistencia(sala_id, fecha);

create index ix_toma_creador_fecha
  on toma_asistencia(creador_profesor_id, fecha);

create index ix_detalle_alumno
  on detalle_asistencia(alumno_id);

commit;
