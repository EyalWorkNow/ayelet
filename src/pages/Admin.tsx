import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  Calendar,
  CalendarDays,
  CalendarOff,
  ChevronLeft,
  Clock,
  DollarSign,
  Gauge,
  LayoutDashboard,
  LogOut,
  Plus,
  Save,
  Scissors,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react';
import { format, isToday, parseISO, subDays } from 'date-fns';
import { auth, db } from '../firebase';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../components/Toast';
import { BrandMark } from '../components/BrandLogo';
import type { Booking, BookingStatus, DaySchedule, Service, ServiceCategory, StudioSettings } from '../types';
import { getServiceDisplayName, getServiceDisplayPrice, normalizeServices } from '../utils/serviceDisplay';

const ADMIN_EMAILS = ['admin@admin.com', 'eyalatiyawork@gmail.com', 'admin@ayala.com'];
const LOCAL_MODE = () => localStorage.getItem('studioAccess') === 'admin' && !auth.currentUser;

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, isOpen: true, startTime: '10:00', endTime: '20:00' },
  { dayOfWeek: 1, isOpen: true, startTime: '10:00', endTime: '20:00' },
  { dayOfWeek: 2, isOpen: true, startTime: '10:00', endTime: '20:00' },
  { dayOfWeek: 3, isOpen: true, startTime: '10:00', endTime: '20:00' },
  { dayOfWeek: 4, isOpen: true, startTime: '10:00', endTime: '20:00' },
  { dayOfWeek: 5, isOpen: false, startTime: '10:00', endTime: '14:00' },
  { dayOfWeek: 6, isOpen: false, startTime: '10:00', endTime: '14:00' },
];

const DEFAULT_SETTINGS: StudioSettings = {
  studioName: 'Ayelet Netanel Studio',
  phone: '052-6201389',
  whatsappNumber: '972526201389',
  address: '',
  instagramUrl: 'https://instagram.com/',
  facebookUrl: 'https://facebook.com/',
  tiktokUrl: 'https://tiktok.com/',
  studentDiscountEnabled: false,
  studentDiscountAmount: 10,
  studentDiscountType: 'percentage',
  slotIntervalMinutes: 30,
  bookingLeadHours: 2,
  maxAdvanceBookingDays: 42,
  autoConfirm: false,
};

const dayNames = {
  he: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

const statusCopy = {
  he: { new: 'חדש', confirmed: 'מאושר', completed: 'הושלם', cancelled: 'בוטל' },
  en: { new: 'New', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' },
};

const categoryCopy = {
  he: { hairdressing: 'תספורות', color: 'צבע', treatments: 'טיפולים', styling: 'עיצוב' },
  en: { hairdressing: 'Hair', color: 'Color', treatments: 'Treatments', styling: 'Styling' },
};

const adminCopy = {
  he: {
    workspace: 'מרכז ניהול הסטודיו',
    subtitle: 'שליטה בתורים, שירותים, זמינות והגדרות ממקום אחד, עם מצב דמו יציב כש-Firebase לא זמין.',
    live: 'מחובר ל-Firestore',
    demo: 'מצב דמו מקומי',
    dashboard: 'תמונת מצב',
    bookings: 'תורים',
    services: 'שירותים',
    availability: 'זמינות',
    settings: 'הגדרות',
    today: 'היום',
    nextAction: 'פעולה מומלצת',
    pendingReview: 'בקשות שמחכות לאישור',
    noUrgent: 'אין בקשות דחופות כרגע',
    revenue: 'הכנסות שהושלמו',
    completion: 'יחס השלמה',
    activeServices: 'שירותים פעילים',
    nextBookings: 'התורים הקרובים',
    weeklyDemand: 'ביקוש 7 ימים',
    searchBookings: 'חיפוש שם או טלפון',
    all: 'הכל',
    emptyBookings: 'אין תורים להצגה',
    confirm: 'אישור',
    complete: 'הושלם',
    cancel: 'ביטול',
    delete: 'מחיקה',
    addService: 'הוספת שירות',
    serviceNameHe: 'שם בעברית',
    serviceNameEn: 'שם באנגלית',
    price: 'מחיר',
    duration: 'משך בדקות',
    category: 'קטגוריה',
    addon: 'תוספת',
    active: 'פעיל',
    save: 'שמירה',
    close: 'סגירה',
    weeklySchedule: 'לוח שבועי',
    blockedDates: 'ימים חסומים',
    blockDate: 'חסימת יום',
    noBlockedDates: 'אין ימים חסומים',
    open: 'פתוח',
    closed: 'סגור',
    contactSettings: 'פרטי התקשרות',
    bookingPolicy: 'מדיניות קביעת תור',
    saved: 'נשמר בהצלחה',
    loadError: 'נטען מצב מקומי בגלל בעיית שרת',
  },
  en: {
    workspace: 'Studio Command Center',
    subtitle: 'Bookings, catalog, availability, and studio policy in one resilient operating surface.',
    live: 'Firestore connected',
    demo: 'Local demo mode',
    dashboard: 'Overview',
    bookings: 'Bookings',
    services: 'Services',
    availability: 'Availability',
    settings: 'Settings',
    today: 'Today',
    nextAction: 'Recommended action',
    pendingReview: 'Requests waiting for confirmation',
    noUrgent: 'No urgent requests right now',
    revenue: 'Completed revenue',
    completion: 'Completion rate',
    activeServices: 'Active services',
    nextBookings: 'Upcoming bookings',
    weeklyDemand: '7-day demand',
    searchBookings: 'Search name or phone',
    all: 'All',
    emptyBookings: 'No bookings to show',
    confirm: 'Confirm',
    complete: 'Complete',
    cancel: 'Cancel',
    delete: 'Delete',
    addService: 'Add service',
    serviceNameHe: 'Hebrew name',
    serviceNameEn: 'English name',
    price: 'Price',
    duration: 'Duration minutes',
    category: 'Category',
    addon: 'Add-on',
    active: 'Active',
    save: 'Save',
    close: 'Close',
    weeklySchedule: 'Weekly schedule',
    blockedDates: 'Blocked dates',
    blockDate: 'Block date',
    noBlockedDates: 'No blocked dates',
    open: 'Open',
    closed: 'Closed',
    contactSettings: 'Contact settings',
    bookingPolicy: 'Booking policy',
    saved: 'Saved',
    loadError: 'Loaded local fallback because the backend is unavailable',
  },
};

type LocalBlockedDate = { date: string; reason?: string };
type DataSource = 'firestore' | 'local';

interface WorkspaceState {
  bookings: Booking[];
  services: Service[];
  schedule: DaySchedule[];
  blockedDates: LocalBlockedDate[];
  settings: StudioSettings;
  source: DataSource;
}

interface ServiceDraft {
  nameHe: string;
  nameEn: string;
  price: number;
  durationMinutes: number;
  category: ServiceCategory;
  isAddon: boolean;
  isActive: boolean;
}

const emptyDraft: ServiceDraft = {
  nameHe: '',
  nameEn: '',
  price: 0,
  durationMinutes: 45,
  category: 'hairdressing',
  isAddon: false,
  isActive: true,
};

const getLocalBookings = () => JSON.parse(localStorage.getItem('localBookings') || '[]') as Booking[];
const getLocalServices = () => JSON.parse(localStorage.getItem('localAdminServices') || '[]') as Service[];
const getLocalSchedule = () =>
  JSON.parse(localStorage.getItem('localAvailabilitySchedule') || 'null') as DaySchedule[] | null;
const getLocalBlockedDates = () =>
  JSON.parse(localStorage.getItem('localBlockedDates') || '[]') as LocalBlockedDate[];
const getLocalSettings = () =>
  JSON.parse(localStorage.getItem('localStudioSettings') || 'null') as StudioSettings | null;

function saveLocalWorkspace(partial: Partial<WorkspaceState>) {
  if (partial.bookings) localStorage.setItem('localBookings', JSON.stringify(partial.bookings));
  if (partial.services) localStorage.setItem('localAdminServices', JSON.stringify(partial.services));
  if (partial.schedule) localStorage.setItem('localAvailabilitySchedule', JSON.stringify(partial.schedule));
  if (partial.blockedDates) localStorage.setItem('localBlockedDates', JSON.stringify(partial.blockedDates));
  if (partial.settings) localStorage.setItem('localStudioSettings', JSON.stringify(partial.settings));
}

function bookingDateTime(booking: Booking) {
  return `${booking.date}T${booking.startTime || '00:00'}`;
}

function safeDateLabel(date: string, fallback = '') {
  try {
    return format(parseISO(date), 'dd.MM.yyyy');
  } catch {
    return fallback || date;
  }
}

function safeDateTimeLabel(booking: Booking) {
  return `${safeDateLabel(booking.date)} · ${booking.startTime || ''}-${booking.endTime || ''}`;
}

function isBookingToday(date: string) {
  try {
    return isToday(parseISO(date));
  } catch {
    return false;
  }
}

function statusTone(status: BookingStatus) {
  if (status === 'new') return 'bg-blue-50 text-blue-700 border-blue-100';
  if (status === 'confirmed') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'completed') return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  return 'bg-red-50 text-red-600 border-red-100';
}

function normalizeFirestoreBooking(id: string, raw: any): Booking {
  return {
    id,
    ...raw,
    createdAt: raw.createdAt?.toDate?.()?.toISOString?.() ?? raw.createdAt ?? new Date().toISOString(),
  } as Booking;
}

async function loadFirestoreWorkspace(): Promise<WorkspaceState> {
  const [bookingSnap, serviceSnap, availabilitySnap, settingsSnap] = await Promise.all([
    getDocs(query(collection(db, 'bookings'), orderBy('date', 'desc'), orderBy('startTime', 'desc'))),
    getDocs(collection(db, 'services')),
    getDocs(collection(db, 'availability')),
    getDoc(doc(db, 'settings', 'studio')),
  ]);

  const services = normalizeServices(
    serviceSnap.docs.map(serviceDoc => ({ id: serviceDoc.id, ...serviceDoc.data() })) as Service[]
  );
  const weekMap = new Map<number, DaySchedule>();
  const blockedDates: LocalBlockedDate[] = [];

  availabilitySnap.docs.forEach(availabilityDoc => {
    const data = availabilityDoc.data();
    if (typeof data.dayOfWeek === 'number') {
      weekMap.set(data.dayOfWeek, {
        dayOfWeek: data.dayOfWeek,
        isOpen: data.isAvailable ?? data.isOpen ?? true,
        startTime: data.startTime ?? '10:00',
        endTime: data.endTime ?? '20:00',
      });
    } else if (data.date) {
      blockedDates.push({ date: data.date, reason: data.reason });
    }
  });

  return {
    bookings: bookingSnap.docs.map(bookingDoc => normalizeFirestoreBooking(bookingDoc.id, bookingDoc.data())),
    services,
    schedule: DEFAULT_SCHEDULE.map(day => weekMap.get(day.dayOfWeek) ?? day),
    blockedDates: blockedDates.sort((a, b) => a.date.localeCompare(b.date)),
    settings: settingsSnap.exists()
      ? { ...DEFAULT_SETTINGS, ...(settingsSnap.data() as Partial<StudioSettings>) }
      : DEFAULT_SETTINGS,
    source: 'firestore',
  };
}

function loadLocalWorkspace(): WorkspaceState {
  const localServices = getLocalServices();
  return {
    bookings: getLocalBookings(),
    services: localServices.length > 0 ? localServices : normalizeServices([]),
    schedule: getLocalSchedule() ?? DEFAULT_SCHEDULE,
    blockedDates: getLocalBlockedDates(),
    settings: { ...DEFAULT_SETTINGS, ...(getLocalSettings() ?? {}) },
    source: 'local',
  };
}

function useAdminWorkspace() {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const c = adminCopy[language];
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => loadLocalWorkspace());
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const next = LOCAL_MODE() ? loadLocalWorkspace() : await loadFirestoreWorkspace();
        if (!cancelled) setWorkspace(next);
      } catch (error) {
        console.warn('Admin workspace fallback:', error);
        if (!cancelled) {
          setWorkspace(loadLocalWorkspace());
          showToast(c.loadError, 'info');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [c.loadError, showToast]);

  const isLocal = workspace.source === 'local' || LOCAL_MODE();

  const runRemoteOrFallback = async (operation: () => Promise<void>) => {
    if (isLocal) return;

    try {
      await operation();
    } catch (error) {
      console.warn('Admin remote action fallback:', error);
      setWorkspace(prev => ({ ...prev, source: 'local' }));
      showToast(c.loadError, 'info');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setSavingKey(`booking-${bookingId}`);
    try {
      if (!isLocal && !bookingId.startsWith('local-')) {
        await runRemoteOrFallback(() => updateDoc(doc(db, 'bookings', bookingId), {
          status,
          updatedAt: new Date().toISOString(),
        }));
      }

      setWorkspace(prev => {
        const bookings = prev.bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
        );
        saveLocalWorkspace({ bookings });
        return { ...prev, bookings };
      });
      showToast(c.saved, 'success');
    } finally {
      setSavingKey(null);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    setSavingKey(`booking-${bookingId}`);
    try {
      if (!isLocal && !bookingId.startsWith('local-')) {
        await runRemoteOrFallback(() => deleteDoc(doc(db, 'bookings', bookingId)));
      }

      setWorkspace(prev => {
        const bookings = prev.bookings.filter(booking => booking.id !== bookingId);
        saveLocalWorkspace({ bookings });
        return { ...prev, bookings };
      });
      showToast(c.saved, 'success');
    } finally {
      setSavingKey(null);
    }
  };

  const addService = async (draft: ServiceDraft) => {
    const servicePayload = {
      nameHe: draft.nameHe.trim(),
      nameEn: draft.nameEn.trim(),
      descriptionHe: '',
      descriptionEn: '',
      price: draft.price,
      durationMinutes: draft.durationMinutes,
      category: draft.category,
      isAddon: draft.isAddon,
      isActive: draft.isActive,
    };

    setSavingKey('service-add');
    try {
      let service: Service;
      if (isLocal) {
        service = { id: `local-service-${Date.now()}`, ...servicePayload };
      } else {
        let createdId = `local-service-${Date.now()}`;
        await runRemoteOrFallback(async () => {
          const created = await addDoc(collection(db, 'services'), servicePayload);
          createdId = created.id;
        });
        service = { id: createdId, ...servicePayload };
      }

      setWorkspace(prev => {
        const services = [...prev.services, service];
        saveLocalWorkspace({ services });
        return { ...prev, services };
      });
      showToast(c.saved, 'success');
    } finally {
      setSavingKey(null);
    }
  };

  const updateServiceActive = async (serviceId: string, isActive: boolean) => {
    setSavingKey(`service-${serviceId}`);
    try {
      if (!isLocal && !serviceId.startsWith('local-service-')) {
        await runRemoteOrFallback(() => updateDoc(doc(db, 'services', serviceId), { isActive }));
      }

      setWorkspace(prev => {
        const services = prev.services.map(service =>
          service.id === serviceId ? { ...service, isActive } : service
        );
        saveLocalWorkspace({ services });
        return { ...prev, services };
      });
    } finally {
      setSavingKey(null);
    }
  };

  const deleteService = async (serviceId: string) => {
    setSavingKey(`service-${serviceId}`);
    try {
      if (!isLocal && !serviceId.startsWith('local-service-')) {
        await runRemoteOrFallback(() => deleteDoc(doc(db, 'services', serviceId)));
      }

      setWorkspace(prev => {
        const services = prev.services.filter(service => service.id !== serviceId);
        saveLocalWorkspace({ services });
        return { ...prev, services };
      });
    } finally {
      setSavingKey(null);
    }
  };

  const saveSchedule = async (schedule: DaySchedule[]) => {
    setSavingKey('schedule');
    try {
      if (!isLocal) {
        await runRemoteOrFallback(() => Promise.all(
          schedule.map(day =>
            setDoc(doc(db, 'availability', `dow_${day.dayOfWeek}`), {
              dayOfWeek: day.dayOfWeek,
              isAvailable: day.isOpen,
              startTime: day.startTime,
              endTime: day.endTime,
            })
          )
        ).then(() => undefined));
      }

      setWorkspace(prev => ({ ...prev, schedule }));
      saveLocalWorkspace({ schedule });
      showToast(c.saved, 'success');
    } finally {
      setSavingKey(null);
    }
  };

  const addBlockedDate = async (date: string, reason = '') => {
    if (!date) return;
    const blockedDate = { date, reason };
    setSavingKey(`blocked-${date}`);
    try {
      if (!isLocal) {
        await runRemoteOrFallback(() => setDoc(doc(db, 'availability', `blocked_${date}`), {
          date,
          reason,
          isAvailable: false,
        }));
      }

      setWorkspace(prev => {
        const blockedDates = [...prev.blockedDates.filter(item => item.date !== date), blockedDate]
          .sort((a, b) => a.date.localeCompare(b.date));
        saveLocalWorkspace({ blockedDates });
        return { ...prev, blockedDates };
      });
      showToast(c.saved, 'success');
    } finally {
      setSavingKey(null);
    }
  };

  const removeBlockedDate = async (date: string) => {
    setSavingKey(`blocked-${date}`);
    try {
      if (!isLocal) {
        await runRemoteOrFallback(() => deleteDoc(doc(db, 'availability', `blocked_${date}`)));
      }

      setWorkspace(prev => {
        const blockedDates = prev.blockedDates.filter(item => item.date !== date);
        saveLocalWorkspace({ blockedDates });
        return { ...prev, blockedDates };
      });
    } finally {
      setSavingKey(null);
    }
  };

  const saveSettings = async (settings: StudioSettings) => {
    setSavingKey('settings');
    try {
      if (!isLocal) {
        await runRemoteOrFallback(() => setDoc(doc(db, 'settings', 'studio'), settings));
      }

      setWorkspace(prev => ({ ...prev, settings }));
      saveLocalWorkspace({ settings });
      showToast(c.saved, 'success');
    } finally {
      setSavingKey(null);
    }
  };

  return {
    workspace,
    loading,
    savingKey,
    isLocal,
    actions: {
      updateBookingStatus,
      deleteBooking,
      addService,
      updateServiceActive,
      deleteService,
      saveSchedule,
      addBlockedDate,
      removeBlockedDate,
      saveSettings,
    },
  };
}

function useAdminStats(workspace: WorkspaceState) {
  return useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const activeBookings = workspace.bookings.filter(booking => booking.status !== 'cancelled');
    const completed = workspace.bookings.filter(booking => booking.status === 'completed');
    const newBookings = workspace.bookings.filter(booking => booking.status === 'new');
    const confirmed = workspace.bookings.filter(booking => booking.status === 'confirmed');
    const upcoming = activeBookings
      .filter(booking => booking.date >= today)
      .sort((a, b) => bookingDateTime(a).localeCompare(bookingDateTime(b)));
    const weeklyData = Array.from({ length: 7 }, (_, index) => {
      const day = subDays(new Date(), 6 - index);
      const date = format(day, 'yyyy-MM-dd');
      return {
        label: format(day, 'dd.MM'),
        count: workspace.bookings.filter(booking => booking.date === date).length,
      };
    });

    return {
      total: workspace.bookings.length,
      today: workspace.bookings.filter(booking => booking.date === today).length,
      newCount: newBookings.length,
      confirmedCount: confirmed.length,
      completedCount: completed.length,
      cancelledCount: workspace.bookings.filter(booking => booking.status === 'cancelled').length,
      revenue: completed.reduce((sum, booking) => sum + (booking.finalPrice ?? booking.totalPrice ?? 0), 0),
      activeServices: workspace.services.filter(service => service.isActive).length,
      completionRate:
        workspace.bookings.length > 0 ? Math.round((completed.length / workspace.bookings.length) * 100) : 0,
      upcoming,
      weeklyData,
    };
  }, [workspace]);
}

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <div className={`rounded-[22px] border border-white/70 bg-white/90 shadow-[0_14px_42px_rgba(39,25,20,0.07)] sm:rounded-[28px] sm:shadow-[0_18px_54px_rgba(39,25,20,0.08)] ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ eyebrow?: string; title: string; action?: React.ReactNode }> = ({
  eyebrow,
  title,
  action,
}) => (
  <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
    <div>
      {eyebrow && <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ED4672]">{eyebrow}</p>}
      <h2 className="mt-1 text-xl font-black tracking-tight text-[#21191c] sm:text-2xl">{title}</h2>
    </div>
    {action}
  </div>
);

function DashboardView({ workspace }: { workspace: WorkspaceState }) {
  const { language } = useLanguage();
  const c = adminCopy[language];
  const stats = useAdminStats(workspace);
  const maxWeekly = Math.max(...stats.weeklyData.map(item => item.count), 1);
  const urgent = workspace.bookings
    .filter(booking => booking.status === 'new')
    .sort((a, b) => bookingDateTime(a).localeCompare(bookingDateTime(b)));

  const metricCards = [
    { label: c.today, value: stats.today, icon: CalendarDays, tone: 'bg-[#fff1f5] text-[#ED4672]' },
    { label: c.pendingReview, value: stats.newCount, icon: Gauge, tone: 'bg-blue-50 text-blue-700' },
    { label: c.revenue, value: `₪${stats.revenue.toLocaleString()}`, icon: DollarSign, tone: 'bg-[#111015] text-white' },
    { label: c.completion, value: `${stats.completionRate}%`, icon: ShieldCheck, tone: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {metricCards.map(card => (
          <Card key={card.label} className={`p-4 sm:p-5 ${card.tone}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="max-w-[120px] text-[10px] font-black uppercase tracking-[0.12em] opacity-70 sm:text-xs sm:tracking-[0.18em]">{card.label}</p>
              <card.icon size={18} />
            </div>
            <p className="mt-4 text-2xl font-black sm:mt-5 sm:text-3xl">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr] xl:gap-5">
        <Card className="overflow-hidden p-4 sm:p-5">
          <SectionTitle eyebrow={c.nextAction} title={urgent.length ? c.pendingReview : c.noUrgent} />
          {urgent.length === 0 ? (
            <div className="rounded-[20px] bg-[#f8f1ec] p-6 text-center sm:rounded-[24px] sm:p-8">
              <Sparkles className="mx-auto text-[#ED4672]" size={28} />
              <p className="mt-3 text-sm font-bold text-gray-500">{c.noUrgent}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgent.slice(0, 4).map(booking => (
                <div key={booking.id} className="flex items-center justify-between gap-3 rounded-[20px] bg-[#f8f1ec] p-3 sm:gap-4 sm:rounded-[22px] sm:p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ED4672]">
                      <UserRound size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-gray-900">{booking.clientName}</p>
                      <p className="text-xs font-bold text-gray-400">{safeDateTimeLabel(booking)}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#ED4672]">
                    ₪{booking.totalPrice ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle title={c.weeklyDemand} />
          <div className="flex h-44 items-end gap-1.5 sm:h-52 sm:gap-2">
            {stats.weeklyData.map(item => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-black text-gray-500">{item.count || ''}</span>
                <div className="flex h-36 w-full items-end">
                  <motion.div
                    initial={{ height: 4 }}
                    animate={{ height: `${Math.max(5, (item.count / maxWeekly) * 132)}px` }}
                    className="w-full rounded-t-2xl bg-gradient-to-t from-[#ED4672] to-[#ff9fba]"
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title={c.nextBookings} />
        <div className="grid gap-3 lg:grid-cols-2">
          {stats.upcoming.slice(0, 6).map(booking => (
            <BookingCompactRow key={booking.id} booking={booking} services={workspace.services} />
          ))}
          {stats.upcoming.length === 0 && (
            <p className="rounded-2xl bg-[#f8f1ec] p-6 text-center text-sm font-bold text-gray-400">
              {c.emptyBookings}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function BookingCompactRow({ booking, services }: { booking: Booking; services: Service[] }) {
  const { language } = useLanguage();
  const firstService = services.find(service => service.id === booking.services[0]);
  return (
    <div className="flex items-start justify-between gap-3 rounded-[20px] bg-[#f8f1ec] p-3 sm:items-center sm:gap-4 sm:rounded-[22px] sm:p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {isBookingToday(booking.date) && (
            <span className="rounded-full bg-[#ED4672] px-2 py-0.5 text-[10px] font-black text-white">
              {language === 'he' ? 'היום' : 'Today'}
            </span>
          )}
          <p className="truncate text-sm font-black text-gray-900">{booking.clientName}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-bold text-gray-400">
          {safeDateTimeLabel(booking)} · {firstService ? getServiceDisplayName(firstService, language) : booking.services[0]}
        </p>
      </div>
      <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-black ${statusTone(booking.status)}`}>
        {statusCopy[language][booking.status]}
      </span>
    </div>
  );
}

function BookingsView({
  workspace,
  savingKey,
  actions,
}: {
  workspace: WorkspaceState;
  savingKey: string | null;
  actions: ReturnType<typeof useAdminWorkspace>['actions'];
}) {
  const { language } = useLanguage();
  const c = adminCopy[language];
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return workspace.bookings.filter(booking => {
      const matchesStatus = status === 'all' || booking.status === status;
      const matchesSearch =
        !term ||
        booking.clientName?.toLowerCase().includes(term) ||
        booking.clientPhone?.includes(term) ||
        booking.services.join(' ').toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [search, status, workspace.bookings]);

  const statuses: Array<BookingStatus | 'all'> = ['all', 'new', 'confirmed', 'completed', 'cancelled'];

  return (
    <div>
      <SectionTitle
        title={c.bookings}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={c.searchBookings}
                className="h-11 w-full rounded-2xl border border-white bg-white pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#ED4672]/20 sm:w-64"
              />
            </div>
          </div>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto rounded-[22px] bg-white/70 p-2 sm:mb-5 sm:rounded-[24px]">
        {statuses.map(item => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`min-w-fit rounded-2xl px-4 py-2 text-xs font-black transition-colors ${
              status === item ? 'bg-[#111015] text-white' : 'text-gray-500 hover:bg-white'
            }`}
          >
            {item === 'all' ? c.all : statusCopy[language][item]}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map(booking => {
          const serviceNames = booking.services
            .map(serviceId => workspace.services.find(service => service.id === serviceId))
            .filter((service): service is Service => Boolean(service))
            .map(service => getServiceDisplayName(service, language));

          return (
            <Card key={booking.id} className="p-3 sm:p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111015] text-base font-black text-white sm:h-12 sm:w-12 sm:text-lg">
                    {booking.clientName?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-gray-900">{booking.clientName}</h3>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black ${statusTone(booking.status)}`}>
                        {statusCopy[language][booking.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-gray-400">
                      {safeDateTimeLabel(booking)} · {booking.clientPhone}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(serviceNames.length > 0 ? serviceNames : booking.services).slice(0, 4).map(service => (
                        <span key={service} className="rounded-full bg-[#f8f1ec] px-2.5 py-1 text-[11px] font-bold text-gray-600">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
                  {booking.status === 'new' && (
                    <button
                      onClick={() => actions.updateBookingStatus(booking.id, 'confirmed')}
                      disabled={savingKey === `booking-${booking.id}`}
                      className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 disabled:opacity-50"
                    >
                      {c.confirm}
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => actions.updateBookingStatus(booking.id, 'completed')}
                      disabled={savingKey === `booking-${booking.id}`}
                      className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 disabled:opacity-50"
                    >
                      {c.complete}
                    </button>
                  )}
                  {(booking.status === 'new' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => actions.updateBookingStatus(booking.id, 'cancelled')}
                      disabled={savingKey === `booking-${booking.id}`}
                      className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-600 disabled:opacity-50"
                    >
                      {c.cancel}
                    </button>
                  )}
                  {pendingDelete === booking.id ? (
                    <button
                      onClick={() => {
                        setPendingDelete(null);
                        actions.deleteBooking(booking.id);
                      }}
                      className="rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white"
                    >
                      {c.delete}
                    </button>
                  ) : (
                    <button
                      onClick={() => setPendingDelete(booking.id)}
                      className="flex h-9 w-full items-center justify-center rounded-full bg-gray-50 text-gray-400 sm:w-9"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="mt-5 p-10 text-center text-sm font-bold text-gray-400">{c.emptyBookings}</Card>
      )}
    </div>
  );
}

function ServicesView({
  workspace,
  savingKey,
  actions,
}: {
  workspace: WorkspaceState;
  savingKey: string | null;
  actions: ReturnType<typeof useAdminWorkspace>['actions'];
}) {
  const { language } = useLanguage();
  const c = adminCopy[language];
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await actions.addService(draft);
    setDraft(emptyDraft);
    setIsAdding(false);
  };

  return (
    <div>
      <SectionTitle
        title={c.services}
        action={
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111015] px-5 py-3 text-sm font-black text-white sm:w-auto"
          >
            <Plus size={16} />
            {c.addService}
          </button>
        }
      />

      {isAdding && (
        <Card className="mb-5 p-4 sm:p-5">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label={c.serviceNameHe}>
              <input
                required
                dir="rtl"
                value={draft.nameHe}
                onChange={event => setDraft(prev => ({ ...prev, nameHe: event.target.value }))}
                className="field"
              />
            </Field>
            <Field label={c.serviceNameEn}>
              <input
                required
                value={draft.nameEn}
                onChange={event => setDraft(prev => ({ ...prev, nameEn: event.target.value }))}
                className="field"
              />
            </Field>
            <Field label={c.price}>
              <input
                required
                type="number"
                min={0}
                value={draft.price}
                onChange={event => setDraft(prev => ({ ...prev, price: Number(event.target.value) }))}
                className="field"
              />
            </Field>
            <Field label={c.duration}>
              <input
                required
                type="number"
                min={5}
                step={5}
                value={draft.durationMinutes}
                onChange={event => setDraft(prev => ({ ...prev, durationMinutes: Number(event.target.value) }))}
                className="field"
              />
            </Field>
            <Field label={c.category}>
              <select
                value={draft.category}
                onChange={event => setDraft(prev => ({ ...prev, category: event.target.value as ServiceCategory }))}
                className="field"
              >
                {(Object.keys(categoryCopy.en) as ServiceCategory[]).map(category => (
                  <option key={category} value={category}>
                    {categoryCopy[language][category]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex items-center gap-3 pt-6">
              <input
                id="service-addon"
                type="checkbox"
                checked={draft.isAddon}
                onChange={event => setDraft(prev => ({ ...prev, isAddon: event.target.checked }))}
                className="h-5 w-5"
              />
              <label htmlFor="service-addon" className="text-sm font-black text-gray-600">
                {c.addon}
              </label>
            </div>
            <div className="grid gap-2 sm:flex md:col-span-2">
              <button
                type="submit"
                disabled={savingKey === 'service-add'}
                className="rounded-2xl bg-[#ED4672] px-6 py-3 text-sm font-black text-white disabled:opacity-50"
              >
                {c.save}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-2xl bg-gray-100 px-6 py-3 text-sm font-black text-gray-500"
              >
                {c.close}
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspace.services.map(service => (
          <Card key={service.id} className={`p-4 sm:p-5 ${service.isActive ? '' : 'opacity-60'}`}>
            <div className="grid gap-4 sm:flex sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff1f5] text-[#ED4672]">
                  <Scissors size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black text-gray-900">
                    {getServiceDisplayName(service, language)}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-gray-400">
                    {getServiceDisplayPrice(service)} ₪ · {service.durationMinutes} דק׳
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-[#ED4672]">
                    {categoryCopy[language][service.category ?? 'hairdressing']}
                    {service.isAddon ? ` · ${c.addon}` : ''}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:gap-1">
                <button
                  onClick={() => actions.updateServiceActive(service.id, !service.isActive)}
                  className={`rounded-full px-3 py-2 text-[10px] font-black sm:py-1 ${
                    service.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {service.isActive ? c.active : c.closed}
                </button>
                <button
                  onClick={() => actions.deleteService(service.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AvailabilityView({
  workspace,
  savingKey,
  actions,
}: {
  workspace: WorkspaceState;
  savingKey: string | null;
  actions: ReturnType<typeof useAdminWorkspace>['actions'];
}) {
  const { language } = useLanguage();
  const c = adminCopy[language];
  const [schedule, setSchedule] = useState(workspace.schedule);
  const [blockedDate, setBlockedDate] = useState('');

  useEffect(() => setSchedule(workspace.schedule), [workspace.schedule]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px] xl:gap-5">
      <Card className="p-4 sm:p-5">
        <SectionTitle title={c.weeklySchedule} />
        <div className="space-y-3">
          {schedule.map(day => (
            <div key={day.dayOfWeek} className="grid gap-3 rounded-[20px] bg-[#f8f1ec] p-3 sm:rounded-[22px] sm:p-4 md:grid-cols-[120px_90px_1fr] md:items-center">
              <p className="text-sm font-black text-gray-900">{dayNames[language][day.dayOfWeek]}</p>
              <button
                onClick={() =>
                  setSchedule(prev =>
                    prev.map(item =>
                      item.dayOfWeek === day.dayOfWeek ? { ...item, isOpen: !item.isOpen } : item
                    )
                  )
                }
                className={`rounded-full px-3 py-2 text-xs font-black ${
                  day.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {day.isOpen ? c.open : c.closed}
              </button>
              {day.isOpen && (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
                  <input
                    type="time"
                    value={day.startTime}
                    onChange={event =>
                      setSchedule(prev =>
                        prev.map(item =>
                          item.dayOfWeek === day.dayOfWeek ? { ...item, startTime: event.target.value } : item
                        )
                      )
                    }
                    className="field min-w-0 sm:max-w-[132px]"
                  />
                  <span className="font-black text-gray-300">-</span>
                  <input
                    type="time"
                    value={day.endTime}
                    onChange={event =>
                      setSchedule(prev =>
                        prev.map(item =>
                          item.dayOfWeek === day.dayOfWeek ? { ...item, endTime: event.target.value } : item
                        )
                      )
                    }
                    className="field min-w-0 sm:max-w-[132px]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => actions.saveSchedule(schedule)}
          disabled={savingKey === 'schedule'}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111015] px-6 py-3 text-sm font-black text-white disabled:opacity-50 sm:w-auto"
        >
          <Save size={16} />
          {c.save}
        </button>
      </Card>

      <Card className="p-4 sm:p-5">
        <SectionTitle title={c.blockedDates} />
        <div className="grid gap-2 sm:flex">
          <input
            type="date"
            value={blockedDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={event => setBlockedDate(event.target.value)}
            className="field"
          />
          <button
            onClick={() => {
              actions.addBlockedDate(blockedDate);
              setBlockedDate('');
            }}
            disabled={!blockedDate}
            className="rounded-2xl bg-[#ED4672] px-4 py-3 text-sm font-black text-white disabled:opacity-45 sm:py-2"
          >
            {c.blockDate}
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {workspace.blockedDates.map(item => (
            <div key={item.date} className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {safeDateLabel(item.date)}
              <button onClick={() => actions.removeBlockedDate(item.date)}>
                <XCircle size={16} />
              </button>
            </div>
          ))}
          {workspace.blockedDates.length === 0 && (
            <p className="rounded-2xl bg-[#f8f1ec] p-6 text-center text-sm font-bold text-gray-400">
              {c.noBlockedDates}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function SettingsView({
  workspace,
  savingKey,
  actions,
}: {
  workspace: WorkspaceState;
  savingKey: string | null;
  actions: ReturnType<typeof useAdminWorkspace>['actions'];
}) {
  const { language } = useLanguage();
  const c = adminCopy[language];
  const [settings, setSettings] = useState(workspace.settings);

  useEffect(() => setSettings(workspace.settings), [workspace.settings]);

  const update = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <SectionTitle
        title={c.settings}
        action={
          <button
            onClick={() => actions.saveSettings(settings)}
            disabled={savingKey === 'settings'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111015] px-6 py-3 text-sm font-black text-white disabled:opacity-50 sm:w-auto"
          >
            <Save size={16} />
            {c.save}
          </button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <SectionTitle title={c.contactSettings} />
          <div className="grid gap-4">
            <Field label="Studio">
              <input value={settings.studioName} onChange={event => update('studioName', event.target.value)} className="field" />
            </Field>
            <Field label="Phone">
              <input dir="ltr" value={settings.phone} onChange={event => update('phone', event.target.value)} className="field" />
            </Field>
            <Field label="WhatsApp">
              <input
                dir="ltr"
                value={settings.whatsappNumber}
                onChange={event => update('whatsappNumber', event.target.value)}
                className="field"
              />
            </Field>
            <Field label="Instagram">
              <input
                dir="ltr"
                value={settings.instagramUrl ?? ''}
                onChange={event => update('instagramUrl', event.target.value)}
                className="field"
              />
            </Field>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <SectionTitle title={c.bookingPolicy} />
          <div className="grid gap-4">
            <Field label="Slot interval">
              <select
                value={settings.slotIntervalMinutes}
                onChange={event => update('slotIntervalMinutes', Number(event.target.value))}
                className="field"
              >
                {[15, 20, 30, 45, 60].map(value => (
                  <option key={value} value={value}>
                    {value} min
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lead hours">
              <input
                type="number"
                min={0}
                value={settings.bookingLeadHours}
                onChange={event => update('bookingLeadHours', Number(event.target.value))}
                className="field"
              />
            </Field>
            <Field label="Advance days">
              <input
                type="number"
                min={7}
                value={settings.maxAdvanceBookingDays}
                onChange={event => update('maxAdvanceBookingDays', Number(event.target.value))}
                className="field"
              />
            </Field>
            <label className="flex items-center justify-between rounded-2xl bg-[#f8f1ec] p-4">
              <span className="text-sm font-black text-gray-700">Auto confirm</span>
              <input
                type="checkbox"
                checked={settings.autoConfirm}
                onChange={event => update('autoConfirm', event.target.checked)}
                className="h-5 w-5"
              />
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export const Admin: React.FC = () => {
  const { language, dir } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const c = adminCopy[language];
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const workspaceApi = useAdminWorkspace();
  const stats = useAdminStats(workspaceApi.workspace);

  useEffect(() => {
    if (localStorage.getItem('studioAccess') === 'admin') {
      setUserEmail(localStorage.getItem('adminEmail') || 'admin@ayala.com');
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        setUserEmail(user.email);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(false);
      showToast(language === 'he' ? 'נדרשת כניסת אדמין' : 'Admin access required', 'error');
      navigate('/login', { replace: true, state: { mode: 'admin', from: '/admin' } });
    });

    return () => unsubscribe();
  }, [language, navigate, showToast]);

  const logout = async () => {
    localStorage.removeItem('studioAccess');
    localStorage.removeItem('adminEmail');
    window.dispatchEvent(new Event('studio-access-changed'));
    await signOut(auth).catch(() => undefined);
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/admin', label: c.dashboard, icon: LayoutDashboard, exact: true },
    { path: '/admin/bookings', label: c.bookings, icon: Calendar },
    { path: '/admin/services', label: c.services, icon: Scissors },
    { path: '/admin/availability', label: c.availability, icon: Clock },
    { path: '/admin/settings', label: c.settings, icon: SettingsIcon },
  ];

  if (authLoading || workspaceApi.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6efe9]">
        <div className="h-12 w-12 rounded-full border-4 border-[#ED4672]/20 border-t-[#ED4672] animate-spin" />
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-[#f6efe9] text-gray-900">
      <style>{`
        .field {
          width: 100%;
          min-height: 46px;
          border-radius: 1rem;
          border: 1px solid rgba(232, 221, 214, 0.9);
          background: #fbf6f2;
          padding: 0.78rem 0.92rem;
          font-size: 0.875rem;
          font-weight: 800;
          outline: none;
          color: #21191c;
        }
        @media (min-width: 640px) {
          .field {
            min-height: 48px;
            padding: 0.82rem 1rem;
          }
        }
        .field:focus {
          border-color: rgba(237, 70, 114, 0.45);
          box-shadow: 0 0 0 4px rgba(237, 70, 114, 0.12);
          background: #fff;
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-white/60 bg-[#f6efe9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-6 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#111015] text-white shadow-lg md:h-11 md:w-11">
              <BrandMark tone="light" className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ED4672] sm:text-[11px] sm:tracking-[0.22em]">
                AYELET ADMIN
              </p>
              <h1 className="truncate text-base font-black text-[#21191c] sm:text-lg md:text-xl">{c.workspace}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`hidden rounded-full px-3 py-2 text-xs font-black md:inline-flex ${
              workspaceApi.isLocal ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {workspaceApi.isLocal ? c.demo : c.live}
            </span>
            <button
              onClick={logout}
              aria-label="Log out"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm hover:text-red-500"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-4 md:px-6 xl:hidden">
        <Card className="overflow-hidden p-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[#111015] p-3 text-white">
              <p className="text-xl font-black">{stats.newCount}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/45">{c.pendingReview}</p>
            </div>
            <div className="rounded-2xl bg-[#fff1f5] p-3 text-[#ED4672]">
              <p className="text-xl font-black">{stats.today}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#ED4672]/60">{c.today}</p>
            </div>
            <div className={`rounded-2xl p-3 ${workspaceApi.isLocal ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <p className="text-sm font-black">{workspaceApi.isLocal ? c.demo : c.live}</p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] opacity-60">
                {stats.activeServices} {c.activeServices}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <main className="mx-auto grid max-w-7xl gap-4 px-3 py-4 pb-28 sm:px-4 md:px-6 md:py-5 xl:grid-cols-[280px_1fr] xl:gap-5 xl:pb-10">
        <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
          <Card className="overflow-hidden p-4">
            <div className="rounded-[24px] bg-[#111015] p-5 text-white">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
                  <BrandMark tone="light" className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                    AYELET ADMIN
                  </p>
                  <p className="text-sm font-bold text-white/70">{c.workspace}</p>
                </div>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                {userEmail}
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-white/70">{c.subtitle}</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white/8 p-3">
                  <p className="text-2xl font-black">{stats.newCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">{c.pendingReview}</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-3">
                  <p className="text-2xl font-black">{stats.activeServices}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">{c.activeServices}</p>
                </div>
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto xl:flex-col">
              {navItems.map(item => {
                const active = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
                      active ? 'bg-[#ED4672] text-white shadow-lg shadow-[#ED4672]/20' : 'text-gray-500 hover:bg-[#f8f1ec]'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {active && <ChevronLeft className="hidden ms-auto xl:block" size={16} />}
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        <section className="min-w-0">
          <Routes>
            <Route index element={<DashboardView workspace={workspaceApi.workspace} />} />
            <Route
              path="bookings"
              element={
                <BookingsView
                  workspace={workspaceApi.workspace}
                  savingKey={workspaceApi.savingKey}
                  actions={workspaceApi.actions}
                />
              }
            />
            <Route
              path="services"
              element={
                <ServicesView
                  workspace={workspaceApi.workspace}
                  savingKey={workspaceApi.savingKey}
                  actions={workspaceApi.actions}
                />
              }
            />
            <Route
              path="availability"
              element={
                <AvailabilityView
                  workspace={workspaceApi.workspace}
                  savingKey={workspaceApi.savingKey}
                  actions={workspaceApi.actions}
                />
              }
            />
            <Route
              path="settings"
              element={
                <SettingsView
                  workspace={workspaceApi.workspace}
                  savingKey={workspaceApi.savingKey}
                  actions={workspaceApi.actions}
                />
              }
            />
          </Routes>
        </section>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[26px] border border-white/20 bg-[#111015]/94 p-2 shadow-[0_20px_60px_rgba(17,16,21,0.26)] backdrop-blur-xl xl:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map(item => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[20px] px-1 text-[10px] font-black transition-all ${
                  active ? 'bg-[#ED4672] text-white shadow-lg shadow-[#ED4672]/25' : 'text-white/48'
                }`}
              >
                <item.icon size={18} />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
