import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { propertiesService, Property } from './services/propertiesService';
import { Header } from './components/Header';
import { unifiedCacheService } from './services/unifiedCacheService';
import { useAuth } from './contexts/AuthContext';
import { ContactModal } from './PropertyDetails';
import { shareToWhatsApp, PropertyShareData } from './utils/whatsappShare';
import { Share2 } from 'lucide-react';

// Helper function to get icon for fact type
const getFactIcon = (factIndex: number, isDarkMode: boolean = true) => {
  const iconClass = isDarkMode 
    ? "w-3 h-3 object-contain filter brightness-0 saturate-100 invert-[0.8] sepia-[0.5] saturate-[2.5] hue-rotate-[15deg]"
    : "w-3 h-3 object-contain filter brightness-0 saturate-100 invert-0";
    
  switch (factIndex) {
    case 0: // Beds
      return (
        <img 
          src="/icons/bed.png" 
          alt="Beds" 
          className={iconClass}
          onError={(e) => {
            // Hide the image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    case 1: // Baths
      return (
        <img 
          src="/icons/bath.png" 
          alt="Baths" 
          className={iconClass}
          onError={(e) => {
            // Hide the image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    case 2: // Square Feet
      return (
        <img 
          src="/icons/sqre%20ft.png" 
          alt="Square Feet" 
          className={iconClass}
          onError={(e) => {
            // Hide the image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    default: // Est. Income (no icon)
      return null;
  }
};

// Helper: infer land unit from square feet
const inferLandAreaDisplay = (squareFeet?: number): string => {
  if (!squareFeet || squareFeet <= 0) return '';
  const acres = squareFeet / 43560;
  const hectares = squareFeet / 107639;
  // Choose the unit that yields a cleaner number (closer to .00 or .25 increments)
  const score = (n: number) => {
    const frac = Math.abs(n - Math.round(n * 4) / 4); // closeness to 0.25 steps
    return frac;
  };
  const useAcres = score(acres) <= score(hectares);
  const value = useAcres ? acres : hectares;
  const unit = useAcres ? 'Acres' : 'Hectares';
  return `${value.toFixed(2)} ${unit}`;
};


// Helper function to convert database property to display format
const convertPropertyToHouse = (property: Property) => {
  // Format price with commas using normal numbering system
  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const isLand = (property.propertyType || '').toLowerCase() === 'land';
  const landArea = isLand ? inferLandAreaDisplay(property.squareFeet) : '';

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6; // Sunday or Saturday
  const shortStay = (property.propertyType || '').toLowerCase() === 'short stay';

  const effectivePrice = (() => {
    if (!shortStay) return property.price;
    if (isWeekend) {
      return property.weekendPrice || property.weekdayPrice || property.price;
    }
    return property.weekdayPrice || property.price;
  })();

  return {
    id: property.id,
    name: property.title,
    location: property.location,
    price: formatPrice(effectivePrice),
    facts: isLand
      ? []
      : [
          property.bedrooms?.toString() || "N/A",
          property.bathrooms?.toString() || "N/A", 
          property.squareFeet ? `${property.squareFeet.toLocaleString()} sq ft` : "N/A"
        ],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: property.images && property.images.length > 0 ? property.images[0] : "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: property.status.charAt(0).toUpperCase() + property.status.slice(1),
    type: property.propertyType,
    landArea,
    developer: property.developer
  };
};

// Houses data - will be replaced with database data
const houses = [
  {
    id: "hardcoded-1",
    name: "Escada",
    location: "Gigiri / Westlands",
    price: "KSh 3.7M",
    facts: ["2", "2", "1,200 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Apartments",
    developer: {
      id: "dev-1",
      firstName: "John",
      lastName: "Mwangi",
      companyName: "Escada Developers",
      phone: "+254 700 123 456"
    }
  },
  {
    id: "hardcoded-2",
    name: "Azure Bay Villas",
    location: "Diani Beach",
    price: "KSh 28M",
    facts: ["4", "3", "20,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Pre-Launch",
    type: "Beach Villas",
    developer: {
      id: "dev-2",
      firstName: "Sarah",
      lastName: "Kimani",
      companyName: "Azure Properties",
      phone: "+254 700 234 567"
    }
  },
  {
    id: "hardcoded-3",
    name: "The Grove",
    location: "Karen – Gated Community",
    price: "KSh 42M",
    facts: ["4", "3", "25,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Townhouses",
    developer: {
      id: "dev-3",
      firstName: "Michael",
      lastName: "Ochieng",
      companyName: "Grove Developments",
      phone: "+254 700 345 678"
    }
  },
  {
    id: "hardcoded-4",
    name: "Skyline Heights",
    location: "Westlands",
    price: "KSh 18M",
    facts: ["3", "2", "1,800 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Coming Soon",
    type: "Apartments"
  },
  {
    id: "hardcoded-5",
    name: "Ocean View Residences",
    location: "Mombasa",
    price: "KSh 35M",
    facts: ["5", "4", "3,200 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Beach Villas"
  },
  {
    id: "hardcoded-6",
    name: "Green Valley Estate",
    location: "Karen",
    price: "KSh 55M",
    facts: ["6", "5", "4,500 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Gated Communities"
  },
  {
    id: "hardcoded-7",
    name: "Sunset Ridge",
    location: "Lavington",
    price: "KSh 25M",
    facts: ["3", "2", "2,200 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Apartments"
  },
  {
    id: "hardcoded-8",
    name: "Marina Heights",
    location: "Mombasa",
    price: "KSh 45M",
    facts: ["4", "3", "3,800 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Pre-Launch",
    type: "Beach Villas"
  },
  {
    id: "hardcoded-9",
    name: "The Pines",
    location: "Karen",
    price: "KSh 38M",
    facts: ["5", "4", "3,500 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Townhouses"
  },
  {
    id: "hardcoded-10",
    name: "Riverside Gardens",
    location: "Westlands",
    price: "KSh 22M",
    facts: ["2", "2", "1,500 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Coming Soon",
    type: "Apartments"
  },
  {
    id: "hardcoded-11",
    name: "Coral Bay",
    location: "Diani Beach",
    price: "KSh 65M",
    facts: ["6", "5", "5,200 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Beach Villas"
  },
  {
    id: "hardcoded-12",
    name: "Highland Park",
    location: "Karen",
    price: "KSh 48M",
    facts: ["4", "3", "3,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Gated Communities"
  },
  {
    id: "hardcoded-13",
    name: "Urban Heights",
    location: "Westlands",
    price: "KSh 15M",
    facts: ["2", "1", "1,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Apartments"
  },
  {
    id: "hardcoded-14",
    name: "Palm Springs",
    location: "Mombasa",
    price: "KSh 52M",
    facts: ["5", "4", "4,200 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Pre-Launch",
    type: "Beach Villas"
  },
  {
    id: "hardcoded-15",
    name: "The Meadows",
    location: "Karen",
    price: "KSh 35M",
    facts: ["4", "3", "2,800 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Townhouses"
  },
  {
    id: "hardcoded-16",
    name: "Sky Gardens",
    location: "Westlands",
    price: "KSh 28M",
    facts: ["3", "2", "2,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Coming Soon",
    type: "Apartments"
  },
  {
    id: "hardcoded-17",
    name: "Ocean Paradise",
    location: "Diani Beach",
    price: "KSh 75M",
    facts: ["7", "6", "6,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Beach Villas"
  },
  {
    id: "hardcoded-18",
    name: "Eden Gardens",
    location: "Karen",
    price: "KSh 42M",
    facts: ["5", "4", "3,600 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    image: "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Gated Communities"
  }
];

export default function HousesPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredHouses, setFilteredHouses] = useState<any[]>([]);
  const [, setIsOfflineMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedSquareFootage, setSelectedSquareFootage] = useState('All');
  const [selectedBedrooms, setSelectedBedrooms] = useState('All');
  const [selectedBathrooms, setSelectedBathrooms] = useState('All');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const propertiesPerPage = 12;

  const propertyTypes = ['All', 'Apartment', 'Villa', 'Townhouse', 'Mansionette', 'Penthouse', 'Studio', 'Commercial Building', 'Mixed Use Development', 'Beach Villas', 'Gated Communities', 'Land'];
  const statuses = ['All', 'active', 'sold', 'pending', 'draft'];
  const priceRanges = ['All', 'Under KSh 5M', 'KSh 5M - 10M', 'KSh 10M - 20M', 'KSh 20M - 50M', 'Over KSh 50M'];
  const squareFootage = ['All', 'Under 1,000 sq ft', '1,000 - 2,000 sq ft', '2,000 - 5,000 sq ft', 'Over 5,000 sq ft'];
  const bedrooms = ['All', '1', '2', '3', '4', '5+'];
  const bathrooms = ['All', '1', '2', '3', '4', '5+'];

  // Load properties from database
  useEffect(() => {
    let isMounted = true;
    
    // First, try to load from localStorage
    const loadFromStorage = () => {
      try {
        const storedProperties = localStorage.getItem('realaist_properties');
        const storedTimestamp = localStorage.getItem('realaist_properties_timestamp');
        
        if (storedProperties && storedTimestamp) {
          const properties = JSON.parse(storedProperties);
          const age = Date.now() - parseInt(storedTimestamp);
          
          // If data is less than 5 minutes old, use it
          if (age < 5 * 60 * 1000) {
            console.log('HousesPage: Loading properties from localStorage (age:', Math.round(age / 1000), 'seconds)');
            setProperties(properties);
            const convertedHouses = properties.map(convertPropertyToHouse);
            const uniqueHouses = convertedHouses.filter((house, index, self) => 
              index === self.findIndex(h => h.id === house.id)
            );
            // Exclude short stay properties
            const nonShortStayHouses = uniqueHouses.filter(house => {
              const originalProperty = properties.find(p => p.id === house.id);
              const isShortStay = (originalProperty?.propertyType || '').toLowerCase() === 'short stay';
              return !isShortStay;
            });
            setFilteredHouses(nonShortStayHouses);
            setIsLoading(false);
            return true; // Data loaded from storage
          } else {
            console.log('HousesPage: Stored data is too old, will fetch fresh data');
          }
        }
      } catch (error) {
        console.warn('HousesPage: Error loading from localStorage:', error);
      }
      return false; // No data loaded from storage
    };
    
    const loadProperties = async (forceRefresh = false) => {
      if (!isMounted) return;
      
      // If we already have properties and it's not a force refresh, don't reload
      if (!forceRefresh && properties.length > 0) {
        console.log('HousesPage: Properties already loaded, skipping reload');
        return;
      }
      
      // Try to load from localStorage first (unless force refresh)
      if (!forceRefresh && loadFromStorage()) {
        return; // Data loaded from storage, no need to fetch
      }
      
      console.log(`HousesPage: Loading properties (forceRefresh: ${forceRefresh})`);
      setIsLoading(true);
      
      // NO TIMEOUT - Let data load naturally or show loading state
      // No fallback to mock data - only show real data or loading
      
      try {
        // If force refresh, clear all caches first
        if (forceRefresh) {
          console.log('HousesPage: Force refresh - clearing all caches');
          unifiedCacheService.clearAll();
          // Also clear localStorage to ensure fresh data
          localStorage.removeItem('realaist_properties');
          localStorage.removeItem('realaist_properties_timestamp');
        }
        
        console.log('HousesPage: Calling propertiesService.getProperties()...');
        
        // SIMPLE SOLUTION: Use localStorage data immediately, then fetch fresh data in background
        // This prevents loading issues while still getting fresh data
        const storedProperties = localStorage.getItem('realaist_properties');
        if (storedProperties) {
          try {
            const properties = JSON.parse(storedProperties);
            console.log('HousesPage: Using stored data immediately, fetching fresh data in background');
            setProperties(properties);
            const convertedHouses = properties.map(convertPropertyToHouse);
            const uniqueHouses = convertedHouses.filter((house, index, self) => 
              index === self.findIndex(h => h.id === house.id)
            );
            // Exclude short stay properties
            const nonShortStayHouses = uniqueHouses.filter(house => {
              const originalProperty = properties.find(p => p.id === house.id);
              const isShortStay = (originalProperty?.propertyType || '').toLowerCase() === 'short stay';
              return !isShortStay;
            });
            setFilteredHouses(nonShortStayHouses);
            setIsLoading(false);
            
            // Fetch fresh data in background without blocking UI
            setTimeout(async () => {
              try {
                console.log('HousesPage: Background fetch starting...');
                const { properties: freshProperties, error: fetchError } = await propertiesService.getPropertiesDirect();
                if (!fetchError && freshProperties && freshProperties.length > 0) {
                  console.log('HousesPage: Background fetch completed, updating with fresh data');
                  setProperties(freshProperties);
                  localStorage.setItem('realaist_properties', JSON.stringify(freshProperties));
                  localStorage.setItem('realaist_properties_timestamp', Date.now().toString());
                  const convertedHouses = freshProperties.map(convertPropertyToHouse);
                  const uniqueHouses = convertedHouses.filter((house, index, self) => 
                    index === self.findIndex(h => h.id === house.id)
                  );
                  // Exclude short stay properties
                  const nonShortStayHouses = uniqueHouses.filter(house => {
                    const originalProperty = freshProperties.find(p => p.id === house.id);
                    const isShortStay = (originalProperty?.propertyType || '').toLowerCase() === 'short stay';
                    return !isShortStay;
                  });
                  setFilteredHouses(nonShortStayHouses);
                }
              } catch (err) {
                console.log('HousesPage: Background fetch failed, keeping stored data');
              }
            }, 100);
            return;
          } catch (error) {
            console.warn('HousesPage: Error parsing stored data:', error);
          }
        }
        
        // If no stored data, try direct fetch with timeout
        console.log('HousesPage: No stored data, attempting direct fetch...');
        const timeoutPromise = new Promise<{ properties: Property[]; error: string | null }>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Properties fetch timeout after 5 seconds'));
          }, 5000);
        });
        
        const { properties: fetchedProperties, error: fetchError } = await Promise.race([
          propertiesService.getPropertiesDirect(),
          timeoutPromise
        ]);
        
        console.log('HousesPage: Direct fetch completed', { 
          propertiesCount: fetchedProperties?.length, 
          error: fetchError 
        });
        
        if (!isMounted) return;
        
        if (!fetchError && fetchedProperties && fetchedProperties.length > 0) {
          console.log('HousesPage: Successfully fetched', fetchedProperties.length, 'properties from database');
          setProperties(fetchedProperties);
          
          // Store properties in localStorage for persistence
          localStorage.setItem('realaist_properties', JSON.stringify(fetchedProperties));
          localStorage.setItem('realaist_properties_timestamp', Date.now().toString());
          
          const convertedHouses = fetchedProperties.map(convertPropertyToHouse);
          // Remove duplicates by ID
          const uniqueHouses = convertedHouses.filter((house: any, index: number, self: any[]) => 
            index === self.findIndex((h: any) => h.id === house.id)
          );
          // Exclude short stay properties
          const nonShortStayHouses = uniqueHouses.filter((house: any) => {
            const originalProperty = fetchedProperties.find((p: Property) => p.id === house.id);
            const isShortStay = (originalProperty?.propertyType || '').toLowerCase() === 'short stay';
            return !isShortStay;
          });
          setFilteredHouses(nonShortStayHouses);
          setIsOfflineMode(false);
          // Clear offline mode flag since we successfully fetched data
          localStorage.removeItem('offline_mode');
          localStorage.removeItem('offline_mode_timestamp');
        } else {
          console.log('HousesPage: No properties found in database');
          
          // Keep existing data if available, otherwise show empty state
          if (properties.length > 0) {
            console.log('HousesPage: Using existing properties from previous successful fetch');
            const convertedHouses = properties.map(convertPropertyToHouse);
            const uniqueHouses = convertedHouses.filter((house, index, self) => 
              index === self.findIndex(h => h.id === house.id)
            );
            // Exclude short stay properties
            const nonShortStayHouses = uniqueHouses.filter(house => {
              const originalProperty = properties.find(p => p.id === house.id);
              const isShortStay = (originalProperty?.propertyType || '').toLowerCase() === 'short stay';
              return !isShortStay;
            });
            setFilteredHouses(nonShortStayHouses);
          } else {
            // Try to load from localStorage as fallback
            console.log('HousesPage: No properties from database, trying localStorage fallback');
            if (loadFromStorage()) {
              return; // Data loaded from storage
            } else {
              console.log('HousesPage: No properties available, showing empty state');
              setFilteredHouses([]);
            }
          }
        }
      } catch (err) {
        console.error('HousesPage: Error loading properties:', err);
        
        if (!isMounted) return;
        
        // Keep existing data if available, otherwise show empty state
        if (properties.length > 0) {
          console.log('HousesPage: Error occurred, using existing properties from previous successful fetch');
          const convertedHouses = properties.map(convertPropertyToHouse);
          const uniqueHouses = convertedHouses.filter((house: any, index: number, self: any[]) => 
            index === self.findIndex((h: any) => h.id === house.id)
          );
          // Exclude short stay properties
          const nonShortStayHouses = uniqueHouses.filter((house: any) => {
            const originalProperty = properties.find((p: Property) => p.id === house.id);
            const isShortStay = (originalProperty?.propertyType || '').toLowerCase() === 'short stay';
            return !isShortStay;
          });
          setFilteredHouses(nonShortStayHouses);
        } else {
          // Try to load from localStorage as fallback
          console.log('HousesPage: Database error, trying localStorage fallback');
          if (loadFromStorage()) {
            return; // Data loaded from storage
          } else {
            console.log('HousesPage: Error occurred, no existing properties, showing empty state');
            setFilteredHouses([]);
          }
        }
      }
      
      // Always set loading to false
      if (isMounted) {
        setIsLoading(false);
      }
    };

    // Initial load
    loadProperties();

    // Listen for tab focus events - NO AUTO REFRESH
    const handleTabFocus = () => {
      if (!isMounted) return;
      
      console.log('HousesPage: Tab focused - data remains static');
      // Data stays static - no automatic refresh
      // User must manually refresh if they want fresh data
    };

    // Listen for login events to refresh data
    const handleUserLogin = () => {
      if (!isMounted) return;
      
      console.log('HousesPage: User logged in, refreshing data...');
      loadProperties(true);
    };

    // Listen for property creation events to refresh data
    const handlePropertyCreated = () => {
      if (!isMounted) return;
      
      console.log('HousesPage: New property created, refreshing data...');
      loadProperties(true);
    };

    // Add event listeners
    window.addEventListener('focus', handleTabFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleTabFocus();
      }
    });
    window.addEventListener('realaist:user-logged-in', handleUserLogin);
    window.addEventListener('realaist:property-created', handlePropertyCreated);

    // NO PERIODIC REFRESH - Data remains static
    // User must manually refresh if they want fresh data

    // Cleanup
    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleTabFocus);
      document.removeEventListener('visibilitychange', handleTabFocus);
      window.removeEventListener('realaist:user-logged-in', handleUserLogin);
      window.removeEventListener('realaist:property-created', handlePropertyCreated);
    };
  }, []);

  useEffect(() => {
    // Get search term from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  useEffect(() => {
    // Keep HousesPage in sync when a property is deleted elsewhere (e.g. developer dashboard)
    const handlePropertyDeleted = (event: any) => {
      const id = event?.detail?.id as string | undefined;
      if (!id) return;

      // Update in-memory list
      setProperties(prev => {
        const updated = prev.filter(p => p.id !== id);

        // Also keep localStorage in sync so future loads don't resurrect deleted items
        try {
          const stored = localStorage.getItem('realaist_properties');
          if (stored) {
            const parsed = JSON.parse(stored) as Property[];
            const filtered = parsed.filter(p => p.id !== id);
            localStorage.setItem('realaist_properties', JSON.stringify(filtered));
            localStorage.setItem('realaist_properties_timestamp', Date.now().toString());
          }
        } catch (err) {
          console.warn('HousesPage: Failed to sync deletion to localStorage', err);
        }

        return updated;
      });
    };

    window.addEventListener('realaist:property-deleted' as any, handlePropertyDeleted);
    return () => {
      window.removeEventListener('realaist:property-deleted' as any, handlePropertyDeleted);
    };
  }, []);

  useEffect(() => {
    if (properties.length === 0) return; // Don't filter until properties are loaded
    
    let filtered = properties.map(convertPropertyToHouse);
    // Remove duplicates by ID
    filtered = filtered.filter((house, index, self) => 
      index === self.findIndex(h => h.id === house.id)
    );

    // Exclude short stay properties (they have their own dedicated page)
    filtered = filtered.filter(house => {
      const originalProperty = properties.find(p => p.id === house.id);
      const isShortStay = (originalProperty?.propertyType || '').toLowerCase() === 'short stay';
      return !isShortStay;
    });

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(house =>
        house.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        house.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by property type
    if (selectedType !== 'All') {
      filtered = filtered.filter(house => house.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(house => house.status === selectedStatus);
    }

    // Filter by price range
    if (selectedPriceRange !== 'All') {
      filtered = filtered.filter(house => {
        // Find the original property to get the actual price value
        const originalProperty = properties.find(p => p.id === house.id);
        const priceValue = originalProperty ? originalProperty.price : 0;
        
        switch (selectedPriceRange) {
          case 'Under KSh 5M': return priceValue < 5000000;
          case 'KSh 5M - 10M': return priceValue >= 5000000 && priceValue < 10000000;
          case 'KSh 10M - 20M': return priceValue >= 10000000 && priceValue < 20000000;
          case 'KSh 20M - 50M': return priceValue >= 20000000 && priceValue < 50000000;
          case 'Over KSh 50M': return priceValue >= 50000000;
          default: return true;
        }
      });
    }

    // Filter by square footage
    if (selectedSquareFootage !== 'All') {
      filtered = filtered.filter(house => {
        const sqft = parseInt(house.facts[2].replace(/[^\d]/g, ''));
        switch (selectedSquareFootage) {
          case 'Under 1,000 sq ft': return sqft < 1000;
          case '1,000 - 2,000 sq ft': return sqft >= 1000 && sqft < 2000;
          case '2,000 - 5,000 sq ft': return sqft >= 2000 && sqft < 5000;
          case 'Over 5,000 sq ft': return sqft >= 5000;
          default: return true;
        }
      });
    }

    // Filter by bedrooms
    if (selectedBedrooms !== 'All') {
      filtered = filtered.filter(house => {
        const beds = parseInt(house.facts[0]);
        if (selectedBedrooms === '5+') {
          return beds >= 5;
        }
        return beds === parseInt(selectedBedrooms);
      });
    }

    // Filter by bathrooms
    if (selectedBathrooms !== 'All') {
      filtered = filtered.filter(house => {
        const baths = parseInt(house.facts[1]);
        if (selectedBathrooms === '5+') {
          return baths >= 5;
        }
        return baths === parseInt(selectedBathrooms);
      });
    }

    setFilteredHouses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [properties, searchTerm, selectedType, selectedStatus, selectedPriceRange, selectedSquareFootage, selectedBedrooms, selectedBathrooms]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleWhatsAppShare = (house: any) => {
    const propertyData: PropertyShareData = {
      title: house.name || 'Amazing Property',
      location: house.location || 'Prime Location',
      price: house.price || 'Contact for Price',
      imageUrl: house.image || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600',
      description: `Discover this ${house.type || 'property'} in ${house.location || 'a prime location'}.`,
      propertyUrl: `${window.location.origin}/property/${house.id}`
    };

    shareToWhatsApp(propertyData);
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('HousesPage: Manual refresh triggered by user');
    
    try {
      // Clear all caches and fetch fresh data
      unifiedCacheService.clearAll();
      // Trigger a page reload to refresh all data
      window.location.reload();
    } catch (error) {
      console.error('HousesPage: Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate search suggestions based on property data
  const generateSearchSuggestions = (query: string) => {
    if (!query.trim()) return [];
    
    const suggestions = new Set<string>();
    
    const housesToSearch = properties.length > 0 ? properties.map(convertPropertyToHouse) : houses;
    
    housesToSearch.forEach(house => {
      // Add property names
      if (house.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(house.name);
      }
      
      // Add locations
      if (house.location.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(house.location);
      }
      
      // Add property types
      if (house.type.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(house.type);
      }
      
      // Add status
      if (house.status.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(house.status);
      }
    });
    
    return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const suggestions = generateSearchSuggestions(value);
    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && value.trim().length > 0);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  // Pagination logic
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredHouses.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(filteredHouses.length / propertiesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#0A0A0B]' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7A667] mx-auto mb-4"></div>
            <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aboreto&family=Montserrat:wght@400;500;600;900&family=Mulish:wght@600;700;800;900&display=swap');
        
        :root { 
          --bg: #0E0E10; 
          --ink: #F5F6F7; 
          --bg-light: #FFFFFF;
          --ink-light: #1A1A1A;
        }
        body.dark { --bg: #0E0E10; --ink: #F5F6F7; }
        body.light { --bg: #FFFFFF; --ink: #1A1A1A; }
        html { scroll-behavior: smooth; }
        .font-heading { font-family: 'Mulish', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; font-weight: 900; }
        .font-body { font-family: 'Montserrat', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
        .font-logo { font-family: 'Aboreto', ui-serif, Georgia, serif; }
        .grain:before { 
          content: ''; 
          position: fixed; 
          inset: -10%; 
          pointer-events: none; 
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)" opacity="0.04"/></svg>'); 
          mix-blend-mode: overlay; 
          z-index: 5; 
        }
        .card-3d {
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .card-3d:hover {
          transform: translateY(-8px) rotateY(2deg) rotateX(1deg);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        .btn-3d {
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-3d:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(199, 166, 103, 0.3);
        }
        .btn-3d:active {
          transform: translateY(0px) scale(0.98);
        }
        @media (max-width: 768px) {
          .btn-3d:hover {
            transform: none;
          }
          .card-3d:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="grain text-[var(--ink)] bg-[var(--bg)] font-body min-h-screen">
        <Header 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLoginClick={() => {
            // Fire custom event for App to open AuthModal
            window.dispatchEvent(new Event('realaist:open-auth'));
            // Also update URL param (optional) so deep links still work
            const current = new URL(window.location.href);
            current.searchParams.set('auth', 'open');
            navigate(`${current.pathname}${current.search}`, { replace: true });
          }}
        />


        {/* Main Content */}
        <div className={`pt-16 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-[#0E0E10] via-[#111217] to-[#0E0E10]' 
            : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
        }`}>
          {/* Hero Section */}
          <motion.section 
            className="py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <motion.h1 
                  className={`font-heading text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-6 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Available Properties
                </motion.h1>
                <motion.p 
                  className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Discover our curated selection of high-performance properties across Kenya
                </motion.p>

                {/* Back to Home and Refresh Buttons */}
                <motion.div 
                  className="mt-8 flex justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <motion.button
                    onClick={handleBackToHome}
                    className={`btn-3d px-6 py-3 rounded-full border transition-all ${
                      isDarkMode 
                        ? 'border-white/30 hover:border-[#C7A667] hover:text-[#C7A667]' 
                        : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Home
                  </motion.button>
                </motion.div>

                {/* Compact Search Bar */}
                <motion.div 
                  className="mt-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="bg-[#C7A667] border border-[#B89657] rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      {/* Search Input */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search area & properties"
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              setShowSuggestions(false);
                            }
                          }}
                          className="w-full bg-white/90 border-none outline-none text-base text-gray-900 placeholder-gray-600 rounded-md px-3 py-2 transition-colors duration-300 focus:bg-white"
                        />
                        {/* Search Button */}
                        <button
                          onClick={() => {
                            setShowSuggestions(false);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Filters Button */}
                      <div className="relative">
                        <motion.button
                          onClick={() => setShowFilters(!showFilters)}
                          className="bg-white text-black px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                          </svg>
                          <span className="text-xs bg-[#C7A667] text-black px-1.5 py-0.5 rounded-full">
                            {[
                              selectedType !== 'All' ? 1 : 0,
                              selectedStatus !== 'All' ? 1 : 0,
                              selectedPriceRange !== 'All' ? 1 : 0,
                              selectedSquareFootage !== 'All' ? 1 : 0,
                              selectedBedrooms !== 'All' ? 1 : 0,
                              selectedBathrooms !== 'All' ? 1 : 0
                            ].reduce((a, b) => a + b, 0)}
                          </span>
                        </motion.button>

                        {/* Filters Dropdown */}
                        {showFilters && (
                          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4">
                            <div className="space-y-4">
                              {/* Property Type */}
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Property Type</label>
                                <select
                                  value={selectedType}
                                  onChange={(e) => setSelectedType(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-[#C7A667] focus:ring-2 focus:ring-[#C7A667]/20 transition-colors"
                                >
                                  {propertyTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Status */}
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                                <select
                                  value={selectedStatus}
                                  onChange={(e) => setSelectedStatus(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-[#C7A667] focus:ring-2 focus:ring-[#C7A667]/20 transition-colors"
                                >
                                  {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Price Range */}
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Price Range</label>
                                <select
                                  value={selectedPriceRange}
                                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-[#C7A667] focus:ring-2 focus:ring-[#C7A667]/20 transition-colors"
                                >
                                  {priceRanges.map(range => (
                                    <option key={range} value={range}>{range}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Square Footage */}
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Square Footage</label>
                                <select
                                  value={selectedSquareFootage}
                                  onChange={(e) => setSelectedSquareFootage(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-[#C7A667] focus:ring-2 focus:ring-[#C7A667]/20 transition-colors"
                                >
                                  {squareFootage.map(sqft => (
                                    <option key={sqft} value={sqft}>{sqft}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Bedrooms */}
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Bedrooms</label>
                                <select
                                  value={selectedBedrooms}
                                  onChange={(e) => setSelectedBedrooms(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-[#C7A667] focus:ring-2 focus:ring-[#C7A667]/20 transition-colors"
                                >
                                  {bedrooms.map(bed => (
                                    <option key={bed} value={bed}>{bed}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Bathrooms */}
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Bathrooms</label>
                                <select
                                  value={selectedBathrooms}
                                  onChange={(e) => setSelectedBathrooms(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-[#C7A667] focus:ring-2 focus:ring-[#C7A667]/20 transition-colors"
                                >
                                  {bathrooms.map(bath => (
                                    <option key={bath} value={bath}>{bath}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Clear Filters Button */}
                              <motion.button
                                onClick={() => {
                                  setSearchTerm('');
                                  setSelectedType('All');
                                  setSelectedStatus('All');
                                  setSelectedPriceRange('All');
                                  setSelectedSquareFootage('All');
                                  setSelectedBedrooms('All');
                                  setSelectedBathrooms('All');
                                  setShowSuggestions(false);
                                }}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Clear All Filters
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="mt-2 bg-white/95 border border-gray-200 rounded-md shadow-lg">
                        {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 cursor-pointer transition-colors text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>



          {/* Properties Grid */}
          <motion.section 
            className="py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {filteredHouses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentProperties.map((house, index) => (
                    <motion.div
                      key={house.id}
                      className={`card-3d border rounded-2xl overflow-hidden transition-colors duration-300 backdrop-blur-sm ${
                        isDarkMode 
                          ? 'bg-white/10 border-white/20 shadow-xl' 
                          : 'bg-white/90 border-gray-200/50 shadow-lg'
                      }`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="relative">
                        <img 
                          src={house.image} 
                          alt={house.name} 
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      
                      <div className="p-6 relative">
                        <div className="absolute top-4 right-4">
                          <motion.span 
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all shadow-lg ${
                              isDarkMode 
                                ? 'border-white/30 text-white hover:border-[#C7A667] hover:text-[#C7A667] hover:shadow-[#C7A667]/20 hover:drop-shadow-[0_0_20px_rgba(199,166,103,0.6)]' 
                                : 'border-gray-300 text-gray-700 hover:border-[#C7A667] hover:text-[#C7A667] hover:shadow-[#C7A667]/30 hover:drop-shadow-[0_0_20px_rgba(199,166,103,0.8)]'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {house.status}
                          </motion.span>
                        </div>
                        <div className="text-sm text-[#C7A667] font-medium mb-2">{house.type}</div>
                        <h3 className={`font-heading text-xl mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{house.name}</h3>
                        <div className={`flex items-center gap-2 mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          <span className="text-[#C7A667]">📍</span>
                          <span>{house.location}</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-lg font-medium text-[#C7A667]">{house.price}</div>
                          {house.type === 'Land' && house.landArea && (
                            <div className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-300 ${
                              isDarkMode 
                                ? 'border-white/20 bg-white/5 text-white' 
                                : 'border-gray-300 bg-gray-100 text-gray-900'
                            }`}>
                              {house.landArea}
                            </div>
                          )}
                        </div>
                        
                        {house.type !== 'Land' && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {house.facts.map((fact: string, factIndex: number) => (
                              <span key={`${house.id}-fact-${factIndex}`} className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 transition-colors duration-300 ${
                                isDarkMode 
                                  ? 'border-white/20 bg-white/5 text-white' 
                                  : 'border-gray-300 bg-gray-100 text-gray-700'
                              }`}>
                                {getFactIcon(factIndex, isDarkMode)}
                                {fact}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <motion.a 
                            href={`/property/${house.id}`}
                            className="btn-3d flex-1 px-3 py-2 rounded-lg bg-[#C7A667] text-black font-medium text-xs inline-block text-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            View Details
                          </motion.a>
                          <motion.button 
                            onClick={() => {
                              console.log('Contact button clicked for house:', house);
                              console.log('House developer:', house.developer);
                              setSelectedProperty(house);
                              setContactModalOpen(true);
                            }}
                            className={`btn-3d px-3 py-2 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                              isDarkMode 
                                ? 'border-white/20 text-white hover:border-[#C7A667] hover:text-[#C7A667]' 
                                : 'border-gray-300 text-gray-700 hover:border-[#C7A667] hover:text-[#C7A667]'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <img 
                              src="/icons/phone.png" 
                              alt="Phone" 
                              className="w-3 h-3 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                              style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                            />
                            Contact
                          </motion.button>
                          <motion.button 
                            onClick={() => handleWhatsAppShare(house)}
                            className="btn-3d px-3 py-2 rounded-lg bg-green-600 text-white text-xs transition-all flex items-center gap-1 hover:bg-green-700 relative group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title="Share property on WhatsApp"
                          >
                            <Share2 className="w-3 h-3" />
                            Share
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              Share on WhatsApp
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                            </div>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

              ) : (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className={`font-heading text-2xl mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>No Properties Found</h3>
                  <p className={`mb-6 transition-colors duration-300 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}>Try adjusting your search criteria or filters</p>
                  <motion.button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('All');
                      setSelectedStatus('All');
                    }}
                    className="btn-3d px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Filters
                  </motion.button>
                </motion.div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div 
                  className="mt-12 flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <motion.button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg border transition-all ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:scale-105'
                      } ${
                        isDarkMode 
                          ? 'border-white/30 text-white hover:border-[#C7A667] hover:text-[#C7A667]' 
                          : 'border-gray-300 text-gray-700 hover:border-[#C7A667] hover:text-[#C7A667]'
                      }`}
                      whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                    >
                      ←
                    </motion.button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <motion.button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg border transition-all ${
                          currentPage === page
                            ? 'bg-[#C7A667] text-black border-[#C7A667]'
                            : 'hover:scale-105'
                        } ${
                          isDarkMode 
                            ? currentPage === page 
                              ? 'border-[#C7A667] text-black' 
                              : 'border-white/30 text-white hover:border-[#C7A667] hover:text-[#C7A667]'
                            : currentPage === page
                              ? 'border-[#C7A667] text-black'
                              : 'border-gray-300 text-gray-700 hover:border-[#C7A667] hover:text-[#C7A667]'
                        }`}
                        whileHover={currentPage !== page ? { scale: 1.05 } : {}}
                        whileTap={currentPage !== page ? { scale: 0.95 } : {}}
                      >
                        {page}
                      </motion.button>
                    ))}

                    {/* Next Button */}
                    <motion.button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg border transition-all ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:scale-105'
                      } ${
                        isDarkMode 
                          ? 'border-white/30 text-white hover:border-[#C7A667] hover:text-[#C7A667]' 
                          : 'border-gray-300 text-gray-700 hover:border-[#C7A667] hover:text-[#C7A667]'
                      }`}
                      whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                    >
                      →
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedProperty(null);
        }}
        developer={selectedProperty?.developer || null}
        propertyName={selectedProperty?.name}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
