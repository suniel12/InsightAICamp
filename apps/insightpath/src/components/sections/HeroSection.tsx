import { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Video, Sparkles } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';
import { BRAND_COLORS } from '@/constants/styles';

interface HeroSectionProps {
  onShowHowItWorks: () => void;
}

export const HeroSection = memo<HeroSectionProps>(({ onShowHowItWorks }) => {
  const handleDemoClick = useCallback(() => {
    const comparisonSection = document.getElementById('comparison');
    if (comparisonSection) {
      comparisonSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBackground})`,
          filter: 'brightness(0.3)'
        }}
      />
      <div className="absolute inset-0 gradient-hero" />
      
      <div className="relative z-10 container mx-auto px-6 text-center pt-10">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Transform Documents into Personalized Videos
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8" role="doc-subtitle">
            AI-powered video generation that adapts to your audience, context, and goals
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" role="region" aria-label="Key platform features">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30" role="article">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center" aria-hidden="true">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg">Any Document</div>
                <div className="text-sm text-muted-foreground">PDF, PPT, Word, Markdown</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30" role="article">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center" aria-hidden="true">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg">AI Personalization</div>
                <div className="text-sm text-muted-foreground">Context-Aware Content</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30" role="article">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center" aria-hidden="true">
                <Video className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg">Pro Videos</div>
                <div className="text-sm text-muted-foreground">In Minutes, Not Days</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-border/30 shadow-card" role="region" aria-labelledby="cta-heading">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" id="cta-heading">See Your Content Come to Life</h3>
              <p className="text-muted-foreground">Upload any document and watch AI transform it into engaging video</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                className="btn-hero text-lg px-12 py-4 shadow-glow hover:shadow-intense" 
                style={{ backgroundColor: BRAND_COLORS.PRIMARY, color: BRAND_COLORS.WHITE }}
                onClick={handleDemoClick}
                aria-label="See comparison between static and video"
              >
                See Comparison
              </Button>
              <Button 
                variant="outline"
                className="text-lg px-12 py-4" 
                onClick={onShowHowItWorks}
                aria-label="Learn how InsightPath works"
              >
                How It Works
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ✓ No credit card required ✓ 5-minute setup ✓ Works with your existing content
              </p>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-12 text-center" role="region" aria-labelledby="use-cases">
          <p className="text-sm text-muted-foreground mb-4" id="use-cases">
            Trusted by organizations across industries:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6" role="list" aria-label="Industry use cases">
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Corporate Training</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Education</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Healthcare</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Software</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Manufacturing</span>
          </div>
        </div>
      </div>
    </section>
  );
});