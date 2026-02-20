import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, MapPin, User } from 'lucide-react';
import { guestMessagesService, GuestMessage } from '../services/guestMessagesService';
import { useAuth } from '../contexts/AuthContext';

interface HostMessagesProps {
  isDarkMode: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export const HostMessages: React.FC<HostMessagesProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const { messages: list, error: err } = await guestMessagesService.getMessagesForHost();
      if (err) setError(err);
      else setMessages(list);
      setIsLoading(false);
    };
    load();
  }, []);

  const dark = isDarkMode;
  const cardBg = dark ? 'bg-[#111217] border-white/10' : 'bg-white border-gray-200';
  const heading = dark ? 'text-white' : 'text-gray-900';
  const subtext = dark ? 'text-white/70' : 'text-gray-600';
  const muted = dark ? 'text-white/50' : 'text-gray-400';

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold ${heading}`}>
          Guest Messages
        </h1>
        <p className={`mt-2 ${subtext}`}>
          Messages from guests who contact you about your short stay listings.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#C7A667] border-t-transparent mx-auto" />
          <p className={`mt-4 ${subtext}`}>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <motion.div
          className={`rounded-2xl border p-8 md:p-12 text-center ${cardBg}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
            <MessageSquare className={dark ? 'text-white/70' : 'text-gray-500'} size={32} />
          </div>
          <h2 className={`text-xl font-semibold mb-2 ${heading}`}>
            No messages yet
          </h2>
          <p className={`max-w-md mx-auto ${subtext}`}>
            When guests send you a message from your short stay listing, their messages will show up here.
          </p>
          <p className={`mt-4 text-sm ${muted}`}>
            <Mail size={14} className="inline mr-1" />
            Make sure your short stays are listed and active so guests can find and contact you.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              className={`rounded-2xl border p-5 ${cardBg} ${!msg.read ? (dark ? 'ring-1 ring-[#C7A667]/40' : 'ring-1 ring-[#C7A667]/50') : ''}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-[#C7A667]/20' : 'bg-[#C7A667]/20'}`}>
                    <User size={18} className="text-[#C7A667]" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${heading}`}>{msg.sender_name || 'Guest'}</p>
                    <p className={`text-sm truncate ${muted}`}>{msg.sender_email}</p>
                  </div>
                </div>
                <span className={`text-xs flex-shrink-0 ${muted}`}>{formatDate(msg.created_at)}</span>
              </div>
              {msg.property && (
                <div className={`flex items-center gap-2 text-sm mb-2 ${muted}`}>
                  <MapPin size={14} />
                  <span className="truncate">{msg.property.title}</span>
                  {msg.property.location && (
                    <span className="truncate"> · {msg.property.location}</span>
                  )}
                </div>
              )}
              <p className={`text-sm ${subtext} whitespace-pre-wrap break-words`}>{msg.message}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
