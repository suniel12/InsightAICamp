import React from 'react';
import { StreamlinedApplicationForm } from '../components/forms/StreamlinedApplicationForm';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import insightPathLogo from '@/assets/insightpath-logo.png';

const ApplicationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Back Button */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8">
                  <img 
                    src={insightPathLogo} 
                    alt="InsightPath" 
                    className="w-full h-full"
                  />
                </div>
                <span className="font-semibold text-lg" style={{ color: '#1F5F5F' }}>
                  InsightPath
                </span>
              </div>
            </div>

            {/* Academy Name */}
            <div className="text-lg font-semibold" style={{ color: '#1F5F5F' }}>
              GigaWatt Academy
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Apply to GigaWatt Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Take the first step towards your six-figure career in AI infrastructure. 
            Our admissions team will review your application within 48 hours.
          </p>
        </div>

        <StreamlinedApplicationForm 
          onClose={() => navigate('/')} 
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/30 mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">© 2024 InsightPath GigaWatt Academy. All rights reserved.</p>
            <p>
              Questions about the application process? 
              <a href="mailto:admissions@insightpath.com" className="text-primary hover:underline ml-1">
                admissions@insightpath.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApplicationPage;