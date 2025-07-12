import React, { useEffect, useState } from 'react';
import { Table, message, Button, Space, Typography, Card, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; 
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title } = Typography;

export default function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('User deleted');
      fetchUsers();
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (r) => r.charAt(0).toUpperCase() + r.slice(1), 
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (ts) => {
        if (!ts) return 'n/a';
        const d = new Date(ts);
        if (isNaN(d.getTime())) return 'Invalid Date';
        return d.toLocaleString();
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          {/*Edit Button */}
          <Button
            icon={<EditOutlined />} size="small"
            onClick={() => navigate(`/users/edit/${record.id}`)}
          >
            Edit
          </Button>

          {/*Delete Button with confirmation */}
          <Popconfirm
            title="Are you sure you want to delete this user?"
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
    <Card>
      <Title level={4}>Users</Title>

      <Space style={{ marginBottom: 16 }}>
        {/* Add User Button */}
        <Button
          type="primary" icon={<PlusOutlined />}
          onClick={() => navigate('/users/create')}
        >
        Add User
        </Button>
        <Button onClick={fetchUsers}>Refresh</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No users found' }}
      />
    </Card>
  );
}
