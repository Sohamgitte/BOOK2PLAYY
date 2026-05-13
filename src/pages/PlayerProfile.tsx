import { useState } from 'react';
import { User, Wallet, Heart, Bell, Settings, Star, MapPin, Phone, Mail, CreditCard as Edit3, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_COURTS, MOCK_BOOKINGS } from '../lib/mockData';

export default function PlayerProfile() {
  const { user, profile, navigate } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const recentBookings = MOCK_BOOKINGS.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-36 relative" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 pb-12">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="relative -mt-16 sm:-mt-20">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-3xl shadow-xl border-4 border-white dark:border-gray-800">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">{profile?.full_name || user?.email?.split('@')[0] || 'Player'}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="capitalize px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">{profile?.role || 'player'}</span>
                    <div className="flex items-center gap-1"><MapPin size={12} />{profile?.city || 'Mumbai'}</div>
                    <div className="flex items-center gap-1"><Star size={12} className="text-yellow-400" /> 4.8 Player Rating</div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:border-green-400 transition-colors">
                  <Edit3 size={14} /> Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            {[
              { label: 'Bookings', value: MOCK_BOOKINGS.length },
              { label: 'Sports', value: '4' },
              { label: 'Playpals', value: '12' },
              { label: 'Wallet', value: `₹${profile?.wallet_balance?.toLocaleString() || '2,500'}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Recent Bookings */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
                  <button onClick={() => navigate('booking-history')} className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {recentBookings.map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                      <img src={b.cover_image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.court_name}</div>
                        <div className="text-xs text-gray-400">{b.booking_date} • {b.start_time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">₹{b.total_amount}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          b.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {[
                    { icon: Mail, label: 'Email', value: user?.email || 'player@example.com' },
                    { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                    { icon: MapPin, label: 'City', value: profile?.city || 'Mumbai' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">{label}</div>
                        <div className="text-gray-900 dark:text-white font-medium">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Wallet Preview */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-semibold"><Wallet size={18} />Wallet Balance</div>
                  <button onClick={() => setActiveTab('wallet')} className="text-white/70 text-xs hover:text-white">Add Money</button>
                </div>
                <div className="text-4xl font-black mb-2">₹2,500</div>
                <div className="text-white/70 text-sm">Available for booking</div>
              </div>

              {/* Favorite Sports */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Favorite Sports</h3>
                <div className="flex flex-wrap gap-2">
                  {['🏸 Badminton', '⚽ Football', '🏀 Basketball'].map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2 text-white/80"><Wallet size={18} />Book2Play Wallet</div>
              <div className="text-5xl font-black mb-1">₹2,500</div>
              <div className="text-white/70 text-sm mb-6">Available Balance</div>
              <div className="flex gap-3">
                {['Add ₹500', 'Add ₹1000', 'Add ₹2000'].map(amt => (
                  <button key={amt} className="flex-1 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors">{amt}</button>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Transaction History</h3>
              <div className="space-y-3">
                {[
                  { type: 'credit', label: 'Wallet Top-up', amount: '+₹1000', date: 'May 10', color: 'text-green-600' },
                  { type: 'debit', label: 'Smash Zone Booking', amount: '-₹800', date: 'May 10', color: 'text-red-500' },
                  { type: 'credit', label: 'Refund - Cancelled', amount: '+₹600', date: 'Apr 28', color: 'text-green-600' },
                  { type: 'debit', label: 'GreenField Football', amount: '-₹1200', date: 'Apr 15', color: 'text-red-500' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{t.label}</div>
                      <div className="text-xs text-gray-400">{t.date}</div>
                    </div>
                    <span className={`font-bold ${t.color}`}>{t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_COURTS.slice(0, 3).map(court => (
              <div key={court.id} onClick={() => navigate('court-details', { courtId: court.id })} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group">
                <div className="relative h-36 overflow-hidden">
                  <img src={court.cover_image} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <Heart size={14} fill="currentColor" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">{court.name}</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{court.area} • ₹{court.price_per_hour}/hr</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-lg space-y-4">
            {[
              { label: 'Push Notifications', desc: 'Booking confirmations and reminders' },
              { label: 'Email Notifications', desc: 'Offers, tournaments, and updates' },
              { label: 'Location Access', desc: 'Show nearby courts automatically' },
              { label: 'Dark Mode', desc: 'Switch to dark theme' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full relative transition-colors">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm transition-transform" />
                </button>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4">
              Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
