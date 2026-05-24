import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { galleryImages, GalleryImage } from '../utils/galleryImages';

export const Gallery: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const navigate = useNavigate();
  const isRtl = dir === 'rtl';

  const [activeFilter, setActiveFilter] = useState<'all' | 'haircuts' | 'colors' | 'styling' | 'treatments' | 'studio'>('all');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Filters list
  const filters = [
    { id: 'all' as const, label: t('filterAll') },
    { id: 'haircuts' as const, label: t('filterHaircuts') },
    { id: 'colors' as const, label: t('filterColors') },
    { id: 'styling' as const, label: t('filterCurly') },
    { id: 'treatments' as const, label: t('treatments') },
    { id: 'studio' as const, label: t('filterStudio') },
  ];

  // Filtered images
  const filteredImages = galleryImages.filter(
    (img) => activeFilter === 'all' || img.category === activeFilter
  );

  // Lightbox handlers
  const openLightbox = (imageIndex: number) => {
    // Find the index of the image in the current filtered set
    const imageInFiltered = filteredImages[imageIndex];
    // Find its index in the absolute galleryImages array
    const absoluteIndex = galleryImages.findIndex(img => img.id === imageInFiltered.id);
    setSelectedImageIndex(absoluteIndex !== -1 ? absoluteIndex : null);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    // We navigate within the currently filtered images list
    const currentImg = galleryImages[selectedImageIndex];
    const filteredIndex = filteredImages.findIndex(img => img.id === currentImg.id);
    
    if (filteredIndex === -1) return;

    let nextFilteredIndex = direction === 'next' ? filteredIndex + 1 : filteredIndex - 1;
    
    if (nextFilteredIndex >= filteredImages.length) {
      nextFilteredIndex = 0;
    } else if (nextFilteredIndex < 0) {
      nextFilteredIndex = filteredImages.length - 1;
    }

    const nextImg = filteredImages[nextFilteredIndex];
    const nextAbsoluteIndex = galleryImages.findIndex(img => img.id === nextImg.id);
    setSelectedImageIndex(nextAbsoluteIndex);
  }, [selectedImageIndex, filteredImages]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox(isRtl ? 'prev' : 'next');
      if (e.key === 'ArrowLeft') navigateLightbox(isRtl ? 'next' : 'prev');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, navigateLightbox, isRtl]);

  const handleInspirationBooking = (image: GalleryImage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (image.serviceId) {
      navigate('/book', { state: { initialService: image.serviceId } });
    } else {
      navigate('/book');
    }
  };

  const selectedImage = selectedImageIndex !== null ? galleryImages[selectedImageIndex] : null;

  return (
    <div className="flex-1 flex flex-col bg-[#fcf9f8] px-4 py-5 text-gray-900 min-h-screen sm:px-6 md:py-8">
      {/* Page Header */}
      <div className={`mb-6 rounded-[28px] bg-[#161116] px-5 py-6 text-white shadow-[0_20px_50px_rgba(22,17,22,0.14)] md:px-8 md:py-9 ${isRtl ? 'text-right' : ''}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ffbfd0]">
          {t('inspirationGallery')}
        </p>
        <h1 className="mt-2 text-2xl font-black md:text-4xl font-display">
          {language === 'en' ? 'Inspiration & Portfolio' : 'גלריית עבודות והשראה'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-white/70">
          {t('gallerySubtitle')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                closeLightbox();
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-[#ED4672] text-white shadow-md shadow-[#ED4672]/20 scale-[1.03]'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Image Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 pb-24"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => openLightbox(index)}
              className="group relative bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 aspect-[3/4] cursor-pointer hover:shadow-xl transition-all duration-500"
            >
              {/* Image element */}
              <img
                src={image.src}
                alt={language === 'en' ? image.titleEn : image.titleHe}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient cover overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5" />

              {/* Hover content info */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF99B7] bg-white/10 px-2 py-0.5 rounded-full self-start mb-2 backdrop-blur-sm">
                  {filters.find(f => f.id === image.category)?.label}
                </span>
                <h3 className={`text-white font-black text-lg leading-tight ${isRtl ? 'text-right' : ''}`}>
                  {language === 'en' ? image.titleEn : image.titleHe}
                </h3>
                <p className={`text-white/60 text-xs font-medium mt-1 mb-4 line-clamp-2 ${isRtl ? 'text-right' : ''}`}>
                  {language === 'en' ? image.descEn : image.descHe}
                </p>
                <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button className="flex-1 bg-white text-gray-900 rounded-xl py-2 px-3 text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                    <Maximize2 size={12} />
                    {t('viewFullscreen')}
                  </button>
                  {image.serviceId && (
                    <button
                      onClick={(e) => handleInspirationBooking(image, e)}
                      className="bg-[#ED4672] text-white p-2 rounded-xl hover:bg-[#d63d63] transition-colors shrink-0"
                      title={t('useAsInspiration')}
                    >
                      <Calendar size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
          <Sparkles size={40} className="text-gray-300 mb-3" />
          <p className="font-bold text-sm">{t('noImagesFound')}</p>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6"
          >
            {/* Top Bar Navigation */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[110]">
              <span className="text-white/50 text-xs font-bold">
                {filteredImages.findIndex(img => img.id === selectedImage.id) + 1} / {filteredImages.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Interactive Box */}
            <div className="relative flex flex-col md:flex-row items-center justify-center max-w-5xl w-full h-[80vh] gap-6" onClick={e => e.stopPropagation()}>
              {/* Left Navigation Arrow */}
              <button
                onClick={() => navigateLightbox('prev')}
                className="absolute left-2 md:-left-16 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col md:flex-row bg-[#111015] rounded-[32px] overflow-hidden h-full max-h-[600px] border border-white/10 shadow-2xl">
                {/* Photo container */}
                <div className="flex-[1.2] bg-black relative flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedImage.src}
                    alt={language === 'en' ? selectedImage.titleEn : selectedImage.titleHe}
                    className="w-full h-full object-contain max-h-[400px] md:max-h-full"
                  />
                </div>

                {/* Details side bar */}
                <div className={`flex-1 p-6 md:p-8 flex flex-col justify-between text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="space-y-4">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#FF99B7] bg-[#FF99B7]/10 px-3 py-1 rounded-full">
                      {filters.find(f => f.id === selectedImage.category)?.label}
                    </span>
                    <h2 className="text-2xl font-black font-display leading-tight">
                      {language === 'en' ? selectedImage.titleEn : selectedImage.titleHe}
                    </h2>
                    <p className="text-white/70 text-sm font-medium leading-relaxed">
                      {language === 'en' ? selectedImage.descEn : selectedImage.descHe}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-3">
                    {selectedImage.serviceId && (
                      <button
                        onClick={(e) => {
                          closeLightbox();
                          handleInspirationBooking(selectedImage, e);
                        }}
                        className="w-full bg-[#ED4672] text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#ED4672]/30 hover:bg-[#d63d63] transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Calendar size={18} />
                        {t('useAsInspiration')}
                      </button>
                    )}
                    <button
                      onClick={closeLightbox}
                      className="w-full bg-white/10 text-white hover:bg-white/15 py-4 rounded-2xl font-bold text-sm transition-colors cursor-pointer"
                    >
                      {language === 'en' ? 'Back to Gallery' : 'חזרה לגלריה'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Navigation Arrow */}
              <button
                onClick={() => navigateLightbox('next')}
                className="absolute right-2 md:-right-16 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
