import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Plus, 
  Eye, 
  MessageSquare,
  Edit,
  Trash2,
  Upload,
  MapPin,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';

interface DeveloperDashboardProps {
  isDarkMode: boolean;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Properties',
      value: '12',
      change: '+2',
      icon: Building2,
      color: 'text-blue-500'
    },
    {
      title: 'Total Views',
      value: '1,247',
      change: '+156',
      icon: Eye,
      color: 'text-green-500'
    },
    {
      title: 'Inquiries',
      value: '23',
      change: '+5',
      icon: MessageSquare,
      color: 'text-purple-500'
    },
    {
      title: 'Active Listings',
      value: '8',
      change: '+1',
      icon: Building2,
      color: 'text-orange-500'
    }
  ];

  const myProperties = [
    {
      id: 1,
      title: 'Luxury Apartments - Westlands',
      price: '$450,000',
      location: 'Westlands, Nairobi',
      image: '/api/placeholder/300/200',
      type: 'Apartment Complex',
      units: 24,
      status: 'Active',
      views: 156,
      inquiries: 8,
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      title: 'Modern Villas - Karen',
      price: '$1,200,000',
      location: 'Karen, Nairobi',
      image: '/api/placeholder/300/200',
      type: 'Villa Development',
      units: 12,
      status: 'Active',
      views: 89,
      inquiries: 5,
      lastUpdated: '1 week ago'
    },
    {
      id: 3,
      title: 'Townhouses - Runda',
      price: '$800,000',
      location: 'Runda, Nairobi',
      image: '/api/placeholder/300/200',
      type: 'Townhouse Complex',
      units: 18,
      status: 'Draft',
      views: 0,
      inquiries: 0,
      lastUpdated: '3 days ago'
    }
  ];

  const recentInquiries = [
    {
      id: 1,
      property: 'Luxury Apartments - Westlands',
      buyer: 'John Doe',
      email: 'john@example.com',
      phone: '+254 700 000 000',
      message: 'Interested in Unit 3A. Can I schedule a viewing?',
      date: '2 hours ago'
    },
    {
      id: 2,
      property: 'Modern Villas - Karen',
      buyer: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+254 700 000 001',
      message: 'What are the payment plans available?',
      date: '1 day ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}! 🏗️</h2>
            <p className="text-gray-600">
              Manage your property portfolio and track your listings performance.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Company: {user?.companyName} • License: {user?.licenseNumber}
            </p>
          </div>
          <motion.button
            className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Add Property
          </motion.button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Properties */}
        <motion.div
          className={`p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">My Properties</h3>
            <button className="text-[#C7A667] text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {myProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{property.title}</h4>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-500">
                          <Edit size={14} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">{property.location}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {property.units} units
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {property.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {property.inquiries} inquiries
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        property.status === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {property.status}
                      </span>
                      <span className="text-xs text-gray-500">Updated {property.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Inquiries */}
        <motion.div
          className={`p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Recent Inquiries</h3>
            <button className="text-[#C7A667] text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentInquiries.map((inquiry, index) => (
              <motion.div
                key={inquiry.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {inquiry.buyer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{inquiry.buyer}</h4>
                      <span className="text-xs text-gray-500">{inquiry.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{inquiry.property}</p>
                    <p className="text-xs text-gray-600 mb-2">{inquiry.message}</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[#C7A667] text-black text-xs rounded-full font-medium">
                        Reply
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-600 text-xs rounded-full font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5 text-[#C7A667]" />
            <span>Add Property</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="w-5 h-5 text-[#C7A667]" />
            <span>Upload Media</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="w-5 h-5 text-[#C7A667]" />
            <span>Manage Inquiries</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-5 h-5 text-[#C7A667]" />
            <span>Team Management</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
