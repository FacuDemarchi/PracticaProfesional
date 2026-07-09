export type UserRole = 'admin' | 'profesor';

export interface User {
  role: UserRole;
  profesorId?: number;
  nombre?: string;
  apellido?: string;
}

export interface LoginCredentials {
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  sala_id: number;
  activo: boolean;
  sala?: Sala;
}

export interface Sala {
  id: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  activa: boolean;
  profesores?: Profesor[];
}

export interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  habilitado: boolean;
  creado_en: string;
  actualizado_en: string;
  salas?: Sala[];
}

export interface TomaAsistencia {
  id: number;
  sala_id: number;
  creador_profesor_id: number;
  fecha: string;
  hora_creacion: string;
  estado: 'abierta' | 'cerrada';
  creada_en: string;
  actualizada_en: string;
  sala?: Sala;
  profesor?: Profesor;
  detalles?: DetalleAsistencia[];
}

export interface DetalleAsistencia {
  id: number;
  toma_asistencia_id: number;
  alumno_id: number;
  presente: boolean;
  observacion?: string;
  alumno?: Alumno;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  message?: string;
}
