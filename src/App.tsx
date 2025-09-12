import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { UserProfile } from './components/dashboard/UserProfile';
import { DeveloperCacheTools } from './components/CacheClearButton';
import { Dashboard } from './pages/Dashboard';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { HomePage } from './pages/HomePage';
import { MyProperties } from './pages/MyProperties';
import { ScheduledVisits } from './pages/ScheduledVisits';
import { Documents } from './pages/Documents';
import { Analytics } from './pages/Analytics';
import { Blogs } from './pages/Blogs';
import PropertyDetails from './PropertyDetails';
import HousesPage from './HousesPage';

// Import styles
import './styles/global.css';

// Main App Component with Authentication
function AppContent() {
  const { isDarkMode } = useTheme();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <HomePage onLoginClick={handleLoginClick} />
        } />
        
        <Route path="/property/:id" element={
          <PropertyDetails />
        } />
        
        <Route path="/houses" element={
          <HousesPage />
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
        
        <Route path="/buyer-dashboard" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <BuyerDashboard isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
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
        
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <UserProfile isDarkMode={isDarkMode} />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Auth Modal */}
      <AuthModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
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