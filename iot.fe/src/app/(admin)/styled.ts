import styled from '@emotion/styled';
import { Layout } from 'antd';

const { Header } = Layout;


export const HeaderBar = styled(Header)`
  background: #ffffff !important;
  height: 70px !important;
  max-height: 70px !important;
  line-height: normal !important;
  padding: 0 24px !important;
  border-bottom: 1px solid #e2e8f0;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-shrink: 0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  z-index: 10;
  overflow: hidden;
`;

/**
 * Khung chứa logo và thông tin thương hiệu ở đầu Sidebar
 */
export const BrandHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;


export const BrandLogoBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;


export const NavCategoryContainer = styled.div`
  padding: 12px 16px 4px;
`;


export const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export const MqttStatusCard = styled.div`
  padding: 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
`;


export const MqttIndicatorDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  display: inline-block;
  flex-shrink: 0;
`;

/**
 * Capsule thông tin người dùng ở góc phải Header
 */
export const UserProfileTrigger = styled.div`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  line-height: normal;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f1f5f9;
  }
`;

/**
 * Container thông tin tài khoản hiển thị trong dropdown menu
 */
export const UserInfoDropdownHeader = styled.div`
  padding: 4px 0;
`;
