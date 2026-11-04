import { Github, Figma, Zap, FileText } from 'lucide-react';
import type { ProfileResourceItem } from './type';

const API_BASE = import.meta.env.VITE_API_URL ;

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
    title: 'Báo cáo Đồ án (Google Docs)',
    desc: 'Báo cáo Bài tập lớn: Hệ thống Giám sát và Điều khiển IoT',
    url: 'https://docs.google.com/document/d/1gKUNnneHFuOQymIs5gfLBlrpzi6cFo4D/edit?usp=sharing&ouid=116737155529638929944&rtpof=true&sd=true',
    icon: FileText,
  },
];
