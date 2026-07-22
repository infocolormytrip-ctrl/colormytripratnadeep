import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { TravelPackage } from '../types';
import { Compass, Clock, MapPin, Tag, ChevronRight, SlidersHorizontal, Search } from 'lucide-react';
import InclusionsRow from './InclusionsRow';
import { useNavigate } from 'react-router-dom';
import { getPackageSlug } from '../lib/slug';


interface PackagesProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchCategory: string;
  setSearchCategory: (val: string) => void;
  onSelectPackage: (pkg: TravelPackage) => void;
}

export default function Packages({
  searchQuery,
  setSearchQuery,
  searchCategory,
  setSearchCategory,
  onSelectPackage,
}: PackagesProps) {
  const { packages, packagesLoading } = useData();
  const navigate = useNavigate();

  const [internalSearch, setInternalSearch] = useState(searchQuery);

  // Sync internal search with query from hero
  useEffect(() => {
    setInternalSearch(searchQuery);
  }, [searchQuery]);

  const categories = [
    { name: 'All Tours', id: 'all', count: packages.length },
    { name: 'Domestic Tour', id: 'domestic', count: packages.filter(p => p.category === 'domestic').length },
    { name: 'International Tour', id: 'international', count: packages.filter(p => p.category === 'international').length },
    { name: 'Trekking Trails', id: 'trekking', count: packages.filter(p => p.category === 'trekking').length }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearch(e.target.value);
    setSearchQuery(e.target.value);
  };

  // Filter logic
  const filteredPackages = packages.filter((pkg) => {
    const matchesCategory = searchCategory === 'all' || pkg.category === searchCategory;
    const matchesSearch = 
      pkg.title.toLowerCase().includes(internalSearch.toLowerCase()) ||
      pkg.location.toLowerCase().includes(internalSearch.toLowerCase()) ||
      pkg.description.toLowerCase().includes(internalSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Unique pastel styles based on tour category
  const getPastelStyles = (cat: string) => {
    switch (cat) {
      case 'domestic':
        return {
          bg: 'bg-indigo-50/40 hover:bg-indigo-50/70',
          border: 'border-indigo-100',
          badge: 'bg-indigo-100 text-indigo-700',
          bullet: 'bg-indigo-400',
          btnShadow: 'hover:shadow-indigo-100',
        };
      case 'international':
        return {
          bg: 'bg-blue-50/40 hover:bg-blue-50/70',
          border: 'border-blue-100',
          badge: 'bg-blue-100 text-blue-700',
          bullet: 'bg-blue-400',
          btnShadow: 'hover:shadow-blue-100',
        };
      case 'trekking':
        return {
          bg: 'bg-emerald-50/40 hover:bg-emerald-50/70',
          border: 'border-emerald-100',
          badge: 'bg-emerald-100 text-emerald-800',
          bullet: 'bg-emerald-400',
          btnShadow: 'hover:shadow-emerald-100',
        };
      default:
        return {
          bg: 'bg-slate-50/50 hover:bg-slate-100/40',
          border: 'border-slate-100',
          badge: 'bg-indigo-100 text-indigo-800',
          bullet: 'bg-indigo-500',
          btnShadow: 'hover:shadow-indigo-100',
        };
    }
  };

  return (
    <div className="py-12 bg-slate-50/45 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight mb-4">
            Browse Our <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Exquisite Packages</span>
          </h2>
          <p className="text-slate-600 text-base">
            Select standard custom packages optimized based on Indian traveler preferences, complete with transparent pricing and real details.
          </p>
        </div>

        {/* Filter Controls & Secondary Search Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-150">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto w-full md:w-auto">
            {categories.map((cat) => {
              const isActive = searchCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSearchCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-100 shadow-sm'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Search Filter bar */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search active listings..."
              value={internalSearch}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2.5 bg-white text-[13px] rounded-xl border border-slate-100 shadow-sm focus:outline-none focus:border-indigo-400 text-slate-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-150 shadow-sm">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin" style={{ animationDuration: '12s' }} />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No packages found</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              We couldn't find any packages matching "{internalSearch}" in this category. Let's try resetting our filters!
            </p>
            <button
              onClick={() => {
                setInternalSearch('');
                setSearchQuery('');
                setSearchCategory('all');
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 cursor-pointer"
            >
              Reset Search Filter
            </button>
          </div>
        )}

        {/* Small Package Cards Grid - 4 Columns in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPackages.map((pkg) => {
            const styles = getPastelStyles(pkg.category);
            
            return (
              <div
                key={pkg.id}
                className={`group flex flex-col h-full bg-white rounded-2xl border ${styles.border} overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 active:scale-[0.99] transition-all duration-300`}
              >
                
                {/* Package Image banner */}
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
                      {pkg.category === 'trekking' ? '🏔️ Trek' : pkg.category === 'domestic' ? '🇮🇳 Local' : '✈️ Int\'l'}
                    </span>
                  </div>
                  
                  {/* Floating Price tag */}
                  <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs shadow-xs px-2 py-1 rounded-lg border border-slate-100">
                    <span className="text-[17px] font-black text-indigo-600 leading-none">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Card description body */}
                <div className="flex flex-col flex-grow p-4">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] mb-1">
                    <MapPin className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                    <span className="truncate">{pkg.location}</span>
                  </div>

                  <h3 className="text-xs sm:text-[13px] font-black text-slate-900 leading-snug tracking-tight mb-1 transition-colors line-clamp-1">
                    {pkg.title}
                  </h3>

                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 pb-1">
                    {pkg.description}
                  </p>

                  {/* Dynamic Inclusion Icons below description */}
                  <InclusionsRow inclusions={pkg.inclusions} />

                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{pkg.duration.split(' ')[0]}D / {pkg.duration.split(' ')[3] || '3'}N</span>
                    </div>

                    {/* View Details / Enquire button */}
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
      </div>
    </div>
  );
}
