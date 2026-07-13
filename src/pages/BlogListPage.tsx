import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { BookOpen, ArrowRight } from 'lucide-react';

/** Convert a blog title to a URL-safe slug */
export function titleToSlug(title: string): string {
  return encodeURIComponent(title.trim().replace(/\s+/g, '_'));
}

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return 'May 2026';
  }
}

function getAuthorInitials(name: string) {
  if (!name) return 'CMT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getReadingTime(text: string) {
  if (!text) return '3 min read';
  const wordCount = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 220);
  return `${Math.max(3, minutes)} min read`;
}

export default function BlogListPage() {
  const { blogs } = useData();
  const navigate = useNavigate();

  // Sort blogs newest first
  const sortedBlogs = [...blogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  useEffect(() => {
    document.title = 'Travel Blog & Guides | ColorMyTrip – Expert Tips & Itineraries';
  }, []);

  return (
    <div className="py-16 bg-slate-50/30 min-h-[75vh] animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Travel Guides &amp; Checklists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            The ColorMyTrip{' '}
            <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8 decoration-3">
              Expedition Blog
            </span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed">
            Expert tips, travel hacks, and detailed itineraries written by our trekking staff and trip planners
            to help you prep for your next big escape.
          </p>
        </div>

        {/* Blog grid */}
        {sortedBlogs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedBlogs.map((post) => {
              const slug = titleToSlug(post.title);
              return (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blogs/${slug}`)}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full hover:shadow-xl hover:border-indigo-400/40 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-350 group"
                >
                  {/* Cover image */}
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

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-[9px] text-indigo-600 font-bold uppercase rounded border border-indigo-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug tracking-tight mb-2">
                      {post.title}
                    </h2>

                    <p className="text-slate-500 text-xs sm:text-[13px] leading-relaxed line-clamp-3 mb-5 font-normal">
                      {post.excerpt}
                    </p>

                    {/* Footer row */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
