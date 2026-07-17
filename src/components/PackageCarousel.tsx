import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TravelPackage } from '../types';
import { ChevronLeft, ChevronRight, MapPin, Clock, Star } from 'lucide-react';
import InclusionsRow from './InclusionsRow';

interface PackageCarouselProps {
  packages: TravelPackage[];
  variant?: 'featured' | 'bestseller';
  onSelectPackage?: (pkg: TravelPackage) => void;
}

export default function PackageCarousel({
  packages,
  variant = 'featured',
  onSelectPackage,
}: PackageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const autoSlideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalCards = packages.length;

  // Scroll to card index
  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    setActiveIndex(index);
  }, []);

  // Auto-slide every 4 seconds
  const resetAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current);
    autoSlideTimer.current = setTimeout(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % totalCards;
        scrollToIndex(next);
        return next;
      });
    }, 4000);
  }, [totalCards, scrollToIndex]);

  useEffect(() => {
    resetAutoSlide();
    return () => { if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current); };
  }, [activeIndex, resetAutoSlide]);

  const prev = () => {
    const idx = (activeIndex - 1 + totalCards) % totalCards;
    scrollToIndex(idx);
    resetAutoSlide();
  };
  const next = () => {
    const idx = (activeIndex + 1) % totalCards;
    scrollToIndex(idx);
    resetAutoSlide();
  };

  // Sync active dot on scroll
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const scrollLeft = track.scrollLeft;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - track.offsetLeft - scrollLeft);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);
  };

  // Mouse drag support
  const onMouseDown = (e: React.MouseEvent) => {
    const track = trackRef.current!;
    setIsDragging(true);
    setDragStartX(e.pageX - track.offsetLeft);
    setDragScrollLeft(track.scrollLeft);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const track = trackRef.current!;
    const dx = e.pageX - track.offsetLeft - dragStartX;
    track.scrollLeft = dragScrollLeft - dx;
  };
  const onMouseUp = () => setIsDragging(false);

  const isBestseller = variant === 'bestseller';

  return (
    <div className="relative">
      {/* Prev / Next Arrow Buttons */}
      {totalCards > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous package"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next package"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Scrollable Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={`flex gap-4 overflow-x-auto scroll-smooth pb-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {packages.map((pkg, i) => (
          <div
            key={pkg.id}
            onClick={() => {
              if (!isDragging) {
                if (onSelectPackage) onSelectPackage(pkg);
                else window.location.href = `/package/${pkg.slug || pkg.id}`;
              }
            }}
            className={`flex-shrink-0 group bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 cursor-pointer active:scale-[0.99] transition-all duration-300 flex flex-col ${isBestseller
              ? 'w-[85vw] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]'
              : 'w-[80vw] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]'
              }`}
          >
            {/* Image */}
            <div className={`relative overflow-hidden bg-slate-100 ${isBestseller ? 'aspect-[16/10]' : 'aspect-[16/11]'}`}>
              <img
                src={pkg.image}
                alt={pkg.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              {/* Badge */}
              <div className="absolute top-3 left-3 flex gap-1.5">
                {isBestseller ? (
                  <>
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase bg-slate-900 text-amber-400 rounded-lg shadow-sm flex items-center gap-1">
                      🔥 Bestseller
                    </span>
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase bg-white/95 text-indigo-600 rounded-lg shadow-sm flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> 9.9
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-white/95 text-indigo-650 rounded shadow-xs">
                    ★ Featured
                  </span>
                )}
              </div>

              {/* Price */}
              {isBestseller ? (
                <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 rounded-xl shadow-sm border border-slate-100">
                  <span className="text-[15px] font-black text-indigo-600 leading-none block">
                    ₹{pkg.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold block text-right">Starts Here</span>
                </div>
              ) : (
                <div className="absolute bottom-2 right-2 bg-indigo-600 text-white px-2.5 py-0.5 rounded-md shadow-xs">
                  <span className="text-[13px] font-black">₹{pkg.price.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 leading-none">
                <MapPin className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                <span className="truncate">{pkg.location}</span>
              </p>

              <h3 className={`font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight mb-1.5 line-clamp-1 ${isBestseller ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                {pkg.title}
              </h3>

              <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 mb-1">
                {pkg.description}
              </p>

              <InclusionsRow inclusions={pkg.inclusions} />

              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {isBestseller ? pkg.duration : `${pkg.duration.split(' ')[0]} Days Trip`}
                </span>
                <span className="text-indigo-600 font-bold flex items-center gap-0.5 group-hover:underline">
                  <span>View Details</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      {totalCards > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {packages.map((_, i) => (
            <button
              key={i}
              onClick={() => { scrollToIndex(i); resetAutoSlide(); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${i === activeIndex
                ? 'w-6 h-2 bg-indigo-600'
                : 'w-2 h-2 bg-slate-300 hover:bg-indigo-300'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
