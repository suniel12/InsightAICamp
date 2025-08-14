import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { BRAND_COLORS } from '@/constants/styles';
import ComparisonSection from '@/components/demo/ComparisonSection';
import { Dumbbell, MessageSquare, Brain } from 'lucide-react';

const DemoPage: React.FC = () => {
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
      title: 'Faster, bigger gains',
      description:
        'Personalized video routinely lifts performance versus static slides—think 20–70% higher scores.',
    },
    {
      title: 'Higher engagement that sticks',
      description:
        'Interactive, tailored video formats keep attention far better than one-size-fits-all decks, driving up to 4× more engagement.',
    },
    {
      title: 'Right level, right moment',
      description:
        'Adaptive sequencing matches each learner\'s background and current mastery—serving just‑right explanations and practice.',
    },
  ];

  // Update page metadata for SEO/clarity on this route
  React.useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') ?? '';
    document.title = 'Demo: Traditional vs Personalized | GigaWatt Academy';
    metaDesc?.setAttribute(
      'content',
      'Compare traditional PowerPoint slides with personalized AI video learning. See how tailored pacing and examples improve engagement.'
    );
    return () => {
      document.title = prevTitle;
      metaDesc?.setAttribute('content', prevDesc);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-slate-800 focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
      >
        Skip to main content
      </a>
      {/* Navigation */}
      <header>
        <nav aria-label="Primary" className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3" aria-label="Go to homepage">
                  <img
                    src="/favicon.png"
                    alt="GigaWatt Academy Logo"
                    className="h-8 w-8 object-contain"
                    decoding="async"
                  />
                  <span className="text-xl font-bold" style={{ color: BRAND_COLORS.PRIMARY }}>
                    GigaWatt Academy
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <Link
                  to="/"
                  className="text-lg font-bold hover:opacity-80 transition-opacity rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500"
                  style={{ color: BRAND_COLORS.PRIMARY }}
                >
                  Home
                </Link>
                <Link
                  to="/application"
                  className="px-4 py-2 rounded-lg font-bold transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500"
                  style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                  aria-label="Apply to GigaWatt Academy"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content" role="main">
        {/* Hero Section */}
        <section className="pt-20 pb-12" aria-labelledby="demo-hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">

              <h1 id="demo-hero-heading" className="mb-6">
                <span className="block text-5xl md:text-7xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Transform How You Learn
                </span>
                <span className="block mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold" style={{ color: BRAND_COLORS.PRIMARY }}>Traditional Slides</span>
                  <span className="text-2xl sm:text-3xl text-slate-500">vs</span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold" style={{ color: BRAND_COLORS.PRIMARY }}>
                    Personalized Video
                  </span>
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Compare the old way of static PowerPoint slides with the new way of on-demand, personalized video explanations.
              </p>
            </div>
            {/* Split-screen Comparison */}
            <ComparisonSection
              left={{ title: 'Traditional PowerPoint', slides, oldLabel: 'Old Way' }}
              right={{
                title: 'Personalized Video',
                personaLabel: 'Adaptive Learning',
                sources: personaSources,
              }}
              comparisonPoints={comparisonPoints}
            />
          </div>
        </section>

        {/* Upcoming Features Section */}
        <section className="py-20 bg-slate-900/50" aria-labelledby="upcoming-features-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">

              <h2 id="upcoming-features-heading" className="text-4xl font-bold text-white mb-4">
              Let's Get Started              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Next-generation learning features designed to accelerate your mastery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Interactive Exercises */}
              <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/30 shadow-card hover:shadow-intense transition-all duration-300 text-center">
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY}, ${BRAND_COLORS.ACCENT})`,
                  }}
                >
                  <Dumbbell className="h-10 w-10 text-white" />
                </div>
                <div className="font-bold text-2xl text-white mb-2">Interactive Exercises</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Hands-on practice with real-world scenarios and immediate feedback
                </div>
              </div>

              {/* Q&A Support */}
              <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/30 shadow-card hover:shadow-intense transition-all duration-300 text-center">
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY}, ${BRAND_COLORS.ACCENT})`,
                  }}
                >
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <div className="font-bold text-2xl text-white mb-2">Live Q&A Support</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Get instant answers with the right level of detail
                </div>
              </div>

              {/* AI Learning Style */}
              <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/30 shadow-card hover:shadow-intense transition-all duration-300 text-center">
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg"
                  style={{ 
                    backgroundImage: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY}, ${BRAND_COLORS.ACCENT})`,
                  }}
                >
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="font-bold text-2xl text-white mb-2">AI Learning Assistant</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Adaptive AI that learns how you learn best
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-y border-slate-700" aria-labelledby="demo-cta-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="demo-cta-heading" className="text-4xl font-bold text-white mb-6">
              Ready to Launch Your Six-Figure Career?
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
             Use adaptive learning and get certified 2x+ faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-white"
                style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
              >
                <Link to="/application" aria-label="Apply to Bootcamp">
                  Apply Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link to="/" aria-label="Learn more about GigaWatt Academy">
                  Learn More
                </Link>
              </Button>
            </div>
            
            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-center text-sm text-slate-400">
                © 2025 <span className="font-semibold" style={{ color: BRAND_COLORS.PRIMARY }}>GigaWatt Academy</span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DemoPage;