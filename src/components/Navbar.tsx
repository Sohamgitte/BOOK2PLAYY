import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Moon, Sun, MapPin, User, Bell, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CITIES } from '../lib/mockData';
import Logo from './Logo';

export default function Navbar() {
  const { darkMode, toggleDarkMode, navigate, currentPage, user, profile, signOut } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setCityOpen(false); setProfileOpen(false); };
    if (cityOpen || profileOpen) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [cityOpen, profileOpen]);

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Courts', page: 'courts' },
    { label: 'Tournaments', page: 'tournaments' },
    { label: 'Playpals', page: 'playpals' },
    { label: 'How It Works', page: 'how-it-works' },
  ];

  const isTransparent = !scrolled && !darkMode;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/80 dark:bg-gray-900/80 glass-strong shadow-lg shadow-black/5 dark:shadow-black/20'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="sm" onClick={() => navigate('home')} className={isTransparent ? '[&_span]:text-white' : ''} />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`nav-link px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === link.page
                    ? 'text-green-600 dark:text-green-400 active'
                    : isTransparent ? 'text-white/80 hover:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">
            {/* City Selector */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setCityOpen(!cityOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 ${
                  isTransparent ? 'text-white/80' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <MapPin size={14} />
                {selectedCity}
                <ChevronDown size={14} className={`transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`} />
              </button>
              {cityOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-scale-in">
                  {CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedCity === city ? 'text-green-600 font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all hover:bg-white/10 ${
                isTransparent ? 'text-white/80' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="relative flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => navigate('notifications')}
                  className={`p-2 rounded-lg transition-all hover:bg-white/10 relative ${
                    isTransparent ? 'text-white/80' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Bell size={18} />
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </button>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="btn-premium flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold"
                >
                  <User size={16} />
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </button>
                {profileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-scale-in">
                    <button onClick={() => { navigate('player-profile'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">My Profile</button>
                    <button onClick={() => { navigate('booking-history'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">Booking History</button>
                    {profile?.role === 'owner' && <button onClick={() => { navigate('owner-portal'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">Owner Portal</button>}
                    {profile?.role === 'admin' && <button onClick={() => { navigate('admin-panel'); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors">Admin Panel</button>}
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button onClick={() => { signOut(); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('owner-portal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/10 ${
                    isTransparent ? 'text-white/80' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Owner Portal
                </button>
                <button
                  onClick={() => navigate('login')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    isTransparent
                      ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50'
                      : 'border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('signup')}
                  className="btn-premium px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button onClick={toggleDarkMode} className={`p-2 rounded-lg ${isTransparent ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-lg transition-transform duration-200 ${isTransparent ? 'text-white' : 'text-gray-700 dark:text-gray-300'} ${menuOpen ? 'rotate-90' : ''}`}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-out ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="bg-white/95 dark:bg-gray-900/95 glass-strong border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => { navigate(link.page); setMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === link.page ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => { navigate('owner-portal'); setMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Owner Portal</button>
          <div className="flex gap-2 pt-2">
            {user ? (
              <>
                <button onClick={() => { navigate('player-profile'); setMenuOpen(false); }} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-green-500 text-green-600">My Profile</button>
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-500">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('login'); setMenuOpen(false); }} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-green-500 text-green-600">Login</button>
                <button onClick={() => { navigate('signup'); setMenuOpen(false); }} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white">Sign Up</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
