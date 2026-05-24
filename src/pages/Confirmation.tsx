import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { motion } from 'motion/react';
import {
  Check,
  Calendar,
  Clock,
  MapPin,
  Home,
  Scissors,
  Info,
  Phone,
  CheckCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { formatLocalizedDate } from '../utils/dateDisplay';

const parseBookingDate = (rawDate: unknown) => {
  if (!rawDate) {
    return null;
  }

  if (rawDate instanceof Date) {
    return rawDate;
  }

  if (typeof rawDate === 'string') {
    const parsed = new Date(rawDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof rawDate === 'object' && rawDate && 'toDate' in rawDate && typeof rawDate.toDate === 'function') {
    return rawDate.toDate();
  }

  return null;
};

export const Confirmation: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const location = useLocation();
  const booking = location.state?.booking;
  const isRtl = dir === 'rtl';

  const confirmationCopy =
    language === 'en'
      ? {
          title: 'Your appointment request is in.',
          subtitle:
            'The studio now has your selected services, your preferred time, and all the details you shared.',
          orderLabel: 'Booking ID',
          nextTitle: 'What happens next?',
          nextSteps: [
            'Your request is already tied to the slot you selected.',
            'If the studio needs clarification, it will contact the phone number you provided.',
            'You can use the WhatsApp button below if you want to add context or ask a follow-up question.',
          ],
          loyaltyTitle: 'Your loyalty progress',
          loyaltyText: 'Every confirmed visit keeps moving you toward the next benefit.',
          supportTitle: 'Before you arrive',
          supportText:
            'Bring any extra inspiration you want and arrive with clean, dry hair when possible.',
          whatsappCta: 'Send a WhatsApp message',
          rebookCta: 'Book a similar visit again',
          homeCta: 'Back to home',
          emptyTitle: 'No booking found here.',
          emptyText: 'The confirmation page needs a valid booking to display the appointment details.',
        }
      : {
          title: 'בקשת התור שלך נשלחה בהצלחה.',
          subtitle:
            'לסטודיו יש עכשיו את השירותים שבחרת, הזמן שביקשת וכל הפרטים שהשארת בדרך.',
          orderLabel: 'מספר הזמנה',
          nextTitle: 'מה קורה עכשיו?',
          nextSteps: [
            'הבקשה כבר משויכת למשבצת הזמן שבחרת.',
            'אם הסטודיו יצטרך הבהרה, ייצרו קשר עם מספר הטלפון שהשארת.',
            'אם תרצי להוסיף הקשר או לשאול משהו, אפשר להשתמש מיד בכפתור הוואטסאפ למטה.',
          ],
          loyaltyTitle: 'התקדמות במועדון',
          loyaltyText: 'כל ביקור מאושר מקרב אותך להטבה הבאה.',
          supportTitle: 'לפני שאת מגיעה',
          supportText:
            'אפשר להביא עוד השראה אם תרצי, ומומלץ להגיע עם שיער נקי ויבש כשזה מתאפשר.',
          whatsappCta: 'שליחת הודעת וואטסאפ',
          rebookCta: 'לקביעת ביקור דומה שוב',
          homeCta: 'חזרה לדף הבית',
          emptyTitle: 'לא נמצאה כאן הזמנה.',
          emptyText: 'כדי להציג את מסך האישור צריך להגיע אליו עם פרטי תור תקינים.',
        };

  const bookingDate = parseBookingDate(booking?.date);
  const bookingServices = Array.isArray(booking?.services) ? booking.services : [];
  const bookingCount = parseInt(localStorage.getItem('bookingCount') || '0', 10);
  const loyaltyTarget = 4;
  const loyaltyProgress = Math.min((bookingCount / loyaltyTarget) * 100, 100);
  const displayId = useMemo(
    () =>
      booking?.id
        ? booking.id.slice(-4).toUpperCase()
        : Math.floor(Math.random() * 9000 + 1000).toString(),
    [booking?.id]
  );

  if (!booking) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl rounded-[32px] border border-[#efe4dd] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-[#fff1f6] text-[#ED4672]">
            <Info size={28} />
          </div>
          <h2 className="mt-6 text-2xl font-black text-gray-900">{confirmationCopy.emptyTitle}</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-gray-500">{confirmationCopy.emptyText}</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#ED4672] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ED4672]/20 transition-colors hover:bg-[#d83f68]"
          >
            <Home size={16} />
            {confirmationCopy.homeCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f6f0eb] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="overflow-hidden rounded-[34px] bg-[#111015] text-white shadow-[0_28px_80px_rgba(18,13,20,0.18)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="relative overflow-hidden p-6 md:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(237,70,114,0.34),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,180,0,0.18),transparent_30%)]" />
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="flex h-22 w-22 items-center justify-center rounded-full bg-[#ED4672] text-white shadow-[0_0_30px_rgba(237,70,114,0.3)]"
                >
                  <Check size={44} strokeWidth={4} />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="mt-6 text-3xl font-black leading-tight sm:text-4xl"
                >
                  {confirmationCopy.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/70 sm:text-base"
                >
                  {confirmationCopy.subtitle}
                </motion.p>

                <div className={`mt-6 flex flex-wrap gap-2 ${isRtl ? 'justify-end' : ''}`}>
                  {[
                    bookingDate
                      ? formatLocalizedDate(bookingDate, language, {
                          includeWeekday: true,
                          includeYear: false,
                          monthStyle: 'short',
                        })
                      : t('date'),
                    booking.startTime || booking.time || t('time'),
                    `${booking.totalPrice ?? 0} ${t('ils')}`,
                  ].map(item => (
                    <span
                      key={item}
                      className="rounded-full border border-white/12 bg-white/8 px-3.5 py-2 text-xs font-bold text-white/85"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="flex h-full flex-col justify-between bg-white/6 p-6 backdrop-blur-xl">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                    {confirmationCopy.orderLabel}
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">#BK-{displayId}</p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[22px] bg-black/15 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                      {t('services')}
                    </p>
                    <p className="mt-1 font-bold text-white">
                      {bookingServices.length} {t('items')}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-black/15 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                      {t('location')}
                    </p>
                    <p className="mt-1 font-bold text-white">{t('addressFull')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-[32px] border border-[#efe4dd] bg-white shadow-sm">
            <div className="border-b border-[#f2e8e0] px-6 py-5">
              <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#ED4672]">
                    <Scissors size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{t('appointmentDetails')}</h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">{confirmationCopy.orderLabel}: #BK-{displayId}</p>
                  </div>
                </div>
                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                    {t('totalPrice')}
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#ED4672]">₪{booking.totalPrice ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#ED4672] shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">{t('date')}</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {bookingDate
                      ? formatLocalizedDate(bookingDate, language, {
                          includeWeekday: true,
                          includeYear: true,
                        })
                      : t('date')}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#faf4ef] text-gray-500 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">{t('time')}</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">{booking.startTime || booking.time || t('time')}</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#faf4ef] text-gray-500 shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">{t('location')}</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">{t('addressFull')}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-[#eee4dc] pt-5">
                <div className={`mb-3 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">{t('services')}</p>
                  <span className="rounded-full bg-[#faf4ef] px-3 py-1.5 text-xs font-bold text-gray-600">
                    {bookingServices.length} {t('items')}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {bookingServices.length > 0 ? (
                    bookingServices.map((serviceId: string, index: number) => (
                      <div
                        key={`${serviceId}-${index}`}
                        className={`flex items-center justify-between rounded-[22px] bg-[#faf4ef] px-4 py-3 ${
                          isRtl ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div>
                          <p className="font-bold text-gray-900">{serviceId}</p>
                          <p className="mt-1 text-xs font-medium text-gray-400">
                            {language === 'en' ? 'Selected service' : 'שירות שנבחר'}
                          </p>
                        </div>
                        <Sparkles size={16} className="text-[#ED4672]" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium leading-6 text-gray-500">
                      {language === 'en'
                        ? 'The booking was created successfully even though the service list was not attached to this confirmation snapshot.'
                        : 'התור נשמר בהצלחה גם אם רשימת השירותים לא צורפה למסך האישור הזה.'}
                    </p>
                  )}
                </div>
              </div>

              <div className={`flex items-center justify-between border-t border-[#f2e8e0] pt-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 text-gray-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <CheckCircle size={16} className="text-[#ED4672]" />
                  <span className="text-sm font-medium">{confirmationCopy.supportTitle}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{t('cleanHairInstruction')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[32px] border border-[#efe4dd] bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-black text-gray-900">{confirmationCopy.nextTitle}</h3>
              <div className="mt-4 space-y-3">
                {confirmationCopy.nextSteps.map(stepText => (
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="overflow-hidden rounded-[32px] bg-[#111015] p-6 text-white shadow-[0_24px_60px_rgba(17,16,21,0.2)]"
            >
              <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h3 className="text-xl font-black">{confirmationCopy.loyaltyTitle}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-white/65">
                    {confirmationCopy.loyaltyText}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                  {bookingCount}/{loyaltyTarget} {t('visits')}
                </span>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${loyaltyProgress}%` }}
                  transition={{ duration: 0.9, delay: 0.2 }}
                  className="h-full bg-[#ED4672]"
                />
              </div>

              <p className="mt-4 text-sm font-medium text-white/65">{t('haircutDiscountPromo')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-[32px] border border-amber-200 bg-amber-50 p-6"
            >
              <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-500 shrink-0">
                  <Info size={20} />
                </div>
                <div className={isRtl ? 'text-right' : ''}>
                  <h3 className="text-xl font-black text-amber-900">{confirmationCopy.supportTitle}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-amber-800">
                    {confirmationCopy.supportText}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={t('whatsappLink')}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#111015] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a161d] ${
                  isRtl ? 'flex-row-reverse' : ''
                }`}
              >
                <Phone size={16} />
                {confirmationCopy.whatsappCta}
              </a>

              <Link
                to="/book"
                state={{ rebook: { services: bookingServices, hairType: booking.hairType || '' } }}
                className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#e7d9d2] bg-white px-5 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-[#faf4ef] ${
                  isRtl ? 'flex-row-reverse' : ''
                }`}
              >
                {confirmationCopy.rebookCta}
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </Link>
            </div>

            <Link
              to="/"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ED4672] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#ED4672]/20 transition-colors hover:bg-[#d83f68] ${
                isRtl ? 'flex-row-reverse' : ''
              }`}
            >
              <Home size={16} />
              {confirmationCopy.homeCta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
