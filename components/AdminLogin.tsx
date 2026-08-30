import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ArrowRight, ShieldCheck, ChevronLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../backend/api-client';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onNavigateHome: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsLoading(true);

    const authenticatedUser = await apiClient.login(email.trim(), password);
    setIsLoading(false);

    if (!authenticatedUser) {
      setError('Account is auto created once you place an Order.');
      return;
    }

    if (authenticatedUser.role === 'admin' || authenticatedUser.isAdmin) {
      onLogin(authenticatedUser);
      return;
    }

    setNotice('Your account is auto-created when you place an order. You can continue shopping and your profile will be saved automatically.');
    onLogin(authenticatedUser);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#0B0F19] text-white flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111827] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-b from-[#1E293B] to-[#111827] p-8 text-center border-b border-white/10 relative">
          <button
            onClick={onNavigateHome}
            className="absolute top-5 left-5 text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-black uppercase tracking-wider transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <h1 className="text-2xl font-black tracking-tight">Royal Hints Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {notice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{notice}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-mono"
              />
              <Mail className="absolute left-3.5 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-mono"
              />
              <Lock className="absolute left-3.5 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.25em] transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group disabled:opacity-50"
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

          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            Accounts are created automatically after you place an order.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
