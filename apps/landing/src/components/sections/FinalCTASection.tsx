import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1F5F5F, #0F2027)' }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-accent rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary rounded-full blur-xl"></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          Your Future in AI Infrastructure Starts with One Decision
        </h2>
        <p className="text-xl mb-12 max-w-4xl mx-auto text-white/90">
          Join thousands of ambitious professionals building the backbone of the AI revolution. With our 90% 
          placement rate and $100K+ average starting salaries, your transformation is not just 
          possible—it's probable.
        </p>

        <div className="flex flex-col items-center gap-8 mb-12">
          <Button 
            className="btn-hero text-xl px-16 py-6 shadow-2xl hover:shadow-intense group" 
            style={{ backgroundColor: 'white', color: '#1F5F5F' }}
            onClick={() => navigate('/application')}
          >
            Start Your Application
          </Button>
          
          <div className="flex flex-col md:flex-row gap-8 text-white/80">

          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-white/70 mb-4">
            ⭐ ⭐ ⭐ ⭐ ⭐ Rated 5/5 by our graduates
          </p>
          <p className="text-sm text-white/60">
            "This program completely transformed my career. The adaptive learning module is a game-changer." - Vindhya N.
          </p>
        </div>
      </div>
    </section>
  );
};