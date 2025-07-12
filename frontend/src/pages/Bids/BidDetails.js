import React, { useEffect, useState, useCallback } from 'react'
import { Card, Table, Button, Modal, message, Typography, Space, Descriptions } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'

const { Title } = Typography

export default function BidDetails() {
  const { id: bidIdParam } = useParams()
  const bidId = Number(bidIdParam)
  const navigate = useNavigate()

  const [bid, setBid] = useState(null)
  const [offers, setOffers] = useState([])
   const [loadingOffers] = useState(false)

  const [confirmModal, setConfirmModal] = useState({ visible: false, offerId: null })
  const fetchBid = useCallback(async () => {
    try {
      const res = await api.get(`/bids/${bidId}`)
      setBid(res.data)
      setOffers(res.data.Offers || [])
    } catch (err) {
      message.error('Failed to load bid details')
      navigate('/bids')
    }
  }, [bidId,navigate])

  useEffect(() => {
    fetchBid()
  }, [fetchBid])

  const onAcceptClick = (offerId) => {
    setConfirmModal({ visible: true, offerId })
  }

  const confirmAccept = async () => {
    const { offerId } = confirmModal
    setConfirmModal({ visible: false, offerId: null })
    try {
      await api.post(`/bids/${bidId}/accept-offer`, { offerId })
      message.success('Offer accepted successfully')
      fetchBid()
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to accept offer')
    }
  }

  const cancelAccept = () => {
    setConfirmModal({ visible: false, offerId: null })
  }

  if (!bid) {
    return <div>Loading bid…</div>
  }

  const bidInfo = (
    <Card style={{ marginBottom: 24 }}>
      <Title level={4}>Bid #{bid.id}</Title>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Material">{bid.material_type}</Descriptions.Item>
        <Descriptions.Item label="Qty (Tons)">{bid.quantity_tons}</Descriptions.Item>
        <Descriptions.Item label="Pickup">{bid.pickup_location}</Descriptions.Item>
        <Descriptions.Item label="Delivery">{bid.delivery_location}</Descriptions.Item>
        <Descriptions.Item label="Deadline">{bid.deadline}</Descriptions.Item>
        <Descriptions.Item label="Distance (km)">{bid.distance_km}</Descriptions.Item>
        <Descriptions.Item label="Base ₹/km/ton">
          {Number(bid.base_price_rupee_per_km_per_ton).toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="Status">{bid.status}</Descriptions.Item>
        <Descriptions.Item label="Requirements">
          {bid.transporter_requirements || '—'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )

  const offerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
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
        const num = parseFloat(val)
        return isNaN(num) ? '0.00' : num.toFixed(2)
      },
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (text) => text || '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        return (
          <span style={{ textTransform: 'capitalize' }}>
            {s === 'accepted' ? (
              <span style={{ color: 'green', fontWeight: 'bold' }}>Accepted</span>
            ) : s === 'closed' ? (
              <span style={{ color: 'grey' }}>Closed</span>
            ) : (
              <span>Open</span>
            )}
          </span>
        )
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (bid.status !== 'open') {
          return <span style={{ color: 'grey' }}>Closed</span>
        }

        if (record.status === 'open') {
          return (
            <Button type="primary" onClick={() => onAcceptClick(record.id)}>
              Accept
            </Button>
          )
        }
        if (record.status === 'accepted') {
          return <span style={{ color: 'green', fontWeight: 'bold' }}>Accepted</span>
        }
        return <span style={{ color: 'grey' }}>Closed</span>
      },
    },
  ]

  return (
    <>
      {bidInfo}

      <Card>
        <Title level={5}>Offers</Title>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={fetchBid} type="primary">
            Refresh
          </Button>
        </Space>
        <Table
          rowKey="id"
          columns={offerColumns}
          dataSource={offers}
           loading={loadingOffers}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title="Accept this offer?"
        open={confirmModal.visible}
        onOk={confirmAccept}
        onCancel={cancelAccept}
        okText="Yes"
        cancelText="No"
      >
        <p>
          Once you accept this offer, all other offers will be closed and the bid
          will be marked accepted.
        </p>
      </Modal>
    </>
  )
}
