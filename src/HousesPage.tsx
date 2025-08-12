import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Houses data
const houses = [
  {
    id: 1,
    name: "Escada",
    location: "Gigiri / Westlands",
    price: "From KSh 3.7M",
    beds: "1-2 Beds",
    roi: "10-12%",
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Apartments"
  },
  {
    id: 2,
    name: "Azure Bay Villas",
    location: "Diani Beach",
    price: "From KSh 28M",
    beds: "3-4 Beds",
    roi: "12-14%",
    image: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Pre-Launch",
    type: "Beach Villas"
  },
  {
    id: 3,
    name: "The Grove",
    location: "Karen – Gated Community",
    price: "From KSh 42M",
    beds: "4 Beds",
    roi: "9-11%",
    image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Townhouses"
  },
  {
    id: 4,
    name: "Skyline Heights",
    location: "Westlands",
    price: "From KSh 15M",
    beds: "2-3 Beds",
    roi: "11-13%",
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Coming Soon",
    type: "Apartments"
  },
  {
    id: 5,
    name: "Ocean View Residences",
    location: "Mombasa",
    price: "From KSh 35M",
    beds: "3-5 Beds",
    roi: "13-15%",
    image: "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Beach Villas"
  },
  {
    id: 6,
    name: "Green Valley Estate",
    location: "Karen",
    price: "From KSh 55M",
    beds: "4-6 Beds",
    roi: "8-10%",
    image: "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1600",
    status: "Available",
    type: "Gated Communities"
  }
];

export default function HousesPage() {
  const [filteredHouses, setFilteredHouses] = useState(houses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const propertyTypes = ['All', 'Apartments', 'Beach Villas', 'Townhouses', 'Gated Communities'];
  const statuses = ['All', 'Available', 'Pre-Launch', 'Coming Soon'];

  useEffect(() => {
    // Get search term from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  useEffect(() => {
    let filtered = houses;

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

    setFilteredHouses(filtered);
  }, [searchTerm, selectedType, selectedStatus]);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aboreto&family=Montserrat:wght@400;500;600;900&family=Mulish:wght@600;700;800;900&display=swap');
        
        :root { --bg: #0E0E10; --ink: #F5F6F7; }
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
        {/* Header */}
        <motion.header 
          className="fixed top-0 inset-x-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/35 bg-black/30 border-b border-white/10"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="border border-dashed border-white/60 rounded px-2.5 py-1">
                <span className="font-logo tracking-[0.25em] text-sm">REALAIST</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="/" className="hover:text-white/80 transition-colors">Home</a>
              <a href="/houses" className="text-[#C7A667]">Properties</a>
              <a href="/#why" className="hover:text-white/80 transition-colors">Why Us</a>
              <a href="/#insights" className="hover:text-white/80 transition-colors">Insights</a>
              <a href="/#contact" className="hover:text-white/80 transition-colors">Contact</a>
            </nav>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="pt-16">
          {/* Hero Section */}
          <motion.section 
            className="relative py-20 bg-gradient-to-b from-[#0E0E10] to-[#111217]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <motion.h1 
                  className="font-heading text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight text-white mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Available Properties
                </motion.h1>
                <motion.p 
                  className="text-xl text-white/70 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Discover our curated selection of high-performance properties across Kenya
                </motion.p>
              </div>

              {/* Back to Home Button */}
              <motion.div 
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  onClick={handleBackToHome}
                  className="btn-3d px-6 py-3 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ← Back to Home
                </motion.button>
              </motion.div>
            </div>
          </motion.section>

          {/* Filters Section */}
          <motion.section 
            className="py-12 bg-[#111217]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 outline-none focus:border-[#C7A667] transition-colors"
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Property Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-[#C7A667] transition-colors"
                    >
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white outline-none focus:border-[#C7A667] transition-colors"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Results Count */}
                  <div className="flex items-end">
                    <div className="text-white/70">
                      <span className="text-2xl font-bold text-white">{filteredHouses.length}</span>
                      <span className="ml-2">Properties Found</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Properties Grid */}
          <motion.section 
            className="py-16 bg-[#0E0E10]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {filteredHouses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredHouses.map((house, index) => (
                    <motion.div
                      key={house.id}
                      className="card-3d bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
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
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            house.status === 'Available' ? 'bg-green-500/20 text-green-400' :
                            house.status === 'Pre-Launch' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {house.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="text-sm text-[#C7A667] font-medium mb-2">{house.type}</div>
                        <h3 className="font-heading text-xl text-white mb-2">{house.name}</h3>
                        <p className="text-white/70 text-sm mb-4">{house.location}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-white font-semibold">{house.beds}</div>
                            <div className="text-xs text-white/50">Bedrooms</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-semibold">{house.price}</div>
                            <div className="text-xs text-white/50">Price</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-semibold">{house.roi}</div>
                            <div className="text-xs text-white/50">ROI</div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <motion.button 
                            className="btn-3d flex-1 px-4 py-2 rounded-lg bg-[#C7A667] text-black font-medium text-sm"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            View Details
                          </motion.button>
                          <motion.button 
                            className="btn-3d px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:border-[#C7A667] hover:text-[#C7A667] transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Contact
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
                  <h3 className="font-heading text-2xl text-white mb-2">No Properties Found</h3>
                  <p className="text-white/70 mb-6">Try adjusting your search criteria or filters</p>
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
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
