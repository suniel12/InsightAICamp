import React from 'react';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const MarketOpportunitySection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          The Multi-Billion Dollar Skills Gap You're Positioned to Fill
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-16">
          While traditional IT roles face automation, a new class of infrastructure specialist is in critical demand.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="stat-card hover:shadow-glow transition-all duration-300 group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <div className="text-2xl font-bold text-primary">$</div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-3">
              $<AnimatedCounter end={2.1} suffix="B" />
            </div>
            <p className="text-muted-foreground font-medium">Global Data Center Market by 2030</p>
          </div>
          <div className="stat-card hover:shadow-glow transition-all duration-300 group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <div className="text-2xl font-bold text-accent">!</div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-accent mb-3">
              <AnimatedCounter end={73} suffix="%" />
            </div>
            <p className="text-muted-foreground font-medium">Of Operators Report a Critical Skills Shortage</p>
          </div>
          <div className="stat-card hover:shadow-glow transition-all duration-300 group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
              <div className="text-2xl font-bold text-secondary">↗</div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-secondary mb-3">
              <AnimatedCounter end={300} suffix="%" />
            </div>
            <p className="text-muted-foreground font-medium">Salary Premium for Mission-Critical Skills</p>
          </div>
        </div>
      </div>
    </section>
  );
};