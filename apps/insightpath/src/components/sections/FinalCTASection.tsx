import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { BRAND_COLORS } from '@/constants/styles';

export const FinalCTASection: React.FC = () => {
  const handleStartTrial = () => {
    const comparisonSection = document.getElementById('comparison');
    if (comparisonSection) {
      comparisonSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Content?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of organizations creating engaging video content from their documents. 
            Start your free trial today and see the difference.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">5 free videos to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">Cancel anytime</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-hero text-lg px-8 py-6 shadow-glow hover:shadow-intense"
              style={{ backgroundColor: BRAND_COLORS.PRIMARY, color: BRAND_COLORS.WHITE }}
              onClick={handleStartTrial}
            >
              See It In Action
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = 'mailto:hello@insightpath.ai'}
            >
              Contact Sales
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-12 border-t border-border/30">
            <p className="text-sm text-muted-foreground mb-4">Trusted by leading organizations worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-lg font-semibold">Fortune 500</div>
              <div className="text-lg font-semibold">Universities</div>
              <div className="text-lg font-semibold">Healthcare</div>
              <div className="text-lg font-semibold">Government</div>
              <div className="text-lg font-semibold">Non-Profits</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};