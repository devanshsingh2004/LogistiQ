import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

export default function BidList() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bids');
      setBids(res.data);
    } catch (e) {
      message.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Material', dataIndex: 'material_type', key: 'material_type' },
    {
      title: 'Qty (tons)',
      dataIndex: 'quantity_tons',
      key: 'quantity_tons',
      render: (val) => {
        const num = Number(val);
        return isNaN(num) ? '0' : num.toString();
      },
    },
    { title: 'Pickup', dataIndex: 'pickup_location', key: 'pickup_location' },
    {
      title: 'Delivery',
      dataIndex: 'delivery_location',
      key: 'delivery_location',
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Base ₹/ton',
      dataIndex: 'base_price_rupee_per_km_per_ton',
      key: 'base_price_rupee_per_km_per_ton',
      render: (val) => {
        const num = Number(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) =>
        status ? status.charAt(0).toUpperCase() + status.slice(1) : '',
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Link to={`/bids/${record.id}`}>
          <Button type="primary" size="small">
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>Bids</Title>
      <Space style={{ marginBottom: 16 }}>
        <Link to="/bids/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Bid
          </Button>
        </Link>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={bids}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
