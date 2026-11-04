import type { AuthUser, LoginCredentials } from '../types';
import { AuthRoleEnum } from '../constants/enums';

const DEFAULT_MOCK_USER: AuthUser = {
  id: 1,
  username: 'an.nguyen',
  fullName: 'Nguyễn Văn An',
  role: AuthRoleEnum.ADMIN,
  studentId: 'B23DCCN005',
  classGroup: 'Nhóm 11',
  institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  token: 'mock-jwt-token-b23dccn005'
};

export async function loginApi(credentials: LoginCredentials): Promise<AuthUser> {
  const { username, password } = credentials;

  // Giả lập độ trễ mạng nhẹ (150ms) cho trải nghiệm thực tế
  await new Promise((resolve) => setTimeout(resolve, 150));

  if (!username.trim()) {
    throw new Error('Vui lòng nhập tên tài khoản hoặc mã sinh viên.');
  }

  // Chấp nhận mọi tài khoản demo / admin / B23DCCN005
  const isStudent = username.trim().toUpperCase() === 'B23DCCN005' || username.trim().toLowerCase().includes('b23');
  const authUser: AuthUser = {
    ...DEFAULT_MOCK_USER,
    username: username.trim(),
    fullName: 'Nguyễn Văn An',
    studentId: 'B23DCCN005',
    role: isStudent ? AuthRoleEnum.STUDENT : AuthRoleEnum.ADMIN
  };

  localStorage.setItem('iot_auth_user', JSON.stringify(authUser));
  return authUser;
}

export async function logoutApi(): Promise<void> {
  localStorage.removeItem('iot_auth_user');
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('iot_auth_user');
    if (!raw) return DEFAULT_MOCK_USER; // Mặc định tự động đăng nhập tài khoản sinh viên Nguyễn Văn An
    const parsed = JSON.parse(raw);
    // Luôn đảm bảo tên và MSV chuẩn theo yêu cầu
    return {
      ...parsed,
      fullName: 'Nguyễn Văn An',
      studentId: 'B23DCCN005'
    };
  } catch {
    return DEFAULT_MOCK_USER;
  }
}

