'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadWishlist();
  }, [token]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get<any[]>('/wishlist');
      setWishlistItems(res);
    } catch (e) {
      console.error('Failed to load wishlist items', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
    } catch (e) {
      alert('Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (product: any) => {
    try {
      // Add product to cart with quantity 1
      await api.post('/orders/cart', {
        productId: product.id,
        quantity: 1,
      });
      // Remove from wishlist
      await handleRemove(product.id);
      alert('Product moved to your shopping cart!');
    } catch (e: any) {
      alert(e.message || 'Failed to move product to cart');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="space-y-8">
          {/* Breadcrumb / Go back */}
          <div className="flex items-center space-x-2 text-xs text-gold-400 font-light">
            <Link href="/shop" className="hover:text-gold-300 flex items-center space-x-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Shop</span>
            </Link>
          </div>

          <div className="border-b border-gold-500/10 pb-5">
            <h1 className="text-4xl font-serif font-bold text-gold-300 flex items-center space-x-3">
              <Heart className="h-8 w-8 text-gold-500 fill-gold-500/10" />
              <span>My Wishlist</span>
            </h1>
            <p className="text-xs text-obsidian-400 font-light mt-1.5">
              Your saved premium chocolates, bespoke wooden frames, and luxury creations.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel h-80 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="glass-panel p-16 text-center rounded-lg space-y-4 max-w-xl mx-auto border-gold-500/10">
              <Heart className="h-12 w-12 text-gold-500/30 mx-auto" />
              <h3 className="text-lg font-serif font-semibold text-gold-300">Your Wishlist is Empty</h3>
              <p className="text-xs text-obsidian-400 font-light leading-relaxed max-w-xs mx-auto">
                Explore our catalog of hand-crafted treats and customized keepsakes, and tap the heart icon to save your favorites.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-block bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider transition-colors"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {wishlistItems.map((item) => {
                const prod = item.product;
                if (!prod) return null;
                const primaryImage = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80';

                return (
                  <div key={item.id} className="glass-panel group rounded-lg overflow-hidden flex flex-col justify-between hover:border-gold-500/35 transition-all duration-300">
                    <div className="relative">
                      {/* Product Image */}
                      <div className="relative h-64 bg-obsidian-900 overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={() => handleRemove(prod.id)}
                          className="absolute top-4 right-4 bg-obsidian-950/80 border border-gold-500/10 hover:border-red-500/50 hover:bg-red-950/30 text-obsidian-300 hover:text-red-400 p-2.5 rounded-full transition-all cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-5 space-y-2">
                        <div className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">
                          {prod.category?.name || 'Creation'}
                        </div>
                        <h3 className="text-lg font-serif font-bold text-obsidian-100 line-clamp-1 leading-snug">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-obsidian-400 font-light line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-gold-500/5 mt-4 flex items-center justify-between">
                      <div className="font-serif font-bold text-gold-300 text-lg">
                        &#8377; {prod.price.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleMoveToCart(prod)}
                        className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add To Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
