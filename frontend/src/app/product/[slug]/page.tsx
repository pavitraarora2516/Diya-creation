'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Gift, ShieldCheck, CheckCircle2, ChevronRight, Heart, Star, Send } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import api from '../../../utils/api';
import useCartStore from '../../../store/cartStore';
import useAuthStore from '../../../store/authStore';

// Dynamically import ThreeProductViewer to bypass SSR issues
const ThreeProductViewer = dynamic(() => import('../../../components/ThreeProductViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-obsidian-900/30 rounded-lg">
      <span className="text-gold-400 animate-pulse font-serif tracking-widest text-xs">LOADING 3D PREVIEW...</span>
    </div>
  ),
});

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { token, user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  // Wishlist & Reviews state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // Personalization choices state
  const [textChoices, setTextChoices] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Fetch product details
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get<any>(`/products/slug/${slug}`);
        setProduct(res);

        // Initialize custom option inputs
        if (res.customizable && res.customOptions) {
          const initTexts: Record<string, string> = {};
          res.customOptions.forEach((opt: any) => {
            if (opt.type === 'TEXT') {
              initTexts[opt.label] = '';
            }
          });
          setTextChoices(initTexts);
        }
      } catch (e: any) {
        setError(e.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  // Wishlist check
  useEffect(() => {
    async function checkWishlist() {
      if (!token || !product) return;
      try {
        const items = await api.get<any[]>('/wishlist');
        const found = items.some((i) => i.productId === product.id);
        setIsWishlisted(found);
      } catch (e) {}
    }
    checkWishlist();
  }, [product, token]);

  // Fetch reviews
  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [product]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get<any[]>(`/reviews/product/${product.id}`);
      setReviews(res);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setIsWishlisted(false);
      } else {
        await api.post(`/wishlist/${product.id}`, {});
        setIsWishlisted(true);
      }
    } catch (e) {
      alert('Failed to update wishlist preferences');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const authorName = newAuthor.trim() || (user ? user.name : 'Anonymous Guest');
      await api.post('/reviews', {
        productId: product.id,
        rating: newRating,
        comment: newComment,
        author: authorName,
      });
      setNewComment('');
      setNewRating(5);
      setNewAuthor('');
      alert('Your review has been submitted for moderation and will appear once approved!');
      loadReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gold-400 font-serif tracking-widest animate-pulse">LOADING PRODUCT DETAILS...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-serif text-gold-300">Product Not Found</h2>
          <p className="text-sm font-light text-obsidian-400">{error || "The requested creation doesn't exist."}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate dynamic pricing based on selections
  let customizationsCost = 0.0;
  if (product.customizable && product.customOptions) {
    product.customOptions.forEach((opt: any) => {
      if (opt.type === 'IMAGE' && photoUrl) {
        customizationsCost += opt.priceCharge;
      }
      if (opt.type === 'TEXT' && textChoices[opt.label]) {
        customizationsCost += opt.priceCharge;
      }
    });
  }

  const unitPrice = product.price + customizationsCost;
  const totalPrice = unitPrice * quantity;

  // Handle Add to Cart
  const handleAddToCart = async () => {
    setSuccessMsg('');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const customizationsObj = product.customizable
        ? {
            photoUrl,
            texts: textChoices,
            customOptionsPrice: customizationsCost,
          }
        : null;

      await addToCart(
        product.id,
        null,
        quantity,
        customizationsObj ? JSON.stringify(customizationsObj) : undefined
      );

      setSuccessMsg('Added to cart successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to add item to cart');
    }
  };

  // Helper to load sample testing photos in the 3D viewer
  const loadSamplePhoto = (url: string) => {
    setPhotoUrl(url);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-obsidian-400 mb-8 font-light">
          <span>Shop</span>
          <ChevronRight className="h-3 w-3" />
          <span>{product.category?.name}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold-400">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: 3D Preview */}
          <div className="space-y-6">
            <ThreeProductViewer sku={product.sku} photoUrl={photoUrl} />
            
            {/* Sample images helper for testing 3D frame mapping */}
            {product.sku === 'GIFT-WD-FRAME' && (
              <div className="glass-panel p-4 rounded-lg space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-300 font-serif">Quick Test Textures</span>
                <p className="text-[11px] font-light text-obsidian-400">
                  Select a test image below to see it instantly mapped onto the 3D wooden frame above:
                </p>
                <div className="flex space-x-3 pt-1">
                  <button
                    onClick={() => loadSamplePhoto('https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80')}
                    className="h-12 w-12 rounded border border-gold-500/30 overflow-hidden hover:border-gold-500 transition-colors"
                    title="Wedding Couple"
                  >
                    <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=100&q=80" className="h-full w-full object-cover" />
                  </button>
                  <button
                    onClick={() => loadSamplePhoto('https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=400&q=80')}
                    className="h-12 w-12 rounded border border-gold-500/30 overflow-hidden hover:border-gold-500 transition-colors"
                    title="Family Gathering"
                  >
                    <img src="https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=100&q=80" className="h-full w-full object-cover" />
                  </button>
                  <button
                    onClick={() => loadSamplePhoto('https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&q=80')}
                    className="h-12 w-12 rounded border border-gold-500/30 overflow-hidden hover:border-gold-500 transition-colors"
                    title="Pet Dog"
                  >
                    <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=100&q=80" className="h-full w-full object-cover" />
                  </button>
                  <button
                    onClick={() => setPhotoUrl(null)}
                    className="h-12 px-3 rounded border border-gold-500/10 hover:border-gold-500/30 text-[10px] font-bold uppercase tracking-wider text-obsidian-400 hover:text-obsidian-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details & Personalization */}
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="bg-gold-500/10 border border-gold-500/20 text-gold-300 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded">
                {product.category?.name}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-obsidian-50 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-obsidian-400 font-light tracking-wide">
                SKU: <span className="text-gold-400 font-mono font-medium">{product.sku}</span>
              </p>
            </div>

            {/* Price section */}
            <div className="flex items-baseline space-x-3 border-b border-gold-500/10 pb-6">
              <span className="text-3xl font-bold text-gold-300">&#8377; {unitPrice.toFixed(2)}</span>
              {customizationsCost > 0 && (
                <span className="text-xs font-light text-obsidian-400">
                  (Base: &#8377; {product.price.toFixed(2)} + Personalization: &#8377; {customizationsCost.toFixed(2)})
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-gold-400 font-medium">Description</span>
              <p className="text-sm font-light text-obsidian-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Personalization Inputs */}
            {product.customizable && product.customOptions && (
              <div className="glass-panel p-6 rounded-lg space-y-6">
                <div className="flex items-center space-x-2 text-gold-300 border-b border-gold-500/5 pb-3">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider font-serif">Bespoke Personalization</span>
                </div>

                {product.customOptions.map((opt: any) => (
                  <div key={opt.id} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <label className="text-xs font-medium text-obsidian-200">{opt.label}</label>
                      {opt.priceCharge > 0 && (
                        <span className="text-[10px] text-gold-400">+ &#8377; {opt.priceCharge.toFixed(2)}</span>
                      )}
                    </div>

                    {opt.type === 'TEXT' && (
                      <input
                        type="text"
                        value={textChoices[opt.label] || ''}
                        onChange={(e) =>
                          setTextChoices((prev) => ({ ...prev, [opt.label]: e.target.value }))
                        }
                        placeholder="Enter custom text..."
                        className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-4 text-xs text-obsidian-50 outline-none transition-colors"
                      />
                    )}

                    {opt.type === 'IMAGE' && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={photoUrl || ''}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="Paste image URL (e.g. https://...)"
                          className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-4 text-xs text-obsidian-50 outline-none transition-colors"
                        />
                        <p className="text-[10px] font-light text-obsidian-500">
                          Provide a direct web image link. You can also click the quick test textures on the left!
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Details Grid (weight, shelf-life, etc.) */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {product.weight && (
                <div className="border border-gold-500/10 p-3.5 rounded">
                  <span className="text-obsidian-400 font-light block mb-1">Net Weight</span>
                  <span className="font-semibold text-gold-300">{product.weight} grams</span>
                </div>
              )}
              {product.shelfLife && (
                <div className="border border-gold-500/10 p-3.5 rounded">
                  <span className="text-obsidian-400 font-light block mb-1">Shelf Life</span>
                  <span className="font-semibold text-gold-300">{product.shelfLife}</span>
                </div>
              )}
            </div>

            {/* Ingredients & Allergens Accordion */}
            {(product.ingredients || product.allergens) && (
              <div className="border-t border-gold-500/10 pt-6 space-y-4 text-xs">
                {product.ingredients && (
                  <div className="space-y-1">
                    <span className="text-gold-400 font-medium block">Ingredients</span>
                    <p className="font-light text-obsidian-400 leading-relaxed">{product.ingredients}</p>
                  </div>
                )}
                {product.allergens && (
                  <div className="space-y-1">
                    <span className="text-gold-400 font-medium block">Allergy Information</span>
                    <p className="font-light text-obsidian-400 leading-relaxed">{product.allergens}</p>
                  </div>
                )}
              </div>
            )}

            {/* Cart Actions */}
            <div className="space-y-4 pt-4 border-t border-gold-500/10">
              {successMsg && (
                <div className="flex items-center space-x-2 bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs px-4 py-3 rounded">
                  <CheckCircle2 className="h-4 w-4 text-gold-400 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center space-x-4">
                {/* Quantity */}
                <div className="flex items-center border border-gold-500/20 rounded-md overflow-hidden bg-obsidian-900">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-3 hover:bg-gold-500/10 text-gold-400 font-bold transition-colors text-sm"
                  >
                    -
                  </button>
                  <span className="px-5 py-3 text-sm font-semibold text-obsidian-50">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-3 hover:bg-gold-500/10 text-gold-400 font-bold transition-colors text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold py-3.5 rounded-md tracking-wider flex items-center justify-center space-x-2 transition-all gold-glow cursor-pointer text-sm"
                >
                  <Gift className="h-4 w-4" />
                  <span>Add To Cart &bull; &#8377; {totalPrice.toFixed(2)}</span>
                </button>

                {/* Wishlist Toggle Button */}
                <button
                  onClick={handleToggleWishlist}
                  className={`border ${
                    isWishlisted ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-gold-500/20 hover:border-gold-500 text-obsidian-400 hover:text-gold-400'
                  } p-3.5 rounded-md transition-all cursor-pointer`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-gold-400' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center space-x-4 text-[10px] uppercase font-bold tracking-widest text-obsidian-500 pt-2 justify-center">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="h-4.5 w-4.5 text-gold-500/60" />
                  <span>100% Safe Payments</span>
                </span>
                <span>&bull;</span>
                <span>Fresh Handmade Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Social Proof */}
        <section className="mt-20 border-t border-gold-500/10 pt-16 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Reviews list */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl font-serif font-bold text-gold-300">
                Customer Reviews ({reviews.length})
              </h2>

              {reviewsLoading ? (
                <div className="text-sm font-light text-gold-400/60 animate-pulse">Loading feedback...</div>
              ) : reviews.length === 0 ? (
                <div className="glass-panel p-8 rounded-lg text-center text-obsidian-400 font-light text-xs">
                  No verified reviews for this creation yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="glass-panel p-5 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-xs text-obsidian-200">{rev.author}</div>
                          <div className="flex space-x-1 mt-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-3 w-3 ${
                                  idx < rev.rating ? 'text-gold-400 fill-gold-400' : 'text-obsidian-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.isVerified && (
                          <span className="bg-green-500/10 border border-green-500/25 text-green-400 font-bold uppercase tracking-widest text-[8px] px-2 py-0.5 rounded">
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-obsidian-300 font-light leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="lg:col-span-5">
              <form onSubmit={handleReviewSubmit} className="glass-panel p-6 rounded-lg space-y-4 border-gold-500/25">
                <h3 className="text-base font-bold font-serif text-gold-300 border-b border-gold-500/5 pb-2">
                  Share Your Experience
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gold-400 block tracking-wider">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={user ? user.name : 'E.g. Jane Doe'}
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/30 rounded-md py-2 px-3 text-xs outline-none text-obsidian-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gold-400 block tracking-wider">Rating</label>
                  <div className="flex space-x-2 pt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNewRating(n)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            n <= newRating ? 'text-gold-400 fill-gold-400' : 'text-obsidian-700 hover:text-gold-500/50'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gold-400 block tracking-wider">Review Description</label>
                  <textarea
                    rows={4}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us what you liked about this gift..."
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/30 rounded-md py-2 px-3 text-xs outline-none text-obsidian-50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold py-2.5 rounded text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Review</span>
                </button>
              </form>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
