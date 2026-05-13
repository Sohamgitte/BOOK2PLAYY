import { Search, CreditCard, Trophy, Star, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HowItWorks() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-950 to-emerald-950 py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium mb-6">
            <Zap size={14} /> Simple. Fast. Seamless.
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">How Book2Play Works</h1>
          <p className="text-gray-400 text-lg">From discovering courts to playing — it takes less than 2 minutes.</p>
        </div>
      </div>

      {/* For Players */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white text-center mb-12">For Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-green-200 via-green-300 to-green-200 z-0" />
            {[
              { step: 1, icon: Search, title: 'Discover', desc: 'Search by sport, city, date, and time. Filter by price, rating, and amenities.', color: 'from-green-500 to-emerald-500' },
              { step: 2, icon: Star, title: 'Choose', desc: 'Browse verified court profiles with photos, reviews, and real-time slot availability.', color: 'from-blue-500 to-blue-600' },
              { step: 3, icon: CreditCard, title: 'Book & Pay', desc: 'Select your slot, pay securely via UPI, card, or wallet. Get instant confirmation.', color: 'from-orange-400 to-orange-500' },
              { step: 4, icon: Trophy, title: 'Play!', desc: 'Show up, show the booking confirmation, and enjoy your game!', color: 'from-yellow-400 to-yellow-500' },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center relative z-10">
                <div className="relative inline-flex">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg mb-4 mx-auto`}>
                    <Icon size={28} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                    <span className="text-xs font-black text-white dark:text-gray-900">{step}</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white text-center mb-12">For Court Owners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Register & List', desc: 'Sign up as a court owner. Complete KYC verification and list your court with photos, amenities, and pricing.', icon: Shield },
              { step: 2, title: 'Get Verified', desc: 'Our team reviews and verifies your court within 24 hours. Verified courts get priority placement.', icon: Star },
              { step: 3, title: 'Earn & Grow', desc: 'Receive instant booking notifications. Manage your calendar. Get weekly payouts. Track analytics.', icon: Trophy },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wider">Step {step}</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white text-center mb-12">Why Players Love Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Instant Booking', desc: 'No calls, no waiting. Book confirmed slots in seconds.', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
              { icon: Shield, title: 'Verified Venues', desc: 'Every court is inspected and verified by our team.', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
              { icon: Star, title: 'Real Reviews', desc: 'Honest ratings from verified players only.', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
              { icon: CreditCard, title: 'Secure Payments', desc: 'Bank-grade security. UPI, cards, and wallet accepted.', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { icon: Users, title: 'Playpals', desc: 'Find teammates and play partners nearby instantly.', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
              { icon: Trophy, title: 'Tournaments', desc: 'Join competitive tournaments and win prize money.', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-black mb-4">Ready to Play?</h2>
          <p className="text-white/80 mb-8 text-lg">Join 15,000+ players already booking on Book2Play.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('signup')} className="px-8 py-4 rounded-xl bg-white text-green-600 font-bold text-base hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('courts')} className="px-8 py-4 rounded-xl border-2 border-white/50 text-white font-bold text-base hover:bg-white/10 transition-colors">
              Browse Courts
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
