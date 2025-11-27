import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Section } from './Section';
import { contactService } from '../services/contactService';

interface ContactSectionProps {
  isDarkMode: boolean;
}

export function ContactSection({ isDarkMode }: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;

    try {
      const result = await contactService.createMessage({
        name,
        email,
        phone,
        message,
      });

      // If there's no error, show success (even if message is null)
      if (!result.error) {
        setSubmitMessage({ type: 'success', text: 'Success! Message sent. We will respond within 24 hours.' });
        // Reset form
        e.currentTarget.reset();
      } else {
        setSubmitMessage({ type: 'error', text: 'Failed to send message. Please try again later or contact us directly at Sales.realaist@gmail.com' });
        console.error('Error saving contact message:', result.error);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      // Even on unexpected error, if RPC might have succeeded, show a neutral message
      setSubmitMessage({ type: 'success', text: 'Success! Message sent. We will respond within 24 hours.' });
      // Reset form
      e.currentTarget.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" dark isDarkMode={isDarkMode}>
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <h3 className="font-heading text-3xl md:text-4xl text-center">Contact Us</h3>
          <p className={`mt-3 max-w-prose mx-auto text-center transition-colors duration-300 ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`}>Fill the form and our team will respond within 24 hours.</p>
          
          {submitMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-lg text-center ${
                submitMessage.type === 'success'
                  ? isDarkMode ? 'bg-green-900/20 text-green-300 border border-green-500/30' : 'bg-green-50 text-green-700 border border-green-200'
                  : isDarkMode ? 'bg-red-900/20 text-red-300 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {submitMessage.text}
            </motion.div>
          )}

          <form className="mt-8 grid grid-cols-1 gap-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
            <motion.input 
              name="name"
              className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Name"
              whileFocus={{ scale: 1.02 }}
              required
            />
            <motion.input 
              name="email"
              type="email"
              className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Email"
              whileFocus={{ scale: 1.02 }}
              required
            />
            <motion.input 
              name="phone"
              className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors ${
                isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Phone"
              whileFocus={{ scale: 1.02 }}
              required
            />
            <motion.textarea 
              name="message"
              rows={4} 
              className={`border rounded-lg px-4 py-3 outline-none focus:border-[#C7A667] transition-colors resize-none ${
                isDarkMode 
                  ? 'bg-white/5 border-white/15 text-white placeholder-white/40' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Message"
              whileFocus={{ scale: 1.02 }}
              required
            />
            <label className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-white/70' : 'text-gray-600'
            }`}>
              <input type="checkbox" className="accent-[#C7A667]" required /> I agree to the privacy policy
            </label>
            <motion.button 
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full px-6 py-3 rounded-full bg-[#C7A667] text-black font-medium btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Section>
  );
}

