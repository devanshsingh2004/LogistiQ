import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  
import { AuthProvider } from './contexts/AuthContext';
import LayoutWrapper from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import UserList from './pages/Users/UserList';
import CreateUser from './pages/Users/CreateUser';
import EditUser from './pages/Users/EditUser';

import TransporterList from './pages/Transporters/TransporterList';
import CreateTransporter from './pages/Transporters/CreateTransporter';
import EditTransporter from './pages/Transporters/EditTransporter';
import TransporterHistory from './pages/Transporters/TransporterHistory';

import BidList from './pages/Bids/BidList';
import CreateBid from './pages/Bids/CreateBid';
import BidDetails from './pages/Bids/BidDetails';

import OfferList from './pages/Offers/OfferList';
import CreateOffer from './pages/Offers/CreateOffer';

import DealList from './pages/Deals/DealList';
import CreateDeal from './pages/Deals/CreateDeal';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <LayoutWrapper>
                <Routes>
                  {/* Dashboard(admin and staff) */}
                  <Route
                    index
                    element={<ProtectedRoute element={<Dashboard />} allowedRoles={['admin','staff']} />}
                  />

                  {/* User Management(admin only) */}
                  <Route
                    path="users"
                    element={<ProtectedRoute element={<UserList />} allowedRoles={['admin']} />}
                  />
                  <Route
                    path="users/create"
                    element={<ProtectedRoute element={<CreateUser />} allowedRoles={['admin']} />}
                  />
                  <Route path="/users/edit/:id" 
                  element={<ProtectedRoute element={<EditUser />} allowedRoles={['admin']} />} />

                  {/* Transporters(admin only) */}
                  <Route
                    path="transporters"
                    element={<ProtectedRoute element={<TransporterList />} allowedRoles={['admin']} />}
                  />
                  <Route
                    path="transporters/create"
                    element={<ProtectedRoute element={<CreateTransporter />} allowedRoles={['admin']} />}
                  />
                  <Route path="/transporters/edit/:id" 
                  element={<ProtectedRoute element={<EditTransporter />} allowedRoles={['admin']} />}
                  />
                  <Route
                    path="transporters/history"
                    element={<ProtectedRoute element={<TransporterHistory />} allowedRoles={['admin']} />}
                  />
                  

                  {/* Bids(admin and staff) */}
                  <Route
                    path="bids"
                    element={<ProtectedRoute element={<BidList />} allowedRoles={['admin','staff']} />}
                  />
                  <Route
                    path="bids/create"
                    element={<ProtectedRoute element={<CreateBid />} allowedRoles={['admin','staff']} />}
                  />
                  <Route
                    path="bids/:id"
                    element={<ProtectedRoute element={<BidDetails />} allowedRoles={['admin','staff']} />}
                  />

                  {/* Offers(admin and staff) */}
                  <Route
                    path="offers"
                    element={<ProtectedRoute element={<OfferList />} allowedRoles={['admin','staff']} />}
                  />
                   <Route path="/offers/create" element={<CreateOffer />} />
                  {/* Deals(admin and staff) */}
                  <Route
                    path="deals"
                    element={<ProtectedRoute element={<DealList />} allowedRoles={['admin','staff']} />}
                  />
                  <Route
                    path="deals/add"
                    element={<ProtectedRoute element={<CreateDeal />} allowedRoles={['admin','staff']} />}
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </LayoutWrapper>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
