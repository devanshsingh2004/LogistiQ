import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  message,
  Typography,
  Space,
  Spin,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const {Title} = Typography;
const {Option} = Select;

export default function CreateDeal() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  //Dropdown data
  const [bids, setBids] = useState([]);
  const [transporters, setTransporters] = useState([]);

  //Loading states
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingTransporters, setLoadingTransporters] = useState(false);
  const [loadingBidDetails, setLoadingBidDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  //Track the currently selected Bid object
  const [setSelectedBid] = useState(null);

  //Fetch all bids and transporters on mount
  const fetchBids = async () => {
    setLoadingBids(true);
    try {
      const res = await api.get('/bids');
      const openBids = res.data.filter((b) => b.status === 'open');
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
    fetchBids();
    fetchTransporters();
  }, []);

  const onBidChange = async (bidId) => {
    if (!bidId) {
      setSelectedBid(null);
      // clear the auto filled rows
      form.setFieldsValue({
        material_type: '',
        quantity_tons: null,
        pickup_location: '',
        delivery_location: '',
        distance_km: null,
      });
      return;
    }

    setLoadingBidDetails(true);
    try {
      const res = await api.get(`/bids/${bidId}`);
      const bid = res.data;
      setSelectedBid(bid);

      form.setFieldsValue({
        material_type: bid.material_type,
        quantity_tons: bid.quantity_tons,
        pickup_location: bid.pickup_location,
        delivery_location: bid.delivery_location,
        distance_km: bid.distance_km,
      });
    } catch (err) {
      message.error('Failed to load bid details');
      setSelectedBid(null);
    } finally {
      setLoadingBidDetails(false);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await api.post('/deals/add', {
        bid_id: values.bid_id,
        transporter_id: values.transporter_id,
        material_type: values.material_type,
        quantity_tons: values.quantity_tons,
        pickup_location: values.pickup_location,
        delivery_location: values.delivery_location,
        distance_km: values.distance_km,
        deal_amount: values.deal_amount,
        deal_date: values.deal_date.format('YYYY-MM-DD'),
      });

      message.success('Deal logged successfully');
      navigate('/deals');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to log deal');
    } finally {
      setSubmitting(false);
    }
  };


  const isLoadingData = loadingBids || loadingTransporters || loadingBidDetails;

  return (
    <Card style={{ maxWidth: 700, margin: '24px auto' }}>
      <Title level={4}>Log a Deal Manually</Title>

      {isLoadingData ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin tip="Loading…" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            bid_id: null,
            transporter_id: null,
            material_type: '',
            quantity_tons: null,
            pickup_location: '',
            delivery_location: '',
            distance_km: null,
            deal_amount: null,
            deal_date: null,
          }}
        >
          {/*Select Bid */}
          <Form.Item
            name="bid_id"
            label="Select Bid"
            rules={[{ required: true, message: 'Please select a bid' }]}
          >
            <Select
              placeholder="Choose a bid"
              onChange={onBidChange}
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {bids.map((b) => (
                <Option key={b.id} value={b.id}>
                  {b.id} - {b.material_type} ({b.quantity_tons} tons) - {b.pickup_location} - {b.delivery_location}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Select Transporter */}
          <Form.Item
            name="transporter_id"
            label="Select Transporter"
            rules={[{ required: true, message: 'Please select a transporter' }]}
          >
            <Select
              placeholder="Choose a transporter"
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {transporters.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name} -{t.vehicle_type} - {t.capacity_tons} tons
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="material_type"
            label="Material Type"
            rules={[{ required: true, message: 'Please enter material type' }]}
          >
            <Input placeholder="e.g. Steel, Cement" />
          </Form.Item>

          <Form.Item
            name="quantity_tons"
            label="Quantity (Tons)"
            rules={[
              { required: true, message: 'Please enter quantity in tons' },
              {
                validator: (_, val) =>
                  val && val > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Quantity must be > 0')),
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>


          <Form.Item
            name="pickup_location"
            label="Pickup Location"
            rules={[{ required: true, message: 'Please enter pickup location' }]}
          >
            <Input placeholder="City / Town" />
          </Form.Item>


          <Form.Item
            name="delivery_location"
            label="Delivery Location"
            rules={[{ required: true, message: 'Please enter delivery location' }]}
          >
            <Input placeholder="City / Town" />
          </Form.Item>


          <Form.Item
            name="distance_km"
            label="Distance (km)"
            rules={[
              { required: true, message: 'Please enter distance in km' },
              {
                validator: (_, val) =>
                  val && val > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Distance must be > 0')),
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="deal_amount"
            label="Deal Amount (₹)"
            rules={[
              { required: true, message: 'Please enter the deal amount' },
              {
                validator: (_, val) =>
                  val && val > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Deal amount must be > 0')),
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              step={0.01}
              placeholder="e.g. 12345.00"
            />
          </Form.Item>

          <Form.Item
            name="deal_date"
            label="Deal Date"
            rules={[{ required: true, message: 'Please select a deal date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {submitting ? 'Logging…' : 'Log Deal'}
              </Button>
              <Button onClick={() => navigate('/deals')} disabled={submitting}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
}
