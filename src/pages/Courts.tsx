import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Star, MapPin } from 'lucide-react';
import { MOCK_COURTS, SPORTS, CITIES } from '../lib/mockData';
import CourtCard from '../components/CourtCard';
import { useReveal } from '../hooks/useReveal';

function RevealDiv({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useReveal(0.05);
  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Courts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');

  const filtered = useMemo(() => {
    let results = [...MOCK_COURTS];
    if (searchQuery) results = results.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.area.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedSport) results = results.filter(c => c.sport === selectedSport);
    if (selectedCity) results = results.filter(c => c.city === selectedCity);
    results = results.filter(c => c.rating >= minRating && c.price_per_hour <= maxPrice);

    if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price-low') results.sort((a, b) => a.price_per_hour - b.price_per_hour);
    else if (sortBy === 'price-high') results.sort((a, b) => b.price_per_hour - a.price_per_hour);
    else if (sortBy === 'reviews') results.sort((a, b) => b.total_reviews - a.total_reviews);

    return results;
  }, [searchQuery, selectedSport, selectedCity, minRating, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSport('');
    setSelectedCity('');
    setMinRating(0);
    setMaxPrice(5000);
  };

  const hasFilters = searchQuery || selectedSport || selectedCity || minRating > 0 || maxPrice < 5000;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-emerald-950 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Discover Courts</h1>
          <p className="text-gray-400 mb-8">Find and book the best sports courts across Maharashtra</p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courts, areas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:border-green-400 transition-colors glass"
              />
            </div>
            <select
              value={selectedSport}
              onChange={e => setSelectedSport(e.target.value)}
              className="px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-green-400 transition-colors glass"
            >
              <option value="" className="text-gray-900">All Sports</option>
              {SPORTS.map(s => <option key={s.id} value={s.name} className="text-gray-900">{s.name}</option>)}
            </select>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-green-400 transition-colors glass"
            >
              <option value="" className="text-gray-900">All Cities</option>
              {CITIES.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border font-semibold transition-all ${
                showFilters ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 text-white hover:bg-white/10 glass'
              }`}
            >
              <SlidersHorizontal size={18} /> Filters
            </button>
          </div>

          {/* Advanced Filters */}
          <div className={`transition-all duration-500 ease-out overflow-hidden ${showFilters ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 bg-white/10 glass rounded-xl border border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-xs text-gray-300 font-semibold uppercase tracking-wider mb-2 block">Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white outline-none text-sm">
                  <option value="rating" className="text-gray-900">Top Rated</option>
                  <option value="price-low" className="text-gray-900">Price: Low to High</option>
                  <option value="price-high" className="text-gray-900">Price: High to Low</option>
                  <option value="reviews" className="text-gray-900">Most Reviewed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-300 font-semibold uppercase tracking-wider mb-2 block">Min Rating: {minRating}+</label>
                <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="w-full accent-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-300 font-semibold uppercase tracking-wider mb-2 block">Max Price: ₹{maxPrice}/hr</label>
                <input type="range" min="200" max="5000" step="100" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-green-500" />
              </div>
              <div className="flex items-end">
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm font-semibold hover:bg-red-500/30 transition-colors">
                    <X size={14} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
            {selectedSport && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                {selectedSport}
                <button onClick={() => setSelectedSport('')}><X size={12} /></button>
              </span>
            )}
            {selectedCity && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
                <MapPin size={12} />{selectedCity}
                <button onClick={() => setSelectedCity('')}><X size={12} /></button>
              </span>
            )}
            {minRating > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                <Star size={12} />{minRating}+
                <button onClick={() => setMinRating(0)}><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {filtered.length} Courts Found
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent outline-none cursor-pointer text-gray-700 dark:text-gray-300 font-medium">
              <option value="rating">Top Rated</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No courts found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="btn-premium px-6 py-3 rounded-xl bg-green-500 text-white font-semibold">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((court, i) => (
              <RevealDiv key={court.id} delay={i * 60}>
                <CourtCard court={court} />
              </RevealDiv>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
