import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl mb-6">Gigawatt Factory</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          <p className="text-lg text-muted-foreground">
            Our 90-94% placement rate is the result of a systematic program co-developed with our hiring partners. We invest in you at every step.
          </p>

          {/* Phase 1 */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-2xl">Phase 1: AI-Powered Adaptive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We use adaptive learning technology to create a personalized educational path for you. The AI assesses your performance in real-time, adjusting content and pace to ensure you master the foundational skills, regardless of your starting point.
              </p>
            </CardContent>
          </Card>

          {/* Phase 2 */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-2xl">Phase 2: Industry Co-Developed Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The curriculum is co-designed and continuously updated with our partners at leading tech companies. You learn the exact technical skills and knowledge that employers are actively seeking, from high-voltage power systems to liquid cooling and Python automation.
              </p>
            </CardContent>
          </Card>

          {/* Phase 3 */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-2xl">Phase 3: Onsite Training with Partner Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The final phase is immersive, hands-on training at a partner company's facility. This serves as an extended interview, allowing you to apply your skills in a real-world environment and build connections. Many participants receive job offers directly from their host company.
              </p>
            </CardContent>
          </Card>

          {/* Comprehensive Career Support */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-2xl">Comprehensive Career Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Dedicated Career Coaching:</h4>
                <p className="text-muted-foreground">Get 1-on-1 coaching to prepare for interviews, build confidence, and navigate your job search.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Professional Development:</h4>
                <p className="text-muted-foreground">Access workshops on LinkedIn optimization, resume development, and professional networking, including mock interviews with industry managers.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Direct Employer Connections:</h4>
                <p className="text-muted-foreground">Skip the job boards. We provide direct introductions to our hiring partner network through exclusive panels and matchmaking events.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};