import { useState, useEffect } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-[100]">
      <div
        className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm transition-all duration-150"
        style={{ left: `${progress - 5}%` }}
      />
    </div>
  );
}
