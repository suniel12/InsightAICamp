import { memo } from 'react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { ExternalLink } from 'lucide-react';

export const MarketOpportunitySection = memo(() => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          The Multi-Billion Dollar Skills Gap You're Positioned to Fill
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-16">
          While traditional IT roles face automation, a new class of infrastructure specialist is in critical demand.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="stat-card hover:shadow-glow transition-all duration-300 group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <div className="text-2xl font-bold text-primary">$</div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-3">
              $<AnimatedCounter end={650} suffix="B" />
            </div>
            <p className="text-muted-foreground font-medium">Global Data Center Market by 2030</p>
          </div>
          <div className="stat-card hover:shadow-glow transition-all duration-300 group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <div className="text-2xl font-bold text-accent">!</div>
            </div>
            <div className="text-4xl md:text-5xl font-bold text-accent mb-3">
              <AnimatedCounter end={53} suffix="%" />
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

        {/* Data Center Career Comparison Table */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Data Center Career Paths Are in High Demand</h3>
          <div className="overflow-x-auto bg-card rounded-lg border">
            <table className="w-full text-left">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Career Path</th>
                  <th className="px-6 py-4 font-semibold">Average Salary</th>
                  <th className="px-6 py-4 font-semibold">Job Growth</th>
                  <th className="px-6 py-4 font-semibold">Automation Risk</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-6 py-4 font-medium">Data Center Technician</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">$75K - $105K</td>
                  <td className="px-6 py-4 text-green-600">+8% (2024-2034)</td>
                  <td className="px-6 py-4 text-green-600">Low</td>
                </tr>
                <tr className="border-t bg-muted/20">
                  <td className="px-6 py-4 font-medium">Site Reliability Engineer</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">$95K - $145K</td>
                  <td className="px-6 py-4 text-green-600">+15% (2024-2034)</td>
                  <td className="px-6 py-4 text-green-600">Very Low</td>
                </tr>
                <tr className="border-t">
                  <td className="px-6 py-4 font-medium">Network Operations Technician</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">$80K - $120K</td>
                  <td className="px-6 py-4 text-green-600">+6% (2024-2034)</td>
                  <td className="px-6 py-4 text-green-600">Low</td>
                </tr>
                <tr className="border-t bg-muted/20">
                  <td className="px-6 py-4 font-medium text-muted-foreground">Entry-Level Software Engineer</td>
                  <td className="px-6 py-4 text-muted-foreground">$60K - $130K</td>
                  <td className="px-6 py-4 text-red-600">-27% (2024-2034)</td>
                  <td className="px-6 py-4 text-red-600">Very High</td>
                </tr>
                <tr className="border-t">
                  <td className="px-6 py-4 font-medium text-muted-foreground">Traditional IT Support</td>
                  <td className="px-6 py-4 text-muted-foreground">$45K - $85K</td>
                  <td className="px-6 py-4 text-orange-600">-8% (2024-2034)</td>
                  <td className="px-6 py-4 text-red-600">High</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Citation Footer */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Data sources: U.S. Bureau of Labor Statistics Occupational Outlook Handbook (2024-2034 projections)
            </p>
            <p className="mt-2">
              <a href="https://www.bls.gov/ooh/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                View official BLS career data →
              </a>
            </p>
          </div>
        </div>

        {/* Benefits and Considerations - Card Design */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Benefits & Considerations</h3>
            <p className="text-lg text-muted-foreground">
              What you need to know about data center careers
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Benefits */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <h4 className="text-xl font-semibold text-green-700 dark:text-green-400">
                    Benefits & Advantages
                  </h4>
                </div>
                
                <div className="space-y-5">
                  <div className="border-l-4 border-green-200 dark:border-green-800 pl-4">
                    <h5 className="font-semibold mb-2">High Salary Potential</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      $61K-$152K+ salary range with a clear path for advancement.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-200 dark:border-green-800 pl-4">
                    <h5 className="font-semibold mb-2">Job Security</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Lower automation risk due to the need for hands-on, skilled human oversight.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-200 dark:border-green-800 pl-4">
                    <h5 className="font-semibold mb-2">Growing Demand</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Explosive growth projected, driven by AI and cloud computing.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-200 dark:border-green-800 pl-4">
                    <h5 className="font-semibold mb-2">Quick Entry</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      10-12 week training programs offer a fast track into select roles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Considerations */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <h4 className="text-xl font-semibold text-orange-700 dark:text-orange-400">
                    Important Considerations
                  </h4>
                </div>
                
                <div className="space-y-5">
                  <div className="border-l-4 border-orange-200 dark:border-orange-800 pl-4">
                    <h5 className="font-semibold mb-2">Shift Work</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Some roles require 24/7 operations
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-orange-200 dark:border-orange-800 pl-4">
                    <h5 className="font-semibold mb-2">Geographic Requirements</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Jobs are concentrated in major tech hubs, potentially requiring relocation.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-orange-200 dark:border-orange-800 pl-4">
                    <h5 className="font-semibold mb-2">Continuous Learning</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Rapid technology changes demand an ongoing commitment to training and certification.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-orange-200 dark:border-orange-800 pl-4">
                    <h5 className="font-semibold mb-2">Initial Investment</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Requires investment in training programs and possible relocation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});