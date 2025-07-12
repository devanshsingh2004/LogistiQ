import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, message } from 'antd';  
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    openBids: 0,
    totalTransporters: 0,
    totalDeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        //Fetch all bids and count open
        const resBids = await api.get('/bids');
        const openCount = resBids.data.filter((b) => b.status === 'open').length;

        //Fetch all transporters
        const resTrans = await api.get('/transporters/count');
        const totalTrans = resTrans.data.totalTransporters;

        //Fetch all deals
        const resDeals = await api.get('/deals');
        const totalD = resDeals.data.length;

        setStats({
          openBids: openCount,
          totalTransporters: totalTrans,
          totalDeals: totalD,
        });
      } catch (e) {
        message.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Open Bids"
              value={stats.openBids}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Transporters"
              value={stats.totalTransporters}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Deals"
              value={stats.totalDeals}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
