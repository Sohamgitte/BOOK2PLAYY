import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

export default function Signup() {
  const { navigate } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPwd: '', role: 'player' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPwd) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, role: form.role } },
    });

    if (signupError) { setError(signupError.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.name,
        phone: form.phone,
        role: form.role,
        city: 'Mumbai',
      });
      navigate(form.role === 'owner' ? 'owner-portal' : 'home');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-950 to-emerald-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 to-emerald-950/60" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-emerald-400/10 rounded-full blur-[60px] animate-float-delay" />

        <div className="relative text-center text-white animate-hero-2">
          <Logo size="lg" onClick={() => navigate('home')} className="[&_span]:!text-white justify-center mb-8" />
          <h2 className="text-4xl font-black mb-4 leading-tight">Join the<br />Community!</h2>
          <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
            Register as a Player or Court Owner and get access to Maharashtra's largest sports network.
          </p>
          <div className="mt-10 space-y-3 max-w-xs mx-auto text-left">
            {['Free to join', 'Instant court bookings', 'Find playpals nearby', 'Earn as a court owner'].map((b, i) => (
              <div key={b} className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-6 pt-20 overflow-y-auto">
        <div className="w-full max-w-md animate-hero-3">
          <div className="lg:hidden mb-8">
            <Logo size="md" onClick={() => navigate('home')} />
          </div>

          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join thousands of players across Maharashtra</p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'player', label: 'Player', emoji: '🏸', desc: 'Book courts & play' },
              { value: 'owner', label: 'Court Owner', emoji: '🏟️', desc: 'List & earn' },
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => update('role', r.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                  form.role === r.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md shadow-green-500/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-1">{r.emoji}</div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{r.label}</div>
                <div className="text-gray-400 text-xs">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" required className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" required className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Phone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 9000000000" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 8 characters" required className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" value={form.confirmPwd} onChange={e => update('confirmPwd', e.target.value)} placeholder="Re-enter password" required className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
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
              className="btn-premium w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 mt-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <> Create Account <ArrowRight size={18} /> </>}
            </button>
          </form>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-green-600 dark:text-green-400 font-semibold hover:underline">Sign in</button>
          </p>
          <p className="text-center text-xs text-gray-400 mt-3">
            By signing up, you agree to our Terms of Service & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
