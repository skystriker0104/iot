import type { AuthUser } from '../../lib/types';

export interface LoginPageProps {
  onLoginSuccess?: (user: AuthUser) => void;
}

export interface DemoAccount {
  title: string;
  username: string;
  roleDescription: string;
}
