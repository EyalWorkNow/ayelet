import {
  collection, getDocs, setDoc, deleteDoc, doc, query, where,
  Timestamp,
} from 'firebase/firestore';
import { format, addMinutes } from 'date-fns';
import { db } from '../firebase';
import type { DaySchedule, BlockedDate, BookingSlot, Booking } from '../types';

// ─── Weekly schedule ──────────────────────────────────────────────────────────

export async function getWeeklySchedule(): Promise<DaySchedule[]> {
  const snap = await getDocs(collection(db, 'availability'));
  const result: DaySchedule[] = [];

  snap.docs.forEach(d => {
    const data = d.data();
    if (typeof data.dayOfWeek === 'number') {
      result.push({
        dayOfWeek: data.dayOfWeek,
        isOpen: data.isAvailable ?? data.isOpen ?? true,
        startTime: data.startTime ?? '10:00',
        endTime: data.endTime ?? '20:00',
      });
    }
  });

  // Fill in defaults for any missing days
  const existing = new Set(result.map(r => r.dayOfWeek));
  for (let d = 0; d <= 6; d++) {
    if (!existing.has(d)) {
      result.push({ dayOfWeek: d, isOpen: d <= 4, startTime: '10:00', endTime: '20:00' });
    }
  }

  return result.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

export async function saveWeeklySchedule(schedule: DaySchedule[]): Promise<void> {
  await Promise.all(
    schedule.map(day =>
      setDoc(doc(db, 'availability', `dow_${day.dayOfWeek}`), {
        dayOfWeek: day.dayOfWeek,
        isAvailable: day.isOpen,
        isOpen: day.isOpen,
        startTime: day.startTime,
        endTime: day.endTime,
      })
    )
  );
}

// ─── Blocked dates ────────────────────────────────────────────────────────────

export async function getBlockedDates(): Promise<BlockedDate[]> {
  const snap = await getDocs(collection(db, 'availability'));
  return snap.docs
    .filter(d => d.id.startsWith('blocked_'))
    .map(d => ({
      id: d.id,
      date: d.data().date as string,
      reason: d.data().reason,
      createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
    }));
}

export async function blockDate(date: string, reason?: string): Promise<void> {
  await setDoc(doc(db, 'availability', `blocked_${date}`), {
    date,
    isAvailable: false,
    reason: reason ?? '',
    createdAt: Timestamp.now(),
  });
}

export async function unblockDate(dateOrId: string): Promise<void> {
  const id = dateOrId.startsWith('blocked_') ? dateOrId : `blocked_${dateOrId}`;
  await deleteDoc(doc(db, 'availability', id));
}

// ─── Slot generation ──────────────────────────────────────────────────────────

export async function getAvailableSlots(
  date: string,
  durationMinutes: number,
  slotInterval = 30
): Promise<BookingSlot[]> {
  // Get day config
  const schedule = await getWeeklySchedule();
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const dayConfig = schedule.find(s => s.dayOfWeek === dayOfWeek);

  if (!dayConfig?.isOpen) return [];

  // Check blocked
  const blocked = await getBlockedDates();
  if (blocked.some(b => b.date === date)) return [];

  // Get existing bookings for the date
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', date),
    where('status', 'in', ['new', 'confirmed'])
  );
  const bookingSnap = await getDocs(q);
  const existing = bookingSnap.docs.map(d => d.data() as Pick<Booking, 'startTime' | 'endTime'>);

  // Generate slots
  const [startH, startM] = dayConfig.startTime.split(':').map(Number);
  const [endH, endM] = dayConfig.endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const now = new Date();
  const isToday = format(now, 'yyyy-MM-dd') === date;

  const slots: BookingSlot[] = [];

  for (let m = startMinutes; m + durationMinutes <= endMinutes; m += slotInterval) {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const min = (m % 60).toString().padStart(2, '0');
    const time = `${h}:${min}`;

    // Skip past times for today
    if (isToday) {
      const slotDate = new Date();
      slotDate.setHours(Math.floor(m / 60), m % 60, 0, 0);
      if (slotDate <= now) continue;
    }

    const slotStart = m;
    const slotEnd = m + durationMinutes;

    const hasConflict = existing.some(booking => {
      const [bsh, bsm] = booking.startTime.split(':').map(Number);
      const [beh, bem] = booking.endTime.split(':').map(Number);
      const bookStart = bsh * 60 + bsm;
      const bookEnd = beh * 60 + bem;
      return slotStart < bookEnd && slotEnd > bookStart;
    });

    const endTimeStr = format(
      addMinutes(new Date(`2000-01-01T${time}`), durationMinutes),
      'HH:mm'
    );

    slots.push({ time, endTime: endTimeStr, isAvailable: !hasConflict });
  }

  return slots;
}
