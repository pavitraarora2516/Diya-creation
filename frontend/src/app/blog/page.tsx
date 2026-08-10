'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function BlogListingPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await api.get<any[]>('/blog');
        setPosts(res);
      } catch (e) {
        console.error('Failed to load blog posts', e);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/25 px-4 py-1 rounded-full text-gold-400">
              <BookOpen className="h-4 w-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Inspiration & Stories</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold-300">The Diya Journal</h1>
            <p className="text-xs text-obsidian-400 font-light leading-relaxed">
              Explore chocolate craft secrets, personalization ideas, corporate gifting checklists, and celebration stories.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel h-96 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel p-16 text-center rounded-lg space-y-4 max-w-md mx-auto border-gold-500/10">
              <BookOpen className="h-12 w-12 text-gold-500/20 mx-auto" />
              <h3 className="text-lg font-serif font-semibold text-gold-300">No Journal Entries</h3>
              <p className="text-xs text-obsidian-400 font-light leading-relaxed">
                We are preparing sweet entries and expert chocolatier advice. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="glass-panel group rounded-lg overflow-hidden flex flex-col justify-between hover:border-gold-500/30 transition-all duration-300">
                  <div>
                    {/* Blog Cover Image */}
                    {post.imageUrl && (
                      <div className="h-52 overflow-hidden bg-obsidian-900 border-b border-gold-500/5">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      {/* Meta info */}
                      <div className="flex items-center space-x-3 text-[10px] text-obsidian-400 font-light">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gold-500" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gold-500" />
                          <span>{post.author}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-serif font-bold text-obsidian-100 group-hover:text-gold-300 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-obsidian-400 font-light leading-relaxed line-clamp-3">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-gold-400 hover:text-gold-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1 group-hover:translate-x-1 transition-all"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
