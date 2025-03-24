import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ContactInfoProvider } from './contexts/ContactInfoContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

// Lazy loaded components
// Public pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));
const TermsAndConditions = lazy(() => import('./pages/public/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy'));
const LegalNotice = lazy(() => import('./pages/public/LegalNotice'));
const Imprint = lazy(() => import('./pages/public/Imprint'));
const NailDesigns = lazy(() => import('./pages/public/NailDesigns'));
const Booking = lazy(() => import('./pages/client/Booking'));
const BookingSuccess = lazy(() => import('./pages/client/BookingSuccess'));

// Client pages
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'));
const ClientBookings = lazy(() => import('./pages/client/Bookings'));
const ClientFeedback = lazy(() => import('./pages/client/Feedback'));
const ClientSettings = lazy(() => import('./pages/client/Settings'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCalendar = lazy(() => import('./pages/admin/Calendar'));
const AdminClients = lazy(() => import('./pages/admin/Clients'));
const AdminFeedbacks = lazy(() => import('./pages/admin/Feedbacks'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminStaff = lazy(() => import('./pages/admin/Staff'));
const AdminPromotions = lazy(() => import('./pages/admin/Promotions'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const ManageNailDesigns = lazy(() => import('./pages/admin/ManageNailDesigns'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactElement, requireAdmin?: boolean }) => {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) return <LoadingFallback />;
  
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/client/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <ContactInfoProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/designs" element={<NailDesigns />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/:serviceId" element={<Booking />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal" element={<LegalNotice />} />
            <Route path="/imprint" element={<Imprint />} />
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
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="feedbacks" element={<AdminFeedbacks />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="nail-designs" element={<ManageNailDesigns />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </ContactInfoProvider>
  );
}

export default App;
