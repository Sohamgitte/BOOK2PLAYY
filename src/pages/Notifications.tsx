import { useState } from 'react';
import { Bell, CheckCheck, Trash2, IndianRupee, Calendar, AlertCircle, Tag, Info } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'booking', title: 'Booking Confirmed!', message: 'Your booking at Smash Zone Badminton for May 14 at 7:00 AM has been confirmed.', time: '2 hours ago', read: false },
  { id: 'n2', type: 'payment', title: 'Payment Successful', message: 'Payment of ₹800 received for Booking #B002 at GreenField Football.', time: '5 hours ago', read: false },
  { id: 'n3', type: 'promo', title: '20% Off This Weekend!', message: 'Book any court this Saturday or Sunday and get 20% off. Use code WEEKEND20.', time: '1 day ago', read: true },
  { id: 'n4', type: 'alert', title: 'Booking Cancelled', message: 'Your booking at Slam Dunk Arena on April 28 has been cancelled. Refund processing.', time: '2 days ago', read: true },
  { id: 'n5', type: 'info', title: 'New Court Near You', message: 'Pickle Palace has opened in Kalyani Nagar, Pune. Check it out and get a special early-bird discount!', time: '3 days ago', read: true },
  { id: 'n6', type: 'booking', title: 'Reminder: Upcoming Booking', message: 'Don\'t forget! You have a booking at Ace Tennis Club tomorrow at 8:00 AM.', time: '4 days ago', read: true },
  { id: 'n7', type: 'payment', title: 'Refund Processed', message: 'Your refund of ₹600 for Booking #B004 has been credited to your Book2Play wallet.', time: '5 days ago', read: true },
];

const TYPE_CONFIG = {
  booking: { icon: Calendar, color: 'bg-green-100 dark:bg-green-900/30 text-green-600', bg: 'border-l-4 border-green-500' },
  payment: { icon: IndianRupee, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', bg: 'border-l-4 border-emerald-500' },
  promo: { icon: Tag, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500', bg: 'border-l-4 border-orange-400' },
  alert: { icon: AlertCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-500', bg: 'border-l-4 border-red-500' },
  info: { icon: Info, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500', bg: 'border-l-4 border-blue-400' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => setNotifications(n => n.map(notif => ({ ...notif, read: true })));
  const deleteNotif = (id: string) => setNotifications(n => n.filter(notif => notif.id !== id));
  const markRead = (id: string) => setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'booking') return n.type === 'booking';
    if (filter === 'payment') return n.type === 'payment';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Bell size={20} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-semibold hover:underline">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'booking', label: 'Bookings' },
            { id: 'payment', label: 'Payments' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Bell size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notifications here</p>
            </div>
          ) : (
            filtered.map(notif => {
              const config = TYPE_CONFIG[notif.type as keyof typeof TYPE_CONFIG];
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl ${config.bg} overflow-hidden transition-all hover:shadow-md ${
                    !notif.read ? 'ring-1 ring-green-200 dark:ring-green-800' : ''
                  }`}
                >
                  <div className="p-4 flex gap-4" onClick={() => markRead(notif.id)}>
                    <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {notif.title}
                          </h3>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                          className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                      <div className="text-xs text-gray-400 mt-1.5">{notif.time}</div>
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
