import { apiClient } from './client';

export interface ProfileDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  // Thông tin sinh viên không có trong BE, FE tự bổ sung để hiển thị
  studentId?: string;
  institution?: string;
  classGroup?: string;
}

export async function fetchProfileApi(): Promise<ProfileDto> {
  const data = await apiClient<ProfileDto>('/api/profile');
  return {
    ...data,
    fullName: 'Nguyễn Văn An',
    studentId: 'B23DCCN005',
    classGroup: 'Nhóm 11',
    institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  };
}
