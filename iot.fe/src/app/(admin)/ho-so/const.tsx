import { Github, Globe, Zap, FileText } from 'lucide-react';
import type { ProfileResourceItem } from './type';

export const PROFILE_RESOURCES: ProfileResourceItem[] = [
  {
    title: 'GitHub Repository',
    desc: 'Mã nguồn toàn bộ dự án',
    url: 'https://github.com/Daicachoida/Internet-of-Think-Project',
    icon: Github,
  },
  {
    title: 'Figma UI Design',
    desc: 'Bản vẽ thiết kế giao diện Dashboard',
    url: 'https://www.figma.com/make/2qeZ7RsPo7xQFcaX64S9nG/User-greeting?p=f&t=VFK9QZDTJdocEFbN-0',
    icon: Globe,
  },
  {
    title: 'Swagger API Docs',
    desc: 'Tài liệu đặc tả các RESTful Endpoints',
    url: 'http://localhost:5171/swagger/index.html',
    icon: Zap,
  },
  {
    title: 'Báo cáo đồ án (PDF)',
    desc: 'File tài liệu báo cáo toàn văn',
    url: 'https://example.com/Bao_Cao_IoT_NguyenVanAn.pdf',
    icon: FileText,
  },
];
