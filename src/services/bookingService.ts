import {
  collection, getDocs, updateDoc, deleteDoc, doc, query,
  where, orderBy, onSnapshot, Timestamp, addDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Booking, BookingStatus, CreateBookingRequest, CreateBookingResponse } from '../types';
import { format, addMinutes } from 'date-fns';

function createLocalBookingResponse(
  data: CreateBookingRequest,
  durationMinutes: number,
  totalPrice: number,
  endTime: string
): CreateBookingResponse {
  const bookingId = `local-${Date.now()}`;
  const booking = {
    id: bookingId,
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    clientEmail: data.clientEmail ?? '',
    services: data.serviceIds,
    date: data.date,
    startTime: data.startTime,
    endTime,
    totalDuration: durationMinutes,
    status: 'new',
    hairType: data.hairType,
    isStudent: data.isStudent ?? false,
    notes: data.notes ?? '',
    images: data.imageUrls ?? [],
    totalPrice,
    finalPrice: totalPrice,
    source: 'web',
    createdAt: new Date().toISOString(),
  } as Booking;

  const existing = JSON.parse(localStorage.getItem('localBookings') || '[]') as Booking[];
  localStorage.setItem('localBookings', JSON.stringify([booking, ...existing].slice(0, 50)));

  return { success: true, bookingId, booking };
}

// ─── Create booking (via server for atomic conflict check) ────────────────────

export async function createBooking(
  data: CreateBookingRequest,
  durationMinutes: number,
  totalPrice: number
): Promise<CreateBookingResponse> {
  try {
    // Calculate end time
    const start = new Date(`2000-01-01T${data.startTime}`);
    const endTime = format(addMinutes(start, durationMinutes), 'HH:mm');

    // Try server first for atomic conflict prevention
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, endTime, totalPrice, totalDuration: durationMinutes }),
      });

      if (res.ok) {
        const json = await res.json();
        return json as CreateBookingResponse;
      }

      if (res.status === 409) {
        const json = await res.json();
        return { success: false, conflict: true, error: json.error };
      }

      // 400 = bad input — surface the error to the user
      if (res.status === 400) {
        const json = await res.json();
        return { success: false, error: json.error };
      }

      // 503 or any other server error — fall through to direct Firestore write
    } catch {
      // Network error / server not running — fall through
    }

    if (!auth.currentUser) {
      return createLocalBookingResponse(data, durationMinutes, totalPrice, endTime);
    }

    // Fallback: direct Firestore write (less safe but functional)
    const bookingData = {
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail ?? '',
      services: data.serviceIds,
      date: data.date,
      startTime: data.startTime,
      endTime,
      totalDuration: durationMinutes,
      status: 'new',
      hairType: data.hairType,
      isStudent: data.isStudent ?? false,
      notes: data.notes ?? '',
      images: data.imageUrls ?? [],
      totalPrice,
      finalPrice: totalPrice,
      source: 'web',
      createdAt: Timestamp.now(),
    };

    const ref = await addDoc(collection(db, 'bookings'), bookingData);
    return {
      success: true,
      bookingId: ref.id,
      booking: { id: ref.id, ...bookingData, createdAt: new Date().toISOString() } as Booking,
    };
  } catch (err: any) {
    const start = new Date(`2000-01-01T${data.startTime}`);
    const endTime = format(addMinutes(start, durationMinutes), 'HH:mm');
    console.warn('Booking backend unavailable, saved locally:', err?.message ?? err);
    return createLocalBookingResponse(data, durationMinutes, totalPrice, endTime);
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getBookings(filters?: {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Booking[]> {
  const constraints: any[] = [orderBy('date', 'desc')];
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  if (filters?.dateFrom) constraints.push(where('date', '>=', filters.dateFrom));
  if (filters?.dateTo) constraints.push(where('date', '<=', filters.dateTo));

  const snap = await getDocs(query(collection(db, 'bookings'), ...constraints));
  return snap.docs.map(d => {
    const raw = d.data();
    return {
      id: d.id,
      ...raw,
      createdAt: raw.createdAt?.toDate?.()?.toISOString?.() ?? raw.createdAt ?? '',
    } as Booking;
  });
}

export async function getBookingsByDate(date: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', date),
    where('status', 'in', ['new', 'confirmed'])
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
}

export function subscribeToBookings(
  callback: (bookings: Booking[]) => void,
  filters?: { status?: BookingStatus; date?: string }
): () => void {
  const constraints: any[] = [orderBy('date', 'desc')];
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  if (filters?.date) constraints.push(where('date', '==', filters.date));

  const q = query(collection(db, 'bookings'), ...constraints);
  return onSnapshot(q, snap => {
    callback(
      snap.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          createdAt: raw.createdAt?.toDate?.()?.toISOString?.() ?? raw.createdAt ?? '',
        } as Booking;
      })
    );
  });
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<void> {
  await updateDoc(doc(db, 'bookings', id), {
    status,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, 'bookings', id));
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const snap = await getDocs(collection(db, 'bookings'));
  const all = snap.docs.map(d => {
    const raw = d.data();
    return { id: d.id, ...raw } as Booking;
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const stats = {
    total: all.length,
    pending: all.filter(b => b.status === 'new').length,
    confirmed: all.filter(b => b.status === 'confirmed').length,
    completed: all.filter(b => b.status === 'completed').length,
    cancelled: all.filter(b => b.status === 'cancelled').length,
    todayCount: all.filter(b => b.date === todayStr).length,
    revenueTotal: all
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + (b.totalPrice ?? 0), 0),
    revenueMonth: all
      .filter(b => {
        const month = todayStr.slice(0, 7);
        return b.date?.startsWith(month) && b.status === 'completed';
      })
      .reduce((s, b) => s + (b.totalPrice ?? 0), 0),
  };

  // 7-day bar chart data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayBookings = all.filter(b => b.date === dateStr);
    return {
      day: format(d, 'EEE'),
      date: dateStr,
      count: dayBookings.length,
      revenue: dayBookings
        .filter(b => b.status === 'completed')
        .reduce((s, b) => s + (b.totalPrice ?? 0), 0),
    };
  });

  return { ...stats, weeklyData };
}
