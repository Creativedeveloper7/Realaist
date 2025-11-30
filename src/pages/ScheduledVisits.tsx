import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { scheduledVisitsService, ScheduledVisit } from '../services/scheduledVisitsService';
import { propertiesService, Property } from '../services/propertiesService';

interface ScheduledVisitsProps {
  isDarkMode: boolean;
}

export default function ScheduledVisits({ isDarkMode }: ScheduledVisitsProps) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    propertyId: '',
  });

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

  const handleCreateVisit = async () => {
    if (!user?.id) {
      alert('You must be logged in as a developer to schedule a visit.');
      return;
    }

    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.propertyId) {
      alert('Please fill in client name, phone, date, and select a property.');
      return;
    }

    const scheduledTime = form.time || '10:00';

    try {
      setCreating(true);
      const { visit, error: createError } = await scheduledVisitsService.createScheduledVisit({
        propertyId: form.propertyId,
        scheduledDate: form.date,
        scheduledTime,
        message: `Manual visit scheduled by developer.\nClient Name: ${form.name}\nClient Phone: ${form.phone}`,
        visitorName: form.name,
        visitorEmail: user.email || 'manual-visit@realaist.com',
      });

      if (createError) {
        alert(createError);
        return;
      }

      if (visit) {
        setVisits((prev) => [visit, ...prev]);
      }

      setForm({ name: '', phone: '', date: '', time: '', propertyId: '' });
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Error creating scheduled visit:', err);
      alert(err?.message || 'Failed to create scheduled visit');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const loadProperties = async () => {
      if (!user?.id) return;
      setIsLoadingProperties(true);
      try {
        const { properties: fetchedProperties, error } = await propertiesService.getDeveloperProperties(user.id);
        if (!error && fetchedProperties) {
          setProperties(fetchedProperties);
        }
      } catch (err) {
        console.error('Error loading developer properties for visits form:', err);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    loadProperties();
  }, [user?.id]);

  const handleStatusUpdate = async (visitId: string, newStatus: 'scheduled' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const { error } = await scheduledVisitsService.updateVisitStatus(visitId, newStatus);

      if (error) {
        console.error('Error updating visit status:', error);
        return;
      }

      // Update local state
      setVisits((prevVisits) =>
        prevVisits.map((visit) => (visit.id === visitId ? { ...visit, status: newStatus } : visit))
      );
    } catch (err) {
      console.error('Error updating visit status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const extractClientFromMessage = (message?: string) => {
    if (!message) return null;
    const nameMatch = message.match(/Client Name:\s*(.+)/i);
    const phoneMatch = message.match(/Client Phone:\s*(.+)/i);
    const name = nameMatch?.[1]?.trim();
    const phone = phoneMatch?.[1]?.trim();
    if (!name && !phone) return null;
    return { name, phone };
  };

  const openWhatsAppForVisit = (phone: string, visit: ScheduledVisit) => {
    if (!phone) return;
    // Strip non-digits
    let digits = phone.replace(/\D/g, '');
    if (!digits) return;

    // Basic normalization for Kenyan-style numbers
    // 07xx...  -> 2547xx...
    // 7xx...   -> 2547xx...
    // 2547xx.. -> keep
    if (digits.startsWith('0') && digits.length >= 10) {
      // drop leading 0, prepend 254
      digits = '254' + digits.slice(1);
    } else if (digits.startsWith('7') && digits.length === 9) {
      // local 7xx...
      digits = '254' + digits;
    }

    const dateText = formatDate(visit.scheduledDate);
    const timeText = formatTime(visit.scheduledTime);
    const propertyTitle = visit.property?.title || 'your property';
    const manualClient = extractClientFromMessage(visit.message);
    const clientName = manualClient?.name || (visit.buyer ? `${visit.buyer.firstName} ${visit.buyer.lastName}` : 'your client');
    const text = `Scheduled visit approved for ${clientName} at ${propertyTitle} on ${dateText} at ${timeText}.`;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredVisits = selectedStatus === 'all' ? visits : visits.filter((visit) => visit.status === selectedStatus);

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
    <div className="space-y-4 sm:space-y-6 pb-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Client Data</h1>
          <p className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Manage property visit requests from potential buyers</p>
        </div>

        {/* Actions + Status Filter */}
        <div className="flex flex-col items-end gap-2">
          <motion.button
            className="px-4 py-2 rounded-lg bg-[#C7A667] text-black text-sm font-semibold shadow hover:bg-[#B89657] transition-colors"
            onClick={() => setShowCreateForm((prev) => !prev)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {showCreateForm ? 'Close Form' : 'Schedule Visit'}
          </motion.button>

          <div className="flex flex-wrap gap-2 justify-end">
            {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
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
      </div>

      {/* Manual Schedule Form */}
      {showCreateForm && (
        <div
          className={`border rounded-lg p-4 sm:p-6 ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'} space-y-4`}
        >
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Schedule a Visit Manually</h2>
          <p className={`${isDarkMode ? 'text-white/70' : 'text-gray-600'} text-sm`}>
            Add a client visit directly to your schedule. These visits will appear together with other scheduled visits below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}
              >
                Client Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}
              >
                Client Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="e.g. 0712 345 678"
              />
            </div>
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}
              >
                Visit Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}
              >
                Visit Time (optional)
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}
              >
                Property
              </label>
              <select
                value={form.propertyId}
                onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-black/40 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                disabled={isLoadingProperties}
              >
                <option value="">{isLoadingProperties ? 'Loading your properties...' : 'Select a property'}</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.location ? `- ${p.location}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className={`px-4 py-2 rounded-lg border text-sm ${isDarkMode ? 'border-white/20 text-white/80 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <motion.button
              type="button"
              onClick={handleCreateVisit}
              disabled={creating}
              className="px-5 py-2 rounded-lg bg-[#C7A667] text-black text-sm font-semibold shadow hover:bg-[#B89657] disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={{ scale: creating ? 1 : 1.02 }}
              whileTap={{ scale: creating ? 1 : 0.98 }}
            >
              {creating ? 'Scheduling...' : 'Save Visit'}
            </motion.button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className={`p-3 sm:p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{visits.length}</div>
          <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Total Visits</div>
        </div>
        <div className={`p-3 sm:p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {visits.filter(v => v.status === 'scheduled').length}
          </div>
          <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Scheduled</div>
        </div>
        <div className={`p-3 sm:p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {visits.filter(v => v.status === 'confirmed').length}
          </div>
          <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Confirmed</div>
        </div>
        <div className={`p-3 sm:p-4 rounded-lg border ${isDarkMode ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-xl sm:text-2xl font-bold text-gray-600">
            {visits.filter(v => v.status === 'completed').length}
          </div>
          <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>Completed</div>
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
              className={`rounded-lg border p-3 sm:p-6 hover:shadow-md transition-shadow ${
                isDarkMode 
                  ? 'bg-[#0E0E10] border-white/10 hover:bg-white/5' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex flex-col gap-4">
                {/* Property Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {visit.property?.images && visit.property.images.length > 0 && (
                      <img
                        src={visit.property.images[0]}
                        alt={visit.property.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {visit.property?.title || 'Property'}
                      </h3>
                      <p className={`mb-2 text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'} truncate`}>
                        {visit.property?.location || 'Location not specified'}
                      </p>
                      <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        <span className="whitespace-nowrap">📅 {formatDate(visit.scheduledDate)}</span>
                        <span className="whitespace-nowrap">🕐 {formatTime(visit.scheduledTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer Info and Actions Row */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-t pt-4 border-gray-200 dark:border-white/10">
                  {/* Buyer / Client Info */}
                  {(() => {
                    const manualClient = extractClientFromMessage(visit.message);
                    const displayName = manualClient?.name || (visit.buyer ? `${visit.buyer.firstName} ${visit.buyer.lastName}` : 'Unknown Client');
                    const displayPhone = manualClient?.phone || visit.buyer?.phone;
                    const displayEmail = visit.buyer?.email || 'No email';

                    return (
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium mb-2 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Contact Details
                        </h4>
                        <div className="space-y-1 text-xs sm:text-sm">
                          <p className={`truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {displayName}
                          </p>
                          <p className={`truncate ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{displayEmail}</p>
                          {displayPhone && (
                            <div className="flex items-center gap-2">
                              <p className={`truncate ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{displayPhone}</p>
                              <button
                                type="button"
                                onClick={() => openWhatsAppForVisit(displayPhone, visit)}
                                className="inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs bg-green-500 text-white hover:bg-green-600 transition-colors"
                              >
                                <span className="hidden sm:inline">WhatsApp</span>
                                <span className="sm:hidden">WA</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Status and Actions */}
                  <div className="flex-shrink-0">
                    <div className="flex flex-col gap-3">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit ${getStatusColor(visit.status)}`}>
                        {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                      </div>

                      {visit.status === 'scheduled' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleStatusUpdate(visit.id, 'confirmed')}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(visit.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      {visit.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(visit.id, 'completed')}
                          className="px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors whitespace-nowrap w-full sm:w-auto"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
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