import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Play } from 'lucide-react';
import { VideoTestimonial } from '../types';

interface VideoTestimonialsProps {
  videos: VideoTestimonial[];
}

export default function VideoTestimonials({ videos }: VideoTestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-3xl">
        <p className="text-slate-400 text-sm font-semibold">No video testimonials yet</p>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(false);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-3xl overflow-hidden flex flex-col group">
      {/* Video Container (Vertical Reel Format) */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`${currentVideo.videoUrl}?autoplay=${isPlaying ? 1 : 0}`}
          title={currentVideo.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />

        {/* Play Button Overlay (if not playing) */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Video Info Section */}
      <div className="bg-gradient-to-t from-slate-950 to-slate-900 p-5 space-y-2 border-t border-slate-800">
        <div>
          <p className="font-black text-white text-sm sm:text-base leading-tight">
            {currentVideo.name}
          </p>
          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mt-1">
            {currentVideo.title}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span>{currentVideo.location}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600" />
          <span>{currentVideo.duration}s</span>
        </div>

        {/* Navigation Dots */}
        <div className="flex gap-1.5 pt-2">
          {videos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(false);
              }}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-amber-400 w-6'
                  : 'bg-slate-600 w-1.5 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrow Buttons */}
      <button
        onClick={handlePrev}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous video"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next video"
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Counter Badge */}
      <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
        {currentIndex + 1}/{videos.length}
      </div>
    </div>
  );
}
