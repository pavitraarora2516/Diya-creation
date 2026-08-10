'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Gift, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<any>('/auth/reset-password', {
        email,
        token,
        newPassword: password,
      });
      setSuccessMsg(res.message || 'Password has been reset successfully.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 glass-panel p-8 md:p-10 rounded-lg shadow-2xl relative">
      {/* Brand & Heading */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/25 rounded-full flex items-center justify-center text-gold-400">
            <Gift className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-3xl font-serif font-bold text-obsidian-50">Reset Password</h2>
        <p className="text-sm font-light text-obsidian-400">
          Enter your new premium password below
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
          <p className="text-xs text-center text-obsidian-400">Redirecting to login page...</p>
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
            <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">New Password</label>
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

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Confirm New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-obsidian-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? <span>Resetting...</span> : <span>Reset Password</span>}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze-600/5 rounded-full blur-[120px] pointer-events-none" />
      <Suspense fallback={<div className="text-gold-400 text-sm font-light">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
