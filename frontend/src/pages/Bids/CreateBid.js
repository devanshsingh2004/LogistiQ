import React, { useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import api from '../../api';

export default function CreateBid() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // extract form values
      const payload = {
        material_type: values.material_type,
        quantity_tons: values.quantity_tons,
        pickup_location: values.pickup_location,
        delivery_location: values.delivery_location,
        deadline: values.deadline.format('YYYY-MM-DD'),
        transporter_requirements: values.transporter_requirements || '',
        distance_km: values.distance_km, // NEW field
      };

      await api.post('/bids', payload);
      message.success('Bid created');
      navigate('/bids');
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to create bid');
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: '24px auto' }}>
      <Form name="create_bid" layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Material Type"
          name="material_type"
          rules={[{ required: true, message: 'Please input material type!' }]}
        >
          <Input placeholder="Steel Coils" />
        </Form.Item>

        <Form.Item
          label="Quantity (Tons)"
          name="quantity_tons"
          rules={[{ required: true, message: 'Please input quantity!' }]}
        >
          <InputNumber min={1} placeholder={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Pickup Location"
          name="pickup_location"
          rules={[{ required: true, message: 'Please input pickup location!' }]}
        >
          <Input placeholder="Mumbai" />
        </Form.Item>

        <Form.Item
          label="Delivery Location"
          name="delivery_location"
          rules={[{ required: true, message: 'Please input delivery location!' }]}
        >
          <Input placeholder="Pune" />
        </Form.Item>

        <Form.Item
          label="Deadline"
          name="deadline"
          rules={[{ required: true, message: 'Please select a deadline!' }]}
        >
          <DatePicker
            disabledDate={(d) => !d || d.isBefore(moment(), 'day')}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Distance (km)"
          name="distance_km"
          rules={[
            { required: true, message: 'Please enter distance in km!' },
            {
              type: 'number',
              min: 0.1,
              message: 'Distance must be at least 0.1 km',
            },
          ]}
        >
          <InputNumber
            min={0.1}
            step={0.1}
            style={{ width: '100%' }}
            placeholder="e.g. 200 (km)"
          />
        </Form.Item>

        <Form.Item label="Transporter Requirements" name="transporter_requirements">
          <Input.TextArea
            placeholder="(Optional) e.g. Refrigerated truck only"
            rows={3}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? 'Creating…' : 'Create Bid'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
