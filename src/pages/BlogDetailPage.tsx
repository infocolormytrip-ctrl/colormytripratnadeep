import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ChevronLeft, Tag, User, Calendar } from 'lucide-react';
import { titleToSlug } from './BlogListPage';

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

const renderBlogContent = (content: string) => {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="blog-content-body text-slate-650 text-sm sm:text-base leading-relaxed font-normal pt-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-slate-600 [&_p]:font-normal [&_p]:leading-relaxed [&_p]:mb-4 [&_a]:text-indigo-600 [&_a]:underline [&_a]:font-semibold [&_a]:hover:text-indigo-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_li]:text-slate-600 [&_li]:font-normal [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-6 [&_img]:shadow-md [&_img]:border [&_img]:border-slate-100"
      />
    );
  }

  return (
    <div className="blog-content-body text-slate-650 text-sm sm:text-base leading-relaxed font-normal space-y-5 pt-4">
      {content.split('\n\n').map((paragraph, index) => {
        if (paragraph.startsWith('###')) {
          return <h3 key={index} className="text-xl font-bold text-slate-900 mt-6 pt-2 block">{paragraph.replace('###', '').trim()}</h3>;
        }
        if (paragraph.startsWith('##') || paragraph.startsWith('#')) {
          return <h2 key={index} className="text-2xl font-black text-slate-900 mt-8 block">{paragraph.replace(/^#+\s*/, '').trim()}</h2>;
        }
        if (paragraph.startsWith('-') || paragraph.startsWith('*')) {
          const listItems = paragraph.split('\n');
          return (
            <ul key={index} className="list-disc list-inside space-y-1.5 pl-4 mb-4">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="text-slate-600 font-normal">{item.replace(/^[-*]\s+/, '')}</li>
              ))}
            </ul>
          );
        }
        return <p key={index} className="text-slate-600 font-normal leading-relaxed">{paragraph}</p>;
      })}
    </div>
  );
};

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { blogs } = useData();

  // Find blog by matching its slug against the title
  // React Router automatically decodes the URL parameter, so we compare it
  // against the unencoded version of the title-slug.
  const post = blogs.find((b) => {
    try {
      const expectedSlug = b.title.trim().replace(/\s+/g, '_');
      return expectedSlug === slug;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | ColorMyTrip Blog`;
    } else {
      document.title = 'Blog Post Not Found | ColorMyTrip';
    }
  }, [post]);

  if (!post && blogs.length === 0) {
    // Still loading
    return <div className="py-12 min-h-[50vh]" />;
  }

  if (!post) {
    return (
      <div className="py-16 bg-slate-50/30 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10">
            <h1 className="text-xl font-bold text-slate-900 mb-2">Blog post not found</h1>
            <p className="text-slate-500 text-sm mb-6">The article you're looking for may have been moved or renamed.</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50/30 min-h-[75vh] animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Back button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-150 hover:shadow-xs px-4 py-2 rounded-full font-bold text-xs transition-all duration-200 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Travel Guides</span>
        </Link>

        <article className="space-y-6 mt-8">
          {/* Tags + reading time */}
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-[10px] text-indigo-600 font-bold uppercase rounded-md border border-indigo-100">
                #{tag}
              </span>
            ))}
            <span className="px-2.5 py-0.5 bg-slate-100 text-[10px] text-slate-500 font-bold uppercase rounded-md">
              {getReadingTime(post.content)}
            </span>
          </div>

          {/* H1 Title — this is what forms the slug */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {post.title}
          </h1>

          {/* Author + date */}
          <div className="flex items-center gap-3 text-xs text-slate-500 pb-5 border-b border-slate-150 mt-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs uppercase">
              {getAuthorInitials(post.author)}
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-none">{post.author}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Cover image */}
          <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Content */}
          {renderBlogContent(post.content)}
        </article>

        {/* CTA at bottom */}
        <div className="mt-12 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
          <p className="text-sm font-bold text-slate-800 mb-1">Ready to plan your trip?</p>
          <p className="text-xs text-slate-500 mb-4">Let our experts create a custom itinerary just for you.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all"
          >
            Get a Free Quote
          </Link>
        </div>

      </div>
    </div>
  );
}
