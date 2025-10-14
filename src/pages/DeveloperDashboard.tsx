import React, { useState, useEffect } from 'react';
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
  Users,
  Settings,
  Key
} from 'lucide-react';
import { PropertyUploadModal } from '../components/PropertyUploadModal';
import { propertiesService, Property } from '../services/propertiesService';

interface DeveloperDashboardProps {
  isDarkMode: boolean;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load developer's properties
  useEffect(() => {
    const loadProperties = async () => {
      if (!user?.id) return;
      
      setIsLoadingProperties(true);
      try {
        const { properties, error } = await propertiesService.getDeveloperProperties(user.id);
        if (error) {
          console.error('Error loading properties:', error);
        } else {
          setMyProperties(properties);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadProperties();
  }, [user?.id]);

  // Listen for realtime property creation to update list without refresh
  useEffect(() => {
    const handler = (e: any) => {
      const created = e?.detail?.property as Property | undefined;
      if (!created) return;
      if (!user?.id) return;
      if (created.developerId !== user.id) return;
      setMyProperties(prev => {
        if (prev.find(p => p.id === created.id)) return prev;
        return [created, ...prev];
      });
    };
    window.addEventListener('realaist:property-created' as any, handler);
    return () => window.removeEventListener('realaist:property-created' as any, handler);
  }, [user?.id]);

  // Remove from list on deletion events
  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (!id) return;
      setMyProperties(prev => prev.filter(p => p.id !== id));
    };
    window.addEventListener('realaist:property-deleted' as any, handler);
    return () => window.removeEventListener('realaist:property-deleted' as any, handler);
  }, []);

  const stats = [
    {
      title: 'Total Properties',
      value: myProperties.length.toString(),
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
      title: 'Scheduled Visits',
      value: '23',
      change: '+5',
      icon: MessageSquare,
      color: 'text-purple-500'
    },
    {
      title: 'Active Listings',
      value: myProperties.filter(p => p.status === 'active').length.toString(),
      change: '+1',
      icon: Building2,
      color: 'text-orange-500'
    }
  ];

  const handlePropertyCreated = async () => {
    // Reload properties after a new one is created
    if (!user?.id) return;
    
    try {
      const { properties, error } = await propertiesService.getDeveloperProperties(user.id);
      if (!error) {
        setMyProperties(properties);
      }
    } catch (error) {
      console.error('Error reloading properties:', error);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!id) return;
    const confirmed = window.confirm('Delete this property? This action cannot be undone.');
    if (!confirmed) return;
    try {
      setDeletingId(id);
      // Optimistic UI
      setMyProperties(prev => prev.filter(p => p.id !== id));
      const { error } = await propertiesService.deleteProperty(id);
      if (error) {
        console.error('Delete failed:', error);
        // Revert UI on failure
        const { properties } = await propertiesService.getDeveloperProperties(user?.id);
        setMyProperties(properties);
        alert(`Failed to delete property: ${error}`);
      }
    } catch (e) {
      console.error('Unexpected delete error:', e);
      alert('Unexpected error while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  const recentScheduledVisits = [
    {
      id: 1,
      property: {
        title: 'Luxury Apartments - Westlands',
        location: 'Westlands, Nairobi',
        price: '$450,000'
      },
      visitor: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+254 700 000 000'
      },
      scheduledDate: '2024-01-15',
      scheduledTime: '10:00 AM',
      status: 'Scheduled',
      message: 'Interested in Unit 3A. Can I schedule a viewing?',
      createdAt: '2 hours ago'
    },
    {
      id: 2,
      property: {
        title: 'Modern Villas - Karen',
        location: 'Karen, Nairobi',
        price: '$1,200,000'
      },
      visitor: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+254 700 000 001'
      },
      scheduledDate: '2024-01-16',
      scheduledTime: '2:00 PM',
      status: 'Confirmed',
      message: 'What are the payment plans available?',
      createdAt: '1 day ago'
    },
    {
      id: 3,
      property: {
        title: 'Townhouses - Runda',
        location: 'Runda, Nairobi',
        price: '$800,000'
      },
      visitor: {
        name: 'Michael Johnson',
        email: 'michael@example.com',
        phone: '+254 700 000 002'
      },
      scheduledDate: '2024-01-14',
      scheduledTime: '3:00 PM',
      status: 'Completed',
      message: 'Looking for a 3-bedroom unit with parking.',
      createdAt: '3 days ago'
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
              Company: {user?.companyName} • Business Number: {user?.licenseNumber}
            </p>
          </div>
          <motion.button
            onClick={() => setIsUploadModalOpen(true)}
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
            {isLoadingProperties ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7A667] mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading properties...</p>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No properties yet</h4>
                <p className="text-gray-500 mb-4">Start by adding your first property to the platform</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors"
                >
                  Add Your First Property
                </button>
              </div>
            ) : (
              myProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="p-4 rounded-lg border border-gray-200 dark:border:white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{property.title}</h4>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-500">
                          <Edit size={14} />
                        </button>
                        <button
                          className={`p-1 text-gray-400 hover:text-red-500 ${deletingId === property.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => deletingId ? null : handleDeleteProperty(property.id)}
                          disabled={deletingId === property.id}
                          title={deletingId === property.id ? 'Deleting…' : 'Delete property'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mb-2">{property.location}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                          <DollarSign size={12} />
                          ${property.price.toLocaleString()}
                      </span>
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {property.bedrooms} beds
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {property.bathrooms} baths
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                          property.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                            : property.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(property.updatedAt).toLocaleDateString()}
                      </span>
                      </div>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Scheduled Visits */}
        <motion.div
          className={`p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border:white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Recent Scheduled Visits</h3>
            <button className="text-[#C7A667] text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentScheduledVisits.map((visit, index) => (
              <motion.div
                key={visit.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {visit.visitor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{visit.visitor.name}</h4>
                      <span className="text-xs text-gray-500">{visit.createdAt}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{visit.property.title}</p>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <MapPin size={10} />
                      {visit.property.location}
                    </p>
                    <p className="text-xs text-[#C7A667] font-medium mb-1">{visit.property.price}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(visit.scheduledDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {visit.scheduledTime}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        visit.status === 'Scheduled' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : visit.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {visit.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{visit.message}</p>
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
          isDarkMode ? 'bg-[#0E0E10] border border:white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            onClick={() => setIsUploadModalOpen(true)}
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
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border:white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="w-5 h-5 text-[#C7A667]" />
            <span>Manage Visits</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border:white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users className="w-5 h-5 text-[#C7A667]" />
            <span>Team Management</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Google Ads API Settings */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Key className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Google Ads API Settings</h3>
            <p className="text-sm text-gray-500">Configure your Google Ads API credentials for campaign management</p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠️</div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Test Phase</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You're currently in the test phase. Contact admin to configure your Google Ads Developer Token for campaign creation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-blue-500 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <span className="font-medium">API Configuration</span>
              <p className="text-sm text-gray-500">Manage your Google Ads API settings</p>
            </div>
          </motion.button>
          
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-green-500 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Key className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <span className="font-medium">Developer Token</span>
              <p className="text-sm text-gray-500">Configure your API access token</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Property Upload Modal */}
      <PropertyUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        isDarkMode={isDarkMode}
        onPropertyCreated={handlePropertyCreated}
      />
    </div>
  );
};
