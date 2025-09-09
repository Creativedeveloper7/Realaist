import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Tag,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  imageUrl?: string;
  views: number;
  likes: number;
}

interface BlogsProps {
  isDarkMode: boolean;
}

export const Blogs: React.FC<BlogsProps> = ({ isDarkMode }) => {
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: 1,
      title: "The Future of Real Estate in Nairobi",
      excerpt: "Exploring the latest trends and developments in Nairobi's real estate market...",
      content: "Full blog content here...",
      author: "John Developer",
      publishedAt: "2024-01-15",
      status: "published",
      tags: ["Real Estate", "Nairobi", "Market Trends"],
      imageUrl: "/api/placeholder/400/200",
      views: 1250,
      likes: 45
    },
    {
      id: 2,
      title: "Sustainable Building Practices",
      excerpt: "How modern developers are incorporating eco-friendly practices...",
      content: "Full blog content here...",
      author: "John Developer",
      publishedAt: "2024-01-10",
      status: "published",
      tags: ["Sustainability", "Building", "Eco-friendly"],
      imageUrl: "/api/placeholder/400/200",
      views: 890,
      likes: 32
    },
    {
      id: 3,
      title: "Investment Opportunities in Westlands",
      excerpt: "A comprehensive guide to investing in Westlands properties...",
      content: "Full blog content here...",
      author: "John Developer",
      publishedAt: "2024-01-05",
      status: "draft",
      tags: ["Investment", "Westlands", "Guide"],
      views: 0,
      likes: 0
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteBlog = (blogId: number) => {
    setBlogs(prev => prev.filter(blog => blog.id !== blogId));
    setDeletingBlog(null);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setShowUploadModal(true);
  };

  const handleViewBlog = (blog: Blog) => {
    // Navigate to blog detail page or open in modal
    console.log('View blog:', blog);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-gray-50'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Blog Management
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Create, edit, and manage your blog posts
            </p>
          </div>
          <motion.button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C7A667] text-black rounded-lg hover:bg-[#B8965A] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            New Blog Post
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Posts</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {blogs.length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Eye size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Published</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {blogs.filter(blog => blog.status === 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <FileText size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Drafts</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {blogs.filter(blog => blog.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Eye size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {blogs.reduce((sum, blog) => sum + blog.views, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className={`p-6 rounded-xl mb-6 ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search blogs by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <motion.div
              key={blog.id}
              className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:shadow-xl'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Blog Image */}
              <div className="w-full h-48 bg-gray-200 dark:bg-white/10 rounded-lg mb-4 flex items-center justify-center">
                {blog.imageUrl ? (
                  <img 
                    src={blog.imageUrl} 
                    alt={blog.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon size={40} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                )}
              </div>

              {/* Blog Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className={`font-semibold text-lg line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {blog.title}
                  </h3>
                  <div className="relative">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
                      <MoreVertical size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                  </div>
                </div>

                <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {blog.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {blog.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[#C7A667]/10 text-[#C7A667] text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {blog.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{blog.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(blog.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {blog.views}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                    {blog.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-white/10">
                  <button
                    onClick={() => handleViewBlog(blog)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    <Eye size={12} />
                    View
                  </button>
                  <button
                    onClick={() => handleEditBlog(blog)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingBlog(blog)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No blogs found</p>
            <p className="text-sm">Try adjusting your search or create a new blog post</p>
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl ${
                isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setEditingBlog(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                  >
                    <X size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter blog title..."
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Excerpt
                    </label>
                    <textarea
                      placeholder="Enter blog excerpt..."
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Content
                    </label>
                    <textarea
                      placeholder="Write your blog content here..."
                      rows={8}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Tags
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas..."
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Featured Image
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      isDarkMode ? 'border-white/20' : 'border-gray-300'
                    }`}>
                      <Upload size={32} className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Click to upload or drag and drop
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-8">
                  <motion.button
                    className="flex-1 px-6 py-3 bg-[#C7A667] text-black rounded-lg hover:bg-[#B8965A] transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingBlog ? 'Update Blog Post' : 'Create Blog Post'}
                  </motion.button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setEditingBlog(null);
                    }}
                    className={`px-6 py-3 rounded-lg border ${
                      isDarkMode 
                        ? 'border-white/20 text-white hover:bg-white/10' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingBlog && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`w-full max-w-md rounded-xl ${
                isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Delete Blog Post
                  </h3>
                </div>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Are you sure you want to delete "{deletingBlog.title}"? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDeleteBlog(deletingBlog.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeletingBlog(null)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-white/20 text-white hover:bg-white/10' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
