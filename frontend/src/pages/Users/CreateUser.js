import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Spin, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../api'; // your axios instance
import { UserAddOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

export default function CreateUser() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleCreateUser = async (values) => {
    console.log('CreateUser → handleCreateUser called:', values);
    setSubmitting(true);
    try {
      const res = await api.post('/users', {
        email: values.email,
        password: values.password,
        role: values.role.toLowerCase(),
      });
      console.log('CreateUser → API response:', res.data);
      message.success(`User ${res.data.email} created successfully!`);
      navigate('/users');
    } catch (err) {
      console.error('CreateUser → API error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        message.error(`Error: ${err.response.data.message}`);
      } else {
        message.error('An unexpected error occurred while creating user.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={<Title level={4}><UserAddOutlined /> Create New User</Title>}
      style={{ maxWidth: 600, margin: 'auto', marginTop: 24 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateUser}
        initialValues={{ role: 'staff' }}
      >
        {/* Email field */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter an email address' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="user@example.com" />
        </Form.Item>

        {/* Password field */}
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter a password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password placeholder="••••••••" />
        </Form.Item>

        {/* Role select */}
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select>
            <Option value="admin">Admin</Option>
            <Option value="staff">Staff</Option>
          </Select>
        </Form.Item>

        {/* Submit button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
          >
            {submitting ? <><Spin size="small" /> Creating…</> : 'Create User'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
