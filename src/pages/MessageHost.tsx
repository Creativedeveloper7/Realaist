import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { propertiesService, Property } from '../services/propertiesService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function MessageHost() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        navigate('/short-stays');
        return;
      }

      setIsLoading(true);
      try {
        const result = await propertiesService.getPropertyById(propertyId);
        if (result.property) {
          setProperty(result.property);
        } else {
          navigate('/short-stays');
        }
      } catch (error) {
        console.error('Error loading property:', error);
        navigate('/short-stays');
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, navigate]);

  const handleSendMessage = async () => {
    if (!message.trim() || !property) return;

    setIsSending(true);
    try {
      // TODO: Implement actual message sending logic
      // For now, we'll just show a success message and redirect
      alert('Message sent! The host will respond shortly.');
      navigate(`/property/${propertyId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#111217]' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7A667]"></div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const developer = property.developer as any;
  const hostName = developer?.firstName || developer?.companyName || 'Host';
  const hostAvatar = developer?.avatarUrl || '/logos/realaistlogo.png';
  const responseTime = 'Typically responds within an hour';

  // Generate dummy check-in/checkout times
  const checkInTime = '1:00 PM';
  const checkOutTime = '10:00 AM';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-white text-gray-900' : 'bg-white text-gray-900'}`}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              isDarkMode ? 'hover:bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={24} className={isDarkMode ? 'text-gray-900' : 'text-gray-700'} />
          </button>
        </div>

        {/* Host Info */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-gray-900' : 'text-gray-900'}`}>
              Contact {hostName}
            </h1>
            <p className={`text-base ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>
              {responseTime}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={hostAvatar}
              alt={hostName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/logos/realaistlogo.png';
              }}
            />
          </div>
        </div>

        {/* Most travelers ask about */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-900' : 'text-gray-900'}`}>
            Most travelers ask about
          </h2>

          {/* Getting there */}
          <div className="mb-6">
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-900' : 'text-gray-900'}`}>
              Getting there:
            </h3>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Free parking on the premises.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Check-in time for this home starts at {checkInTime} and checkout is at {checkOutTime}.
                </span>
              </li>
            </ul>
          </div>

          {/* Price and availability */}
          <div>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-900' : 'text-gray-900'}`}>
              Price and availability:
            </h3>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-700' : 'text-gray-700'}`}>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Get a 5% discount on stays longer than a week, or 10% on stays longer than a month.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  {hostName}'s home is available from {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Book soon.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Cancel up to 24 hours before check-in and get a full refund. After that, cancel before check-in and get a full refund, minus the first night and service fee.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Message Input */}
        <div>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-900' : 'text-gray-900'}`}>
            Still have questions? Message the host
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${hostName}! I'll be visiting...`}
            className={`w-full h-32 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#C7A667] ${
              isDarkMode
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            className={`w-full mt-4 px-6 py-3 rounded-lg font-medium transition-colors ${
              message.trim() && !isSending
                ? 'bg-gray-800 text-white hover:bg-gray-900'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={message.trim() && !isSending ? { scale: 1.02 } : {}}
            whileTap={message.trim() && !isSending ? { scale: 0.98 } : {}}
          >
            {isSending ? 'Sending...' : 'Send message'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
