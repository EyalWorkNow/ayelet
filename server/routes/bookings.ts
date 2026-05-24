import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAdminDb, hasCredentials } from '../services/firebaseAdmin.js';
import { createBookingAtomic, validateBookingInput } from '../services/bookingValidator.js';
import { sendWhatsApp, buildConfirmationMsg, buildOwnerAlertMsg } from '../services/notifier.js';
import { verifyToken, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/bookings — create booking atomically ───────────────────────────

router.post('/', async (req: Request, res: Response) => {
  const validation = validateBookingInput(req.body);
  if (!validation.valid) {
    res.status(400).json({ success: false, error: validation.error });
    return;
  }

  // No credentials — tell client to fall back to its direct Firestore write
  if (!hasCredentials()) {
    res.status(503).json({ success: false, error: 'Server credentials not configured', fallback: true });
    return;
  }

  try {
    const db = getAdminDb();
    const result = await createBookingAtomic(db, {
      clientName: req.body.clientName.trim(),
      clientPhone: req.body.clientPhone.trim(),
      clientEmail: req.body.clientEmail?.trim(),
      serviceIds: req.body.serviceIds,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      totalDuration: req.body.totalDuration ?? 60,
      hairType: req.body.hairType,
      isStudent: req.body.isStudent ?? false,
      notes: req.body.notes ?? '',
      imageUrls: req.body.imageUrls ?? [],
      totalPrice: req.body.totalPrice,
    });

    if (result.conflict) {
      res.status(409).json({ success: false, error: result.error, conflict: true });
      return;
    }

    // Fire-and-forget notifications
    const ownerPhone = process.env.OWNER_PHONE;
    const confirmMsg = buildConfirmationMsg(req.body);
    sendWhatsApp(req.body.clientPhone, confirmMsg).then(ok => {
      if (ok) {
        db.collection('bookings').doc(result.bookingId).update({ confirmationSent: true });
      }
    });

    if (ownerPhone) {
      sendWhatsApp(ownerPhone, buildOwnerAlertMsg(req.body));
    }

    res.status(201).json({ success: true, bookingId: result.bookingId });
  } catch (err: any) {
    console.error('[POST /api/bookings]', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── GET /api/bookings — admin only ──────────────────────────────────────────

router.get('/', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = getAdminDb();
    let q = db.collection('bookings').orderBy('date', 'desc') as any;

    if (req.query.status) q = q.where('status', '==', req.query.status);
    if (req.query.date) q = q.where('date', '==', req.query.date);

    const snap = await q.get();
    const bookings = snap.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt,
      };
    });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── PATCH /api/bookings/:id — update status (admin only) ────────────────────

router.patch('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['new', 'confirmed', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  try {
    await getAdminDb().collection('bookings').doc(req.params.id).update({
      status,
      updatedAt: new Date(),
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── DELETE /api/bookings/:id — admin only ────────────────────────────────────

router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await getAdminDb().collection('bookings').doc(req.params.id).delete();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ─── GET /api/bookings/stats — dashboard stats ───────────────────────────────

router.get('/stats', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection('bookings').get();
    const all = snap.docs.map((d: any) => d.data());

    const today = new Date().toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);

    const stats = {
      total: all.length,
      pending: all.filter((b: any) => b.status === 'new').length,
      completed: all.filter((b: any) => b.status === 'completed').length,
      cancelled: all.filter((b: any) => b.status === 'cancelled').length,
      todayCount: all.filter((b: any) => b.date === today).length,
      revenueMonth: all
        .filter((b: any) => b.date?.startsWith(monthPrefix) && b.status === 'completed')
        .reduce((s: number, b: any) => s + (b.totalPrice ?? 0), 0),
    };

    res.json({ success: true, stats });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
