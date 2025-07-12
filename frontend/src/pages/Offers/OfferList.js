import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, message, Button, Space, Typography, Card } from 'antd';
import api from '../../api';

const { Title } = Typography;

export default function OfferList() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all offers from the backend
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers');
      console.log('Fetched offers:', res.data);
      setOffers(res.data);
    } catch (e) {
      message.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Bid ID',
      dataIndex: ['Bid', 'id'],
      key: 'bid_id',
      width: 80,
    },
    {
      title: 'Material',
      dataIndex: ['Bid', 'material_type'],
      key: 'material_type',
    },
    {
      title: 'Transporter',
      dataIndex: ['Transporter', 'name'],
      key: 'transporter_name',
    },
    {
      title: 'Offered Price (₹)',
      dataIndex: 'offered_price',
      key: 'offered_price',
      render: (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? '0.00' : num.toFixed(2);
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (ts) => {
        if (!ts) {
          return 'N/A';
        }
        const d = new Date(ts);
        if (isNaN(d.getTime())) {
          return 'Invalid Date';
        }
        return d.toLocaleString();
      },
    },
  ];

  return (
    <Card>
      <Title level={4}>Offers</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={fetchOffers}>
          Refresh
        </Button>
        <Button
          type="default"
          onClick={() => navigate('/offers/create')}>
        Create Offer
        </Button>

      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={offers}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
