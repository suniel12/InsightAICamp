import { memo } from 'react';
import { Upload, Cpu, Video, CheckCircle } from 'lucide-react';

export const HowItWorksSection = memo(() => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Document",
      description: "Simply drag and drop your PDF, PowerPoint, Word document, or markdown file. Our platform handles all common formats.",
      color: "primary"
    },
    {
      icon: Cpu,
      title: "AI Analyzes & Personalizes",
      description: "Our AI understands your content, identifies key concepts, and creates a personalized script based on your audience and goals.",
      color: "accent"
    },
    {
      icon: Video,
      title: "Generate Professional Video",
      description: "Watch as your document transforms into an engaging video with narration, visuals, and animations tailored to your content.",
      color: "secondary"
    },
    {
      icon: CheckCircle,
      title: "Review & Share",
      description: "Preview your video, make any adjustments, and share it with your audience or integrate it into your learning platform.",
      color: "primary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform any document into engaging video content in four simple steps. 
            No video editing experience required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="relative group"
              >
                {/* Connector Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
                )}
                
                <div className="relative z-10 text-center lg:text-left">
                  {/* Step Number */}
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full bg-${step.color}/10 flex items-center justify-center group-hover:bg-${step.color}/20 transition-colors`}>
                        <Icon className={`w-10 h-10 text-${step.color}`} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Example Transformation */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              {/* Before */}
              <div className="p-8 border-r border-border">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold mb-2">Before: Static Document</h4>
                  <p className="text-sm text-muted-foreground">Traditional PDF or presentation</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-6 space-y-3">
                  <div className="h-2 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                  <div className="h-2 bg-muted rounded w-2/3"></div>
                  <div className="mt-4 h-32 bg-muted rounded"></div>
                  <div className="h-2 bg-muted rounded w-5/6"></div>
                  <div className="h-2 bg-muted rounded w-3/4"></div>
                </div>
              </div>
              
              {/* After */}
              <div className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold mb-2">After: Engaging Video</h4>
                  <p className="text-sm text-muted-foreground">Personalized, interactive content</p>
                </div>
                <div className="bg-card rounded-lg p-6 border border-primary/20">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4">
                    <Video className="w-16 h-16 text-primary/50" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Voice narration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Visual animations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Personalized content</span>
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