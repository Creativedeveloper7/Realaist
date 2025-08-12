import React, { useState } from 'react';
import { motion } from 'framer-motion';

// REALIST – Luxury Real Estate Landing Page
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

function FloatingLogo() {
  return (
    <div className="fixed left-4 top-8 z-50 select-none logo-float">
      <div className="border border-dashed border-white/60 rounded-md px-4 py-3 backdrop-blur-sm bg-black/20">
        <span className="font-logo tracking-[0.25em] text-white/90 text-sm md:text-base">
          REALIST
        </span>
      </div>
    </div>
  );
}

function Section({ id, children, dark = false }: { id: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <motion.section
      id={id}
      className={`relative ${dark ? "bg-[#0E0E10]" : "bg-[#111217]"}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">{children}</div>
    </motion.section>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

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
        .video-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .video-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          width: 100%;
          height: 100%;
        }
        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: 1fr;
          }
        }
        .hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
      `}</style>

      {/* Floating Logo - Visible across all pages */}
      <FloatingLogo />

      {/* Wrapper */}
      <div className="grain text-[var(--ink)] bg-[var(--bg)] font-body">
        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/35 bg-black/30 border-b border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="border border-dashed border-white/60 rounded px-2.5 py-1">
                <span className="font-logo tracking-[0.25em] text-sm">REALIST</span>
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
        </header>

        {/* Hero Section with Video Background */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Video Background */}
          <div className="video-container">
            <div className="video-grid">
              <video
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
                {/* Fallback image */}
                <img src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Luxury property" className="hero-video" />
              </video>
              <video
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
                {/* Fallback image */}
                <img src="https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Luxury property" className="hero-video" />
              </video>
              <video
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
                {/* Fallback image */}
                <img src="https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Luxury property" className="hero-video" />
              </video>
            </div>
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50 z-10" />

          {/* Hero Content */}
          <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
            <h1 className="hero-title font-heading text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] leading-none tracking-tight text-white">
              REALIST
            </h1>
            
            {/* Search Bar */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <input 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-white/60 outline-none focus:border-[#C7A667] focus:bg-white/15 transition-all text-lg" 
                      placeholder="What type of property are you looking for? (Apartments, Gated, Beach Villas, Commercial)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="px-8 py-4 rounded-xl bg-[#C7A667] text-black font-semibold hover:bg-[#B8956A] transition-all text-lg">
                      Explore Properties
                    </button>
                    <button className="px-8 py-4 rounded-xl border-2 border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all text-lg">
                      Book Consultation
                    </button>
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
          </div>
        </section>

        {/* About / Trust */}
        <Section id="about" dark>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl">REALIST</h2>
              <p className="mt-4 text-white/70 max-w-prose">
                REALIST curates high-performance properties across Kenya for hybrid investors seeking dependable returns and elevated living. We combine design excellence with rigorous underwriting and transparent reporting.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { k: "KES 12B+", v: "Assets Listed" },
                  { k: "200+", v: "Investors Served" },
                  { k: "11.4%", v: "Avg Yield" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="font-heading text-xl">{s.k}</div>
                    <div className="text-xs text-white/60">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 opacity-80">
              {["BlackRock", "Knight Frank", "HassConsult", "REITs", "IB", "World Bank"].map((n) => (
                <div key={n} className="border border-white/10 rounded-lg h-16 flex items-center justify-center text-xs tracking-wider">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Why Us */}
        <Section id="why">
          <h3 className="font-heading text-3xl md:text-4xl">Why Choose Us</h3>
          <div className="mt-10 grid md:grid-cols-4 gap-6">
            {[
              { t: "High-ROI Curation", d: "Data-led sourcing and underwriting with disciplined risk controls." },
              { t: "Exclusive Access", d: "Off-market & pre-launch inventory you won't find elsewhere." },
              { t: "End-to-End Support", d: "From due diligence to property management and exits." },
              { t: "Transparent Reporting", d: "Quarterly dashboards and clear performance narratives." },
            ].map((f) => (
              <div key={f.t} className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all">
                <div className="font-heading text-xl mb-2">{f.t}</div>
                <p className="text-white/70 text-sm">{f.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Featured Properties */}
        <Section id="properties" dark>
          <h3 className="font-heading text-3xl md:text-4xl">Featured Properties</h3>
          <div className="mt-10 space-y-16">
            {properties.map((p) => (
              <article key={p.name} className="relative grid md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-7 rounded-2xl overflow-hidden border border-white/10">
                  <img src={p.hero} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                </div>
                <div className="md:col-span-5 flex flex-col">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="text-sm tracking-widest opacity-70">{p.location}</div>
                    <h4 className="font-heading text-2xl mt-1">{p.name}</h4>
                    <p className="mt-3 text-white/70 text-sm">{p.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.facts.map((f) => (
                        <span key={f} className="text-xs px-3 py-1 rounded-full border border-white/20 bg-white/5">{f}</span>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button className="px-5 py-2.5 rounded-full bg-[#C7A667] text-black text-sm font-medium hover:opacity-90 transition-opacity">View Details</button>
                      <button className="px-5 py-2.5 rounded-full border border-white/30 text-sm hover:border-[#C7A667] hover:text-[#C7A667] transition-all">Download Brochure</button>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {p.gallery.map((g, i) => (
                      <img key={i} src={g} alt={`${p.name} ${i + 1}`} className="rounded-xl border border-white/10 h-40 w-full object-cover" />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* Amenities */}
        <Section id="amenities">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <img src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Infinity Pool" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm tracking-widest opacity-70">AMENITIES</div>
              <h3 className="font-heading text-4xl md:text-5xl mt-2">Precipice of Greatness</h3>
              <p className="mt-4 text-white/70 max-w-prose">
                Our structures marry desirable aesthetics with durable comforts and a strong focus on environmental wellbeing, including rooftop lounges, fitness studios, and concierge services.
              </p>
            </div>
          </div>
        </Section>

        {/* Testimonials */}
        <Section id="testimonials" dark>
          <h3 className="font-heading text-3xl md:text-4xl">What Our Clients Say</h3>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <blockquote key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
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
                  "REALIST helped me access a pre-launch opportunity with transparent numbers. Performance has matched the projections."
                </p>
              </blockquote>
            ))}
          </div>
        </Section>

        {/* Insights */}
        <Section id="insights">
          <h3 className="font-heading text-3xl md:text-4xl">Insights</h3>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { img: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200", title: "Quarterly Yield Outlook" },
              { img: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1200", title: "Market Trends Analysis" },
              { img: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=1200", title: "Investment Strategies" }
            ].map((article, i) => (
              <a key={i} href="#" className="group block rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                <img className="h-48 w-full object-cover" src={article.img} alt="blog" />
                <div className="p-5">
                  <div className="text-xs tracking-widest opacity-70">MARKET</div>
                  <h4 className="font-heading text-xl mt-1">{article.title}</h4>
                  <p className="text-sm text-white/70 mt-2">Signals from prime Nairobi and coastal corridors; what to expect next quarter.</p>
                  <span className="inline-block mt-3 text-sm opacity-80 group-hover:opacity-100 transition-opacity">Read Article →</span>
                </div>
              </a>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section id="contact" dark>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="font-heading text-3xl md:text-4xl">Let's talk investments</h3>
              <p className="mt-3 text-white/70 max-w-prose">Fill the form and our team will respond within 24 hours.</p>
              <form className="mt-8 grid grid-cols-1 gap-4 max-w-lg">
                <input className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors" placeholder="Name" />
                <input className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors" placeholder="Email" />
                <input className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors" placeholder="Phone" />
                <textarea rows={4} className="bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors resize-none" placeholder="Message" />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input type="checkbox" className="accent-[#C7A667]" /> I agree to the privacy policy
                </label>
                <button className="mt-2 w-max px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium hover:opacity-90 transition-opacity">Send Message</button>
              </form>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-heading text-xl">REALIST</div>
              <p className="text-white/70 mt-2 text-sm">ABC Place, Waiyaki Way, Nairobi</p>
              <div className="mt-4 flex gap-3 text-sm">
                <a href="#" className="px-4 py-2 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all">WhatsApp</a>
                <a href="#" className="px-4 py-2 rounded-full border border-white/30 hover:border-[#C7A667] hover:text-[#C7A667] transition-all">Call</a>
              </div>
              <img className="mt-6 rounded-xl border border-white/10 w-full h-48 object-cover" src="https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="office location" />
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="bg-[#0B0C0E] text-white/70">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="border border-dashed border-white/60 rounded px-2.5 py-1">
                <span className="font-logo tracking-[0.25em] text-sm text-white/80">REALIST</span>
              </div>
              <span className="text-xs">© {new Date().getFullYear()} REALIST. All rights reserved.</span>
            </div>
            <nav className="text-xs flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">X</a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}