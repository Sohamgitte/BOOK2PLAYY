import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, Users, AlertCircle, CheckCircle2, Loader2, Lock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SlotAvailability {
  time: string;
  available: boolean;
  booked: boolean;
  locked: boolean;
  queueWaiting: number;
}

interface DayAvailability {
  date: string;
  slots: SlotAvailability[];
}

export default function BookingFlow() {
  const navigate = useNavigate();
  const { courtId } = useParams();
  const [step, setStep] = useState<'date-time' | 'details' | 'payment'>('date-time');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({});
  const [court, setCourt] = useState<any>(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  useEffect(() => {
    fetchCourtAndAvailability();
  }, [courtId]);

  useEffect(() => {
    calculatePrice();
  }, [selectedTime, duration, court]);

  const fetchCourtAndAvailability = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('courts')
        .select('*')
        .eq('id', courtId)
        .maybeSingle();

      if (data) setCourt(data);

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/slot_availability/get`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            courtId,
            startDate,
            endDate,
          }),
        }
      );

      const result = await response.json();
      setAvailability(result.availability);
    } catch (err) {
      setError('Failed to load availability');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (court && selectedTime) {
      setEstimatedPrice(court.price_per_hour * duration);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select date and time');
      return;
    }

    try {
      setLoading(true);
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const lockResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking_engine/lock-slot`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            courtId,
            slotDate: selectedDate,
            startTime: selectedTime,
            endTime: getEndTime(selectedTime, duration),
            transactionId,
          }),
        }
      );

      const lockData = await lockResponse.json();
      if (!lockResponse.ok) {
        throw new Error(lockData.error);
      }

      sessionStorage.setItem('bookingData', JSON.stringify({
        courtId,
        slotDate: selectedDate,
        startTime: selectedTime,
        endTime: getEndTime(selectedTime, duration),
        transactionId,
        lockId: lockData.lockId,
        basePrice: lockData.basePrice,
        peakPrice: lockData.peakPrice,
      }));

      setStep('payment');
      setSuccess('Slot locked! Proceeding to payment...');
    } catch (err: any) {
      setError(err.message || 'Failed to lock slot');
    } finally {
      setLoading(false);
    }
  };

  const getEndTime = (start: string, hrs: number) => {
    const [h, m] = start.split(':').map(Number);
    const endHour = (h + hrs) % 24;
    return `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const getNextDates = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book {court?.name}</h1>
          <p className="text-slate-400">Complete your booking in 3 easy steps</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          {(['date-time', 'details', 'payment'] as const).map((s, i) => (
            <div
              key={s}
              className={`p-4 rounded-lg border-2 transition-all ${
                s === step
                  ? 'border-green-400 bg-green-400/10'
                  : 'border-slate-700 bg-slate-800'
              }`}
            >
              <div className="font-semibold text-white">Step {i + 1}</div>
              <div className="text-sm text-slate-400 capitalize">{s.replace('-', ' ')}</div>
            </div>
          ))}
        </div>

        {step === 'date-time' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                Select Date
              </h2>
              <div className="grid grid-cols-7 gap-2">
                {getNextDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedDate === date
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {new Date(date).getDate()}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  Select Time & Duration
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Duration (hours)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((h) => (
                      <button
                        key={h}
                        onClick={() => setDuration(h)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          duration === h
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Available Times
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {availability[selectedDate]?.slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                          selectedTime === slot.time
                            ? 'bg-green-500 text-white'
                            : slot.available
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer'
                            : 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {slot.time}
                        {slot.locked && <Lock className="w-3 h-3" />}
                        {slot.queueWaiting > 0 && (
                          <span className="text-xs">{slot.queueWaiting} waiting</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTime && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-slate-400">Estimated Price</p>
                    <p className="text-3xl font-bold text-green-400">₹{estimatedPrice}</p>
                  </div>
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-sm text-slate-300">
                  {selectedDate} • {selectedTime} • {duration}h
                </p>
              </div>
            )}

            <button
              onClick={handleProceedToPayment}
              disabled={!selectedTime || loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {loading ? 'Locking slot...' : 'Proceed to Payment'}
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Secure Payment</h2>
            <p className="text-slate-400 mb-6">
              Redirecting to payment gateway... Your slot is reserved for 5 minutes.
            </p>
            <div className="animate-pulse flex gap-2 justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
