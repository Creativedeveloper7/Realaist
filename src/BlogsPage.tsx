import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

// Blog data
const blogs = [
  {
    id: 1,
    title: "Kenya's Real Estate Market: 2024 Investment Opportunities",
    excerpt: "Discover the top investment opportunities in Kenya's booming real estate market.",
    author: "REALAIST Team",
    date: "March 15, 2024",
    category: "Market Analysis",
    readTime: 5,
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["Market Trends", "Investment", "Kenya"]
  },
  {
    id: 2,
    title: "Off-Plan vs Completed Properties: Which Offers Better Returns?",
    excerpt: "A comprehensive comparison of off-plan and completed property investments.",
    author: "REALAIST Team",
    date: "March 10, 2024",
    category: "Investment Guide",
    readTime: 7,
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["Off-Plan", "Completed Properties", "ROI"]
  },
  {
    id: 3,
    title: "Luxury Real Estate Trends in East Africa",
    excerpt: "Explore the latest trends in luxury real estate across East Africa.",
    author: "REALAIST Team",
    date: "March 5, 2024",
    category: "Luxury Market",
    readTime: 6,
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["Luxury", "Trends", "East Africa"]
  }
];

// Search suggestions for blogs
const searchSuggestions = [
  "Market trends",
  "Investment opportunities",
  "Luxury properties",
  "Off-plan investments",
  "Sustainable real estate",
  "PropTech",
  "Nairobi real estate",
  "Coastal properties"
];

export default function BlogsPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestionsVisible, setSearchSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(searchSuggestions);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const blogsPerPage = 6;

  // Filter blogs based on search query
  const filteredBlogs = blogs.filter(blog => {
    const query = searchQuery.toLowerCase();
    return (
      blog.title.toLowerCase().includes(query) ||
      blog.excerpt.toLowerCase().includes(query) ||
      blog.category.toLowerCase().includes(query) ||
      blog.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const currentBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  // Search functionality
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
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchSuggestionsVisible(false);
  };

  return (
    <>
      {/* Floating Logo */}
      <div className={`fixed top-8 left-8 z-40 transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <motion.div
          className="font-logo text-2xl font-bold cursor-pointer"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          
        </motion.div>
      </div>

      {/* Mobile Theme Toggle Button */}
      <motion.button
        className={`fixed right-2 top-1/4 transform -translate-y-1/2 z-50 md:hidden w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center shadow-lg transition-all duration-300 opacity-60 hover:opacity-100 ${
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
              <motion.div 
                className={`border border-dashed rounded px-2.5 py-1 transition-colors duration-300 cursor-pointer ${
                  isDarkMode ? 'border-white/60' : 'border-gray-400'
                }`}
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`font-logo tracking-[0.25em] text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>REALAIST</span>
              </motion.div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="/houses" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Developers</a>
              <a href="/blogs" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Blogs</a>
              <a href="/#contact" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
              <motion.button
                className="px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login/Signup
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
              <a href="/#contact" className={`block transition-colors py-2 ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Contact</a>
              <motion.button
                className="w-full px-4 py-2 rounded-full bg-[#C7A667] text-black font-medium hover:bg-[#B89657] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login/Signup
              </motion.button>
            </div>
          </motion.div>
        </motion.header>

        <main className="pt-16">
          {/* Hero Section */}
          <motion.section 
            className={`relative py-20 ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-gray-50'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <motion.h1 
                  className="font-heading text-4xl md:text-6xl lg:text-7xl leading-none tracking-tight mb-6"
                  style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}
                >
                  Blogs
                </motion.h1>
                <motion.p 
                  className={`text-xl max-w-3xl mx-auto transition-colors duration-300 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Discover insights, trends, and expert analysis on Kenya's real estate market
                </motion.p>
              </div>
            </div>
          </motion.section>

          {/* Search Section */}
          <motion.section 
            className={`py-8 ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-white'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="mx-auto max-w-4xl px-6">
              <div className="bg-[#C7A667] border border-[#B89657] rounded-lg p-6 shadow-lg">
                {/* Search Input */}
                <div className="flex gap-3 mb-4">
                  <input 
                    className="flex-1 bg-white/90 border-none outline-none text-lg text-gray-900 placeholder-gray-400 italic rounded-md px-3 py-2 transition-colors duration-300 focus:bg-white"
                    placeholder="Search keywords or titles"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchSuggestionsVisible(true)}
                  />
                  <motion.button 
                    className="p-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                
                {/* Search Suggestions */}
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

          {/* Blogs Grid */}
          <motion.section 
            className={`py-16 ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-white'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {currentBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentBlogs.map((blog, index) => (
                    <motion.article
                      key={blog.id}
                      className={`group rounded-2xl border overflow-hidden transition-all duration-300 card-3d ${
                        isDarkMode 
                          ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
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
                      {/* Blog Image */}
                      <div className="relative overflow-hidden h-48">
                        <img 
                          src={blog.image} 
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 ${
                            isDarkMode 
                              ? 'border-white/20 bg-white/10 text-white/90' 
                              : 'border-gray-300 bg-white/90 text-gray-700'
                          }`}>
                            {blog.category}
                          </span>
                        </div>
                      </div>

                      {/* Blog Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold text-sm">
                            {blog.author.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{blog.author}</div>
                            <div className={`text-xs transition-colors duration-300 ${
                              isDarkMode ? 'text-white/60' : 'text-gray-500'
                            }`}>{blog.date}</div>
                          </div>
                        </div>

                        <h3 className={`text-xl font-heading mb-3 transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`} style={{ 
                          fontFamily: "'Cinzel', 'Playfair Display', serif",
                          fontWeight: 500,
                          letterSpacing: '0.05em'
                        }}>
                          {blog.title}
                        </h3>

                        <p className={`text-sm mb-4 transition-colors duration-300 ${
                          isDarkMode ? 'text-white/80' : 'text-gray-700'
                        }`}>
                          {blog.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className={`text-xs px-2 py-1 rounded-full border transition-colors duration-300 ${
                                isDarkMode 
                                  ? 'border-white/20 bg-white/5 text-white/70' 
                                  : 'border-gray-300 bg-gray-100 text-gray-600'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
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
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className={`text-6xl mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>📝</div>
                    <h3 className={`text-2xl font-heading mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>No blogs found</h3>
                    <p className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-white/60' : 'text-gray-600'
                    }`}>Try adjusting your search terms</p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.section>
        </main>
      </div>
    </>
  );
}
