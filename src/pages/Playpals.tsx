import { useState } from 'react';
import { MessageCircle, MapPin, Calendar, Clock, Filter, Plus, Star } from 'lucide-react';
import { MOCK_PLAYPALS, SPORTS } from '../lib/mockData';
import { useApp } from '../context/AppContext';

const SKILL_COLORS = {
  beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  intermediate: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  advanced: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
};

export default function Playpals() {
  const { navigate, user } = useApp();
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = MOCK_PLAYPALS.filter(p => {
    if (selectedSport && p.sport !== selectedSport) return false;
    if (selectedSkill && p.skill_level !== selectedSkill) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-emerald-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Find Playpals</h1>
              <p className="text-gray-400 mt-1">Connect with players near you. Find your perfect match.</p>
            </div>
            <button
              onClick={() => user ? setShowForm(true) : navigate('login')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> Post a Match
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
              <Filter size={14} className="text-gray-400" />
              <select value={selectedSport} onChange={e => setSelectedSport(e.target.value)} className="bg-transparent text-white text-sm outline-none">
                <option value="" className="text-gray-900">All Sports</option>
                {SPORTS.map(s => <option key={s.id} value={s.name} className="text-gray-900">{s.name}</option>)}
              </select>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
              <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className="bg-transparent text-white text-sm outline-none">
                <option value="" className="text-gray-900">All Levels</option>
                <option value="beginner" className="text-gray-900">Beginner</option>
                <option value="intermediate" className="text-gray-900">Intermediate</option>
                <option value="advanced" className="text-gray-900">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5">Post a Match</h2>
              <form onSubmit={e => { e.preventDefault(); setShowForm(false); }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Sport</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm">
                    {SPORTS.map(s => <option key={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Skill Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                      <button key={level} type="button" className="py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium capitalize hover:border-green-400 transition-colors text-gray-700 dark:text-gray-300">{level}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Time</label>
                    <input type="time" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea rows={3} placeholder="Tell others what you're looking for..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">Post Match</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">{filtered.length} Players Looking to Play</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(pal => (
            <div key={pal.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <div className="flex items-start gap-3 mb-4">
                <img src={pal.avatar} alt={pal.player_name} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{pal.player_name}</div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${SKILL_COLORS[pal.skill_level as keyof typeof SKILL_COLORS]}`}>
                    {pal.skill_level}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-semibold">{pal.sport}</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{pal.description}</p>

              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-green-500" />
                  {pal.city} • {pal.area}
                </div>
                {pal.play_date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-green-500" />
                    {new Date(pal.play_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    <Clock size={12} className="text-green-500 ml-1" />
                    {pal.play_time}
                  </div>
                )}
              </div>

              <button
                onClick={() => user ? undefined : navigate('login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={15} /> Send Request
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
