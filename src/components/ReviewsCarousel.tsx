import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Review } from '../types';

interface ReviewsCarouselProps {
  reviews: Review[];
}

function getInitials(name: string) {
  return name
    .split(',')
    .at(0)
    ?.trim()
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RV';
}

export default function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const autoSlideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalReviews = reviews.length;

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    setActiveIndex(index);
  }, []);

  const resetAutoSlide = useCallback(() => {
    if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current);
    autoSlideTimer.current = setTimeout(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % totalReviews;
        scrollToIndex(next);
        return next;
      });
    }, 4500);
  }, [totalReviews, scrollToIndex]);

  useEffect(() => {
    if (totalReviews > 1) {
      resetAutoSlide();
    }
    return () => {
      if (autoSlideTimer.current) clearTimeout(autoSlideTimer.current);
    };
  }, [activeIndex, resetAutoSlide, totalReviews]);

  const handlePrev = () => {
    const idx = (activeIndex - 1 + totalReviews) % totalReviews;
    scrollToIndex(idx);
    resetAutoSlide();
  };

  const handleNext = () => {
    const idx = (activeIndex + 1) % totalReviews;
    scrollToIndex(idx);
    resetAutoSlide();
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const scrollLeft = track.scrollLeft;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - track.offsetLeft - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

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

  if (!reviews.length) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
        No customer reviews available yet.
      </div>
    );
  }

  return (
    <div className="relative group/carousel">
      {/* Scrollable Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={`flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } select-none`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="w-[85vw] sm:w-[calc(50%-8px)] flex-shrink-0 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative hover:shadow-md hover:border-indigo-300 transition-all duration-300 snap-start flex flex-col justify-between"
          >
            <div>
              <Quote className="w-8 h-8 text-indigo-50/80 absolute top-4 right-4 z-0 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-550 to-indigo-650 text-white font-black text-xs sm:text-sm flex items-center justify-center font-mono shrink-0 shadow-xs">
                  {getInitials(review.name)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                    {review.name}
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold block truncate">
                    {review.source}
                  </span>
                </div>
              </div>

              <div className="flex text-amber-500 text-xs mb-2.5 relative z-10">
                {[...Array(review.rating)].map((_, idx) => (
                  <Star key={`${review.id}-${idx}`} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>

              <p className="text-slate-600 font-normal text-xs sm:text-[13px] leading-relaxed italic relative z-10 line-clamp-5">
                "{review.comment}"
              </p>
            </div>
            
            {review.createdAt && (
              <div className="text-[10px] text-slate-400 font-semibold mt-3 pt-2.5 border-t border-slate-100/60 text-right">
                Visited: {review.createdAt}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Prev / Next Navigation Controls */}
      {totalReviews > 1 && (
        <div className="flex items-center justify-between mt-2">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  scrollToIndex(i);
                  resetAutoSlide();
                }}
                aria-label={`Go to review ${i + 1}`}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? 'w-5 h-1.5 bg-indigo-650'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-indigo-300'
                }`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous review"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:bg-indigo-655 hover:text-white hover:border-indigo-655 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next review"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:bg-indigo-655 hover:text-white hover:border-indigo-655 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
