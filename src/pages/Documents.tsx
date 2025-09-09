import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  MapPin,
  Square,
  Upload,
  Eye,
  Download,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  Image as ImageIcon,
  FileImage,
  MoreVertical
} from 'lucide-react';

interface DocumentsProps {
  isDarkMode: boolean;
}

interface TitleDeed {
  id: number;
  propertyTitle: string;
  location: string;
  areaSize: number;
  documentType: 'Title Deed';
  uploadDate: string;
  fileSize: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  documentUrl: string;
}

interface IDDocument {
  id: number;
  documentType: 'National ID' | 'Passport' | 'Driver License';
  documentNumber: string;
  uploadDate: string;
  fileSize: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  documentUrl: string;
}

export const Documents: React.FC<DocumentsProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'title-deeds' | 'id-documents'>('title-deeds');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const titleDeeds: TitleDeed[] = [
    {
      id: 1,
      propertyTitle: 'Luxury Apartments - Westlands',
      location: 'Westlands, Nairobi',
      areaSize: 2.5,
      documentType: 'Title Deed',
      uploadDate: '2024-01-10',
      fileSize: '2.3 MB',
      status: 'Verified',
      documentUrl: '/api/placeholder/document'
    },
    {
      id: 2,
      propertyTitle: 'Modern Villas - Karen',
      location: 'Karen, Nairobi',
      areaSize: 5.2,
      documentType: 'Title Deed',
      uploadDate: '2024-01-08',
      fileSize: '1.8 MB',
      status: 'Verified',
      documentUrl: '/api/placeholder/document'
    },
    {
      id: 3,
      propertyTitle: 'Townhouses - Runda',
      location: 'Runda, Nairobi',
      areaSize: 3.8,
      documentType: 'Title Deed',
      uploadDate: '2024-01-05',
      fileSize: '2.1 MB',
      status: 'Pending',
      documentUrl: '/api/placeholder/document'
    },
    {
      id: 4,
      propertyTitle: 'Penthouse Suites - Kilimani',
      location: 'Kilimani, Nairobi',
      areaSize: 1.2,
      documentType: 'Title Deed',
      uploadDate: '2024-01-03',
      fileSize: '1.5 MB',
      status: 'Verified',
      documentUrl: '/api/placeholder/document'
    }
  ];

  const idDocuments: IDDocument[] = [
    {
      id: 1,
      documentType: 'National ID',
      documentNumber: '12345678',
      uploadDate: '2024-01-12',
      fileSize: '1.2 MB',
      status: 'Verified',
      documentUrl: '/api/placeholder/id'
    },
    {
      id: 2,
      documentType: 'Passport',
      documentNumber: 'A1234567',
      uploadDate: '2024-01-10',
      fileSize: '1.8 MB',
      status: 'Verified',
      documentUrl: '/api/placeholder/passport'
    },
    {
      id: 3,
      documentType: 'Driver License',
      documentNumber: 'DL7890123',
      uploadDate: '2024-01-08',
      fileSize: '1.1 MB',
      status: 'Pending',
      documentUrl: '/api/placeholder/license'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const filteredTitleDeeds = titleDeeds.filter(deed => {
    const matchesSearch = 
      deed.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deed.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || deed.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredIDDocuments = idDocuments.filter(doc => {
    const matchesSearch = 
      doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const TitleDeedCard: React.FC<{ deed: TitleDeed }> = ({ deed }) => (
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#C7A667] rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{deed.propertyTitle}</h3>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <MapPin size={14} />
              {deed.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deed.status)}`}>
            {deed.status}
          </span>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Square className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium">{deed.areaSize} acres</p>
            <p className="text-xs text-gray-500">Area Size</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium">{new Date(deed.uploadDate).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Upload Date</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">File Size: {deed.fileSize}</span>
        <span className="text-sm text-gray-500">{deed.documentType}</span>
      </div>

      <div className="flex gap-2">
        <motion.button
          className="flex-1 px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye size={16} />
          View
        </motion.button>
        <motion.button
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download size={16} />
        </motion.button>
        <motion.button
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );

  const IDDocumentCard: React.FC<{ document: IDDocument }> = ({ document }) => (
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{document.documentType}</h3>
            <p className="text-gray-600 text-sm">Number: {document.documentNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
            {document.status}
          </span>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium">{new Date(document.uploadDate).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Upload Date</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileImage className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium">{document.fileSize}</p>
            <p className="text-xs text-gray-500">File Size</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          className="flex-1 px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye size={16} />
          View
        </motion.button>
        <motion.button
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download size={16} />
        </motion.button>
        <motion.button
          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 size={16} />
        </motion.button>
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
            <h2 className="text-2xl font-bold mb-2">Documents</h2>
            <p className="text-gray-600">
              Manage your property title deeds and identification documents.
            </p>
          </div>
          <motion.button
            className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} />
            Upload Document
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('title-deeds')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'title-deeds'
                ? 'border-b-2 border-[#C7A667] text-[#C7A667]'
                : 'text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={20} />
              Title Deeds ({titleDeeds.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('id-documents')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'id-documents'
                ? 'border-b-2 border-[#C7A667] text-[#C7A667]'
                : 'text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={20} />
              ID Documents ({idDocuments.length})
            </div>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={activeTab === 'title-deeds' 
                ? "Search by property title or location..." 
                : "Search by document type or number..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
            />
          </div>
          
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
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Documents', count: titleDeeds.length + idDocuments.length, color: 'text-blue-500', icon: FileText },
          { label: 'Title Deeds', count: titleDeeds.length, color: 'text-[#C7A667]', icon: Building2 },
          { label: 'ID Documents', count: idDocuments.length, color: 'text-green-500', icon: User },
          { label: 'Verified', count: [...titleDeeds, ...idDocuments].filter(doc => doc.status === 'Verified').length, color: 'text-purple-500', icon: FileText }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={`p-6 rounded-2xl ${
                isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold mb-1">{stat.count}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Documents Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'title-deeds' ? (
          filteredTitleDeeds.map((deed, index) => (
            <TitleDeedCard key={deed.id} deed={deed} />
          ))
        ) : (
          filteredIDDocuments.map((document, index) => (
            <IDDocumentCard key={document.id} document={document} />
          ))
        )}
      </motion.div>

      {/* Empty State */}
      {(activeTab === 'title-deeds' ? filteredTitleDeeds.length === 0 : filteredIDDocuments.length === 0) && (
        <motion.div
          className={`p-12 rounded-2xl text-center ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            {activeTab === 'title-deeds' ? (
              <Building2 size={32} className="text-gray-400" />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>
          <h3 className="text-xl font-bold mb-2">
            No {activeTab === 'title-deeds' ? 'title deeds' : 'ID documents'} found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : `Upload your first ${activeTab === 'title-deeds' ? 'title deed' : 'ID document'} to get started.`
            }
          </p>
          <motion.button
            className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={20} />
            Upload {activeTab === 'title-deeds' ? 'Title Deed' : 'ID Document'}
          </motion.button>
        </motion.div>
      )}

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            className={`w-full max-w-2xl p-6 rounded-2xl ${
              isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Document upload form will be implemented here. This is a placeholder modal.
            </p>
            <div className="flex gap-3">
              <motion.button
                className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadModal(false)}
              >
                Upload Document
              </motion.button>
              <motion.button
                className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
