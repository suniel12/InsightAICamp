import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, GraduationCap, Monitor } from 'lucide-react';
import { BRAND_COLORS } from '@/constants/styles';

export type PersonaKey = 'biology' | 'it';

export type PersonalizedVideoPlayerProps = {
  title?: string;
  personaLabel?: string;
  initialPersona?: PersonaKey;
  sources: Partial<Record<PersonaKey, string>>;
};

const PERSONA_CONFIG = {
  biology: {
    key: 'biology' as PersonaKey,
    label: 'Bio Grad',
    icon: GraduationCap,
    description: 'Learn with biological analogies and real-world examples',
    color: 'from-cyan-600 to-teal-600',
    bgColor: 'from-cyan-900/20 to-teal-900/10',
    borderColor: 'border-cyan-500/30',
    accentBg: 'bg-cyan-500/20',
  },
  it: {
    key: 'it' as PersonaKey,
    label: 'IT Technician',
    icon: Monitor,
    description: 'Technical deep-dives with practical IT applications',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-900/20 to-cyan-900/10',
    borderColor: 'border-blue-500/30',
    accentBg: 'bg-blue-500/20',
  },
};

const PersonalizedVideoPlayer: React.FC<PersonalizedVideoPlayerProps> = ({
  title = 'Personalized Video',
  personaLabel = 'AI-Powered Learning',
  initialPersona = 'biology',
  sources,
}) => {
  const [persona, setPersona] = useState<PersonaKey>(initialPersona);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = useMemo(() => sources?.[persona], [persona, sources]);
  const currentPersona = PERSONA_CONFIG[persona];

  // Handle persona switching
  const handlePersonaSwitch = () => {
    const newPersona = persona === 'biology' ? 'it' : 'biology';
    setPersona(newPersona);
  };

  // Restart video when persona changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [persona]);

  return (
    <Card className="bg-slate-800/60 border-slate-700 overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b border-slate-700 py-4" style={{ backgroundColor: BRAND_COLORS.PRIMARY }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-white/90 flex-shrink-0" />
            <CardTitle className="text-white text-lg sm:text-xl">{title}</CardTitle>
          </div>
          <Badge 
            className="bg-white/20 backdrop-blur-sm text-white font-semibold px-3 py-1 border border-white/30"
          >
            {personaLabel}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900">
          {videoSrc ? (
            <>
              {/* Auto-playing Video */}
              <video
                ref={videoRef}
                key={videoSrc}
                className="w-full h-full object-contain"
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={`${title} for ${currentPersona.label}`}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Persona Toggle Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                {/* Current Persona Badge */}
                <Badge 
                  className={`${currentPersona.accentBg} backdrop-blur-sm text-white border-0 flex items-center gap-1.5 text-xs sm:text-sm`}
                >
                  <currentPersona.icon className="h-3 w-3" />
                  <span className="font-medium">{currentPersona.label}</span>
                </Badge>
                
                {/* Toggle Switch */}
                <div className="pointer-events-auto">
                  <Button
                    onClick={handlePersonaSwitch}
                    size="sm"
                    className="bg-slate-900/80 backdrop-blur-sm text-white hover:bg-slate-800/90 h-8 px-3 text-xs sm:text-sm transition-all duration-200"
                  >
                    Switch to {persona === 'biology' ? 'IT Technician' : 'Bio Grad'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Fallback if no video available
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className={`w-16 h-16 mx-auto rounded-lg bg-gradient-to-br ${currentPersona.color} flex items-center justify-center`}>
                  <currentPersona.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-slate-300 text-sm">Video not available for {currentPersona.label}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedVideoPlayer;