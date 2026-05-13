import { useState } from 'react';
import { TrendingUp, Calendar, Star, Plus, ChevronRight, CheckCircle, Clock, Upload, BarChart3, Users, IndianRupee, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_BOOKINGS, MOCK_COURTS } from '../lib/mockData';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'courts', label: 'My Courts', icon: Calendar },
  { id: 'bookings', label: 'Bookings', icon: Clock },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'add-court', label: 'Add Court', icon: Plus },
];

export default function OwnerPortal() {
  const { navigate, user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  const ownerCourts = MOCK_COURTS.slice(0, 2);
  const totalEarnings = 48250;
  const monthEarnings = 12400;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🏟️</div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Owner Portal</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">List your courts, manage bookings, and grow your revenue with Book2Play.</p>
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            {['Zero Setup Fee', 'Real-time Bookings', 'Instant Payouts', 'Analytics'].map(f => (
              <div key={f} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle size={14} className="text-green-500" />{f}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('signup')} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold">Register as Owner</button>
            <button onClick={() => navigate('login')} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold">Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Owner Portal</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your courts and bookings</p>
          </div>
          <button className="relative p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <Icon size={15} />{label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: IndianRupee, color: 'from-green-500 to-emerald-600', textColor: 'text-white' },
                { label: 'This Month', value: `₹${monthEarnings.toLocaleString()}`, icon: TrendingUp, color: 'from-blue-500 to-blue-600', textColor: 'text-white' },
                { label: 'Total Bookings', value: '142', icon: Calendar, color: 'from-orange-400 to-orange-500', textColor: 'text-white' },
                { label: 'Avg Rating', value: '4.7 ★', icon: Star, color: 'from-yellow-400 to-yellow-500', textColor: 'text-white' },
              ].map(({ label, value, icon: Icon, color, textColor }) => (
                <div key={label} className={`p-5 rounded-2xl bg-gradient-to-br ${color} text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon size={20} className="opacity-80" />
                    <span className="text-xs opacity-70 font-medium">All time</span>
                  </div>
                  <div className={`text-2xl font-black ${textColor}`}>{value}</div>
                  <div className="text-white/70 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white">Upcoming Bookings</h2>
                <button onClick={() => setActiveTab('bookings')} className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">View All <ChevronRight size={14} /></button>
              </div>
              <div className="space-y-3">
                {MOCK_BOOKINGS.filter(b => b.status === 'confirmed').map(b => (
                  <div key={b.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Calendar size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{b.court_name}</div>
                      <div className="text-xs text-gray-400">{b.booking_date} • {b.start_time} - {b.end_time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">₹{b.total_amount}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Courts */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white">My Courts</h2>
                <button onClick={() => setActiveTab('add-court')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  <Plus size={14} /> Add New
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownerCourts.map(court => (
                  <div key={court.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                    <img src={court.cover_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{court.name}</div>
                      <div className="text-xs text-gray-400">{court.sport} • {court.area}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${court.is_verified ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 text-yellow-700'}`}>
                          {court.is_verified ? '✓ Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add-court' && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">List Your Court</h2>
              <form className="space-y-5" onSubmit={e => { e.preventDefault(); setActiveTab('courts'); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Court Name *</label>
                    <input type="text" placeholder="e.g. Smash Zone Arena" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Sport *</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm transition-colors">
                      <option value="">Select Sport</option>
                      {['Badminton', 'Football', 'Tennis', 'Basketball', 'Volleyball', 'Table Tennis', 'Box Cricket', 'Pickleball'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Address *</label>
                  <input type="text" placeholder="Full address with landmark" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">City *</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm transition-colors">
                      {['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Nagpur'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Price per Hour (₹) *</label>
                    <input type="number" placeholder="500" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea rows={3} placeholder="Describe your court, facilities, and what makes it special..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 text-sm transition-colors resize-none" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Amenities</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Parking', 'Changing Rooms', 'Cafeteria', 'Equipment Rental', 'Coaching', 'AC', 'Floodlights', 'Shower', 'First Aid'].map(am => (
                      <label key={am} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-400 transition-colors">
                        <input type="checkbox" className="accent-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{am}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Court Photos</label>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                    <Upload size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop photos or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each. Min 3 photos required.</p>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-green-500/25">
                  Submit for Verification
                </button>
                <p className="text-center text-xs text-gray-400">Our team will review and verify your court within 24 hours</p>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">All Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Court', 'Player', 'Date', 'Time', 'Amount', 'Status', 'Action'].map(h => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {MOCK_BOOKINGS.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{b.court_name}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">Player #{b.id}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{b.booking_date}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{b.start_time}</td>
                      <td className="py-3 pr-4 font-bold text-gray-900 dark:text-white">₹{b.total_amount}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          b.status === 'completed' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                        }`}>{b.status}</span>
                      </td>
                      <td className="py-3">
                        {b.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">Accept</button>
                            <button className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-semibold">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Today', value: '₹2,400', change: '+12%', up: true },
                { label: 'This Week', value: '₹14,600', change: '+8%', up: true },
                { label: 'This Month', value: '₹48,250', change: '-3%', up: false },
              ].map(({ label, value, change, up }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
                  <div className={`text-sm font-semibold mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
                    {change} vs last period
                  </div>
                </div>
              ))}
            </div>

            {/* Peak Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Peak Booking Hours</h3>
              <div className="space-y-3">
                {[
                  { time: '6 AM - 8 AM', pct: 85, bookings: 42 },
                  { time: '7 PM - 9 PM', pct: 92, bookings: 58 },
                  { time: '5 PM - 7 PM', pct: 72, bookings: 36 },
                  { time: '9 AM - 11 AM', pct: 45, bookings: 22 },
                ].map(({ time, pct, bookings }) => (
                  <div key={time} className="flex items-center gap-4">
                    <div className="w-28 text-sm text-gray-600 dark:text-gray-400">{time}</div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-24 text-right text-sm text-gray-500 dark:text-gray-400">{bookings} bookings</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ownerCourts.map(court => (
              <div key={court.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  <img src={court.cover_image} alt={court.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${court.is_verified ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                      {court.is_verified ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">{court.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{court.sport} • {court.area} • ₹{court.price_per_hour}/hr</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 transition-colors">Edit</button>
                    <button className="flex-1 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 text-sm font-semibold hover:bg-green-100 transition-colors">Manage Slots</button>
                  </div>
                </div>
              </div>
            ))}
            <div onClick={() => setActiveTab('add-court')} className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center h-56 cursor-pointer hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500 transition-colors">
                  <Plus size={24} className="text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="font-semibold text-gray-700 dark:text-gray-300">Add New Court</div>
                <div className="text-xs text-gray-400 mt-1">List another venue</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
