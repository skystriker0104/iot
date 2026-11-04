import type { AuthUser, LoginCredentials } from '../types';
import { AuthRoleEnum } from '../constants/enums';

interface MockAccountConfig {
  username: string;
  passwords: string[];
  fullName: string;
  studentId: string;
  role: AuthRoleEnum;
  classGroup: string;
  institution: string;
}

const VALID_ACCOUNTS: MockAccountConfig[] = [
  {
    username: 'admin',
    passwords: ['Admin@123', 'admin', '123456'],
    fullName: 'Nguyễn Văn An',
    studentId: 'B23DCCN005',
    role: AuthRoleEnum.ADMIN,
    classGroup: 'Nhóm 11',
    institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  },
  {
    username: 'b23dccn005',
    passwords: ['Admin@123', 'admin', '123456'],
    fullName: 'Nguyễn Văn An',
    studentId: 'B23DCCN005',
    role: AuthRoleEnum.STUDENT,
    classGroup: 'Nhóm 11',
    institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  },
  {
    username: 'an.nguyen',
    passwords: ['Admin@123', 'admin', '123456'],
    fullName: 'Nguyễn Văn An',
    studentId: 'B23DCCN005',
    role: AuthRoleEnum.ADMIN,
    classGroup: 'Nhóm 11',
    institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  },
];

/**
 * Giả lập đăng nhập tài khoản (Mock Authentication)
 * Chỉ cho phép đăng nhập khi nhập đúng tài khoản và mật khẩu
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthUser> {
  const { username, password } = credentials;

  // Giả lập độ trễ mạng nhẹ (200ms) để hiển thị trạng thái loading chân thực
  await new Promise((resolve) => setTimeout(resolve, 200));

  const trimmedUsername = (username || '').trim().toLowerCase();
  const rawPassword = (password || '').trim();

  if (!trimmedUsername || !rawPassword) {
    throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
  }

  // Kiểm tra tài khoản & mật khẩu hợp lệ
  const matchedAccount = VALID_ACCOUNTS.find(
    (acc) => acc.username.toLowerCase() === trimmedUsername
  );

  if (!matchedAccount || !matchedAccount.passwords.includes(rawPassword)) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
  }

  const authUser: AuthUser = {
    id: 1,
    username: matchedAccount.username,
    fullName: matchedAccount.fullName,
    studentId: matchedAccount.studentId,
    role: matchedAccount.role,
    classGroup: matchedAccount.classGroup,
    institution: matchedAccount.institution,
    token: `mock-jwt-token-${matchedAccount.studentId.toLowerCase()}-${Date.now()}`,
  };

  localStorage.setItem('iot_auth_user', JSON.stringify(authUser));
  return authUser;
}

export async function logoutApi(): Promise<void> {
  localStorage.removeItem('iot_auth_user');
}

/**
 * Lấy thông tin người dùng hiện tại từ localStorage
 * Trả về null nếu chưa đăng nhập (để bắt buộc hiển thị màn hình đăng nhập)
 */
export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('iot_auth_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token) return null;

    return {
      ...parsed,
      fullName: 'Nguyễn Văn An',
      studentId: 'B23DCCN005',
    };
  } catch {
    return null;
  }
}
