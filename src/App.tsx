import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

// REALAIST – Luxury Real Estate Landing Page
const offPlanProjects = [
  {
    name: "Escada",
    price: "KSh 3.7M",
    location: "Gigiri / Westlands",
    summary:
      "Curated 1–2 bed residences minutes from the city's social and entertainment hub. Designed for dependable yields and elevated living.",
    facts: ["2", "2", "1,200 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  {
    name: "Azure Bay Villas",
    price: "KSh 28M",
    location: "Diani Beach",
    summary:
      "Ocean-view villas with private terraces and access to a lifestyle concierge. Strong short-let demand profile.",
    facts: ["4", "3", "20,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
];

const completedProjects = [
  {
    name: "The Grove",
    price: "KSh 42M",
    location: "Karen – Gated Community",
    summary:
      "Townhouses wrapped in greenery with clubhouse amenities and strong family rental demand.",
    facts: ["4", "3", "25,000 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
  {
    name: "Skyline Heights",
    price: "KSh 18M",
    location: "Westlands",
    summary:
      "Luxury apartments with panoramic city views and premium amenities. Perfect for urban professionals.",
    facts: ["3", "2", "1,800 sq ft"],
    factLabels: ["Beds", "Baths", "Square Feet"],
    hero: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600",
    gallery: [
      "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  },
];

const testimonials = [
  {
    id: 1,
    name: "Investor 1",
    location: "Nairobi, KE",
    testimonial: "REALAIST helped me access a pre-launch opportunity with transparent numbers. Performance has matched the projections."
  },
  {
    id: 2,
    name: "Investor 2", 
    location: "Mombasa, KE",
    testimonial: "The team's expertise in luxury real estate is unmatched. They guided me through every step of the investment process."
  },
  {
    id: 3,
    name: "Investor 3",
    location: "Diani, KE", 
    testimonial: "Outstanding returns on my beachfront property investment. REALAIST's market insights are invaluable."
  }
];

const blogs = [
  {
    id: 1,
    title: "Kenya's Real Estate Market: 2024 Investment Opportunities",
    excerpt: "Discover the top investment opportunities in Kenya's booming real estate market. From Nairobi's urban developments to coastal luxury properties, find out where smart money is flowing.",
    author: "REALAIST Team",
    date: "March 15, 2024",
    category: "Market",
    readTime: 5
  },
  {
    id: 2,
    title: "Off-Plan vs Completed Properties: Which Offers Better Returns?",
    excerpt: "Compare the pros and cons of investing in off-plan versus completed properties. Learn which strategy aligns with your investment goals and risk tolerance.",
    author: "Investment Analyst",
    date: "March 10, 2024",
    category: "Guide",
    readTime: 7
  },
  {
    id: 3,
    title: "Luxury Real Estate Trends in East Africa",
    excerpt: "Explore the latest trends in luxury real estate across East Africa. From sustainable design to smart home technology, see what's driving the market.",
    author: "Market Expert",
    date: "March 5, 2024",
    category: "Trends",
    readTime: 6
  }
];

const howItWorksSteps = [
  {
    title: "Sign Up & List Property",
    description: "Property owners and developers register their properties on our platform, providing detailed information and high-quality images for potential investors.",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "Capture Leads & Build Database",
    description: "Our platform attracts qualified investors and builds a comprehensive database of potential buyers interested in premium real estate opportunities.",
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "Nurture & Convert Leads",
    description: "We provide personalized support and guidance throughout the investment process, helping investors make informed decisions and complete successful transactions.",
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

// Search suggestions data
const searchSuggestions = [
  "Apartments", "Gated Communities", "Beach Villas", "Commercial Properties",
  "1 Bedroom", "2 Bedroom", "3+ Bedroom", "Penthouse", "Townhouse",
  "Nairobi", "Mombasa", "Diani", "Karen", "Westlands", "Gigiri"
];

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

function Section({ id, children, dark = false, isDarkMode = true }: { id: string; children: React.ReactNode; dark?: boolean; isDarkMode?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`relative transition-colors duration-300 ${
        dark 
          ? (isDarkMode ? "bg-[#0E0E10]" : "bg-gray-100") 
          : (isDarkMode ? "bg-[#111217]" : "bg-white")
      }`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut"
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">{children}</div>
    </motion.section>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestionsVisible, setSearchSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(searchSuggestions);
  const [activeTab, setActiveTab] = useState('Buy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertiesCarouselIndex, setPropertiesCarouselIndex] = useState(0);

  const [offPlanCarouselIndex, setOffPlanCarouselIndex] = useState(0);
  const [completedCarouselIndex, setCompletedCarouselIndex] = useState(0);
  const [testimonialsCarouselIndex, setTestimonialsCarouselIndex] = useState(0);
  const [blogsCarouselIndex, setBlogsCarouselIndex] = useState(0);
  const [howItWorksCarouselIndex, setHowItWorksCarouselIndex] = useState(0);
  const [themeWidgetOpen, setThemeWidgetOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Typing animation state
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const heroRef = useRef(null);

  // Example search queries for typing animation
  const searchExamples = [
    "Search apartments in Nairobi",
    "Find beach villas in Diani",
    "Look for gated communities in Karen",
    "Browse luxury properties in Westlands"
  ];

  // Search functionality with localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem('realaist_search_history');
    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
  }, []);

  // Typing animation effect
  useEffect(() => {
    const currentExample = searchExamples[typingIndex];
    
    if (!isDeleting) {
      // Typing effect
      if (typingText.length < currentExample.length) {
        const timeout = setTimeout(() => {
          setTypingText(currentExample.slice(0, typingText.length + 1));
        }, 60);
        return () => clearTimeout(timeout);
      } else {
        // Pause before deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting effect
      if (typingText.length > 0) {
        const timeout = setTimeout(() => {
          setTypingText(typingText.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        // Move to next example
        setIsDeleting(false);
        setTypingIndex((prev) => (prev + 1) % searchExamples.length);
      }
    }
  }, [typingText, typingIndex, isDeleting, searchExamples]);


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
    navigate(`/houses?search=${encodeURIComponent(query)}`);
  };

  const handleExploreHouses = () => {
    console.log('Explore Houses clicked - navigating to /houses');
    navigate('/houses');
  };

  const handleBookConsultation = () => {
    // Scroll to contact section
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };





  return (
    <>
      {/* Preload Montserrat Medium font */}
      <link 
        rel="preload" 
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap" 
        as="style"
      />
      
      {/* Custom styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aboreto&family=Montserrat:wght@400;500;600;900&family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        :root { 
          --bg: #0E0E10; 
          --ink: #F5F6F7; 
          --bg-light: #FFFFFF;
          --ink-light: #1A1A1A;
        }
        body.dark { --bg: #0E0E10; --ink: #F5F6F7; }
        body.light { --bg: #FFFFFF; --ink: #1A1A1A; }
        html { scroll-behavior: smooth; }
        body { position: relative; }
        .font-heading { 
          font-family: 'Cinzel', 'Playfair Display', serif !important; 
          font-weight: 500 !important; 
          letter-spacing: 0.05em;
        }
        h1.font-heading, h2.font-heading, h3.font-heading, h4.font-heading {
          font-family: 'Cinzel', 'Playfair Display', serif !important;
          font-weight: 500 !important;
          letter-spacing: 0.05em;
        }
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
        .hero-text-shadow {
          text-shadow: 0 0 30px rgba(199, 166, 103, 0.3);
        }
        .video-overlay {
          background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
        }
        .architectural-element {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.05);
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
          filter: brightness(0.8) contrast(1.05) saturate(1.02);
          transform: scale(1.01);
          transition: transform 0.5s ease;
          z-index: 1;
        }
        .architecture-background:hover .architecture-video {
          transform: scale(1.05);
        }
        .video-overlay {
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%);
        }
        .video-container {
          position: relative;
          overflow: hidden;
        }
        .video-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%);
          z-index: 2;
          pointer-events: none;
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
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {/* Floating Logo - Visible across all pages */}
        <FloatingLogo isDarkMode={isDarkMode} />

      {/* Mobile Theme Widget */}
      <motion.div
        className="fixed right-2 top-1/3 transform -translate-y-1/2 z-30 md:hidden"
        initial={{ x: 80 }}
        animate={{ x: themeWidgetOpen ? 0 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className={`backdrop-blur-sm border rounded-l-xl p-3 shadow-lg transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-black/70 border-white/10' 
            : 'bg-white/70 border-gray-200/50'
        }`}>
          <div className="space-y-3">
            <motion.button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-colors ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                  : 'bg-black/10 border-gray-300/50 hover:bg-black/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Theme Toggle Button */}
      <motion.button
        className={`fixed right-2 top-1/4 transform -translate-y-1/2 z-50 md:hidden w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-lg transition-all duration-300 opacity-60 hover:opacity-100 ${
          isDarkMode 
            ? 'bg-black/60 border-white/10 text-white/80' 
            : 'bg-white/60 border-gray-200/50 text-gray-600'
        }`}
        onClick={() => {
          console.log('Mobile theme toggle clicked!');
          toggleTheme();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </motion.button>

      {/* Wrapper */}
      <div className={`grain font-body transition-colors duration-300 ${isDarkMode ? 'text-white bg-[#111217]' : 'text-gray-900 bg-white'}`}>
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
              <a href="/houses" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Investors</a>
              <a href="/blogs" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Blogs</a>
              <a href="#contact" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
              <motion.button
                className="px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
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
                <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'} ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></span>
                <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'} ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></span>
                <span className={`block w-5 h-0.5 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'} ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`}></span>
          </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <motion.div
            className={`md:hidden absolute top-16 left-0 right-0 backdrop-blur-sm border-b transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-black/95 border-white/10' 
                : 'bg-white/95 border-gray-200'
            }`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: mobileMenuOpen ? 1 : 0,
              height: mobileMenuOpen ? 'auto' : 0
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 py-6 space-y-4">
              <a href="/houses" className={`block transition-colors py-2 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Investors</a>
              <a href="/blogs" className={`block transition-colors py-2 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Blogs</a>
              <a href="#contact" className={`block transition-colors py-2 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
              <motion.button
                className="w-full px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        </motion.header>

        <main>
          {/* Hero Section with 3D Video Background */}
          <motion.section 
            ref={heroRef}
            className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-16 ${
              isDarkMode ? 'bg-[#0E0E10]' : 'bg-white'
            }`}
          >
          {/* 3D Real Estate Video Background */}
          <div className="architecture-background relative w-full h-full">
            {/* Fallback background image */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
                backgroundImage: 'url("https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600")'
              }}
            ></div>
            {/* High-Quality 3D Real Estate Video */}
            <video
              className="architecture-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600"
              onLoadStart={() => console.log('Video loading started')}
              onCanPlay={() => console.log('Video can play - should be visible now')}
              onError={(e) => {
                console.log('Video error:', e);
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
                // Video failed, but we already have a fallback background image
              }}
            >
              {/* Reliable Real Estate Videos */}
              <source src="https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_30fps.mp4" type="video/mp4" />
              <source src="https://videos.pexels.com/video-files/31617692/13470975_1920_1080_24fps.mp4" type="video/mp4" />
              <source src="https://videos.pexels.com/video-files/33350039/14200445_2560_1440_60fps.mp4" type="video/mp4" />
            </video>
            

            
            {/* Minimalistic architectural elements */}
            <div className="architecture-overlay">
              <div className="absolute top-20 left-10 w-24 h-24 border border-white/10 transform rotate-45"></div>
              <div className="absolute bottom-20 right-10 w-16 h-16 border border-white/10 transform -rotate-45"></div>
              </div>
              </div>
              
          {/* Lighter overlay to show video better */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 z-10" />

          {/* Minimalistic Hero Content */}
          <motion.div 
            className="relative z-20 text-center px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {/* Main Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-16"
            >
                              <h1 
                  className="font-heading text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight text-white hero-text-shadow"
                  style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}
                >
                  
            </h1>
            </motion.div>
          </motion.div>



          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <motion.div 
                className="w-1 h-3 bg-white/60 rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.section>

        {/* Search Section */}
        <motion.section 
          className={`py-8 ${
            isDarkMode ? 'bg-[#0E0E10]' : 'bg-gray-100'
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="mx-auto max-w-4xl px-6">
            <div className="bg-[#C7A667] border border-[#B89657] rounded-lg p-6 shadow-lg">
              {/* Search Input */}
              <div className="flex gap-3 mb-4">
                    <input 
                  className="flex-1 bg-white/90 border-none outline-none text-lg text-gray-900 placeholder-gray-400 italic rounded-md px-3 py-2 transition-colors duration-300 focus:bg-white"
                  placeholder={typingText || "Search area & properties"}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchSuggestionsVisible(true)}
                    />
                <motion.button 
                  className="p-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExploreHouses}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </motion.button>
                          </div>
              
              {/* Action Buttons */}
                  <div className="flex gap-3">
                <motion.a 
                  href="/houses"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors text-base flex items-center justify-center relative z-10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 1.05 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Explore Houses clicked - navigating to /houses');
                    window.location.href = '/houses';
                  }}
                    >
                      Explore Houses
                </motion.a>
                    <motion.a 
                      href="#contact"
                      className="flex-1 px-4 py-2 bg-white/90 text-gray-900 font-medium rounded-md hover:bg-white transition-colors text-sm border border-white/50 flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setConsultationModalOpen(true);
                      }}
                    >
                      Book Consultation
                    </motion.a>
                  </div>
              
              {searchSuggestionsVisible && filteredSuggestions.length > 0 && (
                <div className="mt-2 bg-white/95 border border-gray-200 rounded-md shadow-lg">
                  {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer transition-colors text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => handleSearch(suggestion)}
                    >
                      {suggestion}
                </div>
                  ))}
                </div>
              )}
              </div>
            </div>
        </motion.section>

        {/* About / Trust with 3D effects */}
        <Section id="about" dark isDarkMode={isDarkMode}>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 
                className="font-heading text-3xl md:text-4xl"
                style={{ 
                  fontFamily: "'Cinzel', 'Playfair Display', serif",
                  fontWeight: 500,
                  letterSpacing: '0.05em'
                }}
              >
                REALAIST
              </h2>
              <p className={`mt-4 max-w-prose transition-colors duration-300 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                REALAIST curates high-performance properties across Kenya for hybrid investors seeking dependable returns and elevated living. We combine design excellence with rigorous underwriting and transparent reporting.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-8">
                {[
                  { k: "KES 12B+", v: "Assets Listed" },
                  { k: "200+", v: "Investors Served" },
                  { k: "11.4%", v: "Avg Yield" },
                ].map((s, index) => (
                  <motion.div 
                    key={s.k} 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="font-heading text-2xl text-[#C7A667] mb-1">{s.k}</div>
                    <div className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-white/70' : 'text-gray-600'
                    }`}>{s.v}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div 
              className="relative overflow-hidden mt-10"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 0.8, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h4 
                className={`text-left mb-8 text-2xl font-heading transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                style={{ 
                  fontFamily: "'Cinzel', 'Playfair Display', serif",
                  fontWeight: 500,
                  letterSpacing: '0.05em'
                }}
              >
                Trusted by...
              </h4>
              <div 
                className="flex gap-8 animate-scroll"
                style={{
                  animation: 'scroll 20s linear infinite'
                }}
              >
                {/* First set of partners */}
                {[
                  { name: "BlackRock", logo: "/logos/BlackRock-logo.png" },
                  { name: "Knight Frank", logo: "/logos/Knight_Frank_Logo.svg.png" },
                  { name: "HassConsult", logo: "/logos/hassconsult.png" }
                ].map((partner, index) => (
                  <motion.div 
                    key={`first-${partner.name}`} 
                    className="flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className={`max-w-full object-contain transition-opacity duration-300 ${
                        isDarkMode 
                          ? 'filter brightness-0 invert opacity-70 hover:opacity-100' 
                          : 'opacity-70 hover:opacity-100'
                      } ${
                        partner.name === "BlackRock" 
                          ? "max-h-14" 
                          : "max-h-12"
                      }`}
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const textFallback = document.createElement('div');
                        textFallback.className = `text-xs tracking-wider ${
                          isDarkMode ? 'text-white' : 'text-gray-700'
                        }`;
                        textFallback.textContent = partner.name;
                        target.parentElement?.appendChild(textFallback);
                      }}
                    />
                  </motion.div>
                ))}
                {/* Duplicate set for seamless loop */}
                {[
                  { name: "BlackRock", logo: "/logos/BlackRock-logo.png" },
                  { name: "Knight Frank", logo: "/logos/Knight_Frank_Logo.svg.png" },
                  { name: "HassConsult", logo: "/logos/hassconsult.png" }
                ].map((partner, index) => (
                  <motion.div 
                    key={`second-${partner.name}`} 
                    className="flex-shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className={`max-w-full object-contain transition-opacity duration-300 ${
                        isDarkMode 
                          ? 'filter brightness-0 invert opacity-70 hover:opacity-100' 
                          : 'opacity-70 hover:opacity-100'
                      } ${
                        partner.name === "BlackRock" 
                          ? "max-h-14" 
                          : "max-h-12"
                      }`}
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const textFallback = document.createElement('div');
                        textFallback.className = `text-xs tracking-wider ${
                          isDarkMode ? 'text-white' : 'text-gray-700'
                        }`;
                        textFallback.textContent = partner.name;
                        target.parentElement?.appendChild(textFallback);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </Section>

        {/* How It Works */}
        <motion.section
          id="how-it-works"
          className={`py-20 ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-white'}`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className={`font-heading text-4xl md:text-5xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                How It Works
              </h2>
              <p className={`text-lg max-w-3xl mx-auto transition-colors duration-300 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                Discover our streamlined process for connecting investors with premium real estate opportunities
              </p>
            </motion.div>

            {/* How It Works Carousel */}
            <div className="relative">
              {/* Desktop: Show all steps side by side */}
              <div className="hidden md:grid md:grid-cols-3 md:gap-8">
                {howItWorksSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className={`h-full border rounded-2xl p-8 transition-colors duration-300 ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-center">
                        <div className="text-sm text-[#C7A667] mb-4 font-light tracking-wider">
                          STEP {index + 1}
                        </div>
                        <motion.img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-48 object-cover rounded-xl mb-6"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <h3 className={`font-heading text-2xl font-bold mb-4 transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                          isDarkMode ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile: Carousel */}
              <div className="md:hidden relative">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex"
                    style={{ width: `${howItWorksSteps.length * 100}%` }}
                    animate={{ x: `${-howItWorksCarouselIndex * (100 / howItWorksSteps.length)}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {howItWorksSteps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        className="flex-shrink-0 px-2"
                        style={{ width: `${100 / howItWorksSteps.length}%` }}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      >
                        <div className={`h-full border rounded-2xl p-4 transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="text-center">
                            <div className="text-xs text-[#C7A667] mb-3 font-light tracking-wider">
                              STEP {index + 1}
                            </div>
                            <motion.img
                              src={step.image}
                              alt={step.title}
                              className="w-full h-32 object-cover rounded-xl mb-3"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                            />
                            <h3 className={`font-heading text-lg font-bold mb-2 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {step.title}
                            </h3>
                            <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                              isDarkMode ? 'text-white/70' : 'text-gray-600'
                            }`}>
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Mobile Navigation Buttons */}
                <div className="absolute top-1/2 left-1 transform -translate-y-1/2 z-10 pointer-events-none">
                  <motion.button
                    className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto shadow-lg text-sm ${
                      isDarkMode 
                        ? 'bg-black/70 border-white/30 text-white hover:bg-black/90' 
                        : 'bg-white/90 border-gray-300 text-gray-700 hover:bg-white'
                    }`}
                    onClick={() => setHowItWorksCarouselIndex(Math.max(0, howItWorksCarouselIndex - 1))}
                    disabled={howItWorksCarouselIndex === 0}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ←
                  </motion.button>
                </div>
                <div className="absolute top-1/2 right-1 transform -translate-y-1/2 z-10 pointer-events-none">
                  <motion.button
                    className={`w-8 h-8 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto shadow-lg text-sm ${
                      isDarkMode 
                        ? 'bg-black/70 border-white/30 text-white hover:bg-black/90' 
                        : 'bg-white/90 border-gray-300 text-gray-700 hover:bg-white'
                    }`}
                    onClick={() => setHowItWorksCarouselIndex(Math.min(howItWorksSteps.length - 1, howItWorksCarouselIndex + 1))}
                    disabled={howItWorksCarouselIndex === howItWorksSteps.length - 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    →
                  </motion.button>
                </div>

                {/* Mobile Dots Indicator */}
                <div className="flex justify-center mt-4 gap-1.5">
                  {howItWorksSteps.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        index === howItWorksCarouselIndex
                          ? 'bg-[#C7A667]'
                          : isDarkMode
                          ? 'bg-white/30'
                          : 'bg-gray-300'
                      }`}
                      onClick={() => setHowItWorksCarouselIndex(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

                            {/* Completed Properties Carousel */}
        <Section id="off-plan-properties" dark isDarkMode={isDarkMode}>
          <h3 className="font-heading text-3xl md:text-4xl">Off-Plan Properties</h3>
          <div className="mt-6 relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl">
              <motion.div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${offPlanCarouselIndex * 100}%)` }}
              >
                {offPlanProjects.map((p, index) => (
                  <div key={p.name} className="w-full flex-shrink-0">
                    <motion.article 
                      className="relative grid md:grid-cols-12 gap-6 items-stretch parallax-section p-6"
                      initial={{ opacity: 0, y: 100 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                    >
                      <motion.div 
                        className={`md:col-span-7 rounded-2xl overflow-hidden border card-3d transition-colors duration-300 ${
                          isDarkMode ? 'border-white/10' : 'border-gray-200'
                        }`}
                        whileHover={{ scale: 1.03, rotateY: 2 }}
                      >
                        <img src={p.hero} alt={p.name} className="h-full w-full object-cover transition-transform duration-500" />
              </motion.div>
                      <div className="md:col-span-5 flex flex-col">
                        <div className={`flex-1 border rounded-2xl p-6 transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className="font-heading text-2xl">{p.name}</h4>
                          <div className={`text-sm tracking-widest transition-colors duration-300 mt-1 flex items-center gap-1 ${
                            isDarkMode ? 'opacity-70' : 'text-gray-500'
                          }`}>
                            <span className="text-[#C7A667]">📍</span>
                            {p.location}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="text-lg font-medium text-[#C7A667]">{p.price}</div>
                            <div className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-300 ${
                              isDarkMode 
                                ? 'border-white/20 bg-white/5 text-white' 
                                : 'border-gray-300 bg-gray-100 text-gray-900'
                            }`}>
                              Est. Income: KES 350,000/mo
                            </div>
                          </div>
                          <p className={`mt-3 text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-white/70' : 'text-gray-600'
                          }`}>{p.summary}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {p.facts.map((f, factIndex) => (
                              <span key={`${p.name}-${factIndex}-${f}`} className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 flex items-center gap-1 ${
                                isDarkMode 
                                  ? 'border-white/20 bg-white/5 text-white' 
                                  : 'border-gray-300 bg-gray-100 text-gray-700'
                              }`}>
                                {getFactIcon(factIndex, isDarkMode)}
                                {f}
                              </span>
                            ))}
                          </div>
                          <div className="mt-6 flex gap-3">
                            <a 
                              href={`/property/${p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                              className="px-5 py-2.5 rounded-full bg-[#C7A667] text-black text-sm font-medium relative z-50 inline-block text-center hover:bg-[#B89657] transition-colors"
                            >
                              View Details
                            </a>
                            <motion.button 
                              className="btn-3d px-5 py-2.5 rounded-full border border-white/30 text-sm hover:border-[#C7A667] hover:text-[#C7A667] transition-all flex items-center gap-2"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <img 
                                src="/icons/phone.png" 
                                alt="Phone" 
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                                style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                              />
                              Contact
                            </motion.button>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          {p.gallery.map((g, i) => (
                            <motion.img 
                              key={i} 
                              src={g} 
                              alt={`${p.name} ${i + 1}`} 
                              className={`rounded-xl border h-40 w-full object-cover card-3d transition-colors duration-300 ${
                                isDarkMode ? 'border-white/10' : 'border-gray-200'
                              }`}
                              whileHover={{ scale: 1.05, rotateY: 1 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-5 pointer-events-none">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setOffPlanCarouselIndex(Math.max(0, offPlanCarouselIndex - 1))}
                disabled={offPlanCarouselIndex === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ←
              </motion.button>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-5 pointer-events-none">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setOffPlanCarouselIndex(Math.min(offPlanProjects.length - 1, offPlanCarouselIndex + 1))}
                disabled={offPlanCarouselIndex === offPlanProjects.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                →
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {offPlanProjects.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === offPlanCarouselIndex 
                      ? 'bg-[#C7A667]' 
                      : (isDarkMode ? 'bg-white/30' : 'bg-gray-300')
                  }`}
                  onClick={() => setOffPlanCarouselIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Completed Properties Carousel */}
        <Section id="completed-properties" dark isDarkMode={isDarkMode}>
          <h3 className="font-heading text-3xl md:text-4xl">Completed Properties</h3>
          <div className="mt-6 relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl">
              <motion.div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${completedCarouselIndex * 100}%)` }}
              >
                {completedProjects.map((p, index) => (
                  <div key={p.name} className="w-full flex-shrink-0">
              <motion.article 
                      className="relative grid md:grid-cols-12 gap-6 items-stretch parallax-section p-6"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <motion.div 
                        className={`md:col-span-7 rounded-2xl overflow-hidden border card-3d transition-colors duration-300 ${
                          isDarkMode ? 'border-white/10' : 'border-gray-200'
                        }`}
                  whileHover={{ scale: 1.03, rotateY: 2 }}
                >
                  <img src={p.hero} alt={p.name} className="h-full w-full object-cover transition-transform duration-500" />
                </motion.div>
                <div className="md:col-span-5 flex flex-col">
                        <div className={`flex-1 border rounded-2xl p-6 transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className="font-heading text-2xl">{p.name}</h4>
                          <div className={`text-sm tracking-widest transition-colors duration-300 mt-1 flex items-center gap-1 ${
                            isDarkMode ? 'opacity-70' : 'text-gray-500'
                          }`}>
                            <span className="text-[#C7A667]">📍</span>
                            {p.location}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="text-lg font-medium text-[#C7A667]">{p.price}</div>
                            <div className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-300 ${
                              isDarkMode 
                                ? 'border-white/20 bg-white/5 text-white' 
                                : 'border-gray-300 bg-gray-100 text-gray-900'
                            }`}>
                              Est. Income: KES 350,000/mo
                            </div>
                          </div>
                          <p className={`mt-3 text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-white/70' : 'text-gray-600'
                          }`}>{p.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                            {p.facts.map((f, factIndex) => (
                              <span key={`${p.name}-${factIndex}-${f}`} className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 flex items-center gap-1 ${
                                isDarkMode 
                                  ? 'border-white/20 bg-white/5 text-white' 
                                  : 'border-gray-300 bg-gray-100 text-gray-700'
                              }`}>
                                {getFactIcon(factIndex, isDarkMode)}
                                {f}
                              </span>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                            <a 
                              href={`/property/${p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                              className="px-5 py-2.5 rounded-full bg-[#C7A667] text-black text-sm font-medium relative z-50 inline-block text-center hover:bg-[#B89657] transition-colors"
                      >
                        View Details
                            </a>
                      <motion.button 
                        className="btn-3d px-5 py-2.5 rounded-full border border-white/30 text-sm hover:border-[#C7A667] hover:text-[#C7A667] transition-all flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img 
                          src="/icons/phone.png" 
                          alt="Phone" 
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                        />
                        Contact
                      </motion.button>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {p.gallery.map((g, i) => (
                      <motion.img 
                        key={i} 
                        src={g} 
                        alt={`${p.name} ${i + 1}`} 
                              className={`rounded-xl border h-40 w-full object-cover card-3d transition-colors duration-300 ${
                                isDarkMode ? 'border-white/10' : 'border-gray-200'
                              }`}
                        whileHover={{ scale: 1.05, rotateY: 1 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.article>
                  </div>
            ))}
              </motion.div>
          </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-5 pointer-events-none">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setOffPlanCarouselIndex(Math.max(0, offPlanCarouselIndex - 1))}
                disabled={offPlanCarouselIndex === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ←
              </motion.button>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-5 pointer-events-none">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors pointer-events-auto ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setOffPlanCarouselIndex(Math.min(offPlanProjects.length - 1, offPlanCarouselIndex + 1))}
                disabled={offPlanCarouselIndex === offPlanProjects.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                →
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {offPlanProjects.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === offPlanCarouselIndex 
                      ? 'bg-[#C7A667]' 
                      : (isDarkMode ? 'bg-white/30' : 'bg-gray-300')
                  }`}
                  onClick={() => setOffPlanCarouselIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Testimonials Carousel */}
        <Section id="testimonials" dark isDarkMode={isDarkMode}>
          <h3 className="font-heading text-3xl md:text-4xl">What Our Clients Say</h3>
          <div className="mt-6 relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${testimonialsCarouselIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 p-6">
                    <motion.div
                      className={`group rounded-2xl border p-6 transition-all duration-300 card-3d h-full ${
                        isDarkMode 
                          ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
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
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold">
                          {testimonial.id}
                  </div>
                  <div>
                          <div className="font-medium">{testimonial.name}</div>
                          <div className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? 'text-white/60' : 'text-gray-500'
                          }`}>{testimonial.location}</div>
                  </div>
                </div>
                      <p className={`mt-4 text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white/80' : 'text-gray-700'
                      }`}>
                        "{testimonial.testimonial}"
                      </p>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setTestimonialsCarouselIndex(Math.max(0, testimonialsCarouselIndex - 1))}
                disabled={testimonialsCarouselIndex === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ←
              </motion.button>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setTestimonialsCarouselIndex(Math.min(testimonials.length - 1, testimonialsCarouselIndex + 1))}
                disabled={testimonialsCarouselIndex === testimonials.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                →
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === testimonialsCarouselIndex 
                      ? 'bg-[#C7A667]' 
                      : (isDarkMode ? 'bg-white/30' : 'bg-gray-300')
                  }`}
                  onClick={() => setTestimonialsCarouselIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Blogs Carousel */}
        <Section id="blogs" dark isDarkMode={isDarkMode}>
          <h3 className="font-heading text-3xl md:text-4xl">Feature Blogs</h3>
          <div className="mt-6 relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl">
              <motion.div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${blogsCarouselIndex * 100}%)` }}
              >
                {blogs.map((blog, index) => (
                  <div key={blog.id} className="w-full flex-shrink-0 p-6">
                    <motion.article
                      className={`group rounded-2xl border p-6 transition-all duration-300 card-3d h-full ${
                        isDarkMode 
                          ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
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
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold text-sm">
                          {blog.category}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{blog.author}</div>
                          <div className={`text-xs transition-colors duration-300 ${
                            isDarkMode ? 'text-white/60' : 'text-gray-500'
                          }`}>{blog.date}</div>
                        </div>
                      </div>
                      <h4 className={`text-xl font-heading mb-3 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`} style={{ 
                        fontFamily: "'Cinzel', 'Playfair Display', serif",
                        fontWeight: 500,
                        letterSpacing: '0.05em'
                      }}>
                        {blog.title}
                      </h4>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-white/80' : 'text-gray-700'
                      }`}>
                        {blog.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 ${
                          isDarkMode 
                            ? 'border-white/20 bg-white/5 text-white/70' 
                            : 'border-gray-300 bg-gray-100 text-gray-600'
                        }`}>
                          {blog.readTime} min read
                        </span>
                        <motion.button 
                          className={`text-sm font-medium transition-colors duration-300 ${
                            isDarkMode 
                              ? 'text-[#C7A667] hover:text-[#B89657]' 
                              : 'text-[#C7A667] hover:text-[#B89657]'
                          }`}
                          onClick={() => navigate(`/blog/${blog.id}`)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Read More →
                        </motion.button>
                      </div>
                    </motion.article>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setBlogsCarouselIndex(Math.max(0, blogsCarouselIndex - 1))}
                disabled={blogsCarouselIndex === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ←
              </motion.button>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
              <motion.button
                className={`w-12 h-12 rounded-full backdrop-blur-sm border flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'bg-black/50 border-white/20 text-white hover:bg-black/70' 
                    : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
                }`}
                onClick={() => setBlogsCarouselIndex(Math.min(blogs.length - 1, blogsCarouselIndex + 1))}
                disabled={blogsCarouselIndex === blogs.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                →
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {blogs.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === blogsCarouselIndex 
                      ? 'bg-[#C7A667]' 
                      : (isDarkMode ? 'bg-white/30' : 'bg-gray-300')
                  }`}
                  onClick={() => setBlogsCarouselIndex(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Contact with 3D form elements */}
        <Section id="contact" dark isDarkMode={isDarkMode}>
          <div className="flex justify-center items-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl"
            >
              <h3 className="font-heading text-3xl md:text-4xl text-center">Let's talk investments</h3>
              <p className={`mt-3 max-w-prose mx-auto text-center transition-colors duration-300 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>Fill the form and our team will respond within 24 hours.</p>
              <form className="mt-8 grid grid-cols-1 gap-4 max-w-lg mx-auto" onSubmit={(e) => {
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
                  className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Name"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.input 
                  name="email"
                  type="email"
                  className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Email"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.input 
                  name="phone"
                  className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Phone"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.textarea 
                  name="message"
                  rows={4} 
                  className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors resize-none ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Message"
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <label className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  <input type="checkbox" className="accent-[#C7A667]" required /> I agree to the privacy policy
                </label>
                <motion.button 
                  type="submit"
                  className="mt-2 w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </Section>
      </main>

      {/* Consultation Modal */}
      {consultationModalOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setConsultationModalOpen(false)}
        >
          <motion.div
            className={`w-full max-w-2xl rounded-2xl p-8 shadow-2xl ${
              isDarkMode 
                ? 'bg-[#0E0E10] border border-white/10' 
                : 'bg-white border border-gray-200'
            }`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`font-heading text-2xl md:text-3xl transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} style={{ 
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}>
                Book Consultation
              </h3>
              <motion.button
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setConsultationModalOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>
            
            <p className={`mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-white/70' : 'text-gray-600'
            }`}>
              Fill the form and our team will respond within 24 hours.
            </p>
            
            <form className="grid grid-cols-1 gap-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name');
              const email = formData.get('email');
              const phone = formData.get('phone');
              const message = formData.get('message');
              
              // Create mailto link with form data
              const mailtoLink = `mailto:Sales.realaist@gmail.com?subject=Consultation Request from ${name}&body=Name: ${name}%0D%0AEmail: ${email}%0D%0APhone: ${phone}%0D%0A%0D%0AMessage:%0D%0A${message}`;
              window.open(mailtoLink);
              setConsultationModalOpen(false);
            }}>
              <motion.input 
                name="name"
                className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Name"
                whileFocus={{ scale: 1.02 }}
                required
              />
              <motion.input 
                name="email"
                type="email"
                className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Email"
                whileFocus={{ scale: 1.02 }}
                required
              />
              <motion.input 
                name="phone"
                className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Phone"
                whileFocus={{ scale: 1.02 }}
                required
              />
              <motion.textarea 
                name="message"
                rows={4} 
                className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors resize-none ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Message"
                whileFocus={{ scale: 1.02 }}
                required
              />
              <label className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-white/70' : 'text-gray-600'
              }`}>
                <input type="checkbox" className="accent-[#C7A667]" required /> I agree to the privacy policy
              </label>
              <motion.button 
                type="submit"
                className="mt-2 w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
        </div>
    </>
  );
}