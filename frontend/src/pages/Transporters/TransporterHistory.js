import React, {useEffect, useState} from 'react';
import{
  Card,
  Typography,
  Select,
  Button,
  Table,
  message,
  Space,
  Divider,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons'; 
import api from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function TransporterHistory() {
  const navigate = useNavigate();

  const [transporters, setTransporters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingTransporters, setLoadingTransporters] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [offers, setOffers] = useState([]);
  const [deals, setDeals] = useState([]);

  const fetchTransporters = async () => {
    setLoadingTransporters(true);
    try {
      const res = await api.get('/transporters');
      setTransporters(res.data);
    } catch (e) {
      message.error('Failed to load transporters');
    } finally {
      setLoadingTransporters(false);
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

  const fetchHistory = async (transporterId) => {
    if (!transporterId) {
      setOffers([]);
      setDeals([]);
      return;
    }

    setLoadingHistory(true);
    try {
      const res = await api.get(`/transporters/${transporterId}/history`);
      setOffers(res.data.offers);
      setDeals(res.data.deals);
    } catch (e) {
      message.error('Failed to load history');
      setOffers([]);
      setDeals([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectChange = (value) => {
    setSelectedId(value);
    fetchHistory(value);
  };


  const offerColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Bid ID',
      dataIndex: ['Bid', 'id'],
      key: 'bid_id',
      width: 80,
    },
    {
      title: 'Material',
      dataIndex: ['Bid', 'material_type'],
      key: 'bid_material',
    },
    {
      title: 'Qty (Tons)',
      dataIndex: ['Bid', 'quantity_tons'],
      key: 'bid_quantity',
    },
    {
      title: 'Offered Price (₹)',
      dataIndex: 'offered_price',
      key: 'offered_price',
      render: (val) => parseFloat(val).toFixed(2),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => s.charAt(0).toUpperCase() + s.slice(1),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (ts) => new Date(ts).toLocaleString(),
    },
  ];

  const dealColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Bid ID',
      dataIndex: ['Bid', 'id'],
      key: 'bid_id',
      width: 80,
    },
    {
      title: 'Material',
      dataIndex: ['Bid', 'material_type'],
      key: 'bid_material',
    },
    {
      title: 'Qty (Tons)',
      dataIndex: ['Bid', 'quantity_tons'],
      key: 'bid_quantity',
    },
    {
      title: 'Deal Amount (₹)',
      dataIndex: 'deal_amount',
      key: 'deal_amount',
      render: (val) => parseFloat(val).toFixed(2),
    },
    {
      title: 'Deal Date',
      dataIndex: 'deal_date',
      key: 'deal_date',
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Created By',
      dataIndex: ['User', 'email'],
      key: 'created_by_email',
      render: (email) => email || '—',
    },
  ];

  return (
    <Card>
      <Title level={4}>Transporter History</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
       
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/transporters')}>Back</Button>

        {/* Transporter Select */}
        <div>
          <Text strong>Select Transporter:&nbsp;</Text>
          <Select
            placeholder="Choose a transporter"
            loading={loadingTransporters}
            style={{ width: 300 }}
            onChange={handleSelectChange}
            value={selectedId}
            allowClear
          >
            {transporters.map((t) => (
              <Option key={t.id} value={t.id}>
                {t.name} (ID: {t.id})
              </Option>
            ))}
          </Select>
        </div>

        {!selectedId && (
          <Text type="secondary">Please pick a transporter to see their history.</Text>
        )}

        {/* OFFERS Section */}
        {selectedId && (
          <>
            <Divider />
            <Title level={5}>Offers by {transporters.find(t => t.id === selectedId)?.name}</Title>
            <Table
              rowKey="id"
              columns={offerColumns}
              dataSource={offers}
              loading={loadingHistory}
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: 'No offers found' }}
            />

            {/* DEALS Section */}
            <Divider />
            <Title level={5}>Deals for {transporters.find(t => t.id === selectedId)?.name}</Title>
            <Table
              rowKey="id"
              columns={dealColumns}
              dataSource={deals}
              loading={loadingHistory}
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: 'No deals found' }}
            />
          </>
        )}
      </Space>
    </Card>
  );
}
