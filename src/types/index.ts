// ─── Domain enums / literal types ─────────────────────────────────────────────
export type ServiceCategory = 'hairdressing' | 'color' | 'treatments' | 'styling';
export type HairType = 'straight' | 'wavy' | 'curly';
export type BookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';
export type DiscountType = 'fixed' | 'percentage';

// ─── Core entities ─────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  nameEn: string;
  nameHe: string;
  descriptionEn?: string;
  descriptionHe?: string;
  durationMinutes: number;
  price: number;
  isAddon: boolean;
  isActive: boolean;
  category?: ServiceCategory;
  imageUrl?: string;
  order?: number;
  createdAt?: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  services: string[];            // service IDs
  serviceNames?: string[];       // denormalized for display
  date: string;                  // YYYY-MM-DD
  startTime: string;             // HH:mm
  endTime: string;               // HH:mm
  totalDuration?: number;        // minutes (computed)
  status: BookingStatus;
  hairType: HairType;
  isStudent?: boolean;
  notes?: string;
  images?: string[];             // Storage URLs
  totalPrice: number;
  finalPrice?: number;           // after discounts
  discountApplied?: number;
  createdAt: string;             // ISO string or Timestamp
  updatedAt?: string;
  reminderSent?: boolean;
  confirmationSent?: boolean;
  source?: 'web' | 'whatsapp' | 'phone' | 'admin';
}

// ─── Availability ─────────────────────────────────────────────────────────────
export interface DaySchedule {
  dayOfWeek: number;             // 0 = Sunday, 6 = Saturday
  isOpen: boolean;
  startTime: string;             // HH:mm
  endTime: string;               // HH:mm
}

export interface BlockedDate {
  id: string;
  date: string;                  // YYYY-MM-DD
  reason?: string;
  createdAt: string;
}

/** Legacy shape used by Firestore availability collection */
export interface Availability {
  id: string;
  dayOfWeek?: number;
  date?: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

// ─── Studio settings ──────────────────────────────────────────────────────────
export interface StudioSettings {
  studioName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  studentDiscountEnabled: boolean;
  studentDiscountAmount: number;
  studentDiscountType: DiscountType;
  slotIntervalMinutes: number;
  bookingLeadHours: number;      // minimum hours before booking allowed
  maxAdvanceBookingDays: number; // how many days ahead clients can book
  autoConfirm: boolean;          // auto-confirm on creation
  updatedAt?: string;
}

// ─── Client profile ───────────────────────────────────────────────────────────
export interface ClientProfile {
  phone: string;
  name: string;
  email?: string;
  hairType?: HairType;
  notes?: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  loyaltyPoints: number;
  isStudent?: boolean;
  createdAt: string;
  lastVisit?: string;
}

// ─── Computed / UI helpers ────────────────────────────────────────────────────
export interface BookingSlot {
  time: string;                  // HH:mm start
  endTime: string;               // HH:mm end
  isAvailable: boolean;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  todayBookings: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  weeklyData: { day: string; count: number; revenue: number }[];
}

// ─── API request / response shapes ────────────────────────────────────────────
export interface CreateBookingRequest {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceIds: string[];
  date: string;                  // YYYY-MM-DD
  startTime: string;             // HH:mm
  hairType: HairType;
  isStudent?: boolean;
  notes?: string;
  imageUrls?: string[];
}

export interface CreateBookingResponse {
  success: boolean;
  bookingId?: string;
  booking?: Booking;
  error?: string;
  conflict?: boolean;            // true when the slot is already taken
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface NotificationPayload {
  to: string;                    // E.164 phone number
  type: 'confirmation' | 'reminder' | 'cancellation' | 'owner_alert';
  booking: Booking;
  language: 'he' | 'en';
}
