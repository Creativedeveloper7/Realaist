import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

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

function FloatingLogo() {
  return (
    <motion.a 
      href="/"
      className="fixed left-4 top-8 z-50 select-none logo-float cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="border border-dashed border-white/60 rounded-md px-4 py-3 backdrop-blur-sm bg-black/20">
        <span className="font-logo tracking-[0.25em] text-white/90 text-sm md:text-base">
          REALAIST
        </span>
      </div>
    </motion.a>
  );
}

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<any>(null);
  


  useEffect(() => {
    if (propertyId && propertyData[propertyId as keyof typeof propertyData]) {
      setProperty(propertyData[propertyId as keyof typeof propertyData]);
    } else {
      // Redirect to home if property not found
      navigate('/');
    }
  }, [propertyId, navigate]);

  if (!property) {
    return <div className="min-h-screen bg-[#111217] flex items-center justify-center text-white">Loading...</div>;
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
      <FloatingLogo />
      
      <div className="min-h-screen bg-[#111217] text-white">
        {/* Header */}
        <motion.header 
          className="fixed top-0 inset-x-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/35 bg-black/30 border-b border-white/10"
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
              <a href="/#properties" className="hover:text-white/80 transition-colors">Properties</a>
              <a href="/#insights" className="hover:text-white/80 transition-colors">Insights</a>
              <a href="/#contact" className="hover:text-white/80 transition-colors">Contact</a>
              <a href="#login" className="ml-2 px-4 py-2 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all">Investor Login</a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
              onClick={() => navigate('/')}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className="block w-5 h-0.5 bg-white"></span>
                <span className="block w-5 h-0.5 bg-white mt-1"></span>
                <span className="block w-5 h-0.5 bg-white mt-1"></span>
              </div>
            </button>
          </div>
        </motion.header>

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
                  <h1 className="text-4xl md:text-5xl font-heading mb-2" style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-2 text-white/70">
                    <span>📍</span>
                    <span>{property.location}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛏️</span>
                    <div>
                      <div className="text-lg font-medium">{property.beds} Beds</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛁</span>
                    <div>
                      <div className="text-lg font-medium">{property.baths} Baths</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">→</span>
                    <div>
                      <div className="text-lg font-medium">{property.sqft} sqft</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-heading mb-4" style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    Description
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              </div>

              {/* Right Column - Pricing and Actions */}
              <div className="space-y-6">
                {/* Pricing */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="text-sm text-white/60 mb-1">Starting</div>
                  <div className="text-3xl font-bold text-[#C7A667] mb-2">{property.price}</div>
                  <div className="text-sm text-white/70">Estimated Income {property.estimatedIncome}</div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button 
                    className="w-full px-6 py-3 bg-[#C7A667] text-black font-medium rounded-lg hover:bg-[#B89657] transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📄 Download Brochure
                  </motion.button>
                  
                  <motion.button 
                    className="w-full px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📅 Schedule Physical Visit
                  </motion.button>
                  
                  <motion.button 
                    className="w-full px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:border-white/50 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📞 Call Sale Rep.
                  </motion.button>
                  
                  <motion.button 
                    className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    💬 Chat on WhatsApp
                  </motion.button>
                </div>

                {/* Share Button */}
                <div className="flex justify-center">
                  <motion.button 
                    className="p-3 rounded-full border border-white/30 text-white hover:border-white/50 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    📤
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
