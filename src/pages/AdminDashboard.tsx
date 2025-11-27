import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Eye, 
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { propertiesService } from '../services/propertiesService';
import { createDeveloperAsAdmin } from '../services/adminService';

interface AdminDashboardProps {
  isDarkMode: boolean;
}

interface Developer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  licenseNumber?: string;
  phone?: string;
  userType: 'buyer' | 'developer';
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'suspended';
  propertiesCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode }) => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    licenseNumber: '',
    phone: '',
  });

    const loadDevelopers = async () => {
    try {
      setIsLoading(true);

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'developer')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading developers:', error);
        setDevelopers([]);
        return;
      }

      const developerIds = (profiles || []).map((p: any) => p.id);

      let propertiesCountMap = new Map<string, number>();
      if (developerIds.length > 0) {
        try {
          const { properties } = await propertiesService.getPropertiesDirect();
          propertiesCountMap = properties.reduce((map, p) => {
            const devId = p.developerId;
            if (!devId) return map;
            map.set(devId, (map.get(devId) || 0) + 1);
            return map;
          }, new Map<string, number>());
        } catch (err) {
          console.warn('Error loading properties for counts:', err);
          // Continue with empty counts
        }
      }

      const mapped: Developer[] = (profiles || []).map((p: any) => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        companyName: p.company_name || '',
        licenseNumber: p.license_number || '',
        phone: p.phone || '',
        userType: p.user_type,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        status: 'active',
        propertiesCount: propertiesCountMap.get(p.id) || 0,
      }));

      setDevelopers(mapped);
    } catch (err) {
      console.error('Unexpected error loading developers:', err);
      setDevelopers([]);
    } finally {
      setIsLoading(false);
    }
    };

  useEffect(() => {
    loadDevelopers();
  }, []);

  const filteredDevelopers = useMemo(
    () =>
      developers.filter((dev) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          dev.firstName.toLowerCase().includes(search) ||
          dev.lastName.toLowerCase().includes(search) ||
          dev.email.toLowerCase().includes(search) ||
          (dev.companyName || '').toLowerCase().includes(search);
    
    const matchesFilter = filterStatus === 'all' || dev.status === filterStatus;
    
    return matchesSearch && matchesFilter;
      }),
    [developers, searchTerm, filterStatus]
  );

  const stats = [
    {
      title: 'Total Developers',
      value: developers.length.toString(),
      change: '+3',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Active Developers',
      value: developers.filter(d => d.status === 'active').length.toString(),
      change: '+2',
      icon: UserCheck,
      color: 'text-green-500'
    },
    {
      title: 'Suspended Accounts',
      value: developers.filter(d => d.status === 'suspended').length.toString(),
      change: '—',
      icon: UserX,
      color: 'text-red-500'
    },
    {
      title: 'Total Properties',
      value: developers.reduce((sum, d) => sum + d.propertiesCount, 0).toString(),
      change: '+15',
      icon: Building2,
      color: 'text-purple-500'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createDeveloperAsAdmin({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        phone: formData.phone || undefined,
      });

      if (!result.success) {
        console.error('Error creating developer:', result.error);
        alert('Failed to create developer: ' + (result.error || 'Unknown error'));
        return;
      }

      // Wait a bit and retry fetching the profile (with retry logic)
      let profileData: any = null;
      let retries = 0;
      const maxRetries = 5;

      while (!profileData && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', result.userId)
          .single();
        
        if (data && !error) {
          profileData = data;
          break;
        }
        retries++;
      }

      // Close modal and reset form first
      setShowCreateModal(false);
      const tempPassword = result.temporaryPassword;
      const createdEmail = formData.email;
      
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        companyName: '',
        licenseNumber: '',
        phone: '',
      });

      // If profile was found, add it optimistically to the list
      if (profileData) {
        const newDev: Developer = {
          id: profileData.id,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email || '',
          companyName: profileData.company_name || '',
          licenseNumber: profileData.license_number || '',
          phone: profileData.phone || '',
          userType: profileData.user_type,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at,
          status: 'active',
          propertiesCount: 0,
        };

        // Add to list immediately
        setDevelopers(prev => [newDev, ...prev]);
      }

      // Always refresh the full list to ensure accuracy (this will update the optimistically added item with correct property counts)
      await loadDevelopers();
      
      // Show success message with temporary password
      alert(`Developer created successfully!\n\nEmail: ${createdEmail}\nTemporary Password: ${tempPassword}\n\nPlease share these credentials with the developer.`);
    } catch (err) {
      console.error('Unexpected error creating developer:', err);
      alert('Unexpected error creating developer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <motion.div
        className={`p-4 sm:p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h2>
              <p className="text-sm text-gray-600">Manage developer accounts and platform analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600 font-medium">System Online</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className={`p-4 sm:p-6 rounded-2xl ${
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
        className={`p-4 sm:p-6 rounded-2xl ${
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-1 sm:flex-initial">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 rounded-lg border text-sm ${
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
            </div>

            <button
              onClick={() => {
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  companyName: '',
                  licenseNumber: '',
                  phone: '',
                });
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-3 rounded-lg bg-[#C7A667] text-black text-sm font-medium hover:bg-[#B8965A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Developer</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Developers Table */}
      <motion.div
        className={`p-4 sm:p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <h3 className="text-lg sm:text-xl font-bold">Developer Accounts</h3>
          <span className="text-sm text-gray-600">{filteredDevelopers.length} developers</span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7A667] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading developers...</p>
          </div>
        ) : filteredDevelopers.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No developers found.</p>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
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
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                          <p className="font-medium text-sm">Basic Plan</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${getSubscriptionColor('active')}`}>
                            Active
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(developer.status)}`}>
                        {developer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                        <p className="text-sm">{new Date(developer.createdAt).toLocaleDateString()}</p>
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

            <div className="grid gap-3 sm:gap-4 lg:hidden">
              {filteredDevelopers.map((developer) => (
                <motion.div
                  key={`${developer.id}-card`}
                  className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-base sm:text-lg flex-shrink-0">
                      {developer.firstName[0]}{developer.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{developer.firstName} {developer.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{developer.email}</p>
                    </div>
                    <span className={`ml-auto px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${getStatusColor(developer.status)}`}>
                      {developer.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Company</p>
                      <p className="font-medium text-xs sm:text-sm truncate">{developer.companyName || '—'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">License</p>
                      <p className="font-medium text-xs sm:text-sm truncate">{developer.licenseNumber || '—'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Properties</p>
                      <p className="font-semibold text-xs sm:text-sm">{developer.propertiesCount}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="font-semibold text-xs truncate">{new Date(developer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Subscription</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs truncate ${getSubscriptionColor('active')}`}>
                        <span className="hidden sm:inline">Basic Plan · Active</span>
                        <span className="sm:hidden">Active</span>
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedDeveloper(developer)}
                        className="p-2 rounded-lg bg-gray-200/70 dark:bg-white/10 flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-gray-200/70 dark:bg-white/10 flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
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
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Developer Details</h2>
                <button
                  onClick={() => setSelectedDeveloper(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                >
                <X className="w-5 h-5" />
                </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">License:</span> {selectedDeveloper.licenseNumber || '—'}</p>
                    <p><span className="text-gray-600">Joined:</span> {new Date(selectedDeveloper.createdAt).toLocaleDateString()}</p>
                    <p><span className="text-gray-600">Status:</span> {selectedDeveloper.status}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Properties:</span> {selectedDeveloper.propertiesCount}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedDeveloper.phone || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors text-sm">
                  View Properties
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm">
                  Send Message
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                  Suspend Account
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Create Developer Modal */}
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSubmitting && setShowCreateModal(false)}
        >
          <motion.div
            className={`relative w-full max-w-lg ${
              isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
            } rounded-2xl shadow-2xl`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Developer</h2>
              <button
                onClick={() => !isSubmitting && setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleCreateDeveloper}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">License Number</label>
                  <input
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="+254..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => !isSubmitting && setShowCreateModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm rounded-lg bg-[#C7A667] text-black font-medium hover:bg-[#B8965A] disabled:opacity-60 transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Developer'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
