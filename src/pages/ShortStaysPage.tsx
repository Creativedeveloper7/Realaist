import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { propertiesService, Property } from '../services/propertiesService';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { shareToWhatsApp, PropertyShareData } from '../utils/whatsappShare';
import { Share2, Bed, Star } from 'lucide-react';

// Helper function to generate dummy rating (4.0 to 5.0)
const generateDummyRating = (propertyId: string): number => {
  // Use property ID to generate consistent rating per property
  const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 100;
  // Generate rating between 4.0 and 5.0
  return Math.round((4.0 + (seed / 100) * 1.0) * 10) / 10;
};

// Helper function to generate dummy review count (10 to 60)
const generateDummyReviewCount = (propertyId: string): number => {
  // Use property ID to generate consistent review count per property
  const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 50;
  return 10 + seed;
};

// Helper function to convert database property to display format
const convertPropertyToShortStay = (property: Property) => {
  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6; // Sunday or Saturday

  const effectivePrice = (() => {
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
    beds: property.bedrooms || 0,
    baths: property.bathrooms || 0,
    image: property.images && property.images.length > 0 ? property.images[0] : "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    developer: property.developer,
    amenities: (property as any).amenities || [],
    features: (property as any).features || [],
    rating: generateDummyRating(property.id),
    reviewCount: generateDummyReviewCount(property.id),
  };
};

export default function ShortStaysPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [shortStays, setShortStays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShortStays = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try localStorage cache first
        const storedProperties = localStorage.getItem('realaist_properties');
        const storedTimestamp = localStorage.getItem('realaist_properties_timestamp');
        
        if (storedProperties && storedTimestamp) {
          const properties = JSON.parse(storedProperties);
          const age = Date.now() - parseInt(storedTimestamp);
          
          // If data is less than 5 minutes old, use it
          if (age < 5 * 60 * 1000) {
            const shortStayProperties = properties.filter(
              (p: Property) => (p.propertyType || '').toLowerCase() === 'short stay'
            );
            if (shortStayProperties.length > 0) {
              setShortStays(shortStayProperties.map(convertPropertyToShortStay));
              setIsLoading(false);
            }
          }
        }

        // Fetch from database
        const result = await propertiesService.getProperties();
        if (result.error) {
          throw new Error(result.error);
        }

        const shortStayProperties = result.properties.filter(
          (p: Property) => (p.propertyType || '').toLowerCase() === 'short stay'
        );

        setShortStays(shortStayProperties.map(convertPropertyToShortStay));

        // Cache the results in localStorage (same as HousesPage)
        localStorage.setItem('realaist_properties', JSON.stringify(result.properties));
        localStorage.setItem('realaist_properties_timestamp', Date.now().toString());
      } catch (err) {
        console.error('Error loading short stays:', err);
        setError(err instanceof Error ? err.message : 'Failed to load short stays');
      } finally {
        setIsLoading(false);
      }
    };

    loadShortStays();
  }, []);

  const handlePropertyClick = (property: any) => {
    navigate(`/property/${property.id}`);
  };

  const handleShareClick = (e: React.MouseEvent, property: any) => {
    e.stopPropagation();
    const shareData: PropertyShareData = {
      title: property.name,
      location: property.location,
      price: property.price.replace('KSh ', '').replace(/,/g, ''),
      imageUrl: property.image,
      description: '',
      propertyUrl: `${window.location.origin}/property/${property.id}`,
    };
    shareToWhatsApp(shareData);
  };


  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'}`}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} onLoginClick={() => {}} />

      <div className="pt-16 pb-12">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              className={`font-heading text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontWeight: 500,
                letterSpacing: '0.05em',
              }}
            >
              Short Stays
            </motion.h1>
            <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
              Discover beautiful short-term rentals for your next getaway
            </p>
          </motion.div>
        </div>

        {/* Properties Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7A667]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className={`text-lg ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>{error}</p>
            </div>
          ) : shortStays.length === 0 ? (
            <div className="text-center py-20">
              <Bed size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-white/30' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                No short stay properties available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortStays.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer group ${
                    isDarkMode
                      ? 'bg-[#0E0E10] border-white/10 hover:border-[#C7A667]/50'
                      : 'bg-white border-gray-200 hover:border-[#C7A667] shadow-sm hover:shadow-lg'
                  }`}
                  onClick={() => handlePropertyClick(property)}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <motion.button
                        onClick={(e) => handleShareClick(e, property)}
                        className={`p-2 rounded-full backdrop-blur-sm ${
                          isDarkMode ? 'bg-black/50 text-white' : 'bg-white/90 text-gray-700'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Share2 size={16} />
                      </motion.button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-[#C7A667] text-black' : 'bg-[#C7A667] text-black'
                      }`}>
                        Short Stay
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {property.name}
                    </h3>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      {property.location}
                    </p>

                    {/* Features */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Bed size={16} className={isDarkMode ? 'text-white/60' : 'text-gray-500'} />
                        <span className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                          {property.beds} {property.beds === 1 ? 'bed' : 'beds'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <img
                          src="/icons/bath.png"
                          alt="Baths"
                          className={`w-4 h-4 object-contain filter ${
                            isDarkMode
                              ? 'brightness-0 invert-[0.8] sepia-[0.5] saturate-[2.5] hue-rotate-[15deg]'
                              : 'brightness-0 saturate-100 invert-0'
                          }`}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                          {property.baths} {property.baths === 1 ? 'bath' : 'baths'}
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="fill-[#C7A667] text-[#C7A667]" />
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {property.rating || '4.5'}
                        </span>
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        ({property.reviewCount || 25} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {property.price}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        per night
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
