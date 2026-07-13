import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from './context/DataContext';
import Hero from './components/Hero';
import ReviewsCarousel from './components/ReviewsCarousel';
import VideoTestimonials from './components/VideoTestimonials';
import PackageCarousel from './components/PackageCarousel';
import { Heart, Compass } from 'lucide-react';

import img1 from './assets/Images/Himalayan-Tour-and-Travel.jpg';
import img2 from './assets/Images/Header_Thailand_Winter.avif';
import img3 from './assets/Images/TRAKKING.jpg';

/**
 * HomePage (home tab content) — rendered at route "/"
 * The layout (Navbar + Footer) is provided by PublicLayout.
 */
export default function App() {
  const { packages, videoTestimonials, reviews } = useData();
  const navigate = useNavigate();

  // Create a consistently newest-first sorted package list
  const sortedPackages = React.useMemo(() => {
    const indexed = packages.map((p, idx) => ({ p, idx }));
    indexed.sort((a, b) => {
      const tsA = a.p.createdAt ? new Date(a.p.createdAt).getTime() : 0;
      const tsB = b.p.createdAt ? new Date(b.p.createdAt).getTime() : 0;
      if (tsA !== tsB) return tsB - tsA; // newer first
      // Both have no createdAt or same timestamp: preserve load order (last loaded = last in array = oldest)
      return b.idx - a.idx;
    });
    return indexed.map(({ p }) => p);
  }, [packages]);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <Hero
        onSearch={(query, category) => {
          const params = new URLSearchParams();
          if (query) params.set('q', query);
          if (category && category !== 'all') params.set('category', category);
          navigate(`/packages?${params.toString()}`);
        }}
        setActiveTab={(tab: string) => {
          const routeMap: Record<string, string> = {
            packages: '/packages',
            about: '/about',
            blog: '/blog',
            contact: '/contact',
          };
          navigate(routeMap[tab] || '/');
        }}
      />

      {/* Category Cards Section */}
      <div className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 font-mono block mb-1">Tailored Experiences</span>
            <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight">
              Explore India's Best Travel Destinations
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Choose from carefully curated domestic, international, honeymoon, adventure, family, group, and trekking tour packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Domestic */}
            <Link
              to="/packages?category=domestic"
              className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 cursor-pointer text-left bg-gradient-to-tr from-indigo-900 via-indigo-950 to-indigo-800"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
              <img src={img1} alt="Domestic Tours" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-x-5 bottom-5 z-20">
                <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono">India Hub</span>
                <h3 className="text-white text-lg font-black tracking-tight leading-none mt-2">Domestic Escapes</h3>
                <p className="text-indigo-200 text-xs mt-1 font-normal line-clamp-1">Kashmir, Sikkim Silk Route, Andaman Islands</p>
              </div>
            </Link>

            {/* International */}
            <Link
              to="/packages?category=international"
              className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 cursor-pointer text-left bg-gradient-to-tr from-blue-900 via-blue-950 to-blue-800"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
              <img src={img2} alt="International Tours" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-x-5 bottom-5 z-20">
                <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono">Exotic World</span>
                <h3 className="text-white text-lg font-black tracking-tight leading-none mt-2">International Escapes</h3>
                <p className="text-blue-200 text-xs mt-1 font-normal line-clamp-1">Bali, Nusa Penida, Magical Bhutan, Thailand</p>
              </div>
            </Link>

            {/* Trekking */}
            <Link
              to="/packages?category=trekking"
              className="group relative h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 cursor-pointer text-left bg-gradient-to-tr from-emerald-900 via-emerald-950 to-emerald-800"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
              <img src={img3} alt="Trekking Trails" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-x-5 bottom-5 z-20">
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono">Himalayas</span>
                <h3 className="text-white text-lg font-black tracking-tight leading-none mt-2">Trekking Trails</h3>
                <p className="text-emerald-200 text-xs mt-1 font-normal line-clamp-1">Sandakphu Ridge, Kedarkantha Summit, Valley of Flowers</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Packages Carousel */}
      <div className="py-14 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 font-mono block mb-1">Featured Packages</span>
              <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight leading-none">Handpicked Travel Packages</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Discover our most popular holiday packages with comfortable stays, private transportation, sightseeing.</p>
            </div>
            <Link
              to="/packages"
              className="text-xs sm:text-[13px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View all packages ({packages.length})</span>
              <span>→</span>
            </Link>
          </div>
          <PackageCarousel packages={sortedPackages.filter(p => p.featured).slice(0, 8)} variant="featured" />
        </div>
      </div>

      {/* Best Selling Packages */}
      <div className="py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 font-mono block mb-1">Popular Packages</span>
            <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight">Best Selling India Tour Packages</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Explore customer-favorite tours including Kashmir, Meghalaya, Sikkim, Kerala, Andaman, Himachal, Uttarakhand, Rajasthan.
            </p>
          </div>
          <PackageCarousel packages={sortedPackages.slice(0, 8)} variant="bestseller" />
        </div>
      </div>

      {/* Trekking Trails Carousel */}
      <div className="py-14 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 font-mono block mb-1">Adventure Escapes</span>
              <h2 className="text-2xl sm:text-3xl font-sans font-black text-slate-900 tracking-tight leading-none">Majestic Trekking Trails</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Conquer the Himalayas with our professionally guided adventure packages and scenic summit paths.</p>
            </div>
            <Link
              to="/packages?category=trekking"
              className="text-xs sm:text-[13px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View all treks ({packages.filter(p => p.category === 'trekking').length})</span>
              <span>→</span>
            </Link>
          </div>
          <PackageCarousel packages={sortedPackages.filter(p => p.category === 'trekking').slice(0, 8)} variant="featured" />
        </div>
      </div>

      {/* Partner Logos Marquee */}
      <div className="py-12 bg-slate-50/20 border-t border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
          <span className="text-[10px] font-mono tracking-[0.25em] text-slate-400 font-extrabold uppercase">
            Accredited &amp; Affiliated Partners
          </span>
        </div>
        <div className="relative w-full overflow-hidden bg-white py-6 border-y border-slate-100/50">
          <div className="animate-marquee flex gap-16 md:gap-24 items-center">
            {[1, 2, 3].map((setIndex) => (
              <React.Fragment key={setIndex}>
                <div className="flex items-center gap-2.5 flex-shrink-0 text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer font-sans font-black tracking-tight text-sm sm:text-base">
                  <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.99L18.8 19H5.2L12 5.99z" /></svg>
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

      {/* Testimonials Section */}
      <div className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 min-h-[600px]">
              <VideoTestimonials videos={videoTestimonials} />
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900">Real Experiences from Happy Travelers</h3>
                <p className="text-slate-600 text-sm">
                  Read genuine reviews from families, honeymoon couples, solo travelers, adventure enthusiasts, and corporate groups who explored India with ColorMyTrip.
                </p>
                <ReviewsCarousel reviews={reviews} />
                <div className="max-w-md ml-auto">
                  <div className="bg-linear-to-r from-indigo-50 via-blue-50 to-indigo-50 rounded-3xl p-6 border border-indigo-200 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 pb-4 flex-wrap">
                      <span className="text-blue-500 font-black text-2xl font-sans tracking-tight">G</span>
                      <span className="text-red-500 font-bold text-2xl font-sans tracking-tight">o</span>
                      <span className="text-yellow-500 font-bold text-2xl font-sans tracking-tight">o</span>
                      <span className="text-blue-500 font-bold text-2xl font-sans tracking-tight">g</span>
                      <span className="text-green-500 font-bold text-2xl font-sans tracking-tight">l</span>
                      <span className="text-red-500 font-bold text-2xl font-sans tracking-tight">e</span>
                      <span className="ml-2 font-black font-mono text-slate-800 text-xs tracking-wider uppercase bg-white px-2 py-1 border border-indigo-200 shadow-xs rounded-lg">Business</span>
                    </div>
                    <div className="my-3">
                      <p className="text-5xl font-sans font-black text-slate-900 leading-none">4.9</p>
                      <div className="flex justify-center text-amber-500 text-xl my-2">★★★★★</div>
                      <p className="text-xs text-slate-600 font-bold uppercase tracking-wider font-mono">Based on 14 Verified Reviews</p>
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
  );
}
