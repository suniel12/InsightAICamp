import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText, Maximize2, X } from 'lucide-react';
import { BRAND_COLORS } from '@/constants/styles';

export type PowerPointViewerProps = {
  title?: string;
  slides: string[]; // Array of image URLs
  initialIndex?: number;
  oldLabel?: string;
  onIndexChange?: (index: number) => void;
};

const PowerPointViewer: React.FC<PowerPointViewerProps> = ({
  title = 'Traditional PowerPoint',
  slides,
  initialIndex = 1,  // Start at slide 2 (index 1)
  oldLabel = 'Old Way',
  onIndexChange,
}) => {
  const total = useMemo(() => slides?.length ?? 0, [slides]);
  const [index, setIndex] = useState<number>(Math.min(Math.max(initialIndex, 0), Math.max(total - 1, 0)));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex((prev) => Math.min(Math.max(prev, 0), Math.max(total - 1, 0)));
  }, [total]);

  // Handle fullscreen API
  const enterFullscreen = useCallback(async () => {
    if (!fullscreenRef.current) return;
    
    try {
      if (fullscreenRef.current.requestFullscreen) {
        await fullscreenRef.current.requestFullscreen();
      } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
        await (fullscreenRef.current as any).webkitRequestFullscreen();
      } else if ((fullscreenRef.current as any).msRequestFullscreen) {
        await (fullscreenRef.current as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error('Error entering fullscreen:', err);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const goPrev = useCallback(() => {
    setImageLoading(true);
    setIndex((i) => {
      const next = Math.max(0, i - 1);
      onIndexChange?.(next);
      return next;
    });
  }, [onIndexChange]);

  const goNext = useCallback(() => {
    setImageLoading(true);
    setIndex((i) => {
      const next = Math.min(total - 1, i + 1);
      onIndexChange?.(next);
      return next;
    });
  }, [onIndexChange, total]);

  const currentSrc = total > 0 ? slides[index] : '/placeholder.svg';
  const isAtStart = index <= 0;
  const isAtEnd = index >= Math.max(total - 1, 0);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!isAtStart) goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isAtEnd) goNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    },
    [goPrev, goNext, isAtStart, isAtEnd, isFullscreen, exitFullscreen]
  );

  return (
    <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
      <CardHeader className="border-b border-slate-700 py-4" style={{ backgroundColor: BRAND_COLORS.PRIMARY }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-white/90 flex-shrink-0" />
            <CardTitle className="text-white text-lg sm:text-xl">{title}</CardTitle>
          </div>
          <Badge className="bg-white/20 backdrop-blur-sm text-white font-semibold px-3 py-1 whitespace-nowrap border border-white/30">
            {oldLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Fullscreen Container */}
        <div 
          ref={fullscreenRef}
          className={`relative aspect-video ${isFullscreen ? 'bg-black' : 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900'}`}
          role="region"
          aria-label={`${title} slide viewer`}
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          {/* Loading State */}
          {imageLoading && !isFullscreen && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-400">Loading slide...</p>
              </div>
            </div>
          )}

          {/* Slide Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              id="ppt-slide-image"
              src={currentSrc}
              alt={`Slide ${index + 1} of ${total}`}
              className={`${isFullscreen ? 'max-h-full max-w-full' : 'w-full h-full'} object-contain`}
              loading="eager"
              decoding="async"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            
            {/* Slide Navigation Overlay */}
            <div className={`absolute inset-0 flex ${isFullscreen ? '' : 'opacity-0 hover:opacity-100'} transition-opacity duration-200`}>
              <button
                onClick={goPrev}
                disabled={isAtStart}
                className="w-1/3 h-full flex items-center justify-start pl-4 disabled:cursor-not-allowed"
                aria-label="Previous slide"
              >
                {!isAtStart && (
                  <div className={`${isFullscreen ? 'bg-white/10' : 'bg-black/60'} backdrop-blur-sm rounded-full p-2.5 hover:bg-black/80 transition-all duration-200 hover:scale-110`}>
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
              
              <div className="w-1/3 h-full" />
              
              <button
                onClick={goNext}
                disabled={isAtEnd}
                className="w-1/3 h-full flex items-center justify-end pr-4 disabled:cursor-not-allowed"
                aria-label="Next slide"
              >
                {!isAtEnd && (
                  <div className={`${isFullscreen ? 'bg-white/10' : 'bg-black/60'} backdrop-blur-sm rounded-full p-2.5 hover:bg-black/80 transition-all duration-200 hover:scale-110`}>
                    <ChevronRight className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Controls */}
          {isFullscreen ? (
            // Fullscreen Controls
            <>
              <div className="absolute top-4 right-4">
                <Button
                  onClick={exitFullscreen}
                  size="sm"
                  variant="ghost"
                  className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 h-10 w-10 p-0"
                  aria-label="Exit fullscreen"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
                <span className="text-white font-medium">
                  Slide {index + 1} of {total}
                </span>
              </div>
            </>
          ) : (
            // Normal Controls
            <>
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                <Badge className="bg-slate-900/80 backdrop-blur-sm border border-slate-600 text-white font-medium pointer-events-auto">
                  Slide {total === 0 ? 0 : index + 1} of {total}
                </Badge>
                <Button
                  onClick={enterFullscreen}
                  size="sm"
                  variant="ghost"
                  className="bg-slate-900/80 backdrop-blur-sm text-white hover:bg-slate-800/90 pointer-events-auto h-7 px-2.5"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Bottom Slide Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-2">
                {Array.from({ length: total }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setImageLoading(true);
                      setIndex(i);
                      onIndexChange?.(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index 
                        ? 'w-6 bg-white' 
                        : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerPointViewer;