import { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Target, DollarSign, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBackground from '@/assets/hero-background.jpg';
import { BRAND_COLORS } from '@/constants/styles';

interface HeroSectionProps {
  onShowHowItWorks: () => void;
}

export const HeroSection = memo<HeroSectionProps>(({ onShowHowItWorks }) => {
  const navigate = useNavigate();
  
  const handleApplicationClick = useCallback(() => {
    navigate('/application');
  }, [navigate]);
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
            Launch Your Six-Figure Career
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8" role="doc-subtitle">
            Join our founding cohort and train for real job openings at partner companies
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" role="region" aria-label="Key program benefits">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30" role="article" aria-labelledby="placement-rate">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center" aria-hidden="true">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg" id="placement-rate">Direct</div>
                <div className="text-sm text-muted-foreground">Employer Partnerships</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30" role="article" aria-labelledby="average-salary">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center" aria-hidden="true">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg" id="average-salary">$100K+</div>
                <div className="text-sm text-muted-foreground">Target Salary Range</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30" role="article" aria-labelledby="training-duration">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center" aria-hidden="true">
                <Rocket className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg" id="training-duration">8-12 Weeks</div>
                <div className="text-sm text-muted-foreground">Adaptive Training</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-border/30 shadow-card" role="region" aria-labelledby="cta-heading">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" id="cta-heading">Ready to Transform Your Career?</h3>
            </div>
            <div className="flex justify-center mb-6">
              <Button 
                className="btn-hero text-lg px-12 py-4 shadow-glow hover:shadow-intense" 
                style={{ backgroundColor: BRAND_COLORS.PRIMARY, color: BRAND_COLORS.WHITE }}
                onClick={handleApplicationClick}
                aria-describedby="job-guarantee"
                aria-label="Start your application for GigaWatt Academy's data center training program"
              >
                Apply for Early Access
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground" id="job-guarantee">
                ✓ Train for specific roles at real companies
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center" role="region" aria-labelledby="partner-companies">
          <p className="text-sm text-muted-foreground mb-4" id="partner-companies">
            Building partnerships with leading tech companies:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6" role="list" aria-label="Partner companies">
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">AWS</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Google</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Microsoft</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Meta</span>
            <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30" role="listitem">Oracle</span>
          </div>
        </div>
      </div>
    </section>
  );
});