import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { propertiesService, Property } from './services/propertiesService';
import { scheduledVisitsService } from './services/scheduledVisitsService';
import { Header } from './components/Header';
import { shareToWhatsApp, PropertyShareData } from './utils/whatsappShare';
import { Share2 } from 'lucide-react';

// Helper function to get icon for fact type
const getFactIcon = (factIndex: number, isDarkMode: boolean = true) => {
  const iconClass = isDarkMode 
    ? "w-6 h-6 object-contain filter brightness-0 saturate-100 invert-[0.8] sepia-[0.5] saturate-[2.5] hue-rotate-[15deg]"
    : "w-6 h-6 object-contain filter brightness-0 saturate-100 invert-0";
    
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

// Infer a friendly land area display from square feet
const formatLandArea = (squareFeet?: number): string => {
  if (!squareFeet || squareFeet <= 0) return '';
  const acres = squareFeet / 43560;
  const hectares = squareFeet / 107639;
  const score = (n: number) => Math.abs(n - Math.round(n * 4) / 4); // closeness to 0.25 steps
  const useAcres = score(acres) <= score(hectares);
  const value = useAcres ? acres : hectares;
  const unit = useAcres ? 'Acres' : 'Hectares';
  return `${value.toFixed(2)} ${unit}`;
};


export default function PropertyDetails() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [developerInfoModalOpen, setDeveloperInfoModalOpen] = useState(false);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [visitSubmissionMessage, setVisitSubmissionMessage] = useState('');
  
  // Helper function to convert database property to display format
  const convertPropertyToDisplay = (dbProperty: Property) => {
    console.log('PropertyDetails: Converting property to display format:', {
      title: dbProperty.title,
      developer: dbProperty.developer,
      developerPhone: dbProperty.developer?.phone
    });
    
    return {
      id: dbProperty.id,
      name: dbProperty.title,
      location: dbProperty.location,
      description: dbProperty.description,
      price: `KSh ${dbProperty.price.toLocaleString()}`,
      estimatedIncome: "KES 350,000/mo",
      beds: dbProperty.bedrooms || 0,
      baths: dbProperty.bathrooms || 0,
      sqft: dbProperty.squareFeet?.toString() || "0",
      images: dbProperty.images && dbProperty.images.length > 0 ? dbProperty.images : [
        "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600"
      ],
      facts: ["1–2 Beds", "From KSh 3.7M", "ROI 10–12%"],
      developer: dbProperty.developer,
      developerId: dbProperty.developerId,
      type: dbProperty.propertyType,
      landArea: formatLandArea(dbProperty.squareFeet),
      amenities: (dbProperty as any).amenities || [],
      features: (dbProperty as any).features || []
    };
  };

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        console.log('PropertyDetails: No propertyId, redirecting to home');
      navigate('/');
        return;
      }

      // Check if propertyId is a valid UUID or known fallback IDs
      const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId) || 
                       propertyId.startsWith('fallback-') ||
                       propertyId.startsWith('project-') ||
                       propertyId.startsWith('hardcoded-');
      
      if (!isValidId) {
        console.log('PropertyDetails: Invalid propertyId format, redirecting to properties page');
        navigate('/properties');
        return;
      }

      console.log('PropertyDetails: Loading property with ID:', propertyId);
      setIsLoading(true);
      setError(null);
      
      // First, try to load from localStorage
              const loadFromStorage = () => {
                try {
                  const storedProperties = localStorage.getItem('realaist_properties');
                  if (storedProperties) {
                    const properties = JSON.parse(storedProperties);
                    const foundProperty = properties.find((p: any) => p.id === propertyId);
                    if (foundProperty) {
                      console.log('PropertyDetails: Found property in localStorage');
                      console.log('PropertyDetails: Stored property developer data:', {
                        developer: foundProperty.developer,
                        phone: foundProperty.developer?.phone
                      });
                      
                      // Check if developer data is complete
                      if (foundProperty.developer && foundProperty.developer.phone) {
                        console.log('PropertyDetails: Developer data is complete, using stored data');
                        setProperty(convertPropertyToDisplay(foundProperty));
                        setIsLoading(false);
                        return true;
                      } else {
                        console.log('PropertyDetails: Developer data incomplete in localStorage, will fetch fresh data');
                        return false; // Don't use incomplete data
                      }
                    }
                  }
                } catch (error) {
                  console.warn('PropertyDetails: Error loading from localStorage:', error);
                }
                return false;
              };
      
      // Try localStorage first
      if (loadFromStorage()) {
        return;
      }
      
      try {
        // Try to get from properties list using direct method
        console.log('PropertyDetails: Trying to get property from properties list...');
        const { properties: allProperties, error: listError } = await propertiesService.getPropertiesDirect();
        if (!listError && allProperties) {
          const foundProperty = allProperties.find(p => p.id === propertyId);
          if (foundProperty) {
            console.log('PropertyDetails: Found property in properties list');
            console.log('PropertyDetails: Properties list developer data:', {
              developer: foundProperty.developer,
              phone: foundProperty.developer?.phone
            });
            
            // Check if developer data is complete
            if (foundProperty.developer && foundProperty.developer.phone) {
              console.log('PropertyDetails: Developer data is complete in properties list');
              const displayProperty = convertPropertyToDisplay(foundProperty);
              console.log('PropertyDetails: Setting property with developer data:', {
                developer: displayProperty.developer,
                phone: displayProperty.developer?.phone
              });
              setProperty(displayProperty);
              setIsLoading(false);
              return;
            } else {
              console.log('PropertyDetails: Developer data incomplete in properties list, trying individual fetch');
            }
          }
        }
        
        // If not found in properties list or developer data incomplete, try individual fetch (no timeout)
        console.log('PropertyDetails: Property not found in list or developer data incomplete, trying individual fetch...');
        const { property: dbProperty, error: fetchError } = await propertiesService.getPropertyById(propertyId);
        
        console.log('PropertyDetails: Individual fetch result:', { 
          dbProperty: !!dbProperty, 
          error: fetchError,
          developer: dbProperty?.developer,
          phone: dbProperty?.developer?.phone
        });
        
        if (fetchError) {
          console.error('PropertyDetails: Individual fetch failed:', fetchError);
          setError('Property not found');
        } else if (dbProperty) {
          console.log('PropertyDetails: Successfully loaded property from individual fetch');
          const displayProperty = convertPropertyToDisplay(dbProperty);
          console.log('PropertyDetails: Setting property with developer data:', {
            developer: displayProperty.developer,
            phone: displayProperty.developer?.phone
          });
          setProperty(displayProperty);
        } else {
          console.log('PropertyDetails: No property found with ID:', propertyId);
          setError('Property not found');
        }
      } catch (err) {
        console.error('PropertyDetails: Error loading property:', err);
        setError('Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, navigate]);

  if (isLoading) {
    return <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'
    }`}>Loading...</div>;
  }

  if (error || !property) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Property not found'}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#C7A667] text-black rounded-lg hover:bg-[#B8965A] transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/properties')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLand = (property.type || '').toLowerCase() === 'land';

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  const handleShare = async () => {
    try {
      const shareTitle = property?.name ? `${property.name} - Realaist` : 'Realaist Property';
      const shareText = property?.name && property?.location
        ? `Check out ${property.name} in ${property.location} on Realaist.`
        : 'Check out this property on Realaist.';
      const shareUrl = window.location.href;

      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
        alert('Link copied to clipboard');
      } else {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
      }
    } catch (err) {
      console.error('Share action failed:', err);
      alert('Could not share this property.');
    }
  };

  const handleWhatsAppShare = () => {
    if (!property) return;

    const propertyData: PropertyShareData = {
      title: property.name || 'Amazing Property',
      location: property.location || 'Prime Location',
      price: property.price || 'Contact for Price',
      imageUrl: property.images && property.images.length > 0 
        ? property.images[0] 
        : 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600',
      description: property.description || `Discover this ${property.type || 'property'} in ${property.location || 'a prime location'}.`,
      propertyUrl: window.location.href
    };

    shareToWhatsApp(propertyData);
  };

  return (
    <>
      {/* Floating logo hidden on details page to avoid duplicates; header provides logo */}
      <motion.button
        className={`fixed right-2 top-1/4 transform -translate-y-1/2 z-30 md:hidden w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-lg transition-all duration-300 opacity-60 hover:opacity-100 ${
          isDarkMode 
            ? 'bg-black/60 border-white/10 text-white/80' 
            : 'bg-white/60 border-gray-200/50 text-gray-600'
        }`}
        onClick={toggleTheme}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </motion.button>
      
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'
      }`}>
        <Header 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLoginClick={() => {
            window.dispatchEvent(new Event('realaist:open-auth'));
            const current = new URL(window.location.href);
            current.searchParams.set('auth', 'open');
            navigate(`${current.pathname}${current.search}`, { replace: true });
          }}
        />
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              className="absolute top-0 right-0 w-80 h-full bg-[#111217] border-l border-white/10 p-6"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Menu Items */}
              <div className="mt-12 space-y-6">
                <a 
                  href="/properties" 
                  className="block text-lg font-medium text-white hover:text-[#C7A667] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Properties
                </a>
                <a 
                  href="/blogs" 
                  className="block text-lg font-medium text-white hover:text-[#C7A667] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blogs
                </a>
                <a 
                  href="/#contact" 
                  className="block text-lg font-medium text-white hover:text-[#C7A667] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                
                {/* Auth Status */}
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/developer-dashboard');
                      }}
                      className="w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors text-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Welcome, {user?.firstName}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-6 py-3 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all text-lg font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Logout
                    </motion.button>
                  </div>
                ) : (
                <motion.button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const current = new URL(window.location.href);
                    current.searchParams.set('auth', 'open');
                    navigate(`${current.pathname}${current.search}`, { replace: true });
                  }}
                  className="w-full px-6 py-3 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all text-lg font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="pt-16">
          {/* Hero Image Section */}
          <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
            {/* Main Image */}
            <motion.img
              key={currentImageIndex}
              src={property.images[currentImageIndex]}
              alt={property.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* 3D Virtual Tour Button */}
            <motion.button
              className="absolute top-6 right-6 px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors flex items-center gap-2 shadow-lg z-20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Handle 3D virtual tour functionality
                console.log('3D Virtual Tour clicked for:', property.name);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              3D Virtual Tour
            </motion.button>

            {/* Watch Video Button */}
            <motion.button
              className="absolute top-20 right-6 px-4 py-2 rounded-full border border-white/30 bg-black/50 backdrop-blur-sm text-white font-medium hover:border-[#C7A667] hover:text-[#C7A667] transition-colors flex items-center gap-2 shadow-lg z-20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Handle watch video functionality
                console.log('Watch Video clicked for:', property.name);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
              Watch Video
            </motion.button>

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            >
              →
            </button>

            {/* Image Thumbnails */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {property.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-[#C7A667] scale-110' 
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${property.name} ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Property Information Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Property Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Property Name and Location */}
                <div>
                  <h1 className={`text-4xl md:text-5xl font-heading mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    {property.name}
                  </h1>
                  <div className={`flex items-center gap-2 mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}>
                    <span>📍</span>
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-medium text-[#C7A667]">{property.price}</div>
                    {isLand && property.landArea && (
                      <div className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-300 ${
                        isDarkMode 
                          ? 'border-white/20 bg-white/5 text-white' 
                          : 'border-gray-300 bg-gray-100 text-gray-900'
                      }`}>
                        {property.landArea}
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                {!isLand && (
                  <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                      {getFactIcon(0, isDarkMode)}
                      <div>
                        <div className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{property.beds} Beds</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getFactIcon(1, isDarkMode)}
                      <div>
                        <div className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{property.baths} Baths</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getFactIcon(2, isDarkMode)}
                      <div>
                        <div className={`text-lg font-medium transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{property.sqft} sqft</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className={`border-t transition-colors duration-300 ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}></div>

                {/* Description */}
                <div>
                  <h3 className={`text-xl font-heading mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    Description
                  </h3>
                  <p className={`leading-relaxed transition-colors duration-300 ${
                    isDarkMode ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    {property.description}
                  </p>
                </div>

                {/* Amenities and Features */}
                {(property.amenities?.length > 0 || property.features?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-8">
                    {property.amenities?.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-heading mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.map((a: string) => (
                            <span key={a} className={`text-xs px-3 py-1 rounded-full border ${
                              isDarkMode ? 'border-white/20 bg-white/5 text-white' : 'border-gray-300 bg-gray-100 text-gray-700'
                            }`}>{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.features?.length > 0 && (
                      <div>
                        <h3 className={`text-xl font-heading mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {property.features.map((f: string) => (
                            <span key={f} className={`text-xs px-3 py-1 rounded-full border ${
                              isDarkMode ? 'border-white/20 bg-white/5 text-white' : 'border-gray-300 bg-gray-100 text-gray-700'
                            }`}>{f}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Map Section */}
                <div className="md:hidden">
                  <h3 className={`text-xl font-heading mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    Location
                  </h3>
                  <div className={`h-64 rounded-xl border transition-colors duration-300 ${
                    isDarkMode ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(property.location)}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: '12px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Actions and Desktop Map */}
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button 
                    onClick={() => setDeveloperInfoModalOpen(true)}
                    className="w-full px-6 py-3 bg-[#C7A667] text-black font-medium rounded-lg hover:bg-[#B89657] transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📞 Call Developer
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => setScheduleModalOpen(true)}
                    className="w-full px-6 py-3 border border-[#C7A667] text-[#C7A667] font-medium rounded-lg hover:bg-[#C7A667] hover:text-black transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📅 Schedule Physical Visit
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => {
                      if (property.developer?.phone) {
                        const phoneNumber = property.developer.phone.replace(/\D/g, '');
                        const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber}`;
                        const whatsappUrl = `https://wa.me/${formattedPhone}?text=Hi, I'm interested in the property "${property.name}" at ${property.location}. Could you please provide more information?`;
                        window.open(whatsappUrl, '_blank');
                      } else {
                        alert('Developer contact information not available');
                      }
                    }}
                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    💬 Chat on WhatsApp
                  </motion.button>

                  <motion.button 
                    onClick={handleShare}
                    className={`w-full px-6 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border ${
                      isDarkMode 
                        ? 'border-white/30 text-white hover:border-[#C7A667] hover:text-[#C7A667]'
                        : 'border-gray-300 text-gray-700 hover:border-[#C7A667] hover:text-[#C7A667]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>

                  <motion.button 
                    onClick={handleWhatsAppShare}
                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 relative group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Share property on WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                    Share on WhatsApp
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      Share property on WhatsApp
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </motion.button>
                </div>

                {/* Desktop Map Section */}
                <div className="hidden md:block">
                  <h3 className={`text-xl font-heading mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    Location
                  </h3>
                  <div className={`h-64 rounded-xl border transition-colors duration-300 ${
                    isDarkMode ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(property.location)}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: '12px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investor Login Modal */}
      {loginModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setLoginModalOpen(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111217] p-8"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="border border-dashed rounded-md px-4 py-3 mb-4 inline-block">
                <img 
                  src="/logos/realaistlogo.png" 
                  alt="Realaist Logo" 
                  className="h-12 w-auto"
                />
              </div>
              <h2 className="font-heading text-2xl font-medium text-white">
                Investor Portal
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Access your investment portfolio and exclusive opportunities
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              // Handle login logic here
              console.log('Login submitted');
            }}>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border bg-white/5 border-white/15 text-white placeholder-white/40 focus:border-[#C7A667] outline-none focus:ring-2 focus:ring-[#C7A667]/20"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg border bg-white/5 border-white/15 text-white placeholder-white/40 focus:border-[#C7A667] outline-none focus:ring-2 focus:ring-[#C7A667]/20"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" className="accent-[#C7A667]" />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sm text-[#C7A667] hover:text-[#B89657] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <motion.button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Schedule Visit Modal */}
      {scheduleModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setScheduleModalOpen(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            className={`relative w-full max-w-md rounded-2xl border p-8 ${
              isDarkMode 
                ? 'border-white/10 bg-[#111217]' 
                : 'border-gray-200 bg-white'
            }`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setScheduleModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 transition-colors ${
                isDarkMode 
                  ? 'hover:bg-white text-white/60 hover:text-white' 
                  : 'hover:bg-gray-900 text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className={`border border-dashed rounded-md px-4 py-3 mb-4 inline-block ${
                isDarkMode ? 'border-white/20' : 'border-gray-300'
              }`}>
                <img 
                  src="/logos/realaistlogo.png" 
                  alt="Realaist Logo" 
                  className="h-12 w-auto"
                />
              </div>
              <h2 className={`font-heading text-2xl font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Schedule Property Visit
              </h2>
              <p className={`mt-2 text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                Book a viewing for {property.name}
              </p>
            </div>

            {/* Scheduling Form */}
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmittingVisit(true);
              setVisitSubmissionMessage('');
              
              try {
                if (!propertyId) {
                  setVisitSubmissionMessage('Property ID not found');
                  return;
                }

                const { error } = await scheduledVisitsService.createScheduledVisit({
                  propertyId,
                  scheduledDate: selectedDate,
                  scheduledTime: selectedTime,
                  visitorName,
                  visitorEmail,
                  message: `Visit request for ${property.name}`
                });

                if (error) {
                  setVisitSubmissionMessage(`Error: ${error}`);
                } else {
                  // Success for unauthenticated flow: just confirm and close modal
                  setVisitSubmissionMessage('Visit scheduled successfully!');
                  // Reset form
                  setSelectedDate('');
                  setSelectedTime('');
                  setVisitorName('');
                  setVisitorEmail('');
                  // Close modal after a brief delay; stay on the same page
                  setTimeout(() => {
                    setScheduleModalOpen(false);
                    setVisitSubmissionMessage('');
                  }, 1500);
                }
              } catch (err) {
                console.error('Error scheduling visit:', err);
                setVisitSubmissionMessage('An unexpected error occurred. Please try again.');
              } finally {
                setIsSubmittingVisit(false);
              }
            }}>
              {/* Date Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white placeholder-white/40 focus:border-[#C7A667]' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]'
                  } outline-none focus:ring-2 focus:ring-[#C7A667]/20`}
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Preferred Time
                </label>
                <select
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white focus:border-[#C7A667]' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#C7A667]'
                  } outline-none focus:ring-2 focus:ring-[#C7A667]/20`}
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              {/* Name Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white placeholder-white/40 focus:border-[#C7A667]' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]'
                  } outline-none focus:ring-2 focus:ring-[#C7A667]/20`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white placeholder-white/40 focus:border-[#C7A667]' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]'
                  } outline-none focus:ring-2 focus:ring-[#C7A667]/20`}
                  placeholder="Enter your email address"
                />
              </div>

              {/* Submission Message */}
              {visitSubmissionMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  visitSubmissionMessage.includes('Error') || visitSubmissionMessage.includes('not found')
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {visitSubmissionMessage}
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmittingVisit}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isSubmittingVisit
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-[#C7A667] text-black hover:bg-[#B89657]'
                }`}
                whileHover={!isSubmittingVisit ? { scale: 1.02 } : {}}
                whileTap={!isSubmittingVisit ? { scale: 0.98 } : {}}
              >
                {isSubmittingVisit ? 'Scheduling...' : 'Schedule Visit'}
              </motion.button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className={`text-xs transition-colors duration-300 ${
                isDarkMode ? 'text-white/50' : 'text-gray-500'
              }`}>
                We'll confirm your appointment within 24 hours
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Developer Info Modal */}
      {developerInfoModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setDeveloperInfoModalOpen(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            className={`relative w-full max-w-sm rounded-2xl border p-6 ${
              isDarkMode 
                ? 'border-white/10 bg-[#111217]' 
                : 'border-gray-200 bg-white'
            }`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={() => setDeveloperInfoModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 transition-colors ${
                isDarkMode 
                  ? 'hover:bg-white text-white/60 hover:text-white' 
                  : 'hover:bg-gray-900 text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Developer Info */}
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
                isDarkMode ? 'bg-[#C7A667]/20 text-[#C7A667]' : 'bg-[#C7A667]/10 text-[#C7A667]'
              }`}>
                👨‍💼
              </div>
              
              <h3 className={`text-xl font-heading mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} style={{ 
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}>
                {property.developer ? `${property.developer.firstName} ${property.developer.lastName}` : 'Developer'}
              </h3>
              
              {property.developer?.companyName && (
                <p className={`text-sm mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {property.developer.companyName}
                </p>
              )}
              
              {property.developer?.phone && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                    isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Phone Number
                    </p>
                    <p className={`text-lg font-mono transition-colors duration-300 ${
                      isDarkMode ? 'text-[#C7A667]' : 'text-[#C7A667]'
                    }`}>
                      {property.developer.phone}
                    </p>
                  </div>
                  
                  <motion.a
                    href={`tel:${property.developer.phone}`}
                    className="w-full inline-block px-6 py-3 bg-[#C7A667] text-black font-medium rounded-lg hover:bg-[#B89657] transition-colors text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📞 Call Now
                  </motion.a>
                </div>
              )}
              
              {!property.developer?.phone && (
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-white/50' : 'text-gray-500'
                }`}>
                  Contact information not available
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Developer Properties Section */}
      {property && property.developer && (
        <DeveloperPropertiesSection 
          currentProperty={property} 
          isDarkMode={isDarkMode} 
        />
      )}
    </>
  );
}


// Developer Properties Component
interface DeveloperPropertiesSectionProps {
  currentProperty: any; // Using any since it's the converted display format
  isDarkMode: boolean;
}

const DeveloperPropertiesSection: React.FC<DeveloperPropertiesSectionProps> = ({ 
  currentProperty, 
  isDarkMode 
}) => {
  const [developerProperties, setDeveloperProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeveloperProperties = async () => {
      try {
        setIsLoading(true);
        
        // Get all properties and filter by developer
        const { properties } = await propertiesService.getProperties();
        
        // Filter properties by the same developer, excluding the current property
        const filtered = properties.filter((p: Property) => {
          if (p.id === currentProperty.id) return false; // Exclude current property
          
          // Check if developer IDs match
          return p.developerId === currentProperty.developerId;
        });
        
        // Sort by creation date (newest first)
        const sorted = filtered.sort((a: Property, b: Property) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setDeveloperProperties(sorted.slice(0, 6)); // Show max 6 developer properties
      } catch (error) {
        console.error('Error fetching developer properties:', error);
        setDeveloperProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentProperty.developerId) {
      fetchDeveloperProperties();
    } else {
      setIsLoading(false);
    }
  }, [currentProperty]);

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
        isDarkMode ? 'bg-white' : 'bg-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7A667] mx-auto"></div>
            <p className={`mt-2 ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
              Loading other properties by this developer...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (developerProperties.length === 0) {
    return null;
  }

  const developerName = currentProperty.developer 
    ? `${currentProperty.developer.firstName} ${currentProperty.developer.lastName}`
    : 'This Developer';

  return (
    <section className={`py-16 px-4 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-white' : 'bg-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Other Properties by {developerName}
          </h2>
          <p className={`text-lg ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}>
            Discover more properties from this developer
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {developerProperties.map((property, index) => (
            <motion.div
              key={property.id}
              className={`group cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => handlePropertyClick(property.id)}
            >
              {/* Property Image */}
              <div className="relative h-48 overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <span className={`text-4xl ${
                      isDarkMode ? 'text-white/30' : 'text-gray-400'
                    }`}>
                      🏠
                    </span>
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#C7A667] text-black font-bold rounded-full text-sm">
                    KSh {property.price.toLocaleString()}
                  </span>
                </div>

                {/* Developer Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                    Same Developer
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 group-hover:text-[#C7A667] transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {property.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  📍 {property.location}
                </p>

                {/* Property Facts */}
                <div className="flex items-center gap-4 mb-4">
                  {property.bedrooms && (
                    <div className="flex items-center gap-1">
                      <img src="/icons/bed.png" alt="Beds" className="w-4 h-4" />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {property.bedrooms}
                      </span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1">
                      <img src="/icons/bath.png" alt="Baths" className="w-4 h-4" />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {property.bathrooms}
                      </span>
                    </div>
                  )}
                  {property.squareFeet && (
                    <div className="flex items-center gap-1">
                      <img src="/icons/sqre%20ft.png" alt="Square Feet" className="w-4 h-4" />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {property.squareFeet.toLocaleString()} sq ft
                      </span>
                    </div>
                  )}
                </div>

                {/* Property Type and Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.propertyType === 'apartment' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : property.propertyType === 'house'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                  }`}>
                    {property.propertyType?.charAt(0).toUpperCase() + property.propertyType?.slice(1)}
                  </span>
                  
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-[#C7A667]' : 'text-[#C7A667]'
                  }`}>
                    View Details →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Developer Contact Info */}
        {currentProperty.developer && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl border ${
              isDarkMode 
                ? 'border-white/10 bg-white/5' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Interested in more properties?
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-white/60' : 'text-gray-500'
                }`}>
                  Contact {developerName} directly
                </p>
              </div>
              {currentProperty.developer.phone && (
                <motion.a
                  href={`tel:${currentProperty.developer.phone}`}
                  className="px-6 py-3 bg-[#C7A667] text-black font-medium rounded-lg hover:bg-[#B89657] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📞 Call Developer
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Reusable Contact Modal Component
interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  } | null;
  propertyName?: string;
  isDarkMode: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  developer,
  propertyName,
  isDarkMode
}) => {
  console.log('ContactModal rendered with:', { isOpen, developer, propertyName });
  
  if (!isOpen || !developer) {
    console.log('ContactModal not rendering because:', { isOpen, developer: !!developer });
    return null;
  }

  const developerName = `${developer.firstName} ${developer.lastName}`;
  console.log('ContactModal developer name:', developerName);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div
        className={`relative w-full max-w-sm rounded-2xl border p-6 ${
          isDarkMode 
            ? 'border-white/10 bg-[#111217]' 
            : 'border-gray-200 bg-white'
        }`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-10 transition-colors ${
            isDarkMode 
              ? 'hover:bg-white text-white/60 hover:text-white' 
              : 'hover:bg-gray-900 text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Developer Info */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${
            isDarkMode ? 'bg-[#C7A667]/20 text-[#C7A667]' : 'bg-[#C7A667]/10 text-[#C7A667]'
          }`}>
            👨‍💼
          </div>
          
          <h3 className={`text-xl font-heading mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`} style={{ 
            fontFamily: "'Cinzel', 'Playfair Display', serif",
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}>
            {developerName}
          </h3>
          
          {developer.companyName && (
            <p className={`text-sm mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white/70' : 'text-gray-600'
            }`}>
              {developer.companyName}
            </p>
          )}

          {propertyName && (
            <p className={`text-xs mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white/60' : 'text-gray-500'
            }`}>
              Property: {propertyName}
            </p>
          )}
          
          {developer.phone && (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg border transition-colors duration-300 ${
                isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
              }`}>
                <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Phone Number
                </p>
                <p className={`text-lg font-mono transition-colors duration-300 ${
                  isDarkMode ? 'text-[#C7A667]' : 'text-[#C7A667]'
                }`}>
                  {developer.phone}
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.a
                  href={`tel:${developer.phone}`}
                  className="flex-1 px-4 py-3 bg-[#C7A667] text-black font-medium rounded-lg hover:bg-[#B89657] transition-colors text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📞 Call
                </motion.a>
                
                <motion.button
                  onClick={() => {
                    const phoneNumber = developer.phone!.replace(/\D/g, '');
                    const formattedPhone = phoneNumber.startsWith('254') ? phoneNumber : `254${phoneNumber}`;
                    const message = propertyName 
                      ? `Hi, I'm interested in the property "${propertyName}". Could you please provide more information?`
                      : `Hi, I'm interested in your properties. Could you please provide more information?`;
                    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  💬 WhatsApp
                </motion.button>
              </div>
            </div>
          )}
          
          {!developer.phone && (
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-white/50' : 'text-gray-500'
            }`}>
              Contact information not available
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};