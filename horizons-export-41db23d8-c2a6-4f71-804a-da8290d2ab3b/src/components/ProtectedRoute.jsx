import React from 'react';
    import { Navigate, Outlet } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import MainLayout from '@/components/MainLayout';

    const ProtectedRoute = () => {
      const { isAuthenticated } = useAuth();

      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      }

      return (
        <MainLayout>
          <Outlet />
        </MainLayout>
      );
    };

    export default ProtectedRoute;