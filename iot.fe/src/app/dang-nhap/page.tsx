import React, { useState, useCallback } from 'react';
import { Card, Form, Input, Button, Checkbox, Alert, Tag, Typography, Flex, Space } from 'antd';
import { Cpu, ShieldCheck, User, Lock, Key } from 'lucide-react';
import { useLoginMutation } from '../../lib/mutations';
import { DEMO_ACCOUNTS, LOGIN_MESSAGES } from './const';
import type { LoginPageProps } from './type';

const { Title, Text } = Typography;

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [localError, setLocalError] = useState<string | null>(null);

  const loginMutation = useLoginMutation({
    onSuccess: (user) => {
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    },
  });

  const handleSubmit = useCallback(() => {
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError(LOGIN_MESSAGES.EMPTY_ERROR);
      return;
    }

    loginMutation.mutate({ username, password });
  }, [username, password, loginMutation]);

  const handleFillDemo = useCallback((u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setLocalError(null);
  }, []);

  const activeError = localError || loginMutation.error?.message || null;
  const isLoading = loginMutation.isPending;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#0f172a',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Institutional Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#09353D',
              color: '#ffffff',
              marginBottom: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Cpu size={24} color="#5eead4" />
          </div>
          
          <Title level={3} style={{ color: '#ffffff', margin: 0, fontSize: 20 }}>
            Hệ thống Giám sát & Điều khiển IoT
          </Title>
        
        </div>

        {/* Login Card */}
        <Card
          styles={{ body: { padding: 28 } }}
          style={{
            borderRadius: 16,
            borderColor: '#e2e8f0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Flex justify="space-between" align="center" style={{ paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <Title level={4} style={{ margin: 0, fontSize: 16 }}>
                Đăng nhập hệ thống
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Xác thực tài khoản và quyền truy cập
              </Text>
            </div>
            
          </Flex>

          {activeError && (
            <Alert
              type="error"
              message={activeError}
              showIcon
              style={{ marginBottom: 16, fontSize: 12, borderRadius: 8 }}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item label={<span style={{ fontSize: 12, fontWeight: 600 }}>Tên đăng nhập</span>} style={{ marginBottom: 16 }}>
              <Input
                size="large"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                prefix={<User size={16} color="#94a3b8" />}
                placeholder="Nhập tên đăng nhập"
              />
            </Form.Item>

            <Form.Item label={<span style={{ fontSize: 12, fontWeight: 600 }}>Mật khẩu</span>} style={{ marginBottom: 16 }}>
              <Input.Password
                size="large"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                prefix={<Lock size={16} color="#94a3b8" />}
                placeholder="Nhập mật khẩu"
              />
            </Form.Item>

            <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
              <Checkbox defaultChecked>
                <span style={{ fontSize: 12, color: '#475569' }}>Ghi nhớ đăng nhập</span>
              </Checkbox>
              <a href="#forgot" style={{ fontSize: 12, color: '#09353D' }}>
                Quên mật khẩu?
              </a>
            </Flex>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading}
              icon={<ShieldCheck size={16} />}
              style={{ height: 42, fontSize: 14 }}
            >
              {LOGIN_MESSAGES.BUTTON_SUBMIT}
            </Button>
          </Form>

        

          {/* Student Footer attribution */}
          
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
