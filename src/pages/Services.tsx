import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion } from 'motion/react';
import { Plus, Clock } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Service } from '../types';
import { useNavigate } from 'react-router-dom';
import { getServiceDisplayName, getServiceDisplayPrice, normalizeServices } from '../utils/serviceDisplay';
import { useToast } from '../components/Toast';
import { getServiceLocalImage } from '../utils/galleryImages';

export const Services: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!auth.currentUser) {
          setServices(normalizeServices([]));
          return;
        }

        const q = query(collection(db, 'services'), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        let fetchedServices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        
        setServices(normalizeServices(fetchedServices));
      } catch (error) {
        console.warn('Using default services catalog:', error);
        setServices(normalizeServices([]));
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Load local images for services catalog
  const getServiceImage = (id: string) => {
    return getServiceLocalImage(id);
  };

  const handleServiceBooking = (serviceId: string) => {
    if (serviceId === 'natural_highlights') {
      window.open(t('whatsappLink'), '_blank');
      showToast(t('highlightsWhatsApp'), 'info');
      return;
    }

    navigate('/book', { state: { initialService: serviceId } });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#fcf9f8]">
        <div className="w-8 h-8 border-4 border-[#ED4672] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#fcf9f8] px-4 py-5 text-gray-900 min-h-screen sm:px-6 md:py-8">
      <div className={`mb-5 rounded-[28px] bg-[#161116] px-5 py-6 text-white shadow-[0_20px_50px_rgba(22,17,22,0.14)] md:px-8 md:py-9 ${dir === 'rtl' ? 'text-right' : ''}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ffbfd0]">
          AYELET NETANEL
        </p>
        <h1 className="mt-2 text-2xl font-black md:text-4xl">{t('ourServices')}</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-white/66">{t('servicesDescription')}</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-3 pb-24 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => handleServiceBooking(service.id)}
            className="bg-white rounded-[22px] p-2.5 shadow-sm border border-gray-100 flex flex-col cursor-pointer md:rounded-[30px] md:p-4"
          >
            <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden mb-3 md:rounded-[24px] md:mb-4">
              <img
                src={getServiceImage(service.id)}
                alt={getServiceDisplayName(service, language)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className={dir === 'rtl' ? 'text-right' : ''}>
                  <h4 className="min-h-[2.5rem] text-sm font-black leading-tight text-gray-900 md:min-h-0 md:text-lg">
                    {getServiceDisplayName(service, language)}
                  </h4>
                  <div className={`mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-400 ${dir === 'rtl' ? 'justify-end' : ''}`}>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {service.durationMinutes} {t('minutes')}
                    </span>
                  </div>
                </div>

                <div className={`flex items-end justify-between gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-lg font-black text-gray-900 md:text-xl">
                    {getServiceDisplayPrice(service)}
                    <span className="ms-1 text-[11px] font-bold text-gray-400">{t('ils')}</span>
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); handleServiceBooking(service.id); }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-all hover:bg-gray-800 md:h-auto md:w-auto md:px-4 md:py-2.5 md:text-sm md:font-bold"
                    aria-label={t('bookNow')}
                  >
                    <Plus size={17} />
                    <span className="hidden md:inline">{t('bookNow')}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="font-bold">{t('noServicesFound')}</p>
        </div>
      )}
    </div>
  );
};
