import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Eye, 
  Edit,
  Trash2,
  MapPin,
  Building2,
  MessageSquare,
  Search,
  Grid3X3,
  List,
  MoreVertical
} from 'lucide-react';
import { PropertyUploadModal } from '../components/PropertyUploadModal';
import { useAuth } from '../contexts/AuthContext';
import { propertiesService, Property } from '../services/propertiesService';
import { useNavigate } from 'react-router-dom';

interface MyPropertiesProps {
  isDarkMode: boolean;
}

export const MyProperties: React.FC<MyPropertiesProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  // Load developer's properties
  useEffect(() => {
    const loadProperties = async () => {
      if (!user?.id) return;
      
      setIsLoadingProperties(true);
      try {
        const { properties: fetchedProperties, error } = await propertiesService.getDeveloperProperties(user.id);
        if (error) {
          console.error('Error loading properties:', error);
        } else {
          setProperties(fetchedProperties);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadProperties();
  }, [user?.id]);

  // Realtime add on property creation
  useEffect(() => {
    const handler = (e: any) => {
      const created = e?.detail?.property as Property | undefined;
      if (!created) return;
      if (!user?.id) return;
      if (created.developerId !== user.id) return;
      setProperties(prev => {
        if (prev.find(p => p.id === created.id)) return prev;
        return [created, ...prev];
      });
    };
    window.addEventListener('realaist:property-created' as any, handler);
    return () => window.removeEventListener('realaist:property-created' as any, handler);
  }, [user?.id]);

  // React to external deletions
  useEffect(() => {
    const handler = (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (!id) return;
      setProperties(prev => prev.filter(p => p.id !== id));
      if (deletingProperty && deletingProperty.id === id) setDeletingProperty(null);
    };
    window.addEventListener('realaist:property-deleted' as any, handler);
    return () => window.removeEventListener('realaist:property-deleted' as any, handler);
  }, [deletingProperty]);

  const handlePropertyCreated = async () => {
    // Reload properties after a new one is created
    if (!user?.id) return;
    
    try {
      const { properties: fetchedProperties, error } = await propertiesService.getDeveloperProperties(user.id);
      if (!error) {
        setProperties(fetchedProperties);
      }
    } catch (error) {
      console.error('Error reloading properties:', error);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || property.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'sold':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowUploadModal(true);
  };

  const handleDeleteProperty = (property: Property) => {
    setDeletingProperty(property);
  };

  const confirmDelete = async () => {
    if (deletingProperty) {
      try {
        // TODO: Implement actual property deletion with Supabase
        console.log('Deleting property:', deletingProperty.id);
        // await propertiesService.deleteProperty(deletingProperty.id);
        setDeletingProperty(null);
        // Show success message
      } catch (error) {
        console.error('Error deleting property:', error);
        // Show error message
      }
    }
  };

  const handleViewProperty = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
    <motion.div
      className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
        isDarkMode 
          ? 'bg-[#0E0E10] border-white/10 hover:border-white/20' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="text-gray-400" size={48} />
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-lg mb-1">{property.title}</h3>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            <MapPin size={14} />
            {property.location}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[#C7A667]">${property.price.toLocaleString()}</span>
          <span className="text-sm text-gray-500">{property.propertyType}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold">{property.bedrooms || 'N/A'}</div>
            <div className="text-gray-500">Bedrooms</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{property.bathrooms || 'N/A'}</div>
            <div className="text-gray-500">Bathrooms</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{property.squareFeet ? `${property.squareFeet} sq ft` : 'N/A'}</div>
            <div className="text-gray-500">Area</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              0 views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={14} />
              0 visits
            </span>
          </div>
          <span>Updated {new Date(property.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-2 pt-2">
          <motion.button
            className="flex-1 px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleEditProperty(property)}
          >
            <Edit size={16} />
            Edit
          </motion.button>
          <motion.button
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleViewProperty(property)}
          >
            <Eye size={16} />
          </motion.button>
          <motion.button
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDeleteProperty(property)}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const PropertyListItem: React.FC<{ property: Property }> = ({ property }) => (
    <motion.div
      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
        isDarkMode 
          ? 'bg-[#0E0E10] border-white/10 hover:border-white/20' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      whileHover={{ x: 4 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
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
            <div>
              <h3 className="font-bold text-lg">{property.title}</h3>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <MapPin size={14} />
                {property.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Building2 size={14} />
                {property.propertyType}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                0 views
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={14} />
                0 visits
              </span>
              <span>Updated {new Date(property.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#C7A667]">${property.price.toLocaleString()}</span>
              <div className="flex gap-1">
                <button 
                  className="p-2 text-gray-400 hover:text-blue-500"
                  onClick={() => handleEditProperty(property)}
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-green-500"
                  onClick={() => handleViewProperty(property)}
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-500"
                  onClick={() => handleDeleteProperty(property)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">My Properties</h2>
            <p className="text-gray-600">
              Manage your property portfolio and track performance.
            </p>
          </div>
          <motion.button
            className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} />
            Add Property
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
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
              } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="sold">Sold</option>
              <option value="pending">Pending</option>
            </select>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-3 ${
                  viewMode === 'grid' 
                    ? 'bg-[#C7A667] text-black' 
                    : isDarkMode 
                      ? 'bg-white/5 text-white/70 hover:bg-white/10' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-3 ${
                  viewMode === 'list' 
                    ? 'bg-[#C7A667] text-black' 
                    : isDarkMode 
                      ? 'bg-white/5 text-white/70 hover:bg-white/10' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Properties Grid/List */}
      {isLoadingProperties ? (
        <motion.div
          className={`p-12 rounded-2xl text-center ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7A667] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your properties...</p>
        </motion.div>
      ) : (
      <motion.div
        className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
          {filteredProperties.map((property) => (
          viewMode === 'grid' ? (
            <PropertyCard key={property.id} property={property} />
          ) : (
            <PropertyListItem key={property.id} property={property} />
          )
        ))}
      </motion.div>
      )}

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <motion.div
          className={`p-12 rounded-2xl text-center ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No properties found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first property to your portfolio.'
            }
          </p>
          <motion.button
            className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} />
            Add Your First Property
          </motion.button>
        </motion.div>
      )}

      {/* Property Upload Modal */}
      <PropertyUploadModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setEditingProperty(null);
        }}
        isDarkMode={isDarkMode}
          onPropertyCreated={handlePropertyCreated}
          editingProperty={editingProperty}
      />

      {/* Delete Confirmation Modal */}
      {deletingProperty && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setDeletingProperty(null)}
        >
          <motion.div
            className={`w-full max-w-md p-6 rounded-2xl ${
              isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Property</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>"{deletingProperty.title}"</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-white/20 text-gray-600 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeletingProperty(null)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
