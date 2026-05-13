import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Star, Shield, Zap, Users, Trophy, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CourtCard from '../components/CourtCard';
import SportsParticles from '../components/SportsParticles';
import StackedSportsSections from '../components/StackedSportsSections';
import { MOCK_COURTS, MOCK_TOURNAMENTS, TESTIMONIALS, SPORTS } from '../lib/mockData';
import { useReveal, useParallax } from '../hooks/useReveal';

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = end / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function StaggerGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, revealed } = useReveal(0.05);
  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) && children.map((child, i) => (
        <div
          key={i}
          className={`transition-all duration-500 ease-out ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { navigate } = useApp();
  const [searchSport, setSearchSport] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const parallaxOffset = useParallax(0.3);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const featuredCourts = MOCK_COURTS.filter(c => c.is_featured).slice(0, 4);
  const topCourts = MOCK_COURTS.slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="sports background"
            className="w-full h-full object-cover"
            style={{ transform: `scale(1.1) translateY(${parallaxOffset * 0.15}px)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-900/80 to-emerald-950/70" />
          {/* Animated gradient orbs */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] animate-float-delay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-[120px] animate-float-slow" />
        </div>

        {/* Sports Particles */}
        <SportsParticles />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center z-10">
          {/* Badge */}
          <div className="animate-hero-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Zap size={14} />
            Maharashtra's #1 Sports Court Booking Platform
          </div>

          <h1 className="animate-hero-2 text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-6 leading-none tracking-tight">
            FIND YOUR
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 animate-gradient bg-[length:200%_200%]">
              COURT
            </span>
          </h1>

          <p className="animate-hero-3 text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover top-rated sports courts near you. Real-time slots, instant booking, seamless experience.
          </p>

          {/* Search Bar */}
          <div className="animate-hero-3 max-w-3xl mx-auto mb-10">
            <div className="bg-white/10 glass rounded-2xl border border-white/20 p-2 flex flex-col sm:flex-row gap-2 shadow-2xl shadow-green-500/10">
              <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <Search size={18} className="text-gray-400" />
                <select
                  value={searchSport}
                  onChange={e => setSearchSport(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm outline-none"
                >
                  <option value="" className="text-gray-900">Select Sport</option>
                  {SPORTS.map(s => <option key={s.id} value={s.name} className="text-gray-900">{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <ChevronDown size={18} className="text-gray-400" />
                <select
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm outline-none"
                >
                  <option value="" className="text-gray-900">Select City</option>
                  {['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Nagpur', 'Nashik'].map(c => (
                    <option key={c} value={c} className="text-gray-900">{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => navigate('courts')}
                className="btn-premium px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/30 whitespace-nowrap"
              >
                Find Courts
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="animate-hero-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('courts')}
              className="btn-premium flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-xl shadow-green-500/30"
            >
              Find Courts <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('how-it-works')}
              className="btn-premium flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-lg hover:bg-white/10 backdrop-blur-sm"
            >
              <Play size={18} className="text-green-400" fill="currentColor" /> How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="animate-hero-4 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: 200, suffix: '+', label: 'Venues' },
              { value: 15000, suffix: '+', label: 'Bookings', display: '15k+' },
              { value: 4, suffix: '.8★', label: 'Avg Rating' },
              { value: 10, suffix: '+', label: 'Sports' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl font-black text-white mb-1 group-hover:text-green-400 transition-colors duration-300">
                  {stat.display || <AnimatedCounter end={stat.value} suffix={stat.suffix} />}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs animate-bounce-subtle">
          <span>Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-green-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Immersive Stacked Sports Sections */}
      <StackedSportsSections />

      {/* Featured Courts */}
      <section className="py-20 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-green-500/3 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <RevealSection>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  Featured Courts
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Top-rated venues handpicked for you</p>
              </div>
              <button
                onClick={() => navigate('courts')}
                className="hidden sm:flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:gap-3 transition-all"
              >
                View All <ArrowRight size={18} />
              </button>
            </div>
          </RevealSection>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourts.map(court => (
              <CourtCard key={court.id} court={court} />
            ))}
          </StaggerGrid>
          <RevealSection delay={400}>
            <div className="mt-8 text-center sm:hidden">
              <button onClick={() => navigate('courts')} className="btn-premium px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold">
                View All Courts
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-300/10 rounded-full blur-[80px] animate-float" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-emerald-300/10 rounded-full blur-[60px] animate-float-delay" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <RevealSection>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">How It Works</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Book your favourite court in 3 simple steps</p>
            </div>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-green-300 via-emerald-300 to-green-300" />
            {[
              { step: '01', icon: Search, title: 'Search & Discover', desc: 'Browse courts by sport, location, date and time. Filter by amenities, price, and ratings.' },
              { step: '02', icon: CheckCircle, title: 'Select & Book', desc: 'Pick your preferred time slot, review pricing, and complete secure payment in seconds.' },
              { step: '03', icon: Trophy, title: 'Show Up & Play', desc: 'Get instant booking confirmation. Show up to the court and enjoy your game!' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <RevealSection key={step} delay={i * 150}>
                <div className="relative text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-6 shadow-lg shadow-green-500/25 relative z-10 group-hover:scale-110 group-hover:shadow-green-500/40 transition-all duration-300">
                    <Icon size={28} />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <span className="text-xs font-black text-green-600 dark:text-green-400">{step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  Upcoming Tournaments
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Compete, win, and glory awaits</p>
              </div>
              <button onClick={() => navigate('tournaments')} className="hidden sm:flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:gap-3 transition-all">
                View All <ArrowRight size={18} />
              </button>
            </div>
          </RevealSection>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_TOURNAMENTS.map(t => (
              <div key={t.id} className="card-hover card-glow group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer" onClick={() => navigate('tournaments')}>
                <div className="relative h-44 overflow-hidden">
                  <img src={t.cover_image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold uppercase">{t.status}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-base">{t.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-green-300 text-xs">{t.sport} • {t.city}</span>
                      <span className="text-yellow-400 font-bold text-sm">₹{t.prize_pool.toLocaleString()} Prize</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Registration Fee</div>
                    <div className="font-bold text-gray-900 dark:text-white">₹{t.registration_fee}/team</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Starts</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <button className="btn-premium px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold">
                    Register
                  </button>
                </div>
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* AI Recommendation Banner */}
      <section className="py-20 bg-gradient-to-br from-gray-950 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/8 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-[80px] animate-float-delay" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium mb-6">
              <Zap size={14} /> AI-Powered Recommendations
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Let AI Find Your<br />Perfect Court
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 text-lg">
              Our smart algorithm learns your preferences and recommends courts tailored to your schedule, skill level, and location.
            </p>
            <button
              onClick={() => navigate('courts')}
              className="btn-premium px-10 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-xl shadow-green-500/30"
            >
              Try Smart Search
            </button>
          </RevealSection>
        </div>
      </section>

      {/* Top Courts */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <RevealSection>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
                  Top Rated Courts
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Loved by players across Maharashtra</p>
              </div>
              <button onClick={() => navigate('courts')} className="hidden sm:flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:gap-3 transition-all">
                View All <ArrowRight size={18} />
              </button>
            </div>
          </RevealSection>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCourts.map(court => (
              <CourtCard key={court.id} court={court} />
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/3 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <RevealSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">What Players Say</h2>
              <p className="text-gray-500 dark:text-gray-400">Trusted by thousands of sports enthusiasts</p>
            </div>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.id}
                className={`p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  i === activeTestimonial
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-transparent text-white shadow-xl shadow-green-500/25 -translate-y-2 scale-[1.02]'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" className={i === activeTestimonial ? 'text-yellow-300' : 'text-yellow-400'} />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${i === activeTestimonial ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20" />
                  <div>
                    <div className={`font-semibold text-sm ${i === activeTestimonial ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{t.name}</div>
                    <div className={`text-xs ${i === activeTestimonial ? 'text-white/70' : 'text-gray-400'}`}>{t.role} • {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-8 h-2 bg-green-500' : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-green-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <RevealSection>
        <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[60px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                  Own a Sports Court?
                </h2>
                <p className="text-white/80 text-lg max-w-xl">
                  Join 200+ venues on Book2Play. List your court, manage bookings, and grow your revenue with zero hassle.
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  {['Zero Setup Fee', 'Real-time Bookings', 'Instant Payments', 'Analytics Dashboard'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-white/90 text-sm">
                      <Shield size={14} className="text-white" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate('owner-portal')}
                className="btn-premium flex-shrink-0 px-10 py-4 rounded-2xl bg-white text-green-600 font-bold text-lg shadow-xl flex items-center gap-2"
              >
                List Your Court <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h2>
            </div>
          </RevealSection>
          <div className="space-y-4">
            {[
              { q: 'How do I book a court?', a: 'Simply search for courts by sport and location, select your preferred time slot, and complete payment online. You\'ll receive instant confirmation.' },
              { q: 'Can I cancel my booking?', a: 'Yes, you can cancel up to 24 hours before your booking for a full refund. Late cancellations may incur a 20% fee.' },
              { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and Book2Play wallet balance.' },
              { q: 'How do I list my court as an owner?', a: 'Register as a court owner, complete KYC verification, and start listing your venue. Our team will verify and approve within 24 hours.' },
              { q: 'Is there a membership plan?', a: 'We offer monthly and annual memberships with discounts up to 25% on all bookings, plus priority slot access.' },
            ].map(({ q, a }, i) => (
              <RevealSection key={i} delay={i * 80}>
                <FAQItem question={q} answer={a} />
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden card-hover">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 dark:text-white">{question}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-out ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
}
