import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PowerPointViewer from '../demo/PowerPointViewer';
import PersonalizedVideoPlayer from '../demo/PersonalizedVideoPlayer';

export const ComparisonSection = memo(() => {
  // Demo assets - PowerPoint slides as images
  const slides = [
    '/Slide1.png',
    '/Slide2.png', 
    '/Slide3.png',
    '/Slide4.png',
    '/Slide5.png',
    '/Slide6.png'
  ];

  const personaSources = {
    biology: 'https://hri6x5swfx24a5m7.public.blob.vercel-storage.com/bio.mp4',
    it: 'https://hri6x5swfx24a5m7.public.blob.vercel-storage.com/IT.mp4',
  };

  const comparisonPoints = [
    {
      title: "10x Better Engagement",
      description: "Videos capture attention and maintain focus throughout the learning experience"
    },
    {
      title: "Personalized for Each Viewer",
      description: "Content adapts based on role, experience level, and learning objectives"
    },
    {
      title: "Measurable Results",
      description: "Track completion rates, engagement points, and knowledge retention"
    },
    {
      title: "Instant Updates",
      description: "Change your document once, and all videos update automatically"
    },
    {
      title: "Global Reach",
      description: "One document becomes videos in multiple languages for international teams"
    },
    {
      title: "Accessible by Design",
      description: "Automatic captions, transcripts, and adjustable playback speeds"
    }
  ];

  return (
    <section id="comparison" className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See the Transformation in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how the same content becomes dramatically more engaging when transformed from static slides to personalized video
          </p>
        </div>

        {/* Side-by-side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 max-w-7xl mx-auto">
          <div className="transform transition-all duration-500 hover:scale-[1.01]">
            <PowerPointViewer 
              title="Traditional PowerPoint" 
              slides={slides} 
              initialIndex={0}
              oldLabel="Static Content"
            />
          </div>
          <div className="transform transition-all duration-500 hover:scale-[1.01]">
            <PersonalizedVideoPlayer
              title="AI-Powered Video"
              personaLabel="Adaptive Learning"
              sources={personaSources}
              initialPersona="biology"
            />
          </div>
        </div>

        {/* Why It Matters */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            Why Personalized Video Wins Every Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonPoints.map((point, index) => (
              <Card key={index} className="bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{point.title}</h4>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Research Citation */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Based on research showing personalized learning improves outcomes by up to 45%
            <a 
              href="https://ijonse.net/index.php/ijonse/article/view/1897"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-primary hover:underline"
            >
              [1]
            </a>
          </p>
        </div>
      </div>
    </section>
  );
});