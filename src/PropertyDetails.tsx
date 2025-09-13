import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { propertiesService, Property } from './services/propertiesService';
import { scheduledVisitsService } from './services/scheduledVisitsService';

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

function FloatingLogo({ isDarkMode = true }: { isDarkMode?: boolean }) {
  return (
    <motion.a 
      href="/"
      className="fixed left-4 top-8 z-50 select-none logo-float cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`border border-dashed rounded-md px-4 py-3 backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode 
          ? 'border-white/60 bg-black/20' 
          : 'border-gray-400 bg-white/20'
      }`}>
        <img 
          src="/logos/realaistlogo.png" 
          alt="Realaist Logo" 
          className="h-12 w-auto md:h-15"
        />
      </div>
    </motion.a>
  );
}

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
  const convertPropertyToDisplay = (dbProperty: Property) => ({
    name: dbProperty.title,
    location: dbProperty.location,
    description: dbProperty.description,
    price: `KSh ${dbProperty.price.toLocaleString()}`,
    estimatedIncome: "KES 350,000/mo",
    beds: dbProperty.bedrooms || 2,
    baths: dbProperty.bathrooms || 2,
    sqft: dbProperty.squareFeet?.toString() || "1,200",
    images: dbProperty.images && dbProperty.images.length > 0 ? dbProperty.images : [
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600"
    ],
    facts: ["1–2 Beds", "From KSh 3.7M", "ROI 10–12%"],
    developer: dbProperty.developer
  });

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        console.log('PropertyDetails: No propertyId, redirecting to home');
      navigate('/');
        return;
      }

      // Check if propertyId is a valid UUID, fallback ID, or project ID
      const isValidId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId) || 
                       propertyId.startsWith('fallback-') ||
                       propertyId.startsWith('project-');
      
      if (!isValidId) {
        console.log('PropertyDetails: Invalid propertyId format, redirecting to properties page');
        navigate('/houses');
        return;
      }

      console.log('PropertyDetails: Loading property with ID:', propertyId);
      setIsLoading(true);
      setError(null);
      
      try {
        // First, try to get from properties list (which includes fallback data)
        console.log('PropertyDetails: Trying to get property from properties list first...');
        const { properties: allProperties, error: listError } = await propertiesService.getProperties();
        if (!listError && allProperties) {
          const foundProperty = allProperties.find(p => p.id === propertyId);
          if (foundProperty) {
            console.log('PropertyDetails: Found property in properties list');
            setProperty(convertPropertyToDisplay(foundProperty));
            setIsLoading(false);
            return;
          }
        }
        
        // If not found in properties list, try individual fetch
        console.log('PropertyDetails: Property not found in list, trying individual fetch...');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const fetchPromise = propertiesService.getPropertyById(propertyId);
        
        const { property: dbProperty, error: fetchError } = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]) as any;
        
        console.log('PropertyDetails: Fetch result:', { dbProperty: !!dbProperty, error: fetchError });
        
        if (fetchError) {
          // Try to get from properties list as fallback
          console.log('Individual fetch failed, trying properties list...');
          const { properties: allProperties, error: listError } = await propertiesService.getProperties();
          if (!listError && allProperties) {
            const foundProperty = allProperties.find(p => p.id === propertyId);
            if (foundProperty) {
              setProperty(convertPropertyToDisplay(foundProperty));
              return;
            }
          }
          setError('Property not found');
        } else if (dbProperty) {
          setProperty(convertPropertyToDisplay(dbProperty));
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error loading property:', err);
        // Try to get from properties list as final fallback
        try {
          const { properties: allProperties, error: listError } = await propertiesService.getProperties();
          if (!listError && allProperties) {
            const foundProperty = allProperties.find(p => p.id === propertyId);
            if (foundProperty) {
              setProperty(convertPropertyToDisplay(foundProperty));
              return;
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
        
        if (err instanceof Error && err.message === 'Request timeout') {
          setError('Request timed out. Please try again.');
        } else {
          setError('Failed to load property. Please check your connection.');
        }
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
              onClick={() => navigate('/houses')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <FloatingLogo isDarkMode={isDarkMode} />
      
      {/* Mobile Theme Toggle Button */}
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
        {/* Header */}
        <motion.header 
          className={`fixed top-0 inset-x-0 z-30 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm border-b transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-black/35 border-white/10' 
              : 'bg-white/80 border-gray-200'
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo removed - using FloatingLogo component instead */}
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="/houses" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Developers</a>
              <a href="/blogs" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Blogs</a>
              <a href="/#contact" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
              
              {/* Auth Status */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => navigate(user?.userType === 'developer' ? '/developer-dashboard' : '/buyer-dashboard')}
                    className="px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Welcome, {user?.firstName}
                  </motion.button>
                  <motion.button
                    onClick={logout}
                    className="px-4 py-2 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Logout
                  </motion.button>
                </div>
              ) : (
              <motion.button
                onClick={() => setLoginModalOpen(true)}
                className="ml-2 px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login/Signup
              </motion.button>
              )}
              
              <motion.button
                onClick={toggleTheme}
                className={`p-2 rounded-full border transition-all ${
                  isDarkMode 
                    ? 'border-white/30 hover:border-[#C7A667] hover:text-[#C7A667]' 
                    : 'border-gray-300 hover:border-[#C7A667] hover:text-[#C7A667]'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </motion.button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''} ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></span>
                <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'} ${isDarkMode ? 'bg-white' : 'bg-gray-900'} mt-1`}></span>
                <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''} ${isDarkMode ? 'bg-white' : 'bg-gray-900'} mt-1`}></span>
              </div>
            </button>
          </div>
        </motion.header>

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
                  href="/houses" 
                  className="block text-lg font-medium text-white hover:text-[#C7A667] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Developers
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
                        navigate(user?.userType === 'developer' ? '/developer-dashboard' : '/buyer-dashboard');
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
                    setLoginModalOpen(true);
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
                                                <div className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-300 ${
                              isDarkMode 
                                ? 'border-white/20 bg-white/5 text-white' 
                                : 'border-gray-300 bg-gray-100 text-gray-900'
                            }`}>
                              Est. Income: KES 350,000/mo
                            </div>
                  </div>
                </div>

                {/* Key Metrics */}
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
                        // Remove any non-digit characters and add country code if not present
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

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-sm text-white/50">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <motion.button
                type="button"
                className="w-full py-3 rounded-lg border border-white/20 hover:border-white/40 text-white hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium">Create Investor Account</span>
              </motion.button>
              
              <p className="text-center text-xs text-white/50">
                New to REALAIST? Contact our team to get started
              </p>
            </div>
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

                const { visit, error } = await scheduledVisitsService.createScheduledVisit({
                  propertyId,
                  scheduledDate: selectedDate,
                  scheduledTime: selectedTime,
                  visitorName,
                  visitorEmail,
                  message: `Visit request for ${property.name}`
                });

                if (error) {
                  setVisitSubmissionMessage(`Error: ${error}`);
                } else if (visit) {
                  setVisitSubmissionMessage('Visit scheduled successfully! The developer will contact you soon.');
                  // Reset form
                  setSelectedDate('');
                  setSelectedTime('');
                  setVisitorName('');
                  setVisitorEmail('');
                  // Close modal after a delay
                  setTimeout(() => {
              setScheduleModalOpen(false);
                    setVisitSubmissionMessage('');
                  }, 2000);
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
    </>
  );
}