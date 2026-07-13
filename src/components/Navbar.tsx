import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import logoBlack from '../assets/logo black.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isFirebaseActive } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Packages', path: '/packages' },
    { name: 'Blog', path: '/blog' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const message =
    'Hi ColorMyTrip! I visited your website and would like to know more about your travel packages. Please share the available options. Thank you!';
  const whatsappLink = `https://wa.me/919474103441?text=${encodeURIComponent(message)}`;

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img src={logoBlack} alt="ColorMyTrip" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navigation.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`nav-link-${item.path.replace('/', '') || 'home'}`}
                  className={`px-4 py-2 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                    active
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Contact Us highlighted button */}
            <Link
              to="/contact"
              id="nav-link-contact"
              className={`ml-4 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
                isActive('/contact')
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                  : 'bg-slate-900 text-white shadow-sm hover:shadow-md hover:bg-slate-800'
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              Contact Us
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 mx-3" />

            {/* WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer border border-emerald-500/20"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.7 1.45 5.3 0 9.7-4.3 9.7-9.5s-4.3-9.5-9.7-9.5-9.7 4.3-9.7 9.5c0 1.7.5 3.3 1.4 4.8l-1 3.5 3.6-.98zM15.9 12.9c-.2-.1-1.1-.6-1.3-.7-.2-.1-.3-.1-.4.1-.1.2-.5.7-.6.8-.1.1-.2.1-.4 0s-.8-.3-1.6-1c-.6-.5-1-1.2-1.1-1.3-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3s0-.3 0-.4c-.1-.2-.4-1-.6-1.4-.2-.4-.3-.4-.4-.4h-.4c-.1 0-.4 0-.6.3s-.8.8-.8 1.9c0 1.1.8 2.2.9 2.4.1.1 1.6 2.5 4 3.5.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.1-.5 1.3-.9.2-.4.2-.8.1-.9s-.2-.2-.4-.3z" />
              </svg>
              <span>WhatsApp Chat</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.7 1.45 5.3 0 9.7-4.3 9.7-9.5s-4.3-9.5-9.7-9.5-9.7 4.3-9.7 9.5c0 1.7.5 3.3 1.4 4.8l-1 3.5 3.6-.98zM15.9 12.9c-.2-.1-1.1-.6-1.3-.7-.2-.1-.3-.1-.4.1-.1.2-.5.7-.6.8-.1.1-.2.1-.4 0s-.8-.3-1.6-1c-.6-.5-1-1.2-1.1-1.3-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3s0-.3 0-.4c-.1-.2-.4-1-.6-1.4-.2-.4-.3-.4-.4-.4h-.4c-.1 0-.4 0-.6.3s-.8.8-.8 1.9c0 1.1.8 2.2.9 2.4.1.1 1.6 2.5 4 3.5.6.2 1 .4 1.4.5.6.2 1.1.1 1.5.1.5-.1 1.1-.5 1.3-.9.2-.4.2-.8.1-.9s-.2-.2-.4-.3z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 animate-slide-down">
          <div className="px-2 pt-2 pb-4 space-y-1.5 sm:px-3">
            {navigation.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors bg-slate-900 text-white shadow-md shadow-slate-100"
            >
              Contact Us (Enquire)
            </Link>

            <div className="border-t border-slate-100 my-3 pt-3 text-center px-4">
              <span className="text-[10px] font-mono text-slate-400">
                {isFirebaseActive ? '⚡ Connected to Cloud DB' : '📁 Local Storage Sandbox'}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
