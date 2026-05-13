import { Heart, Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface CourtCardProps {
  court: {
    id: string;
    name: string;
    sport: string;
    cover_image: string;
    rating: number;
    total_reviews: number;
    price_per_hour: number;
    city: string;
    area: string;
    is_verified: boolean;
    amenities: string[];
    distance?: string;
    available_slots?: number;
  };
  compact?: boolean;
}

export default function CourtCard({ court, compact = false }: CourtCardProps) {
  const { navigate } = useApp();
  const [liked, setLiked] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const sportColors: Record<string, string> = {
    Badminton: 'bg-blue-100 text-blue-700',
    Football: 'bg-green-100 text-green-700',
    Tennis: 'bg-yellow-100 text-yellow-700',
    Basketball: 'bg-orange-100 text-orange-700',
    Volleyball: 'bg-purple-100 text-purple-700',
    'Table Tennis': 'bg-teal-100 text-teal-700',
    'Box Cricket': 'bg-red-100 text-red-700',
    Pickleball: 'bg-pink-100 text-pink-700',
  };

  return (
    <div
      className="card-hover card-glow group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer"
      onClick={() => navigate('court-details', { courtId: court.id })}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={court.cover_image}
          alt={court.name}
          className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${compact ? 'h-40' : 'h-52'} ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && (
          <div className={`w-full ${compact ? 'h-40' : 'h-52'} skeleton`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${sportColors[court.sport] || 'bg-gray-100 text-gray-700'}`}>
            {court.sport}
          </span>
          {court.is_verified && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Verified
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
            liked ? 'bg-red-500 text-white scale-110' : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:scale-110'
          }`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
        </button>

        {/* Available slots */}
        {court.available_slots !== undefined && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-gray-800 flex items-center gap-1 shadow-sm">
            <Clock size={10} className="text-green-500" />
            {court.available_slots} slots
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">{court.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={13} className="text-yellow-400" fill="currentColor" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{court.rating}</span>
            <span className="text-xs text-gray-400">({court.total_reviews})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-3">
          <MapPin size={11} className="text-green-500" />
          <span>{court.area}, {court.city}</span>
          {court.distance && <span className="ml-auto font-medium text-gray-600 dark:text-gray-300">{court.distance}</span>}
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {court.amenities.slice(0, 3).map(am => (
              <span key={am} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">{am}</span>
            ))}
            {court.amenities.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-400 text-xs rounded-full">+{court.amenities.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-gray-900 dark:text-white">₹{court.price_per_hour}</span>
            <span className="text-xs text-gray-400 ml-1">/hr</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); navigate('court-details', { courtId: court.id }); }}
            className="btn-premium flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold shadow-sm"
          >
            Book <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
