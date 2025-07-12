import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Input,
  Select,
  Button,
  message,
  Typography,
  Space,
  Spin,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function CreateOffer() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [bids, setBids] = useState([]);
  const [transporters, setTransporters] = useState([]);

  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingTransporters, setLoadingTransporters] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedBid, setSelectedBid] = useState(null);

  const fetchOpenBids = async () => {
    setLoadingBids(true);
    try {
      const res = await api.get('/bids');
      const openBids = res.data.filter((b) => b.status === 'open'); //only open bids
      setBids(openBids);
    } catch (err) {
      message.error('Failed to load bids');
    } finally {
      setLoadingBids(false);
    }
  };

  const fetchTransporters = async () => {
    setLoadingTransporters(true);
    try {
      const res = await api.get('/transporters');
      setTransporters(res.data);
    } catch (err) {
      message.error('Failed to load transporters');
    } finally {
      setLoadingTransporters(false);
    }
  };

  useEffect(() => {
    fetchOpenBids();
    fetchTransporters();
  }, []);

  // 5) When the user selects a bid, update selectedBid in state
  const onBidChange = (bidId) => {
    const bidObj = bids.find((b) => b.id === bidId) || null;
    setSelectedBid(bidObj);
    // Also reset the offered_price_per_km_per_ton field
    form.setFieldValue('offered_price_per_km_per_ton', null);
  };

  // 6) When the user changes the offered_price_per_km_per_ton input,
  //    the total price will be auto‐calculated below in the UI.
  const offeredPerKm = Form.useWatch('offered_price_per_km_per_ton', form);

  // 7) Compute the total offered price (only when both bid and per‐km price are set)
  const computeTotal = () => {
    if (!selectedBid || offeredPerKm === null || offeredPerKm === undefined) {
      return 0;
    }
    const dist = parseFloat(selectedBid.distance_km);
    const qty = parseFloat(selectedBid.quantity_tons);
    const perKmPrice = parseFloat(offeredPerKm);
    if (isNaN(dist) || isNaN(qty) || isNaN(perKmPrice)) {
      return 0;
    }
    return parseFloat(dist * perKmPrice * qty).toFixed(2);
  };

  // 8) Handle final form submission
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      console.log(values)
      await api.post('/offers', {
        
        bid_id: values.bid_id,
        transporter_id: values.transporter_id,
        // pass the per‐km‐per‐ton price
        offered_price_per_km_per_ton: parseInt(values.offered_price_per_km_per_ton),
        remarks: values.remarks || null,
      });
      message.success('Offer created successfully');
      navigate('/offers');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create offer');
    } finally {
      setSubmitting(false);
    }
  };

  // If either dropdown is still loading, show a spinner
  const isLoadingData = loadingBids || loadingTransporters;

  return (
    <Card style={{ maxWidth: 600, margin: '24px auto' }}>
      <Title level={4}>Create New Offer</Title>

      {isLoadingData ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Loading bids & transporters…" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            offered_price_per_km_per_ton: null,
          }}
        >
          {/* 1) Select Bid */}
          <Form.Item
            name="bid_id"
            label="Select Open Bid"
            rules={[{ required: true, message: 'Please select a bid' }]}
          >
            <Select
              placeholder="Choose a bid"
              onChange={onBidChange}
              showSearch
              optionFilterProp="children"
            >
              {bids.map((b) => (
                <Option key={b.id} value={b.id}>
                  #{b.id} {b.material_type} ({b.quantity_tons} tons) : {new Date(b.deadline).toLocaleDateString()} : {b.distance_km} km
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 2) Select Transporter */}
          <Form.Item
            name="transporter_id"
            label="Select Transporter"
            rules={[{ required: true, message: 'Please select a transporter' }]}
          >
            <Select
              placeholder="Choose a transporter"
              showSearch
              optionFilterProp="children"
            >
              {transporters.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name} ({t.vehicle_type}, {t.capacity_tons} tons)
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 3) Offered Price per km per ton */}
          <Form.Item
            name="offered_price_per_km_per_ton"
            label="Offered Price per km per ton (₹)"
            rules={[
              { required: true, message: 'Please enter an offered price per km per ton' },
              {
                validator: (_, value) => {
                  if (!selectedBid || value === null || value === undefined) {
                    return Promise.resolve();
                  }
                  const base = parseFloat(selectedBid.base_price_rupee_per_km_per_ton);
                  if (parseFloat(value) < base) {
                    return Promise.reject(
                      new Error(`Must be at least ₹${base.toFixed(2)} per km per ton`)
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              step={0.01}
              placeholder={selectedBid
                ? `≥ ₹${Number(selectedBid.base_price_rupee_per_km_per_ton).toFixed(2)}`
                : 'Enter price per km per ton'}
            />
          </Form.Item>

          {/* 4) Show computed total below (read‐only) */}
          {selectedBid && (
            <Form.Item>
              <Text type="secondary">
                Total Offered Price (₹):{' '}
                <strong>{computeTotal() || '0.00'}</strong>
              </Text>
            </Form.Item>
          )}

          {/* 5) Optional remarks */}
          <Form.Item name="remarks" label="Remarks (optional)">
            <Input.TextArea rows={3} placeholder="Any remarks..." />
          </Form.Item>

          {/* 6) Submit Button */}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={!selectedBid}
              >
                {submitting ? 'Creating…' : 'Create Offer'}
              </Button>
              <Button onClick={() => navigate('/offers')} disabled={submitting}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
}
