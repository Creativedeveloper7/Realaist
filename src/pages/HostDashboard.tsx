import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bed, MessageSquare, Plus, MapPin, DollarSign, ExternalLink, Home, Megaphone } from 'lucide-react';
import { propertiesService, Property } from '../services/propertiesService';

interface HostDashboardProps {
  isDarkMode: boolean;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shortStays, setShortStays] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const { properties, error } = await propertiesService.getDeveloperProperties(user.id);
        if (!error) {
          const short = properties.filter((p) => p.propertyType === 'Short Stay');
          setShortStays(short);
        }
      } catch (e) {
        console.error('Error loading short stays:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    const handler = (e: { detail?: { property?: Property } }) => {
      const created = e?.detail?.property;
      if (!created || !user?.id || created.developerId !== user.id) return;
      if (created.propertyType === 'Short Stay') {
        setShortStays((prev) => {
          if (prev.some((p) => p.id === created.id)) return prev;
          return [{ ...created, propertyType: 'Short Stay' }, ...prev];
        });
      }
    };
    window.addEventListener('realaist:property-created', handler as EventListener);
    return () => window.removeEventListener('realaist:property-created', handler as EventListener);
  }, [user?.id]);

  useEffect(() => {
    const handler = (e: { detail?: { id?: string } }) => {
      const id = e?.detail?.id;
      if (id) setShortStays((prev) => prev.filter((p) => p.id !== id));
    };
    window.addEventListener('realaist:property-deleted', handler as EventListener);
    return () => window.removeEventListener('realaist:property-deleted', handler as EventListener);
  }, []);

  const activeCount = shortStays.filter((p) => p.status === 'active').length;

  return (
    <div className="space-y-6 pb-6 overflow-x-hidden">
      <motion.div
        className={isDarkMode ? 'p-6 rounded-2xl bg-[#0E0E10] border border-white/10' : 'p-6 rounded-2xl bg-white border border-gray-200'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome, {user?.firstName}</h2>
            <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
              Manage your short stay listings and guest messages in one place.
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/dashboard/short-stays')}
            className="px-6 py-3 bg-[#C7A667] text-black rounded-lg font-medium flex items-center gap-2 shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Add Short Stay
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.button
          onClick={() => navigate('/dashboard/short-stays')}
          className={isDarkMode ? 'p-6 rounded-2xl text-left bg-[#0E0E10] border border-white/10 hover:border-[#C7A667]/50' : 'p-6 rounded-2xl text-left bg-white border border-gray-200 hover:border-[#C7A667]/50'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={isDarkMode ? 'p-3 rounded-lg bg-white/10' : 'p-3 rounded-lg bg-amber-500/10'}>
              <Bed className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-sm font-medium text-[#C7A667]">View all</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{isLoading ? '...' : shortStays.length}</h3>
          <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>Short stays ({activeCount} active)</p>
        </motion.button>

        <motion.button
          onClick={() => navigate('/dashboard/messages')}
          className={isDarkMode ? 'p-6 rounded-2xl text-left bg-[#0E0E10] border border-white/10 hover:border-[#C7A667]/50' : 'p-6 rounded-2xl text-left bg-white border border-gray-200 hover:border-[#C7A667]/50'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={isDarkMode ? 'p-3 rounded-lg bg-white/10' : 'p-3 rounded-lg bg-purple-500/10'}>
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            {messageCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">{messageCount}</span>
            )}
          </div>
          <h3 className="text-2xl font-bold mb-1">{messageCount}</h3>
          <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>Guest messages</p>
        </motion.button>

        <motion.button
          onClick={() => navigate('/dashboard/campaign-ads')}
          className={isDarkMode ? 'p-6 rounded-2xl text-left bg-[#0E0E10] border border-white/10 hover:border-[#C7A667]/50' : 'p-6 rounded-2xl text-left bg-white border border-gray-200 hover:border-[#C7A667]/50'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={isDarkMode ? 'p-3 rounded-lg bg-white/10' : 'p-3 rounded-lg bg-blue-500/10'}>
              <Megaphone className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-[#C7A667]">Manage</span>
          </div>
          <h3 className="text-2xl font-bold mb-1">Campaign Ads</h3>
          <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>Promote your short stays with ads</p>
        </motion.button>
      </div>

      <motion.div
        className={isDarkMode ? 'p-6 rounded-2xl bg-[#0E0E10] border border-white/10' : 'p-6 rounded-2xl bg-white border border-gray-200'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">My Short Stays</h3>
          <button onClick={() => navigate('/dashboard/short-stays')} className="text-[#C7A667] text-sm font-medium hover:underline">Add new</button>
        </div>
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#C7A667] border-t-transparent mx-auto" />
            <p className={isDarkMode ? 'text-white/60 mt-2' : 'text-gray-500 mt-2'}>Loading...</p>
          </div>
        ) : shortStays.length === 0 ? (
          <div className="text-center py-10">
            <Home className={isDarkMode ? 'mx-auto mb-4 text-white/40' : 'mx-auto mb-4 text-gray-400'} size={48} />
            <h4 className="text-lg font-medium mb-2">No short stays yet</h4>
            <p className={isDarkMode ? 'text-white/60 mb-4' : 'text-gray-500 mb-4'}>List your first short stay to start receiving bookings and messages.</p>
            <motion.button
              onClick={() => navigate('/dashboard/short-stays')}
              className="px-5 py-2.5 bg-[#C7A667] text-black rounded-lg font-medium inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Add your first short stay
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {shortStays.slice(0, 5).map((property) => (
              <div
                key={property.id}
                className={isDarkMode ? 'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/5' : 'flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50'}
              >
                <div className="w-full sm:w-24 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  {property.images?.[0] ? (
                    <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bed className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{property.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin size={14} />
                    <span className="truncate">{property.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <DollarSign size={14} />
                    <span>{property.price} / night</span>
                    <span className={property.status === 'active' ? 'text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-600' : 'text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-600'}>{property.status}</span>
                  </div>
                </div>
                <a href={`/property/${property.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#C7A667] hover:underline shrink-0">
                  View listing
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
            {shortStays.length > 5 && (
              <button onClick={() => navigate('/dashboard/short-stays')} className="w-full py-2 text-[#C7A667] text-sm font-medium hover:underline">
                View all {shortStays.length} short stays →
              </button>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        className={isDarkMode ? 'p-6 rounded-2xl bg-[#0E0E10] border border-white/10' : 'p-6 rounded-2xl bg-white border border-gray-200'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={isDarkMode ? 'p-3 rounded-lg bg-white/10' : 'p-3 rounded-lg bg-purple-500/10'}>
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Guest messages</h3>
              <p className={isDarkMode ? 'text-sm text-white/60' : 'text-sm text-gray-500'}>See and reply to messages from guests about your short stays</p>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/dashboard/messages')}
            className="px-4 py-2 rounded-lg border border-[#C7A667] text-[#C7A667] font-medium hover:bg-[#C7A667]/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Open messages
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
