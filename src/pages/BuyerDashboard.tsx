import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, 
  Bookmark, 
  MessageSquare, 
  Search,
  MapPin,
  DollarSign,
  Eye,
  Bell
} from 'lucide-react';

interface BuyerDashboardProps {
  isDarkMode: boolean;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Properties Viewed',
      value: '24',
      change: '+12%',
      icon: Eye,
      color: 'text-blue-500'
    },
    {
      title: 'Favorites',
      value: '8',
      change: '+3',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      title: 'Saved Properties',
      value: '12',
      change: '+2',
      icon: Bookmark,
      color: 'text-purple-500'
    },
    {
      title: 'Notifications',
      value: '5',
      change: '+2',
      icon: Bell,
      color: 'text-orange-500'
    }
  ];

  const favoriteProperties = [
    {
      id: 1,
      title: 'Luxury Apartment in Westlands',
      price: '$450,000',
      location: 'Westlands, Nairobi',
      image: '/api/placeholder/300/200',
      type: 'Apartment',
      bedrooms: 3,
      bathrooms: 2,
      isFavorite: true,
      isSaved: true,
      addedDate: '2 days ago'
    },
    {
      id: 2,
      title: 'Modern Villa in Karen',
      price: '$1,200,000',
      location: 'Karen, Nairobi',
      image: '/api/placeholder/300/200',
      type: 'Villa',
      bedrooms: 5,
      bathrooms: 4,
      isFavorite: true,
      isSaved: false,
      addedDate: '1 week ago'
    },
    {
      id: 3,
      title: 'Townhouse in Runda',
      price: '$800,000',
      location: 'Runda, Nairobi',
      image: '/api/placeholder/300/200',
      type: 'Townhouse',
      bedrooms: 4,
      bathrooms: 3,
      isFavorite: true,
      isSaved: true,
      addedDate: '3 days ago'
    }
  ];

  const savedProperties = [
    {
      id: 4,
      title: 'Penthouse in Kilimani',
      price: '$650,000',
      location: 'Kilimani, Nairobi',
      type: 'Penthouse',
      bedrooms: 4,
      bathrooms: 3,
      savedDate: '1 day ago'
    },
    {
      id: 5,
      title: 'Duplex in Lavington',
      price: '$750,000',
      location: 'Lavington, Nairobi',
      type: 'Duplex',
      bedrooms: 3,
      bathrooms: 2,
      savedDate: '4 days ago'
    }
  ];

  const notifications = [
    {
      id: 1,
      title: 'Price Drop Alert',
      message: 'Luxury Apartment in Westlands price reduced by $50,000',
      time: '2 hours ago',
      type: 'price_drop',
      propertyId: 1
    },
    {
      id: 2,
      title: 'New Property Match',
      message: '3 new properties match your search criteria',
      time: '5 hours ago',
      type: 'new_match',
      propertyId: null
    },
    {
      id: 3,
      title: 'Viewing Scheduled',
      message: 'Your viewing for Modern Villa in Karen is confirmed for tomorrow',
      time: '1 day ago',
      type: 'viewing',
      propertyId: 2
    },
    {
      id: 4,
      title: 'Market Update',
      message: 'Property prices in Westlands increased by 5% this month',
      time: '2 days ago',
      type: 'market_update',
      propertyId: null
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
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}! 🏠</h2>
        <p className="text-gray-600">
          Discover your next dream property and manage your favorites and saved properties.
        </p>
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
        {/* Favorite Properties */}
        <motion.div
          className={`p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-4">Favorite Properties</h3>
          <div className="space-y-4">
            {favoriteProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{property.title}</h4>
                    <div className="flex gap-2">
                      <button className={`p-1 rounded ${property.isFavorite ? 'text-red-500' : 'text-gray-400'}`}>
                        <Heart size={16} fill={property.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <button className={`p-1 rounded ${property.isSaved ? 'text-purple-500' : 'text-gray-400'}`}>
                        <Bookmark size={16} fill={property.isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mb-1">{property.location}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {property.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      {property.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Added {property.addedDate}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Saved Properties */}
        <motion.div
          className={`p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-4">Saved Properties</h3>
          <div className="space-y-4">
            {savedProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{property.title}</h4>
                  <p className="text-gray-500 text-xs mb-1">{property.location}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {property.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      {property.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Saved {property.savedDate}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Notifications */}
      <motion.div
        className={`p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold mb-4">Recent Notifications</h3>
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                notification.type === 'price_drop' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300' :
                notification.type === 'new_match' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' :
                notification.type === 'viewing' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300' :
                'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300'
              }`}>
                <Bell size={14} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-xs text-gray-500">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
            <Search className="w-5 h-5 text-[#C7A667]" />
            <span>Search Properties</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart className="w-5 h-5 text-[#C7A667]" />
            <span>View Favorites</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="w-5 h-5 text-[#C7A667]" />
            <span>Contact Agent</span>
          </motion.button>
          <motion.button
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-white/20 hover:border-[#C7A667] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Bell className="w-5 h-5 text-[#C7A667]" />
            <span>Notifications</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
