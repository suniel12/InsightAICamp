import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UrgencySectionProps {
  seatsRemaining: number;
}

export const UrgencySection: React.FC<UrgencySectionProps> = ({ seatsRemaining }) => {
  return (
    <section className="py-20 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <Card className="card-glow max-w-4xl mx-auto text-center">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6">Your Future in Hyperscale Infrastructure Starts Now.</h2>
            <p className="text-lg text-muted-foreground mb-6">The September 2025 cohort is filling quickly. Secure your spot to lock in Early Bird pricing.</p>
            
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full mx-1 ${
                      i < 7 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xl">
                Only <span className="text-primary font-bold">{seatsRemaining}</span> of 500 Seats Remaining
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Early Bird Pricing Ends September 1st</h3>
                <p className="text-3xl font-bold text-accent">Save $5,000</p>
                <p className="text-sm text-muted-foreground">+ Get a Free NVIDIA Certification</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Bonus Value</h3>
                <p className="text-3xl font-bold text-secondary">$300 Value</p>
                <p className="text-sm text-muted-foreground">NVIDIA Certification Included</p>
              </div>
            </div>

            <Button 
              className="btn-hero text-lg px-12 py-4" 
              style={{ backgroundColor: '#1F5F5F', color: 'white' }}
            >
              Start Your Application
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};