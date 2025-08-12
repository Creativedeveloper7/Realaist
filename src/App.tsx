import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

// REALAIST – Luxury Real Estate Landing Page
const properties = [
  {
    name: "Escada",
    location: "Gigiri / Westlands",
    summary:
      "Curated 1–2 bed residences minutes from the city's social and entertainment hub. Designed for dependable yields and elevated living.",
    facts: ["1–2 Beds", "From KSh 3.7M", "ROI 10–12%"],
    hero: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  {
    name: "Azure Bay Villas",
    location: "Diani Beach",
    summary:
      "Ocean-view villas with private terraces and access to a lifestyle concierge. Strong short-let demand profile.",
    facts: ["3–4 Beds", "From KSh 28M", "ROI 12–14%"],
    hero: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  {
    name: "The Grove",
    location: "Karen – Gated Community",
    summary:
      "Townhouses wrapped in greenery with clubhouse amenities and strong family rental demand.",
    facts: ["4 Beds", "From KSh 42M", "ROI 9–11%"],
    hero: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
];

// Search suggestions data
const searchSuggestions = [
  "Apartments", "Gated Communities", "Beach Villas", "Commercial Properties",
  "1 Bedroom", "2 Bedroom", "3+ Bedroom", "Penthouse", "Townhouse",
  "Nairobi", "Mombasa", "Diani", "Karen", "Westlands", "Gigiri"
];

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

function Section({ id, children, dark = false }: { id: string; children: React.ReactNode; dark?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.9]);

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative ${dark ? "bg-[#0E0E10]" : "bg-[#111217]"}`}
      style={{
        y,
        opacity,
        scale,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      initial={{ opacity: 0, y: 100, rotateX: 15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1],
        type: "spring",
        stiffness: 100
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">{children}</div>
    </motion.section>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestionsVisible, setSearchSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(searchSuggestions);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Search functionality with localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem('realaist_search_history');
    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
  }, []);



  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setSearchSuggestionsVisible(true);
    } else {
      setSearchSuggestionsVisible(false);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    localStorage.setItem('realaist_search_history', query);
    setSearchSuggestionsVisible(false);
    // Navigate to properties page with search
    window.location.href = `/houses?search=${encodeURIComponent(query)}`;
  };

  const handleExploreHouses = () => {
    window.location.href = '/houses';
  };

  const handleBookConsultation = () => {
    window.location.href = '#contact';
  };

  // 3D scroll effects
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const heroRotateX = useTransform(scrollYProgress, [0, 1], [0, 15]);

  return (
    <>
      {/* Custom styles */}
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
        .logo-float { animation: drift 6s ease-in-out infinite; }
        @keyframes drift { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-8px); } 
        }
        .hero-title {
          animation: heroFadeIn 2s ease-out forwards;
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        @keyframes heroFadeIn {
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .architecture-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }
        .architecture-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          min-height: 100vh;
          filter: brightness(0.6) contrast(1.2) saturate(1.1);
          transform: scale(1.05);
          transition: transform 0.3s ease;
          z-index: 1;
        }
        .architecture-background:hover .architecture-video {
          transform: scale(1.08);
        }

        .architecture-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .floating-element {
          position: absolute;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        .floating-element:hover {
          transform: scale(1.1) translateZ(20px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          border-color: rgba(199, 166, 103, 0.3);
        }
        .floating-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .element-1 {
          top: 15%;
          right: 10%;
          width: 200px;
          height: 150px;
          animation: float1 8s ease-in-out infinite;
          transform: rotateY(15deg) rotateX(5deg);
        }
        .element-2 {
          top: 60%;
          left: 8%;
          width: 180px;
          height: 120px;
          animation: float2 10s ease-in-out infinite;
          transform: rotateY(-10deg) rotateX(-3deg);
        }
        .element-3 {
          bottom: 20%;
          right: 20%;
          width: 160px;
          height: 100px;
          animation: float3 12s ease-in-out infinite;
          transform: rotateY(20deg) rotateX(8deg);
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotateY(15deg) rotateX(5deg); }
          50% { transform: translateY(-20px) rotateY(20deg) rotateX(8deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotateY(-10deg) rotateX(-3deg); }
          50% { transform: translateY(-15px) rotateY(-15deg) rotateX(-5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotateY(20deg) rotateX(8deg); }
          50% { transform: translateY(-25px) rotateY(25deg) rotateX(12deg); }
        }
        .geometric-shape {
          position: absolute;
          background: linear-gradient(45deg, rgba(199, 166, 103, 0.1), rgba(255, 255, 255, 0.05));
          border: 1px solid rgba(199, 166, 103, 0.2);
          backdrop-filter: blur(5px);
        }
        .shape-1 {
          top: 25%;
          left: 15%;
          width: 60px;
          height: 60px;
          transform: rotate(45deg);
          animation: rotate1 15s linear infinite;
        }
        .shape-2 {
          top: 70%;
          right: 15%;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          animation: rotate2 20s linear infinite reverse;
        }
        .shape-3 {
          bottom: 30%;
          left: 25%;
          width: 80px;
          height: 40px;
          transform: rotate(30deg);
          animation: rotate3 18s linear infinite;
        }
        @keyframes rotate1 {
          0% { transform: rotate(45deg); }
          100% { transform: rotate(405deg); }
        }
        @keyframes rotate2 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rotate3 {
          0% { transform: rotate(30deg); }
          100% { transform: rotate(390deg); }
        }
        @media (max-width: 768px) {
          .floating-element, .geometric-shape {
            display: none;
          }
        }
        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-top: 8px;
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }
        .search-suggestion-item {
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .search-suggestion-item:hover {
          background: rgba(199, 166, 103, 0.1);
          color: #C7A667;
        }
        .search-suggestion-item:last-child {
          border-bottom: none;
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
        .card-3d {
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .card-3d:hover {
          transform: translateY(-8px) rotateY(2deg) rotateX(1deg);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        .parallax-section {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 4rem !important;
          }
          .btn-3d:hover {
            transform: none;
          }
          .card-3d:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Floating Logo - Visible across all pages */}
      <FloatingLogo />

      {/* Wrapper */}
      <div className="grain text-[var(--ink)] bg-[var(--bg)] font-body">
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
              <a href="#properties" className="hover:text-white/80 transition-colors">Properties</a>
              <a href="#why" className="hover:text-white/80 transition-colors">Why Us</a>
              <a href="#insights" className="hover:text-white/80 transition-colors">Insights</a>
              <a href="#contact" className="hover:text-white/80 transition-colors">Contact</a>
              <a href="#login" className="ml-2 px-4 py-2 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all">Investor Login</a>
            </nav>
          </div>
        </motion.header>

        {/* Hero Section with 3D Video Background */}
        <motion.section 
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
          style={{
            y: heroY,
            scale: heroScale,
            rotateX: heroRotateX,
            transformStyle: "preserve-3d"
          }}
        >
          {/* 3D Architecture Video Background */}
          <div className="architecture-background">
            {/* Main 3D Architecture Video */}
            <video
              className="architecture-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600"
            >
              <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
              <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
            </video>
            

            
            {/* Additional 3D architectural elements for depth */}
            <div className="architecture-overlay">
              <div className="floating-element element-1">
                <img 
                  src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Architectural Detail" 
                  className="floating-image"
                />
              </div>
              <div className="floating-element element-2">
                <img 
                  src="https://images.pexels.com/photos/1643383/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Modern Interior" 
                  className="floating-image"
                />
              </div>
              <div className="floating-element element-3">
                <img 
                  src="https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Luxury Exterior" 
                  className="floating-image"
                />
              </div>
              
              {/* Geometric 3D shapes for modern feel */}
              <div className="geometric-shape shape-1"></div>
              <div className="geometric-shape shape-2"></div>
              <div className="geometric-shape shape-3"></div>
            </div>
          </div>

          {/* Enhanced dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />

          {/* Hero Content */}
          <motion.div 
            className="relative z-20 text-center px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="hero-title font-heading text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] leading-none tracking-tight text-white font-extrabold">
              REALAIST
            </h1>
            
            {/* Enhanced Search Bar with Autocomplete */}
            <div className="mt-12 max-w-4xl mx-auto relative">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-[#C7A667] focus:bg-white/15 transition-all text-lg" 
                      placeholder="What type of property are you looking for? (Apartments, Gated, Beach Villas, Commercial)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchSuggestionsVisible(true)}
                    />
                    {searchSuggestionsVisible && filteredSuggestions.length > 0 && (
                      <div className="search-suggestions">
                        {filteredSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="search-suggestion-item"
                            onClick={() => handleSearch(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <motion.button 
                      className="btn-3d px-8 py-4 rounded-xl bg-[#C7A667] text-black font-semibold text-lg shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExploreHouses}
                    >
                      Explore Houses
                    </motion.button>
                    <motion.button 
                      className="btn-3d px-8 py-4 rounded-xl border-2 border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all text-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBookConsultation}
                    >
                      Book Consultation
                    </motion.button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                  <span>1 Beds — From KSh 3.7M</span>
                  <span>•</span>
                  <span>2 Beds — From KSh 8.7M</span>
                  <span>•</span>
                  <span>3+ Beds — From KSh 28M</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* About / Trust with 3D effects */}
        <Section id="about" dark>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-3xl md:text-4xl">REALAIST</h2>
              <p className="mt-4 text-white/70 max-w-prose">
                REALAIST curates high-performance properties across Kenya for hybrid investors seeking dependable returns and elevated living. We combine design excellence with rigorous underwriting and transparent reporting.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { k: "KES 12B+", v: "Assets Listed" },
                  { k: "200+", v: "Investors Served" },
                  { k: "11.4%", v: "Avg Yield" },
                ].map((s, index) => (
                  <motion.div 
                    key={s.k} 
                    className="rounded-xl border border-white/10 bg-white/5 p-4 card-3d"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="font-heading text-xl">{s.k}</div>
                    <div className="text-xs text-white/60">{s.v}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              className="grid grid-cols-3 gap-4 opacity-80"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 0.8, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {["BlackRock", "Knight Frank", "HassConsult", "REITs", "IB", "World Bank"].map((n, index) => (
                <motion.div 
                  key={n} 
                  className="border border-white/10 rounded-lg h-16 flex items-center justify-center text-xs tracking-wider card-3d"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {n}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>

        {/* Why Us with enhanced 3D cards */}
        <Section id="why">
          <h3 className="font-heading text-3xl md:text-4xl">Why Choose Us</h3>
          <div className="mt-10 grid md:grid-cols-4 gap-6">
            {[
              { t: "High-ROI Curation", d: "Data-led sourcing and underwriting with disciplined risk controls." },
              { t: "Exclusive Access", d: "Off-market & pre-launch inventory you won't find elsewhere." },
              { t: "End-to-End Support", d: "From due diligence to property management and exits." },
              { t: "Transparent Reporting", d: "Quarterly dashboards and clear performance narratives." },
            ].map((f, index) => (
              <motion.div
                key={f.t}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 card-3d"
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 2,
                  rotateX: 1,
                  z: 20
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                <div className="font-heading text-xl mb-2">{f.t}</div>
                <p className="text-white/70 text-sm">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Featured Properties with 3D parallax */}
        <Section id="properties" dark>
          <h3 className="font-heading text-3xl md:text-4xl">Featured Properties</h3>
          <div className="mt-10 space-y-16">
            {properties.map((p, index) => (
              <motion.article 
                key={p.name} 
                className="relative grid md:grid-cols-12 gap-6 items-stretch parallax-section"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <motion.div 
                  className="md:col-span-7 rounded-2xl overflow-hidden border border-white/10 card-3d"
                  whileHover={{ scale: 1.03, rotateY: 2 }}
                >
                  <img src={p.hero} alt={p.name} className="h-full w-full object-cover transition-transform duration-500" />
                </motion.div>
                <div className="md:col-span-5 flex flex-col">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 card-3d">
                    <div className="text-sm tracking-widest opacity-70">{p.location}</div>
                    <h4 className="font-heading text-2xl mt-1">{p.name}</h4>
                    <p className="mt-3 text-white/70 text-sm">{p.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.facts.map((f) => (
                        <span key={f} className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">{f}</span>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                      <motion.button 
                        className="btn-3d px-5 py-2.5 rounded-full bg-[#C7A667] text-black text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Details
                      </motion.button>
                      <motion.button 
                        className="btn-3d px-5 py-2.5 rounded-full border border-white/30 text-sm hover:border-[#C7A667] hover:text-[#C7A667] transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Download Brochure
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {p.gallery.map((g, i) => (
                      <motion.img 
                        key={i} 
                        src={g} 
                        alt={`${p.name} ${i + 1}`} 
                        className="rounded-xl border border-white/10 h-40 w-full object-cover card-3d"
                        whileHover={{ scale: 1.05, rotateY: 1 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </Section>

        {/* Amenities with 3D perspective */}
        <Section id="amenities">
          <div className="grid md:grid-cols-2 gap-6 items-center parallax-section">
            <motion.div 
              className="rounded-2xl overflow-hidden border border-white/10 card-3d"
              whileHover={{ rotateY: 3, rotateX: 1 }}
            >
              <img src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Infinity Pool" className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-sm tracking-widest opacity-70">AMENITIES</div>
              <h3 className="font-heading text-4xl md:text-5xl mt-2">Precipice of Greatness</h3>
              <p className="mt-4 text-white/70 max-w-prose">
                Our structures marry desirable aesthetics with durable comforts and a strong focus on environmental wellbeing, including rooftop lounges, fitness studios, and concierge services.
              </p>
            </motion.div>
          </div>
        </Section>

        {/* Testimonials with 3D cards */}
        <Section id="testimonials" dark>
          <h3 className="font-heading text-3xl md:text-4xl">What Our Clients Say</h3>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i, index) => (
              <motion.div
                key={i}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300 card-3d"
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 2,
                  rotateX: 1,
                  z: 20
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold">
                    {i}
                  </div>
                  <div>
                    <div className="font-medium">Investor {i}</div>
                    <div className="text-xs text-white/60">Nairobi, KE</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/80">
                  "REALAIST helped me access a pre-launch opportunity with transparent numbers. Performance has matched the projections."
                </p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Insights with enhanced 3D effects */}
        <Section id="insights">
          <h3 className="font-heading text-3xl md:text-4xl">Insights</h3>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { img: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200", title: "Quarterly Yield Outlook" },
              { img: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1200", title: "Market Trends Analysis" },
              { img: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200", title: "Investment Strategies" }
            ].map((article, i) => (
              <motion.a 
                key={i} 
                href="#" 
                className="group block rounded-2xl overflow-hidden border border-white/10 bg-white/5 card-3d"
                whileHover={{ scale: 1.02, rotateY: 2 }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <img className="h-48 w-full object-cover" src={article.img} alt="blog" />
                <div className="p-5">
                  <div className="text-xs tracking-widest opacity-70">MARKET</div>
                  <h4 className="font-heading text-xl mt-1">{article.title}</h4>
                  <p className="text-sm text-white/70 mt-2">Signals from prime Nairobi and coastal corridors; what to expect next quarter.</p>
                  <span className="inline-block mt-3 text-sm opacity-80 group-hover:opacity-100 transition-opacity">Read Article →</span>
                </div>
              </motion.a>
            ))}
          </div>
        </Section>

        {/* Contact with 3D form elements */}
        <Section id="contact" dark>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-heading text-3xl md:text-4xl">Let's talk investments</h3>
              <p className="mt-3 text-white/70 max-w-prose">Fill the form and our team will respond within 24 hours.</p>
              <form className="mt-8 grid grid-cols-1 gap-4 max-w-lg" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name');
                const email = formData.get('email');
                const phone = formData.get('phone');
                const message = formData.get('message');
                
                // Create mailto link with form data
                const mailtoLink = `mailto:Sales.realaist@gmail.com?subject=Contact from ${name}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0APhone: ${phone}%0D%0A%0D%0AMessage:%0D%0A${message}`;
                window.open(mailtoLink);
              }}>
                <motion.input 
                  name="name"
                  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors"
                  placeholder="Name"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.input 
                  name="email"
                  type="email"
                  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors"
                  placeholder="Email"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.input 
                  name="phone"
                  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors"
                  placeholder="Phone"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.textarea 
                  name="message"
                  rows={4} 
                  className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors resize-none"
                  placeholder="Message"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" className="accent-[#C7A667]" required /> I agree to the privacy policy
                </label>
                <motion.button 
                  type="submit"
                  className="mt-2 w-max px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
            <motion.div 
              className="rounded-2xl border border-white/10 bg-white/5 p-6 card-3d"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="font-heading text-xl">REALAIST</div>
              <p className="text-white/70 mt-2 text-sm">Prominade - General Mathenge</p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="text-white/70">
                  <div className="font-medium">Phone: 0707 726 297</div>
                  <div className="font-medium">Email: Sales.realaist@gmail.com</div>
                </div>
                <div className="flex gap-3">
                  <motion.a 
                    href="tel:0707726297" 
                    className="px-4 py-2 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all btn-3d"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Call Now
                  </motion.a>
                  <motion.a 
                    href="mailto:Sales.realaist@gmail.com" 
                    className="px-4 py-2 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all btn-3d"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Email
                  </motion.a>
                </div>
              </div>
              <img className="mt-6 rounded-xl border border-white/10 w-full h-48 object-cover" src="https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="office location" />
            </motion.div>
          </div>
        </Section>

        {/* Footer with 3D effects */}
        <motion.footer 
          className="bg-[#0B0C0E] text-white/70"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="border border-dashed border-white/60 rounded px-2.5 py-1">
                <span className="font-logo tracking-[0.25em] text-sm text-white/80">REALAIST</span>
              </div>
              <span className="text-xs">© {new Date().getFullYear()} REALAIST. All rights reserved.</span>
            </div>
            <nav className="text-xs flex gap-6">
              {["Privacy", "Terms", "LinkedIn", "Instagram", "X"].map((item, index) => (
                <motion.a 
                  key={item}
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </div>
        </motion.footer>
      </div>
    </>
  );
}