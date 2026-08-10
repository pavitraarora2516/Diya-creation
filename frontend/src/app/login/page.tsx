'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Sparkles, Gift } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const router = useRouter();
  const { login, error: authError, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
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
          <h2 className="text-3xl font-serif font-bold text-obsidian-50">Welcome Back</h2>
          <p className="text-sm font-light text-obsidian-400">
            Sign in to access your saved customizations & orders
          </p>
        </div>

        {/* Error Messages */}
        {(error || authError) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded text-center">
            {error || authError}
          </div>
        )}

        {/* Login Form */}
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs font-light text-gold-400/60 hover:text-gold-400 hover:underline cursor-pointer">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-obsidian-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/50 rounded-md py-3 pl-10 pr-4 text-sm text-obsidian-50 placeholder-obsidian-500 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-obsidian-950 font-bold py-3.5 rounded-md tracking-wider transition-all gold-glow flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? <span>signing in...</span> : <span>Sign In</span>}
          </button>
        </form>

        <div className="text-center text-xs font-light text-obsidian-400 pt-2 border-t border-gold-500/5">
          Don't have an account?{' '}
          <Link href="/register" className="text-gold-400 font-medium hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
