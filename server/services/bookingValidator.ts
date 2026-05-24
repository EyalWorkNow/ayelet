import type admin from 'firebase-admin';
import { format, addMinutes } from 'date-fns';

export interface BookingInput {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  totalDuration: number;
  hairType: string;
  isStudent?: boolean;
  notes?: string;
  imageUrls?: string[];
  totalPrice: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  conflict?: boolean;
}

/**
 * Atomically validates and creates a booking using a Firestore transaction.
 * Prevents race conditions where two concurrent requests book the same slot.
 */
export async function createBookingAtomic(
  db: admin.firestore.Firestore,
  input: BookingInput
): Promise<{ bookingId: string; error?: string; conflict?: boolean }> {

  const bookingsRef = db.collection('bookings');

  return db.runTransaction(async (tx) => {
    // 1. Query existing bookings for the same date that are active
    const existingSnap = await tx.get(
      bookingsRef
        .where('date', '==', input.date)
        .where('status', 'in', ['new', 'confirmed'])
    );

    // 2. Check for time conflicts
    const [startH, startM] = input.startTime.split(':').map(Number);
    const [endH, endM] = input.endTime.split(':').map(Number);
    const newStart = startH * 60 + startM;
    const newEnd = endH * 60 + endM;

    for (const docSnap of existingSnap.docs) {
      const booking = docSnap.data();
      const [bsh, bsm] = booking.startTime.split(':').map(Number);
      const [beh, bem] = booking.endTime.split(':').map(Number);
      const bookStart = bsh * 60 + bsm;
      const bookEnd = beh * 60 + bem;

      if (newStart < bookEnd && newEnd > bookStart) {
        return {
          bookingId: '',
          error: `Slot ${input.startTime}–${input.endTime} is already booked`,
          conflict: true,
        };
      }
    }

    // 3. Create the booking document
    const newDocRef = bookingsRef.doc();
    tx.set(newDocRef, {
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      clientEmail: input.clientEmail ?? '',
      services: input.serviceIds,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      totalDuration: input.totalDuration,
      status: 'new',
      hairType: input.hairType,
      isStudent: input.isStudent ?? false,
      notes: input.notes ?? '',
      images: input.imageUrls ?? [],
      totalPrice: input.totalPrice,
      finalPrice: input.totalPrice,
      source: 'web',
      reminderSent: false,
      confirmationSent: false,
      createdAt: new Date(),
    });

    return { bookingId: newDocRef.id };
  });
}

// ─── Input validation (Zod-free version for simplicity) ───────────────────────

export function validateBookingInput(body: any): ValidationResult {
  if (!body.clientName || typeof body.clientName !== 'string' || body.clientName.trim().length < 2) {
    return { valid: false, error: 'clientName must be at least 2 characters' };
  }
  if (!body.clientPhone || !/^[\d\s\-+()]{7,20}$/.test(body.clientPhone)) {
    return { valid: false, error: 'Invalid clientPhone' };
  }
  if (!Array.isArray(body.serviceIds) || body.serviceIds.length === 0) {
    return { valid: false, error: 'serviceIds must be a non-empty array' };
  }
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return { valid: false, error: 'date must be YYYY-MM-DD' };
  }
  if (!body.startTime || !/^\d{2}:\d{2}$/.test(body.startTime)) {
    return { valid: false, error: 'startTime must be HH:mm' };
  }
  if (!body.endTime || !/^\d{2}:\d{2}$/.test(body.endTime)) {
    return { valid: false, error: 'endTime must be HH:mm' };
  }
  if (!['straight', 'wavy', 'curly'].includes(body.hairType)) {
    return { valid: false, error: 'hairType must be straight | wavy | curly' };
  }
  if (typeof body.totalPrice !== 'number' || body.totalPrice < 0) {
    return { valid: false, error: 'totalPrice must be a non-negative number' };
  }
  return { valid: true };
}
