import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Instagram, Facebook, Clock, ExternalLink } from 'lucide-react';

export const Contact: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const isRtl = dir === 'rtl';

  const contactItems = [
    {
      icon: <MapPin size={20} />,
      label: t('address'),
      content: t('addressFull'),
      note: t('addressNote'),
      href: 'https://maps.google.com/?q=Ben+Gurion+10+Givat+Shmuel',
      color: 'bg-[#ED4672]/10 text-[#ED4672]',
    },
    {
      icon: <Phone size={20} />,
      label: t('phoneWhatsApp'),
      content: language === 'en' ? 'WhatsApp Message' : 'הודעת וואטסאפ',
      note: null,
      href: t('whatsappLink'),
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: <Mail size={20} />,
      label: t('email'),
      content: 'ayeletstudio@gmail.com',
      note: null,
      href: 'mailto:ayeletstudio@gmail.com',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <Clock size={20} />,
      label: t('openingHours'),
      content: language === 'en' ? 'Sun–Thu  10:00 – 20:00' : 'א׳–ה׳  10:00 – 20:00',
      note: language === 'en' ? 'By appointment only' : 'בתיאום מראש בלבד',
      href: null,
      color: 'bg-[#FFB400]/10 text-[#FFB400]',
    },
  ];

  return (
    <div className="flex-1 bg-[#fcf9f8] pb-10 text-gray-900 flex flex-col">

      {/* page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`px-6 pt-6 pb-8 ${isRtl ? 'text-right' : ''}`}
      >
        <span className="inline-block px-3 py-1 bg-[#ED4672]/10 text-[#ED4672] text-[11px] font-black uppercase tracking-widest rounded-full mb-3">
          {t('contact')}
        </span>
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t('contactTitle')}</h1>
        <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-sm">
          {language === 'en'
            ? "We'd love to hear from you. Reach out via any channel below."
            : 'נשמח לשמוע מכם. צרו קשר דרך כל אחד מהערוצים למטה.'}
        </p>
      </motion.div>

      <div className="px-6 flex flex-col gap-5">

        {/* contact cards */}
        <div className="grid grid-cols-1 gap-3">
          {contactItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                  className={`flex items-center gap-4 bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="font-bold text-gray-900 text-sm leading-snug truncate">{item.content}</p>
                    {item.note && (
                      <p className="text-[11px] text-[#ED4672] font-bold mt-0.5 bg-[#FF99B7]/15 inline-block px-2 py-0.5 rounded-full">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <ExternalLink size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </a>
              ) : (
                <div className={`flex items-center gap-4 bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="font-bold text-gray-900 text-sm leading-snug">{item.content}</p>
                    {item.note && (
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.note}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* social media */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className={`bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm ${isRtl ? 'text-right' : ''}`}
        >
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('followUs')}</p>
          <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <a
              href={t('instagramLink')}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743] text-white font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Instagram size={17} />
              Instagram
            </a>
            <a
              href={t('facebookLink')}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#1877F2] text-white font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Facebook size={17} />
              Facebook
            </a>
          </div>
        </motion.div>

        {/* map placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-[24px] overflow-hidden border border-gray-100 shadow-sm bg-white"
          style={{ minHeight: 200 }}
        >
          <a
            href="https://maps.google.com/?q=Ben+Gurion+10+Givat+Shmuel"
            target="_blank"
            rel="noreferrer"
            aria-label={language === 'en' ? 'Open in Google Maps' : 'פתח במפות גוגל'}
            className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-[#ED4672]/5 hover:to-[#FF99B7]/5 transition-all group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
              <MapPin size={26} className="text-[#ED4672]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-gray-600 group-hover:text-[#ED4672] transition-colors">
                {language === 'en' ? 'Open in Google Maps' : 'פתח במפות גוגל'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Ben Gurion 10, Givat Shmuel</p>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  );
};
