import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, Thermometer, Cpu, Server, CheckCircle } from 'lucide-react';

export const CurriculumSection: React.FC = () => {
  return (
    <section className="py-20 gradient-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Master Three Pillars. Command Any Hyperscale Facility.
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Our curriculum is reverse-engineered from the job descriptions of top tech companies.
          </p>
        </div>

        <Tabs defaultValue="power" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-12 h-14 p-1 bg-card/50 backdrop-blur-sm border border-border/30">
            <TabsTrigger value="power" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Power Systems
            </TabsTrigger>
            <TabsTrigger value="cooling" className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Cooling Systems
            </TabsTrigger>
            <TabsTrigger value="compute" className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              AI Hardware
            </TabsTrigger>
          </TabsList>

          <TabsContent value="power" className="space-y-6">
            <Card className="card-glow hover:shadow-intense transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1F5F5F, #2DD4BF)' }}>
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">1. Mission-Critical Power</CardTitle>
                    <p className="text-muted-foreground">Master the high-voltage electrical backbone of gigawatt-scale data centers.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">High-Voltage Substation Operations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">UPS Systems & N+1/2N Redundancy</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">BMS & EPMS Control Systems</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">Arc Flash Safety & NFPA 70E</span>
                  </li>
                </ul>
                <Badge className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#1F5F5F', color: 'white' }}>
                  Certified Power Systems Specialist
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cooling" className="space-y-6">
            <Card className="card-glow hover:shadow-intense transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2DD4BF, #06B6D4)' }}>
                    <Thermometer className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">2. Advanced Cooling</CardTitle>
                    <p className="text-muted-foreground">Become an expert in the liquid cooling technologies required for high-density AI clusters.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">Direct-to-Chip & Immersion Cooling</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">Coolant Distribution Unit (CDU) Management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">PLC Programming for HVAC Controls</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">ASHRAE Standards & Water Management</span>
                  </li>
                </ul>
                <Badge className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#2DD4BF', color: 'white' }}>
                  Liquid Cooling Infrastructure Expert
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compute" className="space-y-6">
            <Card className="card-glow hover:shadow-intense transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1F5F5F, #4F46E5)' }}>
                    <Server className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">3. Production Operations</CardTitle>
                    <p className="text-muted-foreground">Manage the server fleets that run the world's largest AI and cloud platforms.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">Linux System Administration at Scale</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">Python & Shell Scripting for Automation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">Server Hardware & GPU Diagnostics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-base">Network Infrastructure & Deployment</span>
                  </li>
                </ul>
                <Badge className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#4F46E5', color: 'white' }}>
                  AI Systems Administrator
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};