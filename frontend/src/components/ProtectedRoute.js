import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Spin } from 'antd';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ element, allowedRoles = [] }) {
  const { currentUser, userRole } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser && userRole === null) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80 }}>
        <Spin size="large" tip="Checking permissions…" />
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
      />
    );
  }

  return element;
}
