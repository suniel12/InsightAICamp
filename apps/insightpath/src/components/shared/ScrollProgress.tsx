import React, { useEffect, useState } from 'react';
import { BRAND_COLORS } from '@/constants/styles';

export const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div className="fixed top-16 left-0 w-full h-0.5 bg-slate-800/30 z-[49]">
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${scrollProgress}%`,
          backgroundColor: BRAND_COLORS.PRIMARY,
          boxShadow: `0 0 8px ${BRAND_COLORS.PRIMARY}40`,
        }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
};