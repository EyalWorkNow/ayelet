import cron from 'node-cron';
import { format, addDays } from 'date-fns';
import { sendWhatsApp, buildReminderMsg, buildOwnerAlertMsg } from './notifier.js';

// Will be set after Firebase Admin is initialized
let db: any = null;

export function setSchedulerDb(firestoreDb: any): void {
  db = firestoreDb;
}

// ─── Send reminders for tomorrow's bookings (runs daily at 20:00) ─────────────

async function sendTomorrowReminders(): Promise<void> {
  if (!db) return;
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  console.log('[Scheduler] Sending reminders for', tomorrow);

  try {
    const snap = await db.collection('bookings')
      .where('date', '==', tomorrow)
      .where('status', 'in', ['new', 'confirmed'])
      .where('reminderSent', '==', false)
      .get();

    const batch = db.batch();
    let sent = 0;

    for (const doc of snap.docs) {
      const booking = doc.data();
      const msg = buildReminderMsg({
        clientName: booking.clientName,
        date: booking.date,
        startTime: booking.startTime,
      });
      const ok = await sendWhatsApp(booking.clientPhone, msg);
      if (ok) {
        batch.update(doc.ref, { reminderSent: true });
        sent++;
      }
    }

    await batch.commit();
    console.log(`[Scheduler] Reminders sent: ${sent}/${snap.size}`);
  } catch (err) {
    console.error('[Scheduler] Reminder error:', err);
  }
}

// ─── Morning briefing to owner (runs daily at 08:00) ─────────────────────────

async function sendOwnerMorningBriefing(): Promise<void> {
  if (!db) return;
  const ownerPhone = process.env.OWNER_PHONE;
  if (!ownerPhone) return;

  const today = format(new Date(), 'yyyy-MM-dd');

  try {
    const snap = await db.collection('bookings')
      .where('date', '==', today)
      .where('status', 'in', ['new', 'confirmed'])
      .orderBy('startTime', 'asc')
      .get();

    if (snap.empty) return;

    const lines = snap.docs.map((d: any) => {
      const b = d.data();
      return `• ${b.startTime} — ${b.clientName} (${b.clientPhone.slice(-4)})`;
    });

    const msg =
      `🗓️ לוח זמנים להיום — ${today}\n` +
      `${snap.size} תורים:\n\n` +
      lines.join('\n');

    await sendWhatsApp(ownerPhone, msg);
  } catch (err) {
    console.error('[Scheduler] Morning briefing error:', err);
  }
}

// ─── Register all cron jobs ───────────────────────────────────────────────────

export function startScheduler(): void {
  // Reminders: every day at 20:00 Israel time (UTC+3)
  cron.schedule('0 17 * * *', sendTomorrowReminders, { timezone: 'Asia/Jerusalem' });

  // Morning briefing: every day at 08:00 Israel time
  cron.schedule('0 8 * * *', sendOwnerMorningBriefing, { timezone: 'Asia/Jerusalem' });

  console.log('[Scheduler] Cron jobs registered');
}
