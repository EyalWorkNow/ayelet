import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Search, Home, Calendar, Bell, Globe, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { BrandLockup } from './BrandLogo';

export const Layout: React.FC = () => {
  const { t, dir, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const refreshAdminState = (userEmail?: string | null) => {
      const adminEmails = ['admin@admin.com', 'eyalatiyawork@gmail.com', 'admin@ayala.com'];
      setIsAdmin(
        localStorage.getItem('studioAccess') === 'admin' ||
          (userEmail ? adminEmails.includes(userEmail) : false)
      );
    };

    refreshAdminState(auth.currentUser?.email);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      refreshAdminState(user?.email);
    });

    const handleAccessChange = () => refreshAdminState(auth.currentUser?.email);
    window.addEventListener('studio-access-changed', handleAccessChange);
    return () => {
      unsubscribe();
      window.removeEventListener('studio-access-changed', handleAccessChange);
    };
  }, []);

  const navLinks = [
    { name: t('home'), path: '/', icon: <Home size={22} /> },
    { name: t('services'), path: '/services', icon: <Search size={22} /> },
    { name: t('inspirationGallery'), path: '/gallery', icon: <Sparkles size={22} /> },
    { name: t('book'), path: '/book', icon: <Calendar size={22} /> },
  ];

  if (isAdmin) {
    navLinks.push({ name: t('admin'), path: '/admin', icon: <Lock size={22} /> });
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  const isBookingFlow =
    location.pathname.startsWith('/book') || location.pathname.startsWith('/confirmation');
  const isLoginPage = location.pathname.startsWith('/login');
  const hideShell = isBookingFlow || isLoginPage;

  return (
    <div className={`min-h-screen bg-[#fcf9f8] flex flex-col ${dir === 'rtl' ? 'rtl' : 'ltr'} text-gray-900 font-sans`}>
      {/* Desktop Header */}
      {!hideShell && <header className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="transition-transform hover:scale-[1.01]">
            <BrandLockup
              tone="dark"
              markFrameClassName="h-11 w-11 rounded-xl bg-[#f7efe9] ring-1 ring-[#ead9d0]"
              markClassName="h-7 w-7"
              titleClassName="font-black text-lg leading-none tracking-tight text-gray-950"
              subtitleClassName="text-[10px] font-bold text-[#ED4672] uppercase tracking-[0.2em]"
            />
          </Link>

          <nav className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold transition-colors ${
                    isActive ? 'text-[#ED4672]' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              aria-label={language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Globe size={16} />
              {language === 'en' ? 'עברית' : 'English'}
            </button>
            <Link 
              to="/book"
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-all shadow-md"
            >
              {t('bookNow')}
            </Link>
          </div>
        </div>
      </header>}

      {/* Mobile Top Bar */}
      {!hideShell && <header className="md:hidden sticky top-0 z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <BrandLockup
          tone="dark"
          markFrameClassName="h-10 w-10 rounded-xl bg-[#f7efe9] ring-1 ring-[#ead9d0]"
          markClassName="h-6 w-6"
          titleClassName="font-black text-lg leading-none tracking-tight text-gray-950"
          subtitleClassName="text-[10px] font-bold text-[#ED4672] uppercase tracking-[0.2em]"
        />
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Globe size={18} />
          </button>
          <button aria-label="התראות" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm relative">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ED4672] rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>}

      {/* Main Content */}
      <main
        className={`flex-grow flex flex-col relative w-full max-w-7xl mx-auto ${
          isBookingFlow ? 'pb-28 md:pb-12' : isLoginPage ? '' : 'pb-24 md:pb-12'
        }`}
      >
        <Outlet />
      </main>

      {/* Mobile Floating Bottom Navbar */}
      {!hideShell && (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-[#1a1a1a]/90 backdrop-blur-xl rounded-full p-2 flex items-center justify-between shadow-2xl z-[60] border border-white/10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center justify-center transition-all duration-500 ease-in-out ${
                  isActive ? 'bg-[#ED4672] text-white px-6 py-3 rounded-full shadow-lg' : 'text-gray-400 p-3 hover:text-white'
                }`}
              >
                {link.icon}
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                      animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                      exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                      className="font-bold text-sm overflow-hidden whitespace-nowrap"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#ED4672] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Footer */}
      {!hideShell && (
        <footer className="hidden md:block bg-white border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-12">
            <div className="col-span-2 space-y-6">
              <BrandLockup
                tone="dark"
                markFrameClassName="h-12 w-12 rounded-2xl bg-[#f7efe9] ring-1 ring-[#ead9d0]"
                markClassName="h-8 w-8"
                titleClassName="font-black text-lg leading-none tracking-tight text-gray-950"
                subtitleClassName="text-[10px] font-bold text-[#ED4672] uppercase tracking-[0.2em]"
              />
              <p className="text-gray-500 font-medium max-w-xs">
                {t('aboutText')}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">{t('navigation')}</h4>
              <nav className="flex flex-col gap-2">
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} className="text-sm font-bold text-gray-500 hover:text-[#ED4672] transition-colors">
                    {link.name}
                  </Link>
                ))}
                {!isAdmin && (
                  <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-[#ED4672] transition-colors">
                    {t('login')}
                  </Link>
                )}
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">{t('contact')}</h4>
              <div className="space-y-2 text-sm font-bold text-gray-500">
                <p>{t('address')}</p>
                <p>{t('addressNote')}</p>
                <p>WhatsApp Message</p>
                <p>ayeletstudio@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-50 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            © {new Date().getFullYear()} Ayelet Netanel Studio. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
};
