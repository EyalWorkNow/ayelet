import https from 'https';
import http from 'http';

interface SendMessageOptions {
  phone: string;
  message: string;
}

// ─── Green API (popular in Israel) ───────────────────────────────────────────

async function sendViaGreenApi(phone: string, message: string): Promise<boolean> {
  const instanceId = process.env.GREEN_API_INSTANCE_ID;
  const token = process.env.GREEN_API_TOKEN;
  if (!instanceId || !token) return false;

  const e164 = normalizePhone(phone);
  const chatId = `${e164}@c.us`;

  return new Promise((resolve) => {
    const body = JSON.stringify({ chatId, message });
    const options = {
      hostname: 'api.green-api.com',
      path: `/waInstance${instanceId}/SendMessage/${token}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

// ─── Twilio WhatsApp ──────────────────────────────────────────────────────────

async function sendViaTwilio(phone: string, message: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. whatsapp:+14155238886
  if (!sid || !token || !from) return false;

  const e164 = normalizePhone(phone);
  const to = `whatsapp:+${e164}`;

  return new Promise((resolve) => {
    const body = new URLSearchParams({ To: to, From: from, Body: message }).toString();
    const options = {
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${sid}/Messages.json`,
      method: 'POST',
      auth: `${sid}:${token}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      resolve(res.statusCode === 201);
    });
    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  // Try Green API first (Israeli market)
  if (await sendViaGreenApi(phone, message)) {
    console.log('[Notifier] Sent via Green API to', phone.slice(-4));
    return true;
  }
  // Fall back to Twilio
  if (await sendViaTwilio(phone, message)) {
    console.log('[Notifier] Sent via Twilio to', phone.slice(-4));
    return true;
  }
  // Development / unconfigured — log the message
  console.log(`[Notifier] (no provider configured) → ${phone.slice(-4)}: ${message.slice(0, 80)}`);
  return false;
}

// ─── Message builders ─────────────────────────────────────────────────────────

const STUDIO_NAME = process.env.STUDIO_NAME ?? 'Ayelet Netanel Studio';
const BOOKING_URL = process.env.APP_URL ?? 'https://ayelet-studio.web.app';

export function buildConfirmationMsg(booking: {
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}): string {
  return (
    `*${STUDIO_NAME}* ✂️\n` +
    `שלום ${booking.clientName}! 💕\n\n` +
    `✅ ההזמנה אושרה:\n` +
    `📅 ${booking.date}  ⏰ ${booking.startTime}–${booking.endTime}\n` +
    `💰 ₪${booking.totalPrice}\n\n` +
    `לשינוי או ביטול — ענ/י כאן בוואטסאפ 🙏`
  );
}

export function buildReminderMsg(booking: {
  clientName: string;
  date: string;
  startTime: string;
}): string {
  return (
    `*${STUDIO_NAME}* ✂️\n` +
    `שלום ${booking.clientName}! 👋\n\n` +
    `📌 תזכורת: מחר ${booking.date} בשעה ${booking.startTime} יש לך תור!\n` +
    `נשמח לראותך 💕`
  );
}

export function buildOwnerAlertMsg(booking: {
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
}): string {
  return (
    `🆕 הזמנה חדשה\n` +
    `👤 ${booking.clientName}  📞 ${booking.clientPhone}\n` +
    `📆 ${booking.date}  ⏰ ${booking.startTime}–${booking.endTime}\n` +
    `💰 ₪${booking.totalPrice}`
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  if (digits.startsWith('972')) return digits;
  return digits;
}
