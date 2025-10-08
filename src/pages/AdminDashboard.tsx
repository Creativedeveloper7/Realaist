import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Building2, 
  Eye, 
  MessageSquare,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  Shield,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface AdminDashboardProps {
  isDarkMode: boolean;
}

interface Developer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  licenseNumber: string;
  userType: string;
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
  propertiesCount: number;
  totalViews: number;
  scheduledVisits: number;
  subscriptionPlan: string;
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);

  // Mock data - in real app, this would come from API
  const mockDevelopers: Developer[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      companyName: 'Smith Properties Ltd',
      licenseNumber: 'REA-001',
      userType: 'developer',
      createdAt: '2023-01-15',
      lastLogin: '2024-01-10',
      status: 'active',
      propertiesCount: 12,
      totalViews: 1247,
      scheduledVisits: 23,
      subscriptionPlan: 'Professional',
      subscriptionStatus: 'active'
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      companyName: 'Johnson Developments',
      licenseNumber: 'REA-002',
      userType: 'developer',
      createdAt: '2023-03-20',
      lastLogin: '2024-01-08',
      status: 'active',
      propertiesCount: 8,
      totalViews: 892,
      scheduledVisits: 15,
      subscriptionPlan: 'Starter',
      subscriptionStatus: 'active'
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      companyName: 'Brown Real Estate',
      licenseNumber: 'REA-003',
      userType: 'developer',
      createdAt: '2023-06-10',
      lastLogin: '2023-12-15',
      status: 'inactive',
      propertiesCount: 5,
      totalViews: 456,
      scheduledVisits: 8,
      subscriptionPlan: 'Professional',
      subscriptionStatus: 'expired'
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@example.com',
      companyName: 'Davis Properties',
      licenseNumber: 'REA-004',
      userType: 'developer',
      createdAt: '2023-08-05',
      lastLogin: '2024-01-12',
      status: 'active',
      propertiesCount: 25,
      totalViews: 2156,
      scheduledVisits: 42,
      subscriptionPlan: 'Enterprise',
      subscriptionStatus: 'active'
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@example.com',
      companyName: 'Wilson Developments',
      licenseNumber: 'REA-005',
      userType: 'developer',
      createdAt: '2023-11-12',
      lastLogin: '2024-01-09',
      status: 'suspended',
      propertiesCount: 3,
      totalViews: 234,
      scheduledVisits: 5,
      subscriptionPlan: 'Starter',
      subscriptionStatus: 'cancelled'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadDevelopers = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDevelopers(mockDevelopers);
      setIsLoading(false);
    };
    loadDevelopers();
  }, []);

  const filteredDevelopers = developers.filter(dev => {
    const matchesSearch = dev.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dev.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dev.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || dev.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      title: 'Total Developers',
      value: developers.length.toString(),
      change: '+3',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Active Subscriptions',
      value: developers.filter(d => d.subscriptionStatus === 'active').length.toString(),
      change: '+2',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Total Properties',
      value: developers.reduce((sum, d) => sum + d.propertiesCount, 0).toString(),
      change: '+15',
      icon: Building2,
      color: 'text-purple-500'
    },
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+$2,100',
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <p className="text-gray-600">Manage all developer accounts and platform analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">System Online</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className={`p-6 rounded-2xl ${
                isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-green-500 font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search developers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#C7A667]`}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#C7A667]`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="px-4 py-3 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Developers Table */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Developer Accounts</h3>
          <span className="text-sm text-gray-600">{filteredDevelopers.length} developers</span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7A667] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading developers...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Developer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Properties</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Subscription</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevelopers.map((developer, index) => (
                  <motion.tr
                    key={developer.id}
                    className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold">
                          {developer.firstName[0]}{developer.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{developer.firstName} {developer.lastName}</p>
                          <p className="text-sm text-gray-600">{developer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{developer.companyName}</p>
                        <p className="text-sm text-gray-600">{developer.licenseNumber}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-bold">{developer.propertiesCount}</p>
                          <p className="text-xs text-gray-600">Properties</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{developer.totalViews}</p>
                          <p className="text-xs text-gray-600">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{developer.scheduledVisits}</p>
                          <p className="text-xs text-gray-600">Visits</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{developer.subscriptionPlan}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getSubscriptionColor(developer.subscriptionStatus)}`}>
                          {developer.subscriptionStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(developer.status)}`}>
                        {developer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm">{new Date(developer.lastLogin).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDeveloper(developer)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Developer Detail Modal */}
      {selectedDeveloper && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedDeveloper(null)}
        >
          <motion.div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
            } rounded-2xl shadow-2xl`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Developer Details</h2>
                <button
                  onClick={() => setSelectedDeveloper(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-xl">
                  {selectedDeveloper.firstName[0]}{selectedDeveloper.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedDeveloper.firstName} {selectedDeveloper.lastName}</h3>
                  <p className="text-gray-600">{selectedDeveloper.email}</p>
                  <p className="text-sm text-gray-500">{selectedDeveloper.companyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">License:</span> {selectedDeveloper.licenseNumber}</p>
                    <p><span className="text-gray-600">Joined:</span> {new Date(selectedDeveloper.createdAt).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Last Login:</span> {new Date(selectedDeveloper.lastLogin).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Properties:</span> {selectedDeveloper.propertiesCount}</p>
                    <p><span className="text-gray-600">Total Views:</span> {selectedDeveloper.totalViews}</p>
                    <p><span className="text-gray-600">Scheduled Visits:</span> {selectedDeveloper.scheduledVisits}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors">
                  View Properties
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                  Send Message
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Suspend Account
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
