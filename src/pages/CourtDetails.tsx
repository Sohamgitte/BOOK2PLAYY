import { useState } from 'react';
import { Star, MapPin, Clock, Shield, ChevronLeft, Heart, Share2, CheckCircle, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_COURTS, MOCK_REVIEWS, TIME_SLOTS } from '../lib/mockData';
import { useReveal } from '../hooks/useReveal';

function RevealDiv({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, revealed } = useReveal(0.05);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function CourtDetails() {
  const { navigate, pageParams, user } = useApp();
  const courtId = pageParams.courtId || '1';
  const court = MOCK_COURTS.find(c => c.id === courtId) || MOCK_COURTS[0];

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStart, setSelectedStart] = useState('');
  const [selectedEnd, setSelectedEnd] = useState('');
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = [
    court.cover_image,
    'https://images.pexels.com/photos/8007435/pexels-photo-8007435.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/5741072/pexels-photo-5741072.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  const courtReviews = MOCK_REVIEWS.filter(r => r.court_id === courtId) || MOCK_REVIEWS;

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleBook = () => {
    if (!user) { navigate('login'); return; }
    if (!selectedDate || !selectedStart) return;
    navigate('payment', { courtId: court.id, date: selectedDate, startTime: selectedStart, endTime: selectedEnd || selectedStart });
  };

  const hours = selectedStart && selectedEnd
    ? (parseInt(selectedEnd) - parseInt(selectedStart))
    : 1;
  const totalPrice = court.price_per_hour * Math.max(hours, 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate('courts')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Courts
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <RevealDiv>
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden h-80 sm:h-96 group">
                  <img src={images[activeImage]} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {court.is_verified && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold backdrop-blur-sm shadow-lg animate-pulse-glow">
                        <Shield size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => setLiked(!liked)} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-lg ${liked ? 'bg-red-500 text-white scale-110' : 'bg-white/80 text-gray-700 hover:scale-110'}`}>
                      <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:scale-110 transition-transform shadow-lg">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`rounded-xl overflow-hidden h-20 border-2 transition-all duration-300 ${activeImage === i ? 'border-green-500 shadow-md scale-[1.02]' : 'border-transparent hover:border-green-300'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </RevealDiv>

            {/* Info */}
            <RevealDiv delay={100}>
              <div className="card-hover bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">{court.sport}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{court.name}</h1>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin size={14} className="text-green-500" />
                      <span>{court.address}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Star size={16} fill="currentColor" className="text-yellow-400" />
                      <span className="font-bold text-gray-900 dark:text-white text-lg">{court.rating}</span>
                    </div>
                    <div className="text-xs text-gray-400">{court.total_reviews} reviews</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{court.description}</p>
              </div>
            </RevealDiv>

            {/* Amenities */}
            <RevealDiv delay={200}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white text-xl mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {court.amenities.map((am, i) => (
                    <div key={am} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      {am}
                    </div>
                  ))}
                </div>
              </div>
            </RevealDiv>

            {/* Policies */}
            <RevealDiv delay={300}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white text-xl mb-3">Venue Policies</h2>
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <Shield size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{court.policies}</p>
                </div>
              </div>
            </RevealDiv>

            {/* Reviews */}
            <RevealDiv delay={400}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 dark:text-white text-xl">Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Star size={20} fill="currentColor" className="text-yellow-400" />
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{court.rating}</span>
                    <span className="text-gray-400 text-sm">/ 5</span>
                  </div>
                </div>
                <div className="space-y-5">
                  {(courtReviews.length > 0 ? courtReviews : MOCK_REVIEWS).map(review => (
                    <div key={review.id} className="flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded-xl transition-colors">
                      <img src={review.avatar} alt={review.player_name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{review.player_name}</span>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} size={12} fill="currentColor" className="text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealDiv>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden animate-pulse-glow">
                {/* Price Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black">₹{court.price_per_hour}</span>
                      <span className="text-white/70 pb-1">/hour</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Users size={14} className="text-white/70" />
                      <span className="text-white/70 text-sm">{court.available_slots || 8} slots available today</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Date */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Select Date</label>
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
                        {getNext7Days().map(date => {
                          const d = new Date(date);
                          return (
                            <button
                              key={date}
                              onClick={() => setSelectedDate(date)}
                              className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-all min-w-[50px] hover:scale-105 ${
                                selectedDate === date
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 shadow-sm'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300'
                              }`}
                            >
                              <span className="text-xs">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                              <span className="text-lg font-bold">{d.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Start Time</label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {TIME_SLOTS.slice(0, 12).map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedStart(slot)}
                          className={`py-2 rounded-lg text-xs font-semibold border transition-all hover:scale-105 ${
                            selectedStart === slot
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Duration</label>
                    <div className="flex gap-2">
                      {[1, 1.5, 2, 3].map(h => (
                        <button
                          key={h}
                          onClick={() => {
                            if (selectedStart) {
                              const endHour = parseInt(selectedStart) + h;
                              setSelectedEnd(String(endHour).padStart(2, '0') + ':00');
                            }
                          }}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                        >
                          {h}hr
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className={`transition-all duration-500 overflow-hidden ${selectedDate && selectedStart ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {selectedDate && selectedStart && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>₹{court.price_per_hour} × {Math.max(hours, 1)} hour(s)</span>
                          <span>₹{totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Platform fee</span>
                          <span>₹{Math.round(totalPrice * 0.05)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                          <span>Total</span>
                          <span>₹{totalPrice + Math.round(totalPrice * 0.05)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={!selectedDate || !selectedStart}
                    className="btn-premium w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
                  >
                    <Clock size={18} />
                    {selectedDate && selectedStart ? 'Confirm Booking' : 'Select Date & Time'}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Free cancellation up to 24 hours before
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
