import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, FileText, Download, Copy, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  court_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  base_price: number;
  peak_price: number;
  status: string;
  payment_status: string;
  checked_in_at?: string;
  completed_at?: string;
  cancellation_reason?: string;
}

export default function BookingHistoryNew() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [stats, setStats] = useState({ total: 0, spent: 0, cancelled: 0 });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

      if (error) throw error;

      const typedBookings = data as Booking[];
      setBookings(typedBookings);

      const total = typedBookings.length;
      const spent = typedBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const cancelled = typedBookings.filter(b => b.status === 'cancelled').length;

      setStats({ total, spent, cancelled });
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    return bookings.filter(b => {
      const bookingDateTime = new Date(`${b.booking_date} ${b.start_time}`);
      if (filter === 'upcoming') return bookingDateTime > now && b.status !== 'cancelled';
      if (filter === 'completed') return b.status === 'completed';
      if (filter === 'cancelled') return b.status === 'cancelled';
      return true;
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/10 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Booking History</h1>
          <p className="text-slate-400">Track all your court bookings and expenses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Bookings</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Spent</p>
                <p className="text-3xl font-bold text-green-400">₹{stats.spent.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Cancelled</p>
                <p className="text-3xl font-bold text-red-400">{stats.cancelled}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {getFilteredBookings().length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No bookings found</p>
            </div>
          ) : (
            getFilteredBookings().map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-green-500/30 transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-400">Date & Time</p>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-300 flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4" />
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Price</p>
                    <p className="text-white font-semibold">₹{booking.total_amount}</p>
                    {booking.base_price !== booking.peak_price && (
                      <p className="text-xs text-yellow-400 mt-1">
                        Peak pricing applied
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    {booking.status === 'completed' && booking.checked_in_at && (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Checked in</span>
                      </div>
                    )}
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-all">
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                  </div>
                </div>

                {booking.cancellation_reason && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Cancellation Reason
                    </p>
                    <p className="text-slate-300 text-sm mt-1">{booking.cancellation_reason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
