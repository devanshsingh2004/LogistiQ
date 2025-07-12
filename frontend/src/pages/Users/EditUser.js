import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Switch,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;
const { Option } = Select;

export default function EditUser() {
  const { id: userIdParam } = useParams();
  const userId = Number(userIdParam);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);

  const [changePassword, setChangePassword] = useState(false);
  const fetchUser = async () => {
    setLoadingUser(true);
    try {
      const res = await api.get(`/users/${userId}`); 
      const user = res.data;
      form.setFieldsValue({
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      message.error('Failed to load user data');
      navigate('/users');
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const onPasswordToggle = (checked) => {
    setChangePassword(checked);
    if (!checked) {
      form.setFieldsValue({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  };

  const onFinish = async (values) => {
    setSaving(true);

    try {
      if (changePassword) {
        const { newPassword } = values;
        await api.patch(`/users/${userId}/password`, {
          newPassword: newPassword,
        });
        message.success('Password updated successfully');
      }
      const patchPayload = {
        email: values.email,
        role: values.role,
      };
      await api.patch(`/users/${userId}`, patchPayload);
      message.success('User updated successfully');
      navigate('/users');
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed';
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin tip="Loading user…" />
      </div>
    );
  }

  return (
    <Card style={{ maxWidth: 600, margin: '24px auto' }}>
      <Title level={4}>Edit User #{userId}</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          email: '',
          role: '',
          changePassword: false,
        }}
      >
        {/* Email field */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter an email' },
            { type: 'email',   message: 'Invalid email address' },
          ]}
        >
          <Input placeholder="user@example.com" />
        </Form.Item>

        {/* Role dropdown */}
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select placeholder="Select role">
            <Option value="admin">Admin</Option>
            <Option value="staff">Staff</Option>
          </Select>
        </Form.Item>

        {/* CHANGE PASSWORD toggle */}
        <Form.Item label="Change Password?">
          <Switch checked={changePassword} onChange={onPasswordToggle} />
        </Form.Item>

        {changePassword && (
          <>

            {/* New Password */}
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6,        message: 'Must be at least 6 characters' },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="New password" />
            </Form.Item>

            {/* Confirm New Password */}
            <Form.Item
              name="confirmNewPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: 'Please retype new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Retype new password" />
            </Form.Item>
          </>
        )}

        {/* Save / Cancel buttons */}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button onClick={() => navigate('/users')} disabled={saving}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
