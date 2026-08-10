'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft, Gift } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function Checkout() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();

  // Address form
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

  // Coupon & Payment details
  const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED !== 'false';
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentsEnabled ? 'RAZORPAY' : 'COD'); // RAZORPAY, COD

  // System states
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [token, fetchCart]);

  if (!cart) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gold-400 font-serif tracking-widest animate-pulse">PREPARING CHECKOUT...</div>
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

  // Coupon calculation
  let discount = 0.0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else {
      discount = Math.min(appliedCoupon.discount, subtotal);
    }
  }

  const shipping = subtotal > 1500 ? 0.0 : 150.0;
  const estimatedTotal = subtotal - discount + shipping;

  // Apply Coupon Code
  const handleApplyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
    if (!couponCode) return;
    try {
      const res = await api.post<any>('/orders/coupon/validate', { code: couponCode });
      setAppliedCoupon(res);
    } catch (e: any) {
      setCouponError(e.message || 'Invalid or expired coupon code.');
    }
  };

  // Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (paymentMethod === 'RAZORPAY' && !paymentsEnabled) {
      alert('Online payments are currently disabled. Please select Cash on Delivery.');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${shippingAddress}, ${city}, ${state} - ${pincode}. Phone: ${phone}`;
      
      const payload = {
        shippingAddress: fullAddress,
        billingAddress: fullAddress,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      };

      const orderRes = await api.post<any>('/orders/checkout', payload);
      setPlacedOrder(orderRes);

      if (paymentMethod === 'COD') {
        // COD confirms immediately. Clear cart state and redirect.
        clearCart();
        router.push(`/track?order=${orderRes.orderNumber}`);
      } else {
        // Online payment triggers Razorpay Simulator
        setShowPaymentModal(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Payment Webhook trigger
  const handleSimulatePayment = async (status: 'SUCCESS' | 'FAILED') => {
    if (!placedOrder) return;
    setPaymentLoading(true);
    try {
      const payload = {
        orderId: placedOrder.id,
        paymentMethod: 'RAZORPAY',
        transactionId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        status,
      };

      // Call public webhook endpoint to verify on backend
      await api.post('/orders/payment-webhook', payload);

      setPaymentLoading(false);
      setShowPaymentModal(false);
      clearCart();
      
      if (status === 'SUCCESS') {
        router.push(`/track?order=${placedOrder.orderNumber}`);
      } else {
        alert('Payment failed. Order remains pending payment. You can retry.');
        router.push('/profile'); // Redirect to profile to see order history
      }
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col relative">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {/* Back Link */}
        <Link href="/cart" className="inline-flex items-center space-x-1.5 text-xs text-gold-400 hover:text-gold-300 mb-8 font-semibold uppercase tracking-wider">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="text-3xl font-serif font-bold text-obsidian-50 mb-10">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Address and Options */}
          <div className="lg:col-span-8 space-y-6">
            {/* Delivery address */}
            <div className="glass-panel p-6 rounded-lg space-y-5">
              <h3 className="text-lg font-bold font-serif text-gold-300 border-b border-gold-500/5 pb-3">
                Shipping Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Flat / House No, Street, Locality"
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2 px-3.5 text-xs outline-none text-obsidian-50 placeholder-obsidian-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2 px-3.5 text-xs outline-none text-obsidian-50 placeholder-obsidian-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2 px-3.5 text-xs outline-none text-obsidian-50 placeholder-obsidian-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400001"
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2 px-3.5 text-xs outline-none text-obsidian-50 placeholder-obsidian-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2 px-3.5 text-xs outline-none text-obsidian-50 placeholder-obsidian-600"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-panel p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-bold font-serif text-gold-300 border-b border-gold-500/5 pb-3">
                Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => paymentsEnabled && setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded border flex items-center justify-between transition-all ${
                    !paymentsEnabled
                      ? 'border-obsidian-850 bg-obsidian-950 opacity-40 cursor-not-allowed'
                      : paymentMethod === 'RAZORPAY'
                      ? 'border-gold-500 bg-gold-500/5 cursor-pointer'
                      : 'border-gold-500/10 bg-obsidian-900 hover:border-gold-500/30 cursor-pointer'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-obsidian-100 block">
                      Razorpay / Net Banking / UPI {!paymentsEnabled && '(Unavailable)'}
                    </span>
                    <span className="text-[10px] font-light text-obsidian-400 block">
                      {!paymentsEnabled ? 'Online payments are temporarily disabled' : 'Instant automated payment verification'}
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-gold-500 bg-gold-500/5'
                      : 'border-gold-500/10 bg-obsidian-900 hover:border-gold-500/30'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-obsidian-100 block">Cash On Delivery (COD)</span>
                    <span className="text-[10px] font-light text-obsidian-400 block">Pay at the time of delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Checkout Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo Code */}
            <div className="glass-panel p-6 rounded-lg space-y-3">
              <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Coupon Code</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. FESTIVAL50"
                  className="flex-grow bg-obsidian-900 border border-gold-500/10 rounded-md py-2 px-3 text-xs outline-none text-obsidian-50 placeholder-obsidian-600 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-4 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <div className="text-[10px] text-green-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Coupon {appliedCoupon.code} applied successfully!</span>
                </div>
              )}
              {couponError && (
                <div className="text-[10px] text-red-400 font-semibold flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{couponError}</span>
                </div>
              )}
              <p className="text-[9px] font-light text-obsidian-500">
                Tip: Enter <strong className="text-gold-400">FESTIVAL50</strong> for 50% discount or <strong className="text-gold-400">DIYA100</strong> for &#8377;100 discount.
              </p>
            </div>

            {/* Total summary */}
            <div className="glass-panel p-6 rounded-lg space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gold-300 border-b border-gold-500/10 pb-4 font-serif">
                Summary details
              </h3>

              <div className="space-y-3 text-xs font-light text-obsidian-300">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-obsidian-100">&#8377; {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400 font-medium">
                    <span>Promo Discount</span>
                    <span>- &#8377; {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-obsidian-100">
                    {shipping === 0.0 ? 'FREE' : `\u20B9 ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-gold-500/10 pt-4 flex justify-between text-base font-bold text-gold-300">
                  <span>Total Amount</span>
                  <span>&#8377; {estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-obsidian-950 font-bold py-3.5 rounded-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all gold-glow cursor-pointer"
              >
                <span>{loading ? 'Processing...' : 'Place Order'}</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Payment Gateway Webhook Simulator Modal */}
      {showPaymentModal && placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel p-8 rounded-lg shadow-2xl relative border-gold-500/30 space-y-6">
            {/* Branding */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1 text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <Gift className="h-3.5 w-3.5" />
                <span>Razorpay Gateway Sandbox</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-obsidian-50">Simulate Payment</h3>
              <p className="text-xs font-light text-obsidian-400 leading-relaxed">
                Order <strong className="text-gold-300">{placedOrder.orderNumber}</strong> placed successfully in pending state. Choose a mock gateway response:
              </p>
            </div>

            {/* Price detail */}
            <div className="bg-obsidian-900 border border-gold-500/10 rounded-md p-4 flex justify-between items-center text-sm font-semibold">
              <span className="text-obsidian-400">Total Payable</span>
              <span className="text-gold-300 text-lg font-bold">&#8377; {placedOrder.totalAmount.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleSimulatePayment('SUCCESS')}
                disabled={paymentLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{paymentLoading ? 'Verifying payment...' : 'Simulate Success Response'}</span>
              </button>
              
              <button
                onClick={() => handleSimulatePayment('FAILED')}
                disabled={paymentLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{paymentLoading ? 'Verifying failure...' : 'Simulate Failure Response'}</span>
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center space-x-2 text-[9px] uppercase font-bold tracking-widest text-obsidian-500 justify-center">
              <ShieldCheck className="h-4 w-4 text-gold-500/60" />
              <span>Secure Webhook Sandbox Verification</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
