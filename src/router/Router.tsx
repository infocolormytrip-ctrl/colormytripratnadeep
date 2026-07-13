import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider, useData } from '../context/DataContext';

// Layout
import PublicLayout from '../pages/PublicLayout';

// Public pages
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import PackagesPage from '../pages/PackagesPage';
import ContactPage from '../pages/ContactPage';
import BlogListPage from '../pages/BlogListPage';
import BlogDetailPage from '../pages/BlogDetailPage';
import SitemapPage from '../pages/SitemapPage';
import PackageRoute from '../pages/PackageRoute';
import NotFoundPage from '../pages/NotFoundPage';

// Admin / Affiliate (SPAs — outside the PublicLayout)
import AdminPage from '../pages/AdminPage';
import AffiliatePage from '../pages/AffiliatePage';
import AffiliateManagementPage from '../pages/AffiliateManagementPage';

// Misc
import BeautifulLoader from '../components/BeautifulLoader';
import RoleGuard from './RoleGuard';

function RouterInner() {
  const { role, isFirebaseActive, loading } = useData();
  const location = useLocation();

  // ── Auth loading states for protected routes ──
  if (loading) {
    if (location.pathname === '/admin' || location.pathname === '/admin/affiliates') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <BeautifulLoader
              message="Authenticating Admin Access"
              subMessage="Connecting to ColorMyTrip administrative database..."
              className="bg-slate-800 border-slate-700 text-white"
              isDark={true}
            />
          </div>
        </div>
      );
    }

    if (location.pathname === '/affiliate') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <BeautifulLoader
              message="Authenticating Affiliate Access"
              subMessage="Syncing your promotional dashboard and commissions..."
              className="bg-white shadow-xl border-slate-100"
            />
          </div>
        </div>
      );
    }
  }

  // ── Offline / local storage mode ──
  if (!isFirebaseActive) {
    return (
      <Routes>
        {/* Public routes with layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/package/:packageId" element={<PackageRoute />} />
        </Route>

        {/* Admin / Affiliate (no PublicLayout) */}
        <Route path="/admin" element={<AdminPage />} />
        {role === 'admin' && (
          <Route path="/admin/affiliates" element={<AffiliateManagementPage />} />
        )}
        <Route path="/affiliate" element={<AffiliatePage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  // ── Firebase active mode ──
  return (
    <Routes>
      {/* Public routes wrapped in PublicLayout (Navbar + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blogs/:slug" element={<BlogDetailPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/package/:packageId" element={<PackageRoute />} />
      </Route>

      {/* Admin SPA — outside PublicLayout */}
      <Route
        path="/admin"
        element={
          <RoleGuard role={role} allowed={['admin', 'public']}>
            <AdminPage />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/affiliates"
        element={
          <RoleGuard role={role} allowed={['admin']}>
            <AffiliateManagementPage />
          </RoleGuard>
        }
      />

      {/* Affiliate SPA — outside PublicLayout */}
      <Route
        path="/affiliate"
        element={
          <RoleGuard role={role} allowed={['affiliate', 'public']}>
            <AffiliatePage />
          </RoleGuard>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function Router() {
  return (
    <DataProvider>
      <BrowserRouter>
        <RouterInner />
      </BrowserRouter>
    </DataProvider>
  );
}
