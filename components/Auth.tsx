
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    onLogin({
      id: `u-${Date.now()}`,
      name: formData.name || 'Royal Member',
      email: formData.email,
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#F8F9FA] flex items-center justify-center px-6">
      <div className="bg-white w-full max-w-md rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-gray-100">
        <div className="bg-[#1A1A1A] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6600]/20 rounded-full blur-2xl"></div>
          <div className="h-12 w-12 bg-[#FF6600] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <span className="text-white font-black text-xl">RH</span>
          </div>
          <h2 className="text-white text-3xl font-bold tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Join Royal Hints'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Access your curated luxury experience' : 'Start your journey with Royal Hints today'}
          </p>
        </div>
        
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full bg-gray-50 border border-gray-100 rounded-[8px] pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <UserIcon className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                placeholder="client@royalhints.com"
                className="w-full bg-gray-50 border border-gray-100 rounded-[8px] pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <Mail className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 ml-1">Password</label>
              {isLogin && <button type="button" className="text-[10px] uppercase tracking-widest font-bold text-[#FF6600] hover:underline">Forgot?</button>}
            </div>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-[8px] pl-10 pr-4 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#FF6600] text-white py-5 rounded-[8px] font-bold text-sm uppercase tracking-widest hover:bg-[#FF6600] transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            {isLogin ? 'Sign In' : 'Create Royal Account'} <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-500 hover:text-[#FF6600] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already a member? Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
