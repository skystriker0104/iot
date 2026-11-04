import type { DemoAccount } from './type';

export const DEMO_ACCOUNTS: (DemoAccount & { pass: string })[] = [
  {
    title: 'Nguyễn Văn An (Admin)',
    username: 'admin',
    pass: 'Admin@123',
    roleDescription: 'B23DCCN005 / Nhóm 11'
  }
];

export const LOGIN_MESSAGES = {
  EMPTY_ERROR: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu (BR1.1)',
  INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác (HTTP 401 Unauthorized)',
  AUTHENTICATING: 'Đang xác thực JWT Token...',
  BUTTON_SUBMIT: 'Đăng nhập'
} as const;
