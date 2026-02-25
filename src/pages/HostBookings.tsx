import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { scheduledVisitsService, ScheduledVisit } from '../services/scheduledVisitsService';
import { openReceiptEmailToGuest, getGuestEmailForReceipt } from '../utils/bookingReceiptEmail';
import {
  Calendar,
  Mail,
  CheckCircle2,
  User,
  Home,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface HostBookingsProps {
  isDarkMode: boolean;
}

function parseShortStayFromMessage(message?: string): { checkIn?: string; checkOut?: string; nights?: number } {
  if (!message || !message.includes('Short stay')) return {};
  const lines = message.split('\n');
  const out: { checkIn?: string; checkOut?: string; nights?: number } = {};
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('Check-in:')) out.checkIn = t.replace(/^Check-in:\s*/i, '').trim();
    else if (t.startsWith('Check-out:')) out.checkOut = t.replace(/^Check-out:\s*/i, '').trim();
    else if (t.startsWith('Nights:')) out.nights = parseInt(t.replace(/\D/g, ''), 10) || undefined;
  }
  return out;
}

export default function HostBookings({ isDarkMode }: HostBookingsProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ScheduledVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const { visits, error: fetchError } = await scheduledVisitsService.getDeveloperScheduledVisits(user.id);
        if (fetchError) setError(fetchError);
        else setBookings(visits);
      } catch (e) {
        setError('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleApprove = async (visitId: string) => {
    setUpdatingId(visitId);
    try {
      const { error: updateError } = await scheduledVisitsService.updateVisitStatus(visitId, 'confirmed');
      if (!updateError) {
        setBookings((prev) =>
          prev.map((b) => (b.id === visitId ? { ...b, status: 'confirmed' as const } : b))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendConfirmation = (visit: ScheduledVisit) => {
    const sent = openReceiptEmailToGuest(visit);
    if (!sent) {
      const email = getGuestEmailForReceipt(visit);
      alert(email ? 'Could not open email client.' : 'No guest email on this booking.');
    }
  };

  const filtered =
    statusFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const dark = isDarkMode;
  const cardBg = dark ? 'bg-[#0E0E10] border-white/10' : 'bg-white border-gray-200';
  const text = dark ? 'text-white' : 'text-gray-900';
  const muted = dark ? 'text-white/60' : 'text-gray-600';
  const border = dark ? 'border-white/10' : 'border-gray-200';

  const getStatusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded text-xs font-medium border';
    switch (status) {
      case 'scheduled':
        return `${base} ${dark ? 'bg-amber-900/40 text-amber-200 border-amber-600/50' : 'bg-amber-50 text-amber-800 border-amber-200'}`;
      case 'confirmed':
        return `${base} ${dark ? 'bg-emerald-900/40 text-emerald-200 border-emerald-600/50' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`;
      case 'completed':
        return `${base} ${dark ? 'bg-white/10 text-white/80 border-white/20' : 'bg-gray-100 text-gray-700 border-gray-200'}`;
      case 'cancelled':
        return `${base} ${dark ? 'bg-red-900/40 text-red-200 border-red-600/50' : 'bg-red-50 text-red-800 border-red-200'}`;
      default:
        return `${base} ${muted}`;
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl font-bold ${text}`}>Bookings</h2>
        <p className={`text-sm ${muted} mt-1`}>
          View, approve, and send confirmation emails to guests.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-[#C7A667] text-black'
                : dark
                  ? 'bg-white/5 text-white/80 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center gap-2 p-4 rounded-xl border ${cardBg} ${border}`}
        >
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className={muted}>{error}</p>
        </motion.div>
      )}

      {isLoading ? (
        <div className={`flex items-center justify-center py-16 ${muted}`}>
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl border ${cardBg} ${border} p-12 text-center`}
        >
          <Calendar className={`w-12 h-12 mx-auto ${muted} mb-4`} />
          <p className={text}>No bookings match the current filter.</p>
          <p className={`text-sm ${muted} mt-1`}>
            {statusFilter === 'all' ? 'When guests book your short stays, they will appear here.' : 'Try selecting "All".'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((visit) => {
            const parsed = parseShortStayFromMessage(visit.message);
            const checkIn = parsed.checkIn || visit.scheduledDate;
            const checkOut = parsed.checkOut || visit.checkOutDate || checkIn;
            const nights = parsed.nights ?? 1;
            const guestName = visit.visitorName || (visit.buyer ? `${visit.buyer.firstName || ''} ${visit.buyer.lastName || ''}`.trim() : 'Guest') || 'Guest';
            const guestEmail = getGuestEmailForReceipt(visit);
            const isShortStay = !!visit.checkOutDate || (visit.message || '').includes('Short stay');

            return (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border ${cardBg} ${border} p-6`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={getStatusBadge(visit.status)}>{visit.status}</span>
                      {isShortStay && (
                        <span className={`text-xs ${muted}`}>Short stay</span>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      {visit.property?.images?.[0] ? (
                        <img
                          src={visit.property.images[0]}
                          alt=""
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
                          <Home className={`w-8 h-8 ${muted}`} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`font-medium ${text}`}>{visit.property?.title || 'Property'}</p>
                        {visit.property?.location && (
                          <p className={`text-sm ${muted}`}>{visit.property.location}</p>
                        )}
                        <div className={`flex items-center gap-2 mt-2 text-sm ${muted}`}>
                          <User size={14} />
                          <span>{guestName}</span>
                          {guestEmail && <span>· {guestEmail}</span>}
                        </div>
                        <div className={`flex flex-wrap gap-4 mt-2 text-sm ${muted}`}>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(checkIn)} → {formatDate(checkOut)}
                          </span>
                          {nights > 0 && <span>{nights} night{nights !== 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                    {visit.status === 'scheduled' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(visit.id)}
                        disabled={!!updatingId}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C7A667] text-black font-medium text-sm hover:opacity-90 disabled:opacity-50"
                      >
                        {updatingId === visit.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    )}
                    {visit.status !== 'cancelled' && guestEmail && (
                      <button
                        type="button"
                        onClick={() => handleSendConfirmation(visit)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm ${
                          dark ? 'border-[#C7A667]/50 text-[#C7A667] hover:bg-[#C7A667]/10' : 'border-[#C7A667] text-[#C7A667] hover:bg-[#C7A667]/10'
                        }`}
                      >
                        <Mail className="w-4 h-4" />
                        Send confirmation email
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
