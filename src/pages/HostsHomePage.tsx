import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Upload, Megaphone, TrendingUp, Sparkles, Globe, Camera, Users, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { HostNavbar } from '../components/HostNavbar';

/**
 * Homepage for logged-in hosts. Lists and other sections can be added below.
 * Nav: Realaist Stays branding, Properties (→ short-stays listings), Blog, Contact, Welcome/Dashboard, Logout.
 */
export default function HostsHomePage() {
  const { isDarkMode } = useTheme();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const dark = isDarkMode;
  const text = dark ? 'text-white' : 'text-gray-900';
  const muted = dark ? 'text-white/70' : 'text-gray-600';
  const gold = 'text-[#C7A667]';
  const sectionBg = dark ? 'bg-[#0E0E10]' : 'bg-white';
  const cardBg = dark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';

  const steps = [
    { icon: Upload, step: '01', title: 'List Your Property', desc: 'Create a beautiful listing page with photos, videos, virtual tours and pricing — in minutes.' },
    { icon: Megaphone, step: '02', title: 'Launch Ad Campaigns', desc: 'Push targeted ads to Google & Meta directly from the dashboard. Reach travelers worldwide instantly.' },
    { icon: TrendingUp, step: '03', title: 'Grow & Monetize', desc: 'Track bookings, manage guests and optimize campaigns to keep your calendar fully booked year-round.' },
    { icon: Sparkles, step: '04', title: 'Value-Added Services', desc: 'Get professional photography, cinematic videography, immersive 3D virtual walkthroughs and full property management — all in one place.' },
  ];

  const features = [
    { icon: Globe, title: 'Google Ads & Meta Integrations', desc: 'Run high-converting ad campaigns on Google, Meta and YouTube directly from your dashboard. Target travelers by location, interests and travel dates — then track every click, inquiry and booking in real-time. No agency needed, no guesswork. Just measurable results that fill your calendar.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop' },
    { icon: Camera, title: 'Dedicated Property Landing Pages', desc: 'Each property gets its own stunning, conversion-optimized landing page — complete with professional photo galleries, video tours, immersive 360° virtual walkthroughs, amenity lists, pricing, location maps and availability calendars. Give guests everything they need to book with confidence.', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop' },
    { icon: Users, title: 'Direct Bookings & Guest CRM', desc: 'Accept bookings directly — no middlemen, no hefty commissions. Own the entire guest relationship from first inquiry to checkout. Our built-in CRM tracks every conversation, stores guest preferences, automates follow-ups and turns one-time visitors into loyal repeat guests.', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop' },
  ];

  const featuredUnits = [
    { image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop', name: 'Sunset Beach Villa', location: 'Bali, Indonesia', rating: 4.9, guests: 8, price: '$320' },
    { image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', name: 'Skyline Penthouse', location: 'Dubai, UAE', rating: 4.8, guests: 4, price: '$450' },
    { image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop', name: 'Alpine Retreat Cabin', location: 'Aspen, Colorado', rating: 4.9, guests: 6, price: '$280' },
    { image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop', name: 'Tuscan Countryside Villa', location: 'Tuscany, Italy', rating: 5.0, guests: 10, price: '$390' },
    { image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop', name: 'Overwater Bungalow', location: 'Maldives', rating: 4.9, guests: 2, price: '$550' },
    { image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop', name: 'Desert Oasis Home', location: 'Scottsdale, Arizona', rating: 4.7, guests: 6, price: '$260' },
  ];
  const featuredVisible = 3;
  const featuredMaxIndex = Math.max(0, featuredUnits.length - featuredVisible);
  const featuredStep = 100 / featuredUnits.length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#111217]' : 'bg-gray-50'}`}>
      <HostNavbar isDarkMode={isDarkMode} />

      {/* Hero section */}
      <main>
        <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
          {/* Background video (add public/hero-video.mp4 for custom video) or gradient fallback */}
          <div className={`absolute inset-0 ${dark ? 'bg-[#111217]' : 'bg-gray-50'}`}>
            <video
              src="/logos/hosthero.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = 'none';
              }}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                dark ? 'from-[#111217] via-[#111217]/90 to-[#111217]/40' : 'from-gray-50 via-gray-50/90 to-gray-50/40'
              }`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                dark ? 'from-[#111217] via-transparent to-[#111217]/30' : 'from-gray-50 via-transparent to-gray-50/20'
              }`}
            />
          </div>

          <div className="relative z-10 w-full max-w-7xl pl-[10%] pr-4 sm:pr-6 lg:pr-8 pt-24 flex justify-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${text}`}
                style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
              >
                Keep Your Units{' '}
                <span className="text-[#C7A667]">Always Fully Booked</span>
              </h1>

              <p className={`text-lg ${muted} leading-relaxed mb-8 max-w-xl`}>
                Advertise your vacation rentals globally on Google & Meta, get new clients, and grow your business.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/dashboard/short-stays"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C7A667] text-black font-medium hover:opacity-90 transition-opacity"
                >
                  List your property <ArrowRight size={18} />
                </Link>
                <Link
                  to="/short-stays"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border ${
                    dark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <Play size={18} /> View properties
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-10 mt-14">
                {[
                  ['500+', 'Properties Listed'],
                  ['95%', 'Occupancy Rate'],
                  ['30+', 'Countries'],
                ].map(([val, label]) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="text-3xl font-bold text-[#C7A667]">{val}</div>
                    <div className={`text-sm ${muted}`}>{label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className={`py-24 ${sectionBg}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[#C7A667] text-sm font-semibold uppercase tracking-wider">How It Works</span>
              <h2 className={`text-3xl sm:text-4xl font-bold mt-3 ${text}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                Three Steps to <span className="text-[#C7A667]">Full Occupancy</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C7A667]/10 border border-[#C7A667]/20 flex items-center justify-center mb-6">
                    <s.icon className="text-[#C7A667]" size={28} />
                  </div>
                  <span className="text-xs text-[#C7A667] font-bold tracking-widest">STEP {s.step}</span>
                  <h3 className={`text-xl font-bold mt-2 mb-3 ${text}`}>{s.title}</h3>
                  <p className={`text-sm ${muted} leading-relaxed`}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className={`py-24 relative ${dark ? 'bg-[#111217]' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[#C7A667] text-sm font-semibold uppercase tracking-wider">Features</span>
              <h2 className={`text-3xl sm:text-4xl font-bold mt-3 ${text}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                Everything You Need to <span className="text-[#C7A667]">Maximize Bookings</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`rounded-xl overflow-hidden border flex flex-col ${cardBg} hover:border-[#C7A667]/40 transition-all duration-300`}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={f.image}
                      alt={f.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#C7A667]/10 flex items-center justify-center mb-4">
                      <f.icon className="text-[#C7A667]" size={20} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${text}`}>{f.title}</h3>
                    <p className={`text-sm ${muted} leading-relaxed`}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className={`py-24 ${dark ? 'bg-[#0E0E10]' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-[#C7A667]/30 shadow-lg shadow-[#C7A667]/10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-[#C7A667]/10 ${dark ? 'via-[#0E0E10] to-[#0E0E10]' : 'via-white to-white'}`} />
              <div className="relative z-10 text-center py-16 px-6">
                <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${text}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                  Ready to Fill Every Night?
                </h2>
                <p className={`${muted} max-w-lg mx-auto mb-8`}>
                  Join hundreds of hosts already using Realaist Stays to keep their vacation rentals
                  fully booked with guests from around the world.
                </p>
                <Link
                  to="/dashboard/short-stays"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C7A667] text-black font-medium hover:opacity-90 transition-opacity"
                >
                  Get started <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured units */}
        <section className={`py-24 ${dark ? 'bg-[#111217]' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#C7A667] text-sm font-semibold uppercase tracking-wider">Featured Units</span>
              <h2 className={`text-3xl sm:text-4xl font-bold mt-3 ${text}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                Properties Thriving on <span className="text-[#C7A667]">Realaist Stays</span>
              </h2>
            </motion.div>

            <div className="relative px-2">
              <div className="overflow-hidden">
                <motion.div
                  className="flex gap-6"
                  style={{ transform: `translateX(-${featuredIndex * featuredStep}%)` }}
                  transition={{ type: 'tween', duration: 0.3 }}
                >
                  {featuredUnits.map((unit) => (
                    <div
                      key={unit.name}
                      className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3"
                      style={{ minWidth: 'min(100%, 20rem)' }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`rounded-xl overflow-hidden border ${cardBg} hover:border-[#C7A667]/40 transition-all duration-300`}
                      >
                        <div className="h-52 overflow-hidden relative">
                          <img
                            src={unit.image}
                            alt={unit.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className={`absolute top-3 right-3 ${dark ? 'bg-black/70' : 'bg-white/90'} backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-sm font-medium`}>
                            <Star className="text-[#C7A667] fill-[#C7A667]" size={14} />
                            {unit.rating}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className={`text-lg font-semibold mb-1 ${text}`}>{unit.name}</h3>
                          <div className={`flex items-center gap-1.5 ${muted} text-sm mb-3`}>
                            <MapPin size={14} />
                            {unit.location}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center gap-1.5 ${muted} text-sm`}>
                              <Users size={14} />
                              Up to {unit.guests} guests
                            </div>
                            <span className="text-[#C7A667] font-bold">
                              {unit.price}
                              <span className={`${muted} font-normal text-xs`}>/night</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </motion.div>
              </div>
              <button
                type="button"
                onClick={() => setFeaturedIndex((i) => Math.max(0, i - 1))}
                disabled={featuredIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center ${
                  dark ? 'border-white/20 bg-[#0E0E10] text-white hover:bg-white/10' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } disabled:opacity-40 disabled:pointer-events-none`}
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setFeaturedIndex((i) => Math.min(featuredMaxIndex, i + 1))}
                disabled={featuredIndex >= featuredMaxIndex}
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center ${
                  dark ? 'border-white/20 bg-[#0E0E10] text-white hover:bg-white/10' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } disabled:opacity-40 disabled:pointer-events-none`}
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`border-t py-12 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <img src="/logos/realaistlogo.png" alt="Realaist" className="h-6 w-auto" />
                <span className="font-semibold text-lg" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                  Realaist <span className={gold}>Stays</span>
                </span>
              </div>

              <div className="flex gap-6 text-sm">
                <a href="#features" className={`${muted} hover:text-[#C7A667] transition-colors`}>Features</a>
                <a href="#how-it-works" className={`${muted} hover:text-[#C7A667] transition-colors`}>How It Works</a>
                <a href="#pricing" className={`${muted} hover:text-[#C7A667] transition-colors`}>Pricing</a>
                <Link to="/contact" className={`${muted} hover:text-[#C7A667] transition-colors`}>Contact</Link>
              </div>

              <p className={`text-xs ${muted}`}>
                © 2026 Realaist. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
