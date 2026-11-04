import type { DemoAccount } from './type';

export const DEMO_ACCOUNTS: (DemoAccount & { pass: string })[] = [
  {
    title: 'Nguyễn Văn An (Quản trị viên)',
    username: 'admin',
    pass: 'Admin@123',
    roleDescription: 'B23DCCN005 / Nhóm 11'
  },
  {
    title: 'Tài khoản Sinh viên',
    username: 'B23DCCN005',
    pass: 'Admin@123',
    roleDescription: 'Sinh viên PTIT'
  }
];

export const LOGIN_MESSAGES = {
  EMPTY_ERROR: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.',
  INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!',
  AUTHENTICATING: 'Đang xác thực tài khoản...',
  BUTTON_SUBMIT: 'Đăng nhập hệ thống'
} as const;
