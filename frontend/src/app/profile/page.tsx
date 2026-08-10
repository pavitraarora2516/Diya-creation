'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ClipboardList, ShieldCheck, Mail, Calendar, Eye } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

export default function Profile() {
  const router = useRouter();
  const { user, token, initialize } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    async function loadOrders() {
      try {
        const res = await api.get<any[]>('/orders');
        setOrders(res);
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [token]);

  if (!user) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gold-400 font-serif tracking-widest animate-pulse">LOADING ACCOUNT PROFILE...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full space-y-12">
        <h1 className="text-3xl font-serif font-bold text-obsidian-50">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Account Profile details */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-lg space-y-6">
              <div className="flex items-center space-x-2 text-gold-300 border-b border-gold-500/5 pb-3">
                <User className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider font-serif">Profile Details</span>
              </div>

              <div className="space-y-4 text-xs font-light text-obsidian-300">
                <div className="space-y-1">
                  <span className="text-obsidian-500 block uppercase text-[10px] tracking-wider font-medium">Name</span>
                  <span className="font-semibold text-obsidian-100 text-sm">{user.name}</span>
                </div>
                <div className="space-y-1 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-gold-400" />
                  <div className="space-y-1">
                    <span className="text-obsidian-500 block uppercase text-[10px] tracking-wider font-medium">Email</span>
                    <span className="font-semibold text-obsidian-100">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-gold-400" />
                  <div className="space-y-1">
                    <span className="text-obsidian-500 block uppercase text-[10px] tracking-wider font-medium">Account Role</span>
                    <span className="font-bold text-gold-300 uppercase tracking-wider text-[10px]">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order History list */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-6 rounded-lg space-y-6">
              <div className="flex items-center space-x-2 text-gold-300 border-b border-gold-500/5 pb-3">
                <ClipboardList className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-wider font-serif">Order History</span>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-20 bg-obsidian-900 rounded" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-obsidian-400 font-light text-sm space-y-2">
                  <p>You haven't placed any orders yet.</p>
                  <a href="/shop" className="text-gold-400 font-semibold hover:underline">
                    Browse creations
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded bg-obsidian-900 border border-gold-500/5 hover:border-gold-500/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-obsidian-100">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            order.status === 'CONFIRMED' || order.status === 'DELIVERED'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-obsidian-500 font-light block">
                          Placed: {new Date(order.createdAt).toLocaleDateString()} &bull; {order.items.length} items
                        </span>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-0 border-gold-500/5 pt-3 md:pt-0">
                        <span className="text-base font-bold text-gold-300">
                          &#8377; {order.totalAmount.toFixed(2)}
                        </span>
                        
                        <a
                          href={`/track?order=${order.orderNumber}`}
                          className="bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/20 px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Track</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
