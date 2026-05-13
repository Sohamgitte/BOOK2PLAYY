import { useState } from 'react';
import { Shield, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, XCircle, BarChart3, Flag, Settings, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_COURTS, MOCK_BOOKINGS } from '../lib/mockData';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'courts', label: 'Courts', icon: Calendar },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: Flag },
];

const MOCK_USERS = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'player', city: 'Mumbai', bookings: 12, joined: '2026-01-15', active: true },
  { id: 'u2', name: 'Priya Desai', email: 'priya@example.com', role: 'player', city: 'Pune', bookings: 7, joined: '2026-02-20', active: true },
  { id: 'u3', name: 'Vikram Nair', email: 'vikram@example.com', role: 'owner', city: 'Thane', bookings: 0, joined: '2026-01-10', active: true },
  { id: 'u4', name: 'Anjali Mehta', email: 'anjali@example.com', role: 'player', city: 'Nagpur', bookings: 3, joined: '2026-03-05', active: false },
];

export default function AdminPanel() {
  const { navigate, user, profile } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 flex items-center justify-center">
        <div className="text-center px-4">
          <Shield size={60} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Admin Access Only</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You need admin privileges to access this panel.</p>
          <button onClick={() => navigate('home')} className="px-6 py-3 rounded-xl bg-green-500 text-white font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  const pendingCourts = MOCK_COURTS.filter(c => !c.is_verified).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wider">
              <Shield size={14} /> Super Admin Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Platform Control</h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">3 Pending Reviews</span>
          </div>
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
                { label: 'Total Users', value: '4,821', change: '+124 this month', icon: Users, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                { label: 'Total Courts', value: '218', change: '+12 pending', icon: Calendar, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
                { label: 'Total Bookings', value: '15,430', change: '+840 this week', icon: Calendar, color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
                { label: 'Revenue (Month)', value: '₹8.4L', change: '+18% vs last', icon: TrendingUp, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
              ].map(({ label, value, change, icon: Icon, color }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{change}</div>
                </div>
              ))}
            </div>

            {/* Pending Court Approvals */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-500" /> Pending Approvals
                </h2>
                <button onClick={() => setActiveTab('courts')} className="text-green-600 dark:text-green-400 text-sm font-medium">View All</button>
              </div>
              {pendingCourts.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No pending approvals</p>
              ) : (
                <div className="space-y-3">
                  {pendingCourts.map(court => (
                    <div key={court.id} className="flex items-center gap-4 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800">
                      <img src={court.cover_image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{court.name}</div>
                        <div className="text-xs text-gray-400">{court.sport} • {court.city}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:opacity-90 transition-opacity">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:opacity-90 transition-opacity">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Platform Activity</h2>
              <div className="space-y-3">
                {[
                  { icon: '🆕', text: 'New court "Ace Tennis Club" registered', time: '2 hours ago', color: 'bg-blue-50 dark:bg-blue-900/20' },
                  { icon: '🚨', text: 'Fraud booking report for Court ID #B4', time: '4 hours ago', color: 'bg-red-50 dark:bg-red-900/20' },
                  { icon: '✅', text: 'Court "Slam Dunk Arena" verified', time: '6 hours ago', color: 'bg-green-50 dark:bg-green-900/20' },
                  { icon: '💰', text: 'Payout processed: ₹12,400 to 8 owners', time: '1 day ago', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { icon: '👤', text: 'User account suspended: spam reports', time: '2 days ago', color: 'bg-orange-50 dark:bg-orange-900/20' },
                ].map(({ icon, text, time, color }, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${color}`}>
                    <span className="text-lg">{icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Name', 'Email', 'Role', 'City', 'Bookings', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {MOCK_USERS.filter(u => !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">{u.name[0]}</div>
                          <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          u.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{u.city}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{u.bookings}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{new Date(u.joined).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
                          {u.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <button className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold hover:bg-blue-100">View</button>
                          <button className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            u.active ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100' : 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'
                          }`}>
                            {u.active ? 'Suspend' : 'Restore'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'courts' && (
          <div className="space-y-4">
            {MOCK_COURTS.map(court => (
              <div key={court.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-4">
                  <img src={court.cover_image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white">{court.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${court.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {court.is_verified ? 'Verified' : 'Pending'}
                      </span>
                      {court.is_featured && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Featured</span>}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{court.sport} • {court.area}, {court.city} • ₹{court.price_per_hour}/hr</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!court.is_verified && (
                      <button className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Approve
                      </button>
                    )}
                    <button className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold">
                      {court.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-semibold">Suspend</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">All Platform Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Booking ID', 'Court', 'Date', 'Amount', 'Payment', 'Status'].map(h => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {MOCK_BOOKINGS.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-gray-500 dark:text-gray-400">{b.id.toUpperCase()}</td>
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{b.court_name}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{b.booking_date}</td>
                      <td className="py-3 pr-4 font-bold text-gray-900 dark:text-white">₹{b.total_amount}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.payment_status === 'paid' ? 'bg-green-100 text-green-700' : b.payment_status === 'refunded' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'completed' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Fraud Reports', value: '2', desc: 'Needs review', color: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800', textColor: 'text-red-600' },
                { label: 'Fake Bookings', value: '5', desc: 'Detected this month', color: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800', textColor: 'text-orange-600' },
                { label: 'User Complaints', value: '8', desc: 'Pending resolution', color: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-600' },
              ].map(({ label, value, desc, color, textColor }) => (
                <div key={label} className={`p-5 rounded-2xl border ${color}`}>
                  <AlertTriangle size={20} className={`${textColor} mb-3`} />
                  <div className={`text-3xl font-black ${textColor}`}>{value}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Activity Logs</h3>
              <div className="space-y-2 font-mono text-xs text-gray-500 dark:text-gray-400">
                {[
                  '[2026-05-12 09:14:22] BOOKING CREATED - Player p001 booked Court c003 for ₹800',
                  '[2026-05-12 08:55:10] COURT APPROVAL - Admin approved Court "Slam Dunk Arena"',
                  '[2026-05-12 07:30:44] USER SUSPEND - User u004 suspended due to spam reports',
                  '[2026-05-11 22:14:55] PAYMENT PROCESSED - ₹12,400 payout to 8 court owners',
                  '[2026-05-11 18:02:30] FRAUD FLAGGED - Booking B007 flagged for suspicious activity',
                ].map((log, i) => (
                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
