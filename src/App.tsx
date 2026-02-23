import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { UserProfile } from './components/dashboard/UserProfile';
import { DeveloperCacheTools } from './components/CacheClearButton';
import { HomePage } from './pages/HomePage';
import HostsHomePage from './pages/HostsHomePage';
import { AdminLayout } from './components/dashboard/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';

// Lazy-loaded pages for faster initial load
const PropertyDetails = lazy(() => import('./PropertyDetails'));
const HousesPage = lazy(() => import('./HousesPage').then(m => ({ default: m.default })));
const ShortStaysPage = lazy(() => import('./pages/ShortStaysPage'));
const MessageHost = lazy(() => import('./pages/MessageHost'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CampaignPreview = lazy(() => import('./pages/CampaignPreview').then(m => ({ default: m.CampaignPreview })));
const PublicBlogsPage = lazy(() => import('./BlogsPage').then(m => ({ default: m.default })));
const BlogDetailsPage = lazy(() => import('./BlogDetailsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const DeveloperDashboard = lazy(() => import('./pages/DeveloperDashboard').then(m => ({ default: m.DeveloperDashboard })));
const MyProperties = lazy(() => import('./pages/MyProperties').then(m => ({ default: m.MyProperties })));
const ScheduledVisits = lazy(() => import('./pages/ScheduledVisits'));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Blogs = lazy(() => import('./pages/Blogs').then(m => ({ default: m.Blogs })));
const DashboardCampaignAds = lazy(() => import('./pages/DashboardCampaignAds'));
const ShortStays = lazy(() => import('./pages/ShortStays').then(m => ({ default: m.default })));
const HostMessages = lazy(() => import('./pages/HostMessages').then(m => ({ default: m.HostMessages })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const OverviewPage = lazy(() => import('./pages/admin/OverviewPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const PropertiesPage = lazy(() => import('./pages/admin/PropertiesPage'));
const HostsPage = lazy(() => import('./pages/admin/HostsPage'));
const CampaignManagement = lazy(() => import('./pages/admin/CampaignManagement'));
const RevenuePage = lazy(() => import('./pages/admin/RevenuePage'));
const MessagesPage = lazy(() => import('./pages/admin/MessagesPage'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Import styles
import './styles/global.css';

/** When a host is logged in, redirect to / (host home) instead of showing the wrapped route. */
function HostRestrictedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user?.userType === 'host') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** Home: show HostsHomePage for hosts, HomePage for others. Wait for auth to be ready to avoid flashing the wrong page on refresh. */
function HomeOrHostHome({ onLoginClick }: { onLoginClick: () => void }) {
  const { isAuthReady, isAuthenticated, user } = useAuth();
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111217]">
        <div className="w-8 h-8 border-2 border-[#C7A667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (isAuthenticated && user?.userType === 'host') {
    return <HostsHomePage />;
  }
  return <HomePage onLoginClick={onLoginClick} />;
}

/** Redirect unknown routes to home. */
function NavigateToDefault() {
  return <Navigate to="/" replace />;
}

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

  const pageFallback = (
    <div className="min-h-screen flex items-center justify-center bg-[#111217]">
      <div className="w-8 h-8 border-2 border-[#C7A667] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Suspense fallback={pageFallback}>
      <Routes>
        {/* Home: host sees HostsHomePage, others see HomePage */}
        <Route path="/" element={<HomeOrHostHome onLoginClick={handleLoginClick} />} />

        <Route path="/property/:propertyId" element={<PropertyDetails />} />
        <Route path="/p/:propertyId" element={<PropertyDetails />} />
        <Route path="/property/:propertyId/message-host" element={<MessageHost />} />

        <Route
          path="/properties"
          element={
            <HostRestrictedRoute>
              <HousesPage />
            </HostRestrictedRoute>
          }
        />
        <Route path="/short-stays" element={<ShortStaysPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/campaign-preview" element={<CampaignPreview />} />

        <Route
          path="/blogs"
          element={
            <HostRestrictedRoute>
              <PublicBlogsPage />
            </HostRestrictedRoute>
          }
        />
        <Route
          path="/blog/:blogId"
          element={
            <HostRestrictedRoute>
              <BlogDetailsPage />
            </HostRestrictedRoute>
          }
        />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin isDarkMode={isDarkMode} />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <Dashboard isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/developer-dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <DeveloperDashboard isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/properties"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <MyProperties isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/scheduled-visits"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <ScheduledVisits isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/blogs"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <Blogs isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <Analytics isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/short-stays"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <ShortStays isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/messages"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <HostMessages isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/campaign-ads"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <DashboardCampaignAds />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout isDarkMode={isDarkMode}>
                <UserProfile isDarkMode={isDarkMode} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <OverviewPage isDarkMode={isDarkMode} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/developers"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <AdminDashboard isDarkMode={isDarkMode} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/properties"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <PropertiesPage isDarkMode={isDarkMode} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/hosts"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <HostsPage isDarkMode={isDarkMode} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/campaigns"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <CampaignManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <AnalyticsPage isDarkMode={isDarkMode} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/revenue"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <RevenuePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <MessagesPage isDarkMode={isDarkMode} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <ReportsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout isDarkMode={isDarkMode}>
                <SettingsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<NavigateToDefault />} />
      </Routes>
      </Suspense>

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
