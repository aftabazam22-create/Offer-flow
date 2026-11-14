import React, { useState } from 'react';
import { BookOpen, Calendar, User, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { BlogPost } from '../types.js';
import { useStore } from '../context/StoreContext.js';

interface BlogViewProps {
  blogs: BlogPost[];
}

export const BlogView: React.FC<BlogViewProps> = ({ blogs }) => {
  const { t } = useStore();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  if (selectedPost) {
    return (
      <article className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
        <button
          onClick={() => setSelectedPost(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('Back to all articles', 'সকল আর্টিকেলে ফিরে যান')}</span>
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold">
              {selectedPost.category}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(selectedPost.publishedAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>4 min read</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {selectedPost.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-600 pb-4 border-b border-slate-100">
            <User className="w-4 h-4 text-slate-400" />
            <span>By <strong className="text-slate-800">{selectedPost.author}</strong></span>
          </div>
        </div>

        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={selectedPost.featuredImage}
            alt={selectedPost.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {selectedPost.content}
        </div>

        {selectedPost.tags && selectedPost.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            {selectedPost.tags.map((tg, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
              >
                #{tg}
              </span>
            ))}
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>{t('Offer Flow Articles & Insights', 'নিবন্ধ ও শপিং গাইড')}</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
          {t('Shopping Guides & Tech Reviews', 'শপিং গাইড ও টেকনিক্যাল রিভিউ')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          {t(
            'Expert tips, authentic gadget buying guides, and trending lifestyle hacks for conscious shoppers in Bangladesh.',
            'বাংলাদেশে স্মার্ট কেনাকাটার সেরা পরামর্শ এবং গ্যাজেট রিভিউ।'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            onClick={() => setSelectedPost(blog)}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-100">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-5 flex flex-col flex-1 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold">
                  {blog.category}
                </span>
                <span>4 min read</span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">
                {blog.title}
              </h2>

              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {blog.excerpt}
              </p>

              <div className="pt-2 mt-auto border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{blog.author}</span>
                <span className="font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {t('Read Article', 'পড়ুন')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
