import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-obsidian-900 border-t border-gold-500/10 text-obsidian-200 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-lg font-serif tracking-[0.2em] text-obsidian-50 font-bold uppercase leading-none">
                Diya Creation
              </span>
              <span className="text-[8px] uppercase tracking-[0.35em] text-gold-500 mt-1 font-semibold">
                Luxury Gifting
              </span>
            </div>
            <p className="text-xs text-obsidian-400 leading-relaxed font-light">
              Premium digital gifting and celebration-commerce platform combining luxury presentation, artisanal chocolates, and personalized creations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 mb-4 font-serif">Store Links</h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <Link href="/shop" className="hover:text-gold-500 transition-colors">Browse Catalog</Link>
              </li>
              <li>
                <Link href="/hamper-builder" className="hover:text-gold-500 transition-colors">Build Custom Hamper</Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-gold-500 transition-colors">Corporate & Bulk Ordering</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 mb-4 font-serif">Customer Care</h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <Link href="/track" className="hover:text-gold-500 transition-colors">Track Order</Link>
              </li>
              <li>
                <span className="text-obsidian-400">Shipping & Delivery Policies</span>
              </li>
              <li>
                <span className="text-obsidian-400">Terms & Conditions</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-500 mb-4 font-serif">Contact Info</h4>
            <ul className="space-y-3 text-xs font-light">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gold-500" />
                <span>support@diyacreation.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gold-500" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gold-500" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold-500/10 mt-12 pt-8 text-center text-xs font-light text-obsidian-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Diya Creation. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-gold-500 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gold-500 transition-colors cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
