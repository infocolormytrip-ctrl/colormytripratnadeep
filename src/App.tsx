import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Packages from './components/Packages';
import PackageDetails from './components/PackageDetails';
import About from './components/About';
import Gallery from './components/Gallery';
import Blog from './components/Blog';
import Contact from './components/Contact';
import AdminPanel from './components/AdminPanel';
import VideoTestimonials from './components/VideoTestimonials';
import ReviewsCarousel from './components/ReviewsCarousel';
import { TravelPackage } from './types';
import InclusionsRow from './components/InclusionsRow';

import logoWhite from "./assets/logo white.png";

import { 
  Heart, 
  Compass, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Facebook, 
  Instagram, 
  Twitter 
} from 'lucide-react';


function AppContent() {
  const { footerSettings, siteBrandSettings } = useData();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);


  // Search parameters managed in main view state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  const { packages, videoTestimonials, reviews } = useData();

  // Quick navigation helpers
  const handleSelectPackage = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    // Switch to packages tab if they were on home
    setActiveTab('packages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (query: string, category: string) => {
    setSearchQuery(query);
    setSearchCategory(category);
    setSelectedPackage(null); // Clear any open details
  };

  return (
    <div className="min-h-screen bg-slate-50/20 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* 1. Global Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPackage(null); // Reset package selection on tab switch
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        openAdminPanel={() => setAdminOpen(true)}
      />

      {/* 2. Page Content Renderers under active tabs */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            {/* Elegant Hero header with search engine */}
            <Hero 
              onSearch={handleHeroSearch} 
              setActiveTab={setActiveTab} 
            />

            {/* 1. Category Section */}
            <div className="py-12 bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-650 font-mono block mb-1">Tailored Experiences</span>
                  <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight">
                    Explore India's Best Travel Destinations
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Choose from carefully curated domestic, international, honeymoon, adventure, family, group, and trekking tour packages across India's most loved destinations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Card 1: Domestic */}
                  <div
                    onClick={() => {
                      setSearchCategory('domestic');
                      setSearchQuery('');
                      setSelectedPackage(null);
                      setActiveTab('packages');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 cursor-pointer text-left bg-gradient-to-tr from-indigo-900 via-indigo-950 to-indigo-805"
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
                    <img
                      src="https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Domestic Tours"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-5 bottom-5 z-20">
                      <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono">India Hub</span>
                      <h3 className="text-white text-lg font-black tracking-tight leading-none mt-2">Domestic Escapes</h3>
                      <p className="text-indigo-200 text-xs mt-1 font-normal line-clamp-1">Kashmir, Sikkim Silk Route, Andaman Islands</p>
                    </div>
                  </div>

                  {/* Category Card 2: International */}
                  <div
                    onClick={() => {
                      setSearchCategory('international');
                      setSearchQuery('');
                      setSelectedPackage(null);
                      setActiveTab('packages');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 cursor-pointer text-left bg-gradient-to-tr from-blue-900 via-blue-950 to-blue-805"
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
                    <img
                      src="https://images.pexels.com/photos/1254365/pexels-photo-1254365.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="International Tours"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-5 bottom-5 z-20">
                      <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono">Exotic World</span>
                      <h3 className="text-white text-lg font-black tracking-tight leading-none mt-2">International Escapes</h3>
                      <p className="text-blue-200 text-xs mt-1 font-normal line-clamp-1">Bali, Nusa Penida, Magical Bhutan, Thailand</p>
                    </div>
                  </div>

                  {/* Category Card 3: Trekking */}
                  <div
                    onClick={() => {
                      setSearchCategory('trekking');
                      setSearchQuery('');
                      setSelectedPackage(null);
                      setActiveTab('packages');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 cursor-pointer text-left bg-gradient-to-tr from-emerald-900 via-emerald-950 to-emerald-805"
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
                    <img
                      src="https://images.pexels.com/photos/3645517/pexels-photo-3645517.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Trekking Trails"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-5 bottom-5 z-20">
                      <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono">Himalayas</span>
                      <h3 className="text-white text-lg font-black tracking-tight leading-none mt-2">Trekking Trails</h3>
                      <p className="text-emerald-200 text-xs mt-1 font-normal line-clamp-1">Sandakphu Ridge, Kedarkantha Summit, Valley of Flowers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Featured Packages Section (4 in a row, compact card sizes) */}
            <div className="py-14 bg-slate-50/50 border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10">
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 font-mono block mb-1">Featured Packages</span>
                    <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight leading-none">
                      Handpicked Travel Packages
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Discover our most popular holiday packages with comfortable stays, private transportation, sightseeing, and unforgettable local experiences.
                  </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchCategory('all');
                      setSearchQuery('');
                      setSelectedPackage(null);
                      setActiveTab('packages');
                    }}
                    className="text-xs sm:text-[13px] font-bold text-indigo-650 hover:text-indigo-750 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all packages ({packages.length})</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Grid - 4 Curated Small Cards in a Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {packages.filter(p => p.featured).slice(0, 4).map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs hover:shadow-md hover:border-indigo-300 cursor-pointer active:scale-[0.99] transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="aspect-[16/11] relative overflow-hidden bg-slate-100">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-white/95 text-indigo-650 rounded shadow-xs">
                            ★ Featured
                          </span>
                        </div>
                        
                        <div className="absolute bottom-2 right-2 bg-indigo-600 text-white px-2.5 py-0.5 rounded-md shadow-xs">
                          <span className="text-[13px] font-black">
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <p className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 leading-none">
                          <MapPin className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{pkg.location}</span>
                        </p>
                        
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight text-xs sm:text-sm mb-1.5 line-clamp-1">
                          {pkg.title}
                        </h3>
                        
                        <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                          {pkg.description}
                        </p>

                        {/* Inclusions icons inside card */}
                        <InclusionsRow inclusions={pkg.inclusions} />

                        {/* View Details Actions row */}
                        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-bold font-mono">{pkg.duration.split(' ')[0]} Days Trip</span>
                          <span className="text-indigo-600 font-bold flex items-center gap-0.5 group-hover:underline">
                            <span>View Details</span>
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* 3. Most Popular Packages Section */}
            <div className="py-14 bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-650 font-mono block mb-1">Popular Packages</span>
                  <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight">
                    Best Selling India Tour Packages
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Explore customer-favorite tours including Kashmir, Meghalaya, Sikkim, Kerala, Andaman Islands, Himachal Pradesh, Uttarakhand, Rajasthan, and North East India.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.slice(packages.length - 3).map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className="group bg-slate-50/50 rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer active:scale-[0.99] transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase bg-slate-900 text-amber-400 rounded-lg shadow-sm flex items-center gap-1">
                            🔥 Bestseller
                          </span>
                          <span className="px-2.5 py-1 text-[9px] font-black uppercase bg-white/95 text-indigo-600 rounded-lg shadow-sm">
                            9.9 Rating
                          </span>
                        </div>
                        
                        <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 rounded-xl shadow-sm border border-slate-100">
                          <span className="text-[15px] font-black text-indigo-600 leading-none block">
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold block text-right">Starts Here</span>
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-grow">
                        <p className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{pkg.location}</span>
                        </p>
                        
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight text-base mb-2">
                          {pkg.title}
                        </h3>
                        
                        <p className="text-slate-500 text-xs leading-relaxed mb-3">
                          {pkg.description}
                        </p>

                        <InclusionsRow inclusions={pkg.inclusions} />

                        <div className="mt-auto pt-3 border-t border-slate-150/40 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-bold">{pkg.duration}</span>
                          <button
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                          >
                            Book Custom Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* 4. Partner Company Logos Infinite Carousel */}
            <div className="py-12 bg-slate-50/20 border-t border-b border-slate-100 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
                <span className="text-[10px] font-mono tracking-[0.25em] text-slate-400 font-extrabold uppercase">
                  Accredited & Affiliated Partners
                </span>
              </div>
              
              <div className="relative w-full overflow-hidden bg-white py-6 border-y border-slate-100/50">
                {/* Horizontal Marquee Element */}
                <div className="animate-marquee flex gap-16 md:gap-24 items-center">
                  {[1, 2, 3].map((setIndex) => (
                    <React.Fragment key={setIndex}>
                      <div className="flex items-center gap-2.5 flex-shrink-0 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer font-sans font-black tracking-tight text-sm sm:text-base">
                        <svg className="w-6 h-6 text-indigo-650" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 22h20L12 2zm0 3.99L18.8 19H5.2L12 5.99z" />
                        </svg>
                        <span>INCREDIBLE INDIA</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer font-sans font-black tracking-tight text-sm sm:text-base">
                        <span className="w-5 h-5 rounded-full bg-slate-400 text-white font-mono flex items-center justify-center font-bold text-[10px]">🏔️</span>
                        <span>SIKKIM TOURISM COMMISSION</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer font-sans font-black tracking-tight text-sm sm:text-base">
                        <Compass className="w-5 h-5" />
                        <span>KASHMIR DEVELOPMENT BOARD</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer font-sans font-black tracking-tight text-sm sm:text-base">
                        <span className="w-6 h-6 font-mono text-white bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">C</span>
                        <span>IRCTC HOMESTAY NETWORK</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer font-mono font-bold tracking-tight text-sm sm:text-base">
                        <span>🛡️ MOUNTAIN INFRA ALLIANCE</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer font-sans font-semibold tracking-tight text-sm sm:text-base">
                        <span>🇧🇹 BHUTAN ROYAL TRAVEL HIERARCHY</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Google My Business Testimonial Widget Section */}
            <div className="py-16 bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Video Testimonials + Text Reviews Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Left Column: Video Testimonials in Vertical Reel Format */}
                  <div className="lg:col-span-5 min-h-[600px]">
                    <VideoTestimonials videos={videoTestimonials} />
                  </div>

                  {/* Right Column: Text Reviews Carousel */}
                  <div className="lg:col-span-7">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-900">Real Experiences from Happy Travelers</h3>
                      <p className="text-slate-600 text-sm">Read genuine reviews from families, honeymoon couples, solo travelers, adventure enthusiasts, and corporate groups who explored India with ColorMyTrip.</p>

                      <ReviewsCarousel reviews={reviews} />

                      {/* Google Rating Box moved under review grid and kept non-full-width */}
                      <div className="max-w-md ml-auto">
                        <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-3xl p-6 border border-indigo-200 text-center shadow-sm">
                          <div className="flex items-center justify-center gap-1 pb-4 flex-wrap">
                            <span className="text-blue-500 font-black text-2xl font-sans tracking-tight">G</span>
                            <span className="text-red-500 font-bold text-2xl font-sans tracking-tight">o</span>
                            <span className="text-yellow-500 font-bold text-2xl font-sans tracking-tight">o</span>
                            <span className="text-blue-500 font-bold text-2xl font-sans tracking-tight">g</span>
                            <span className="text-green-500 font-bold text-2xl font-sans tracking-tight">l</span>
                            <span className="text-red-500 font-bold text-2xl font-sans tracking-tight">e</span>
                            <span className="ml-2 font-black font-mono text-slate-800 text-xs tracking-wider uppercase bg-white px-2 py-1 border border-indigo-200 shadow-xs rounded-lg">
                              Business
                            </span>
                          </div>

                          <div className="my-3">
                            <p className="text-5xl font-sans font-black text-slate-900 leading-none">4.9</p>
                            <div className="flex justify-center text-amber-500 text-xl my-2">★★★★★</div>
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider font-mono">
                              Based on 14 Verified Reviews
                            </p>
                          </div>

                          <a
                            href="https://g.page/colormytrip/review"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 py-3 px-5 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 shadow-md rounded-xl transition-all"
                          >
                            <Heart className="w-4 h-4 text-red-300 fill-current" />
                            <span>Leave a Review on Google</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories / Package views */}
        {activeTab === 'packages' && (
          <div className="animate-fade-in">
            {selectedPackage ? (
              /* Enquire drill-down detailed page */
              <PackageDetails 
                pkg={selectedPackage} 
                onBack={() => setSelectedPackage(null)} 
              />
            ) : (
              /* Active filterable directory grid */
              <Packages 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchCategory={searchCategory}
                setSearchCategory={setSearchCategory}
                onSelectPackage={handleSelectPackage}
              />
            )}
          </div>
        )}

        {/* Other Pages */}
        {activeTab === 'about' && (
          <div className="animate-fade-in">
            <About />
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="animate-fade-in">
            <Gallery />
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="animate-fade-in">
            <Blog />
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="animate-fade-in">
            <Contact />
          </div>
        )}
      </main>

      {/* 3. Global Information Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo Brand information */}
          <div className="md:col-span-4 space-y-4">
            <img
              src={logoWhite}
              alt="ColorMyTrip"
              className="h-12 w-auto"
            />
            
            <p className="text-xs sm:text-[13px] leading-relaxed text-slate-400">
              {footerSettings?.footer_description_text ||
                'Your uncommerialized partner for pristine family vacations, Himalayan mountaineering summits, and exotic budget-friendly world explorations.'}
            </p>

            <div className="flex gap-2 text-slate-500 pt-1">
              <Facebook
                onClick={() => (footerSettings?.social_links?.facebook_url ? window.open(footerSettings.social_links.facebook_url, '_blank') : undefined)}
                className={`w-5 h-5 hover:text-white transition-colors cursor-pointer ${footerSettings?.social_links?.facebook_url ? '' : 'opacity-60'}`}
              />
              <Instagram
                onClick={() => (footerSettings?.social_links?.instagram_url ? window.open(footerSettings.social_links.instagram_url, '_blank') : undefined)}
                className={`w-5 h-5 hover:text-white transition-colors cursor-pointer ${footerSettings?.social_links?.instagram_url ? '' : 'opacity-60'}`}
              />
              <Twitter
                onClick={() => (footerSettings?.social_links?.twitter_url ? window.open(footerSettings.social_links.twitter_url, '_blank') : undefined)}
                className={`w-5 h-5 hover:text-white transition-colors cursor-pointer ${footerSettings?.social_links?.twitter_url ? '' : 'opacity-60'}`}
              />
            </div>

          </div>

          {/* Quick links directory */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Navigate Directory</h4>
            <ul className="space-y-2 text-xs sm:text-[13px]">
              {['Home', 'About Us', 'Packages', 'Gallery', 'Blog'].map((name, i) => {
                const ids = ['home', 'about', 'packages', 'gallery', 'blog'];
                return (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setActiveTab(ids[i]);
                        setSelectedPackage(null);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors text-slate-400 cursor-pointer text-left"
                    >
                      {name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Operational Area Headquarters */}
          <div className="md:col-span-5 space-y-3 text-xs sm:text-[13px]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Headquarters Location</h4>
            
            <div className="space-y-2 text-slate-400">
              <p className="flex items-start gap-2 leading-relaxed">
                <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span>
                  {footerSettings?.headquarters_address ||
                    'Sevoke Road, near PC Mittal Bus Stand, Siliguri, Darjeeling foothills district, West Bengal, India, 734001'}
                </span>
              </p>
              
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>
                  Call Desk: {footerSettings?.phone_number || '+91 98320 12345'}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>
                  Info Support Desk:{' '}
                  <a
                    href={`mailto:${footerSettings?.email_address || 'info.colormytrip@gmail.com'}`}
                    className="hover:underline font-mono text-slate-300"
                  >
                    {footerSettings?.email_address || 'info.colormytrip@gmail.com'}
                  </a>
                </span>
              </p>
            </div>
          </div>


        </div>

        {/* Secondary footer line with Administrator Portal entry point */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium font-sans">
          <p>
            {footerSettings?.copyright_text || `© ${new Date().getFullYear()} ColorMyTrip Private Limited. Coordinated with certified guide licenses and local mountain rescue networks.`}
          </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminOpen(true)}
            className="text-slate-500 hover:text-indigo-400 hover:underline transition-colors font-bold cursor-pointer"
          >
            Tour Administrator Portal
          </button>
        </div>
        </div>
      </footer>

      {/* 4. Floating Overlay Administrative desk */}
      {adminOpen && (
        <AdminPanel onClose={() => setAdminOpen(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
