import React from 'react';
    import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import LoginPage from '@/pages/LoginPage';
    import RegisterPage from '@/pages/RegisterPage';
    import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
    import ResetPasswordPage from '@/pages/ResetPasswordPage';
    import DashboardPage from '@/pages/DashboardPage';
    import AgendaPage from '@/pages/AgendaPage';
    import DocumentsPage from '@/pages/DocumentsPage';
    import MessagesPage from '@/pages/MessagesPage';
    import SettingsPage from '@/pages/SettingsPage';
    import AbsenceManagementPage from '@/pages/AbsenceManagementPage';
    import MyAbsencesPage from '@/pages/MyAbsencesPage';
    import UserManagementPage from '@/pages/UserManagementPage';
    import CarpoolingPage from '@/pages/CarpoolingPage';
    import GalleryPage from '@/pages/GalleryPage'; 
    import ProtectedRoute from '@/components/ProtectedRoute';
    import { Toaster } from '@/components/ui/toaster';
    import { AnimatePresence, motion } from 'framer-motion';

    function AppContent() {
      const { isAuthenticated, user, loadingAuth } = useAuth();
      const location = useLocation();

      if (loadingAuth) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-gray-100 to-neutral-200">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="p-8 bg-white/80 backdrop-blur-md shadow-2xl rounded-lg"
            >
              <p className="text-xl font-semibold text-primary animate-pulse">Chargement de l'application...</p>
            </motion.div>
          </div>
        );
      }

      return (
        <>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
              <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
              <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPasswordPage />} /> 
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/covoiturages" element={<CarpoolingPage />} />
                <Route path="/galerie" element={<GalleryPage />} />
                {user && user.role === 'membre' && <Route path="/mes-absences" element={<MyAbsencesPage />} />}
                {user && (user.role === 'professeur' || user.role === 'admin') && <Route path="/absences" element={<AbsenceManagementPage />} />}
                {user && user.role === 'admin' && <Route path="/user-management" element={<UserManagementPage />} />}
              </Route>
              
              <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
            </Routes>
          </AnimatePresence>
          <Toaster />
        </>
      );
    }
    export default AppContent;
