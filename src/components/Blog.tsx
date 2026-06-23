import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { BlogPost } from '../types';
import { BookOpen, User, Calendar, Tag, ArrowRight, ChevronLeft } from 'lucide-react';

export default function Blog() {
  const { blogs } = useData();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Format Date format
  const formatDate = (isoString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(isoString).toLocaleDateString('en-US', options);
    } catch {
      return 'May 2026';
    }
  };

  return (
    <div className="py-12 bg-slate-50/20 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {selectedPost ? (
          /* Detailed Single-Blog Expanded View */
          <div className="max-w-3xl mx-auto pb-16">
            
            {/* Back to Blog Directory link */}
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-bold text-xs sm:text-sm mb-8 transition-colors group cursor-pointer"
            >
              <ChevronLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to all travel guides</span>
            </button>

            {/* Post Header */}
            <article className="space-y-6">
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPost.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-[10px] text-indigo-600 font-black rounded-lg border border-indigo-100">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-slate-900 leading-tight">
                  {selectedPost.title}
                </h1>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pb-6 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>{selectedPost.author}</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formatDate(selectedPost.createdAt)}</span>
                  </span>
                </div>
              </div>

              {/* Large Image */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Real Content Body (with paragraph parsing for nice styled custom block) */}
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-5 pt-4">
                {selectedPost.content.split('\n\n').map((paragraph, index) => {
                  // Custom rendering for headings or list styles
                  if (paragraph.startsWith('###')) {
                    return (
                      <h3 key={index} className="text-xl font-bold font-sans text-slate-900 mt-6 pt-2 block">
                        {paragraph.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('#')) {
                    return (
                      <h2 key={index} className="text-2xl font-black font-sans text-slate-900 mt-8 block">
                        {paragraph.replace('#', '').trim()}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
                    const listItems = paragraph.split('\n');
                    return (
                      <ul key={index} className="list-disc list-inside space-y-1.5 pl-4">
                        {listItems.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-slate-600 font-medium">
                            {item.replace(/^[-*]\s+/, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  
                  return <p key={index} className="text-slate-600">{paragraph}</p>;
                })}
              </div>

            </article>

          </div>
        ) : (
          /* Directory List View of Blogs */
          <div className="space-y-12">
            
            {/* Header Desk */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-650 border border-indigo-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Travel Guides & Checklists</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight mb-3">
                The ColorMyTrip <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Expedition Blog</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Tips, tricks, and comprehensive guides written directly by our trekking staff and on-location crew to help you choose the ideal trip.
              </p>
            </div>

            {/* Grid of blog lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-lg hover:border-indigo-400/30 cursor-pointer active:scale-[0.99] transition-all duration-300 group"
                >
                  
                  {/* Blog cover image */}
                  <div className="aspect-[16/10] w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-[9px] text-indigo-650 font-bold uppercase rounded border border-indigo-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-[17px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug tracking-tight mb-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    {/* Footer Row */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold">
                        <span className="flex items-center gap-0.5">
                          <User className="w-3 h-3 text-indigo-400" />
                          <span>{post.author.split(' ')[0]}</span>
                        </span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      
                      <span className="text-xs font-bold text-indigo-605 group-hover:text-indigo-700 flex items-center gap-0.5">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>

                  </div>

                </article>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
