import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  message,
  Spin,
  Typography,
  Space,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;
const { Option } = Select;

export default function EditTransporter() {
  const { id: transporterIdParam } = useParams();
  const transporterId = Number(transporterIdParam);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loadingTrans, setLoadingTrans] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTransporter = async () => {
    setLoadingTrans(true);
    try {
      const res = await api.get(`/transporters/${transporterId}`);
      const t = res.data;
      form.setFieldsValue({
        name: t.name,
        contact_number: t.contact_number,
        vehicle_type: t.vehicle_type,
        capacity_tons: t.capacity_tons,
        status: t.status,
      });
    } catch (err) {
      message.error('Failed to load transporter data');
      navigate('/transporters');
    } finally {
      setLoadingTrans(false);
    }
  };

  useEffect(() => {
    fetchTransporter();
  }, [transporterId]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await api.patch(`/transporters/${transporterId}`, {
        name: values.name,
        contact_number: values.contact_number,
        vehicle_type: values.vehicle_type,
        capacity_tons: values.capacity_tons,
        status: values.status,
      });
      message.success('Transporter updated successfully');
      navigate('/transporters');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update transporter');
    } finally {
      setSaving(false);
    }
  };

  if (loadingTrans) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin tip="Loading transporter…" />
      </div>
    );
  }

  return (
    <Card style={{ maxWidth: 600, margin: '24px auto' }}>
      <Title level={4}>Edit Transporter #{transporterId}</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: '',
          contact_number: '',
          vehicle_type: '',
          capacity_tons: 0,
          status: 'active',
        }}
      >
        {/* Name */}
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter the transporter’s name' }]}
        >
          <Input placeholder="e.g. Kavya Transport Co." />
        </Form.Item>

        {/* Contact Number */}
        <Form.Item
          name="contact_number"
          label="Contact Number"
          rules={[{ required: true, message: 'Please enter a contact number' }]}
        >
          <Input placeholder="e.g. +91-9876543210" />
        </Form.Item>

        {/* Vehicle Type */}
        <Form.Item
          name="vehicle_type"
          label="Vehicle Type"
          rules={[{ required: true, message: 'Please enter the vehicle type' }]}
        >
          <Input placeholder="e.g. Truck, Trailer, Tempo" />
        </Form.Item>

        {/* Capacity in Tons */}
        <Form.Item
          name="capacity_tons"
          label="Capacity (Tons)"
          rules={[{ required: true, message: 'Please enter capacity in tons' }]}
        >
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            placeholder="e.g. 10"
          />
        </Form.Item>

        {/* Status */}
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select placeholder="Select status">
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>

        {/* Save & Cancel Buttons */}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button onClick={() => navigate('/transporters')} disabled={saving}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
