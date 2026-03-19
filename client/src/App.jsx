import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import CasesPage from './pages/CasesPage';
import HearingsPage from './pages/HearingsPage';
import InvoicesPage from './pages/InvoicesPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import ClientsPage from './pages/ClientsPage';
import LawyersPage from './pages/LawyersPage';
import CourtsPage from './pages/CourtsPage';
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';
import CaseTypesPage from './pages/CaseTypesPage';
import RolePermissionsPage from './pages/RolePermissionsPage';
import AccessRequestsPage from './pages/AccessRequestsPage';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Shared Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/admin-dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/lawyer-dashboard" element={<ProtectedRoute roles={['lawyer']}><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/client-dashboard" element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>} />
        <Route path="/cases" element={<ProtectedRoute roles={['admin', 'lawyer']}><CasesPage /></ProtectedRoute>} />
        <Route path="/cases/:id" element={<ProtectedRoute><CaseDetailsPage /></ProtectedRoute>} />
        <Route path="/case-types" element={<ProtectedRoute roles={['admin']}><CaseTypesPage /></ProtectedRoute>} />
        <Route path="/my-cases" element={<ProtectedRoute roles={['client']}><CasesPage /></ProtectedRoute>} />
        <Route path="/hearings" element={<ProtectedRoute roles={['admin', 'lawyer']}><HearingsPage /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute roles={['admin', 'lawyer']}><InvoicesPage /></ProtectedRoute>} />
        <Route path="/my-invoices" element={<ProtectedRoute roles={['client']}><InvoicesPage /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute roles={['admin', 'lawyer']}><ClientsPage /></ProtectedRoute>} />
        <Route path="/lawyers" element={<ProtectedRoute roles={['admin']}><LawyersPage /></ProtectedRoute>} />
        <Route path="/courts" element={<ProtectedRoute roles={['admin']}><CourtsPage /></ProtectedRoute>} />
        <Route path="/permissions" element={<ProtectedRoute roles={['admin']}><RolePermissionsPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/access-requests" element={<ProtectedRoute roles={['admin', 'lawyer']}><AccessRequestsPage /></ProtectedRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
