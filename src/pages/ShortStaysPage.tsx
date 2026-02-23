import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { propertiesService, Property } from '../services/propertiesService';
import { HostNavbar } from '../components/HostNavbar';
import { Star, Search, MapPin, Users, BedDouble, Bath, MessageCircle, X, Send, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper function to generate dummy rating (4.0 to 5.0)
const generateDummyRating = (propertyId: string): number => {
  // Use property ID to generate consistent rating per property
  const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 100;
  // Generate rating between 4.0 and 5.0
  return Math.round((4.0 + (seed / 100) * 1.0) * 10) / 10;
};

// Helper function to generate dummy review count (10 to 60)
const generateDummyReviewCount = (propertyId: string): number => {
  // Use property ID to generate consistent review count per property
  const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 50;
  return 10 + seed;
};

// Helper function to convert database property to display format
const convertPropertyToShortStay = (property: Property) => {
  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6; // Sunday or Saturday

  const effectivePrice = (() => {
    if (isWeekend) {
      return property.weekendPrice || property.weekdayPrice || property.price;
    }
    return property.weekdayPrice || property.price;
  })();

  // Parse category from description (e.g. "Category: Apartment" from ShortStays form)
  const categoryMatch = property.description?.match(/Category:\s*(\w+)/i);
  const category = categoryMatch ? categoryMatch[1] : null;

  const bedrooms = property.bedrooms || 0;
  return {
    id: property.id,
    name: property.title,
    location: property.location,
    price: formatPrice(effectivePrice),
    beds: bedrooms,
    baths: property.bathrooms || 0,
    guests: Math.max(bedrooms * 2, 2),
    category: category || 'Short Stay',
    image: property.images && property.images.length > 0 ? property.images[0] : "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    developer: property.developer,
    amenities: (property as any).amenities || [],
    features: (property as any).features || [],
    rating: generateDummyRating(property.id),
    reviewCount: generateDummyReviewCount(property.id),
  };
};

const PLACEHOLDER_EXAMPLES = [
  "Beachfront villa in Kilifi for a weekend",
  "Apartment in Nairobi for a family of 4",
  "Cozy cabin with a pool",
  "Short stay with great reviews",
];

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('beach') || lower.includes('ocean') || lower.includes('sea')) return "We have beach and coastal short stays. Use the search bar or property type filters above to narrow down your choices.";
  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable')) return "You can filter by property type and use the search to find options. Prices are shown on each listing.";
  if (lower.includes('family') || lower.includes('kids') || lower.includes('children')) return "Many of our short stays are family-friendly. Look for listings with more bedrooms and check the details page for amenities.";
  if (lower.includes('help') || lower.includes('how')) return "You can search by property name or location in the search bar, and filter by property type using the pills. Click 'View Details' on any listing for full info.";
  return "I can help you find a short stay! Try searching by location or property name above, or use the type filters. Ask me about budgets, locations, or family-friendly stays.";
}

export default function ShortStaysPage() {
  const { isDarkMode } = useTheme();
  const [shortStays, setShortStays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedLocation, setAdvancedLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [bookedPropertyIds, setBookedPropertyIds] = useState<Set<string>>(new Set());
  const [placeholder, setPlaceholder] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! 👋 I'm your travel assistant. Search above or tell me what kind of stay you're looking for." },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadShortStays = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try localStorage cache first
        const storedProperties = localStorage.getItem('realaist_properties');
        const storedTimestamp = localStorage.getItem('realaist_properties_timestamp');
        
        if (storedProperties && storedTimestamp) {
          const properties = JSON.parse(storedProperties);
          const age = Date.now() - parseInt(storedTimestamp);
          
          // If data is less than 5 minutes old, use it
          if (age < 5 * 60 * 1000) {
            const shortStayProperties = properties.filter(
              (p: Property) => (p.propertyType || '').toLowerCase() === 'short stay'
            );
            if (shortStayProperties.length > 0) {
              setShortStays(shortStayProperties.map(convertPropertyToShortStay));
              setIsLoading(false);
            }
          }
        }

        // Fetch from database
        const result = await propertiesService.getProperties();
        if (result.error) {
          throw new Error(result.error);
        }

        const shortStayProperties = result.properties.filter(
          (p: Property) => (p.propertyType || '').toLowerCase() === 'short stay'
        );

        setShortStays(shortStayProperties.map(convertPropertyToShortStay));

        // Cache the results in localStorage (same as HousesPage)
        localStorage.setItem('realaist_properties', JSON.stringify(result.properties));
        localStorage.setItem('realaist_properties_timestamp', Date.now().toString());
      } catch (err) {
        console.error('Error loading short stays:', err);
        setError(err instanceof Error ? err.message : 'Failed to load short stays');
      } finally {
        setIsLoading(false);
      }
    };

    loadShortStays();
  }, []);

  // Type options from data: All + unique categories
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    shortStays.forEach((p: any) => {
      if (p.category && String(p.category).trim()) set.add(String(p.category).trim());
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [shortStays]);

  // Animated placeholder
  useEffect(() => {
    const current = PLACEHOLDER_EXAMPLES[exampleIndex];
    if (!current) return;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < current.length) {
          setPlaceholder(current.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(current.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        } else {
          setIsDeleting(false);
          setExampleIndex((exampleIndex + 1) % PLACEHOLDER_EXAMPLES.length);
        }
      }
    }, isDeleting ? 30 : 60);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, exampleIndex]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Fetch property IDs that are booked in the selected date range (so we show only "free" properties)
  useEffect(() => {
    if (!checkIn || !checkOut || checkIn > checkOut) {
      setBookedPropertyIds(new Set());
      return;
    }
    const fetchBooked = async () => {
      try {
        const { data, error } = await supabase
          .from('scheduled_visits')
          .select('property_id')
          .gte('scheduled_date', checkIn)
          .lte('scheduled_date', checkOut)
          .in('status', ['scheduled', 'confirmed']);
        if (error) {
          setBookedPropertyIds(new Set());
          return;
        }
        const ids = new Set((data || []).map((r: { property_id: string }) => r.property_id));
        setBookedPropertyIds(ids);
      } catch {
        setBookedPropertyIds(new Set());
      }
    };
    fetchBooked();
  }, [checkIn, checkOut]);

  // Format date for display e.g. "Sat, Feb 21, 2026"
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter by search, type, and advanced (location, dates/availability, guests, rooms)
  const filteredShortStays = useMemo(() => {
    let list = shortStays;
    const locationQ = (advancedLocation.trim() || searchTerm.trim()).toLowerCase();
    if (locationQ) {
      list = list.filter(
        (p: any) =>
          (p.name && p.name.toLowerCase().includes(locationQ)) ||
          (p.location && p.location.toLowerCase().includes(locationQ)) ||
          (p.developer && (
            (p.developer.firstName && p.developer.firstName.toLowerCase().includes(locationQ)) ||
            (p.developer.lastName && p.developer.lastName.toLowerCase().includes(locationQ)) ||
            (p.developer.companyName && p.developer.companyName.toLowerCase().includes(locationQ))
          ))
      );
    }
    if (activeType !== 'All') {
      list = list.filter((p: any) => (p.category || '').toLowerCase() === activeType.toLowerCase());
    }
    const totalGuests = adults + children;
    if (totalGuests > 0) {
      list = list.filter((p: any) => (p.guests ?? 0) >= totalGuests);
    }
    if (rooms > 0) {
      list = list.filter((p: any) => (p.beds ?? 0) >= rooms);
    }
    if (checkIn && checkOut && bookedPropertyIds.size > 0) {
      list = list.filter((p: any) => !bookedPropertyIds.has(p.id));
    }
    return list;
  }, [shortStays, searchTerm, activeType, advancedLocation, adults, children, rooms, checkIn, checkOut, bookedPropertyIds]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: getBotReply(userMsg.content) }]);
    }, 600);
  };

  const dark = isDarkMode;
  const text = dark ? 'text-white' : 'text-gray-900';
  const muted = dark ? 'text-white/70' : 'text-gray-600';
  const cardBg = dark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#111217]' : 'bg-background'}`}>
      <HostNavbar isDarkMode={isDarkMode} />

      {/* Hero */}
      <section className={`pt-28 pb-12 ${dark ? 'bg-[#0E0E10]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1
              className={`font-heading text-3xl sm:text-4xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", letterSpacing: '0.05em' }}
            >
              Find Your Perfect <span className="text-[#C7A667]">Vacation Rental</span>
            </h1>
            <p className={`max-w-lg mx-auto ${muted}`}>
              Browse short stay properties or chat with our assistant to discover your dream stay.
            </p>
          </motion.div>

          {/* Search bar + Advanced search button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} size={20} />
                <input
                  type="text"
                  placeholder={placeholder ? `Search by name or location — ${placeholder}` : 'Search by name or location...'}
                  value={advancedOpen ? advancedLocation : searchTerm}
                  onChange={(e) => {
                    if (advancedOpen) setAdvancedLocation(e.target.value);
                    else setSearchTerm(e.target.value);
                  }}
                  className={`w-full pl-12 pr-4 h-12 text-base rounded-xl border shadow-sm outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                    dark ? 'border-white/10 bg-white/5 text-white placeholder-white/40' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                {(advancedOpen ? advancedLocation : searchTerm) && (
                  <button
                    type="button"
                    onClick={() => advancedOpen ? setAdvancedLocation('') : setSearchTerm('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${muted} hover:opacity-100`}
                    aria-label="Clear"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAdvancedOpen((o) => !o)}
                className={`flex items-center gap-2 h-12 px-4 rounded-xl border font-medium text-sm transition-colors ${
                  advancedOpen
                    ? 'bg-[#C7A667] text-black border-[#C7A667]'
                    : dark
                      ? 'border-white/10 bg-white/10 text-white hover:bg-white/20'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Advanced search"
              >
                <SlidersHorizontal size={20} />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>
          </motion.div>

          {/* Advanced search panel */}
          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className={`max-w-2xl mx-auto mt-6 rounded-2xl border-2 border-[#C7A667]/60 ${dark ? 'bg-[#0E0E10]' : 'bg-white'} p-6 shadow-lg`}>
                  <h2 className={`text-xl font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Search</h2>
                  <p className={`text-sm ${muted} mb-6`}>Search deals on hotels, homes, and much more...</p>

                  <div className="space-y-4">
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} size={18} />
                      <input
                        type="text"
                        placeholder="e.g. Maasai Mara National Reserve"
                        value={advancedLocation}
                        onChange={(e) => setAdvancedLocation(e.target.value)}
                        className={`w-full pl-10 pr-10 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                          dark ? 'border-white/10 bg-white/5 text-white placeholder-white/40' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      {advancedLocation && (
                        <button type="button" onClick={() => setAdvancedLocation('')} className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted}`}>
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-medium uppercase tracking-wide mb-2 ${muted}`}>Check-in date</label>
                        <input
                          type="date"
                          value={checkIn}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className={`w-full px-3 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                            dark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
                          }`}
                        />
                        {checkIn && <p className={`mt-1 text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{formatDisplayDate(checkIn)}</p>}
                      </div>
                      <div>
                        <label className={`block text-xs font-medium uppercase tracking-wide mb-2 ${muted}`}>Check-out date</label>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn || new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className={`w-full px-3 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                            dark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
                          }`}
                        />
                        {checkOut && <p className={`mt-1 text-sm font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{formatDisplayDate(checkOut)}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-medium uppercase tracking-wide mb-2 ${muted}`}>Adults</label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={adults}
                          onChange={(e) => setAdults(Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))}
                          className={`w-full px-3 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                            dark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium uppercase tracking-wide mb-2 ${muted}`}>Children</label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={children}
                          onChange={(e) => setChildren(Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))}
                          className={`w-full px-3 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                            dark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-medium uppercase tracking-wide mb-2 ${muted}`}>Rooms</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={rooms}
                          onChange={(e) => setRooms(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                          className={`w-full px-3 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                            dark ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm(advancedLocation);
                        setAdvancedOpen(false);
                      }}
                      className="w-full py-3.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-base transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Type pills */}
          {!isLoading && shortStays.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {typeOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeType === t
                      ? 'bg-[#C7A667] text-black'
                      : dark
                        ? 'bg-white/10 border border-white/10 text-white/80 hover:text-white'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Properties grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7A667]" />
            </div>
          ) : error ? (
            <div className={`text-center py-20 ${muted}`}>{error}</div>
          ) : shortStays.length === 0 ? (
            <div className={`text-center py-16 ${muted}`}>
              <p className="text-lg mb-2">No short stay properties available</p>
              <p className="text-sm">Check back later or list your own property as a host.</p>
            </div>
          ) : (
            <>
              <p className={`text-sm ${muted} mb-6`}>{filteredShortStays.length} properties found</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShortStays.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-xl overflow-hidden border transition-all duration-300 group ${cardBg} hover:border-[#C7A667]/40`}
                  >
                    <div className="h-52 overflow-hidden relative">
                      <img
                        src={property.image}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-3 right-3 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-sm font-medium ${dark ? 'bg-black/70 text-white' : 'bg-white/90 text-gray-800'}`}>
                        <Star className="text-[#C7A667] fill-[#C7A667]" size={14} />
                        {property.rating}
                      </div>
                      <div className="absolute top-3 left-3 bg-[#C7A667]/90 text-black rounded-full px-2.5 py-1 text-xs font-medium">
                        {property.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className={`text-lg font-semibold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{property.name}</h3>
                      <div className={`flex items-center gap-1.5 ${muted} text-sm mb-3`}>
                        <MapPin size={14} /> {property.location}
                      </div>
                      <div className={`flex items-center gap-4 ${muted} text-sm mb-3`}>
                        <span className="flex items-center gap-1"><BedDouble size={14} /> {property.beds}</span>
                        <span className="flex items-center gap-1"><Bath size={14} /> {property.baths}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {property.guests}</span>
                      </div>
                      <div className={`flex items-center justify-between border-t pt-3 ${dark ? 'border-white/10' : 'border-border/50'}`}>
                        <span className="text-[#C7A667] font-bold text-lg">
                          {property.price}
                          <span className={`${muted} font-normal text-xs`}>/night</span>
                        </span>
                        <Link
                          to={`/property/${property.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-[#C7A667]/50 bg-transparent px-3 py-1.5 text-[#C7A667] hover:bg-[#C7A667]/10 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredShortStays.length === 0 && (
                <div className={`text-center py-16 ${muted}`}>
                  <p className="text-lg mb-2">No properties found</p>
                  <p className="text-sm">Try adjusting your search or filters, or chat with our assistant.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/logos/realaistlogo.png" alt="Realaist" className="h-6 w-auto" />
              <span className={`font-semibold text-lg ${dark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                Realaist <span className="text-[#C7A667]">Stays</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="/short-stays#features" className={`${muted} hover:text-[#C7A667] transition-colors`}>Features</a>
              <Link to="/contact" className={`${muted} hover:text-[#C7A667] transition-colors`}>Contact</Link>
            </div>
            <p className={`text-xs ${muted}`}>© 2026 Realaist. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat FAB */}
      <button
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#C7A667] text-black shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] rounded-2xl border flex flex-col overflow-hidden ${
              dark ? 'bg-[#0E0E10] border-white/10' : 'bg-card border-border'
            } shadow-2xl`}
          >
            <div className="px-4 py-3 border-b flex items-center gap-2 bg-[#C7A667]/10 border-[#C7A667]/20">
              <MessageCircle className="text-[#C7A667]" size={18} />
              <span className="font-semibold text-sm">Travel Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#C7A667] text-black rounded-br-md'
                        : dark ? 'bg-white/10 text-white rounded-bl-md' : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className={`p-3 border-t flex gap-2 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
              <input
                type="text"
                placeholder="Ask about properties..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className={`flex-1 h-9 px-3 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#C7A667]/30 ${
                  dark ? 'bg-white/5 border border-white/10 text-white placeholder-white/40' : 'bg-gray-100 border border-gray-200 text-gray-900'
                }`}
              />
              <button
                type="button"
                className="h-9 w-9 shrink-0 rounded-md bg-[#C7A667] text-black hover:bg-[#C7A667]/90 flex items-center justify-center"
                onClick={sendMessage}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
