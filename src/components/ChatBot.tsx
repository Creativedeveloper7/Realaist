import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2,
  MapPin,
  Building2,
  Zap,
  AlertCircle
} from 'lucide-react';
import { openAIService, type ChatMessage } from '../services/openaiService';

interface ChatBotProps {
  isDarkMode: boolean;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'property-list' | 'property-card';
  data?: any;
}

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  developer: string;
  status: string;
  image: string;
  description: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Hello! I'm your Realaist property assistant. I can help you find properties, answer questions about listings, and provide information about our services.\n\n🏠 You can ask me about:\n• Properties in specific locations\n• Properties within your budget (e.g., 'under $500k')\n• Specific property types (apartments, villas, townhouses)\n• Number of bedrooms\n\nWhat are you looking for?",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [openAIConfigured, setOpenAIConfigured] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Property Database
  const properties: Property[] = [
    {
      id: 1,
      title: 'Luxury Apartments - Westlands',
      location: 'Westlands, Nairobi',
      price: 450000,
      type: 'Apartment Complex',
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      developer: 'Realaist Developers',
      status: 'Available',
      image: '/api/placeholder/300/200',
      description: 'Modern luxury apartments in the heart of Westlands with premium amenities.'
    },
    {
      id: 2,
      title: 'Modern Villas - Karen',
      location: 'Karen, Nairobi',
      price: 1200000,
      type: 'Villa Development',
      bedrooms: 4,
      bathrooms: 3,
      area: 2500,
      developer: 'Realaist Developers',
      status: 'Available',
      image: '/api/placeholder/300/200',
      description: 'Exclusive villa development in Karen with private gardens and modern design.'
    },
    {
      id: 3,
      title: 'Townhouses - Runda',
      location: 'Runda, Nairobi',
      price: 800000,
      type: 'Townhouse Complex',
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      developer: 'Realaist Developers',
      status: 'Available',
      image: '/api/placeholder/300/200',
      description: 'Contemporary townhouses with shared amenities and modern finishes.'
    },
    {
      id: 4,
      title: 'Penthouse Suites - Kilimani',
      location: 'Kilimani, Nairobi',
      price: 2500000,
      type: 'Penthouse',
      bedrooms: 5,
      bathrooms: 4,
      area: 3500,
      developer: 'Realaist Developers',
      status: 'Sold',
      image: '/api/placeholder/300/200',
      description: 'Ultra-luxury penthouse suites with panoramic city views.'
    },
    {
      id: 5,
      title: 'Studio Apartments - CBD',
      location: 'CBD, Nairobi',
      price: 180000,
      type: 'Studio Complex',
      bedrooms: 1,
      bathrooms: 1,
      area: 450,
      developer: 'Realaist Developers',
      status: 'Available',
      image: '/api/placeholder/300/200',
      description: 'Compact studio apartments perfect for young professionals.'
    },
    {
      id: 6,
      title: 'Executive Apartments - Lavington',
      location: 'Lavington, Nairobi',
      price: 650000,
      type: 'Apartment Complex',
      bedrooms: 2,
      bathrooms: 2,
      area: 950,
      developer: 'Realaist Developers',
      status: 'Available',
      image: '/api/placeholder/300/200',
      description: 'Executive apartments in the prestigious Lavington area.'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if OpenAI is configured on component mount
  useEffect(() => {
    const checkOpenAI = async () => {
      const configured = openAIService.isConfigured();
      setOpenAIConfigured(configured);
    };
    checkOpenAI();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      let botResponse: { text: string; type: 'text' | 'property-list'; data?: Property[] };

      if (openAIConfigured) {
        // Always use OpenAI GPT when available
        try {
          const openAIResponse = await openAIService.sendMessage(currentInput, properties, conversationHistory);
          
          // Update conversation history
          setConversationHistory(prev => [
            ...prev,
            { role: 'user', content: currentInput },
            { role: 'assistant', content: openAIResponse }
          ]);

          botResponse = {
            text: openAIResponse,
            type: 'text'
          };
        } catch (error) {
          console.error('OpenAI error, falling back to local:', error);
          // Fallback to local response
          botResponse = generateBotResponse(currentInput);
        }
      } else {
        // Use local intelligent response
        botResponse = generateBotResponse(currentInput);
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: botResponse.type,
        data: botResponse.data
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const searchProperties = (query: string): Property[] => {
    const input = query.toLowerCase();
    let filteredProperties = properties;

    // Location filter - enhanced to handle "properties in nairobi" type queries
    const locations = ['westlands', 'karen', 'kilimani', 'runda', 'cbd', 'lavington', 'nairobi'];
    const locationMatch = locations.find(loc => input.includes(loc));
    if (locationMatch) {
      if (locationMatch === 'nairobi') {
        // If searching for "nairobi", return all properties in Nairobi
        filteredProperties = filteredProperties.filter(prop => 
          prop.location.toLowerCase().includes('nairobi')
        );
      } else {
        // For specific areas, filter by that area
        filteredProperties = filteredProperties.filter(prop => 
          prop.location.toLowerCase().includes(locationMatch)
        );
      }
    }

    // Price filter
    const priceMatch = input.match(/(\d+)(?:k|thousand|million|m)?/);
    if (priceMatch) {
      const price = parseInt(priceMatch[1]);
      const isMillion = input.includes('million') || input.includes('m');
      const targetPrice = isMillion ? price * 1000000 : price * 1000;
      
      filteredProperties = filteredProperties.filter(prop => 
        prop.price <= targetPrice * 1.2 && prop.price >= targetPrice * 0.8
      );
    }

    // Budget range filter
    if (input.includes('budget') || input.includes('under') || input.includes('below')) {
      const budgetMatch = input.match(/(\d+)(?:k|thousand|million|m)?/);
      if (budgetMatch) {
        const budget = parseInt(budgetMatch[1]);
        const isMillion = input.includes('million') || input.includes('m');
        const maxPrice = isMillion ? budget * 1000000 : budget * 1000;
        filteredProperties = filteredProperties.filter(prop => prop.price <= maxPrice);
      }
    }

    // Property type filter
    const types = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio'];
    const typeMatch = types.find(type => input.includes(type));
    if (typeMatch) {
      filteredProperties = filteredProperties.filter(prop => 
        prop.type.toLowerCase().includes(typeMatch)
      );
    }

    // Bedroom filter
    const bedroomMatch = input.match(/(\d+)\s*(?:bed|bedroom)/);
    if (bedroomMatch) {
      const bedrooms = parseInt(bedroomMatch[1]);
      filteredProperties = filteredProperties.filter(prop => prop.bedrooms === bedrooms);
    }

    // Status filter (available properties)
    if (input.includes('available') || input.includes('for sale')) {
      filteredProperties = filteredProperties.filter(prop => prop.status === 'Available');
    }

    // Return more results for general queries like "properties in nairobi"
    const maxResults = input.includes('nairobi') && !locations.some(loc => loc !== 'nairobi' && input.includes(loc)) ? 6 : 3;
    return filteredProperties.slice(0, maxResults);
  };

  const generateBotResponse = (userInput: string): { text: string; type: 'text' | 'property-list'; data?: Property[] } => {
    const input = userInput.toLowerCase();
    
    // Property search queries
    if (input.includes('property') || input.includes('house') || input.includes('apartment') || 
        input.includes('budget') || input.includes('price') || input.includes('location') ||
        input.includes('bedroom') || input.includes('available')) {
      
      const searchResults = searchProperties(userInput);
      
      if (searchResults.length > 0) {
        let responseText = `I found ${searchResults.length} propert${searchResults.length === 1 ? 'y' : 'ies'} that match your criteria. Click on any property to view details:\n\n`;
        
        return {
          text: responseText,
          type: 'property-list',
          data: searchResults
        };
      } else {
        return {
          text: "I couldn't find any properties matching your criteria. Let me help you refine your search. You can ask me about:\n\n• Properties in specific locations (Westlands, Karen, Kilimani, etc.)\n• Properties within your budget (e.g., 'under $500k')\n• Specific property types (apartments, villas, townhouses)\n• Number of bedrooms\n\nWhat are you looking for?",
          type: 'text'
        };
      }
    }
    
    // General property information
    if (input.includes('price') || input.includes('cost') || input.includes('expensive')) {
      return {
        text: "Our properties range from $180,000 for studio apartments to $2.5M for luxury penthouses. The price depends on location, size, and amenities. Would you like to see properties in a specific price range?",
        type: 'text'
      };
    }
    
    if (input.includes('location') || input.includes('area') || input.includes('where')) {
      return {
        text: "We have properties in prime locations across Nairobi including Westlands, Karen, Kilimani, Runda, CBD, and Lavington. Each location offers unique advantages. Which area interests you most?",
        type: 'text'
      };
    }
    
    if (input.includes('visit') || input.includes('viewing') || input.includes('tour')) {
      return {
        text: "I can help you schedule a property viewing! Our team can arrange visits to any of our properties. Would you like to book a viewing for a specific property?",
        type: 'text'
      };
    }
    
    if (input.includes('developer') || input.includes('company') || input.includes('about')) {
      return {
        text: "Realaist is a leading property development company in Kenya. We specialize in luxury residential and commercial properties with a focus on quality, innovation, and customer satisfaction. How can I assist you further?",
        type: 'text'
      };
    }
    
    if (input.includes('contact') || input.includes('phone') || input.includes('email')) {
      return {
        text: "You can reach us at +254 700 000 000 or email us at info@realaist.com. Our office is located in Westlands, Nairobi. We're available Monday to Friday, 8 AM to 6 PM.",
        type: 'text'
      };
    }
    
    if (input.includes('help') || input.includes('support')) {
      return {
        text: "I'm here to help! I can assist you with:\n\n• Finding properties by location, price, or type\n• Property details and specifications\n• Scheduling viewings\n• General inquiries about Realaist\n\nWhat would you like to know?",
        type: 'text'
      };
    }
    
    // Default responses
    const defaultResponses = [
      "That's interesting! Could you tell me more about what you're looking for?",
      "I'd be happy to help with that. Let me know more details about your requirements.",
      "Great question! I can provide more information about our properties and services. What specifically would you like to know?",
      "I understand. Let me help you find the best solution. Could you provide more details?",
      "Thanks for your message! I'm here to assist you with all your property needs. How can I help further?"
    ];
    
    return {
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      type: 'text'
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }: { property: Property }) => {
    const handlePropertyClick = () => {
      // Navigate to property details page
      navigate(`/property/${property.id}`);
      // Close the chat window after navigation
      setIsOpen(false);
    };

    return (
      <motion.div 
        className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
          isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:shadow-lg'
        }`}
        onClick={handlePropertyClick}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/10 dark:to-white/20 rounded-xl flex-shrink-0 shadow-sm"></div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate mb-1">{property.title}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
              <MapPin size={12} />
              {property.location}
            </p>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-bold text-[#C7A667]">
                {formatCurrency(property.price)}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 size={10} />
                {property.bedrooms} bed • {property.bathrooms} bath
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {property.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                property.status === 'Available' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
              }`}>
                {property.status}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center z-40 backdrop-blur-sm border-2 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#C7A667] to-[#B8965A] border-white/20 hover:from-[#B8965A] hover:to-[#A6854A]' 
            : 'bg-gradient-to-br from-[#C7A667] to-[#B8965A] border-white/30 hover:from-[#B8965A] hover:to-[#A6854A]'
        } transition-all duration-300`}
        onClick={toggleChat}
        whileHover={{ 
          scale: 1.1, 
          y: -2,
          boxShadow: "0 20px 40px rgba(199, 166, 103, 0.3)"
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 2, 
          type: "spring", 
          stiffness: 200,
          damping: 15
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={26} className="text-black" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={26} className="text-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-24 right-6 w-96 h-[500px] rounded-3xl shadow-2xl border z-50 backdrop-blur-sm ${
              isDarkMode 
                ? 'bg-[#0E0E10]/95 border-white/20' 
                : 'bg-white/95 border-gray-200/50'
            }`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.1 : 1, 
              y: 0,
              height: isMinimized ? 60 : 500
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Chat Header */}
            <div className={`flex items-center justify-between p-5 border-b ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#C7A667] to-[#B8965A] rounded-xl flex items-center justify-center shadow-lg">
                    <Bot size={18} className="text-black" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                    isDarkMode ? 'border-[#0E0E10]' : 'border-white'
                  } ${
                    openAIConfigured ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">Realaist Assistant</h3>
                    {openAIConfigured ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                        <Zap size={12} className="text-green-500" />
                        <span className="text-xs text-green-500 font-medium">AI Powered</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-full">
                        <AlertCircle size={12} className="text-yellow-500" />
                        <span className="text-xs text-yellow-500 font-medium">Local Mode</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Online • Ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMinimize}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 h-80">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`flex items-start gap-3 max-w-[85%] ${
                        message.isUser ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          message.isUser 
                            ? 'bg-gradient-to-br from-[#C7A667] to-[#B8965A]' 
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/20 dark:to-white/30'
                        }`}>
                          {message.isUser ? (
                            <User size={14} className="text-black" />
                          ) : (
                            <Bot size={14} className="text-gray-600 dark:text-white" />
                          )}
                        </div>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.isUser
                            ? 'bg-gradient-to-br from-[#C7A667] to-[#B8965A] text-black'
                            : isDarkMode
                              ? 'bg-white/10 text-white border border-white/10'
                              : 'bg-white text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                          
                          {/* Property List */}
                          {message.type === 'property-list' && message.data && (
                            <div className="mt-4 space-y-3">
                              {message.data.map((property: Property) => (
                                <PropertyCard key={property.id} property={property} />
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/20 dark:to-white/30 flex items-center justify-center shadow-sm">
                          <Bot size={14} className="text-gray-600 dark:text-white" />
                        </div>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                          isDarkMode ? 'bg-white/10 border border-white/10' : 'bg-white border border-gray-200'
                        }`}>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`p-5 border-t ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about properties, locations, or anything..."
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10 focus:border-[#C7A667]/50'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-[#C7A667]/50'
                        } focus:outline-none focus:ring-2 focus:ring-[#C7A667]/20 focus:border-transparent`}
                      />
                    </div>
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className={`p-3 rounded-xl shadow-sm transition-all duration-200 ${
                        inputValue.trim()
                          ? 'bg-gradient-to-br from-[#C7A667] to-[#B8965A] text-black hover:from-[#B8965A] hover:to-[#A6854A] shadow-lg'
                          : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={inputValue.trim() ? { scale: 1.05, y: -1 } : {}}
                      whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
