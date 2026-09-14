import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ArrowRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { apiClient } from '../backend/api-client';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onNavigateHome: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const authenticatedUser = await apiClient.login(email.trim(), password);
    setIsLoading(false);

    if (!authenticatedUser) {
      setError('Invalid administrator credentials.');
      return;
    }

    if (authenticatedUser.role === 'admin' || authenticatedUser.isAdmin) {
      onLogin(authenticatedUser);
      return;
    }

    onLogin(authenticatedUser);
  };

  return (
    <div className="min-h-[70vh] bg-[#eff6ff] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden bg-white shadow-xl shadow-blue-900/10 lg:grid-cols-[.8fr_1.2fr]">
        <div className="hidden bg-[#172033] p-10 text-white lg:block"><p className="text-xs font-black uppercase tracking-[.28em] text-blue-300">Royal Hints account</p><h2 className="mt-8 text-4xl font-black leading-tight">Your orders, saved in one place.</h2><p className="mt-5 text-sm leading-7 text-slate-300">Keep your profile, shopping bag, order updates, quotations, and sourcing requests connected to your account.</p><div className="mt-12 border-t border-white/15 pt-6 text-xs font-bold text-blue-200">Shop with clarity. Return with confidence.</div></div>
        <div className="relative">
        <div className="border-b border-blue-100 bg-white p-8 text-center">
          <button
            onClick={onNavigateHome}
            className="absolute top-5 left-5 text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-black uppercase tracking-wider transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <h1 className="text-3xl font-black tracking-tight text-[#172033]">Administrator sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Access the Royal Hints administration desk.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-in fade-in duration-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
              <Mail className="absolute left-3.5 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-10 pr-4 text-sm text-[#172033] outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
              <Lock className="absolute left-3.5 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-4 text-xs font-black uppercase tracking-[0.25em] text-white shadow-xl shadow-blue-500/25 transition-all hover:bg-[#1D4ED8] group disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">Customer checkout does not require an account.</p>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
