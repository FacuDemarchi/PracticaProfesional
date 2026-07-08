export type UserRole = 'admin' | 'profesor';

export interface User {
  id: number;
  nombre?: string;
  apellido?: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
