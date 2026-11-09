export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}
