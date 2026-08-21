import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, ArrowRight, ShieldCheck, Crown, ChevronLeft, KeyRound, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onNavigateHome: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onNavigateHome }) => {
  const [email, setEmail] = useState('chikusehopeson@gmail.com');
  const [password, setPassword] = useState('royaladmin2024');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('royaladmin2024');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      
      // Verification for admin authentication
      if (!cleanEmail) {
        setError('Please enter a valid administrator email address.');
        return;
      }

      const isChikuse = cleanEmail === 'chikusehopeson@gmail.com';
      const isAdminEmail = isChikuse || cleanEmail.includes('admin') || cleanEmail.endsWith('@royalhints.com');

      if (!isAdminEmail) {
        setError('Access Restricted: This login terminal is reserved exclusively for Royal Hints Administrators. Regular buyers receive auto-generated Unique IDs upon placing an order.');
        return;
      }

      const adminUser: User = {
        id: 'admin-1',
        name: isChikuse ? 'Chikuse Hopeson (Administrator)' : 'Royal Hints Administration',
        email: cleanEmail,
        role: 'admin',
        isAdmin: true
      };

      onLogin(adminUser);
    }, 400);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#0B0F19] text-white flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#111827] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Terminal Header */}
        <div className="bg-gradient-to-b from-[#1E293B] to-[#111827] p-8 text-center border-b border-white/10 relative">
          <button 
            onClick={onNavigateHome}
            className="absolute top-5 left-5 text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-black uppercase tracking-wider transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Boutique
          </button>

          <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
            <Crown className="h-7 w-7 text-white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <ShieldCheck className="h-3 w-3 text-amber-400" /> Admin Clearance Portal
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Executive Terminal
          </h2>
          <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
            Restricted access for Royal Hints Administrators to manage stock, ventures, quotes, and dispatch telemetry.
          </p>
        </div>

        {/* Quick Credentials Presets */}
        <div className="p-4 bg-white/[0.02] border-b border-white/5">
          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2.5 flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-[#2563EB]" /> Fast Admin Key Selection
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAdminPreset('chikusehopeson@gmail.com')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'chikusehopeson@gmail.com'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="block text-[10px] font-black text-amber-400 uppercase">Primary Owner</span>
              <span className="block text-[11px] font-bold truncate">chikusehopeson@gmail.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleAdminPreset('admin@royalhints.com')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                email === 'admin@royalhints.com'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="block text-[10px] font-black text-blue-400 uppercase">Executive Desk</span>
              <span className="block text-[11px] font-bold truncate">admin@royalhints.com</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">
              Administrator Email
            </label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@royalhints.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-mono"
              />
              <Mail className="absolute left-3.5 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">
                Security Password / Secret Key
              </label>
            </div>
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
                Authenticating...
              </span>
            ) : (
              <>
                Authorize Admin Terminal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Buyer Information Notice */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <strong className="text-gray-200">Buyer Policy:</strong> Customers do not need accounts or passwords. A unique buyer ID is automatically assigned and activated upon completing any order in the boutique checkout.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
