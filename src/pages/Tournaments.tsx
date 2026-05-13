import { useState } from 'react';
import { Trophy, Calendar, Users, MapPin, IndianRupee, ArrowRight, Clock } from 'lucide-react';
import { MOCK_TOURNAMENTS, SPORTS } from '../lib/mockData';
import { useApp } from '../context/AppContext';

export default function Tournaments() {
  const { navigate, user } = useApp();
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filtered = MOCK_TOURNAMENTS.filter(t => {
    if (selectedSport && t.sport !== selectedSport) return false;
    if (selectedStatus && t.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-950 to-emerald-950 py-14 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-emerald-400/10 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-green-400 text-sm font-semibold mb-3">
            <Trophy size={16} />
            Compete & Win
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-3">Tournaments</h1>
          <p className="text-gray-400 max-w-xl text-lg">
            Join competitive tournaments across Maharashtra. Register your team and battle for glory.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8">
            {[
              { value: '24', label: 'Active Tournaments' },
              { value: '₹10L+', label: 'Total Prize Pool' },
              { value: '500+', label: 'Teams Registered' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select value={selectedSport} onChange={e => setSelectedSport(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:border-green-500 text-sm transition-colors">
            <option value="">All Sports</option>
            {SPORTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none focus:border-green-500 text-sm transition-colors">
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map(t => (
            <div key={t.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="relative h-52 overflow-hidden">
                <img src={t.cover_image} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold uppercase">{t.status}</span>
                  <span className="px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold backdrop-blur-sm">{t.sport}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-black text-lg leading-tight">{t.name}</h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{t.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <MapPin size={13} className="text-green-500" />
                      {t.city}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Users size={13} className="text-green-500" />
                      {t.max_teams} teams max
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Calendar size={13} className="text-green-500" />
                      {new Date(t.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(t.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl mb-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Prize Pool</div>
                    <div className="font-black text-green-600 dark:text-green-400">₹{t.prize_pool.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Entry Fee</div>
                    <div className="font-bold text-gray-900 dark:text-white">₹{t.registration_fee}/team</div>
                  </div>
                </div>

                <button
                  onClick={() => user ? undefined : navigate('login')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition-opacity"
                >
                  Register Team <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Host Tournament CTA */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
          <Trophy size={40} className="mx-auto mb-4 text-yellow-300" />
          <h2 className="text-2xl font-black mb-2">Want to Host a Tournament?</h2>
          <p className="text-white/80 max-w-md mx-auto mb-6">
            Register as a court owner and create tournaments. Attract players, build community, and earn more.
          </p>
          <button onClick={() => navigate('owner-portal')} className="px-8 py-3 rounded-xl bg-white text-green-600 font-bold hover:bg-gray-50 transition-colors">
            Become a Host
          </button>
        </div>
      </div>
    </div>
  );
}
