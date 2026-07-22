'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModal } from '@/hooks/useAuthModal';
import { createClient } from '@/utils/supabase/client';
import { X } from 'lucide-react';

export default function AuthModal() {
  const { isOpen, intent, closeAuthModal } = useAuthModal();
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      }

      closeAuthModal();
      
      // Redirect based on intent
      if (intent === 'image') {
        router.push('/dashboard/new-order');
      } else if (intent === 'strategy') {
        router.push('/dashboard/brand-strategy');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#333] rounded-lg p-6 w-full max-w-md relative shadow-2xl">
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-2 font-['League_Spartan']">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isLogin 
            ? 'Sign in to continue to tyes.' 
            : intent === 'strategy' 
              ? 'Sign up to get your free brand strategy snapshot.' 
              : 'Sign up to start your free image campaign.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2DD4BF] uppercase tracking-widest mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#333] text-white rounded p-2 focus:border-[#2DD4BF] outline-none"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2DD4BF] uppercase tracking-widest mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#333] text-white rounded p-2 focus:border-[#2DD4BF] outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2DD4BF] text-[#0A0A0A] font-bold py-2 rounded flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[#2DD4BF] hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
