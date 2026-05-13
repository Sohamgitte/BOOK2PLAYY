import { useEffect, useState } from 'react';

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[1] w-[500px] h-[500px] rounded-full opacity-[0.04] dark:opacity-[0.06] transition-opacity duration-300"
      style={{
        background: 'radial-gradient(circle, rgba(34,197,94,0.8) 0%, rgba(16,185,129,0.3) 40%, transparent 70%)',
        left: pos.x - 250,
        top: pos.y - 250,
      }}
    />
  );
}
