import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ComparisonSection from '@/components/demo/ComparisonSection';
import { BRAND_COLORS } from '@/constants/styles';
import heroBackground from '@/assets/hero-background.jpg';
import { 
  Users, 
  Rocket, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Building2,
  GraduationCap,
  Zap,
  Target,
  BarChart,
  Clock
} from 'lucide-react';

const BusinessPage = () => {
  // Demo assets for comparison section
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
      title: 'Boost Team Performance by 20-70%',
      description:
        'Personalized video routinely lifts performance versus static slides, driving measurable business results.',
    },
    {
      title: 'Drive 4x More Engagement Than Traditional L&D',
      description:
        'Interactive, tailored video formats keep attention far better than one-size-fits-all training decks.',
    },
    {
      title: 'Adaptive AI Delivers Personalized Learning Paths',
      description:
        'Adaptive sequencing matches each learner\'s background and current mastery—serving just‑right explanations and practice.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroBackground})`,
              filter: 'brightness(0.4)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/70 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Build Your High-Performance Data Center Team
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto">
              Partner with us to create a custom talent pipeline.
            </p>
          </div>
        </section>
        
        {/* Two Solutions Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Hire Certified Talent */}
              <Card id="talent" className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-white">Become a Hiring Partner</CardTitle>
                  <CardDescription className="text-lg text-slate-300">
                    Co-create your talent pipeline from day one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold text-lg">The Challenge</h4>
                    <p className="text-slate-300">
                      The data center skills shortage is hitting critical mass. Traditional recruiting 
                      delivers candidates who need months of additional training. Generic bootcamps 
                      don't teach your specific tech stack.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold text-lg">Our Solution</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Custom curriculum aligned to your exact needs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Candidates trained specifically for your open roles</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Direct input on certification requirements</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">First access to all qualified graduates</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      size="lg" 
                      className="w-full text-white font-bold"
                      style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                    >
                      Become a Founding Partner
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Train Your Workforce */}
              <Card id="training" className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-white">Preview Our Platform</CardTitle>
                  <CardDescription className="text-lg text-slate-300">
                    Experience the future of technical training
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold text-lg">The Challenge</h4>
                    <p className="text-slate-300">
                      Traditional training fails to engage modern learners. Static content doesn't 
                      adapt to different backgrounds. Generic courses don't match your specific 
                      technology requirements.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-semibold text-lg">Our Solution</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">AI-powered adaptive learning paths</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Personalized video content for each learner</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <BarChart className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Custom modules for your tech stack</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Real-time progress tracking and analytics</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="w-full font-bold"
                    >
                      Schedule Platform Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Platform Comparison Section */}
        <section className="py-20 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                See the Difference: Traditional vs. Adaptive Learning
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Transform your L&D with personalized, AI-driven video content that's proven to boost engagement and mastery
              </p>
            </div>
            
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
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-slate-800/30 to-slate-700/20 border-y border-slate-700">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Team?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join our exclusive group of founding partners. Shape the future of data center talent development
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-white font-bold"
                style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
              >
                Become a Founding Partner
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default BusinessPage;