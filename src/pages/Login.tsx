import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

export default function Login() {
  const { navigate } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('home');
    setLoading(false);
  };

  const handleDemoLogin = async (role: 'player' | 'owner' | 'admin') => {
    const creds = {
      player: { email: 'player@demo.com', password: 'Demo1234!' },
      owner: { email: 'owner@demo.com', password: 'Demo1234!' },
      admin: { email: 'admin@demo.com', password: 'Demo1234!' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-950 to-emerald-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 to-emerald-950/60" />
        </div>
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-float-delay" />

        <div className="relative text-center text-white animate-hero-2">
          <Logo size="lg" onClick={() => navigate('home')} className="[&_span]:!text-white justify-center mb-8" />
          <h2 className="text-4xl font-black mb-4 leading-tight">Ready to<br />Play?</h2>
          <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
            Sign in to book courts, join tournaments, find playpals and manage your sports life.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto text-left">
            {['200+ Courts', '15k+ Bookings', '4.8 Rating', '8 Sports'].map((stat, i) => (
              <div key={stat} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-0.5" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-green-400 font-bold text-sm">{stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-md animate-hero-3">
          <div className="lg:hidden mb-8">
            <Logo size="md" onClick={() => navigate('home')} />
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Welcome back!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to your account to continue</p>

          {/* Demo Login */}
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="flex gap-2">
              {(['player', 'owner', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role)}
                  className="flex-1 py-1.5 rounded-lg bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold capitalize hover:bg-green-500/30 transition-all hover:scale-105"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                <button type="button" className="text-sm text-green-600 dark:text-green-400 hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-scale-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <> Sign In <ArrowRight size={18} /> </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <button onClick={() => navigate('signup')} className="text-green-600 dark:text-green-400 font-semibold hover:underline">Sign up free</button>
          </p>

          <div className="mt-4 text-center">
            <button onClick={() => navigate('owner-portal')} className="text-sm text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Register as Court Owner →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
