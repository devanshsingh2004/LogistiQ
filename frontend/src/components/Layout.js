import React, { useContext } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';      
import {
  TeamOutlined,
  CarOutlined,
  ApiOutlined,
  ShopOutlined,
  HomeOutlined,
  LogoutOutlined
} from '@ant-design/icons';                                    
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { auth } from '../firebase';                            
import { AuthContext } from '../contexts/AuthContext';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

export default function LayoutWrapper({ children }) {
  const { currentUser, userRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await auth.signOut();                                     
    navigate('/login');
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/users')) return 'users';
    if (path.startsWith('/transporters')) return 'transporters';
    if (path.startsWith('/bids')) return 'bids';
    if (path.startsWith('/offers')) return 'offers';
    if (path.startsWith('/deals')) return 'deals';
    return 'dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            LogistiQ
          </Title>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[getSelectedKey()]}>
          <Menu.Item key="dashboard" icon={<HomeOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>

          {/* Admin-only */}
          {userRole === 'admin' && (
            <>
              <Menu.Item key="users" icon={<TeamOutlined />}>
                <Link to="/users">Users</Link>
              </Menu.Item>
              <Menu.Item key="transporters" icon={<CarOutlined />}>
                <Link to="/transporters">Transporters</Link>
              </Menu.Item>
            </>
          )}

          {/* Admin & staff */}
          <Menu.Item key="bids" icon={<ApiOutlined />}>
            <Link to="/bids">Bids</Link>
          </Menu.Item>
          <Menu.Item key="offers" icon={<ShopOutlined />}>
            <Link to="/offers">Offers</Link>
          </Menu.Item>
          <Menu.Item key="deals" icon={<ShopOutlined />}>
            <Link to="/deals">Deals</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          {currentUser && (
            <div style={{ float: 'right' }}>
              <span style={{ marginRight: 16 }}>{currentUser.email}</span>
              <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </Header>
        <Content style={{ margin: '24px 16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
