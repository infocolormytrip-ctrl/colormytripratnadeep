import React, { useMemo, useState } from 'react';
import { Search, MapPin, Compass, ShieldCheck, Sun, Plane, Camera, Briefcase, Ticket, Palmtree, BadgeCheck } from 'lucide-react';
import { useData } from '../context/DataContext';
import ImageWithFallback from './ImageWithFallback';


interface HeroProps {
  onSearch: (query: string, category: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function Hero({ onSearch, setActiveTab }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const { offers } = useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, category);
    setActiveTab('packages');
  };

  const trendingSearches = [
    { name: 'Kashmir', cat: 'domestic' },
    { name: 'Sikkim Route', cat: 'domestic' },
    { name: 'Bhutan Puja Special', cat: 'international' },
    { name: 'Sandakphu Winter', cat: 'trekking' }
  ];

  const activeOffers = useMemo(() => offers.filter((offer) => offer.is_active), [offers]);
  const tickerSpeed = activeOffers[0]?.speed ?? 30;

  return (
    <div className="relative bg-linear-to-b from-sky-50 via-amber-50/70 to-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(186,230,253,0.6),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(254,215,170,0.45),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(233,213,255,0.35),transparent_38%)] pointer-events-none" />

      {activeOffers.length > 0 && (
        <div
          className="relative z-20 border-y border-white/60 backdrop-blur-md overflow-hidden"
          style={{
            backgroundColor: activeOffers[0].background_color
          }}
        >
          <div
            className="flex w-max py-2.5"
            style={{
              color: activeOffers[0].text_color,
              animation: `marquee ${tickerSpeed}s linear infinite`
            }}
          >
            {[...activeOffers, ...activeOffers, ...activeOffers].map((offer, idx) => (
              <p key={`${offer.id}-${idx}`} className="px-8 text-[11px] sm:text-xs font-bold tracking-wide whitespace-nowrap">
                {offer.offer_text}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-5 pb-16 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '9s' }} />
              <span>Premium travel planning with soul</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-slate-900 leading-[1.05]">
              Adventure-ready trips with <span className="text-indigo-600">premium planning</span> and transparent pricing.
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover curated domestic tours, international escapes, and Himalayan treks crafted by experts. Every itinerary balances adventure, comfort, and budget.
            </p>

            <div className="bg-white/90 p-3 sm:p-4 rounded-3xl shadow-xl shadow-sky-100/60 border border-white backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-indigo-400 focus-within:bg-white transition-all">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Where to? Sikkim, Kashmir, Bali..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-indigo-400 focus-within:bg-white transition-all sm:w-44">
                  <Compass className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent border-none text-xs sm:text-sm font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="all">Any Type</option>
                    <option value="domestic">Domestic</option>
                    <option value="international">Int'l</option>
                    <option value="trekking">Trekking</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-7 py-3 bg-linear-to-r from-indigo-600 to-sky-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Trips</span>
                </button>
              </form>
            </div>

            <div className="flex justify-center lg:justify-start">
              <button
                onClick={() => setActiveTab('packages')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-slate-900 font-bold text-sm border border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <BadgeCheck className="w-4 h-4 text-indigo-600" />
                View Handpicked Packages
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 max-w-xl text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Trending:</span>
              {trendingSearches.map((pick) => (
                <button
                  key={pick.name}
                  onClick={() => {
                    onSearch(pick.name, pick.cat);
                    setActiveTab('packages');
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 border border-slate-200 transition-all cursor-pointer font-medium text-[11px]"
                >
                  #{pick.name}
                </button>
              ))}
            </div>

          </div>

          <div className="lg:col-span-6 hidden sm:block xl:col-span-6 relative mt-10 lg:mt-0">
            <div className="relative w-full max-w-xl mx-auto aspect-6/5">
              <div className="absolute inset-0 border border-white backdrop-blur-md" />

              <div className="absolute left-[8%] top-[6%] w-[42%] aspect-3/4 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-[-9deg] animate-float-soft">
                <ImageWithFallback
                  src="https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Mountain destination"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute right-[8%] top-[8%] w-[46%] aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-[7deg] animate-float-softer">
                <ImageWithFallback
                  src="https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Beach destination"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute left-[33%] bottom-[11%] w-[40%] aspect-4/3 rounded-2xl overflow-hidden shadow-xl border-4 border-white -rotate-3 animate-float-soft">
                <ImageWithFallback
                  src="https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Adventure collage visual"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute right-[10%] bottom-[4%] bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl border border-slate-100 shadow-lg flex items-center gap-2 rotate-3">
                <Plane className="w-4 h-4 text-indigo-600 animate-float-softer" />
                <span className="text-xs font-bold text-slate-700">Adventure + Affordability</span>
              </div>

              <div className="absolute -left-2 top-[18%] bg-white text-slate-700 p-2.5 rounded-xl shadow-lg animate-float-soft hidden sm:block"><Briefcase className="w-4 h-4" /></div>
              <div className="absolute right-2 top-[35%] bg-white text-slate-700 p-2.5 rounded-xl shadow-lg animate-float-softer hidden sm:block"><Camera className="w-4 h-4" /></div>
              <div className="absolute left-[16%] bottom-[8%] bg-white text-slate-700 p-2.5 rounded-xl shadow-lg animate-float-soft hidden sm:block"><Ticket className="w-4 h-4" /></div>
              <div className="absolute right-[16%] -top-2 bg-white text-emerald-600 p-2 rounded-xl shadow-lg animate-float-softer hidden sm:block"><Palmtree className="w-4 h-4" /></div>
            </div>
          </div>

        </div>

        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto mt-5 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-left shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div><p className="font-bold text-slate-800 text-xs sm:text-sm">100% Secure</p><p className="text-[11px] text-slate-500">Certified local experts</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-left shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div><p className="font-bold text-slate-800 text-xs sm:text-sm">Affordable</p><p className="text-[11px] text-slate-500">Best-value pricing</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-left shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div><p className="font-bold text-slate-800 text-xs sm:text-sm">Curated Trips</p><p className="text-[11px] text-slate-500">Personalized itineraries</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-slate-200 text-left shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div><p className="font-bold text-slate-800 text-xs sm:text-sm">Trusted Support</p><p className="text-[11px] text-slate-500">On-trip assistance</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
