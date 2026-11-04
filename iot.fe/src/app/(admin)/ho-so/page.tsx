import React from 'react';
import { Card, Avatar, Typography, Row, Col, Space, Flex, Spin, Tag } from 'antd';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { useProfileQuery } from '../../../lib/queries';
import { MONO } from '../../../lib/theme/theme';
import { PROFILE_RESOURCES } from './const';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  // TanStack Query Hook lấy dữ liệu hồ sơ
  const { data: profile, isLoading } = useProfileQuery();

  const fullName = profile?.fullName || 'Nguyễn Văn An';
  const studentId = profile?.studentId || 'B23DCCN005';
  const institution =
    profile?.institution || 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)';

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* 1. Header Card: Thông tin sinh viên & Đề tài */}
        <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0' }}>
          {isLoading ? (
            <Flex justify="center" align="center" style={{ padding: 24 }}>
              <Spin size="default" />
            </Flex>
          ) : (
            <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
              <Flex align="center" gap={16}>
                <Avatar
                  size={56}
                  style={{
                    backgroundColor: '#09353D',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  VA
                </Avatar>
                <div>
                  <Flex align="center" gap={8}>
                    <Title level={4} style={{ margin: 0, fontSize: 17 }}>
                      {fullName}
                    </Title>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        ...MONO,
                      }}
                    >
                      {studentId}
                    </span>
                  </Flex>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 3 }}>
                    {institution} • Nhóm 11
                  </Text>
                </div>
              </Flex>

            
            </Flex>
          )}
        </Card>

        {/* 2. Card: Danh sách tài nguyên đồ án với đường link chi tiết trên mỗi thẻ */}
        <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0' }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#475569',
              display: 'block',
              marginBottom: 16,
            }}
          >
            Tài nguyên & Đường dẫn liên kết 
          </Text>

          <Row gutter={[16, 16]}>
            {PROFILE_RESOURCES.map((item) => {
              const Icon = item.icon;
              return (
                <Col xs={24} md={12} key={item.title}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 16,
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      textDecoration: 'none',
                      height: '100%',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#09353D';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(9, 53, 61, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <Flex align="center" justify="space-between" style={{ marginBottom: 10 }}>
                        <Flex align="center" gap={10}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              color: '#09353D',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={18} />
                          </div>
                          <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                            {item.title}
                          </Text>
                        </Flex>
                        <ExternalLink size={15} color="#64748b" style={{ flexShrink: 0 }} />
                      </Flex>

                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10, lineHeight: 1.4 }}>
                        {item.desc}
                      </Text>
                    </div>

                    {/* Đường link chi tiết hiển thị trực tiếp trên mỗi thẻ */}
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        backgroundColor: '#ffffff',
                        border: '1px dashed #cbd5e1',
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: '#09353D',
                          fontWeight: 500,
                          wordBreak: 'break-all',
                          lineHeight: 1.3,
                          display: 'block',
                          ...MONO,
                        }}
                      >
                        {item.url}
                      </Text>
                    </div>
                  </a>
                </Col>
              );
            })}
          </Row>
        </Card>
      </Space>
    </div>
  );
};

export default ProfilePage;
