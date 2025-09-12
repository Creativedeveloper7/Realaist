import { useRef } from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  isDarkMode: boolean;
}

export function Hero({ isDarkMode }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    <motion.section 
      ref={heroRef as any}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-16 ${
        isDarkMode ? 'bg-[#0E0E10]' : 'bg-white'
      }`}
    >
      {/* 3D Real Estate Video Background */}
      <div className="architecture-background absolute inset-0">
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
          className="mb-16 max-w-6xl mx-auto"
        >
          <h1 
            className="font-heading text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight text-white hero-text-shadow mb-8"
            style={{ 
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontWeight: 500,
              letterSpacing: '0.05em'
            }}
          >
            REALAIST
          </h1>
          
          {/* Platform Description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mb-12"
          >
            <p 
              className="font-heading text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6"
              style={{ 
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontWeight: 400,
                letterSpacing: '0.02em'
              }}
            >
              Realaist is an AI-powered platform that connects investors with vetted real estate opportunities from trusted developers and companies.
            </p>
            <p 
              className="font-heading text-sm md:text-base lg:text-lg text-white/80 leading-relaxed"
              style={{ 
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontWeight: 400,
                letterSpacing: '0.02em'
              }}
            >
              Our AI agent verifies property ownership, legal compliance, and the track record of each developer — ensuring a secure and trustworthy investment experience.
            </p>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="p-8 md:p-12"
          >
            <h2 
              className="font-heading text-2xl md:text-3xl lg:text-4xl text-white mb-8"
              style={{ 
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}
            >
              
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 
                  className="font-heading text-lg md:text-xl text-white mb-3"
                  style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  Discover Opportunities
                </h3>
                <p className="text-white/80 text-sm md:text-base">
                  Explore top investment properties
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 
                  className="font-heading text-lg md:text-xl text-white mb-3"
                  style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  AI Verification
                </h3>
                <p className="text-white/80 text-sm md:text-base">
                  Use our AI tool to verify ownership & legal compliance
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#C7A667] rounded-full flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 
                  className="font-heading text-lg md:text-xl text-white mb-3"
                  style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.02em'
                  }}
                >
                  Connect with Developers
                </h3>
                <p className="text-white/80 text-sm md:text-base">
                  Contact sellers directly, leave your details for a callback or schedule a visit
                </p>
              </motion.div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute inset-x-0 bottom-8 md:bottom-8 z-20 flex justify-center"
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
  );
}
