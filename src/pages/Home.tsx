import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, Search, SlidersHorizontal, Plus, Star, Clock, ChevronRight, ArrowUpRight, CheckCircle } from 'lucide-react';
import { getServiceDisplayPrice } from '../utils/serviceDisplay';
import { useToast } from '../components/Toast';
import { galleryImages, getServiceLocalImage } from '../utils/galleryImages';

const heroImage = new URL('../../img/WhatsApp Image 2026-05-20 at 22.16.26.jpeg', import.meta.url).href;

export const Home: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('lastBooking');
    const name = localStorage.getItem('clientName');
    const count = parseInt(localStorage.getItem('bookingCount') || '0', 10);
    if (saved) {
      try { setLastBooking(JSON.parse(saved)); } catch {}
    }
    if (name) setClientName(name);
    setBookingCount(count);
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const services = [
    {
      id: 'haircut_styling',
      nameEn: 'Haircut + Styling',
      nameHe: 'תספורת + עיצוב',
      price: 200,
      image: getServiceLocalImage('haircut_styling'),
    },
    {
      id: 'natural_highlights',
      nameEn: 'Natural Highlights',
      nameHe: 'גוונים טבעיים',
      price: 500,
      image: getServiceLocalImage('natural_highlights'),
    },
    {
      id: 'diffuser_styling',
      nameEn: 'Natural Event Styling',
      nameHe: 'עיצוב טבעי לאירוע',
      price: 200,
      image: getServiceLocalImage('diffuser_styling'),
    },
  ];

  const handleServiceClick = (serviceId: string) => {
    if (serviceId === 'natural_highlights') {
      window.open(t('whatsappLink'), '_blank');
      showToast(t('highlightsWhatsApp'), 'info');
      return;
    }
    navigate('/book', { state: { initialService: serviceId } });
  };

  const isRtl = dir === 'rtl';
  const bookingFlowCopy =
    language === 'en'
      ? {
          label: 'Booking flow',
          title: 'Book in a cleaner, guided flow.',
          subtitle:
            'Choose the visit, see live availability, and finish with a confirmation screen that keeps everything clear.',
          steps: [
            'Choose one or more services',
            'Keep a real date and time',
            'Review everything before sending',
          ],
          primaryCta: 'Start booking',
          secondaryCta: 'Repeat a similar visit',
          loyaltyCta: 'Visits completed',
        }
      : {
          label: 'תהליך קביעת תור',
          title: 'קביעת תור ב-flow נקי ומודרך.',
          subtitle:
            'בוחרות ביקור, רואות זמינות אמיתית, ומסיימות עם מסך אישור שמחזיק את כל הפרטים בצורה ברורה.',
          steps: [
            'בחירת שירות אחד או יותר',
            'שמירת תאריך ושעה אמיתיים',
            'בדיקה לפני שליחת הבקשה',
          ],
          primaryCta: 'להתחיל לקבוע תור',
          secondaryCta: 'לקביעת ביקור דומה',
          loyaltyCta: 'ביקורים שבוצעו',
        };

  return (
    <div className="flex-1 flex flex-col bg-[#fcf9f8] text-gray-900 min-h-screen relative overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative">

        {/* ── Mobile: Full-bleed image hero ── */}
        <div className="lg:hidden relative overflow-hidden" style={{ height: '63vh', minHeight: 460 }}>
          <img
            src={heroImage}
            alt="Ayelet Netanel Studio"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0610]/96 via-[#0e0610]/45 to-transparent" />

          {/* greeting row (top) */}
          <div className={`absolute top-3 left-0 right-0 flex items-center justify-between px-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80"
                alt=""
                aria-hidden="true"
                className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-md"
              />
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-none">
                  {getTimeGreeting()}
                </p>
                <p className="text-white font-black text-[15px] leading-tight mt-0.5">
                  {clientName || (language === 'en' ? 'Guest' : 'אורחת')}
                </p>
              </div>
            </div>
            <button
              aria-label="התראות"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Bell size={18} />
            </button>
          </div>

          {/* headline + CTA (bottom overlay) */}
          <div className={`absolute bottom-0 left-0 right-0 px-5 pb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-3 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#ED4672] text-white"
            >
              {t('professionalStudio')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-[2.65rem] font-black text-white leading-[1.04] tracking-tight mb-5"
            >
              {language === 'en' ? (
                <>Elevate<br />Your <span className="text-[#ED4672]">Style.</span></>
              ) : (
                <>שדרגי את<br /><span className="text-[#ED4672]">המראה שלך.</span></>
              )}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              <Link
                to="/book"
                className="flex-1 bg-[#ED4672] text-white text-center py-4 rounded-2xl font-black text-base shadow-xl shadow-[#ED4672]/35 hover:bg-[#d63d63] transition-colors active:scale-[0.98]"
              >
                {t('bookNow')}
              </Link>
              <Link
                to="/services"
                aria-label={t('viewAllServices')}
                className="w-[54px] h-[54px] flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 transition-colors shrink-0"
              >
                <ArrowUpRight size={20} />
              </Link>
            </motion.div>

            {/* mini stats bar */}
            <div className={`flex items-center gap-5 mt-5 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
              {[
                { value: '500+', label: t('happyClients') },
                { value: '8+', label: t('yearsExperience') },
                { value: '★ 4.9', label: t('serviceRating') },
              ].map((s, i) => (
                <div key={i} className={isRtl ? 'text-right' : 'text-left'}>
                  <p className="text-white font-black text-sm leading-none">{s.value}</p>
                  <p className="text-white/40 text-[10px] font-bold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop: Split layout ── */}
        <div className={`hidden lg:flex px-8 py-16 items-center gap-16 max-w-7xl mx-auto ${isRtl ? 'flex-row-reverse' : ''}`}>
          {/* text */}
          <div className="flex-1 space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 bg-[#ED4672]/10 text-[#ED4672] rounded-full text-sm font-bold uppercase tracking-widest"
            >
              {t('professionalStudio')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className={`text-6xl xl:text-[5.2rem] font-black leading-[1.03] tracking-tight ${isRtl ? 'text-right' : 'text-left'}`}
            >
              {language === 'en' ? (
                <>Elevate Your<br />Style with{' '}
                  <span className="text-[#ED4672]">Ayelet</span>
                </>
              ) : (
                <>שדרגי את<br />המראה שלך עם{' '}
                  <span className="text-[#ED4672]">אילת</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-lg text-gray-500 font-medium max-w-lg leading-relaxed"
            >
              {t('heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              <Link
                to="/book"
                className="bg-gray-900 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:scale-[1.03] active:scale-[0.97]"
              >
                {t('bookNow')}
              </Link>
              <Link
                to="/services"
                className="bg-white text-gray-900 border-2 border-gray-200 px-10 py-5 rounded-full font-bold text-lg hover:border-gray-300 transition-all"
              >
                {t('viewAllServices')}
              </Link>
            </motion.div>

            <div className={`flex items-center gap-10 pt-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {[
                { value: '500+', label: t('happyClients') },
                { value: '8+', label: t('yearsExperience') },
                { value: '4.9★', label: t('serviceRating') },
              ].map((s, i) => (
                <div key={i} className={isRtl ? 'text-right' : 'text-left'}>
                  <p className="text-3xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 80 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
              <img
                src={heroImage}
                alt="Ayelet Netanel Studio"
                className="w-full h-[580px] object-cover"
              />
            </div>
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-[#ED4672]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-[#FF99B7]/10 rounded-full blur-3xl -z-10" />
            {/* floating rating badge */}
            <motion.div
              initial={{ opacity: 0, x: -16, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`absolute ${isRtl ? '-right-6' : '-left-6'} bottom-20 bg-white rounded-[22px] p-4 shadow-2xl flex items-center gap-3 border border-gray-100`}
            >
              <div className="w-11 h-11 rounded-xl bg-[#FFB400]/10 flex items-center justify-center shrink-0">
                <Star size={20} className="text-[#FFB400] fill-[#FFB400]" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm leading-none">4.9 / 5</p>
                <p className="text-xs font-bold text-gray-400 mt-1">128+ {t('reviews')}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="px-5 md:px-8 space-y-10 pt-7 pb-4">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]"
        >
          <div className="rounded-[32px] bg-[#111015] p-6 text-white shadow-[0_24px_60px_rgba(17,16,21,0.18)]">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
              {bookingFlowCopy.label}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
              {bookingFlowCopy.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/70">
              {bookingFlowCopy.subtitle}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {bookingFlowCopy.steps.map((step, index) => (
                <div key={step} className="rounded-[24px] bg-white/8 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
                    0{index + 1}
                  </p>
                  <p className="mt-3 text-sm font-bold leading-6 text-white">{step}</p>
                </div>
              ))}
            </div>

            <div className={`mt-6 flex flex-wrap gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Link
                to="/book"
                className={`inline-flex items-center gap-2 rounded-full bg-[#ED4672] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#ED4672]/20 transition-colors hover:bg-[#d83f68] ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                {bookingFlowCopy.primaryCta}
                {isRtl ? <ChevronRight size={16} /> : <ArrowUpRight size={16} />}
              </Link>

              {lastBooking && (
                <Link
                  to="/book"
                  state={{ rebook: lastBooking }}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/12 ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                  {bookingFlowCopy.secondaryCta}
                  {isRtl ? <ChevronRight size={16} /> : <ArrowUpRight size={16} />}
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                {bookingFlowCopy.loyaltyCta}
              </p>
              <div className={`mt-3 flex items-end justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-3xl font-black text-gray-900">{bookingCount}</p>
                  <p className="mt-1 text-sm font-medium text-gray-500">{t('loyaltyCard')}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f6] text-[#ED4672]">
                  <CheckCircle size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium leading-6 text-gray-500">
                {t('haircutDiscountPromo')}
              </p>
            </div>

            <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm">
              <div className={`flex items-center justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                    {language === 'en' ? 'Returning guest' : 'ביקור חוזר'}
                  </p>
                  <p className="mt-2 text-xl font-black text-gray-900">
                    {clientName || (language === 'en' ? 'Welcome back' : 'שמחות שחזרת')}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf4ef] text-gray-600">
                  <Clock size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium leading-6 text-gray-500">
                {lastBooking
                  ? language === 'en'
                    ? 'Your previous selection can be reopened from the quick action in the booking strip.'
                    : 'אפשר לפתוח מחדש את הבחירה הקודמת שלך מכפתור הפעולה המהירה שבפס ההזמנה.'
                  : language === 'en'
                    ? 'Once you finish a booking, this area will help you jump back into a similar visit faster.'
                    : 'אחרי שתקבעי תור, האזור הזה יעזור לך לחזור מהר יותר לביקור דומה.'}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Mobile search bar ── */}
        <div className="md:hidden flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`}
            />
            <input
              type="text"
              placeholder={t('searchServices')}
              className={`w-full bg-white rounded-2xl py-3.5 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ED4672]/30 shadow-sm border border-gray-100`}
            />
          </div>
          <button
            aria-label="סינון שירותים"
            className="w-[52px] h-[52px] rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0 cursor-pointer"
          >
            <SlidersHorizontal size={19} />
          </button>
        </div>

        {/* ── Mobile promo banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden relative rounded-[28px] overflow-hidden"
          style={{ minHeight: 168 }}
        >
          <img
            src={galleryImages.find(img => img.id === 'voluminous_diffuser_curly')?.src || ''}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/93 to-gray-900/20" />
          <div className={`relative p-6 z-10 ${isRtl ? 'text-right' : ''}`}>
            <p className="text-[#ED4672] text-[10px] font-black uppercase tracking-widest mb-2">
              {t('professionalStudio')}
            </p>
            <h2
              className="text-xl font-black text-white mb-1 leading-snug"
              style={{ maxWidth: '62%' }}
            >
              {t('promoTitle')}
            </h2>
            <p className="text-white/45 text-xs font-medium mb-5">Ayelet Netanel Studio</p>
            <Link
              to="/book"
              className={`inline-flex items-center gap-2 bg-[#ED4672] text-white font-bold py-3 px-6 rounded-full text-sm shadow-lg shadow-[#ED4672]/30 hover:bg-[#d63d63] transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              {t('bookNow')} <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* ── Loyalty + Next booking ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] p-7 shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-36 h-36 bg-[#FF99B7]/5 ${isRtl ? 'rounded-br-full' : 'rounded-bl-full'}`} />
            <div className="relative z-10">
              <div className={`flex justify-between items-center mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <h3 className={`text-xl font-black text-gray-900 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Star size={21} className="text-[#FFB400] fill-[#FFB400]" />
                  {t('loyaltyCardTitle')}
                </h3>
                <span className="text-sm font-bold text-[#ED4672] bg-[#FF99B7]/15 px-3.5 py-1.5 rounded-full shrink-0">
                  {bookingCount}/4 {t('visitsCount')}
                </span>
              </div>
              <div className="flex gap-2 mb-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2.5 rounded-full transition-all duration-700 ${
                      i < bookingCount
                        ? 'bg-gradient-to-r from-[#FF8A00] to-[#ED4672]'
                        : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">{t('haircutDiscountPromo')}</p>
            </div>
          </motion.div>

          {lastBooking ? (
            <motion.div
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`hidden lg:flex bg-gray-900 rounded-[32px] p-7 text-white relative overflow-hidden items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <p className="text-[#ED4672] font-black uppercase tracking-widest text-xs mb-2">{t('yourNextVisit')}</p>
                <h3 className="text-3xl font-black">{lastBooking.date}</h3>
                <p className="text-gray-400 font-medium text-sm mt-1">
                  {lastBooking.startTime} • {lastBooking.services?.join(', ')}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                <Clock size={30} className="text-[#ED4672]" />
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#ED4672]/5 rounded-full" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex bg-[#ED4672]/5 border-2 border-dashed border-[#ED4672]/20 rounded-[32px] p-7 items-center justify-center cursor-pointer hover:bg-[#ED4672]/8 transition-colors"
              onClick={() => navigate('/book')}
            >
              <div className="flex flex-col items-center gap-3 text-[#ED4672]">
                <div className="w-14 h-14 rounded-2xl bg-[#ED4672]/10 flex items-center justify-center">
                  <Plus size={26} strokeWidth={2.5} />
                </div>
                <p className="font-black text-sm">{t('bookNow')}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Featured Services — dark image-overlay cards ── */}
        <div className="space-y-5 pb-10">
          <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h3 className="text-2xl font-black text-gray-900">{t('featuredServices')}</h3>
            <button
              onClick={() => navigate('/services')}
              className={`flex items-center gap-1 text-sm font-bold text-[#ED4672] hover:opacity-75 transition-opacity cursor-pointer ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              {t('viewAllServices')} <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -7, transition: { duration: 0.22 } }}
                className="relative rounded-[28px] overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-shadow duration-500"
                style={{ aspectRatio: '3 / 4' }}
                onClick={() => handleServiceClick(service.id)}
              >
                {/* image */}
                <img
                  src={service.image}
                  alt={language === 'en' ? service.nameEn : service.nameHe}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0508]/90 via-[#0d0508]/20 to-transparent" />

                {/* top badge */}
                <div
                  className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white/90 text-[11px] font-bold border border-white/15`}
                >
                  <Clock size={11} />
                  45 {t('minutes')}
                </div>

                {/* bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h4
                    className={`text-white font-black text-xl leading-tight mb-3 group-hover:text-[#FF99B7] transition-colors duration-300 ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    {language === 'en' ? service.nameEn : service.nameHe}
                  </h4>
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-1.5">
                      <Star size={12} className="text-[#FFB400] fill-[#FFB400]" />
                      <span className="text-white/75 text-sm font-bold">4.9</span>
                    </div>
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-white font-black text-xl ${isRtl ? 'text-right' : ''}`}>
                        {getServiceDisplayPrice(service)}
                        <span className="text-sm font-bold text-white/55 mr-0.5"> {t('ils')}</span>
                      </span>
                      <div className="w-10 h-10 rounded-full bg-[#ED4672] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <Plus size={18} strokeWidth={3} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Gallery Teaser ── */}
        <section className="space-y-5">
          <div className={`flex items-end justify-between gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <span className="inline-block px-3 py-1 bg-[#ED4672]/10 text-[#ED4672] text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
                {t('inspirationGallery')}
              </span>
              <h3 className="text-2xl font-black text-gray-900 font-display leading-tight">{t('galleryTeaserTitle')}</h3>
              <p className="text-gray-500 font-medium text-sm mt-1 max-w-xl leading-relaxed">
                {t('galleryTeaserDesc')}
              </p>
            </div>
            <button
              onClick={() => navigate('/gallery')}
              className={`hidden sm:flex items-center gap-1 text-sm font-bold text-[#ED4672] hover:opacity-75 transition-opacity cursor-pointer shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              {language === 'en' ? 'Explore full gallery' : 'לגלריה המלאה'} <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.filter(img => img.category !== 'studio').slice(0, 4).map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate('/gallery')}
                className="relative rounded-[24px] overflow-hidden aspect-[3/4] cursor-pointer group shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={image.src}
                  alt={language === 'en' ? image.titleEn : image.titleHe}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h4 className={`text-white text-xs font-black truncate ${isRtl ? 'text-right' : 'text-left'}`}>
                    {language === 'en' ? image.titleEn : image.titleHe}
                  </h4>
                  <p className={`text-white/60 text-[10px] font-bold mt-0.5 uppercase tracking-widest ${isRtl ? 'text-right' : 'text-left'}`}>
                    {language === 'en' ? image.category : (image.category === 'haircuts' ? 'תספורת' : image.category === 'colors' ? 'גוונים' : 'עיצוב')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="sm:hidden text-center pt-2">
            <button
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#ED4672] hover:opacity-75 transition-opacity"
            >
              {language === 'en' ? 'Explore full gallery' : 'לגלריה המלאה'} <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />
            </button>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="pb-14">
          <h3 className={`text-2xl font-black text-gray-900 mb-6 ${isRtl ? 'text-right' : ''}`}>{t('testimonials')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Sarah J.', initials: 'SJ', color: 'bg-[#ED4672]', rating: 5,
                text: language === 'en'
                  ? 'You were so attentive and patient with my hair challenges. Truly no one like you.'
                  : 'היית הכי קשובה וסבלנית לקשיים שלי עם השיער, אין עלייך בעולם!',
              },
              {
                name: 'Michal R.', initials: 'MR', color: 'bg-[#FF8A00]', rating: 5,
                text: language === 'en'
                  ? 'Golden hands. You understood exactly what I wanted.'
                  : 'יש לך ידי זהב, הבנת בדיוק מה רציתי',
              },
              {
                name: 'Dana L.', initials: 'DL', color: 'bg-gray-900', rating: 5,
                text: language === 'en'
                  ? 'I came in anxious and left so happy. You are the best.'
                  : 'באתי בחרדות על השיער ויצאתי כל כך מאושרת! הכי טובה!',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-7 rounded-[28px] shadow-sm border border-gray-100"
              >
                <div className={`flex items-center gap-3 mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-11 h-11 rounded-[14px] ${item.color} flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0`}
                  >
                    {item.initials}
                  </div>
                  <div className={isRtl ? 'text-right' : ''}>
                    <p className="font-black text-gray-900 text-sm">{item.name}</p>
                    <div className={`flex gap-0.5 mt-0.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      {Array.from({ length: item.rating }).map((_, j) => (
                        <Star key={j} size={11} className="text-[#FFB400] fill-[#FFB400]" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className={`text-gray-600 font-medium text-sm leading-relaxed italic ${isRtl ? 'text-right' : ''}`}>
                  "{item.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
