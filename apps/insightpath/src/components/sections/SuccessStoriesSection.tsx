import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import marcusPhoto from '@/assets/testimonial-marcus.jpg';
import sarahPhoto from '@/assets/testimonial-sarah.jpg';
import jamesPhoto from '@/assets/testimonial-james.jpg';

export const SuccessStoriesSection: React.FC = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            From Where You Are to a Mission-Critical Career
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Our alumni have successfully transitioned from diverse backgrounds to high-paying infrastructure roles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Marcus Chen Story */}
          <Card className="card-glow hover:shadow-intense transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={marcusPhoto} 
                  alt="Marcus Chen" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">Marcus Chen</h3>
                  <p className="text-sm text-muted-foreground">Network Admin → Lead Infrastructure Engineer</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-base mb-3 font-medium">
                  <span className="text-muted-foreground">Before: $65K</span>
                  <span className="text-accent font-bold">After: $135K</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-1000" style={{ width: '75%' }} />
                </div>
                <div className="text-center mt-2 text-sm font-medium text-accent">+108% Increase</div>
              </div>
              <blockquote className="text-base text-muted-foreground italic border-l-4 border-accent pl-4">
                "My networking knowledge gave me an edge, but the power and automation training 
                made me indispensable at a top cloud provider."
              </blockquote>
            </CardContent>
          </Card>

          {/* Sarah Rodriguez Story */}
          <Card className="card-glow hover:shadow-intense transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={sarahPhoto} 
                  alt="Sarah Rodriguez" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">Sarah Rodriguez</h3>
                  <p className="text-sm text-muted-foreground">Air Force Veteran → Critical Facility Engineer</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-base mb-3 font-medium">
                  <span className="text-muted-foreground">Military Background</span>
                  <span className="text-accent font-bold">Now: $128K</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-1000" style={{ width: '85%' }} />
                </div>
                <div className="text-center mt-2 text-sm font-medium text-accent">Mission-Critical Role</div>
              </div>
              <blockquote className="text-base text-muted-foreground italic border-l-4 border-accent pl-4">
                "The military taught me mission-critical thinking. Gigawatt Academy taught me how to 
                apply it to billion-dollar infrastructure."
              </blockquote>
            </CardContent>
          </Card>

          {/* James Thompson Story */}
          <Card className="card-glow hover:shadow-intense transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={jamesPhoto} 
                  alt="James Thompson" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">James Thompson</h3>
                  <p className="text-sm text-muted-foreground">Electrician → Data Center Engineering Ops</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-base mb-3 font-medium">
                  <span className="text-muted-foreground">Before: $42K</span>
                  <span className="text-accent font-bold">After: $95K</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-1000" style={{ width: '90%' }} />
                </div>
                <div className="text-center mt-2 text-sm font-medium text-accent">+126% Increase</div>
              </div>
              <blockquote className="text-base text-muted-foreground italic border-l-4 border-accent pl-4">
                "I thought my career had a ceiling. The ISA meant I could upskill 
                without financial risk and double my income."
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};