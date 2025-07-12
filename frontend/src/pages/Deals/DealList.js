import React, { useEffect, useState } from 'react';
import { Table, message, Button, Space, Typography, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

export default function DealList() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/deals');
      setDeals(res.data);
    } catch (e) {
      message.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Bid ID',
      dataIndex: ['Bid', 'id'],
      key: 'bid_id',
      width: 80,
      render: (val) => val ?? '—',
    },
    {
      title: 'Transporter',
      dataIndex: ['Transporter', 'name'],
      key: 'transporter_name',
      render: (name) => name || '—',
    },
    {
      title: 'Deal Amount (₹)',
      dataIndex: 'deal_amount',
      key: 'deal_amount',
      render: (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
      },
    },
    {
      title: 'Material',
      dataIndex: 'material_type',
      key: 'material_type',
      render: (m) => m || '—',
    },
    {
      title: 'Qty (Tons)',
      dataIndex: 'quantity_tons',
      key: 'quantity_tons',
      render: (q) => (q !== null && q !== undefined ? q : '—'),
    },
    {
      title: 'Distance (km)',
      dataIndex: 'distance_km',
      key: 'distance_km',
      render: (d) => (d !== null && d !== undefined ? d : '—'),
    },
    {
      title: 'Deal Date',
      dataIndex: 'deal_date',
      key: 'deal_date',
      render: (d) => {
        if (!d) return '—';
        const date = new Date(d);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
      },
    },
    {
      title: 'Created By (User ID)',
      dataIndex: ['User', 'id'],
      key: 'user_id',
      render: (uid) => (uid ? `#${uid}` : '—'),
    },
  ];

  return (
    <Card>
      <Title level={4}>Deals</Title>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={fetchDeals}>
          Refresh
        </Button>

        <Button type="default" onClick={() => navigate('/deals/add')}>
          Log Deal
        </Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={deals}
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No deals found' }}
      />
    </Card>
  );
}
