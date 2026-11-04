import { Github, Figma, Zap, FileText } from 'lucide-react';
import type { ProfileResourceItem } from './type';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5171';

export const PROFILE_RESOURCES: ProfileResourceItem[] = [
  {
    title: 'GitHub Repository',
    desc: 'Mã nguồn toàn bộ dự án IoT (Frontend, Backend, Firmware)',
    url: 'https://github.com/skystriker0104/iot',
    icon: Github,
  },
  {
    title: 'Figma UI Design',
    desc: 'Bản vẽ thiết kế giao diện Hệ thống Giám sát & Điều khiển IoT',
    url: 'https://www.figma.com/design/YbzhHFTYGsBKvZxgKWJdZv/Untitled?node-id=2002-2&t=q6hlagwcS1dzpysz-1',
    icon: Figma,
  },
  {
    title: 'Swagger API Docs',
    desc: 'Tài liệu tương tác trực tiếp & đặc tả RESTful API Backend',
    url: `${API_BASE}/swagger/index.html`,
    icon: Zap,
  },
  {
    title: 'Báo cáo Bài tập lớn (DOCX)',
    desc: 'Báo cáo Bài tập lớn: Hệ thống Giám sát và Điều khiển IoT',
    url: 'https://github.com/skystriker0104/iot/blob/main/B%C3%A1o%20c%C3%A1o%20B%C3%A0i%20t%E1%BA%ADp%20l%E1%BB%9Bn_%20H%E1%BB%87%20th%E1%BB%91ng%20Gi%C3%A1m%20s%C3%A1t%20v%C3%A0%20%C4%90i%E1%BB%81u%20khi%E1%BB%83n%20IoT%20(1)%20(1).docx',
    icon: FileText,
  },
];
