export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  studentId: string;
  classGroup: string;
  institution: string;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}
