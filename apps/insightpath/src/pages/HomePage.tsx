import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { BRAND_COLORS } from '@/constants/styles';
import { GraduationCap, Building2, Users, Rocket, TrendingUp, Target, BookOpen, Briefcase } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroBackground})`,
              filter: 'brightness(0.3)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
          
          <div className="relative z-10 container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              The Talent and Technology Platform
            </h1>
            <p className="text-xl md:text-3xl text-slate-200 mb-4">
              for the AI Economy
            </p>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12">
              We're launching the first adaptive learning platform that connects aspiring data center professionals directly with hiring companies
            </p>
            
            {/* Fork CTAs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">For Individuals</CardTitle>
                  <CardDescription className="text-slate-300">
                    Train for guaranteed roles at partner companies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm">Direct Path to $100K+ Roles</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="text-sm">Train for Real Job Openings</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Rocket className="w-4 h-4 text-primary" />
                      <span className="text-sm">Partner Company Placement</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    className="w-full text-white font-bold"
                    style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                  >
                    <Link to="/individuals">
                      Join Early Access
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm hover:border-accent/50 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">For Business</CardTitle>
                  <CardDescription className="text-slate-300">
                    Build the talent pipeline for your data center growth
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-sm">Custom-Trained Candidates</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <BookOpen className="w-4 h-4 text-accent" />
                      <span className="text-sm">Adaptive Learning Platform</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm">Shape Training Curriculum</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="w-full font-bold"
                  >
                    <Link to="/business">
                      Partner With Us
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-20 bg-slate-900/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-accent mb-2">53%</div>
                <div className="text-slate-300">Skills Shortage</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">September 2025</div>
                <div className="text-slate-300">First Cohort Launch</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">Direct</div>
                <div className="text-slate-300">Partner Placement Model</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Our Mission</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              As data centers become the backbone of the AI revolution, the demand for skilled professionals 
              is exploding. We're pioneering a new model: partnering with employers first, then training 
              candidates for specific roles. Our adaptive learning technology delivers personalized education 
              that ensures every graduate is job-ready from day one.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;