'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function Cart() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { cart, loading, fetchCart, removeFromCart } = useCartStore();

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      router.push('/login');
    }
  }, [token, fetchCart]);

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gold-400 font-serif tracking-widest animate-pulse">LOADING YOUR CART...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate pricing
  const subtotal = cart?.items?.reduce((sum, item) => {
    if (item.product) {
      let itemPrice = item.product.price;
      if (item.customizations) {
        try {
          const parsed = JSON.parse(item.customizations);
          if (parsed.customOptionsPrice) {
            itemPrice += Number(parsed.customOptionsPrice);
          }
        } catch (e) {}
      }
      return sum + itemPrice * item.quantity;
    } else if (item.hamper) {
      const itemsPrice = item.hamper.items.reduce((s: number, hi: any) => s + hi.component.price * hi.quantity, 0);
      const hamperPrice = item.hamper.box.price + itemsPrice;
      return sum + hamperPrice * item.quantity;
    }
    return sum;
  }, 0.0) || 0.0;

  const shipping = subtotal === 0 ? 0.0 : subtotal > 1500 ? 0.0 : 150.0;
  const estimatedTotal = subtotal + shipping;

  // Helper to parse customizations
  const renderCustomizationDetails = (customizationsStr: string | null, isHamper = false) => {
    if (!customizationsStr) return null;
    try {
      const parsed = JSON.parse(customizationsStr);
      if (isHamper) {
        return (
          <div className="text-[10px] text-obsidian-400 font-light space-y-0.5 mt-1">
            <span>Box: {parsed.wrapping}</span>
            <span className="block">Ribbon: {parsed.ribbonColor}</span>
            {parsed.greetingMsg && <span className="block italic">" {parsed.greetingMsg} "</span>}
          </div>
        );
      } else {
        return (
          <div className="text-[10px] text-obsidian-400 font-light space-y-0.5 mt-1">
            {parsed.texts &&
              Object.entries(parsed.texts).map(([label, val]: any) => (
                <span key={label} className="block">
                  {label}: <strong className="text-gold-400">{val}</strong>
                </span>
              ))}
            {parsed.photoUrl && (
              <span className="block text-gold-400 font-semibold underline cursor-pointer" onClick={() => window.open(parsed.photoUrl)}>
                View Photo Print Draft
              </span>
            )}
          </div>
        );
      }
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-obsidian-50 mb-10 text-center md:text-left">
          Shopping <span className="text-gold-400">Cart</span>
        </h1>

        {!cart || cart.items.length === 0 ? (
          <div className="glass-panel p-16 rounded-lg text-center space-y-6 max-w-lg mx-auto">
            <ShoppingBag className="h-12 w-12 text-gold-500/40 mx-auto" />
            <h3 className="text-xl font-bold font-serif text-obsidian-300">Your Cart is Empty</h3>
            <p className="text-sm font-light text-obsidian-400">
              Browse our handcrafted chocolates, personalized frames, or design a custom gift basket.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-8 py-3.5 rounded-md text-xs uppercase tracking-wider gold-glow"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.items.map((item) => {
                let name = '';
                let price = 0.0;
                let category = 'Gifts';
                let imageUrl = '';

                if (item.product) {
                  const prod = item.product;
                  name = prod.name;
                  category = prod.category?.name || 'Gifts';
                  imageUrl = prod.images[0]?.url || '';
                  
                  let customPrice = prod.price;
                  if (item.customizations) {
                    try {
                      const parsed = JSON.parse(item.customizations);
                      if (parsed.customOptionsPrice) customPrice += Number(parsed.customOptionsPrice);
                    } catch (e) {}
                  }
                  price = customPrice;
                } else if (item.hamper) {
                  name = `Bespoke ${item.hamper.box.name}`;
                  category = 'Custom Hamper';
                  const itemsPrice = item.hamper.items.reduce((s: number, hi: any) => s + hi.component.price * hi.quantity, 0);
                  price = item.hamper.box.price + itemsPrice;
                }

                return (
                  <div key={item.id} className="glass-panel p-4 rounded-lg flex items-center gap-6">
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-obsidian-950 rounded overflow-hidden flex-shrink-0 border border-gold-500/5">
                      {imageUrl ? (
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gold-950/10 text-gold-400 text-[10px]">
                          HAMPER
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">
                        {category}
                      </span>
                      <h3 className="text-sm font-bold text-obsidian-100 font-serif truncate">
                        {name}
                      </h3>
                      {renderCustomizationDetails(item.customizations, !!item.hamperId)}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <span className="text-xs text-obsidian-400 font-light block">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-gold-300">
                          &#8377; {(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-obsidian-500 hover:text-red-400 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Cart Summary Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-panel p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-bold font-serif text-gold-300 border-b border-gold-500/10 pb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm font-light text-obsidian-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-obsidian-50">&#8377; {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-obsidian-50">
                      {shipping === 0.0 ? 'FREE' : `\u20B9 ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-gold-400/80 font-light leading-relaxed">
                      Add &#8377; {(1500 - subtotal).toFixed(2)} more to qualify for FREE shipping.
                    </p>
                  )}
                  <div className="border-t border-gold-500/10 pt-4 flex justify-between text-base font-bold text-gold-300">
                    <span>Estimated Total</span>
                    <span>&#8377; {estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold py-3.5 rounded-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all gold-glow"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Secure Checkout Badges */}
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-obsidian-500 justify-center">
                <ShieldCheck className="h-4.5 w-4.5 text-gold-500/60" />
                <span>SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
