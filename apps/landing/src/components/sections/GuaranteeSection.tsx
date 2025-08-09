import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, DollarSign, Award } from 'lucide-react';

export const GuaranteeSection: React.FC = () => {
  return (
    <section className="py-20 gradient-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Success is Our Success
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="card-glow text-center">
            <CardHeader>
              <DollarSign className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle>Income Share Option</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Pay $1,000 at enrollment and 10% of first year income when earning $60K+.
              </p>
            </CardContent>
          </Card>
          <Card className="card-glow text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>90-Day Job Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Land a role with higher salary within 90 days of completion or you owe nothing.
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
                Job placement assistance, salary negotiation, and career coaching for life.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};