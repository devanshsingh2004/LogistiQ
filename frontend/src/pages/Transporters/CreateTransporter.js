import React, { useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  message,
  Typography,
} from 'antd';                                            
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Option } = Select;
const { Title } = Typography;

export default function CreateTransporter() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/transporters', values);
      message.success('Transporter created');
      navigate('/transporters');
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to create transporter');
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title level={4}>Create New Transporter</Title>
      <Form name="create_transporter" layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input transporter name!' }]}
        >
          <Input placeholder="John Doe Transporters" />
        </Form.Item>

        <Form.Item label="Contact Number" name="contact_number">
          <Input placeholder="+91-9876543210" />
        </Form.Item>

        <Form.Item label="Vehicle Type" name="vehicle_type">
          <Input placeholder="Truck / Van / Container" />
        </Form.Item>

        <Form.Item
          label="Capacity (Tons)"
          name="capacity_tons"
          rules={[{ required: true, message: 'Please input capacity!' }]}
        >
          <InputNumber min={1} placeholder={10} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          initialValue="active"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Transporter
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
