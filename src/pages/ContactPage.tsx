import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { contactService } from '../services/contactService';
import { MessageSquare, Mail } from 'lucide-react';

export default function ContactPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const isHost = isAuthenticated && user?.userType === 'host';

  const [message, setMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : guestName;
  const email = user?.email ?? guestEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await contactService.createMessage({
        name: name || 'Guest',
        email: email || '',
        phone: user?.phone ?? '',
        message: message.trim(),
      });
      if (!result.error) {
        setFeedback({ type: 'success', text: 'Message sent. We will respond within 24 hours.' });
        setMessage('');
        if (!isAuthenticated) {
          setGuestName('');
          setGuestEmail('');
        }
      } else {
        setFeedback({ type: 'error', text: 'Failed to send. Try again or email Sales.realaist@gmail.com' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dark = isDarkMode;
  const cardBg = dark ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200';
  const heading = dark ? 'text-white' : 'text-gray-900';
  const subtext = dark ? 'text-white/70' : 'text-gray-600';
  const inputClass = dark
    ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#C7A667]/50'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-[#C7A667]';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#111217] text-white' : 'bg-white text-gray-900'}`}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} onLoginClick={() => {}} />

      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`rounded-2xl border p-6 sm:p-8 ${cardBg}`}
          >
            <h1
              className={`text-2xl sm:text-3xl font-heading ${heading}`}
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", letterSpacing: '0.05em' }}
            >
              Contact
            </h1>

            {isHost ? (
              <div className={`mt-4 p-4 rounded-xl border ${dark ? 'bg-[#C7A667]/10 border-[#C7A667]/30' : 'bg-[#C7A667]/5 border-[#C7A667]/30'}`}>
                <div className="flex gap-3">
                  <Mail className={`flex-shrink-0 mt-0.5 ${dark ? 'text-[#C7A667]' : 'text-[#B89657]'}`} size={20} />
                  <div>
                    <p className={`font-medium ${heading}`}>Direct message to admin</p>
                    <p className={`text-sm mt-1 ${subtext}`}>
                      Use this form to send a direct message to the Realaist admin team. Ideal for enquiries, complaints, account or listing support, or any other host-related matters. We will respond as soon as possible.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className={`mt-3 ${subtext}`}>
                Fill in your message below and our team will respond within 24 hours.
              </p>
            )}

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl text-sm ${
                  feedback.type === 'success'
                    ? dark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : dark ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {feedback.text}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isAuthenticated && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors ${inputClass}`}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors ${inputClass}`}
                  />
                </>
              )}
              <div>
                <label htmlFor="contact-message" className={`block text-sm font-medium mb-1.5 ${subtext}`}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="Type your message here..."
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors resize-none ${inputClass}`}
                />
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C7A667] text-black font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                <MessageSquare size={18} />
                {isSubmitting ? 'Sending...' : 'Send message'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
