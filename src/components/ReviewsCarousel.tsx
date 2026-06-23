import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Review } from '../types';

interface ReviewsCarouselProps {
  reviews: Review[];
}

const PAGE_SIZE = 4;

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
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const [page, setPage] = useState(0);

  const visibleReviews = useMemo(() => {
    const start = page * PAGE_SIZE;
    return reviews.slice(start, start + PAGE_SIZE);
  }, [page, reviews]);

  const handlePrev = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);
  const handleNext = () => setPage((prev) => (prev + 1) % totalPages);

  if (!reviews.length) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
        No customer reviews available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <Quote className="w-8 h-8 text-indigo-100 absolute top-4 right-4" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-black text-sm flex items-center justify-center font-mono shrink-0">
                {getInitials(review.name)}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                  {review.name}
                </p>
                <span className="text-[10px] text-slate-500 font-bold block truncate">
                  {review.source}
                </span>
              </div>
            </div>

            <div className="flex text-amber-500 text-xs mb-2">
              {[...Array(review.rating)].map((_, idx) => (
                <Star key={`${review.id}-${idx}`} className="w-3.5 h-3.5 fill-amber-500" />
              ))}
            </div>

            <p className="text-slate-600 font-normal text-xs leading-relaxed line-clamp-4">
              "{review.comment}"
            </p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <p className="text-xs text-slate-500 font-semibold">
            Page {page + 1} of {totalPages}
          </p>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
