import { useState } from 'react';
import { CreditCard, Smartphone, Building, CheckCircle, ArrowLeft, Shield, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_COURTS } from '../lib/mockData';

export default function Payment() {
  const { navigate, pageParams } = useApp();
  const { courtId, date, startTime } = pageParams;
  const court = MOCK_COURTS.find(c => c.id === courtId) || MOCK_COURTS[0];
  const [payMethod, setPayMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = court.price_per_hour;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => navigate('booking-history'), 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
              <CheckCircle size={48} className="text-white" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Booking Confirmed!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Your slot at <strong>{court.name}</strong> has been successfully booked.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 max-w-sm mx-auto mb-8 border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Court</span>
                <span className="font-semibold text-gray-900 dark:text-white">{court.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-900 dark:text-white">{date || 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">{startTime || '07:00'}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-black text-green-600">₹{total}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400">Redirecting to bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate('court-details', { courtId })} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft size={18} /> Back to Court Details
        </button>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay via UPI ID or QR' },
                  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', label: 'Net Banking', icon: Building, desc: 'All major banks supported' },
                ].map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setPayMethod(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      payMethod === id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payMethod === id ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{label}</div>
                      <div className="text-xs text-gray-400">{desc}</div>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === id ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                      {payMethod === id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            {payMethod === 'upi' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">UPI Payment</h3>
                <div className="flex gap-4 mb-4">
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <div className="text-center text-xs text-gray-400">
                      <div className="text-3xl mb-1">📱</div>
                      QR Code
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Scan QR or enter UPI ID</p>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@paytm"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors text-sm"
                    />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                        <span key={app} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">{app}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {payMethod === 'card' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Card Details</h3>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">CVV</label>
                    <input type="password" placeholder="•••" maxLength={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Cardholder Name</label>
                  <input type="text" placeholder="Name on card" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition-colors text-sm" />
                </div>
              </div>
            )}

            {payMethod === 'netbanking' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Select Bank</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                    <button key={bank} className="py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <Shield size={18} className="text-green-500 flex-shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your payment is secured by 256-bit SSL encryption. We never store card details.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-20">
              <img src={court.cover_image} alt="" className="w-full h-36 object-cover" />
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{court.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{court.sport} • {court.area}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock size={14} className="text-green-500" />
                    {date || 'Today'} at {startTime || '07:00'}
                  </div>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Court fee (1 hr)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Platform fee (5%)</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 dark:text-white text-base border-t border-gray-100 dark:border-gray-700 pt-3">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${total}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
