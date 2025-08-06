import React from 'react';
import { Button } from "@/components/ui/button";
import { Target, DollarSign, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBackground from '@/assets/hero-background.jpg';

interface HeroSectionProps {
  onStartQuiz: () => void;
  onShowHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartQuiz, onShowHowItWorks }) => {
  const navigate = useNavigate();
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
      
      {/* Header with Academy Name and How it Works */}
      <header className="absolute top-0 left-0 right-0 z-20 py-8">
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Academy Name on the left */}
          <div className="font-semibold text-xl" style={{ color: '#1F5F5F' }}>
            GigaWatt Academy
          </div>
          
          {/* How it Works on the right - clickable */}
          <button 
            onClick={onShowHowItWorks}
            className="font-semibold text-xl hover:opacity-80 transition-opacity cursor-pointer" 
            style={{ color: '#1F5F5F' }}
          >
            How it Works
          </button>
        </div>
      </header>
      
      <div className="relative z-10 container mx-auto px-6 text-center pt-24">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Launch Your Six-Figure Career
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Join an elite cohort powering the global AI revolution
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg">90%+</div>
                <div className="text-sm text-muted-foreground">Placement Rate</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg">$100K+</div>
                <div className="text-sm text-muted-foreground">Average Salary</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-center md:text-left">
                <div className="font-bold text-lg">8 Weeks+</div>
                <div className="text-sm text-muted-foreground">Adaptive Learning</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-border/30 shadow-card">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Ready to Transform Your Career?</h3>
            </div>
            <div className="flex justify-center mb-6">
              <Button 
                className="btn-hero text-lg px-12 py-4 shadow-glow hover:shadow-intense" 
                style={{ backgroundColor: '#1F5F5F', color: 'white' }}
                onClick={() => navigate('/application')}
              >
                Start Your Application
              </Button>
            </div>
            <div className="text-center">
  
              <p className="text-sm text-muted-foreground">
                ✓ 90-day job guarantee
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Courses created in collaboration with leading tech companies:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium opacity-80">
              <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30">AWS</span>
              <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30">Google</span>
              <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30">Microsoft</span>
              <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30">Meta</span>
              <span className="px-3 py-1 rounded-full bg-card/30 border border-border/30">Oracle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};