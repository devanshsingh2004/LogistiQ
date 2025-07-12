import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';   
import { LockOutlined, UserOutlined } from '@ant-design/icons';       
import { signInWithEmailAndPassword } from 'firebase/auth';             
import { auth } from '../firebase';
import { useNavigate, Navigate } from 'react-router-dom';               
import { AuthContext } from '../contexts/AuthContext';

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async ({ email, password }) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password); 
      navigate('/');
    } catch (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card style={{ width: 360, textAlign: 'center' }}>
        <Title level={3}>LogistiQ Login</Title>
        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ email: '', password: '' }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Enter a valid email!' },
            ]}
          >
            <Input
              placeholder="deepanshu@logistiq.com"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="••••••••"
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
