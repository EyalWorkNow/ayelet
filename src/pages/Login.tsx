import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail, Phone, User } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../components/Toast';
import { BrandLockup } from '../components/BrandLogo';

const ADMIN_EMAILS = ['admin@admin.com', 'eyalatiyawork@gmail.com', 'admin@ayala.com'];
const DEMO_ADMIN_EMAIL = 'admin@ayala.com';
const DEMO_ADMIN_PASSWORD = '123123';

type ClientMode = 'signin' | 'signup';
type SurfaceMode = 'client' | 'admin';
type LoginRouteState = {
  from?: string;
  mode?: SurfaceMode;
  forwardState?: unknown;
} | null;

export const Login: React.FC = () => {
  const { dir, language, t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as LoginRouteState;
  const initialSurfaceMode = routeState?.mode === 'admin' ? 'admin' : 'client';

  const [surfaceMode, setSurfaceMode] = useState<SurfaceMode>(initialSurfaceMode);
  const [clientMode, setClientMode] = useState<ClientMode>('signin');
  const [clientName, setClientName] = useState(localStorage.getItem('clientName') || '');
  const [clientPhone, setClientPhone] = useState(localStorage.getItem('clientPhone') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRtl = dir === 'rtl';

  const clientCopy = useMemo(
    () =>
      language === 'en'
        ? {
            badge: 'Customer access',
            title: 'Login or create a simple account',
            subtitle: 'Enter with name and phone to continue to booking.',
            signin: 'Login',
            signup: 'Create account',
            nameLabel: 'Full name',
            phoneLabel: 'Phone number',
            namePlaceholder: 'Yuval Dayan',
            phonePlaceholder: '050-1234567',
            submitSignin: 'Continue',
            submitSignup: 'Register and continue',
            adminToggle: 'Admin login',
            adminHint: 'Business owner only',
            validation: 'Enter a full name and a valid phone number.',
            successSignin: 'Logged in successfully.',
            successSignup: 'Account created successfully.',
          }
        : {
            badge: 'כניסה ללקוחות',
            title: 'כניסה או הרשמה בסיסית',
            subtitle: 'מזינים שם וטלפון וממשיכים ישירות לקביעת תור.',
            signin: 'כניסה',
            signup: 'הרשמה',
            nameLabel: 'שם מלא',
            phoneLabel: 'טלפון',
            namePlaceholder: 'יובל דיין',
            phonePlaceholder: '050-1234567',
            submitSignin: 'להמשיך',
            submitSignup: 'להירשם ולהמשיך',
            adminToggle: 'כניסת אדמין',
            adminHint: 'לבעלת העסק בלבד',
            validation: 'יש להזין שם מלא וטלפון תקין.',
            successSignin: 'נכנסת בהצלחה.',
            successSignup: 'ההרשמה הושלמה בהצלחה.',
          },
    [language]
  );

  const adminCopy = useMemo(
    () =>
      language === 'en'
        ? {
            badge: 'Admin access',
            title: 'Admin login',
            subtitle: 'Use Firebase credentials or the local demo admin.',
            emailLabel: 'Email',
            passwordLabel: 'Password',
            submit: 'Enter admin',
            google: 'Continue with Google',
            clientToggle: 'Back to customer login',
            demo: 'Autofill demo admin',
            invalid: 'Invalid email or password',
            success: 'Admin access enabled.',
          }
        : {
            badge: 'כניסת אדמין',
            title: 'כניסה לאדמין',
            subtitle: 'אפשר להיכנס עם Firebase או עם משתמש הדמו המקומי.',
            emailLabel: 'אימייל',
            passwordLabel: 'סיסמה',
            submit: 'כניסה לאדמין',
            google: 'כניסה עם Google',
            clientToggle: 'חזרה לכניסת לקוחה',
            demo: 'מילוי אוטומטי למשתמש דמו',
            invalid: 'אימייל או סיסמה לא נכונים',
            success: 'גישת אדמין הופעלה.',
          },
    [language]
  );

  const setAccess = (access: SurfaceMode) => {
    localStorage.setItem('studioAccess', access);
    window.dispatchEvent(new Event('studio-access-changed'));
  };

  const navigateAfterLogin = (fallback: string) => {
    navigate(routeState?.from && routeState.from !== '/login' ? routeState.from : fallback, {
      replace: true,
      state: routeState?.forwardState ?? undefined,
    });
  };

  const handleClientSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!clientName.trim() || clientPhone.trim().length < 7) {
      setError(clientCopy.validation);
      return;
    }

    localStorage.setItem('clientName', clientName.trim());
    localStorage.setItem('clientPhone', clientPhone.trim());
    setAccess('client');
    showToast(clientMode === 'signup' ? clientCopy.successSignup : clientCopy.successSignin, 'success');
    navigateAfterLogin('/');
  };

  const handleAdminSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!ADMIN_EMAILS.includes(credential.user.email || '')) {
        throw new Error('not-admin');
      }
      setAccess('admin');
      showToast(t('loginSuccess'), 'success');
      navigateAfterLogin('/admin');
    } catch {
      if (email.trim().toLowerCase() === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
        setAccess('admin');
        localStorage.setItem('adminEmail', DEMO_ADMIN_EMAIL);
        showToast(adminCopy.success, 'success');
        navigateAfterLogin('/admin');
      } else {
        setError(adminCopy.invalid);
        showToast(adminCopy.invalid, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      if (!ADMIN_EMAILS.includes(credential.user.email || '')) {
        throw new Error('not-admin');
      }
      setAccess('admin');
      showToast(t('loginSuccess'), 'success');
      navigateAfterLogin('/admin');
    } catch {
      setError(t('loginError'));
      showToast(t('loginError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#f7efe9] px-4 py-8">
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#ED4672]/12 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#1f2937]/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-white/70 bg-white/95 shadow-[0_24px_80px_rgba(38,24,21,0.14)] backdrop-blur"
      >
        <div className={`p-6 sm:p-8 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="mb-8">
            <BrandLockup
              tone="dark"
              className={`mb-5 ${isRtl ? 'flex-row-reverse' : ''}`}
              markFrameClassName="h-14 w-14 rounded-2xl bg-[#f7efe9] ring-1 ring-[#ead9d0]"
              markClassName="h-9 w-9"
              titleClassName="font-black text-xl leading-none tracking-tight text-gray-950"
              subtitleClassName="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#ED4672]"
            />
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#ED4672]">
              {surfaceMode === 'client' ? clientCopy.badge : adminCopy.badge}
            </p>
            <h1 className="mt-3 text-3xl font-black text-gray-900">
              {surfaceMode === 'client' ? clientCopy.title : adminCopy.title}
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
              {surfaceMode === 'client' ? clientCopy.subtitle : adminCopy.subtitle}
            </p>
          </div>

          {error && (
            <div
              className={`mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700 ${
                isRtl ? 'flex-row-reverse' : ''
              }`}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {surfaceMode === 'client' ? (
            <>
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-[#f7efe9] p-1.5">
                {[
                  { id: 'signin' as const, label: clientCopy.signin },
                  { id: 'signup' as const, label: clientCopy.signup },
                ].map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setClientMode(option.id);
                      setError('');
                    }}
                    className={`rounded-full px-4 py-3 text-sm font-black transition-all ${
                      clientMode === option.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleClientSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                    {clientCopy.nameLabel}
                  </span>
                  <div className="relative">
                    <User
                      size={18}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`}
                    />
                    <input
                      value={clientName}
                      onChange={event => setClientName(event.target.value)}
                      placeholder={clientCopy.namePlaceholder}
                      className={`w-full rounded-2xl border-2 border-transparent bg-[#f7f1ed] py-4 text-sm font-bold outline-none transition focus:border-[#ED4672] focus:bg-white ${
                        isRtl ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'
                      }`}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                    {clientCopy.phoneLabel}
                  </span>
                  <div className="relative">
                    <Phone
                      size={18}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`}
                    />
                    <input
                      value={clientPhone}
                      onChange={event => setClientPhone(event.target.value)}
                      dir="ltr"
                      inputMode="tel"
                      placeholder={clientCopy.phonePlaceholder}
                      className={`w-full rounded-2xl border-2 border-transparent bg-[#f7f1ed] py-4 text-sm font-bold outline-none transition focus:border-[#ED4672] focus:bg-white ${
                        isRtl ? 'pr-12 pl-4 text-left' : 'pl-12 pr-4'
                      }`}
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ED4672] px-6 py-4 text-base font-black text-white shadow-lg shadow-[#ED4672]/20"
                >
                  <LogIn size={18} />
                  {clientMode === 'signup' ? clientCopy.submitSignup : clientCopy.submitSignin}
                </button>
              </form>

              <div className="mt-8 border-t border-[#f0e3db] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setSurfaceMode('admin');
                    setError('');
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border border-[#ead9d0] bg-[#fff8f4] px-4 py-4 text-sm font-black text-gray-800 ${
                    isRtl ? 'flex-row-reverse' : ''
                  }`}
                >
                  <span className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <Lock size={18} className="text-[#ED4672]" />
                    {clientCopy.adminToggle}
                  </span>
                  <span className="text-xs font-bold text-gray-400">{clientCopy.adminHint}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(DEMO_ADMIN_EMAIL);
                    setPassword(DEMO_ADMIN_PASSWORD);
                    setError('');
                  }}
                  className="w-full rounded-2xl border border-[#f0dfd6] bg-[#fff8f4] px-4 py-3 text-sm font-black text-[#ED4672]"
                >
                  {adminCopy.demo}
                </button>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                    {adminCopy.emailLabel}
                  </span>
                  <div className="relative">
                    <Mail
                      size={18}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      dir="ltr"
                      placeholder={DEMO_ADMIN_EMAIL}
                      className={`w-full rounded-2xl border-2 border-transparent bg-[#f7f1ed] py-4 text-sm font-bold outline-none transition focus:border-[#ED4672] focus:bg-white ${
                        isRtl ? 'pr-12 pl-4 text-left' : 'pl-12 pr-4'
                      }`}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                    {adminCopy.passwordLabel}
                  </span>
                  <div className="relative">
                    <Lock
                      size={18}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      dir="ltr"
                      placeholder={DEMO_ADMIN_PASSWORD}
                      className={`w-full rounded-2xl border-2 border-transparent bg-[#f7f1ed] py-4 text-sm font-bold outline-none transition focus:border-[#ED4672] focus:bg-white ${
                        isRtl ? 'pr-12 pl-12 text-left' : 'pl-12 pr-12'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(current => !current)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'left-4' : 'right-4'}`}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-base font-black text-white shadow-lg disabled:opacity-50"
                >
                  {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <LogIn size={18} />}
                  {adminCopy.submit}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-6 py-4 text-sm font-black text-gray-700 disabled:opacity-50"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  {adminCopy.google}
                </button>
              </form>

              <div className="mt-8 border-t border-[#f0e3db] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setSurfaceMode('client');
                    setError('');
                  }}
                  className="w-full text-sm font-black text-[#ED4672]"
                >
                  {adminCopy.clientToggle}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
