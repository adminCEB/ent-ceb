import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContent from '@/App';
import '@/index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <AppContent /> 
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
