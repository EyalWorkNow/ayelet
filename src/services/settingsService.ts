import { doc, getDoc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { StudioSettings } from '../types';

export const DEFAULT_SETTINGS: StudioSettings = {
  studioName: 'Ayelet Netanel Studio',
  phone: '052-6201389',
  whatsappNumber: '972526201389',
  address: 'גבעת שמואל',
  instagramUrl: 'https://instagram.com/',
  facebookUrl: 'https://facebook.com/',
  tiktokUrl: 'https://tiktok.com/',
  studentDiscountEnabled: false,
  studentDiscountAmount: 10,
  studentDiscountType: 'percentage',
  slotIntervalMinutes: 30,
  bookingLeadHours: 2,
  maxAdvanceBookingDays: 60,
  autoConfirm: false,
};

export async function getSettings(): Promise<StudioSettings> {
  const snap = await getDoc(doc(db, 'settings', 'studio'));
  if (!snap.exists()) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...snap.data() } as StudioSettings;
}

export async function saveSettings(settings: StudioSettings): Promise<void> {
  await setDoc(doc(db, 'settings', 'studio'), {
    ...settings,
    updatedAt: Timestamp.now(),
  });
}

export function subscribeToSettings(
  callback: (settings: StudioSettings) => void
): () => void {
  return onSnapshot(doc(db, 'settings', 'studio'), snap => {
    callback(snap.exists()
      ? { ...DEFAULT_SETTINGS, ...snap.data() } as StudioSettings
      : DEFAULT_SETTINGS
    );
  });
}

// ─── Computed helpers ─────────────────────────────────────────────────────────

export function calcFinalPrice(
  basePrice: number,
  isStudent: boolean,
  settings: StudioSettings
): { finalPrice: number; discount: number } {
  if (!isStudent || !settings.studentDiscountEnabled) {
    return { finalPrice: basePrice, discount: 0 };
  }
  const discount =
    settings.studentDiscountType === 'percentage'
      ? Math.round(basePrice * settings.studentDiscountAmount / 100)
      : settings.studentDiscountAmount;
  return { finalPrice: Math.max(0, basePrice - discount), discount };
}
