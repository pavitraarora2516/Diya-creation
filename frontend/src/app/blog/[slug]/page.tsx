'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import api from '../../../utils/api';

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await api.get<any>(`/blog/${slug}`);
        setPost(res);
      } catch (e: any) {
        setError(e.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-8">
          {/* Back to Blog */}
          <Link
            href="/blog"
            className="inline-flex items-center space-x-1.5 text-xs text-gold-400 hover:text-gold-300 font-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Journal</span>
          </Link>

          {loading ? (
            <div className="space-y-6 py-12 animate-pulse">
              <div className="h-10 bg-obsidian-900 rounded w-3/4" />
              <div className="h-4 bg-obsidian-900 rounded w-1/4" />
              <div className="h-96 bg-obsidian-900 rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-obsidian-900 rounded" />
                <div className="h-4 bg-obsidian-900 rounded" />
                <div className="h-4 bg-obsidian-900 rounded w-5/6" />
              </div>
            </div>
          ) : error ? (
            <div className="glass-panel p-12 text-center rounded-lg space-y-4 border-red-500/20 max-w-md mx-auto">
              <h3 className="text-lg font-serif font-semibold text-red-400">Article Not Found</h3>
              <p className="text-xs text-obsidian-400 font-light leading-relaxed">
                The article you are looking for does not exist or may have been archived.
              </p>
              <div className="pt-2">
                <Link
                  href="/blog"
                  className="inline-block bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-6 py-2.5 rounded text-xs uppercase tracking-wider transition-colors"
                >
                  Return to Journal
                </Link>
              </div>
            </div>
          ) : post ? (
            <article className="space-y-8">
              {/* Header Details */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold-300 leading-tight">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-obsidian-400 font-light border-b border-gold-500/10 pb-5">
                  <span className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-gold-500" />
                    <span className="font-semibold text-obsidian-200">{post.author}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gold-500" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold-500" />
                    <span>5 Min Read</span>
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              {post.imageUrl && (
                <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gold-500/10">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Blog Content */}
              <div className="prose prose-invert max-w-none text-obsidian-300 leading-relaxed font-light text-sm space-y-6">
                {/* Content body split into paragraphs */}
                {post.content.split('\n\n').map((para: string, idx: number) => (
                  <p key={idx} className="whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
