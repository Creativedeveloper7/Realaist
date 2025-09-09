import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  User,
  Building2,
  Filter,
  Search,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';

interface ScheduledVisitsProps {
  isDarkMode: boolean;
}

interface ScheduledVisit {
  id: number;
  property: {
    id: number;
    title: string;
    location: string;
    image: string;
    price: string;
  };
  visitor: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  message: string;
  createdAt: string;
}

export const ScheduledVisits: React.FC<ScheduledVisitsProps> = ({ isDarkMode }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const scheduledVisits: ScheduledVisit[] = [
    {
      id: 1,
      property: {
        id: 1,
        title: 'Luxury Apartments - Westlands',
        location: 'Westlands, Nairobi',
        image: '/api/placeholder/300/200',
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
        id: 2,
        title: 'Modern Villas - Karen',
        location: 'Karen, Nairobi',
        image: '/api/placeholder/300/200',
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
        id: 1,
        title: 'Luxury Apartments - Westlands',
        location: 'Westlands, Nairobi',
        image: '/api/placeholder/300/200',
        price: '$450,000'
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
    },
    {
      id: 4,
      property: {
        id: 3,
        title: 'Townhouses - Runda',
        location: 'Runda, Nairobi',
        image: '/api/placeholder/300/200',
        price: '$800,000'
      },
      visitor: {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+254 700 000 003'
      },
      scheduledDate: '2024-01-17',
      scheduledTime: '11:00 AM',
      status: 'Scheduled',
      message: 'Interested in viewing the show house.',
      createdAt: '4 hours ago'
    },
    {
      id: 5,
      property: {
        id: 2,
        title: 'Modern Villas - Karen',
        location: 'Karen, Nairobi',
        image: '/api/placeholder/300/200',
        price: '$1,200,000'
      },
      visitor: {
        name: 'David Brown',
        email: 'david@example.com',
        phone: '+254 700 000 004'
      },
      scheduledDate: '2024-01-13',
      scheduledTime: '4:00 PM',
      status: 'Cancelled',
      message: 'Need to reschedule due to work commitment.',
      createdAt: '1 week ago'
    }
  ];

  const filteredVisits = scheduledVisits.filter(visit => {
    const matchesSearch = 
      visit.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || visit.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'Completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return <Clock size={16} />;
      case 'Confirmed':
        return <CheckCircle size={16} />;
      case 'Completed':
        return <CheckCircle size={16} />;
      case 'Cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const VisitCard: React.FC<{ visit: ScheduledVisit }> = ({ visit }) => (
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
          <div className="w-12 h-12 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-lg">
            {visit.visitor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-bold text-lg">{visit.visitor.name}</h3>
            <p className="text-gray-600 text-sm">{visit.visitor.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(visit.status)}`}>
            {getStatusIcon(visit.status)}
            {visit.status}
          </span>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-lg mb-1">{visit.property.title}</h4>
        <p className="text-gray-600 text-sm flex items-center gap-1 mb-2">
          <MapPin size={14} />
          {visit.property.location}
        </p>
        <p className="text-[#C7A667] font-bold text-lg">{visit.property.price}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium">{formatDate(visit.scheduledDate)}</p>
            <p className="text-xs text-gray-500">Date</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="text-gray-400" size={16} />
          <div>
            <p className="text-sm font-medium">{visit.scheduledTime}</p>
            <p className="text-xs text-gray-500">Time</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{visit.message}</p>
        <p className="text-xs text-gray-500">Requested {visit.createdAt}</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <a 
          href={`tel:${visit.visitor.phone}`}
          className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
        >
          <Phone size={14} />
          Call
        </a>
        <a 
          href={`mailto:${visit.visitor.email}`}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Mail size={14} />
          Email
        </a>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#C7A667] text-black rounded-lg text-sm font-medium hover:bg-[#B8965A] transition-colors">
          <MessageSquare size={14} />
          Message
        </button>
      </div>

      <div className="flex gap-2">
        {visit.status === 'Scheduled' && (
          <>
            <motion.button
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Confirm
            </motion.button>
            <motion.button
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reschedule
            </motion.button>
          </>
        )}
        {visit.status === 'Confirmed' && (
          <motion.button
            className="flex-1 px-4 py-2 bg-[#C7A667] text-black rounded-lg font-medium hover:bg-[#B8965A] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Mark Complete
          </motion.button>
        )}
        {visit.status === 'Completed' && (
          <motion.button
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Details
          </motion.button>
        )}
        {visit.status === 'Cancelled' && (
          <motion.button
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Reschedule
          </motion.button>
        )}
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
            <h2 className="text-2xl font-bold mb-2">Scheduled Visits</h2>
            <p className="text-gray-600">
              Manage property viewing appointments and visitor interactions.
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#C7A667]">{scheduledVisits.length}</p>
            <p className="text-sm text-gray-500">Total Visits</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by visitor name, property, or location..."
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
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Scheduled', count: scheduledVisits.filter(v => v.status === 'Scheduled').length, color: 'text-blue-500' },
          { label: 'Confirmed', count: scheduledVisits.filter(v => v.status === 'Confirmed').length, color: 'text-green-500' },
          { label: 'Completed', count: scheduledVisits.filter(v => v.status === 'Completed').length, color: 'text-gray-500' },
          { label: 'Cancelled', count: scheduledVisits.filter(v => v.status === 'Cancelled').length, color: 'text-red-500' }
        ].map((stat, index) => (
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
                <Calendar className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Visits Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {filteredVisits.map((visit, index) => (
          <VisitCard key={visit.id} visit={visit} />
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredVisits.length === 0 && (
        <motion.div
          className={`p-12 rounded-2xl text-center ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No scheduled visits found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No visits have been scheduled yet.'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};
