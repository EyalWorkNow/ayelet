import {
  doc, getDoc, setDoc, updateDoc, Timestamp, increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { ClientProfile, Booking, HairType } from '../types';

function phoneKey(phone: string): string {
  return phone.replace(/\D/g, '');
}

export async function getClientByPhone(phone: string): Promise<ClientProfile | null> {
  const snap = await getDoc(doc(db, 'clients', phoneKey(phone)));
  return snap.exists() ? (snap.data() as ClientProfile) : null;
}

export async function getOrCreateClient(
  phone: string,
  name: string,
  extra?: Partial<Pick<ClientProfile, 'email' | 'hairType' | 'isStudent'>>
): Promise<ClientProfile> {
  const key = phoneKey(phone);
  const existing = await getClientByPhone(phone);

  if (existing) {
    // Update name if changed
    if (existing.name !== name) {
      await updateDoc(doc(db, 'clients', key), { name });
    }
    return { ...existing, name };
  }

  const profile: ClientProfile = {
    phone: key,
    name,
    email: extra?.email,
    hairType: extra?.hairType,
    isStudent: extra?.isStudent,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'clients', key), {
    ...profile,
    createdAt: Timestamp.now(),
  });

  return profile;
}

export async function recordBookingForClient(
  phone: string,
  booking: Pick<Booking, 'status' | 'totalPrice' | 'hairType'>
): Promise<void> {
  const key = phoneKey(phone);
  const updates: Record<string, any> = { totalBookings: increment(1) };

  if (booking.status === 'completed') {
    updates.completedBookings = increment(1);
    updates.totalSpent = increment(booking.totalPrice ?? 0);
    updates.loyaltyPoints = increment(Math.floor((booking.totalPrice ?? 0) / 10));
    updates.lastVisit = Timestamp.now();
  }

  if (booking.status === 'cancelled') {
    updates.cancelledBookings = increment(1);
  }

  if (booking.hairType) {
    updates.hairType = booking.hairType;
  }

  await updateDoc(doc(db, 'clients', key), updates);
}

export async function updateClientHairType(phone: string, hairType: HairType): Promise<void> {
  const key = phoneKey(phone);
  await updateDoc(doc(db, 'clients', key), { hairType });
}
