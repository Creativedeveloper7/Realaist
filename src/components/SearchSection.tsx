import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchSuggestions, searchExamples } from '../data/constants';

interface SearchSectionProps {
  isDarkMode: boolean;
  onConsultationClick: () => void;
}

export function SearchSection({ isDarkMode, onConsultationClick }: SearchSectionProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestionsVisible, setSearchSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(searchSuggestions);
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
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
                onConsultationClick();
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
  );
}

