import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { UserProfile } from './components/dashboard/UserProfile';
import { Dashboard } from './pages/Dashboard';
import { HomePage } from './pages/HomePage';

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
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout isDarkMode={isDarkMode}>
              <Dashboard isDarkMode={isDarkMode} />
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