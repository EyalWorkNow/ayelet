import type { Booking } from '../types';

// ─── Message templates ────────────────────────────────────────────────────────

const STUDIO_NAME = 'Ayelet Netanel Studio';

export function buildConfirmationMessage(booking: Booking, language: 'he' | 'en'): string {
  const dateStr = booking.date;           // YYYY-MM-DD
  const timeStr = booking.startTime;      // HH:mm

  if (language === 'he') {
    return (
      `*${STUDIO_NAME}* ✂️\n` +
      `שלום ${booking.clientName}!\n\n` +
      `✅ ההזמנה שלך אושרה:\n` +
      `📅 תאריך: ${dateStr}\n` +
      `🕐 שעה: ${timeStr}\n` +
      `💰 מחיר: ₪${booking.totalPrice}\n\n` +
      `לשינוי / ביטול — שלחי הודעה בוואטסאפ 🙏`
    );
  }
  return (
    `*${STUDIO_NAME}* ✂️\n` +
    `Hi ${booking.clientName}!\n\n` +
    `✅ Your appointment is confirmed:\n` +
    `📅 Date: ${dateStr}\n` +
    `🕐 Time: ${timeStr}\n` +
    `💰 Price: ₪${booking.totalPrice}\n\n` +
    `To reschedule or cancel — reply via WhatsApp 🙏`
  );
}

export function buildReminderMessage(booking: Booking, language: 'he' | 'en'): string {
  if (language === 'he') {
    return (
      `*${STUDIO_NAME}* ✂️\n` +
      `שלום ${booking.clientName}! 👋\n\n` +
      `תזכורת: מחר ${booking.date} בשעה ${booking.startTime} יש לך תור!\n` +
      `נשמח לראותך 💕`
    );
  }
  return (
    `*${STUDIO_NAME}* ✂️\n` +
    `Hi ${booking.clientName}! 👋\n\n` +
    `Reminder: Tomorrow ${booking.date} at ${booking.startTime} you have an appointment!\n` +
    `Looking forward to seeing you 💕`
  );
}

export function buildCancellationMessage(booking: Booking, language: 'he' | 'en'): string {
  if (language === 'he') {
    return (
      `*${STUDIO_NAME}*\n` +
      `שלום ${booking.clientName},\n` +
      `התור שלך ל-${booking.date} בוטל.\n` +
      `לקביעת תור חדש — לחצי כאן`
    );
  }
  return (
    `*${STUDIO_NAME}*\n` +
    `Hi ${booking.clientName},\n` +
    `Your appointment on ${booking.date} has been cancelled.\n` +
    `To rebook — click here`
  );
}

export function buildOwnerAlert(booking: Booking): string {
  return (
    `📅 הזמנה חדשה!\n` +
    `👤 ${booking.clientName} | 📞 ${booking.clientPhone}\n` +
    `📆 ${booking.date} ⏰ ${booking.startTime}–${booking.endTime}\n` +
    `💰 ₪${booking.totalPrice}`
  );
}

// ─── WhatsApp link (always works, no API needed) ──────────────────────────────

export function buildWhatsAppLink(phone: string, message: string): string {
  const e164 = phone.replace(/\D/g, '');
  const normalized = e164.startsWith('0')
    ? '972' + e164.slice(1)
    : e164;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

// ─── Server-side notification (fire-and-forget) ───────────────────────────────

export async function sendNotificationViaServer(payload: {
  phone: string;
  message: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'owner_alert';
  bookingId?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Convenience: open WhatsApp confirmation link in new tab ──────────────────

export function openWhatsAppConfirmation(booking: Booking, language: 'he' | 'en'): void {
  const message = buildConfirmationMessage(booking, language);
  const link = buildWhatsAppLink(booking.clientPhone, message);
  window.open(link, '_blank');
}
