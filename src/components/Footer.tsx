import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Map } from 'lucide-react';
import logoWhite from '../assets/logo white.png';

export default function Footer() {
  const { footerSettings } = useData();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">

          {/* Col 1: Brand */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/">
              <img src={logoWhite} alt="ColorMyTrip" className="h-12 w-auto" />
            </Link>
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400">
              {footerSettings?.footer_description_text ||
                'Your uncommerialized partner for pristine family vacations, Himalayan mountaineering summits, and exotic budget-friendly world explorations.'}
            </p>
            <div className="flex gap-3 text-slate-500 pt-1">
              <button
                onClick={() => footerSettings?.social_links?.facebook_url && window.open(footerSettings.social_links.facebook_url, '_blank')}
                aria-label="Facebook"
                className={`w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white transition-all ${footerSettings?.social_links?.facebook_url ? 'cursor-pointer' : 'opacity-50 cursor-default'}`}
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => footerSettings?.social_links?.instagram_url && window.open(footerSettings.social_links.instagram_url, '_blank')}
                aria-label="Instagram"
                className={`w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-pink-600 hover:text-white transition-all ${footerSettings?.social_links?.instagram_url ? 'cursor-pointer' : 'opacity-50 cursor-default'}`}
              >
                <Instagram className="w-4 h-4" />
              </button>
              <button
                onClick={() => footerSettings?.social_links?.twitter_url && window.open(footerSettings.social_links.twitter_url, '_blank')}
                aria-label="Twitter / X"
                className={`w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-white transition-all ${footerSettings?.social_links?.twitter_url ? 'cursor-pointer' : 'opacity-50 cursor-default'}`}
              >
                <Twitter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'All Packages', to: '/packages' },
                { label: 'Blog', to: '/blog' },
                { label: 'Contact Us', to: '/contact' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-white transition-colors text-slate-400 hover:translate-x-1 inline-block transition-transform duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Package Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Tour Categories</h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              {[
                { label: '🇮🇳 Domestic Tours', to: '/packages?category=domestic' },
                { label: '✈️ International Tours', to: '/packages?category=international' },
                { label: '🏔️ Trekking Trails', to: '/packages?category=trekking' },
                { label: '💑 Honeymoon Packages', to: '/packages?q=honeymoon' },
                { label: '👨‍👩‍👧 Family Packages', to: '/packages?q=family' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-white transition-colors text-slate-400 hover:translate-x-1 inline-block transition-transform duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Legal & Site */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Legal & Info</h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              <li>
                <Link to="/sitemap" className="hover:text-white transition-colors text-slate-400 flex items-center gap-1.5">
                  <Map className="w-3 h-3" />
                  <span>Site Map</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-600 text-[11px]">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-600 text-[11px]">Terms & Conditions</span>
              </li>
              <li>
                <span className="text-slate-600 text-[11px]">Cancellation Policy</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div className="lg:col-span-2 space-y-3 text-xs sm:text-[13px]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Headquarters</h4>
            <div className="space-y-3 text-slate-400">
              <p className="flex items-start gap-2 leading-relaxed">
                <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>
                  {footerSettings?.headquarters_address ||
                    'Sevoke Road, near PC Mittal Bus Stand, Siliguri, West Bengal 734001'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <a href={`tel:${footerSettings?.phone_number || '+919832012345'}`} className="hover:text-white transition-colors">
                  {footerSettings?.phone_number || '+91 98320 12345'}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <a
                  href={`mailto:${footerSettings?.email_address || 'info.colormytrip@gmail.com'}`}
                  className="hover:underline hover:text-white font-mono text-slate-300 text-[11px] transition-colors"
                >
                  {footerSettings?.email_address || 'info.colormytrip@gmail.com'}
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
          <p>
            {footerSettings?.copyright_text ||
              `© ${currentYear} ColorMyTrip Private Limited. Coordinated with certified guide licenses and local mountain rescue networks.`}
          </p>

          <div className="flex items-center gap-4">
            <Link to="/sitemap" className="hover:text-indigo-400 transition-colors">
              Sitemap
            </Link>
            <span className="text-slate-700">|</span>
            <a
              href="/admin"
              className="text-slate-500 hover:text-indigo-400 transition-colors font-bold"
            >
              Admin Portal
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="/affiliate"
              className="text-slate-500 hover:text-indigo-400 transition-colors font-bold"
            >
              Affiliate Portal
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
