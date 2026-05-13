import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, Youtube, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';

export default function Footer() {
  const { navigate } = useApp();

  return (
    <footer className="bg-gray-950 text-gray-400 relative overflow-hidden">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/3 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo size="md" onClick={() => navigate('home')} className="[&_span]:!text-white mb-4" />
            <p className="text-sm leading-relaxed mb-6 max-w-xs text-gray-500">
              Maharashtra's premier sports court booking platform. Discover, book, and play at top venues across the state.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 group">
                <MapPin size={14} className="text-green-500 flex-shrink-0 group-hover:text-green-400 transition-colors" />
                <span className="group-hover:text-gray-300 transition-colors">Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2 group">
                <Phone size={14} className="text-green-500 flex-shrink-0 group-hover:text-green-400 transition-colors" />
                <span className="group-hover:text-gray-300 transition-colors">+91 90000 12345</span>
              </div>
              <div className="flex items-center gap-2 group">
                <Mail size={14} className="text-green-500 flex-shrink-0 group-hover:text-green-400 transition-colors" />
                <span className="group-hover:text-gray-300 transition-colors">hello@book2play.in</span>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Explore</h4>
            <ul className="space-y-3 text-sm">
              {['Courts', 'Tournaments', 'Playpals', 'How It Works'].map(item => (
                <li key={item}>
                  <button onClick={() => navigate(item.toLowerCase().replace(' ', '-'))} className="hover:text-green-400 transition-colors hover:translate-x-1 inline-block duration-200">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">For Owners</h4>
            <ul className="space-y-3 text-sm">
              {['List Your Court', 'Owner Dashboard', 'Revenue Analytics', 'Verification'].map(item => (
                <li key={item}>
                  <button onClick={() => navigate('owner-portal')} className="hover:text-green-400 transition-colors hover:translate-x-1 inline-block duration-200">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Sports</h4>
            <ul className="space-y-3 text-sm">
              {['Badminton', 'Football', 'Tennis', 'Basketball', 'Volleyball', 'Box Cricket'].map(sport => (
                <li key={sport}>
                  <button onClick={() => navigate('courts')} className="hover:text-green-400 transition-colors hover:translate-x-1 inline-block duration-200">
                    {sport}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            © 2026 Book2Play. All rights reserved. Made with <Zap size={12} className="inline text-green-400" /> in Maharashtra.
          </div>
          <div className="flex items-center gap-3">
            {[
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Twitter, label: 'Twitter' },
              { Icon: Facebook, label: 'Facebook' },
              { Icon: Youtube, label: 'YouTube' },
            ].map(({ Icon, label }, i) => (
              <a
                key={i}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-gray-800/80 flex items-center justify-center hover:bg-green-500 transition-all duration-300 text-gray-500 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-green-500/25"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
