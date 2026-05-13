interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size = 'md', className = '', onClick }: LogoProps) {
  const sizes = { sm: { container: 'w-7 h-7', text: 'text-lg', badge: 'text-[8px]' }, md: { container: 'w-9 h-9', text: 'text-xl', badge: 'text-[9px]' }, lg: { container: 'w-12 h-12', text: 'text-3xl', badge: 'text-[10px]' } };
  const s = sizes[size];

  return (
    <button onClick={onClick} className={`flex items-center gap-2.5 group ${className}`}>
      {/* Icon Mark */}
      <div className="relative">
        <div className={`${s.container} rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50 transition-all duration-300 group-hover:scale-105`}>
          <svg viewBox="0 0 32 32" className="w-full h-full p-1.5" fill="none">
            {/* Court outline */}
            <rect x="3" y="8" width="26" height="16" rx="3" stroke="white" strokeWidth="1.5" fill="none" opacity="0.9" />
            {/* Center line */}
            <line x1="16" y1="8" x2="16" y2="24" stroke="white" strokeWidth="1" opacity="0.6" />
            {/* Net */}
            <line x1="4" y1="16" x2="28" y2="16" stroke="white" strokeWidth="1.5" opacity="0.8" />
            {/* Shuttlecock / ball dot */}
            <circle cx="22" cy="12" r="2" fill="white" opacity="0.9" />
            {/* Motion trail */}
            <path d="M24 11 Q26 10 27 12" stroke="white" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
          </svg>
        </div>
        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-xl bg-green-400 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500" />
      </div>

      {/* Wordmark */}
      <div className="flex items-baseline">
        <span className={`font-black ${s.text} tracking-tight text-gray-900 dark:text-white transition-colors duration-200`}>
          BOOK
        </span>
        <span className={`font-black ${s.text} tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 group-hover:from-green-300 group-hover:to-emerald-400`}>
          2
        </span>
        <span className={`font-black ${s.text} tracking-tight text-gray-900 dark:text-white transition-colors duration-200`}>
          PLAY
        </span>
      </div>
    </button>
  );
}
