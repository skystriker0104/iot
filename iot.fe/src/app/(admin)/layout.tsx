import React, { useState, useCallback, useMemo } from 'react';
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Button,
  Typography,
  Flex,
  Badge,
  Divider,
  Tooltip,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  Cpu,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useProfileQuery } from '../../lib/queries';
import { useLogoutMutation } from '../../lib/mutations';
import { LiveClock } from '../../components/LiveClock';
import { ADMIN_NAV_ITEMS, PAGE_TITLES } from './const';
import type { AdminLayoutProps } from './type';
import {
  HeaderBar,
  BrandHeader,
  BrandLogoBox,
  NavCategoryContainer,
  SidebarFooter,
  MqttStatusCard,
  MqttIndicatorDot,
  UserProfileTrigger,
  UserInfoDropdownHeader,
} from './styled';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { data: profile } = useProfileQuery();
  const logoutMutation = useLogoutMutation();
  const { currentPageSlug, setCurrentPageSlug } = useAppStore();

  const fullName = profile?.fullName || 'Nguyễn Văn An';
  const studentId = profile?.studentId || 'B23DCCN005';

  const handleNavClick = useCallback(
    (key: string) => {
      setCurrentPageSlug(key);
    },
    [setCurrentPageSlug]
  );

  const handleLogoutClick = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const activeTitle = PAGE_TITLES[currentPageSlug] || 'IoT Monitoring & Control Hub';

  const userMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'user-info',
        label: (
          <UserInfoDropdownHeader>
            <Text strong style={{ display: 'block', fontSize: 12 }}>
              {fullName}
            </Text>
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
              {studentId} • Quản trị viên
            </Text>
          </UserInfoDropdownHeader>
        ),
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'profile',
        icon: <User size={14} color="#09353D" />,
        label: 'Xem hồ sơ sinh viên',
        onClick: () => handleNavClick('profile'),
      },
      {
        key: 'mode',
        icon: <ShieldCheck size={14} color="#10B981" />,
        label: 'Chế độ: SignalR Realtime',
      },
      { type: 'divider' },
      {
        key: 'logout',
        danger: true,
        icon: <LogOut size={14} />,
        label: 'Đăng xuất tài khoản',
        onClick: handleLogoutClick,
      },
    ],
    [fullName, studentId, handleNavClick, handleLogoutClick]
  );

  const navMenuItems: MenuProps['items'] = useMemo(
    () =>
      ADMIN_NAV_ITEMS.map(({ id, label, Icon }) => ({
        key: id,
        icon: <Icon size={16} />,
        label,
      })),
    []
  );

  return (
    <Layout hasSider style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={256}
        collapsedWidth={72}
        style={{
          background: '#062329',
          borderRight: '1px solid rgba(13, 64, 74, 0.6)',
          height: '100vh',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        <Flex vertical justify="space-between" style={{ height: '100%' }}>
          <div>
            {/* Brand Header */}
            <BrandHeader
              style={{
                padding: collapsed ? '16px 8px' : '16px 20px',
                transition: 'padding 0.2s ease',
              }}
            >
              <Flex align="center" justify={collapsed ? 'center' : 'flex-start'} gap={12}>
                <BrandLogoBox>
                  <Cpu size={20} color="#5eead4" />
                </BrandLogoBox>
                {!collapsed && (
                  <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <Text strong style={{ color: '#ffffff', fontSize: 14, display: 'block', lineHeight: 1.2 }}>
                      IoT Hub
                    </Text>
                  </div>
                )}
              </Flex>
            </BrandHeader>

            {/* Navigation Header */}
            {!collapsed && (
              <NavCategoryContainer>
              
              </NavCategoryContainer>
            )}

            {/* Ant Design Navigation Menu */}
            <Menu
              theme="dark"
              mode="inline"
              inlineCollapsed={collapsed}
              selectedKeys={[currentPageSlug]}
              onClick={({ key }) => handleNavClick(key)}
              items={navMenuItems}
              style={{ background: 'transparent', borderInlineEnd: 'none' }}
            />
          </div>

          {/* Sidebar Footer: Hardware Status & Logout */}
          <SidebarFooter
            style={{
              padding: collapsed ? '12px 8px' : '16px',
              transition: 'padding 0.2s ease',
            }}
          >
            {!collapsed ? (
              <>
                {/* MQTT Live Connection Pill */}
                <MqttStatusCard>
                  <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontWeight: 600,
                      }}
                    >
                      MQTT Broker
                    </Text>
                    <Badge
                      status="processing"
                      color="#34d399"
                      text={<span style={{ color: '#34d399', fontSize: 10, fontWeight: 600 }}>ONLINE</span>}
                    />
                  </Flex>
                  <Flex align="center" gap={6}>
                    <MqttIndicatorDot />
                    <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 11, fontFamily: 'monospace' }}>
                      broker.emqx.io:1883
                    </Text>
                  </Flex>
                </MqttStatusCard>

                {/* Logout button */}
                <Button
                  block
                  icon={<LogOut size={14} />}
                  onClick={handleLogoutClick}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Flex vertical align="center" gap={10}>
                <Tooltip title="MQTT Broker: ONLINE (broker.emqx.io:1883)" placement="right">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                    }}
                  >
                    <MqttIndicatorDot />
                  </div>
                </Tooltip>

                <Tooltip title="Đăng xuất tài khoản" placement="right">
                  <Button
                    type="text"
                    icon={<LogOut size={16} color="rgba(255, 255, 255, 0.85)" />}
                    onClick={handleLogoutClick}
                    style={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                    }}
                  />
                </Tooltip>
              </Flex>
            )}
          </SidebarFooter>
        </Flex>
      </Sider>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────────── */}
      <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header Bar */}
        <HeaderBar>
          <Flex align="center" gap={14}>
            {/* Nút đóng / mở Sidebar bên trái */}
            <Tooltip title={collapsed ? 'Mở rộng menu bên trái' : 'Thu gọn menu bên trái'}>
              <Button
                type="text"
                icon={
                  collapsed ? (
                    <PanelLeftOpen size={18} color="#09353D" />
                  ) : (
                    <PanelLeftClose size={18} color="#09353D" />
                  )
                }
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>

            <Title level={4} style={{ margin: 0, fontSize: 16, lineHeight: 'normal' }}>
              {activeTitle}
            </Title>
          </Flex>

          <Flex align="center" gap={16}>
            <LiveClock />

            <Divider type="vertical" style={{ height: 24, margin: 0 }} />

            {/* User Profile Capsule with Ant Design Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <UserProfileTrigger>
                <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
                  <Text strong style={{ fontSize: 12, display: 'block' }}>
                    {fullName}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {studentId} • Quản trị viên
                  </Text>
                </div>

                <Avatar
                  style={{
                    backgroundColor: '#09353D',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  size={32}
                >
                  VA
                </Avatar>
                <ChevronDown size={13} color="#94a3b8" />
              </UserProfileTrigger>
            </Dropdown>
          </Flex>
        </HeaderBar>

        {/* Dynamic Page Router Content */}
        <Content
          style={{
            flex: 1,
            background: '#f8fafc',
            overflowY: currentPageSlug === 'home' ? 'hidden' : 'auto',
            minHeight: 0,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
