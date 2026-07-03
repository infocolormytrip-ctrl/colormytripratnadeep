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

  // Get author name initials
  const getAuthorInitials = (name: string) => {
    if (!name) return 'CMT';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Estimate reading time
  const getReadingTime = (text: string) => {
    if (!text) return '3 min read';
    const wordCount = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 220);
    return `${Math.max(3, minutes)} min read`;
  };

  // SEO Friendly content rendering block (supporting rich HTML from editor + backward compatibility)
  const renderBlogContent = (content: string) => {
    const isHtml = /<[a-z][\s\S]*>/i.test(content);
    
    if (isHtml) {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }} 
          className="blog-content-body text-slate-650 text-sm sm:text-base leading-relaxed font-normal pt-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:font-display [&_h1]:text-slate-900 [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:font-display [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-slate-600 [&_p]:font-normal [&_p]:leading-relaxed [&_p]:mb-4 [&_a]:text-indigo-650 [&_a]:underline [&_a]:font-semibold [&_a]:hover:text-indigo-850 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_li]:text-slate-600 [&_li]:font-normal [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-6 [&_img]:shadow-md [&_img]:border [&_img]:border-slate-100 [&_img]:inline-block"
        />
      );
    }

    // Markdown/Plain text parser fallback
    return (
      <div className="blog-content-body text-slate-650 text-sm sm:text-base leading-relaxed font-normal space-y-5 pt-4">
        {content.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('###')) {
            return (
              <h3 key={index} className="text-xl font-bold font-sans text-slate-900 mt-6 pt-2 block">
                {paragraph.replace('###', '').trim()}
              </h3>
            );
          }
          if (paragraph.startsWith('##') || paragraph.startsWith('#')) {
            return (
              <h2 key={index} className="text-2xl font-black font-display text-slate-900 mt-8 block">
                {paragraph.replace(/^#+\s*/, '').trim()}
              </h2>
            );
          }
          if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
            const listItems = paragraph.split('\n');
            return (
              <ul key={index} className="list-disc list-inside space-y-1.5 pl-4 mb-4">
                {listItems.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-slate-600 font-normal">
                    {item.replace(/^[-*]\s+/, '')}
                  </li>
                ))}
              </ul>
            );
          }
          
          return <p key={index} className="text-slate-600 font-normal leading-relaxed">{paragraph}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="py-16 bg-slate-50/30 min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {selectedPost ? (
          /* Detailed Single-Blog Expanded View */
          <div className="max-w-3xl mx-auto pb-16">
            
            {/* Back to Blog Directory link */}
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-650 hover:border-indigo-150 hover:shadow-xs px-4 py-2 rounded-full font-bold text-xs transition-all duration-200 group cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Travel Guides</span>
            </button>

            {/* Post Header */}
            <article className="space-y-6 mt-8">
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedPost.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-[10px] text-indigo-650 font-bold uppercase rounded-md border border-indigo-100">
                      #{tag}
                    </span>
                  ))}
                  <span className="px-2.5 py-0.5 bg-slate-100 text-[10px] text-slate-500 font-bold uppercase rounded-md">
                    {getReadingTime(selectedPost.content)}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-slate-900 leading-tight">
                  {selectedPost.title}
                </h1>

                {/* Metadata row with Avatar initials */}
                <div className="flex items-center gap-3 text-xs text-slate-500 pb-5 border-b border-slate-150 mt-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs uppercase">
                    {getAuthorInitials(selectedPost.author)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 leading-none">{selectedPost.author}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{formatDate(selectedPost.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Content Body */}
              {renderBlogContent(selectedPost.content)}

            </article>

          </div>
        ) : (
          /* Directory List View of Blogs */
          <div className="space-y-12">
            
            {/* Header Desk */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-650 border border-indigo-100 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Travel Guides & Checklists</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight mb-4">
                The ColorMyTrip <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8 decoration-3">Expedition Blog</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed">
                Expert tips, travel hacks, and detailed itineraries written by our trekking staff and trip planners to help you prep for your next big escape.
              </p>
            </div>

            {/* Grid of blog lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full hover:shadow-xl hover:border-indigo-400/40 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-350 group"
                >
                  
                  {/* Blog cover image */}
                  <div className="aspect-[16/10] w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded-md font-bold font-mono">
                      {getReadingTime(post.content)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-[9px] text-indigo-650 font-bold uppercase rounded border border-indigo-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug tracking-tight mb-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed line-clamp-3 mb-5 font-normal">
                      {post.excerpt}
                    </p>

                    {/* Footer Row */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      
                      {/* Initials avatar circle */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black text-[9px] flex items-center justify-center uppercase shadow-xs">
                          {getAuthorInitials(post.author)}
                        </div>
                        <span className="text-[11px] text-slate-600 font-bold">{post.author.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">({formatDate(post.createdAt)})</span>
                      </div>
                      
                      <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-0.5">
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
