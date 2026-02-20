import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { propertiesService, Property } from '../services/propertiesService';
import { guestMessagesService } from '../services/guestMessagesService';
import { ArrowLeft, MessageCircle, Shield } from 'lucide-react';
import { useEffect } from 'react';

export default function MessageHost() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (name && !senderName) setSenderName(name);
      if (user.email && !senderEmail) setSenderEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        navigate('/short-stays');
        return;
      }
      setIsLoading(true);
      try {
        const result = await propertiesService.getPropertyById(propertyId);
        if (result.property) setProperty(result.property);
        else navigate('/short-stays');
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
    const name = senderName.trim();
    const email = senderEmail.trim();
    const emailValid = /^\S+@\S+\.\S+$/.test(email);
    if (!message.trim() || !property || !propertyId) return;
    if (!name) {
      setSendError('Please enter your name.');
      return;
    }
    if (!email) {
      setSendError('Please enter your email address.');
      return;
    }
    if (!emailValid) {
      setSendError('Please enter a valid email address.');
      return;
    }
    setSendError(null);
    setIsSending(true);
    try {
      const { error } = await guestMessagesService.sendMessage({
        propertyId,
        senderId: user?.id ?? null,
        senderName: name,
        senderEmail: email,
        message: message.trim(),
      });
      if (error) {
        setSendError(error);
        return;
      }
      alert('Message sent! The host will respond shortly.');
      navigate(`/property/${propertyId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      setSendError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0E0E10]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#C7A667] border-t-transparent" />
      </div>
    );
  }

  if (!property) return null;

  const developer = property.developer as { firstName?: string; companyName?: string; avatarUrl?: string } | undefined;
  const hostName = developer?.firstName || developer?.companyName || 'Host';
  const hostAvatar = developer?.avatarUrl || '/logos/realaistlogo.png';
  const responseTime = 'Typically responds within an hour';
  const checkInTime = '1:00 PM';
  const checkOutTime = '10:00 AM';

  const dark = isDarkMode;
  const pageBg = dark ? 'bg-[#0E0E10]' : 'bg-gray-50';
  const cardBg = dark ? 'bg-[#111217] border-white/10' : 'bg-white border-gray-200';
  const heading = dark ? 'text-white' : 'text-gray-900';
  const subtext = dark ? 'text-white/70' : 'text-gray-600';
  const muted = dark ? 'text-white/60' : 'text-gray-500';
  const accent = 'text-[#C7A667]';
  const accentBorder = 'border-[#C7A667]';
  const btnEnabled = 'bg-[#C7A667] text-black hover:bg-[#B8965A]';
  const btnDisabled = dark ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed';
  const inputStyle = dark
    ? 'bg-white/5 border-white/15 text-white placeholder-white/40 focus:border-[#C7A667]'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]';

  return (
    <div className={`min-h-screen ${pageBg} transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <motion.button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-8 transition-colors ${dark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={20} />
          <span>Back to listing</span>
        </motion.button>

        {/* Host card */}
        <motion.div
          className={`rounded-2xl border p-6 mb-8 ${cardBg}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className={`font-heading text-2xl md:text-3xl font-semibold mb-1 ${heading}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", letterSpacing: '0.05em' }}>
                Contact {hostName}
              </h1>
              <p className={`text-sm ${subtext}`}>{responseTime}</p>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C7A667]/30 flex-shrink-0 ring-2 ring-[#C7A667]/20">
              <img
                src={hostAvatar}
                alt={hostName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/logos/realaistlogo.png'; }}
              />
            </div>
          </div>
        </motion.div>

        {/* Sections card */}
        <motion.div
          className={`rounded-2xl border p-6 mb-8 ${cardBg}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className={`font-heading text-lg font-semibold mb-5 ${heading}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", letterSpacing: '0.04em' }}>
            What guests usually ask
          </h2>

          <div className="mb-6">
            <h3 className={`font-semibold mb-2 flex items-center gap-2 ${heading}`}>
              <span className={`w-1 h-5 rounded-full ${dark ? 'bg-[#C7A667]' : 'bg-[#C7A667]'}`} />
              Getting there
            </h3>
            <ul className={`space-y-2 text-sm ${subtext}`}>
              <li className="flex items-start gap-2">
                <span className={accent}>•</span>
                <span>Free parking on the premises.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={accent}>•</span>
                <span>Check-in from {checkInTime}, checkout by {checkOutTime}.</span>
              </li>
            </ul>
          </div>

          {/* Privacy (Guest & Host) - replaces Price and availability */}
          <div>
            <h3 className={`font-semibold mb-2 flex items-center gap-2 ${heading}`}>
              <Shield size={16} className="text-[#C7A667]" />
              Privacy (Guest & Host)
            </h3>
            <div className={`text-sm ${subtext} space-y-3`}>
              <p>
                By messaging through this platform, you agree that your name, email, and message content may be shared with the host solely to respond to your enquiry. We do not use your contact details for marketing unless you opt in.
              </p>
              <p>
                Hosts may keep a record of conversations for the duration of your booking and for resolving any disputes. Messages are stored securely and handled in line with our Privacy Policy.
              </p>
              <p>
                Do not share sensitive personal or payment information in messages. For bookings and payments, use only the official booking and payment flows provided on Realaist.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Message form */}
        <motion.div
          className={`rounded-2xl border p-6 ${cardBg}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className={`font-heading text-lg font-semibold mb-2 flex items-center gap-2 ${heading}`} style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", letterSpacing: '0.04em' }}>
            <MessageCircle size={20} className="text-[#C7A667]" />
            Still have questions? Message the host
          </h2>
          <p className={`text-sm ${muted} mb-4`}>The host will reply to the email you provide below.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${heading}`}>Your name *</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#C7A667]/50 transition-colors ${inputStyle}`}
                disabled={isSending}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${heading}`}>Your email *</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. jane@example.com"
                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#C7A667]/50 transition-colors ${inputStyle}`}
                disabled={isSending}
              />
            </div>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${hostName}! I'll be visiting...`}
            className={`w-full h-32 p-4 border rounded-xl resize-none outline-none focus:ring-2 focus:ring-[#C7A667]/50 transition-colors ${inputStyle}`}
            disabled={isSending}
          />
          {sendError && (
            <p className="mt-2 text-sm text-red-500">{sendError}</p>
          )}
          <motion.button
            onClick={handleSendMessage}
            disabled={!senderName.trim() || !senderEmail.trim() || !message.trim() || isSending}
            className={`w-full mt-4 px-6 py-3 rounded-xl font-medium transition-colors ${senderName.trim() && senderEmail.trim() && message.trim() && !isSending ? btnEnabled : btnDisabled}`}
            whileHover={senderName.trim() && senderEmail.trim() && message.trim() && !isSending ? { scale: 1.01 } : {}}
            whileTap={senderName.trim() && senderEmail.trim() && message.trim() && !isSending ? { scale: 0.99 } : {}}
          >
            {isSending ? 'Sending...' : 'Send message'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
