'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, Truck, Calendar, CheckCircle2, Package, Sparkles } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderQuery = searchParams.get('order');

  const [orderNumber, setOrderNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (num: string) => {
    if (!num) return;
    setLoading(true);
    setError('');
    setTrackingData(null);
    try {
      const res = await api.get<any>(`/orders/tracking/${num}`);
      setTrackingData(res);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify the order number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderQuery) {
      setOrderNumber(orderQuery);
      fetchTracking(orderQuery);
    }
  }, [orderQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;
    router.push(`/track?order=${orderNumber.trim()}`);
  };

  // State timeline ordering
  const statuses = [
    { key: 'PENDING_PAYMENT', label: 'Payment Awaiting', desc: 'Order placed, waiting for payment confirmation.' },
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Payment verified, preparing ingredients and design drafts.' },
    { key: 'PRODUCTION', label: 'In Production', desc: 'Handcrafting chocolates and customizing frame prints.' },
    { key: 'PACKED', label: 'Quality Checked & Packed', desc: 'Wrapped in velvet packaging, ready for carrier pickup.' },
    { key: 'SHIPPED', label: 'Shipped / Dispatched', desc: 'Dispatched via our delivery partner.' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Package successfully delivered.' },
  ];

  const getStatusIndex = (currentStatus: string) => {
    return statuses.findIndex((s) => s.key === currentStatus);
  };

  const activeIndex = trackingData ? getStatusIndex(trackingData.status) : -1;

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="glass-panel p-6 md:p-8 rounded-lg max-w-2xl mx-auto border-gold-500/20">
        <h2 className="text-xl font-bold font-serif text-gold-300 mb-2 text-center">Track Your Gift</h2>
        <p className="text-xs text-obsidian-400 font-light text-center mb-6">
          Enter your order tracking number (e.g., DIYAC-123456-789) to see real-time updates.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-obsidian-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="DIYAC-XXXXXX-XXX"
              className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-3 pl-10 pr-4 text-sm text-obsidian-50 placeholder-obsidian-600 outline-none uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-obsidian-950 font-bold px-8 py-3 rounded-md text-xs uppercase tracking-wider transition-colors gold-glow cursor-pointer"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded text-center font-light">
          {error}
        </div>
      )}

      {/* Seeding Loading State */}
      {loading && (
        <div className="text-center font-serif tracking-widest text-gold-400 animate-pulse text-sm">
          FETCHING TRACKING LIFECYCLE...
        </div>
      )}

      {/* Tracking Details */}
      {trackingData && !loading && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Top Panel Summary */}
          <div className="glass-panel p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider">Active Shipment</span>
              <h3 className="text-lg font-bold text-obsidian-50 font-serif">Order: {trackingData.orderNumber}</h3>
            </div>
            
            <div className="flex gap-4 text-xs font-light text-obsidian-300">
              <div className="border-l border-gold-500/15 pl-4">
                <span className="text-obsidian-500 block mb-0.5">Current Status</span>
                <span className="font-bold text-gold-300 uppercase tracking-wide">
                  {statuses[activeIndex]?.label || trackingData.status.replace('_', ' ')}
                </span>
              </div>
              {trackingData.shipment && (
                <div className="border-l border-gold-500/15 pl-4">
                  <span className="text-obsidian-500 block mb-0.5">Carrier AWB</span>
                  <span className="font-semibold text-obsidian-200">{trackingData.shipment.awb}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Status */}
          <div className="glass-panel p-8 rounded-lg">
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-obsidian-900 before:-z-10 z-10">
              {/* Connector line overlay */}
              <div
                className="absolute left-3.5 top-2 w-0.5 bg-gold-500 -z-10 transition-all duration-500"
                style={{ height: `${(activeIndex / (statuses.length - 1)) * 94}%` }}
              />

              {statuses.map((status, index) => {
                const isPassed = index < activeIndex;
                const isActive = index === activeIndex;
                const isFuture = index > activeIndex;

                return (
                  <div key={status.key} className="flex gap-6 items-start">
                    {/* Circle Indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${
                        isPassed
                          ? 'bg-gold-500 border-gold-500 text-obsidian-950 shadow-md'
                          : isActive
                          ? 'bg-obsidian-950 border-gold-400 text-gold-300 shadow-[0_0_15px_rgba(223,178,94,0.4)]'
                          : 'bg-obsidian-950 border-obsidian-900 text-obsidian-600'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Text Details */}
                    <div className="space-y-1 pt-0.5">
                      <h4
                        className={`text-sm font-bold font-serif transition-colors ${
                          isFuture ? 'text-obsidian-500' : 'text-obsidian-100'
                        } ${isActive ? 'text-gold-300 text-base' : ''}`}
                      >
                        {status.label}
                      </h4>
                      <p className={`text-xs font-light leading-relaxed ${isFuture ? 'text-obsidian-600' : 'text-obsidian-400'}`}>
                        {status.desc}
                      </p>

                      {/* Display carrier specific info if status is SHIPPED and we have it */}
                      {status.key === 'SHIPPED' && trackingData.shipment && isPassed && (
                        <div className="bg-obsidian-900 border border-gold-500/10 rounded p-3 mt-3 space-y-2 text-[11px] max-w-md">
                          <div className="flex justify-between">
                            <span className="text-obsidian-500">Carrier:</span>
                            <span className="font-semibold text-obsidian-200">{trackingData.shipment.carrier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-obsidian-500">Tracking Code:</span>
                            <span className="font-semibold text-obsidian-200 font-mono">{trackingData.shipment.trackingNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrder() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full">
        {/* Suspense is required around useSearchParams in Next.js App Router */}
        <Suspense fallback={<div className="text-center text-gold-400 animate-pulse font-serif">BOOTING TRACKING...</div>}>
          <TrackingContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
