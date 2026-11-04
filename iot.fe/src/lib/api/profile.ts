import { apiClient } from './client';

export interface ProfileDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  studentId?: string;
  institution?: string;
  classGroup?: string;
}

export async function fetchProfileApi(): Promise<ProfileDto> {
  try {
    const data = await apiClient<ProfileDto>('/api/profile');
    if (data?.fullName) {
      return {
        ...data,
        studentId: 'B23DCCN005',
        classGroup: 'Nhóm 11',
        institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
      };
    }
  } catch (err) {
    console.warn('Lỗi lấy /api/profile từ BE, dùng profile mặc định:', err);
  }

  return {
    id: 1,
    username: 'an.nguyen',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@ptit.edu.vn',
    role: 'Quản trị viên',
    createdAt: new Date().toISOString(),
    studentId: 'B23DCCN005',
    classGroup: 'Nhóm 11',
    institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  };
}

