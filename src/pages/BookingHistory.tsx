import { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_BOOKINGS } from '../lib/mockData';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400', icon: XCircle },
};

export default function BookingHistory() {
  const { navigate } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Booking History</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track all your court bookings</p>
          </div>
          <button
            onClick={() => navigate('courts')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Book Court <ArrowRight size={15} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'confirmed', 'completed', 'pending', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s === 'all' && <span className="ml-1.5 bg-white/20 rounded-full px-1.5 text-xs">{MOCK_BOOKINGS.length}</span>}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: MOCK_BOOKINGS.length, color: 'text-gray-900 dark:text-white' },
            { label: 'Completed', value: MOCK_BOOKINGS.filter(b => b.status === 'completed').length, color: 'text-green-600' },
            { label: 'Upcoming', value: MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length, color: 'text-blue-600' },
            { label: 'Total Spent', value: `₹${MOCK_BOOKINGS.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total_amount, 0).toLocaleString()}`, color: 'text-gray-900 dark:text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
              <div className={`text-2xl font-black ${color} mb-1`}>{value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
              <button onClick={() => navigate('courts')} className="mt-4 px-6 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm">Book a Court</button>
            </div>
          ) : (
            filtered.map(booking => {
              const status = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = status.icon;
              return (
                <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <img src={booking.cover_image} alt="" className="w-full sm:w-36 h-36 sm:h-auto object-cover flex-shrink-0" />
                    <div className="p-5 flex-1 flex flex-col sm:flex-row gap-4 justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">{booking.court_name}</h3>
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-green-500" />
                            {new Date(booking.booking_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-green-500" />
                            {booking.start_time} – {booking.end_time}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium">{booking.sport}</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            booking.payment_status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            booking.payment_status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between sm:items-end gap-3">
                        <div>
                          <div className="text-2xl font-black text-gray-900 dark:text-white">₹{booking.total_amount}</div>
                          <div className="text-xs text-gray-400">Booking #{booking.id.toUpperCase()}</div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          {booking.status === 'confirmed' && (
                            <button className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors">
                              Cancel
                            </button>
                          )}
                          {booking.status === 'completed' && (
                            <button onClick={() => navigate('court-details', { courtId: '1' })} className="px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 text-xs font-semibold hover:bg-yellow-100 transition-colors">
                              Write Review
                            </button>
                          )}
                          <button onClick={() => navigate('court-details', { courtId: '1' })} className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-semibold hover:bg-green-100 transition-colors">
                            Book Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
