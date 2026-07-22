import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TravelPackage } from '../types';
import { Compass, Clock, MapPin, ChevronRight, Search, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from 'lucide-react';
import InclusionsRow from '../components/InclusionsRow';
import { getPackageSlug } from '../lib/slug';

const BATCH_SIZE = 10;

/** Get unique locations from packages */
function getUniqueLocations(packages: TravelPackage[]): string[] {
  const seen = new Set<string>();
  packages.forEach((p) => {
    const loc = p.location?.trim();
    if (loc) seen.add(loc);
  });
  return Array.from(seen).sort();
}

/** Get price range boundaries */
function getPriceRange(packages: TravelPackage[]) {
  if (packages.length === 0) return { min: 0, max: 200000 };
  const prices = packages.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function getPastelStyles(cat: string) {
  switch (cat) {
    case 'domestic':
      return { bg: 'bg-indigo-50/40', border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-700' };
    case 'international':
      return { bg: 'bg-blue-50/40', border: 'border-blue-100', badge: 'bg-blue-100 text-blue-700' };
    case 'trekking':
      return { bg: 'bg-emerald-50/40', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-800' };
    default:
      return { bg: 'bg-slate-50/50', border: 'border-slate-100', badge: 'bg-indigo-100 text-indigo-800' };
  }
}

export default function PackagesPage() {
  const { packages, packagesLoading } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Filter state (initialized from URL query params) ──
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(99999999);
  const [showFilters, setShowFilters] = useState(false);

  // ── Infinite scroll state ──
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const priceRange = useMemo(() => getPriceRange(packages), [packages]);
  const uniqueLocations = useMemo(() => getUniqueLocations(packages), [packages]);

  // Init price range once packages load
  useEffect(() => {
    if (packages.length > 0 && priceMax === 99999999) {
      setPriceMax(priceRange.max);
    }
  }, [packages.length, priceRange.max]);

  useEffect(() => {
    document.title = 'All Travel Packages | ColorMyTrip – Domestic, International & Trekking Tours';
  }, []);

  const categories = [
    { name: 'All Tours', id: 'all', count: packages.length },
    { name: 'Domestic', id: 'domestic', count: packages.filter(p => p.category === 'domestic').length },
    { name: 'International', id: 'international', count: packages.filter(p => p.category === 'international').length },
    { name: 'Trekking', id: 'trekking', count: packages.filter(p => p.category === 'trekking').length },
  ];

  // ── Filtered + sorted packages ──
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // Category filter
    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Location filter
    if (selectedLocation !== 'all') {
      result = result.filter((p) => p.location?.trim() === selectedLocation);
    }

    // Price filter
    result = result.filter((p) => p.price >= priceMin && p.price <= priceMax);

    // Sort
    if (sortOrder === 'newest') {
      // Packages with createdAt: sort by date desc (newer = higher timestamp)
      // Packages without createdAt: keep their original Firestore array order
      // which reflects document creation order.
      // We attach a stable index to each item for fallback ordering.
      const indexed = result.map((p, idx) => ({ p, idx }));
      indexed.sort((a, b) => {
        const tsA = a.p.createdAt ? new Date(a.p.createdAt).getTime() : 0;
        const tsB = b.p.createdAt ? new Date(b.p.createdAt).getTime() : 0;
        if (tsA !== tsB) return tsB - tsA; // newer first
        // Both have no createdAt or same timestamp: preserve load order (last loaded = last in array = oldest)
        // We reverse index so last-in-array appears first (Firestore adds newest docs last)
        return b.idx - a.idx;
      });
      result = indexed.map(({ p }) => p);
    } else if (sortOrder === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [packages, category, searchQuery, selectedLocation, priceMin, priceMax, sortOrder]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    window.scrollTo({ top: 0 });
  }, [category, searchQuery, selectedLocation, priceMin, priceMax, sortOrder]);

  const visiblePackages = filteredPackages.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPackages.length;

  // ── Infinite scroll via IntersectionObserver ──
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 400);
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setSelectedLocation('all');
    setSortOrder('newest');
    setPriceMin(priceRange.min);
    setPriceMax(priceRange.max);
  };

  const activeFilterCount = [
    category !== 'all',
    selectedLocation !== 'all',
    sortOrder !== 'newest',
    priceMin > priceRange.min || priceMax < priceRange.max,
  ].filter(Boolean).length;

  return (
    <div className="py-10 bg-slate-50/45 min-h-[70vh] animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 font-mono block mb-1">All Packages</span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight mb-3">
            Browse Our <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Exquisite Packages</span>
          </h1>
          <p className="text-slate-600 text-base">
            Select from packages optimized for Indian traveler preferences, with transparent pricing and real details.
          </p>
        </div>

        {/* ── Controls bar ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 flex-grow">
              {categories.map((cat) => {
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right side: search + filter toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-grow md:w-64">
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 text-[13px] rounded-xl border border-slate-100 focus:outline-none focus:border-indigo-400 text-slate-700"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* ── Expanded filter panel ── */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">

              {/* Location filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter by Location</label>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 text-[13px] rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 text-slate-700 cursor-pointer"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Price Min */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Min Price: <span className="text-indigo-600">₹{priceMin.toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step={1000}
                  value={priceMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= priceMax) setPriceMin(val);
                  }}
                  className="w-full h-2 rounded-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Price Max */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Max Price: <span className="text-indigo-600">₹{priceMax.toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step={1000}
                  value={priceMax}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= priceMin) setPriceMax(val);
                  }}
                  className="w-full h-2 rounded-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Sort */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sort Order</label>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-slate-50 text-[13px] rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 text-slate-700 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Reset filters */}
              {activeFilterCount > 0 && (
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {packagesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-bold tracking-wider font-mono uppercase">Loading Travel Packages...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4 text-xs text-slate-500 font-medium">
              <span>
                Showing <span className="font-bold text-slate-800">{visiblePackages.length}</span> of{' '}
                <span className="font-bold text-slate-800">{filteredPackages.length}</span> packages
              </span>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-indigo-600 font-bold hover:underline cursor-pointer">
                  Clear filters
                </button>
              )}
            </div>

            {/* Empty state */}
            {filteredPackages.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-150 shadow-sm">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin" style={{ animationDuration: '12s' }} />
                <h2 className="text-lg font-bold text-slate-800 mb-1">No packages found</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any packages matching your filters. Try resetting them!
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Package Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visiblePackages.map((pkg) => {
                const styles = getPastelStyles(pkg.category);
                return (
                  <div
                    key={pkg.id}
                    className={`group flex flex-col h-full bg-white rounded-2xl border ${styles.border} overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 active:scale-[0.99] transition-all duration-300`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md shadow-xs ${styles.badge}`}>
                          {pkg.category === 'trekking' ? '🏔️ Trek' : pkg.category === 'domestic' ? '🇮🇳 Local' : "✈️ Int'l"}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs shadow-xs px-2 py-1 rounded-lg border border-slate-100">
                        <span className="text-[17px] font-black text-indigo-600 leading-none">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-grow p-4">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] mb-1">
                        <MapPin className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                        <span className="truncate">{pkg.location}</span>
                      </div>
                      <h3 className="text-xs sm:text-[13px] font-black text-slate-900 leading-snug tracking-tight mb-1 line-clamp-1">
                        {pkg.title}
                      </h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 pb-1">{pkg.description}</p>
                      <InclusionsRow inclusions={pkg.inclusions} />
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{pkg.duration.split(' ')[0]}D / {pkg.duration.split(' ')[3] || '3'}N</span>
                        </div>
                        <button
                          onClick={() => navigate(`/package/${getPackageSlug(pkg)}`)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-slate-950 hover:bg-slate-800 shadow-sm transition-all duration-200 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Sentinel div for IntersectionObserver */}
        <div ref={sentinelRef} className="h-4 mt-4" />

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-8 gap-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">Loading more packages...</span>
          </div>
        )}

        {/* End of results */}
        {!hasMore && filteredPackages.length > 0 && (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            ✓ All {filteredPackages.length} packages loaded
          </div>
        )}
      </div>
    </div>
  );
}
