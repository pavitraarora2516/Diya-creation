'use client';

import React, { useState } from 'react';
import { Mail, Phone, Calendar, Gift, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';

export default function CorporatePortal() {
  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstDetails, setGstDetails] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budgetRange, setBudgetRange] = useState('500-1000');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [requirements, setRequirements] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        companyName,
        contactName,
        email,
        phone,
        gstDetails: gstDetails || undefined,
        quantity: Number(quantity),
        budgetRange,
        deliveryDate,
        requirements,
      };

      await api.post('/corporate/lead', payload);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col relative overflow-hidden">
      <Header />

      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze-600/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full space-y-12 relative">
        {/* Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-obsidian-50">
            Corporate & <span className="text-gold-400">Bulk Gifting</span>
          </h1>
          <p className="text-obsidian-400 font-light text-sm">
            Elevate client connections, reward employees, or create unforgettable event hampers. Submit bulk customization requirements to receive custom pricing quotes.
          </p>
        </div>

        {success ? (
          <div className="glass-panel p-10 rounded-lg text-center max-w-xl mx-auto space-y-6">
            <CheckCircle2 className="h-14 w-14 text-gold-400 mx-auto" />
            <h2 className="text-3xl font-serif font-bold text-gold-300">Inquiry Received</h2>
            <p className="text-sm font-light text-obsidian-300 leading-relaxed">
              Thank you for submitting your corporate gifting request. A dedicated sales manager has been assigned to your account. We will contact you shortly with a custom quotation draft.
            </p>
            <div className="border-t border-gold-500/10 pt-4 text-xs font-light text-obsidian-500 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-gold-500/40" />
              <span>Verified Business Lead Registration</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
            {/* Left: Branding Pillars */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3.5 py-1 rounded-full">
                  B2B Gifting Platform
                </span>
                <h2 className="text-3xl font-serif font-bold text-obsidian-50">Why Choose Diya Creation?</h2>
              </div>

              <div className="space-y-6 text-sm font-light text-obsidian-400">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-obsidian-200 mb-1">Custom Branding</h4>
                    <p className="leading-relaxed text-xs">Print company logos on chocolate bars, engrave client names on wooden boxes, or include personalized greeting letters.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-obsidian-200 mb-1">Live Quotations</h4>
                    <p className="leading-relaxed text-xs">Review proforma invoices and generate detailed price estimates online based on custom box quantities.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-obsidian-200 mb-1">Bulk Shipments</h4>
                    <p className="leading-relaxed text-xs">Coordinate delivery across multiple client offices or event venues in India with real-time AWB status tracking.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Request Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-lg space-y-5">
                <h3 className="text-xl font-bold font-serif text-gold-300 border-b border-gold-500/5 pb-3">
                  Submit Bulk Request
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Google Inc"
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Contact Person</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Business Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="corp@google.com"
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99999 88888"
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={gstDetails}
                      onChange={(e) => setGstDetails(e.target.value)}
                      placeholder="27AAAAA1111A1Z1"
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Quantity Required</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Min 10 units"
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Budget Per Unit (INR)</label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full bg-obsidian-900 border border-gold-500/10 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-300"
                    >
                      <option value="500-1000">500 to 1,000</option>
                      <option value="1000-2000">1,000 to 2,000</option>
                      <option value="2000+">Above 2,000</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Expected Delivery Date</label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-obsidian-900 border border-gold-500/10 rounded-md py-2 px-3.5 text-xs outline-none text-obsidian-300"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gold-400 font-medium">Customization Requirements</label>
                    <textarea
                      required
                      rows={4}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Describe custom engraving details, ribbon choices, chocolate print logos, or multiple delivery locations..."
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-3.5 text-xs outline-none text-obsidian-50 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-obsidian-950 font-bold py-3.5 rounded-md text-xs uppercase tracking-wider transition-all gold-glow flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>{loading ? 'Submitting request...' : 'Submit Request'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
