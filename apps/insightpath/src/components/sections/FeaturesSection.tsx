import { memo } from 'react';
import { 
  FileText, 
  Sparkles, 
  Globe, 
  Palette, 
  BarChart3, 
  Shield,
  Zap,
  Users,
  Code
} from 'lucide-react';

export const FeaturesSection = memo(() => {
  const features = [
    {
      icon: FileText,
      title: "Universal Format Support",
      description: "Upload PDFs, PowerPoints, Word docs, Markdown, and more. Our AI understands any document format.",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Personalization",
      description: "Content adapts to your audience's role, experience level, and learning objectives automatically.",
    },
    {
      icon: Globe,
      title: "Multi-Language Generation",
      description: "Generate videos in 50+ languages with natural-sounding voices and culturally appropriate content.",
    },
    {
      icon: Palette,
      title: "Brand Customization",
      description: "Apply your brand colors, logos, and visual style to maintain consistency across all content.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track engagement, completion rates, and learning outcomes with detailed analytics dashboards.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 compliant with end-to-end encryption, SSO support, and data residency options.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate professional videos in minutes, not days. Batch processing for multiple documents.",
    },
    {
      icon: Users,
      title: "Collaboration Tools",
      description: "Team workspaces, review workflows, and version control for enterprise content creation.",
    },
    {
      icon: Code,
      title: "API Integration",
      description: "Seamlessly integrate with your LMS, CMS, or custom applications via REST API.",
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for Modern Learning
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to transform static content into dynamic, personalized video experiences
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group relative"
              >
                <div className="h-full bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});