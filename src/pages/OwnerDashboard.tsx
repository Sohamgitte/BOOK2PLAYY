import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CourtStats {
  courtId: string;
  courtName: string;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  occupancyRate: number;
}

interface BookingRequest {
  id: string;
  courtId: string;
  slotDate: string;
  startTime: string;
  playerName: string;
  status: string;
}

export default function OwnerDashboard() {
  const [courts, setCourts] = useState<any[]>([]);
  const [stats, setStats] = useState<CourtStats[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchOwnerData();
  }, []);

  useEffect(() => {
    if (selectedCourt) {
      fetchCourtStats();
    }
  }, [selectedCourt, period]);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: courtsData } = await supabase
        .from('courts')
        .select('*')
        .eq('owner_id', user.id);

      if (courtsData && courtsData.length > 0) {
        setCourts(courtsData);
        setSelectedCourt(courtsData[0].id);
      }

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          status,
          court_id,
          total_amount
        `)
        .in('court_id', courtsData?.map((c: any) => c.id) || [])
        .order('booking_date', { ascending: false })
        .limit(10);

      setBookings(bookingsData as any);
    } catch (err) {
      console.error('Failed to fetch owner data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourtStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/slot_availability/stats?courtId=${selectedCourt}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const result = await response.json();
      setStats([result.stats]);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const currentStats = stats[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Owner Dashboard</h1>
          <p className="text-slate-400">Manage your courts and track revenue</p>
        </div>

        <div className="mb-6 flex gap-4">
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2 ml-auto">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                  period === p
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {currentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-400">₹{currentStats.totalRevenue}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400 opacity-30" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-blue-400">{currentStats.totalBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400 opacity-30" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-yellow-400">{currentStats.occupancyRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-400 opacity-30" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Rating</p>
                  <p className="text-3xl font-bold text-purple-400">{currentStats.averageRating}</p>
                  <p className="text-xs text-slate-400 mt-1">({currentStats.reviewCount} reviews)</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400 opacity-30" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Recent Bookings
                </h2>
              </div>

              <div className="divide-y divide-slate-700">
                {bookings.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No recent bookings
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{new Date(booking.booking_date).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-400">{booking.start_time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">₹{booking.total_amount}</p>
                          <div className={`text-xs font-medium inline-block px-2 py-1 rounded mt-2 ${
                            booking.status === 'confirmed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : booking.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {booking.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Quick Stats
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Confirmed</span>
                  <span className="font-bold text-white">{currentStats?.confirmedBookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span className="font-bold text-green-400">{currentStats?.completedBookings || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cancelled</span>
                  <span className="font-bold text-red-400">{currentStats?.cancelledBookings || 0}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                  View Analytics
                </button>
              </div>
            </div>

            <div className="mt-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="font-bold text-white mb-4">Pricing Rules</h3>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-all">
                Manage Peak Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
