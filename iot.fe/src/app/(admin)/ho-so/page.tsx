import React from 'react';
import { Card, Avatar, Typography, Row, Col, Space, Flex, Spin } from 'antd';
import { ExternalLink } from 'lucide-react';
import { useProfileQuery } from '../../../lib/queries';
import { MONO } from '../../../lib/theme/theme';
import { PROFILE_RESOURCES } from './const';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  // 1. TanStack Query Hook từ src/lib/queries
  const { data: profile, isLoading } = useProfileQuery();

  const fullName = profile?.fullName || 'Nguyễn Văn An';
  const studentId = profile?.studentId || 'B23DCCN005';
  const institution =
    profile?.institution || 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)';

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* 1. Header Card: Thông tin sinh viên & Đề tài */}
        <Card styles={{ body: { padding: 20 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0' }}>
          {isLoading ? (
            <Flex justify="center" align="center" style={{ padding: 24 }}>
              <Spin size="default" />
            </Flex>
          ) : (
            <Flex align="center" gap={16}>
              <Avatar
                size={52}
                style={{
                  backgroundColor: '#09353D',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                VA
              </Avatar>
              <div>
                <Flex align="center" gap={8}>
                  <Title level={4} style={{ margin: 0, fontSize: 16 }}>
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
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                  {institution} • Nhóm 11
                </Text>
              </div>
            </Flex>
          )}
        </Card>

        {/* 2. Card: Danh sách liên kết tài nguyên đồ án */}
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
            Tài nguyên & Liên kết đồ án
          </Text>

          <Row gutter={[12, 12]}>
            {PROFILE_RESOURCES.map((item) => {
              const Icon = item.icon;
              return (
                <Col xs={24} sm={12} key={item.title}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Flex align="center" gap={12} style={{ minWidth: 0 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
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
                        <Icon size={16} />
                      </div>
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <Text strong style={{ fontSize: 12, display: 'block' }}>
                          {item.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                          {item.desc}
                        </Text>
                      </div>
                    </Flex>

                    <ExternalLink size={14} color="#94a3b8" style={{ flexShrink: 0, marginLeft: 8 }} />
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
