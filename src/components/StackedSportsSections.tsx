import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, MapPin, Star, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_COURTS, SPORTS } from '../lib/mockData';

const SPORT_SECTIONS = [
  {
    sport: SPORTS[0], // Badminton
    tagline: 'Rally. Smash. Win.',
    description: 'Premium indoor courts with professional lighting and AC. Perfect for casual rallies or competitive matches.',
    gradient: 'from-blue-950 via-slate-900 to-blue-950',
    accent: 'blue',
    image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    sport: SPORTS[1], // Football
    tagline: 'Pitch. Pass. Score.',
    description: 'Full-size turf grounds with floodlights. Rain or shine, your game never stops.',
    gradient: 'from-green-950 via-emerald-950 to-green-950',
    accent: 'green',
    image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    sport: SPORTS[2], // Tennis
    tagline: 'Serve. Volley. Ace.',
    description: 'Hard and clay courts with expert coaching available. From beginners to tournament players.',
    gradient: 'from-amber-950 via-yellow-950 to-amber-950',
    accent: 'amber',
    image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    sport: SPORTS[3], // Basketball
    tagline: 'Dribble. Shoot. Dunk.',
    description: 'Professional wooden flooring with electronic scoreboards. Indoor and outdoor options available.',
    gradient: 'from-orange-950 via-red-950 to-orange-950',
    accent: 'orange',
    image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    sport: SPORTS[6], // Box Cricket
    tagline: 'Bat. Bowl. Blast.',
    description: 'Modern box cricket with digital scoring. Six-a-side action packed into every over.',
    gradient: 'from-red-950 via-rose-950 to-red-950',
    accent: 'red',
    image: 'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    sport: SPORTS[5], // Table Tennis
    tagline: 'Spin. Smash. Repeat.',
    description: 'Olympic-grade tables in climate-controlled halls. Precision play at its finest.',
    gradient: 'from-teal-950 via-cyan-950 to-teal-950',
    accent: 'teal',
    image: 'https://images.pexels.com/photos/8007435/pexels-photo-8007435.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

const accentColors: Record<string, { text: string; bg: string; border: string; glow: string; badge: string }> = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', glow: 'shadow-blue-500/20', badge: 'bg-blue-500' },
  green: { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', glow: 'shadow-green-500/20', badge: 'bg-green-500' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', glow: 'shadow-amber-500/20', badge: 'bg-amber-500' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', glow: 'shadow-orange-500/20', badge: 'bg-orange-500' },
  red: { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', glow: 'shadow-red-500/20', badge: 'bg-red-500' },
  teal: { text: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/30', glow: 'shadow-teal-500/20', badge: 'bg-teal-500' },
};

function SportSection({ section, index, totalSections }: {
  section: typeof SPORT_SECTIONS[number];
  index: number;
  totalSections: number;
}) {
  const { navigate } = useApp();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const colors = accentColors[section.accent];

  const relatedCourts = MOCK_COURTS.filter(c => c.sport === section.sport.name).slice(0, 3);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1, rootMargin: '-10% 0px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const sectionHeight = el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrolledInto = viewportHeight - rect.top;
      const totalScroll = sectionHeight + viewportHeight;
      const p = Math.max(0, Math.min(1, scrolledInto / totalScroll));
      setProgress(p);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isVisible]);

  // Calculate visual properties based on scroll progress
  const isLast = index === totalSections - 1;
  const enterProgress = Math.min(1, progress * 2.5);
  const exitProgress = Math.max(0, (progress - 0.6) / 0.4);

  const contentOpacity = Math.min(1, enterProgress * 1.5) * (1 - exitProgress * 0.5);
  const contentTranslateY = (1 - enterProgress) * 60;
  const contentScale = 0.92 + enterProgress * 0.08;

  const bgScale = 1 + progress * 0.08;
  const bgOpacity = 0.15 + enterProgress * 0.15;

  const cardStagger = (delay: number) => ({
    opacity: Math.max(0, Math.min(1, (enterProgress - 0.2 - delay * 0.15) * 3)),
    transform: `translateY(${Math.max(0, (1 - (enterProgress - delay * 0.15)) * 40)}px)`,
  });

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: isLast ? '100vh' : '120vh' }}
    >
      <div
        className={`sticky top-0 h-screen w-full overflow-hidden bg-gradient-to-br ${section.gradient}`}
        style={{ zIndex: index + 1 }}
      >
        {/* Background Image with parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={section.image}
            alt=""
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${bgScale})`,
              opacity: bgOpacity,
              transition: 'transform 0.1s linear, opacity 0.3s ease',
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-80`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>

        {/* Floating accent orb */}
        <div
          className={`absolute top-1/4 right-1/4 w-96 h-96 ${colors.bg} rounded-full blur-[120px]`}
          style={{ opacity: enterProgress * 0.6, transition: 'opacity 0.5s ease' }}
        />
        <div
          className={`absolute bottom-1/4 left-1/4 w-64 h-64 ${colors.bg} rounded-full blur-[80px]`}
          style={{ opacity: enterProgress * 0.4, transition: 'opacity 0.5s ease' }}
        />

        {/* Content */}
        <div className="relative h-full flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div
                style={{
                  opacity: contentOpacity,
                  transform: `translateY(${contentTranslateY}px) scale(${contentScale})`,
                  transition: 'transform 0.15s ease-out, opacity 0.2s ease',
                }}
              >
                {/* Sport Icon + Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-5xl">{section.sport.icon}</span>
                  <span className={`px-4 py-1.5 rounded-full ${colors.bg} ${colors.border} border ${colors.text} text-sm font-bold uppercase tracking-wider`}>
                    {section.sport.name}
                  </span>
                </div>

                {/* Tagline */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-none tracking-tight">
                  {section.tagline}
                </h2>

                {/* Description */}
                <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
                  {section.description}
                </p>

                {/* Stats */}
                <div className="flex gap-6 mb-8">
                  {[
                    { label: 'Courts', value: relatedCourts.length > 0 ? `${relatedCourts.length}+` : '12+' },
                    { label: 'Avg Price', value: relatedCourts.length > 0 ? `₹${relatedCourts[0]?.price_per_hour || 500}/hr` : '₹500/hr' },
                    { label: 'Rating', value: relatedCourts.length > 0 ? `${relatedCourts[0]?.rating || 4.5}★` : '4.5★' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('courts')}
                  className={`btn-premium inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${colors.badge} text-white font-bold text-lg shadow-xl ${colors.glow}`}
                >
                  Explore {section.sport.name} Courts
                  <ArrowRight size={20} />
                </button>
              </div>

              {/* Right: Court Cards */}
              <div className="hidden lg:block space-y-4">
                {relatedCourts.length > 0 ? relatedCourts.map((court, i) => (
                  <div
                    key={court.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                    style={cardStagger(i)}
                    onClick={() => navigate('court-details', { courtId: court.id })}
                  >
                    <img
                      src={court.cover_image}
                      alt={court.name}
                      className="w-20 h-20 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm group-hover:text-green-300 transition-colors">{court.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <MapPin size={11} className={colors.text} />
                        {court.area}, {court.city}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-400" fill="currentColor" />
                          <span className="text-xs font-semibold text-white">{court.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={11} className={colors.text} />
                          <span className="text-xs text-gray-400">{court.available_slots || 8} slots</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-sm font-bold text-white">₹{court.price_per_hour}/hr</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                )) : (
                  // Fallback cards when no specific courts match
                  [0, 1, 2].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                      style={cardStagger(i)}
                      onClick={() => navigate('courts')}
                    >
                      <div className={`w-20 h-20 rounded-xl ${colors.bg} flex items-center justify-center text-3xl`}>
                        {section.sport.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">Premium {section.sport.name} Court</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <MapPin size={11} className={colors.text} />
                          Multiple locations
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400" fill="currentColor" />
                            <span className="text-xs font-semibold text-white">4.6</span>
                          </div>
                          <span className="text-sm font-bold text-white">From ₹500/hr</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section counter */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {SPORT_SECTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? `w-8 ${colors.badge}` : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Scroll hint (only on first section) */}
        {index === 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/30 text-xs flex flex-col items-center gap-1 animate-bounce-subtle z-10">
            <span>Scroll to explore</span>
            <div className="w-4 h-6 rounded-full border border-white/20 flex items-start justify-center pt-1">
              <div className="w-0.5 h-1.5 bg-white/40 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StackedSportsSections() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { navigate } = useApp();

  return (
    <div ref={containerRef} className="relative">
      {/* Intro header */}
      <div className="relative h-[40vh] flex items-center justify-center bg-gradient-to-b from-gray-50 dark:from-gray-950 to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-green-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium mb-4">
            Explore by Sport
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white mb-3">
            Every Sport. Every Court.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Scroll through Maharashtra's finest sports facilities. Each section reveals a new world of play.
          </p>
        </div>
      </div>

      {/* Stacked sections */}
      {SPORT_SECTIONS.map((section, index) => (
        <SportSection
          key={section.sport.id}
          section={section}
          index={index}
          totalSections={SPORT_SECTIONS.length}
        />
      ))}

      {/* Bottom fade-out */}
      <div className="relative h-[30vh] bg-gradient-to-b from-gray-900 to-gray-50 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-black text-white mb-3">Ready to Play?</h3>
          <button
            onClick={() => navigate('courts')}
            className="btn-premium px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/25"
          >
            Browse All Courts
          </button>
        </div>
      </div>
    </div>
  );
}
