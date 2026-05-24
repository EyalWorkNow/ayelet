import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  User,
  Phone,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Ticket,
  X,
  MapPin,
  Zap,
} from 'lucide-react';
import {
  format,
  addDays,
  startOfToday,
  isSameDay,
  parseISO,
  addMinutes,
  getDay,
} from 'date-fns';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Service, Booking } from '../types';
import { createBooking } from '../services/bookingService';
import { uploadBookingImages } from '../services/uploadService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
  getServiceDisplayName,
  getServiceDisplayPrice,
  normalizeServices,
} from '../utils/serviceDisplay';
import {
  formatLocalizedDate,
  formatMonthRange,
  getLocalizedMonth,
  getLocalizedWeekdayShort,
} from '../utils/dateDisplay';
import { galleryImages, getServiceLocalImage } from '../utils/galleryImages';

const getServiceImg = (id: string) => getServiceLocalImage(id);

const StraightHairIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7 3v18M12 3v18M17 3v18" />
  </svg>
);

const WavyHairIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3c-1.5 3-1.5 6 0 9s1.5 6 0 9" />
    <path d="M12 3c-1.5 3-1.5 6 0 9s1.5 6 0 9" />
    <path d="M18 3c-1.5 3-1.5 6 0 9s1.5 6 0 9" />
  </svg>
);

const CurlyHairIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3a2 2 0 1 0 0 4 2 2 0 1 1 0 4 2 2 0 1 0 0 4 2 2 0 1 1 0 4" />
    <path d="M12 3a2 2 0 1 0 0 4 2 2 0 1 1 0 4 2 2 0 1 0 0 4 2 2 0 1 1 0 4" />
    <path d="M18 3a2 2 0 1 0 0 4 2 2 0 1 1 0 4 2 2 0 1 0 0 4 2 2 0 1 1 0 4" />
  </svg>
);

interface DayConfig {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export const Book: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const rebookData = location.state?.rebook;
  const initialServiceId = location.state?.initialService;
  const isRtl = dir === 'rtl';

  const bookingCopy =
    language === 'en'
      ? {
          journeyLabel: 'Appointment flow',
          title: 'A calmer booking experience from first choice to final confirmation.',
          subtitle:
            'Choose a service, keep a real slot, and send the studio everything it needs in one guided flow that stays readable on mobile and desktop.',
          heroSummaryLabel: 'Current snapshot',
          trustPoints: ['Real availability', 'Clear pricing', 'WhatsApp support'],
          summaryLabel: 'Booking snapshot',
          summaryTitle: 'Your choices stay visible while you book.',
          summaryText:
            'Move between steps without losing the context of what you already picked.',
          summaryEmpty:
            'Select a service and the live summary will start filling itself in.',
          helpTitle: 'Need help before booking?',
          helpText:
            'If you are unsure which service fits your hair, send a quick WhatsApp message and return when you are ready.',
          whatsappCta: 'Chat on WhatsApp',
          fallbackNotice:
            'Live catalog data is temporarily unavailable, so we loaded the studio default services.',
          available: 'Available',
          selected: 'Selected',
          today: 'Today',
          unavailable: 'Closed',
          notSelected: 'Not selected yet',
          notProvided: 'Not added yet',
          stepDescriptions: {
            services:
              'Start with one or more services. Add-ons open automatically when they are relevant.',
            schedule:
              'Choose a day first, then a time slot that matches the full duration of the services you picked.',
            hair:
              'Tell us about your hair and optionally add a club code or a join request.',
            details:
              'Leave the contact details, notes, and inspiration images you want the studio to see first.',
            review:
              'Review the booking one last time before sending it to the studio.',
          },
          stepHints: {
            servicesEmpty: 'Choose at least one service to unlock the next available times.',
            servicesReady: 'You can combine more than one service in the same visit.',
            scheduleEmpty: 'Choose both a date and a time to keep the slot moving.',
            scheduleReady: 'The timing looks good. Next we will personalize the visit.',
            hairEmpty: 'Choose the hair type so the studio can prepare the right setup.',
            hairReady: 'Great. The next step is only your contact details.',
            detailsEmpty: 'Add your full name and a valid phone number to continue.',
            detailsReady: 'Everything is ready for a final review.',
            review: 'Once you confirm, the request will be sent exactly as shown here.',
          },
          nextCtas: {
            date: 'Continue to date',
            hair: 'Continue to hair profile',
            details: 'Continue to details',
            review: 'Review booking',
          },
          servicesIntroTitle: 'Choose the visit you want',
          servicesIntroText:
            'Mix services in one appointment and watch the total price and duration update instantly.',
          selectedServicesTitle: 'Chosen for this visit',
          calendarTitle: 'Choose a date',
          calendarText:
            'The schedule shows the next two weeks, so the closest available dates stay easy to compare.',
          timeTitle: 'Choose a time',
          timeText:
            'Slots already reflect the full duration of the services you selected.',
          timePlaceholder: 'Choose a date to reveal the available times.',
          periodEmpty: 'No slots in this time range',
          recommendedTime: 'Recommended',
          hairTitle: 'Help us prepare the right setup',
          hairText:
            'Hair type helps us estimate timing and choose the right products before you arrive.',
          clubText:
            'If you already have a loyalty code, enter it here. Otherwise you can ask to join via WhatsApp.',
          detailsTitle: 'Final details before we lock it in',
          detailsText:
            'We use these details only for coordination, reminders, and anything important before the appointment.',
          notesTitle: 'Anything else we should know?',
          notesText:
            'Use this section for inspiration, sensitive notes, or the finish you are aiming for.',
          reviewTitle: 'Review before sending',
          reviewText:
            'The studio will receive exactly what appears here, including your selected services and notes.',
          afterSubmitTitle: 'What happens after you send the booking?',
          afterSubmitSteps: [
            'The selected slot is sent with your requested services and notes.',
            'If anything needs clarification, the studio will contact the phone number you entered.',
            'You will land on a confirmation screen with the final appointment snapshot.',
          ],
        }
      : {
          journeyLabel: 'תהליך קביעת תור',
          title: 'חוויית קביעת תור רגועה, ברורה ואישית מהבחירה הראשונה ועד האישור.',
          subtitle:
            'בחרי שירות, שמרי מקום אמיתי ביומן, ושלחי לסטודיו את כל מה שצריך בתוך flow אחד שמרגיש נקי ונוח גם במובייל וגם בדסקטופ.',
          heroSummaryLabel: 'תמונה עדכנית',
          trustPoints: ['זמינות אמיתית', 'מחיר ברור', 'תמיכה בוואטסאפ'],
          summaryLabel: 'מצב התור',
          summaryTitle: 'כל הבחירות שלך נשארות מול העיניים לאורך כל התהליך.',
          summaryText:
            'אפשר לזוז בין שלבים בלי לאבד את ההקשר של מה שכבר בחרת.',
          summaryEmpty: 'ברגע שתבחרי שירות, הסיכום החי יתחיל להתמלא כאן.',
          helpTitle: 'צריכה עזרה לפני הקביעה?',
          helpText:
            'אם לא ברור לך איזה שירות מתאים לשיער שלך, אפשר לשלוח הודעת וואטסאפ קצרה ולחזור להמשך התהליך אחר כך.',
          whatsappCta: 'מעבר לוואטסאפ',
          fallbackNotice:
            'כרגע לא הצלחנו לטעון את קטלוג השירותים החי, ולכן עלו שירותי ברירת המחדל של הסטודיו.',
          available: 'פנוי',
          selected: 'נבחר',
          today: 'היום',
          unavailable: 'סגור',
          notSelected: 'עדיין לא נבחר',
          notProvided: 'עדיין לא הוזן',
          stepDescriptions: {
            services:
              'מתחילים משירות אחד או יותר. תוספות ייפתחו אוטומטית כשיש להן התאמה.',
            schedule:
              'קודם בוחרים יום, ואז שעה שמתאימה למשך המלא של השירותים שבחרת.',
            hair:
              'מעדכנים סוג שיער, ואם צריך גם קוד מועדון או בקשת הצטרפות.',
            details:
              'משאירים את פרטי הקשר, ההערות ותמונות ההשראה שחשוב לסטודיו לראות מראש.',
            review:
              'בודקים את התור פעם אחרונה לפני שליחת הבקשה לסטודיו.',
          },
          stepHints: {
            servicesEmpty: 'בחרי לפחות שירות אחד כדי לפתוח את הזמנים הפנויים הרלוונטיים.',
            servicesReady: 'אפשר לשלב יותר משירות אחד באותו ביקור.',
            scheduleEmpty: 'בחרי גם תאריך וגם שעה כדי להמשיך ולשמור את המקום.',
            scheduleReady: 'התזמון נראה טוב. עכשיו רק מתאימים את הביקור אלייך.',
            hairEmpty: 'סוג השיער יעזור לסטודיו להכין את הכלים והחומרים מראש.',
            hairReady: 'מעולה. השלב הבא הוא רק פרטי הקשר שלך.',
            detailsEmpty: 'הוסיפי שם מלא ומספר טלפון תקין כדי להמשיך.',
            detailsReady: 'הכל מוכן לבדיקה סופית.',
            review: 'אחרי האישור, הבקשה תישלח בדיוק כפי שהיא מוצגת כאן.',
          },
          nextCtas: {
            date: 'להמשך לבחירת תאריך',
            hair: 'להמשך לפרופיל שיער',
            details: 'להמשך לפרטים',
            review: 'לבדיקת ההזמנה',
          },
          servicesIntroTitle: 'בחרי את סוג הביקור שמתאים לך',
          servicesIntroText:
            'אפשר לשלב כמה שירותים באותו תור, והמחיר והזמן הכולל יתעדכנו מיד.',
          selectedServicesTitle: 'נבחר לביקור הזה',
          calendarTitle: 'בחירת תאריך',
          calendarText:
            'הלוח מציג חלון של שבועיים קדימה, כדי שיהיה קל לראות את התאריכים הקרובים והפנויים באמת.',
          timeTitle: 'בחירת שעה',
          timeText:
            'הזמנים כבר מחושבים לפי משך השירותים שבחרת, כך שאין ניחושים בדרך.',
          timePlaceholder: 'בחרי תאריך כדי לראות אילו שעות באמת פנויות.',
          periodEmpty: 'אין שעות פנויות בטווח הזה',
          recommendedTime: 'המלצה מהירה',
          hairTitle: 'עוזרות לסטודיו להתכונן נכון לביקור שלך',
          hairText:
            'סוג השיער עוזר להעריך זמן, להכין מוצרים נכונים ולהגיע מוכנות כבר מההתחלה.',
          clubText:
            'אם כבר יש לך קוד מועדון, הזיני אותו כאן. אם עדיין לא, אפשר לבקש הצטרפות מהירה דרך וואטסאפ.',
          detailsTitle: 'עוד כמה פרטים ואפשר לנעול את הבקשה',
          detailsText:
            'נשתמש בפרטים האלה רק לתיאום, תזכורות, וכל דבר שחשוב לדעת לפני התור.',
          notesTitle: 'יש משהו נוסף שחשוב שנדע?',
          notesText:
            'זה המקום להוסיף השראה, בקשות מיוחדות או תוצאה שאת מכוונת אליה.',
          reviewTitle: 'בדיקה אחרונה לפני השליחה',
          reviewText:
            'הסטודיו יקבל בדיוק את מה שמופיע כאן, כולל השירותים שבחרת וההערות שהוספת.',
          afterSubmitTitle: 'מה יקרה אחרי שליחת הבקשה?',
          afterSubmitSteps: [
            'המקום שבחרת יישלח יחד עם השירותים וההערות שביקשת.',
            'אם יהיה צורך בהבהרה, הסטודיו ייצור קשר עם מספר הטלפון שהזנת.',
            'מיד לאחר מכן תועברי למסך אישור עם כל פרטי התור.',
          ],
        };

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(rebookData ? 2 : 1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallbackCatalog, setIsUsingFallbackCatalog] = useState(false);

  const [weeklyConfig, setWeeklyConfig] = useState<Map<number, DayConfig>>(new Map());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [slotInterval, setSlotInterval] = useState(30);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState<{ start: string; end: string }[]>([]);

  const [selectedServices, setSelectedServices] = useState<string[]>(
    rebookData?.services || (initialServiceId ? [initialServiceId] : [])
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const [hairType, setHairType] = useState<'straight' | 'wavy' | 'curly' | ''>(
    rebookData?.hairType || ''
  );
  const [hasLoyaltyCard, setHasLoyaltyCard] = useState(false);
  const [loyaltyCode, setLoyaltyCode] = useState('');
  const [requestedClubSignup, setRequestedClubSignup] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = startOfToday();
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(today, i)), [today]);

  useEffect(() => {
    const init = async () => {
      try {
        if (!auth.currentUser) {
          setServices(normalizeServices([]));
          setIsUsingFallbackCatalog(true);
          return;
        }

        const q = query(collection(db, 'services'), where('isActive', '==', true));
        const snap = await getDocs(q);
        setServices(normalizeServices(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Service[]));

        const avSnap = await getDocs(collection(db, 'availability'));
        const weekMap = new Map<number, DayConfig>();
        const blocked = new Set<string>();

        avSnap.docs.forEach(d => {
          const data = d.data();
          if (typeof data.dayOfWeek === 'number') {
            weekMap.set(data.dayOfWeek, {
              isOpen: data.isAvailable ?? true,
              startTime: data.startTime ?? '10:00',
              endTime: data.endTime ?? '20:00',
            });
          } else if (data.date) {
            blocked.add(data.date);
          }
        });

        setWeeklyConfig(weekMap);
        setBlockedDates(blocked);

        const settingsSnap = await getDoc(doc(db, 'settings', 'studio'));
        if (settingsSnap.exists()) {
          const studioSettings = settingsSnap.data();
          if (studioSettings.slotIntervalMinutes) {
            setSlotInterval(studioSettings.slotIntervalMinutes);
          }
        }
      } catch (err) {
        console.warn('Booking flow loaded fallback data:', err);
        setServices(normalizeServices([]));
        setIsUsingFallbackCatalog(true);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('clientName');
    const phone = localStorage.getItem('clientPhone');
    const savedHairType = localStorage.getItem('hairType') as 'straight' | 'wavy' | 'curly' | null;

    if (name) setClientName(name);
    if (phone) setClientPhone(phone);
    if (savedHairType) setHairType(savedHairType);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (step === 2 && !selectedDate) {
      setIsDatePickerOpen(true);
    }
  }, [step, selectedDate]);

  const serviceLookup = useMemo(
    () => new Map(services.map(service => [service.id, service])),
    [services]
  );

  const { duration, price } = useMemo(() => {
    let totalDuration = 0;
    let totalPrice = 0;

    selectedServices.forEach(id => {
      const service = serviceLookup.get(id);
      if (service) {
        totalDuration += service.durationMinutes;
        totalPrice += service.price;
      }
    });

    return { duration: totalDuration, price: totalPrice };
  }, [selectedServices, serviceLookup]);

  const isDayAvailable = useCallback(
    (day: Date) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      if (blockedDates.has(dateStr)) {
        return false;
      }

      const dayOfWeek = getDay(day);
      const config = weeklyConfig.get(dayOfWeek);
      if (!config) {
        return dayOfWeek >= 0 && dayOfWeek <= 4;
      }

      return config.isOpen;
    },
    [weeklyConfig, blockedDates]
  );

  const handleDateSelect = (day: Date) => {
    if (!isDayAvailable(day)) {
      return;
    }

    setSelectedDate(day);
    setSelectedTime(null);
    setIsDatePickerOpen(false);
  };

  useEffect(() => {
    if (!selectedDate) {
      setOccupiedSlots([]);
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setCheckingSlots(true);
    setSelectedTime(null);

    if (!auth.currentUser) {
      setOccupiedSlots([]);
      setCheckingSlots(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('date', '==', dateStr),
      where('status', 'in', ['new', 'confirmed'])
    );

    getDocs(q)
      .then(snap => {
        setOccupiedSlots(
          snap.docs.map(d => ({ start: d.data().startTime, end: d.data().endTime }))
        );
      })
      .catch(err => {
        console.warn('Could not load occupied slots, showing open-grid fallback:', err);
        setOccupiedSlots([]);
      })
      .finally(() => setCheckingSlots(false));
  }, [selectedDate]);

  const allTimeSlots = useMemo<string[]>(() => {
    if (!selectedDate) {
      return [];
    }

    const dayOfWeek = getDay(selectedDate);
    const config = weeklyConfig.get(dayOfWeek);
    const [startHour, startMinute] = config
      ? config.startTime.split(':').map(Number)
      : [10, 0];
    const [endHour, endMinute] = config
      ? config.endTime.split(':').map(Number)
      : [20, 0];
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    const slotDuration = Math.max(duration, slotInterval);
    const times: string[] = [];

    for (let minute = startTotal; minute + slotDuration <= endTotal; minute += slotInterval) {
      const hour = Math.floor(minute / 60)
        .toString()
        .padStart(2, '0');
      const mins = (minute % 60).toString().padStart(2, '0');
      times.push(`${hour}:${mins}`);
    }

    return times;
  }, [selectedDate, weeklyConfig, slotInterval, duration]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const now = new Date();

    return allTimeSlots.filter(time => {
      if (isSameDay(selectedDate, now)) {
        const [hour, minute] = time.split(':').map(Number);
        if (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes())) {
          return false;
        }
      }

      const [timeHour, timeMinute] = time.split(':').map(Number);
      const slotStart = timeHour * 60 + timeMinute;
      const slotEnd = slotStart + Math.max(duration, slotInterval);

      return !occupiedSlots.some(({ start, end }) => {
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        const bookingStart = startHour * 60 + startMinute;
        const bookingEnd = endHour * 60 + endMinute;
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });
    });
  }, [allTimeSlots, selectedDate, occupiedSlots, duration, slotInterval]);

  const filteredTimes = useMemo(
    () =>
      availableTimes.filter(time => {
        if (timePeriod === 'all') {
          return true;
        }

        const hour = Number(time.split(':')[0]);
        if (timePeriod === 'morning') {
          return hour < 13;
        }
        if (timePeriod === 'afternoon') {
          return hour >= 13 && hour < 17;
        }
        return hour >= 17;
      }),
    [availableTimes, timePeriod]
  );

  const visibleDays = days.slice(dateWindowStart, dateWindowStart + 14);
  const monthLabel =
    visibleDays.length > 0
      ? formatMonthRange(visibleDays[0], visibleDays[visibleDays.length - 1], language)
      : '';

  const validatePhone = (phone: string) => /^[\d\s\-+()]{7,15}$/.test(phone.trim());

  useEffect(
    () => () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    },
    [imagePreviews]
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    imagePreviews.forEach(url => URL.revokeObjectURL(url));

    const files = Array.from(event.target.files).slice(0, 2);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove);
    }

    setImages(prev => prev.filter((_, imageIndex) => imageIndex !== index));
    setImagePreviews(prev => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!clientName.trim()) {
      setNameError(t('requiredField'));
      isValid = false;
    }

    if (!validatePhone(clientPhone)) {
      setPhoneError(t('invalidPhone'));
      isValid = false;
    }

    if (!isValid) {
      setStep(4);
      return;
    }

    if (!selectedDate || !selectedTime || selectedServices.length === 0 || !hairType) {
      setError(t('requiredField'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const imageUrls = images.length > 0 && auth.currentUser ? await uploadBookingImages(images) : [];
      const endTime = format(
        addMinutes(parseISO(`2000-01-01T${selectedTime}`), duration),
        'HH:mm'
      );

      const bookingNotes = [
        hasLoyaltyCard && loyaltyCode.trim()
          ? `${t('clubCardCode')}: ${loyaltyCode.trim()}`
          : '',
        requestedClubSignup ? t('membershipRequest') : '',
        notes.trim(),
      ]
        .filter(Boolean)
        .join('\n\n');

      const result = await createBooking(
        {
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          serviceIds: selectedServices,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          hairType: hairType as 'straight' | 'wavy' | 'curly',
          isStudent: false,
          notes: bookingNotes,
          imageUrls,
        },
        duration,
        price
      );

      if (!result.success) {
        const message = result.conflict
          ? language === 'he'
            ? 'השעה הזו כבר תפוסה, אנא בחרי שעה אחרת'
            : 'This slot is already taken, please choose another time'
          : t('bookingError');
        setError(message);
        showToast(message, 'error');
        if (result.conflict) {
          setStep(2);
        }
        return;
      }

      localStorage.setItem('clientName', clientName.trim());
      localStorage.setItem('clientPhone', clientPhone.trim());
      localStorage.setItem('hairType', hairType);
      const bookingCount = parseInt(localStorage.getItem('bookingCount') || '0', 10);
      localStorage.setItem('bookingCount', String(bookingCount + 1));
      localStorage.setItem('lastBooking', JSON.stringify({ services: selectedServices, hairType }));

      const fallbackBooking: Booking = {
        id: result.bookingId || result.booking?.id || '',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        services: selectedServices,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime,
        totalDuration: duration,
        status: 'new',
        hairType: hairType as 'straight' | 'wavy' | 'curly',
        notes: bookingNotes,
        images: imageUrls,
        totalPrice: price,
        finalPrice: price,
        createdAt: new Date().toISOString(),
        source: 'web',
      };

      showToast(t('bookingSuccess'), 'success');
      navigate('/confirmation', {
        state: { booking: result.booking ?? fallbackBooking },
      });
    } catch (err) {
      console.warn('Booking submit failed:', err);
      setError(t('bookingError'));
      showToast(t('bookingError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex min-h-screen items-center justify-center bg-[#fcf9f8]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-[#ED4672]/20 border-t-[#ED4672] animate-spin" />
          <p className="text-sm font-bold text-gray-400">
            {language === 'en' ? 'Loading services...' : 'טוען שירותים...'}
          </p>
        </div>
      </div>
    );
  }

  const mainServices = services.filter(service => !service.isAddon);
  const addons = services.filter(service => service.isAddon);
  const selectedServiceDetails = selectedServices
    .map(id => serviceLookup.get(id))
    .filter((service): service is Service => Boolean(service));
  const hasMainServiceSelected = selectedServiceDetails.some(service => !service.isAddon);
  const clubCodeMissing = hasLoyaltyCard && loyaltyCode.trim().length === 0;
  const visibleAvailableDays = visibleDays.filter(day => isDayAvailable(day)).length;
  const recommendedTime = selectedDate && !selectedTime && availableTimes.length > 0 ? availableTimes[0] : null;
  const selectedDateLabel = selectedDate
    ? formatLocalizedDate(selectedDate, language, { includeWeekday: true, includeYear: true })
    : bookingCopy.notSelected;
  const selectedTimeEnd = selectedTime
    ? format(addMinutes(parseISO(`2000-01-01T${selectedTime}`), duration), 'HH:mm')
    : null;
  const selectedTimeLabel = selectedTime
    ? `${selectedTime}${selectedTimeEnd ? ` - ${selectedTimeEnd}` : ''}`
    : bookingCopy.notSelected;
  const selectedHairLabel = hairType ? t(hairType as 'straight' | 'wavy' | 'curly') : bookingCopy.notSelected;
  const selectedClientLabel = clientName.trim() ? clientName.trim() : bookingCopy.notProvided;
  const selectedPhoneLabel = validatePhone(clientPhone) ? clientPhone.trim() : bookingCopy.notProvided;
  const durationLabel =
    duration > 0 ? `${duration} ${t('minutes')}` : bookingCopy.notSelected;

  const stepMeta = [
    { title: t('selectServices'), description: bookingCopy.stepDescriptions.services },
    { title: t('selectDate'), description: bookingCopy.stepDescriptions.schedule },
    { title: t('hairType'), description: bookingCopy.stepDescriptions.hair },
    { title: t('personalDetails'), description: bookingCopy.stepDescriptions.details },
    { title: t('summary'), description: bookingCopy.stepDescriptions.review },
  ];

  const timePeriodOptions = [
    { id: 'all' as const, label: language === 'en' ? 'All day' : 'כל היום' },
    { id: 'morning' as const, label: language === 'en' ? 'Morning' : 'בוקר' },
    { id: 'afternoon' as const, label: language === 'en' ? 'Midday' : 'צהריים' },
    { id: 'evening' as const, label: language === 'en' ? 'Evening' : 'ערב' },
  ];

  const isNextDisabled =
    (step === 1 && selectedServices.length === 0) ||
    (step === 2 && (!selectedDate || !selectedTime)) ||
    (step === 3 && (!hairType || clubCodeMissing)) ||
    (step === 4 && (!clientName.trim() || !validatePhone(clientPhone)));

  const nextButtonLabel =
    step < 5
      ? [
          bookingCopy.nextCtas.date,
          bookingCopy.nextCtas.hair,
          bookingCopy.nextCtas.details,
          bookingCopy.nextCtas.review,
        ][step - 1]
      : t('submitBooking');

  const currentStepHint =
    step === 1
      ? selectedServices.length > 0
        ? bookingCopy.stepHints.servicesReady
        : bookingCopy.stepHints.servicesEmpty
      : step === 2
        ? selectedDate && selectedTime
          ? bookingCopy.stepHints.scheduleReady
          : bookingCopy.stepHints.scheduleEmpty
        : step === 3
          ? hairType && !clubCodeMissing
            ? bookingCopy.stepHints.hairReady
            : bookingCopy.stepHints.hairEmpty
          : step === 4
            ? clientName.trim() && validatePhone(clientPhone)
              ? bookingCopy.stepHints.detailsReady
              : bookingCopy.stepHints.detailsEmpty
            : bookingCopy.stepHints.review;

  const nextStep = () => {
    if (isNextDisabled) {
      return;
    }
    if (step === 1 && !selectedDate) {
      setIsDatePickerOpen(true);
    }
    setStep(prev => Math.min(prev + 1, 5) as 1 | 2 | 3 | 4 | 5);
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4 | 5);

  const actionBar = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className={isRtl ? 'text-right' : ''}>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
          {t('estimatedTotal')}
        </p>
        <div className={`mt-2 flex items-end gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span className="text-3xl font-black text-gray-900">{price}</span>
          <span className="pb-1 text-sm font-bold text-gray-400">{t('ils')}</span>
          {duration > 0 && (
            <span
              className={`pb-1 text-xs font-medium text-gray-400 flex items-center gap-1 ${
                isRtl ? 'flex-row-reverse' : ''
              }`}
            >
              <Clock size={12} />
              {duration} {t('minutes')}
            </span>
          )}
        </div>
        <p className="mt-2 max-w-xl text-xs font-medium leading-5 text-gray-500">
          {currentStepHint}
        </p>
      </div>

      <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {step > 1 && (
          <button
            onClick={prevStep}
            className="h-11 w-11 rounded-full border border-[#eaded6] bg-[#fff7f2] text-gray-700 transition-colors hover:bg-white"
          >
            {isRtl ? <ChevronRight size={18} className="mx-auto" /> : <ChevronLeft size={18} className="mx-auto" />}
          </button>
        )}

        {step < 5 ? (
          <button
            onClick={nextStep}
            disabled={isNextDisabled}
            className={`inline-flex items-center gap-2 rounded-full bg-[#ED4672] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ED4672]/20 transition-all hover:bg-[#d83f68] disabled:cursor-not-allowed disabled:opacity-45 ${
              isRtl ? 'flex-row-reverse' : ''
            }`}
          >
            {nextButtonLabel}
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`inline-flex items-center gap-2 rounded-full bg-[#ED4672] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ED4672]/20 transition-all hover:bg-[#d83f68] disabled:cursor-not-allowed disabled:opacity-50 ${
              isRtl ? 'flex-row-reverse' : ''
            }`}
          >
            {submitting ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <CheckCircle size={16} />
                {t('submitBooking')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div dir={dir} className={`flex-1 min-h-screen bg-[#f6f0eb] ${isRtl ? 'text-right' : 'text-left'}`}>
      <section className="px-3 pt-3 md:px-6 md:pt-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[22px] bg-[#120d14] text-white shadow-[0_20px_56px_rgba(18,13,20,0.16)] md:rounded-[34px]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative overflow-hidden p-4 md:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(237,70,114,0.34),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,180,0,0.18),transparent_30%)]" />
              <div className="relative z-10">
                <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => window.history.back()}
                    aria-label={language === 'en' ? 'Go back' : 'חזור'}
                    className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-bold text-white/90 transition-colors hover:bg-white/14 ${
                      isRtl ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    {language === 'en' ? 'Back' : 'חזרה'}
                  </button>
                  <span className="rounded-full bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/75">
                    {bookingCopy.journeyLabel}
                  </span>
                </div>

                <div className="mt-5 max-w-2xl md:mt-8">
                  <p className="text-sm font-bold text-[#ffbfd0]">{stepMeta[step - 1].title}</p>
                  <h1 className="mt-2 text-xl font-black leading-tight sm:text-4xl lg:text-[2.85rem]">
                    {bookingCopy.title}
                  </h1>
                  <p className="mt-4 hidden max-w-xl text-sm font-medium leading-7 text-white/70 sm:block sm:text-base">
                    {bookingCopy.subtitle}
                  </p>
                </div>

                <div className={`mt-4 hidden flex-wrap gap-2 sm:flex ${isRtl ? 'justify-end' : ''}`}>
                  {bookingCopy.trustPoints.map(point => (
                    <span
                      key={point}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3.5 py-2 text-xs font-bold text-white/82"
                    >
                      <CheckCircle size={14} className="text-[#ffbfd0]" />
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative hidden overflow-hidden lg:block">
              <img
                src={galleryImages.find(img => img.id === 'studio_entrance')?.src || ''}
                alt="Ayelet Netanel Studio"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120d14] via-[#120d14]/25 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/60">
                  {bookingCopy.heroSummaryLabel}
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-black/15 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                      {t('services')}
                    </p>
                    <p className="mt-1 font-black text-white">
                      {selectedServiceDetails.length > 0
                        ? `${selectedServiceDetails.length} ${t('items')}`
                        : bookingCopy.notSelected}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/15 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                      {t('date')}
                    </p>
                    <p className="mt-1 font-black text-white">{selectedDateLabel}</p>
                  </div>
                  <div className="rounded-2xl bg-black/15 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                      {t('estimatedDuration')}
                    </p>
                    <p className="mt-1 font-black text-white">{durationLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-32 pt-4 md:px-6 md:pb-10">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[24px] border border-white/70 bg-[#fffaf7] p-3 shadow-[0_20px_50px_rgba(29,22,19,0.07)] sm:p-6 lg:p-8">
            <div className="rounded-[20px] border border-[#f1e6de] bg-white/85 p-4 md:rounded-[28px] md:p-5">
              <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ED4672]">
                    {language === 'en' ? `Step ${step} of 5` : `שלב ${step} מתוך 5`}
                  </p>
                  <h2 className="mt-1 text-xl font-black text-gray-900 md:mt-2 md:text-2xl">{stepMeta[step - 1].title}</h2>
                  <p className="mt-2 hidden max-w-2xl text-sm font-medium leading-6 text-gray-500 sm:block">
                    {stepMeta[step - 1].description}
                  </p>
                </div>
                <div className="hidden rounded-2xl bg-[#fcf4ef] px-4 py-3 text-right lg:block">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {bookingCopy.summaryLabel}
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-700">
                    {selectedServiceDetails.length > 0
                      ? `${selectedServiceDetails.length} ${t('items')}`
                      : bookingCopy.notSelected}
                  </p>
                </div>
              </div>

              <div className={`relative mt-5 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="absolute inset-x-0 top-4 h-px bg-[#eadfd7]" />
                <div
                  className={`absolute top-4 h-px bg-[#ED4672] transition-all duration-500 ease-out ${
                    isRtl ? 'right-0' : 'left-0'
                  }`}
                  style={{ width: `${((step - 1) / 4) * 100}%` }}
                />
                {[1, 2, 3, 4, 5].map(progressStep => (
                  <button
                    key={progressStep}
                    onClick={() => progressStep < step && setStep(progressStep as 1 | 2 | 3 | 4 | 5)}
                    disabled={progressStep >= step}
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black transition-all ${
                      progressStep === step
                        ? 'scale-110 border-[#ED4672] bg-[#ED4672] text-white shadow-[0_0_18px_rgba(237,70,114,0.36)]'
                        : progressStep < step
                          ? 'cursor-pointer border-[#ED4672] bg-[#ED4672] text-white hover:scale-105'
                          : 'border-[#eadfd7] bg-white text-gray-300'
                    }`}
                  >
                    {progressStep < step ? (
                      <CheckCircle size={13} strokeWidth={3} />
                    ) : (
                      progressStep
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isUsingFallbackCatalog && (
              <div
                className={`mt-5 flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-800 ${
                  isRtl ? 'flex-row-reverse text-right' : ''
                }`}
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
                <p>{bookingCopy.fallbackNotice}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
              <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm">
                {selectedServiceDetails.length > 0
                  ? `${selectedServiceDetails.length} ${t('items')}`
                  : bookingCopy.notSelected}
              </span>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm">
                {selectedDate ? formatLocalizedDate(selectedDate, language, { includeWeekday: false, includeYear: false, monthStyle: 'short' }) : bookingCopy.notSelected}
              </span>
              <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm">
                {selectedTime || bookingCopy.notSelected}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="services-step"
                  initial={{ opacity: 0, x: isRtl ? -28 : 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 28 : -28 }}
                  transition={{ duration: 0.24 }}
                  className="mt-8"
                >
                  <div className={`mb-6 flex items-start justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">{bookingCopy.servicesIntroTitle}</h3>
                      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-500">
                        {bookingCopy.servicesIntroText}
                      </p>
                    </div>
                    <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#ED4672] sm:flex">
                      <Scissors size={20} />
                    </div>
                  </div>

                  {selectedServiceDetails.length > 0 && (
                    <div className="mb-5 rounded-[28px] bg-[#111015] p-5 text-white shadow-[0_18px_40px_rgba(17,16,21,0.16)]">
                      <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                            {bookingCopy.selectedServicesTitle}
                          </p>
                          <div className={`mt-3 flex flex-wrap gap-2 ${isRtl ? 'justify-end' : ''}`}>
                            {selectedServiceDetails.map(service => (
                              <span
                                key={service.id}
                                className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs font-bold text-white/90"
                              >
                                {getServiceDisplayName(service, language)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className={isRtl ? 'text-left' : 'text-right'}>
                          <p className="text-sm font-bold text-white/45">{t('estimatedDuration')}</p>
                          <p className="mt-1 text-xl font-black text-white">{durationLabel}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5 md:gap-4">
                    {mainServices.map(service => {
                      const isSelected = selectedServices.includes(service.id);
                      const isSoon = service.id.includes('soon');
                      const isHighlights = service.id === 'natural_highlights';
                      const categoryLabel = service.category ? t(service.category as any) : t('services');

                      return (
                        <motion.button
                          key={service.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            if (isHighlights) {
                              window.open(t('whatsappLink'), '_blank');
                              showToast(t('highlightsWhatsApp'), 'info');
                              return;
                            }

                            if (isSoon) {
                              window.open(t('whatsappLink'), '_blank');
                              showToast(t('comingSoonWhatsApp'), 'info');
                              return;
                            }

                            setSelectedServices(prev =>
                              isSelected ? prev.filter(id => id !== service.id) : [...prev, service.id]
                            );
                          }}
                          className={`group relative overflow-hidden rounded-[18px] border p-2.5 text-left transition-all sm:rounded-[28px] sm:p-5 ${
                            isSelected
                              ? 'border-[#ED4672] bg-white shadow-[0_16px_34px_rgba(237,70,114,0.16)]'
                              : 'border-[#efe4dd] bg-white shadow-sm hover:-translate-y-0.5 hover:border-[#f3b7c9] hover:shadow-lg'
                          }`}
                        >
                          <div
                            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ED4672] to-[#ffb7ca] transition-opacity ${
                              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          />

                          <div className={`flex flex-col gap-2 sm:flex-row sm:gap-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                            <div className="h-24 w-full overflow-hidden rounded-[16px] bg-gray-100 shrink-0 sm:h-20 sm:w-20 sm:rounded-[22px]">
                              <img
                                src={getServiceImg(service.id)}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <div className={`flex items-start justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className={isRtl ? 'text-right' : ''}>
                                  <span className="hidden rounded-full bg-[#fff5f8] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#ED4672] sm:inline-flex">
                                    {categoryLabel}
                                  </span>
                                  <p className="text-sm font-black leading-tight text-gray-900 sm:mt-3 sm:text-lg">
                                    {getServiceDisplayName(service, language)}
                                  </p>
                                  <p className="mt-2 hidden text-sm font-medium text-gray-500 sm:block">
                                    {isSoon
                                      ? t('comingSoonWhatsApp')
                                      : isHighlights
                                        ? t('highlightsWhatsApp')
                                        : `${t('estimatedDuration')}: ${service.durationMinutes} ${t('minutes')}`}
                                  </p>
                                </div>

                                <div
                                  className={`absolute top-3 flex h-7 w-7 items-center justify-center rounded-full border transition-all sm:static sm:h-8 sm:w-8 ${
                                    isRtl ? 'left-3 sm:left-auto' : 'right-3 sm:right-auto'
                                  } ${
                                    isSelected
                                      ? 'border-[#ED4672] bg-[#ED4672] text-white'
                                      : 'border-[#e8ddd6] bg-white text-gray-300'
                                  }`}
                                >
                                  {isSelected ? <CheckCircle size={14} strokeWidth={3} /> : null}
                                </div>
                              </div>

                              <div className={`mt-3 flex items-end justify-between gap-2 sm:mt-4 sm:gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex flex-wrap items-center gap-2 text-xs font-bold ${isRtl ? 'justify-end' : ''}`}>
                                  {isHighlights || isSoon ? (
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-600">
                                      WhatsApp
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#faf4ef] px-2.5 py-1 text-gray-500">
                                      <Clock size={11} />
                                      {service.durationMinutes} {t('minutes')}
                                    </span>
                                  )}
                                </div>

                                {!isSoon && (
                                  <div className={isRtl ? 'text-left' : 'text-right'}>
                                    <p className="text-lg font-black text-gray-900 sm:text-2xl">
                                      {getServiceDisplayPrice(service)}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 sm:text-xs">
                                      {t('ils')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {hasMainServiceSelected && addons.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-5 overflow-hidden"
                      >
                        <div className="rounded-[28px] border border-[#efe4dd] bg-white p-5 shadow-sm">
                          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Sparkles size={18} className="text-[#ED4672]" />
                            <h4 className="text-lg font-black text-gray-900">
                              {t('addons')}
                            </h4>
                            <span className="rounded-full bg-[#faf4ef] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                              {t('optional')}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2.5">
                            {addons.map(service => {
                              const isSelected = selectedServices.includes(service.id);

                              return (
                                <button
                                  key={service.id}
                                  onClick={() =>
                                    setSelectedServices(prev =>
                                      isSelected ? prev.filter(id => id !== service.id) : [...prev, service.id]
                                    )
                                  }
                                  className={`w-full rounded-[22px] border p-4 text-left transition-all ${
                                    isSelected
                                      ? 'border-[#ED4672] bg-[#fff5f8] shadow-sm'
                                      : 'border-[#efe4dd] bg-white hover:border-[#f3b7c9]'
                                  }`}
                                >
                                  <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                      <div
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                          isSelected
                                            ? 'border-[#ED4672] bg-[#ED4672] text-white'
                                            : 'border-[#e8ddd6] bg-white text-gray-300'
                                        }`}
                                      >
                                        {isSelected ? <CheckCircle size={13} strokeWidth={3} /> : null}
                                      </div>
                                      <div className={isRtl ? 'text-right' : ''}>
                                        <p className="font-bold text-gray-900">
                                          {getServiceDisplayName(service, language)}
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-gray-400">
                                          +{service.durationMinutes} {t('minutes')}
                                        </p>
                                      </div>
                                    </div>

                                    <div className={isRtl ? 'text-left' : 'text-right'}>
                                      <p className="text-lg font-black text-gray-900">+{service.price}</p>
                                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        {t('ils')}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="date-step"
                  initial={{ opacity: 0, x: isRtl ? -28 : 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 28 : -28 }}
                  transition={{ duration: 0.24 }}
                  className="mt-8"
                >
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[22px] border border-[#efe4dd] bg-white p-4 shadow-sm md:rounded-[28px] md:p-5">
                      <div className={`flex items-start justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 md:text-xl">{bookingCopy.calendarTitle}</h3>
                          <p className="mt-2 hidden text-sm font-medium leading-6 text-gray-500 sm:block">
                            {bookingCopy.calendarText}
                          </p>
                        </div>
                        <div className="hidden rounded-2xl bg-[#faf4ef] px-4 py-3 text-right sm:block">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {language === 'en' ? 'Visible range' : 'טווח מוצג'}
                          </p>
                          <p className="mt-1 text-sm font-bold text-gray-700">{monthLabel}</p>
                        </div>
                      </div>

                      {selectedDate && !isDatePickerOpen ? (
                        <button
                          onClick={() => setIsDatePickerOpen(true)}
                          className={`mt-4 flex w-full items-center justify-between gap-3 rounded-[20px] border border-[#f0dfd7] bg-[#fff8f4] p-4 text-[#221a1d] transition-colors hover:bg-white ${
                            isRtl ? 'flex-row-reverse text-right' : ''
                          }`}
                        >
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ED4672]">
                              {language === 'en' ? 'Selected date' : 'התאריך שנבחר'}
                            </p>
                            <p className="mt-1 text-base font-black">
                              {formatLocalizedDate(selectedDate, language, {
                                includeWeekday: true,
                                includeYear: false,
                                monthStyle: 'short',
                              })}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-gray-700 shadow-sm">
                            {language === 'en' ? 'Change' : 'שינוי'}
                          </span>
                        </button>
                      ) : (
                        <>
                          <div className={`mt-4 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <button
                              onClick={() => setDateWindowStart(current => Math.max(0, current - 14))}
                              disabled={dateWindowStart === 0}
                              className="h-9 w-9 rounded-full border border-[#eaded6] bg-[#fff7f2] text-gray-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              {isRtl ? <ChevronRight size={17} className="mx-auto" /> : <ChevronLeft size={17} className="mx-auto" />}
                            </button>
                            <p className="text-xs font-bold text-gray-500">
                              {visibleAvailableDays} {language === 'en' ? 'open days' : 'ימים פתוחים'}
                            </p>
                            <button
                              onClick={() => setDateWindowStart(current => Math.min(days.length - 14, current + 14))}
                              disabled={dateWindowStart >= days.length - 14}
                              className="h-9 w-9 rounded-full border border-[#eaded6] bg-[#fff7f2] text-gray-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              {isRtl ? <ChevronLeft size={17} className="mx-auto" /> : <ChevronRight size={17} className="mx-auto" />}
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                            {visibleDays.map(day => {
                              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                              const isToday = isSameDay(day, today);
                              const isAvailable = isDayAvailable(day);

                              return (
                                <button
                                  key={day.toISOString()}
                                  onClick={() => handleDateSelect(day)}
                                  disabled={!isAvailable}
                                  className={`min-h-[70px] rounded-[16px] border p-2 text-center transition-all ${
                                    isSelected
                                      ? 'border-[#ED4672] bg-[#ED4672] text-white shadow-lg shadow-[#ED4672]/20'
                                      : !isAvailable
                                        ? 'cursor-not-allowed border-[#f1ebe6] bg-[#faf7f4] text-gray-300'
                                        : 'border-[#efe4dd] bg-white text-gray-800 hover:border-[#f3b7c9]'
                                  }`}
                                >
                                  <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                    {getLocalizedWeekdayShort(day, language)}
                                  </p>
                                  <p className="mt-1 text-xl font-black leading-none">{day.getDate()}</p>
                                  <p className={`mt-1 text-[10px] font-bold ${isSelected ? 'text-white/80' : isToday ? 'text-[#ED4672]' : 'text-gray-500'}`}>
                                    {getLocalizedMonth(day, language, 'short')}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="rounded-[22px] border border-[#efe4dd] bg-white p-4 shadow-sm md:rounded-[28px] md:p-5">
                      <div className={`flex items-start justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 md:text-xl">{bookingCopy.timeTitle}</h3>
                          <p className="mt-2 hidden text-sm font-medium leading-6 text-gray-500 sm:block">
                            {bookingCopy.timeText}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#faf4ef] px-3 py-2 text-right">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {t('date')}
                          </p>
                          <p className="mt-1 text-xs font-bold text-gray-700 sm:text-sm">
                            {selectedDate
                              ? formatLocalizedDate(selectedDate, language, {
                                  includeWeekday: true,
                                  includeYear: false,
                                  monthStyle: 'short',
                                })
                              : bookingCopy.notSelected}
                          </p>
                        </div>
                      </div>

                      {!selectedDate ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center text-center text-gray-300">
                          <CalendarIcon size={38} className="mb-4 opacity-40" />
                          <p className="max-w-xs text-sm font-bold leading-6">{bookingCopy.timePlaceholder}</p>
                        </div>
                      ) : checkingSlots ? (
                        <div className="flex min-h-[280px] flex-col items-center justify-center">
                          <div className="mb-4 h-10 w-10 rounded-full border-4 border-[#ED4672]/20 border-t-[#ED4672] animate-spin" />
                          <p className="text-sm font-bold text-gray-400">
                            {language === 'en' ? 'Checking availability...' : 'בודקת זמינות...'}
                          </p>
                        </div>
                      ) : (
                        <>
                          {recommendedTime && (
                            <button
                              onClick={() => setSelectedTime(recommendedTime)}
                              className={`mt-5 flex w-full items-center justify-between gap-4 rounded-[24px] bg-[#111015] px-4 py-4 text-white shadow-[0_18px_40px_rgba(17,16,21,0.16)] ${
                                isRtl ? 'flex-row-reverse text-right' : ''
                              }`}
                            >
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                                  {bookingCopy.recommendedTime}
                                </p>
                                <p className="mt-1 text-lg font-black">{recommendedTime}</p>
                              </div>
                              <div className={`flex items-center gap-2 text-sm font-bold text-white/70 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <Clock size={16} />
                                {selectedTimeEnd || durationLabel}
                              </div>
                            </button>
                          )}

                          <div className={`mt-4 flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            {timePeriodOptions.map(option => (
                              <button
                                key={option.id}
                                onClick={() => setTimePeriod(option.id)}
                                className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                                  timePeriod === option.id
                                    ? 'bg-[#ED4672] text-white'
                                    : 'bg-[#faf4ef] text-gray-500 hover:bg-[#f3e7df]'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          {availableTimes.length === 0 ? (
                            <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-gray-400">
                              <AlertCircle size={30} className="mb-3 opacity-40" />
                              <p className="text-sm font-bold">{t('noSlots')}</p>
                            </div>
                          ) : filteredTimes.length === 0 ? (
                            <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-gray-400">
                              <Clock size={30} className="mb-3 opacity-40" />
                              <p className="text-sm font-bold">{bookingCopy.periodEmpty}</p>
                            </div>
                          ) : (
                            <div className="mt-4 grid max-h-[260px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                              {filteredTimes.map(time => {
                                const endTime = format(
                                  addMinutes(parseISO(`2000-01-01T${time}`), duration),
                                  'HH:mm'
                                );

                                return (
                                  <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`rounded-[16px] border px-2 py-3 text-center transition-all ${
                                      selectedTime === time
                                        ? 'border-[#ED4672] bg-[#ED4672] text-white shadow-lg shadow-[#ED4672]/20'
                                        : 'border-[#efe4dd] bg-white text-gray-700 hover:border-[#f3b7c9] hover:bg-[#fff7fa]'
                                    }`}
                                  >
                                    <span className="block text-base font-black leading-none">{time}</span>
                                    <span
                                      className={`mt-2 block text-[11px] font-bold ${
                                        selectedTime === time ? 'text-white/72' : 'text-gray-400'
                                      }`}
                                    >
                                      {endTime}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="hair-step"
                  initial={{ opacity: 0, x: isRtl ? -28 : 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 28 : -28 }}
                  transition={{ duration: 0.24 }}
                  className="mt-8"
                >
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{bookingCopy.hairTitle}</h3>
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-500">
                      {bookingCopy.hairText}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {[
                      { id: 'straight', label: t('straight'), desc: t('straightDesc'), Icon: StraightHairIcon },
                      { id: 'wavy', label: t('wavy'), desc: t('wavyDesc'), Icon: WavyHairIcon },
                      { id: 'curly', label: t('curly'), desc: t('curlyDesc'), Icon: CurlyHairIcon },
                    ].map(type => {
                      const isActive = hairType === type.id;

                      return (
                        <motion.button
                          key={type.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setHairType(type.id as 'straight' | 'wavy' | 'curly')}
                          className={`relative rounded-[28px] border p-5 transition-all ${
                            isActive
                              ? 'border-[#ED4672] bg-gradient-to-b from-[#fff1f6] to-white shadow-[0_16px_34px_rgba(237,70,114,0.16)]'
                              : 'border-[#efe4dd] bg-white hover:-translate-y-0.5 hover:border-[#f3b7c9] hover:shadow-md'
                          }`}
                        >
                          {isActive && (
                            <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} h-7 w-7 rounded-full bg-[#ED4672] text-white flex items-center justify-center`}>
                              <CheckCircle size={14} strokeWidth={3} />
                            </div>
                          )}
                          <div className="flex flex-col items-center text-center">
                            <div
                              className={`flex h-18 w-18 items-center justify-center rounded-full ${
                                isActive ? 'bg-[#ED4672]/10' : 'bg-[#faf4ef]'
                              }`}
                            >
                              <type.Icon className={`h-12 w-12 ${isActive ? 'text-[#ED4672]' : 'text-gray-400'}`} />
                            </div>
                            <p className={`mt-4 text-lg font-black ${isActive ? 'text-[#ED4672]' : 'text-gray-900'}`}>
                              {type.label}
                            </p>
                            <p className="mt-2 text-sm font-medium leading-6 text-gray-500">{type.desc}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className="rounded-[28px] border border-[#efe4dd] bg-white p-5 shadow-sm">
                      <div className={`flex items-start justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#ED4672] shrink-0">
                            <Ticket size={18} />
                          </div>
                          <div className={isRtl ? 'text-right' : ''}>
                            <h4 className="text-lg font-black text-gray-900">{t('clubCardQuestion')}</h4>
                            <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                              {bookingCopy.clubText}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setHasLoyaltyCard(current => !current);
                            setRequestedClubSignup(false);
                            if (hasLoyaltyCard) {
                              setLoyaltyCode('');
                            }
                          }}
                          className={`relative h-7 w-14 rounded-full transition-colors ${
                            hasLoyaltyCard ? 'bg-[#ED4672]' : 'bg-gray-200'
                          }`}
                          aria-pressed={hasLoyaltyCard}
                        >
                          <motion.div
                            className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
                            animate={{ x: hasLoyaltyCard ? (isRtl ? -26 : 26) : 4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {hasLoyaltyCard ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 overflow-hidden"
                          >
                            <label
                              htmlFor="loyaltyCode"
                              className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-gray-400"
                            >
                              {t('clubCardCode')}
                            </label>
                            <input
                              id="loyaltyCode"
                              type="text"
                              value={loyaltyCode}
                              onChange={event => setLoyaltyCode(event.target.value)}
                              placeholder={t('clubCardPlaceholder')}
                              className={`w-full rounded-[22px] border-2 border-[#efe4dd] bg-[#faf4ef] px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-all focus:border-[#ED4672] focus:ring-2 focus:ring-[#ED4672]/20 ${
                                isRtl ? 'text-right' : ''
                              }`}
                            />
                            {clubCodeMissing && (
                              <p className="mt-2 text-xs font-bold text-red-500">
                                {language === 'en'
                                  ? 'Enter your club code to continue.'
                                  : 'יש להזין קוד מועדון כדי להמשיך.'}
                              </p>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-4"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setRequestedClubSignup(true);
                                window.open(t('whatsappLink'), '_blank');
                              }}
                              className={`inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-gray-800 ${
                                isRtl ? 'flex-row-reverse' : ''
                              }`}
                            >
                              {t('joinClub')}
                              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                            </button>
                            {requestedClubSignup && (
                              <p className="mt-3 text-xs font-bold text-emerald-600">
                                {t('membershipRequest')}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className={`rounded-[28px] border border-amber-200 bg-amber-50 p-5 ${isRtl ? 'text-right' : ''}`}>
                      <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-500 shrink-0">
                          <Zap size={18} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-amber-900">{t('beforeYouArrive')}</h4>
                          <p className="mt-2 text-sm font-medium leading-6 text-amber-800">
                            {t('cleanHairInstruction')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="details-step"
                  initial={{ opacity: 0, x: isRtl ? -28 : 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 28 : -28 }}
                  transition={{ duration: 0.24 }}
                  className="mt-8"
                >
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{bookingCopy.detailsTitle}</h3>
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-500">
                      {bookingCopy.detailsText}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[28px] border border-[#efe4dd] bg-white p-5 shadow-sm">
                      <div>
                        <label
                          htmlFor="clientName"
                          className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-gray-400"
                        >
                          {t('fullName')}
                        </label>
                        <input
                          id="clientName"
                          type="text"
                          required
                          value={clientName}
                          onChange={event => {
                            setClientName(event.target.value);
                            if (event.target.value.trim()) {
                              setNameError('');
                            }
                          }}
                          onBlur={() => {
                            if (!clientName.trim()) {
                              setNameError(t('requiredField'));
                            }
                          }}
                          placeholder={language === 'en' ? 'Your full name' : 'שם מלא'}
                          className={`w-full rounded-[22px] border-2 bg-[#faf4ef] px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#ED4672]/20 ${
                            isRtl ? 'text-right' : ''
                          } ${
                            nameError
                              ? 'border-red-300 bg-red-50'
                              : 'border-[#efe4dd] focus:border-[#ED4672]'
                          }`}
                        />
                        {nameError && (
                          <p
                            className={`mt-2 flex items-center gap-1 text-xs font-bold text-red-500 ${
                              isRtl ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <AlertCircle size={12} />
                            {nameError}
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <label
                          htmlFor="clientPhone"
                          className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-gray-400"
                        >
                          {t('phone')}
                        </label>
                        <input
                          id="clientPhone"
                          type="tel"
                          required
                          value={clientPhone}
                          dir="ltr"
                          onChange={event => {
                            setClientPhone(event.target.value);
                            if (validatePhone(event.target.value)) {
                              setPhoneError('');
                            }
                          }}
                          onBlur={() => {
                            if (!validatePhone(clientPhone)) {
                              setPhoneError(t('invalidPhone'));
                            }
                          }}
                          placeholder="050-0000000"
                          inputMode="tel"
                          className={`w-full rounded-[22px] border-2 bg-[#faf4ef] px-4 py-3.5 text-sm font-medium text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[#ED4672]/20 ${
                            phoneError
                              ? 'border-red-300 bg-red-50'
                              : 'border-[#efe4dd] focus:border-[#ED4672]'
                          }`}
                        />
                        {phoneError && (
                          <p className="mt-2 flex items-center gap-1 text-xs font-bold text-red-500">
                            <AlertCircle size={12} />
                            {phoneError}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 rounded-[24px] bg-[#111015] p-4 text-white">
                        <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#ffbfd0] shrink-0">
                            <Phone size={18} />
                          </div>
                          <div className={isRtl ? 'text-right' : ''}>
                            <p className="text-sm font-black text-white">
                              {language === 'en'
                                ? 'We use your phone only for coordination.'
                                : 'נשתמש בטלפון שלך רק לצורכי תיאום.'}
                            </p>
                            <p className="mt-2 text-sm font-medium leading-6 text-white/65">
                              {language === 'en'
                                ? 'Reminders, clarifications, or anything important about the appointment will be sent only if needed.'
                                : 'תזכורות, הבהרות או כל דבר חשוב לגבי התור יישלחו רק אם באמת יהיה בכך צורך.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={isNextDisabled}
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ED4672] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#ED4672]/20 transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
                          isRtl ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {bookingCopy.nextCtas.review}
                        {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[28px] border border-[#efe4dd] bg-white p-5 shadow-sm">
                        <h4 className="text-lg font-black text-gray-900">{bookingCopy.notesTitle}</h4>
                        <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                          {bookingCopy.notesText}
                        </p>

                        <div className="mt-4">
                          <label
                            htmlFor="bookingNotes"
                            className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-gray-400"
                          >
                            {t('notes')}
                          </label>
                          <textarea
                            id="bookingNotes"
                            value={notes}
                            onChange={event => setNotes(event.target.value)}
                            rows={4}
                            placeholder={
                              language === 'en'
                                ? 'Anything we should know before your appointment?'
                                : 'יש משהו שחשוב שנדע לפני התור?'
                            }
                            className={`w-full resize-none rounded-[22px] border-2 border-[#efe4dd] bg-[#faf4ef] px-4 py-3 text-sm font-medium text-gray-900 outline-none transition-all focus:border-[#ED4672] focus:ring-2 focus:ring-[#ED4672]/20 ${
                              isRtl ? 'text-right' : ''
                            }`}
                          />
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-[#efe4dd] bg-white p-5 shadow-sm">
                        <p
                          className={`mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-gray-400 ${
                            isRtl ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <ImageIcon size={14} className="text-[#ED4672]" />
                          {t('inspirationImages')}
                        </p>
                        <p className="text-sm font-medium leading-6 text-gray-500">
                          {t('inspirationImagesDesc')}
                        </p>

                        {imagePreviews.length < 2 && (
                          <div className="relative mt-4 rounded-[24px] border-2 border-dashed border-[#f0b9c9] bg-[#fff6f9] p-6 text-center transition-colors hover:bg-[#fff0f5]">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="pointer-events-none flex flex-col items-center gap-2">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ED4672]/10">
                                <ImageIcon size={24} className="text-[#ED4672]" />
                              </div>
                              <span className="text-sm font-bold text-[#ED4672]">{t('tapToUpload')}</span>
                              <span className="text-xs text-gray-400">{t('maxFiles')}</span>
                            </div>
                          </div>
                        )}

                        {imagePreviews.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {imagePreviews.map((previewUrl, index) => (
                              <div
                                key={previewUrl}
                                className="relative aspect-square overflow-hidden rounded-[22px] bg-gray-100"
                              >
                                <img
                                  src={previewUrl}
                                  alt={`Inspiration ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="summary-step"
                  initial={{ opacity: 0, x: isRtl ? -28 : 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 28 : -28 }}
                  transition={{ duration: 0.24 }}
                  className="mt-8"
                >
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{bookingCopy.reviewTitle}</h3>
                    <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-500">
                      {bookingCopy.reviewText}
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-5 flex items-center gap-2 rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-sm font-bold text-red-600 ${
                        isRtl ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <AlertCircle size={18} />
                      {error}
                    </motion.div>
                  )}

                  <div className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className="overflow-hidden rounded-[32px] border border-[#efe4dd] bg-white shadow-sm">
                      <div className="bg-gradient-to-r from-[#111015] to-[#2c1d24] px-6 py-5 text-white">
                        <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                              {language === 'en' ? 'Appointment summary' : 'סיכום התור'}
                            </p>
                            <p className="mt-2 text-xl font-black">Ayelet Netanel Studio</p>
                          </div>
                          <div className={isRtl ? 'text-left' : 'text-right'}>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                              {t('totalPrice')}
                            </p>
                            <p className="mt-2 text-3xl font-black text-[#ffbfd0]">₪{price}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 p-6">
                        <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#ED4672] shrink-0">
                            <CalendarIcon size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                              {t('date')} + {t('time')}
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-900">{selectedDateLabel}</p>
                            <p className="mt-1 text-sm font-medium text-[#ED4672]">{selectedTimeLabel}</p>
                          </div>
                          <button
                            onClick={() => setStep(2)}
                            className="text-xs font-bold text-[#ED4672] transition-colors hover:text-[#d83f68]"
                          >
                            {t('edit')}
                          </button>
                        </div>

                        <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#faf4ef] text-gray-500 shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                              {t('location')}
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-900">{t('addressFull')}</p>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-[#eee4dc] pt-5">
                          <div className={`mb-3 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                              {t('services')}
                            </p>
                            <button
                              onClick={() => setStep(1)}
                              className="text-xs font-bold text-[#ED4672] transition-colors hover:text-[#d83f68]"
                            >
                              {t('edit')}
                            </button>
                          </div>

                          <div className="space-y-3">
                            {selectedServiceDetails.map(service => (
                              <div
                                key={service.id}
                                className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}
                              >
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {getServiceDisplayName(service, language)}
                                  </p>
                                  <p className="mt-1 text-xs font-medium text-gray-400">
                                    {service.durationMinutes} {t('minutes')}
                                  </p>
                                </div>
                                <p className="text-sm font-black text-[#ED4672]">
                                  {getServiceDisplayPrice(service)} {t('ils')}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`flex items-center justify-between border-t border-[#f4ebe4] pt-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-2 text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <Clock size={16} />
                            <span className="text-sm font-medium">{t('estimatedDuration')}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{durationLabel}</span>
                        </div>

                        <div className="border-t border-[#f4ebe4] pt-5">
                          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ED4672] text-sm font-black text-white shrink-0">
                              {clientName.trim().charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">{clientName}</p>
                              <p className="mt-1 text-xs font-medium text-gray-400">{clientPhone}</p>
                            </div>
                            <button
                              onClick={() => setStep(4)}
                              className="text-xs font-bold text-[#ED4672] transition-colors hover:text-[#d83f68]"
                            >
                              {t('edit')}
                            </button>
                          </div>
                        </div>

                        {(hasLoyaltyCard || requestedClubSignup) && (
                          <div className="border-t border-[#f4ebe4] pt-5">
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <Ticket size={16} className="text-[#ED4672]" />
                              <p className="text-sm font-bold text-gray-900">{t('loyaltyCard')}:</p>
                              <p className="text-sm font-medium text-gray-600">
                                {hasLoyaltyCard ? loyaltyCode : t('membershipRequest')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[28px] border border-[#efe4dd] bg-white p-6 shadow-sm">
                        <h4 className="text-lg font-black text-gray-900">{bookingCopy.afterSubmitTitle}</h4>
                        <div className="mt-4 space-y-3">
                          {bookingCopy.afterSubmitSteps.map(stepText => (
                            <div
                              key={stepText}
                              className={`flex items-start gap-3 rounded-[22px] bg-[#faf4ef] px-4 py-3 ${
                                isRtl ? 'flex-row-reverse text-right' : ''
                              }`}
                            >
                              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#ED4672] shrink-0">
                                <CheckCircle size={14} />
                              </div>
                              <p className="text-sm font-medium leading-6 text-gray-600">{stepText}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`rounded-[28px] border border-amber-200 bg-amber-50 p-5 ${isRtl ? 'text-right' : ''}`}>
                        <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-amber-500 shrink-0">
                            <Zap size={18} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-amber-900">{t('beforeYouArrive')}</h4>
                            <p className="mt-2 text-sm font-medium leading-6 text-amber-800">
                              {t('cleanHairInstruction')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <a
                        href={t('whatsappLink')}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111015] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a161d] ${
                          isRtl ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Phone size={16} />
                        {bookingCopy.whatsappCta}
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 hidden rounded-[28px] border border-[#efe4dd] bg-white/88 p-4 lg:block">
              {actionBar}
            </div>
          </div>

          <aside className="hidden self-start space-y-4 lg:sticky lg:top-24 lg:block">
            <div className="rounded-[30px] bg-[#111015] p-6 text-white shadow-[0_24px_60px_rgba(17,16,21,0.2)]">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                {bookingCopy.summaryLabel}
              </p>
              <h3 className="mt-2 text-2xl font-black">{bookingCopy.summaryTitle}</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-white/65">
                {bookingCopy.summaryText}
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-[22px] bg-white/8 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                    {t('services')}
                  </p>
                  <p className="mt-1 font-bold text-white">
                    {selectedServiceDetails.length > 0
                      ? `${selectedServiceDetails.length} ${t('items')}`
                      : bookingCopy.notSelected}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white/8 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                    {t('date')}
                  </p>
                  <p className="mt-1 font-bold text-white">{selectedDateLabel}</p>
                </div>
                <div className="rounded-[22px] bg-white/8 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                    {t('time')}
                  </p>
                  <p className="mt-1 font-bold text-white">{selectedTimeLabel}</p>
                </div>
                <div className="rounded-[22px] bg-white/8 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                    {t('hairType')}
                  </p>
                  <p className="mt-1 font-bold text-white">{selectedHairLabel}</p>
                </div>
                <div className="rounded-[22px] bg-white/8 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                    {t('personalDetails')}
                  </p>
                  <p className="mt-1 font-bold text-white">{selectedClientLabel}</p>
                  <p className="mt-1 text-xs font-medium text-white/55">{selectedPhoneLabel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#efe4dd] bg-white p-5 shadow-sm">
              <h4 className="text-lg font-black text-gray-900">{t('services')}</h4>
              {selectedServiceDetails.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {selectedServiceDetails.map(service => (
                    <div
                      key={service.id}
                      className={`flex items-center justify-between gap-4 rounded-[22px] bg-[#faf4ef] px-4 py-3 ${
                        isRtl ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={isRtl ? 'text-right' : ''}>
                        <p className="font-bold text-gray-900">
                          {getServiceDisplayName(service, language)}
                        </p>
                        <p className="mt-1 text-xs font-medium text-gray-400">
                          {service.durationMinutes} {t('minutes')}
                        </p>
                      </div>
                      <p className="text-sm font-black text-[#ED4672]">
                        {getServiceDisplayPrice(service)} {t('ils')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm font-medium leading-6 text-gray-500">
                  {bookingCopy.summaryEmpty}
                </p>
              )}
            </div>

            <div className="rounded-[28px] border border-[#efe4dd] bg-white p-5 shadow-sm">
              <h4 className="text-lg font-black text-gray-900">{bookingCopy.helpTitle}</h4>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                {bookingCopy.helpText}
              </p>
              <a
                href={t('whatsappLink')}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111015] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a161d] ${
                  isRtl ? 'flex-row-reverse' : ''
                }`}
              >
                <Phone size={16} />
                {bookingCopy.whatsappCta}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#eaded6] bg-white/96 backdrop-blur-2xl shadow-[0_-14px_40px_rgba(29,22,19,0.08)] lg:hidden">
        <div className="mx-auto max-w-6xl px-4 py-4">{actionBar}</div>
      </div>
    </div>
  );
};
