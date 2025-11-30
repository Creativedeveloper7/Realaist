import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Search, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  MessageSquare,
  BarChart3,
  BookOpen,
  ArrowLeft,
  Megaphone
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
}

const allNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
  { id: 'properties', label: 'My Properties', icon: Search, href: '/dashboard/properties' },
  { id: 'scheduled-visits', label: 'Client Data', icon: MessageSquare, href: '/dashboard/scheduled-visits', badge: 3 },
  { id: 'blogs', label: 'Blogs', icon: BookOpen, href: '/dashboard/blogs' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
];

// Navigation items for buyers (investors)
const buyerNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
  { id: 'scheduled-visits', label: 'Client Data', icon: MessageSquare, href: '/dashboard/scheduled-visits', badge: 3 },
  { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
];

// Navigation items for developers
const developerNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
  { id: 'properties', label: 'My Properties', icon: Search, href: '/dashboard/properties' },
  { id: 'scheduled-visits', label: 'Client Data', icon: MessageSquare, href: '/dashboard/scheduled-visits', badge: 3 },
  { id: 'blogs', label: 'Blogs', icon: BookOpen, href: '/dashboard/blogs' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { id: 'campaign-ads', label: 'Campaign Ads', icon: Megaphone, href: '/dashboard/campaign-ads' },
  { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  isDarkMode 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get navigation items based on user type
  const getNavItems = () => {
    if (user?.userType === 'buyer') {
      return buyerNavItems;
    } else if (user?.userType === 'developer') {
      return developerNavItems;
    }
    return allNavItems; // fallback
  };
  
  const navItems = getNavItems();
  
  // Determine active item based on current route
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'overview';
    if (path === '/dashboard/properties') return 'properties';
    if (path === '/dashboard/scheduled-visits') return 'scheduled-visits';
    if (path === '/dashboard/analytics') return 'analytics';
    if (path === '/dashboard/campaign-ads') return 'campaign-ads';
    if (path === '/dashboard/profile') return 'profile';
    return 'overview';
  };
  
  const activeItem = getActiveItem();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const NavItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;

    const handleClick = () => {
      navigate(item.href);
      setSidebarOpen(false); // Close mobile sidebar after navigation
    };

    return (
      <motion.button
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-[#C7A667] text-black'
            : isDarkMode
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon size={20} />
        <span className={`font-medium ${item.id === 'scheduled-visits' ? 'text-sm' : ''}`}>{item.label}</span>
        {item.badge && (
          <motion.span
            className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {item.badge}
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#111217] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Mobile Header */}
      <div className={`lg:hidden flex items-center justify-between p-4 border-b ${
        isDarkMode ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <Menu size={24} />
          </button>
          <motion.button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'border-white/20 text-white hover:bg-white/10' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={14} />
            <span className="text-sm">Home</span>
          </motion.button>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className={`p-2 rounded-lg relative ${
            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}>
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              className={`fixed lg:static inset-y-0 left-0 z-50 w-64 ${
                isDarkMode ? 'bg-[#0E0E10] border-r border-white/10' : 'bg-white border-r border-gray-200'
              }`}
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Realaist</h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="lg:hidden p-1 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-lg">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm opacity-70">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/10">
                  <motion.button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </motion.button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <div className={`hidden lg:flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={16} />
                Back to Home
              </motion.button>
              
              {/* Campaign Ads Button - Only show for developers */}
              {user?.userType === 'developer' && (
                <motion.button
                  onClick={() => navigate('/dashboard/campaign-ads')}
                  className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C7A667] to-yellow-600 text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  animate={{
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      '0 4px 15px rgba(199, 166, 103, 0.4)',
                      '0 8px 25px rgba(199, 166, 103, 0.6)',
                      '0 4px 15px rgba(199, 166, 103, 0.4)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 10px 30px rgba(199, 166, 103, 0.8)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Megaphone size={18} />
                  <span className="relative z-10">Campaign Ads</span>
                </motion.button>
              )}
              
              
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your properties today.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className={`p-3 rounded-lg relative ${
                isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}>
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </div>
  );
};
