import React, { useState } from 'react';
import { initialGallery } from '../initialData';
import { Camera, Compass, Maximize2, Tag, X } from 'lucide-react';

export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const [activeImage, setActiveImage] = useState<typeof initialGallery[0] | null>(null);

  const categories = [
    { name: 'All Pixels', id: 'all' },
    { name: 'Domestic Tour', id: 'domestic' },
    { name: 'International Tour', id: 'international' },
    { name: 'Trekking Trails', id: 'trekking' }
  ];

  const filteredItems = filter === 'all' 
    ? initialGallery 
    : initialGallery.filter(item => item.category === filter);

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>Captured Moments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight mb-3">
            Our Visual <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Travel Diary</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Original untampered photographs taken directly on the field by our directors, trek leaders, and tourists.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                filter === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-800 border border-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Image Grid with elegant overlays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-350"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">
                  {item.category}
                </span>
                <h4 className="text-white font-bold text-sm sm:text-base tracking-tight flex items-center justify-between">
                  <span>{item.title}</span>
                  <Maximize2 className="w-4 h-4 text-white/80" />
                </h4>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeImage && (
          <div className="fixed inset-0 bg-slate-900/90 z-[100] backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl w-full text-center space-y-4">
              <div className="aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={activeImage.image}
                  alt={activeImage.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex justify-between items-center text-white px-2">
                <div>
                  <h4 className="text-base sm:text-lg font-bold tracking-tight text-white mb-0.5">
                    {activeImage.title}
                  </h4>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest text-left">
                    {activeImage.category} Pack
                  </p>
                </div>
                <button
                  onClick={() => setActiveImage(null)}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
                >
                  Close Photo
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
