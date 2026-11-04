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

/**
 * Lấy thông tin hồ sơ sinh viên / quản trị viên (Chế độ Mock hoàn toàn)
 */
export async function fetchProfileApi(): Promise<ProfileDto> {
  return {
    id: 1,
    username: 'admin',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@ptit.edu.vn',
    role: 'Quản trị viên',
    createdAt: '2026-09-01T08:00:00Z',
    studentId: 'B23DCCN005',
    classGroup: 'Nhóm 11',
    institution: 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)',
  };
}
