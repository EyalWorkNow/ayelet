import { Router } from 'express';
import type { Request, Response } from 'express';
import { sendWhatsApp } from '../services/notifier.js';
import { verifyToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/notifications/send — send a WhatsApp message ──────────────────

router.post('/send', async (req: Request, res: Response) => {
  const { phone, message, type, bookingId } = req.body;

  if (!phone || !message) {
    res.status(400).json({ error: 'phone and message are required' });
    return;
  }

  const ok = await sendWhatsApp(phone, message);
  res.json({ success: ok });
});

// ─── POST /api/notifications/reminder/:bookingId — manual reminder trigger ───

router.post('/reminder/:bookingId', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = (req as any).app.get('db');
    const docSnap = await db.collection('bookings').doc(req.params.bookingId).get();

    if (!docSnap.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = docSnap.data();
    const msg =
      `*Ayelet Netanel Studio* ✂️\n` +
      `שלום ${booking.clientName}! 👋\n` +
      `תזכורת: ${booking.date} בשעה ${booking.startTime}\n` +
      `נשמח לראותך 💕`;

    const ok = await sendWhatsApp(booking.clientPhone, msg);
    if (ok) {
      await docSnap.ref.update({ reminderSent: true });
    }
    res.json({ success: ok });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
