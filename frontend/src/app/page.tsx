'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gift, Calendar, Heart, Star, Sparkles, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

export default function Home() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load featured products & recent blogs
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, blogRes] = await Promise.all([
          api.get<any[]>('/products?isFeatured=true'),
          api.get<any[]>('/blog'),
        ]);
        setProducts(prodRes.slice(0, 3));
        setBlogs(blogRes.slice(0, 3));
      } catch (e) {
        console.error('Failed to load landing data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch wishlist IDs if authenticated
  useEffect(() => {
    if (token) {
      api.get<any[]>('/wishlist')
        .then(res => setWishlistIds(res.map(item => item.productId)))
        .catch(() => {});
    }
  }, [token]);

  const handleToggleWishlist = async (productId: string) => {
    if (!token) {
      alert('Please sign in to save creations to your wishlist.');
      return;
    }
    const exists = wishlistIds.includes(productId);
    try {
      if (exists) {
        await api.delete(`/wishlist/${productId}`);
        setWishlistIds(prev => prev.filter(id => id !== productId));
      } else {
        await api.post(`/wishlist/${productId}`, {});
        setWishlistIds(prev => [...prev, productId]);
      }
    } catch (e) {
      alert('Failed to update wishlist preferences.');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col font-sans selection:bg-gold-200 selection:text-obsidian-950">
      <Header />

      {/* 1. Cinematic Luxury Editorial Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-8 pb-16 overflow-hidden">
        {/* Subtle decorative background glows */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-gold-100/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-200/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Editorial Headline */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.3em] text-gold-500 font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>The Art of Giving</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif leading-[1.1] font-normal text-obsidian-50 max-w-lg">
                Thoughtfully Crafted.<br />
                <span className="italic text-gold-500">Beautifully Remembered.</span>
              </h1>

              <p className="text-sm font-light text-obsidian-300 leading-relaxed max-w-md">
                Discover beautifully crafted gifts, indulgent hand-rolled chocolates, and personalized keepsakes designed for life's most meaningful celebrations.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto text-center bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-8 py-3.5 rounded text-xs uppercase tracking-widest transition-all"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/hamper-builder"
                  className="w-full sm:w-auto text-center border border-gold-500/25 hover:border-gold-500 text-obsidian-200 hover:text-gold-500 px-8 py-3.5 rounded text-xs uppercase tracking-widest transition-colors"
                >
                  Create Your Gift
                </Link>
              </div>
            </div>

            {/* Right Column: AI-Generated Editorial Visual Showcase */}
            <div className="lg:col-span-6">
              <div className="relative group overflow-hidden rounded-lg border border-gold-500/10 shadow-lg bg-obsidian-900/50">
                <img
                  src="/images/hero_composition.png"
                  alt="Premium gift and chocolate composition"
                  className="w-full h-auto object-cover group-hover:scale-101 transition-transform duration-[1200ms] ease-out"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Made for Meaningful Moments */}
      <section className="py-24 bg-obsidian-900/30 border-t border-b border-gold-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 space-y-6">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold-500 font-bold block">Our Craft Philosophy</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-obsidian-50 leading-tight">
                Made for Meaningful Moments
              </h2>
              <p className="text-xs font-light text-obsidian-300 leading-relaxed">
                At Diya Creation, we believe a gift is more than an object; it is an emotion made physical. Each selection is carefully curated, wrapped by hand in textured packaging, and delivered with immaculate precision.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="text-xs font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600 flex items-center space-x-1"
                >
                  <span>Learn about our Atelier</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="md:col-span-7">
              <div className="rounded-lg overflow-hidden border border-gold-500/5">
                <img
                  src="/images/our_craft.png"
                  alt="Master chocolatier dusting fine cocoa truffles"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[9px] uppercase tracking-[0.3em] text-gold-500 font-bold block">Curated Collections</span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal text-obsidian-50">
            Browse by Occasion
          </h2>
          <p className="text-obsidian-400 font-light text-xs max-w-md mx-auto leading-relaxed">
            Beautifully art-directed gift sets tailored for life's celebrated milestones and seasonal celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Birthday Gifting', img: '/images/category_birthday.png', slug: 'birthday' },
            { title: 'Anniversaries', img: '/images/category_anniversary.png', slug: 'anniversary' },
            { title: 'Weddings', img: '/images/category_wedding.png', slug: 'wedding' },
            { title: 'Festivals', img: '/images/category_festival.png', slug: 'festivals' },
            { title: 'Corporate Portal', img: '/images/category_corporate.png', slug: 'corporate' },
            { title: 'Personalized', img: '/images/category_personalized.png', slug: 'personalized' },
          ].map((cat, idx) => (
            <Link
              key={idx}
              href={`/shop?category=${cat.slug}`}
              className="glass-panel group rounded-lg overflow-hidden flex flex-col justify-between hover:border-gold-500/30 transition-all duration-500"
            >
              <div className="relative h-64 bg-obsidian-900/20 overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />
              </div>
              <div className="p-5 flex items-center justify-between">
                <h3 className="text-base font-serif font-medium text-obsidian-100 group-hover:text-gold-500 transition-colors">
                  {cat.title}
                </h3>
                <ArrowRight className="h-4 w-4 text-gold-500 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Signature Collection (Products Grid) */}
      <section className="py-24 bg-obsidian-900/10 border-t border-gold-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-baseline mb-16 border-b border-gold-500/5 pb-6">
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold-500 font-bold block">Signature Collection</span>
              <h2 className="text-3xl font-serif font-normal text-obsidian-50">Masterpieces</h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest font-bold text-gold-500 hover:underline flex items-center space-x-1 mt-4 sm:mt-0"
            >
              <span>View All Creations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel h-[420px] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-12 text-obsidian-400 font-light text-xs">
              No featured creations found. Explore the Shop page to browse our catalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((prod) => {
                const isSaved = wishlistIds.includes(prod.id);
                const primaryImage = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80';

                return (
                  <div
                    key={prod.id}
                    className="glass-panel group rounded-lg overflow-hidden flex flex-col justify-between hover:border-gold-500/25 transition-all duration-300"
                  >
                    <div>
                      {/* Product Visual */}
                      <div className="relative h-72 bg-obsidian-900/30 overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        {/* Wishlist toggle */}
                        <button
                          onClick={() => handleToggleWishlist(prod.id)}
                          className="absolute top-4 right-4 bg-obsidian-950/70 border border-gold-500/10 p-2 rounded-full text-obsidian-300 hover:text-gold-500 transition-colors cursor-pointer"
                          title="Save to Wishlist"
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? 'fill-gold-500 text-gold-500' : ''}`} />
                        </button>
                      </div>

                      {/* Info details */}
                      <div className="p-6 space-y-2">
                        <span className="text-[9px] uppercase tracking-widest text-gold-500 font-bold">
                          {prod.category?.name || 'Creation'}
                        </span>
                        <h3 className="text-lg font-serif font-bold text-obsidian-100 group-hover:text-gold-500 transition-colors line-clamp-1 leading-snug">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-obsidian-400 font-light line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom grid elements */}
                    <div className="p-6 pt-0 border-t border-gold-500/5 mt-4 flex items-center justify-between">
                      <span className="text-lg font-serif font-bold text-gold-500">
                        &#8377; {prod.price.toFixed(2)}
                      </span>
                      <Link
                        href={`/product/${prod.slug}`}
                        className="text-xs uppercase tracking-wider font-bold text-obsidian-200 group-hover:text-gold-500 transition-colors flex items-center space-x-1"
                      >
                        <span>Personalize & Buy</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Custom Hamper Configurator Promo */}
      <section className="py-24 bg-obsidian-900/20 border-t border-b border-gold-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: configuration preview image */}
            <div className="lg:col-span-6 rounded-lg overflow-hidden border border-gold-500/10">
              <img
                src="/images/hamper_builder_intro.png"
                alt="Empty gift box and rolls of satin ribbons"
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Right: text description */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold-500 font-bold block">Configurator Portal</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-obsidian-50 leading-tight">
                Build Your Own Hamper
              </h2>
              <p className="text-xs font-light text-obsidian-300 leading-relaxed">
                Design custom premium hampers for baby showers, weddings, or corporate milestones. Pick a sliding tray style, add artisan truffles, select customized wraps, and compose elegant message inserts.
              </p>
              <div className="pt-2">
                <Link
                  href="/hamper-builder"
                  className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-8 py-3.5 rounded text-xs uppercase tracking-widest inline-flex items-center space-x-2"
                >
                  <span>Launch Hamper Builder</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Corporate Gifting Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[9px] uppercase tracking-[0.3em] text-gold-500 font-bold block">Business Gifting</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-obsidian-50 leading-tight">
              Corporate & Bulk Proposals
            </h2>
            <p className="text-xs font-light text-obsidian-300 leading-relaxed">
              Need customized brand packaging, custom-embossed corporate logo chocolates, or wholesale favors? Submit details, upload corporate logos, select quantities, and generate formal quotations.
            </p>
            <div className="pt-2">
              <Link
                href="/corporate"
                className="border border-gold-500/25 hover:border-gold-500 text-obsidian-200 hover:text-gold-500 px-8 py-3.5 rounded text-xs uppercase tracking-widest inline-flex items-center space-x-2 transition-colors"
              >
                <span>Corporate Gifting Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-lg overflow-hidden border border-gold-500/10">
            <img
              src="/images/category_corporate.png"
              alt="Premium executive desk accessories and gift items"
              className="w-full h-96 object-cover"
            />
          </div>

        </div>
      </section>

      {/* 7. Recent Journal Articles */}
      {blogs.length > 0 && (
        <section className="py-24 bg-obsidian-900/30 border-t border-b border-gold-500/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-[9px] uppercase tracking-[0.3em] text-gold-500 font-bold block">The Diya Journal</span>
              <h2 className="text-3xl font-serif font-normal text-obsidian-50">Inspiration & Craft</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <article key={post.id} className="glass-panel group rounded-lg overflow-hidden flex flex-col justify-between hover:border-gold-500/25 transition-all duration-300">
                  <div>
                    {post.imageUrl && (
                      <div className="h-48 overflow-hidden bg-obsidian-900/30">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center space-x-3 text-[10px] text-obsidian-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>{post.author}</span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-obsidian-100 group-hover:text-gold-500 transition-colors line-clamp-2">
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
                      className="text-gold-500 hover:text-gold-600 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                    >
                      <span>Read Story</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Final Brand Call-To-Action (Quiet luxury statement) */}
      <section className="py-28 relative overflow-hidden bg-obsidian-950 text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-100/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif font-normal text-obsidian-50">
            Give Something Worth Remembering
          </h2>
          <p className="text-xs font-light text-obsidian-300 max-w-md mx-auto leading-relaxed">
            Every curation is hand-rolled, hand-wrapped, and hand-delivered with immaculate quiet luxury care.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-10 py-4 rounded text-xs uppercase tracking-widest inline-block"
            >
              Browse Catalog
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-[10px] uppercase font-bold tracking-widest text-obsidian-500 pt-10">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-gold-500/50" />
              <span>Fresh Handmade Guarantee</span>
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
