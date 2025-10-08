import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { scheduledVisitsService, ScheduledVisit } from '../services/scheduledVisitsService';

interface ScheduledVisitsProps {
  isDarkMode: boolean;
}

export default function ScheduledVisits({ isDarkMode }: ScheduledVisitsProps) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const loadScheduledVisits = async () => {
      if (!user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { visits: fetchedVisits, error: fetchError } = await scheduledVisitsService.getDeveloperScheduledVisits(user.id);
        
        if (fetchError) {
          setError(fetchError);
        } else {
          setVisits(fetchedVisits);
        }
      } catch (err) {
        console.error('Error loading scheduled visits:', err);
        setError('Failed to load scheduled visits');
      } finally {
        setIsLoading(false);
      }
    };

    loadScheduledVisits();
  }, [user]);

  const handleStatusUpdate = async (visitId: string, newStatus: 'scheduled' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await scheduledVisitsService.updateVisitStatus(visitId, newStatus);
      
      if (error) {
        console.error('Error updating visit status:', error);
        return;
      }
      
      // Update local state
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === visitId ? { ...visit, status: newStatus } : visit
        )
      );
    } catch (err) {
      console.error('Error updating visit status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredVisits = selectedStatus === 'all' 
    ? visits 
    : visits.filter(visit => visit.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7A667] mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Loading scheduled visits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error Loading Visits</h3>
        <p className={`mb-4 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#C7A667] text-black rounded-lg hover:bg-[#B89657] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scheduled Visits</h1>
          <p className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Manage property visit requests from potential buyers</p>
        </div>
        
        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-[#C7A667] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{visits.length}</div>
          <div className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Total Visits</div>
        </div>
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-2xl font-bold text-blue-600">
            {visits.filter(v => v.status === 'scheduled').length}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Scheduled</div>
        </div>
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-2xl font-bold text-green-600">
            {visits.filter(v => v.status === 'confirmed').length}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Confirmed</div>
        </div>
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-2xl font-bold text-gray-600">
            {visits.filter(v => v.status === 'completed').length}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Completed</div>
        </div>
          </div>
          
      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Visits Found</h3>
          <p className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {selectedStatus === 'all' 
              ? "No visit requests have been scheduled yet."
              : `No visits with status "${selectedStatus}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisits.map((visit) => (
          <motion.div
              key={visit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-6 hover:shadow-md transition-shadow ${
                isDarkMode 
                  ? 'bg-[#0E0E10] border-white/10 hover:bg-white/5' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Property Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {visit.property?.images && visit.property.images.length > 0 && (
                      <img
                        src={visit.property.images[0]}
                        alt={visit.property.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {visit.property?.title || 'Property'}
                      </h3>
                      <p className={`mb-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        {visit.property?.location || 'Location not specified'}
                      </p>
                      <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        <span>📅 {formatDate(visit.scheduledDate)}</span>
                        <span>🕐 {formatTime(visit.scheduledTime)}</span>
                      </div>
                    </div>
                  </div>
              </div>

                {/* Buyer Info */}
                <div className="lg:w-64">
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Details</h4>
                  <div className="space-y-1 text-sm">
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {visit.buyer ? `${visit.buyer.firstName} ${visit.buyer.lastName}` : 'Unknown Buyer'}
                    </p>
                    <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>{visit.buyer?.email || 'No email'}</p>
                    {visit.buyer?.phone && (
                      <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>{visit.buyer.phone}</p>
                    )}
              </div>
            </div>

                {/* Status and Actions */}
                <div className="lg:w-48">
                  <div className="flex flex-col gap-3">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
                      {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
      </div>

                    {visit.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(visit.id, 'confirmed')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(visit.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {visit.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(visit.id, 'completed')}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
          </div>

              {/* Message */}
              {visit.message && (
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    <span className="font-medium">Message:</span> {visit.message}
                  </p>
                </div>
              )}
        </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}