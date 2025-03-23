import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Client pages
import ClientDashboard from './pages/client/Dashboard';
import ClientBookings from './pages/client/Bookings';
import ClientFeedback from './pages/client/Feedback';
import ClientSettings from './pages/client/Settings';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCalendar from './pages/admin/Calendar';
import AdminClients from './pages/admin/Clients';
import AdminFeedbacks from './pages/admin/Feedbacks';
import AdminServices from './pages/admin/Services';
import AdminReports from './pages/admin/Reports';
import AdminStaff from './pages/admin/Staff';
import AdminPromotions from './pages/admin/Promotions';
import AdminSettings from './pages/admin/Settings';

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element, requireAdmin?: boolean }) => {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/client/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          
          {/* Client routes */}
          <Route path="/client" element={
            <ProtectedRoute>
              <DashboardLayout userType="client" />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="bookings" element={<ClientBookings />} />
            <Route path="feedback" element={<ClientFeedback />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="feedbacks" element={<AdminFeedbacks />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
