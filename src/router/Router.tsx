import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from '../context/DataContext';
import HomePage from '../pages/HomePage';
import AdminPage from '../pages/AdminPage';
import AffiliatePage from '../pages/AffiliatePage';
import AffiliateManagementPage from '../pages/AffiliateManagementPage';
import PackageRoute from '../pages/PackageRoute';
import NotFoundPage from '../pages/NotFoundPage';
import BeautifulLoader from '../components/BeautifulLoader';

function RouterInner() {
  const { role, isFirebaseActive, loading } = useData();
  const location = useLocation();

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

  const publicRoutes = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/affiliate" element={<AffiliatePage />} />
      <Route path="/package/:packageId" element={<PackageRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );

  if (!isFirebaseActive && role !== 'admin') {
    return publicRoutes;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/affiliates" element={<AffiliateManagementPage />} />
      <Route path="/affiliate" element={<AffiliatePage />} />
      <Route path="/package/:packageId" element={<PackageRoute />} />
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

