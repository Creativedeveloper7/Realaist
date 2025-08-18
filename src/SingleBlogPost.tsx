import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from './ThemeContext';

// Blog data - this would typically come from an API or CMS
const blogs = [
  {
    id: 1,
    title: "Kenya's Real Estate Market: 2024 Investment Opportunities",
    excerpt: "Discover the top investment opportunities in Kenya's booming real estate market.",
    content: `
      <p>Kenya's real estate market is experiencing unprecedented growth, driven by urbanization, economic development, and increasing foreign investment. As we move through 2024, several key trends are shaping the investment landscape.</p>
      
      <h2>Urban Development Hotspots</h2>
      <p>Nairobi continues to be the primary investment destination, with Westlands, Kilimani, and Lavington leading the charge. These areas offer excellent returns on investment, with average yields ranging from 8-12% annually.</p>
      
      <p>The coastal region, particularly Diani and Mombasa, is emerging as a luxury real estate destination. Beachfront properties are attracting both local and international investors, with premium developments offering unique lifestyle opportunities.</p>
      
      <h2>Investment Strategies</h2>
      <p>Off-plan investments remain popular due to their lower entry costs and potential for capital appreciation. However, completed properties offer immediate rental income and reduced risk.</p>
      
      <p>For investors seeking stable returns, residential properties in established neighborhoods provide consistent rental income. Commercial properties, particularly in Nairobi's CBD and Westlands, offer higher yields but come with increased market volatility.</p>
      
      <h2>Market Outlook</h2>
      <p>The Kenyan government's focus on infrastructure development, including the Nairobi Expressway and various road projects, is expected to drive property values in surrounding areas.</p>
      
      <p>With the growing middle class and increasing urbanization, demand for quality housing is expected to remain strong throughout 2024 and beyond.</p>
    `,
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
    content: `
      <p>The decision between investing in off-plan or completed properties is one of the most critical choices real estate investors face. Each option comes with its own set of advantages and risks.</p>
      
      <h2>Off-Plan Properties</h2>
      <p>Off-plan investments typically offer lower entry costs, as developers often provide attractive payment plans and early-bird discounts. This makes them accessible to a broader range of investors.</p>
      
      <p>Capital appreciation potential is significant, especially in rapidly developing areas. Properties purchased off-plan can increase in value by 20-40% by the time of completion.</p>
      
      <p>However, off-plan investments come with risks including construction delays, quality issues, and market fluctuations that could affect final property values.</p>
      
      <h2>Completed Properties</h2>
      <p>Completed properties offer immediate rental income and the ability to see exactly what you're purchasing. This reduces uncertainty and allows for better financial planning.</p>
      
      <p>These properties are typically located in established areas with proven rental demand and infrastructure. They offer more predictable returns but often come with higher initial costs.</p>
      
      <h2>Making the Right Choice</h2>
      <p>The choice between off-plan and completed properties depends on your investment goals, risk tolerance, and timeline. Off-plan properties suit investors seeking capital growth, while completed properties are ideal for those prioritizing immediate income.</p>
      
      <p>Diversification across both types can provide a balanced portfolio that captures growth opportunities while maintaining stable income streams.</p>
    `,
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
    content: `
      <p>East Africa's luxury real estate market is experiencing a renaissance, driven by economic growth, increasing wealth, and changing lifestyle preferences among high-net-worth individuals.</p>
      
      <h2>Sustainable Luxury</h2>
      <p>Green building practices and sustainable design are becoming standard in luxury developments. Buyers are increasingly prioritizing eco-friendly features, energy efficiency, and sustainable materials.</p>
      
      <p>Developments incorporating solar power, rainwater harvesting, and green spaces are commanding premium prices and attracting environmentally conscious buyers.</p>
      
      <h2>Smart Home Technology</h2>
      <p>Integration of smart home technology is transforming luxury properties. Automated lighting, climate control, security systems, and entertainment systems are now expected features in high-end properties.</p>
      
      <p>These technologies not only enhance convenience but also increase property values and appeal to tech-savvy buyers.</p>
      
      <h2>Wellness and Lifestyle</h2>
      <p>Luxury properties are increasingly incorporating wellness features such as private gyms, spa facilities, meditation rooms, and outdoor wellness spaces.</p>
      
      <p>The focus on health and wellness reflects changing priorities among luxury buyers, particularly in the post-pandemic era.</p>
      
      <h2>Location Preferences</h2>
      <p>While city centers remain popular, there's growing interest in properties offering privacy, space, and connection to nature. Gated communities with extensive amenities are particularly sought after.</p>
      
      <p>Coastal properties continue to attract luxury buyers, with beachfront developments offering exclusive lifestyle experiences.</p>
    `,
    author: "REALAIST Team",
    date: "March 5, 2024",
    category: "Luxury Market",
    readTime: 6,
    image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["Luxury", "Trends", "East Africa"]
  }
];

export default function SingleBlogPost() {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Find the blog post by ID
  const blog = blogs.find(b => b.id === parseInt(blogId || '1'));

  if (!blog) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#0E0E10] text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-heading mb-4">Blog Post Not Found</h1>
            <button 
              onClick={() => navigate('/blogs')}
              className="px-6 py-3 bg-[#C7A667] text-black font-medium rounded-lg hover:bg-[#B89657] transition-colors"
            >
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <a href="/houses" className={`transition-colors ${isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-900 hover:text-gray-600'}`}>Investors</a>
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
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              {/* Back Button */}
              <motion.button
                onClick={() => navigate('/blogs')}
                className={`mb-8 flex items-center gap-2 transition-colors ${
                  isDarkMode ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Blogs
              </motion.button>

              {/* Blog Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-6"
                >
                  <span className={`text-sm px-3 py-1 rounded-full border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-white/20 bg-white/10 text-white/90' 
                      : 'border-gray-300 bg-gray-100 text-gray-700'
                  }`}>
                    {blog.category}
                  </span>
                </motion.div>

                <motion.h1 
                  className="font-heading text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6"
                  style={{ 
                    fontFamily: "'Cinzel', 'Playfair Display', serif",
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {blog.title}
                </motion.h1>

                <motion.div 
                  className={`flex items-center justify-center gap-6 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-white/60' : 'text-gray-500'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold text-sm">
                      {blog.author.charAt(0)}
                    </div>
                    <span>{blog.author}</span>
                  </div>
                  <span>•</span>
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>{blog.readTime} min read</span>
                </motion.div>
              </div>

              {/* Featured Image */}
              <motion.div
                className="relative rounded-2xl overflow-hidden mb-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </motion.div>

              {/* Tags */}
              <motion.div 
                className="flex flex-wrap justify-center gap-2 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {blog.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-white/20 bg-white/5 text-white/70' 
                        : 'border-gray-300 bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.section>

          {/* Blog Content */}
          <motion.section 
            className={`py-1 ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-white'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <motion.article
                className={`prose prose-lg max-w-none ${
                  isDarkMode 
                    ? 'prose-invert prose-headings:text-white prose-p:text-white/80 prose-strong:text-white prose-a:text-[#C7A667]' 
                    : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-[#C7A667]'
                }`}
                style={{
                  '--tw-prose-headings': isDarkMode ? '#ffffff' : '#111827',
                  '--tw-prose-body': isDarkMode ? '#e5e7eb' : '#374151',
                  '--tw-prose-links': '#C7A667',
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Share Section */}
              <motion.div 
                className={`mt-16 pt-8 border-t transition-colors duration-300 ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <h3 className={`text-lg font-heading mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Share this article</h3>
                                 <div className="flex gap-4">
                   <motion.button 
                     className="p-2 transition-colors hover:scale-110"
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                   >
                     <img 
                       src="/icons/chain.png" 
                       alt="Copy Link" 
                       className="w-5 h-5 object-contain"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const textFallback = document.createElement('div');
                         textFallback.className = 'text-sm';
                         textFallback.textContent = '🔗';
                         target.parentElement?.appendChild(textFallback);
                       }}
                     />
                   </motion.button>
                   <motion.button 
                     className="p-2 transition-colors hover:scale-110"
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                   >
                     <img 
                       src="/icons/instagram.png" 
                       alt="Share on Instagram" 
                       className="w-5 h-5 object-contain"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const textFallback = document.createElement('div');
                         textFallback.className = 'text-sm';
                         textFallback.textContent = '📷';
                         target.parentElement?.appendChild(textFallback);
                       }}
                     />
                   </motion.button>
                   <motion.button 
                     className="p-2 transition-colors hover:scale-110"
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                   >
                     <img 
                       src="/icons/x.png" 
                       alt="Share on X" 
                       className="w-5 h-5 object-contain"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const textFallback = document.createElement('div');
                         textFallback.className = 'text-sm';
                         textFallback.textContent = '𝕏';
                         target.parentElement?.appendChild(textFallback);
                       }}
                     />
                   </motion.button>
                   <motion.button 
                     className="p-2 transition-colors hover:scale-110"
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.9 }}
                   >
                     <img 
                       src="/icons/whatsapp.png" 
                       alt="Share on WhatsApp" 
                       className="w-8 h-8 object-contain"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const textFallback = document.createElement('div');
                         textFallback.className = 'text-sm';
                         textFallback.textContent = '💬';
                         target.parentElement?.appendChild(textFallback);
                       }}
                     />
                   </motion.button>
                 </div>
              </motion.div>
            </div>
          </motion.section>
        </main>
      </div>
    </>
  );
}
