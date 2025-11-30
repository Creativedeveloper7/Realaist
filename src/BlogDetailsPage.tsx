import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';

// Keep blog data in sync with BlogsPage
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
    tags: ["Market Trends", "Investment", "Kenya"],
    content: `Kenya's real estate market continues to show strong fundamentals in 2024.

From Nairobi's expanding satellite towns to master-planned communities along the coast, investors are finding new ways to participate in both off-plan and completed projects.

In this article, we break down:

- Key growth corridors (Nairobi, Mombasa, Kisumu and emerging secondary cities)
- Demand drivers such as infrastructure projects and a growing middle class
- What to look for when evaluating a developer and project.

As always, combine on-the-ground due diligence with data-driven analysis to identify the best opportunities for your portfolio.`,
  },
  {
    id: 2,
    title: 'Off-Plan vs Completed Properties: Which Offers Better Returns?',
    excerpt: 'A comprehensive comparison of off-plan and completed property investments.',
    author: 'REALAIST Team',
    date: 'March 10, 2024',
    category: 'Investment Guide',
    readTime: 7,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Off-Plan', 'Completed Properties', 'ROI'],
    content: `Both off-plan and completed properties can be powerful tools in a real estate strategy.

Off-plan projects often offer lower entry prices and flexible payment plans, but require patience and confidence in the developer's track record.

Completed properties give you immediate rental income potential and better visibility on actual finishes and neighbourhood dynamics.

In this guide, we compare risk, return, liquidity and timelines for each approach, and share scenarios where one may be preferable over the other.`,
  },
  {
    id: 3,
    title: 'Luxury Real Estate Trends in East Africa',
    excerpt: 'Explore the latest trends in luxury real estate across East Africa.',
    author: 'REALAIST Team',
    date: 'March 5, 2024',
    category: 'Luxury Market',
    readTime: 6,
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Luxury', 'Trends', 'East Africa'],
    content: `East Africa's luxury segment is evolving beyond traditional standalone villas.

We are seeing:

- Branded residences with hospitality partners
- Mixed-use developments that combine retail, office and high-end living
- Demand from both local high-net-worth individuals and diaspora investors.

This article explores micro-locations, ticket sizes and design trends shaping the next generation of luxury projects in Nairobi, Kampala, Dar es Salaam and coastal hotspots.`,
  },
];

export default function BlogDetailsPage() {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const idNum = Number(blogId);
  const blog = blogs.find((b) => b.id === idNum);

  if (!blog) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="text-center px-4">
          <p className="text-lg mb-4">Blog not found.</p>
          <button
            onClick={() => navigate('/blogs')}
            className="px-4 py-2 bg-[#C7A667] text-black rounded-lg hover:bg-[#B89657] transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/blogs')}
          className="mb-6 text-sm text-[#C7A667] hover:text-[#B89657]"
        >
          ← Back to Blogs
        </button>

        <article>
          <div className="mb-6">
            <span className="inline-block text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-white/20 mr-3">
              {blog.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {blog.date} • {blog.readTime} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#C7A667] to-[#B8956A] flex items-center justify-center text-black font-semibold text-sm">
              {blog.author.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{blog.author}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Realaist Insights</div>
            </div>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-[#C7A667]">
            {blog.content.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
