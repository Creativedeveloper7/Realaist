import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
  id: string;
  title: string;
  location: string;
  price?: number;
  images?: string[];
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

interface PropertySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  selectedProperties: Property[];
  onSelectionChange: (selectedProperties: Property[]) => void;
  loading?: boolean;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  isOpen,
  onClose,
  properties,
  selectedProperties,
  onSelectionChange,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [selectAll, setSelectAll] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter properties based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  }, [searchQuery, properties]);

  // Update select all state
  useEffect(() => {
    setSelectAll(selectedProperties.length === properties.length && properties.length > 0);
  }, [selectedProperties.length, properties.length]);

  // Handle individual property selection
  const handlePropertyToggle = (property: Property) => {
    const isSelected = selectedProperties.some(p => p.id === property.id);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedProperties.filter(p => p.id !== property.id);
    } else {
      newSelection = [...selectedProperties, property];
    }
    
    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...properties]);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-[#0E0E10] border border-gray-200 dark:border-white/10 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-[#C7A667] to-yellow-600 rounded-lg">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Properties</h2>
                    <p className="text-gray-600 dark:text-gray-400">Choose which properties to include in your campaign</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search and Controls */}
            <div className="p-6 border-b border-gray-200 dark:border-white/10">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                      selectAll
                        ? 'bg-[#C7A667] text-black border-[#C7A667]'
                        : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/20 hover:border-[#C7A667]'
                    }`}
                  >
                    {selectAll ? 'Deselect All' : 'Select All'} ({properties.length})
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProperties.length} of {properties.length} selected
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7A667]"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading properties...</p>
                  </div>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No properties found' : 'No properties available'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Try adjusting your search terms' : 'Upload properties first to use them in campaigns'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProperties.map((property) => {
                    const isSelected = selectedProperties.some(p => p.id === property.id);
                    return (
                      <motion.div
                        key={property.id}
                        className={`relative p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-[#C7A667] bg-[#C7A667]/10 dark:bg-[#C7A667]/20'
                            : 'border-gray-200 dark:border-white/20 hover:border-[#C7A667] dark:hover:border-[#C7A667]'
                        }`}
                        onClick={() => handlePropertyToggle(property)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Selection Indicator */}
                        <div className="absolute top-3 right-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#C7A667] border-[#C7A667]'
                              : 'border-gray-300 dark:border-white/40'
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Property Image */}
                        <div className="w-full h-32 bg-gray-100 dark:bg-white/10 rounded-lg mb-3 overflow-hidden">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                            {property.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {property.location}
                          </p>
                          <p className="text-sm font-semibold text-[#C7A667]">
                            {formatPrice(property.price)}
                          </p>
                          
                          {/* Property Features */}
                          {(property.bedrooms || property.bathrooms || property.area) && (
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              {property.bedrooms && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                  </svg>
                                  {property.bedrooms}
                                </span>
                              )}
                              {property.bathrooms && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                  </svg>
                                  {property.bathrooms}
                                </span>
                              )}
                              {property.area && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                  </svg>
                                  {property.area} sq ft
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'} selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[#C7A667] text-black font-semibold rounded-lg hover:bg-[#B8965A] transition-colors"
                  >
                    Done ({selectedProperties.length})
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
