import { memo } from 'react';
import { GraduationCap, Building2, Heart, Code, Factory, Users } from 'lucide-react';

export const UseCasesSection = memo(() => {
  const useCases = [
    {
      icon: Building2,
      title: "Corporate Training",
      description: "Transform employee handbooks, compliance documents, and training materials into engaging video courses that improve retention and completion rates.",
      benefits: ["Reduce training time by 60%", "Increase retention by 40%", "Track learning progress"],
      color: "primary"
    },
    {
      icon: GraduationCap,
      title: "Education",
      description: "Convert textbooks, lecture notes, and course materials into personalized video lessons that adapt to different learning styles and paces.",
      benefits: ["Personalized learning paths", "Multi-language support", "Accessibility features"],
      color: "accent"
    },
    {
      icon: Heart,
      title: "Healthcare",
      description: "Turn medical protocols, patient education materials, and clinical guidelines into clear, accessible video content for staff and patients.",
      benefits: ["HIPAA compliant", "Patient comprehension", "Staff training efficiency"],
      color: "secondary"
    },
    {
      icon: Code,
      title: "Software & Tech",
      description: "Convert technical documentation, API guides, and user manuals into interactive video tutorials that accelerate onboarding and adoption.",
      benefits: ["Reduce support tickets", "Faster onboarding", "Better user adoption"],
      color: "primary"
    },
    {
      icon: Factory,
      title: "Manufacturing",
      description: "Transform SOPs, safety protocols, and equipment manuals into visual training content that ensures compliance and reduces errors.",
      benefits: ["Safety compliance", "Reduce training costs", "Multilingual support"],
      color: "accent"
    },
    {
      icon: Users,
      title: "HR & Onboarding",
      description: "Convert company policies, benefits guides, and onboarding materials into welcoming video content that engages new employees.",
      benefits: ["Faster onboarding", "Consistent messaging", "Higher engagement"],
      color: "secondary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Use Cases Across Industries
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From corporate training to patient education, InsightPath transforms how organizations share knowledge
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div 
                key={index}
                className="group bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${useCase.color}/10 flex items-center justify-center group-hover:bg-${useCase.color}/20 transition-colors`}>
                      <Icon className={`w-6 h-6 text-${useCase.color}`} />
                    </div>
                    <h3 className="text-xl font-bold">{useCase.title}</h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {useCase.description}
                  </p>
                  
                  {/* Benefits */}
                  <div className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-card rounded-2xl border border-border p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">The Impact of Video Learning</h3>
            <p className="text-muted-foreground">Research-backed benefits of transforming documents into video</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <p className="text-sm text-muted-foreground">Message retention with video vs 10% with text</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">4x</div>
              <p className="text-sm text-muted-foreground">Faster learning with personalized content</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">83%</div>
              <p className="text-sm text-muted-foreground">Prefer video over text documentation</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">60%</div>
              <p className="text-sm text-muted-foreground">Reduction in training time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});