import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { campaignsService } from '../../services/campaignsService';
import { formatKES } from '../../utils/currency';
import { supabase } from '../../lib/supabase';

interface Campaign {
  id: string;
  user_id: string;
  campaign_name: string;
  target_location: string[];
  target_age_group: string;
  duration_start: string;
  duration_end: string;
  audience_interests: string[];
  user_budget: number;
  ad_spend: number;
  platform_fee: number;
  total_paid: number;
  status: 'active' | 'pending' | 'failed' | 'completed';
  payment_status?: 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'cancelled';
  payment_id?: string;
  google_ads_campaign_id?: string;
  property_ids: string[];
  platforms: string[];
  created_at: string;
  updated_at: string;
}

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'failed'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const { campaigns, error } = await campaignsService.getAllCampaignsForAdmin();
      if (error) {
        console.error('Error loading campaigns:', error);
      } else {
        setCampaigns(campaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadCampaigns();

    // Set up Realtime subscription for campaign updates
    const channel = supabase
      .channel('admin-campaigns')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
        },
        (payload) => {
          console.log('Campaign updated via Realtime:', payload);
          
          // Update the campaign in the local state
          setCampaigns((prevCampaigns) => {
            const updatedCampaign = payload.new as Campaign;
            const existingIndex = prevCampaigns.findIndex((c) => c.id === updatedCampaign.id);
            
            if (existingIndex >= 0) {
              // Update existing campaign
              const updated = [...prevCampaigns];
              updated[existingIndex] = {
                ...updated[existingIndex],
                ...updatedCampaign,
                payment_status: updatedCampaign.payment_status || 'pending',
                target_location: Array.isArray(updatedCampaign.target_location) 
                  ? updatedCampaign.target_location 
                  : [updatedCampaign.target_location],
                audience_interests: Array.isArray(updatedCampaign.audience_interests) 
                  ? updatedCampaign.audience_interests 
                  : [],
                platforms: Array.isArray(updatedCampaign.platforms) 
                  ? updatedCampaign.platforms 
                  : [],
                property_ids: Array.isArray(updatedCampaign.property_ids) 
                  ? updatedCampaign.property_ids 
                  : [],
              };
              return updated;
            } else {
              // Campaign not in list, reload to get it with full data
              loadCampaigns();
              return prevCampaigns;
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaigns',
        },
        (payload) => {
          console.log('New campaign created via Realtime:', payload);
          
          // Add new campaign to the local state
          setCampaigns((prevCampaigns) => {
            const newCampaign = payload.new as Campaign;
            // Check if it already exists (shouldn't, but be safe)
            if (prevCampaigns.find((c) => c.id === newCampaign.id)) {
              return prevCampaigns;
            }
            // Add to the beginning of the list with proper array handling
            return [{
              ...newCampaign,
              payment_status: newCampaign.payment_status || 'pending',
              target_location: Array.isArray(newCampaign.target_location) 
                ? newCampaign.target_location 
                : [newCampaign.target_location],
              audience_interests: Array.isArray(newCampaign.audience_interests) 
                ? newCampaign.audience_interests 
                : [],
              platforms: Array.isArray(newCampaign.platforms) 
                ? newCampaign.platforms 
                : [],
              property_ids: Array.isArray(newCampaign.property_ids) 
                ? newCampaign.property_ids 
                : [],
            }, ...prevCampaigns];
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (campaignId: string) => {
    setProcessing(campaignId);
    try {
      const { error } = await campaignsService.approveCampaign(campaignId);
      if (error) {
        alert(`Failed to approve campaign: ${error}`);
      } else {
        alert('Campaign approved successfully!');
        // Campaign will be updated via Realtime, but refresh to ensure we have latest data
        await loadCampaigns();
        setShowDetails(false);
        setSelectedCampaign(null);
      }
    } catch (error) {
      alert('An error occurred while approving the campaign');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (campaignId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    setProcessing(campaignId);
    try {
      const { error } = await campaignsService.rejectCampaign(campaignId, reason || undefined);
      if (error) {
        alert(`Failed to reject campaign: ${error}`);
      } else {
        alert('Campaign rejected successfully!');
        // Campaign will be updated via Realtime, but refresh to ensure we have latest data
        await loadCampaigns();
        setShowDetails(false);
        setSelectedCampaign(null);
      }
    } catch (error) {
      alert('An error occurred while rejecting the campaign');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30';
      case 'pending': return 'text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30';
      case 'failed': return 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30';
      case 'completed': return 'text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.status === filter;
  });

  const pendingCount = campaigns.filter(c => c.status === 'pending').length;
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const failedCount = campaigns.filter(c => c.status === 'failed').length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7A667]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 px-1 sm:px-0">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Campaign Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Review and approve advertising campaigns from developers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{failedCount}</p>
              </div>
            </div>
          </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-2 sm:gap-4 px-2 sm:px-4 md:px-6 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All Campaigns', count: campaigns.length },
              { key: 'pending', label: 'Pending Review', count: pendingCount },
              { key: 'active', label: 'Active', count: activeCount },
              { key: 'failed', label: 'Rejected', count: failedCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  filter === tab.key
                    ? 'border-[#C7A667] text-[#C7A667]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span> ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredCampaigns.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No campaigns found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCampaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  className="p-3 sm:p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                          {campaign.campaign_name}
                        </h3>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${getStatusColor(campaign.status)}`}>
                          {campaign.status === 'pending' ? 'Pending Approval' : campaign.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <div className="break-words">
                          <span className="font-medium">Budget:</span> <span className="block sm:inline">{formatKES(campaign.user_budget)}</span>
                        </div>
                        <div className="break-words">
                          <span className="font-medium">Duration:</span> <span className="block sm:inline text-xs">{new Date(campaign.duration_start).toLocaleDateString()} - {new Date(campaign.duration_end).toLocaleDateString()}</span>
                        </div>
                        <div className="break-words">
                          <span className="font-medium">Platforms:</span> <span className="block sm:inline break-words">{campaign.platforms.join(', ')}</span>
                        </div>
                        <div className="break-words">
                          <span className="font-medium">Payment:</span> <span className={`block sm:inline font-semibold ${campaign.payment_status === 'success' ? 'text-green-600 dark:text-green-400' : campaign.payment_status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {campaign.payment_status === 'success' ? 'Paid' : campaign.payment_status === 'failed' ? 'Failed' : campaign.payment_status === 'processing' ? 'Processing' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowDetails(true);
                        }}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors whitespace-nowrap"
                      >
                        View Details
                      </button>
                      
                      {campaign.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(campaign.id)}
                            disabled={processing === campaign.id}
                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap"
                          >
                            {processing === campaign.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(campaign.id)}
                            disabled={processing === campaign.id}
                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap"
                          >
                            {processing === campaign.id ? 'Rejecting...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      {/* Campaign Details Modal */}
      {showDetails && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Campaign Details
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedCampaign(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campaign Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCampaign.campaign_name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                      {selectedCampaign.status === 'pending' ? 'Pending Approval' : selectedCampaign.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Status
                    </label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedCampaign.payment_status === 'success' 
                        ? 'text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30'
                        : selectedCampaign.payment_status === 'failed'
                        ? 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30'
                        : selectedCampaign.payment_status === 'processing'
                        ? 'text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30'
                        : 'text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      {selectedCampaign.payment_status === 'success' ? 'Paid' : selectedCampaign.payment_status === 'failed' ? 'Payment Failed' : selectedCampaign.payment_status === 'processing' ? 'Processing' : selectedCampaign.payment_status || 'Payment Pending'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Budget
                    </label>
                    <p className="text-gray-900 dark:text-white">{formatKES(selectedCampaign.user_budget)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Locations
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCampaign.target_location.join(', ')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Age Group
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCampaign.target_age_group}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platforms
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCampaign.platforms.join(', ')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Audience Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.audience_interests.map((interest, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campaign Duration
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedCampaign.duration_start).toLocaleDateString()} - {new Date(selectedCampaign.duration_end).toLocaleDateString()}
                    </p>
                  </div>

                  {selectedCampaign.google_ads_campaign_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Google Ads Campaign ID
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedCampaign.google_ads_campaign_id}</p>
                    </div>
                  )}
                </div>

                {selectedCampaign.status === 'pending' && (
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleApprove(selectedCampaign.id)}
                      disabled={processing === selectedCampaign.id}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {processing === selectedCampaign.id ? 'Approving...' : 'Approve Campaign'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedCampaign.id)}
                      disabled={processing === selectedCampaign.id}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {processing === selectedCampaign.id ? 'Rejecting...' : 'Reject Campaign'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
    </div>
  );
}
