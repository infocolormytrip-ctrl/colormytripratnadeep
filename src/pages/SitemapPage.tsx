import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Map, Package, BookOpen, Home, Info, Phone, ExternalLink } from 'lucide-react';
import { titleToSlug } from './BlogListPage';

export default function SitemapPage() {
  const { packages, blogs } = useData();

  useEffect(() => {
    document.title = 'Sitemap | ColorMyTrip – All Pages & Links';
  }, []);

  const staticPages = [
    { label: 'Home', path: '/', desc: 'Main landing page with featured packages and testimonials' },
    { label: 'About Us', path: '/about', desc: 'Our story, team, and company values' },
    { label: 'All Packages', path: '/packages', desc: 'Browse all travel packages — domestic, international, trekking' },
    { label: 'Domestic Tours', path: '/packages?category=domestic', desc: 'India domestic tour packages' },
    { label: 'International Tours', path: '/packages?category=international', desc: 'International tour packages' },
    { label: 'Trekking Trails', path: '/packages?category=trekking', desc: 'Himalayan trekking packages' },
    { label: 'Blog', path: '/blog', desc: 'Travel guides, tips, and itinerary articles' },
    { label: 'Contact Us', path: '/contact', desc: 'Send an enquiry or get a custom quote' },
  ];

  const sortedPackages = [...packages].sort((a, b) => {
    const dateA = new Date((a as any).createdAt || 0).getTime();
    const dateB = new Date((b as any).createdAt || 0).getTime();
    return dateB - dateA;
  });

  const sortedBlogs = [...blogs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="py-14 bg-slate-50/30 min-h-[75vh] animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[11px] font-bold tracking-wider uppercase mb-4">
            <Map className="w-3.5 h-3.5" />
            <span>Full Site Index</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            ColorMyTrip Sitemap
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            A complete directory of all pages, packages, and blog posts on the ColorMyTrip website.
            Use this page to find anything quickly or share individual tour pages.
          </p>
        </div>

        <div className="space-y-10">

          {/* Static Pages */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-4 h-4 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-900">Main Pages</h2>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{staticPages.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {staticPages.map(({ label, path, desc }) => (
                <Link
                  key={path}
                  to={path}
                  className="group bg-white rounded-xl border border-slate-100 p-4 hover:border-indigo-200 hover:shadow-sm transition-all flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{desc}</p>
                    <p className="text-[10px] text-indigo-500 font-mono mt-1">{path}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Packages */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-900">Travel Packages</h2>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{packages.length}</span>
            </div>
            {sortedPackages.length === 0 ? (
              <p className="text-slate-400 text-sm">No packages available yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {sortedPackages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    to={`/package/${pkg.slug || pkg.id}`}
                    className="group bg-white rounded-xl border border-slate-100 p-3 hover:border-emerald-200 hover:shadow-sm transition-all flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <span className="text-[10px]">
                        {pkg.category === 'trekking' ? '🏔️' : pkg.category === 'domestic' ? '🇮🇳' : '✈️'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-[12px] leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">{pkg.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">/package/{pkg.slug || pkg.id}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Blog Posts */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-violet-600" />
              <h2 className="text-lg font-black text-slate-900">Blog Articles</h2>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{blogs.length}</span>
            </div>
            {sortedBlogs.length === 0 ? (
              <p className="text-slate-400 text-sm">No blog posts yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sortedBlogs.map((post) => {
                  const slug = titleToSlug(post.title);
                  return (
                    <Link
                      key={post.id}
                      to={`/blogs/${slug}`}
                      className="group bg-white rounded-xl border border-slate-100 p-3 hover:border-violet-200 hover:shadow-sm transition-all flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                        <BookOpen className="w-3 h-3 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-[12px] leading-snug group-hover:text-violet-700 transition-colors line-clamp-2">{post.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">/blogs/{decodeURIComponent(slug).slice(0, 40)}…</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* Footer note */}
        <div className="mt-12 p-4 bg-white rounded-xl border border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            XML sitemap available at{' '}
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline font-mono">
              /sitemap.xml
            </a>{' '}
            for Google &amp; search engine crawlers.
          </p>
        </div>

      </div>
    </div>
  );
}
