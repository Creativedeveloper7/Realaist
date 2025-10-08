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

      {/* Empty Hero Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
        {/* Content removed */}
      </div>

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
