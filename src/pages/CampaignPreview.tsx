import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { campaignsService, Campaign } from '../services/campaignsService';
import { propertiesService, Property } from '../services/propertiesService';

export const CampaignPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign_id');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!campaignId) {
        setError('Missing campaign_id in URL');
        setLoading(false);
        return;
      }

      try {
        const { campaign, error } = await campaignsService.getCampaignById(campaignId);
        if (error || !campaign) {
          setError(error || 'Campaign not found');
          setLoading(false);
          return;
        }

        setCampaign(campaign);

        const firstPropertyId = campaign.property_ids?.[0];
        if (!firstPropertyId) {
          setError('This campaign has no linked properties to preview');
          setLoading(false);
          return;
        }

        const { property, error: propError } = await propertiesService.getPropertyById(firstPropertyId);
        if (propError || !property) {
          setError(propError || 'Linked property not found');
          setLoading(false);
          return;
        }

        setProperty(property);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load campaign preview');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [campaignId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Campaign Ad Preview</h1>
            <p className="text-gray-600 text-sm">This is how buyers will see your promoted property.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Preview Mode
          </span>
        </div>

        {loading && (
          <div className="p-8 bg-white rounded-2xl shadow border border-gray-200 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C7A667] mx-auto mb-4" />
            <p className="text-gray-600">Loading campaign preview...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-8 bg-white rounded-2xl shadow border border-red-200 text-center">
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <p className="text-gray-500 text-sm">Check that the campaign exists and has at least one property linked.</p>
          </div>
        )}

        {!loading && !error && campaign && property && (
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gray-900 text-white px-4 py-2 text-xs font-medium flex justify-between items-center">
              <span>Sponsored Listing Preview</span>
              <span className="text-gray-300">Campaign: {campaign.campaign_name}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-64 md:h-full bg-gray-100">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No image available
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">{property.title}</h2>
                  <p className="text-sm text-gray-500 mb-3">{property.location}</p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{property.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {property.bedrooms !== undefined && (
                      <span>{property.bedrooms} beds</span>
                    )}
                    {property.bathrooms !== undefined && (
                      <span>{property.bathrooms} baths</span>
                    )}
                    {property.squareFeet !== undefined && (
                      <span>{property.squareFeet} sq ft</span>
                    )}
                    {property.propertyType && (
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {property.propertyType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Price</div>
                    <div className="text-2xl font-bold text-[#C7A667]">
                      KSh {property.price.toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-[#C7A667] text-black text-sm font-semibold shadow hover:bg-[#b4944f]"
                    disabled
                  >
                    View Details (Preview)
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
