'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowRight, Sparkles, Heart } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const { token } = useAuthStore();

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get<any[]>('/products/categories');
        setCategories(res);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    loadCategories();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (selectedCategory) queryParams.append('category', selectedCategory);
        if (sort) queryParams.append('sort', sort);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);

        const res = await api.get<any[]>(`/products?${queryParams.toString()}`);
        setProducts(res);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    }
    const delayDebounce = setTimeout(() => {
      loadProducts();
    }, 300); // Debounce typing search
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, sort, minPrice, maxPrice]);

  // Fetch wishlist IDs if authenticated
  useEffect(() => {
    if (token) {
      api.get<any[]>('/wishlist')
        .then((res) => setWishlistIds(res.map((item) => item.productId)))
        .catch(() => {});
    }
  }, [token]);

  const toggleWishlist = async (productId: string) => {
    if (!token) {
      alert('Please sign in to save items to your wishlist.');
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
      alert('Failed to update wishlist preferences');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {/* Banner */}
        <div className="text-center max-w-xl mx-auto mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-obsidian-50">
            The Gifting <span className="text-gold-400">Collection</span>
          </h1>
          <p className="text-obsidian-400 font-light text-sm">
            Handcrafted chocolates, customizable memories, and premium basket selections. Filter or search to find your perfect gift.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar: Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div className="glass-panel p-6 rounded-lg space-y-6">
              {/* Filter Title */}
              <div className="flex items-center space-x-2 text-gold-300 border-b border-gold-500/10 pb-4">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider font-serif">Refine Search</span>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Search</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-obsidian-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Enter keywords..."
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2 pl-9 pr-3 text-xs outline-none transition-colors text-obsidian-50 placeholder-obsidian-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Categories</label>
                <div className="flex flex-col space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`text-left py-1.5 px-2 rounded-md transition-colors ${
                      selectedCategory === '' ? 'bg-gold-500/10 text-gold-400 font-semibold' : 'text-obsidian-300 hover:bg-obsidian-900'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`text-left py-1.5 px-2 rounded-md transition-colors ${
                        selectedCategory === cat.slug ? 'bg-gold-500/10 text-gold-400 font-semibold' : 'text-obsidian-300 hover:bg-obsidian-900'
                      }`}
                    >
                      {cat.name} ({cat._count.products})
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Price Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full bg-obsidian-900 border border-gold-500/10 rounded-md py-2 px-3 text-xs outline-none text-obsidian-50 text-center"
                  />
                  <span className="text-obsidian-500 text-xs">to</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full bg-obsidian-900 border border-gold-500/10 rounded-md py-2 px-3 text-xs outline-none text-obsidian-50 text-center"
                  />
                </div>
              </div>

              {/* Sorting */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-obsidian-900 border border-gold-500/10 rounded-md py-2 px-3 text-xs outline-none text-obsidian-300"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Alphabetical: A-Z</option>
                  <option value="name_desc">Alphabetical: Z-A</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Right Panel: Products Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="glass-panel h-[400px] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="glass-panel p-16 rounded-lg text-center space-y-4">
                <Sparkles className="h-10 w-10 text-gold-500/40 mx-auto" />
                <h3 className="text-xl font-bold font-serif text-obsidian-300">No Products Found</h3>
                <p className="text-sm font-light text-obsidian-400 max-w-md mx-auto">
                  We couldn't find any products matching your current filters. Try adjusting your search keywords or price thresholds.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('');
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="text-xs uppercase tracking-wider font-bold text-gold-400 hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="glass-panel p-4 rounded-lg flex flex-col group transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative w-full h-56 bg-obsidian-900/30 rounded-md overflow-hidden mb-6">
                      {prod.images && prod.images[0] ? (
                        <img
                          src={prod.images[0].url}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gold-500/10 text-gold-500 text-xs">
                          NO IMAGE AVAILABLE
                        </div>
                      )}
                      
                      {/* Wishlist toggle */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(prod.id);
                        }}
                        className="absolute top-3 right-3 bg-obsidian-950/80 border border-gold-500/10 p-2 rounded-full text-obsidian-300 hover:text-gold-500 transition-colors cursor-pointer z-10"
                        title="Save to Wishlist"
                      >
                        <Heart className={`h-3.5 w-3.5 ${wishlistIds.includes(prod.id) ? 'fill-gold-500 text-gold-500' : ''}`} />
                      </button>

                      {prod.customizable && (
                        <span className="absolute bottom-3 left-3 bg-gold-500 text-obsidian-950 font-bold text-[9px] uppercase px-2 py-0.5 rounded border border-gold-600">
                          Personalized
                        </span>
                      )}
                    </div>

                    {/* Meta & Info */}
                    <div className="space-y-2 flex-grow flex flex-col">
                      <span className="text-xs uppercase tracking-wider text-gold-400 font-medium">
                        {prod.category?.name || 'Gifts'}
                      </span>
                      <h3 className="text-lg font-bold font-serif text-obsidian-100 group-hover:text-gold-300 transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs font-light text-obsidian-400 line-clamp-2 leading-relaxed flex-grow">
                        {prod.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gold-500/5 mt-4">
                        <span className="text-base font-bold text-gold-300">&#8377; {prod.price.toFixed(2)}</span>
                        <Link
                          href={`/product/${prod.slug}`}
                          className="text-xs uppercase tracking-wider font-semibold text-gold-400 group-hover:text-gold-300 hover:underline flex items-center space-x-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
