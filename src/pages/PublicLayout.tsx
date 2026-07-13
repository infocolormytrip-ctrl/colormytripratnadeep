import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * PublicLayout wraps all public-facing pages with the shared Navbar and Footer.
 * Admin and Affiliate routes are rendered outside this layout.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50/20 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-950">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
