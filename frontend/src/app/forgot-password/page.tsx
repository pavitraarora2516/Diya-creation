'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Gift, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [debugToken, setDebugToken] = useState('');
  const [debugUrl, setDebugUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDebugToken('');
    setDebugUrl('');
    setLoading(true);

    try {
      const res = await api.post<any>('/auth/forgot-password', { email });
      setSuccessMsg(res.message || 'If this email is registered, you will receive a reset link.');
      
      // In development/test mode, the server returns the debug reset info
      if (res.debug_reset_token) {
        setDebugToken(res.debug_reset_token);
        setDebugUrl(res.debug_reset_url);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass-panel p-8 md:p-10 rounded-lg shadow-2xl relative">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center text-gold-400">
              <Gift className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-obsidian-50">Forgot Password</h2>
          <p className="text-sm font-light text-obsidian-400">
            Enter your email address and we'll send you a password reset link
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMsg ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>

            {/* Development-only Debug Assistance */}
            {debugUrl && (
              <div className="bg-gold-500/5 border border-gold-500/20 p-4 rounded-md space-y-2 text-xs">
                <p className="text-gold-400 font-medium">Sandbox Mode / Development Helper:</p>
                <p className="text-obsidian-400">Since we are in development, here is your password reset link:</p>
                <a
                  href={debugUrl}
                  className="text-gold-300 underline break-all hover:text-gold-400"
                >
                  {debugUrl}
                </a>
              </div>
            )}

            <div className="text-center pt-2">
              <Link href="/login" className="text-sm font-medium text-gold-400 hover:underline inline-flex items-center space-x-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-obsidian-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/50 rounded-md py-3 pl-10 pr-4 text-sm text-obsidian-50 placeholder-obsidian-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-obsidian-950 font-bold py-3.5 rounded-md tracking-wider transition-all gold-glow flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? <span>Sending...</span> : <span>Send Reset Link</span>}
            </button>

            <div className="text-center pt-2 border-t border-gold-500/5">
              <Link href="/login" className="text-xs font-light text-obsidian-400 hover:text-gold-400 hover:underline inline-flex items-center space-x-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
