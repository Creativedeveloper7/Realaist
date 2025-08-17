import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

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

// Property data - you can expand this or fetch from an API
const propertyData = {
  "escada": {
    name: "Escada",
    location: "Gigiri / Westlands",
    description: "4 Spacious Bedrooms - Plenty of room for family, guests, or a home office. 3 Full Bathrooms - Including a luxurious master ensuite with double vanities and walk-in shower. Modern Kitchen - Fully equipped with premium appliances and granite countertops. Open Living Area - Perfect for entertaining with high ceilings and large windows. Private Balcony - Enjoy stunning city views from your own outdoor space. Secure Parking - 2 covered parking spaces included. 24/7 Security - Gated community with professional security staff.",
    price: "KSh 3,700,000",
    estimatedIncome: "KSh 45,000/month",
    beds: 2,
    baths: 2,
    sqft: "1,200",
    images: [
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    facts: ["1–2 Beds", "From KSh 3.7M", "ROI 10–12%"]
  },
  "azure-bay-villas": {
    name: "Azure Bay Villas",
    location: "Diani Beach",
    description: "4 Spacious Bedrooms - Plenty of room for family, guests, or a home office. 3 Full Bathrooms - Including a luxurious master ensuite with double vanities and walk-in shower. Modern Kitchen - Fully equipped with premium appliances and granite countertops. Open Living Area - Perfect for entertaining with high ceilings and large windows. Private Balcony - Enjoy stunning ocean views from your own outdoor space. Secure Parking - 2 covered parking spaces included. 24/7 Security - Gated community with professional security staff.",
    price: "KSh 28,000,000",
    estimatedIncome: "KSh 300,000/month",
    beds: 4,
    baths: 3,
    sqft: "20,000",
    images: [
      "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    facts: ["3–4 Beds", "From KSh 28M", "ROI 12–14%"]
  },
  "the-grove": {
    name: "The Grove",
    location: "Karen – Gated Community",
    description: "4 Spacious Bedrooms - Plenty of room for family, guests, or a home office. 3 Full Bathrooms - Including a luxurious master ensuite with double vanities and walk-in shower. Modern Kitchen - Fully equipped with premium appliances and granite countertops. Open Living Area - Perfect for entertaining with high ceilings and large windows. Private Garden - Enjoy stunning garden views from your own outdoor space. Secure Parking - 2 covered parking spaces included. 24/7 Security - Gated community with professional security staff.",
    price: "KSh 42,000,000",
    estimatedIncome: "KSh 450,000/month",
    beds: 4,
    baths: 3,
    sqft: "25,000",
    images: [
      "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    facts: ["4 Beds", "From KSh 42M", "ROI 9–11%"]
  },
  "skyline-heights": {
    name: "Skyline Heights",
    location: "Westlands",
    description: "Luxurious 2-3 bedroom apartments in the heart of Westlands. Modern design with premium finishes and amenities. Perfect for young professionals and small families seeking convenience and style.",
    price: "KSh 15,000,000",
    estimatedIncome: "KSh 180,000/month",
    beds: 3,
    baths: 2,
    sqft: "1,800",
    images: [
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    facts: ["2-3 Beds", "From KSh 15M", "ROI 11-13%"]
  },
  "ocean-view-residences": {
    name: "Ocean View Residences",
    location: "Mombasa",
    description: "Stunning ocean-view residences with 3-5 bedrooms. Perfect for families seeking luxury coastal living with breathtaking views and premium amenities.",
    price: "KSh 35,000,000",
    estimatedIncome: "KSh 400,000/month",
    beds: 5,
    baths: 4,
    sqft: "3,200",
    images: [
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    facts: ["3-5 Beds", "From KSh 35M", "ROI 13-15%"]
  },
  "green-valley-estate": {
    name: "Green Valley Estate",
    location: "Karen",
    description: "Exclusive gated community with spacious 4-6 bedroom homes. Perfect for large families seeking privacy, security, and luxury in a serene environment.",
    price: "KSh 55,000,000",
    estimatedIncome: "KSh 600,000/month",
    beds: 6,
    baths: 5,
    sqft: "4,500",
    images: [
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1600",
      "https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200"
    ],
    facts: ["4-6 Beds", "From KSh 55M", "ROI 8-10%"]
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
        <span className={`font-logo tracking-[0.25em] text-sm md:text-base transition-colors duration-300 ${
          isDarkMode ? 'text-white/90' : 'text-gray-900/90'
        }`}>
          REALAIST
        </span>
      </div>
    </motion.a>
  );
}

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  


  useEffect(() => {
    if (propertyId && propertyData[propertyId as keyof typeof propertyData]) {
      setProperty(propertyData[propertyId as keyof typeof propertyData]);
    } else {
      // Redirect to home if property not found
      navigate('/');
    }
  }, [propertyId, navigate]);

  if (!property) {
    return <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'
    }`}>Loading...</div>;
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
              <a href="/houses" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Properties</a>
              <a href="/blogs" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Blogs</a>
              <a href="/#contact" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
              <motion.button
                onClick={() => setLoginModalOpen(true)}
                className="ml-2 px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
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
                
                {/* Investor Login Button */}
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
                  <div className="text-2xl font-medium text-[#C7A667]">{property.price}</div>
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
                    className="w-full px-6 py-3 bg-[#C7A667] text-black font-medium rounded-lg hover:bg-[#B89657] transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📞 Call Sale Rep.
                  </motion.button>
                  
                  <motion.button 
                    className="w-full px-6 py-3 border border-[#C7A667] text-[#C7A667] font-medium rounded-lg hover:bg-[#C7A667] hover:text-black transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📅 Schedule Physical Visit
                  </motion.button>
                  
                  <motion.button 
                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    💬 Chat on WhatsApp
                  </motion.button>
                  
                  <motion.button 
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📄 Download Brochure
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
                <span className="font-logo tracking-[0.25em] text-sm text-white/90">
                  REALAIST
                </span>
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
    </>
  );
}
