import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Award } from 'lucide-react';

export const GuaranteeSection: React.FC = () => {
  return (
    <section className="py-20 gradient-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Success is Our Success
          </h2>
          <p className="text-xl text-muted-foreground">
            Pioneer Program Benefits
          </p>
          <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            Founding cohort members receive special pricing and priority placement with our partner companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="card-glow text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle>Partner-First Placement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We secure employer partnerships first, then train you for specific open roles at those companies.
              </p>
            </CardContent>
          </Card>
          <Card className="card-glow text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Founding Member Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Special pricing, priority placement, and direct input on program development.
              </p>
            </CardContent>
          </Card>



          <Card className="card-glow text-center">
            <CardHeader>
              <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
              <CardTitle>Lifetime Career Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Early members get lifetime access to our platform, career coaching, and alumni network.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};