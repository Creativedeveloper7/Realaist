import type { ScheduledVisit } from '../services/scheduledVisitsService';

/**
 * Parse short-stay booking details from the visit message.
 * Message format: "Short stay booking.\nCheck-in: YYYY-MM-DD\nCheck-out: ...\nNights: N\nGuests: N\nTotal: KSh X\nPayment reference: REF"
 */
function parseShortStayMessage(message?: string): {
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: number;
  total?: string;
  paymentRef?: string;
} {
  if (!message || !message.includes('Short stay')) return {};
  const lines = message.split('\n');
  const out: ReturnType<typeof parseShortStayMessage> = {};
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('Check-in:')) out.checkIn = t.replace(/^Check-in:\s*/i, '').trim();
    else if (t.startsWith('Check-out:')) out.checkOut = t.replace(/^Check-out:\s*/i, '').trim();
    else if (t.startsWith('Nights:')) out.nights = parseInt(t.replace(/\D/g, ''), 10) || undefined;
    else if (t.startsWith('Guests:')) out.guests = parseInt(t.replace(/\D/g, ''), 10) || undefined;
    else if (t.startsWith('Total:')) out.total = t.replace(/^Total:\s*/i, '').trim();
    else if (t.startsWith('Payment reference:')) out.paymentRef = t.replace(/^Payment reference:\s*/i, '').trim();
  }
  return out;
}

function formatDateForEmail(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Build the receipt email body for a short-stay booking.
 */
export function buildBookingReceiptBody(visit: ScheduledVisit): string {
  const guestName = visit.visitorName || (visit.buyer ? `${visit.buyer.firstName} ${visit.buyer.lastName}`.trim() : 'Guest');
  const propertyTitle = visit.property?.title || 'Short stay property';
  const location = visit.property?.location || '';
  const parsed = parseShortStayMessage(visit.message);
  const checkIn = parsed.checkIn || visit.scheduledDate;
  const checkOut = parsed.checkOut || visit.checkOutDate || checkIn;
  const nights = parsed.nights ?? 1;
  const guests = parsed.guests ?? 1;
  const total = parsed.total || (visit.property?.price != null ? `KSh ${Number(visit.property.price).toLocaleString()}` : '—');
  const paymentRef = parsed.paymentRef || '—';

  const checkInFormatted = formatDateForEmail(checkIn);
  const checkOutFormatted = formatDateForEmail(checkOut);

  return [
    `Dear ${guestName},`,
    '',
    'Thank you for your booking. Please find your confirmation and payment details below.',
    '',
    '--- BOOKING CONFIRMATION ---',
    '',
    `Property: ${propertyTitle}`,
    location ? `Location: ${location}` : '',
    '',
    'Check-in:  ' + checkInFormatted,
    'Check-out: ' + checkOutFormatted,
    `Nights:    ${nights}`,
    `Guests:    ${guests}`,
    '',
    '--- PAYMENT ---',
    '',
    `Amount paid: ${total}`,
    `Payment reference: ${paymentRef}`,
    '',
    '--- CHECK-OUT INSTRUCTIONS ---',
    '',
    `Please vacate the property by 11:00 AM on ${checkOutFormatted} (your last paid day).`,
    'Please leave the keys as agreed and ensure the property is left in a clean and tidy condition.',
    '',
    'If you have any questions, please reply to this email or contact us through Realaist.',
    '',
    'Thank you for choosing Realaist.',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/**
 * Get the guest email for receipt (visitor_email from booking form, or buyer email).
 */
export function getGuestEmailForReceipt(visit: ScheduledVisit): string {
  return visit.visitorEmail || visit.buyer?.email || '';
}

/**
 * Open the host's email client with a pre-filled receipt to the guest.
 * Subject and body are set so the host only needs to click Send.
 */
export function openReceiptEmailToGuest(visit: ScheduledVisit): boolean {
  const email = getGuestEmailForReceipt(visit);
  if (!email) {
    return false;
  }
  const propertyTitle = visit.property?.title || 'Short stay';
  const subject = encodeURIComponent(`Booking confirmation – ${propertyTitle}`);
  const body = encodeURIComponent(buildBookingReceiptBody(visit));
  const mailto = `mailto:${email}?subject=${subject}&body=${body}`;
  window.open(mailto, '_blank', 'noopener,noreferrer');
  return true;
}
