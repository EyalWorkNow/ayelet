import React from 'react';
import { BrowserRouter, Navigate, Outlet, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Book } from './pages/Book';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Confirmation } from './pages/Confirmation';
import { Gallery } from './pages/Gallery';

const hasSiteAccess = () =>
  localStorage.getItem('studioAccess') === 'client' ||
  localStorage.getItem('studioAccess') === 'admin';

const hasAdminAccess = () => localStorage.getItem('studioAccess') === 'admin';

const RequireBookingAccess: React.FC = () => {
  const location = useLocation();
  return hasSiteAccess() ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{
        from: `${location.pathname}${location.search}${location.hash}`,
        mode: 'client',
        forwardState: location.state ?? null,
      }}
    />
  );
};

const RequireAdmin: React.FC = () => {
  const location = useLocation();
  return hasAdminAccess() ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname, mode: 'admin' }} />
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="login" element={<Login />} />
                <Route index element={<Home />} />
                <Route path="services" element={<Services />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="contact" element={<Contact />} />
                <Route element={<RequireBookingAccess />}>
                  <Route path="book" element={<Book />} />
                  <Route path="confirmation" element={<Confirmation />} />
                </Route>
                <Route element={<RequireAdmin />}>
                  <Route path="admin/*" element={<Admin />} />
                </Route>
              </Route>
            </Routes>
          </ToastProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
