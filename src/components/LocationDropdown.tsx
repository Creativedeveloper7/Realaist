import React, { useState, useRef, useEffect } from 'react';
import { Location, searchLocations, getLocationDisplayName } from '../data/locations';

interface LocationDropdownProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({
  value,
  onChange,
  placeholder = "Search for a location...",
  className = "",
  disabled = false,
  multiple = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize selected locations from value prop
  useEffect(() => {
    if (multiple && Array.isArray(value)) {
      // Convert string array back to Location objects
      const locations = value.map(locationString => {
        // Find the location in our data
        const found = searchLocations(locationString).find(loc => 
          getLocationDisplayName(loc) === locationString
        );
        return found || { 
          id: locationString, 
          name: locationString, 
          type: 'city' as const, 
          searchTerms: [locationString.toLowerCase()] 
        };
      });
      setSelectedLocations(locations);
    } else if (!multiple && typeof value === 'string') {
      setSearchQuery(value);
    }
  }, [value, multiple]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = searchLocations(query);
      // Filter out already selected locations in multiple mode
      const filteredResults = multiple 
        ? results.filter(loc => !selectedLocations.some(selected => selected.id === loc.id))
        : results;
      setSuggestions(filteredResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  // Handle selection
  const handleSelect = (location: Location) => {
    if (multiple) {
      // Add to selected locations if not already selected
      if (!selectedLocations.some(selected => selected.id === location.id)) {
        const newSelectedLocations = [...selectedLocations, location];
        setSelectedLocations(newSelectedLocations);
        const displayNames = newSelectedLocations.map(loc => getLocationDisplayName(loc));
        onChange(displayNames);
      }
      setSearchQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    } else {
      const displayName = getLocationDisplayName(location);
      setSearchQuery(displayName);
      onChange(displayName);
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Handle tag removal
  const handleRemoveTag = (locationToRemove: Location) => {
    const newSelectedLocations = selectedLocations.filter(loc => loc.id !== locationToRemove.id);
    setSelectedLocations(newSelectedLocations);
    const displayNames = newSelectedLocations.map(loc => getLocationDisplayName(loc));
    onChange(displayNames);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle backspace to remove last tag when input is empty
    if (e.key === 'Backspace' && multiple && searchQuery === '' && selectedLocations.length > 0) {
      e.preventDefault();
      handleRemoveTag(selectedLocations[selectedLocations.length - 1]);
      return;
    }

    // Handle comma to add current search as a custom location
    if (e.key === ',' && multiple && searchQuery.trim()) {
      e.preventDefault();
      const customLocation: Location = {
        id: `custom-${Date.now()}`,
        name: searchQuery.trim(),
        type: 'city',
        searchTerms: [searchQuery.toLowerCase()]
      };
      handleSelect(customLocation);
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        } else if (multiple && searchQuery.trim()) {
          // Add custom location on enter if no suggestion is selected
          const customLocation: Location = {
            id: `custom-${Date.now()}`,
            name: searchQuery.trim(),
            type: 'city',
            searchTerms: [searchQuery.toLowerCase()]
          };
          handleSelect(customLocation);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocationIcon = (location: Location) => {
    switch (location.type) {
      case 'country':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'region':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'city':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getLocationTypeLabel = (location: Location) => {
    switch (location.type) {
      case 'country':
        return 'Country';
      case 'region':
        return 'Region';
      case 'city':
        return 'City';
      default:
        return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tags Container */}
      {multiple && selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLocations.map((location) => (
            <div
              key={location.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#C7A667]/20 dark:bg-[#C7A667]/30 text-[#C7A667] dark:text-[#C7A667] rounded-full text-sm border border-[#C7A667]/30"
            >
              {getLocationIcon(location)}
              <span className="truncate max-w-[200px]">
                {getLocationDisplayName(location)}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveTag(location)}
                className="ml-1 hover:bg-[#C7A667]/20 rounded-full p-0.5 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={multiple && selectedLocations.length > 0 ? "Add more locations..." : placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors ${className}`}
        />
        {searchQuery && !multiple && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0E0E10] border border-gray-200 dark:border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((location, index) => (
            <div
              key={location.id}
              onClick={() => handleSelect(location)}
              className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                index === selectedIndex
                  ? 'bg-[#C7A667]/20 dark:bg-[#C7A667]/30'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              {getLocationIcon(location)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {location.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">
                    {getLocationTypeLabel(location)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {getLocationDisplayName(location)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && searchQuery.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#0E0E10] border border-gray-200 dark:border-white/20 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">No locations found for "{searchQuery}"</span>
          </div>
        </div>
      )}
    </div>
  );
};
