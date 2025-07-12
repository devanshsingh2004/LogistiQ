import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Typography,
  Card,
} from 'antd';                                              
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; 
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

export default function TransporterList() {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTransporters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transporters');
      setTransporters(res.data);
    } catch (e) {
      message.error('Failed to load transporters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transporters/${id}`);
      message.success('Transporter deleted');
      fetchTransporters();
    } catch (e) {
      message.error('Failed to delete transporter');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact', dataIndex: 'contact_number', key: 'contact_number' },
    { title: 'Vehicle Type', dataIndex: 'vehicle_type', key: 'vehicle_type' },
    { title: 'Capacity (Tons)', dataIndex: 'capacity_tons', key: 'capacity_tons' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status === 'active' ? 'Active' : 'Inactive'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          
            <Button icon={<EditOutlined />} size="small"
            onClick={() => navigate(`/transporters/edit/${record.id}`)}>
              Edit
            </Button>
          
          <Popconfirm
            title="Are you sure to delete this transporter?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Title level={4}>Transporters</Title>
        <Space style={{ marginBottom: 16 }}>
          <Link to="/transporters/create">
            <Button type="primary" icon={<PlusOutlined />}>
              Add Transporter
            </Button>
          </Link>
          <Button
            type="default"
            onClick={() => navigate('/transporters/history')}>
              View History
          </Button>
        </Space>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={transporters}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
