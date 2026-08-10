'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, LogOut, LayoutDashboard, Heart, Search } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import api from '../utils/api';

export default function Header() {
  const pathname = usePathname();
  const { user, token, initialize, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (token) {
      fetchCart();
      // Fetch wishlist count
      api.get<any[]>('/wishlist')
        .then((res) => setWishlistCount(res.length))
        .catch(() => {});
    }
  }, [token, fetchCart]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-obsidian-950/95 border-b border-gold-500/10 shadow-sm backdrop-blur-md py-4'
          : 'bg-transparent border-b border-transparent backdrop-blur-none py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo (Left-aligned, elegant typography) */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex flex-col">
              <span className="text-xl font-serif tracking-[0.2em] text-obsidian-50 font-bold uppercase leading-none">
                Diya Creation
              </span>
              <span className="text-[8px] uppercase tracking-[0.35em] text-gold-500 mt-1 font-semibold">
                Luxury Atelier
              </span>
            </Link>
          </div>

          {/* Navigation Links (Center-aligned, elegant editorial casing) */}
          <nav className="hidden md:flex space-x-10 items-center">
            <Link
              href="/shop"
              className={`text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300 ${
                isActive('/shop') ? 'text-gold-500' : 'text-obsidian-300 hover:text-gold-500'
              }`}
            >
              Shop
            </Link>
            <Link
              href="/shop?category=Collections"
              className={`text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300 ${
                pathname.includes('collections') ? 'text-gold-500' : 'text-obsidian-300 hover:text-gold-500'
              }`}
            >
              Collections
            </Link>
            <Link
              href="/shop?customizable=true"
              className={`text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300 ${
                pathname.includes('personalized') ? 'text-gold-500' : 'text-obsidian-300 hover:text-gold-500'
              }`}
            >
              Personalized
            </Link>
            <Link
              href="/hamper-builder"
              className={`text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300 flex items-center space-x-1.5 ${
                isActive('/hamper-builder') ? 'text-gold-500' : 'text-obsidian-300 hover:text-gold-500'
              }`}
            >
              <span>Hamper Builder</span>
            </Link>
            <Link
              href="/corporate"
              className={`text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300 ${
                isActive('/corporate') ? 'text-gold-500' : 'text-obsidian-300 hover:text-gold-500'
              }`}
            >
              Corporate
            </Link>
          </nav>

          {/* Icon Controls (Right-aligned, matching quiet luxury look) */}
          <div className="flex items-center space-x-5">
            {/* Search Icon */}
            <button className="text-obsidian-300 hover:text-gold-500 transition-colors p-1 cursor-pointer" title="Search">
              <Search className="h-4.5 w-4.5 font-light" />
            </button>

            {/* Wishlist Icon */}
            <Link href="/wishlist" className="relative p-1 text-obsidian-300 hover:text-gold-500 transition-colors" title="My Wishlist">
              <Heart className="h-4.5 w-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-obsidian-950 font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-obsidian-950">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-1 text-obsidian-300 hover:text-gold-500 transition-colors" title="Shopping Cart">
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-obsidian-950 font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-obsidian-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin Dashboard link (if applicable) */}
            {user && user.role === 'SUPER_ADMIN' && (
              <Link
                href="/admin"
                className="text-obsidian-300 hover:text-gold-500 transition-colors p-1"
                title="Operations Control Console"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
              </Link>
            )}

            {/* User Account Account controls */}
            {user ? (
              <div className="flex items-center space-x-3 border-l border-gold-500/10 pl-3">
                <Link href="/profile" className="text-[10px] uppercase font-bold tracking-widest text-gold-500 hover:underline flex items-center space-x-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-obsidian-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[9px] uppercase tracking-widest bg-gold-500 hover:bg-gold-600 text-obsidian-950 px-4 py-2 rounded font-bold transition-all"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
