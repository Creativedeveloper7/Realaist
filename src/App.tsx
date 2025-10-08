import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { UserProfile } from './components/dashboard/UserProfile';
import { DeveloperCacheTools } from './components/CacheClearButton';
import { Dashboard } from './pages/Dashboard';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { HomePage } from './pages/HomePage';
import { MyProperties } from './pages/MyProperties';
import ScheduledVisits from './pages/ScheduledVisits';
import { Documents } from './pages/Documents';
import { Analytics } from './pages/Analytics';
import { Blogs } from './pages/Blogs';
import DashboardCampaignAds from './pages/DashboardCampaignAds';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout } from './components/dashboard/AdminLayout';
import PropertiesPage from './pages/admin/PropertiesPage';
import RevenuePage from './pages/admin/RevenuePage';
import MessagesPage from './pages/admin/MessagesPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import { default as PublicBlogsPage } from './BlogsPage';
import PropertyDetails from './PropertyDetails';
import HousesPage from './HousesPage';

// Import styles
import './styles/global.css';

// Main App Component with Authentication
function AppContent() {
  const { isDarkMode } = useTheme();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  // Open Auth modal when URL contains ?auth=login or ?auth=signup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const auth = params.get('auth');
    if (auth === 'login' || auth === 'signup' || auth === 'open') {
      setLoginModalOpen(true);
    }
  }, [location.search]);

  // Open Auth modal via custom event from any page
  useEffect(() => {
    const openHandler = () => setLoginModalOpen(true);
    window.addEventListener('realaist:open-auth', openHandler);
    return () => window.removeEventListener('realaist:open-auth', openHandler);
  }, []);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <HomePage onLoginClick={handleLoginClick} />
        } />
        
        <Route path="/property/:propertyId" element={
          <PropertyDetails />
        } />
        
        <Route path="/properties" element={
          <HousesPage />
        } />
        
        <Route path="/blogs" element={
          <PublicBlogsPage />
        } />
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={
          <AdminLogin isDarkMode={isDarkMode} />
        } />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <Dashboard isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/developer-dashboard" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <DeveloperDashboard isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Buyer dashboard removed; app runs developer-only */}
        
        <Route path="/dashboard/properties" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <MyProperties isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/scheduled-visits" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <ScheduledVisits isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/documents" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <Documents isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/blogs" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <Blogs isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <Analytics isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/campaign-ads" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <DashboardCampaignAds />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <UserProfile isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <AdminDashboard isDarkMode={isDarkMode} />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/developers" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <AdminDashboard isDarkMode={isDarkMode} />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/properties" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <PropertiesPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/analytics" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <AdminDashboard isDarkMode={isDarkMode} />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/revenue" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <RevenuePage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/messages" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <MessagesPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/reports" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <ReportsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout isDarkMode={isDarkMode}>
              <SettingsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('auth');
          window.history.replaceState({}, '', url.toString());
        }}
        isDarkMode={isDarkMode}
      />

      {/* Developer Cache Tools */}
      <DeveloperCacheTools isDarkMode={isDarkMode} />
    </>
  );
}

// Root App Component with Providers
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}