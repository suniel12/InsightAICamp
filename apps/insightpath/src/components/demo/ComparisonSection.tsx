import React from 'react';
import PowerPointViewer, { type PowerPointViewerProps } from './PowerPointViewer';
import PersonalizedVideoPlayer, { type PersonalizedVideoPlayerProps } from './PersonalizedVideoPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { BRAND_COLORS } from '@/constants/styles';

export type ComparisonSectionProps = {
  left: PowerPointViewerProps;
  right: PersonalizedVideoPlayerProps;
  comparisonPoints?: Array<{ title: string; description: string }>;
};

const ComparisonSection: React.FC<ComparisonSectionProps> = ({ left, right, comparisonPoints = [] }) => {
  return (
    <div className="space-y-12">
      {/* Split Screen Comparison */}
      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="transform transition-all duration-500 hover:scale-[1.01] animate-fade-in-left">
            <PowerPointViewer {...left} />
          </div>
          <div className="transform transition-all duration-500 hover:scale-[1.01] animate-fade-in-right">
            <PersonalizedVideoPlayer {...right} />
          </div>
        </div>
        {/* VS Badge */}
        <div className="hidden lg:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xl px-4 py-2 rounded-full shadow-2xl animate-pulse">
            VS
          </div>
        </div>
      </div>

      {/* Comparison Points with animations */}
      {comparisonPoints.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center text-white mb-6">
            Why Personalized Learning Wins
            <a 
              href="https://ijonse.net/index.php/ijonse/article/view/1897"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-base align-super text-cyan-400 hover:text-cyan-300 transition-colors"
              aria-label="Research citation for personalized learning benefits"
            >
              [1]
            </a>
          </h3>
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonPoints.map((p, idx) => (
              <li 
                key={idx} 
                className="m-0 list-none transform transition-all duration-500 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 border-slate-600 h-full hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                      >
                        <span className="text-white font-bold text-sm">{idx + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2 text-lg">{p.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{p.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComparisonSection;
