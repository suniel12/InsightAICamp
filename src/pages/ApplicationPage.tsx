import { StreamlinedApplicationForm } from '../components/forms/StreamlinedApplicationForm';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BRAND_COLORS } from '@/constants/styles';

const ApplicationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50" role="banner">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between" role="navigation" aria-label="Application page navigation">
            {/* Back Button and Academy Name */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-muted/50"
                aria-label="Go back to homepage"
              >
                <ArrowLeft className="w-4 h-4" color={BRAND_COLORS.PRIMARY} strokeWidth={3} aria-hidden="true" />
              </Button>
              
              <div className="flex items-center gap-3" aria-label="GigaWatt Academy">
                <img 
                  src="/favicon.png" 
                  alt="GigaWatt Academy Logo" 
                  className="w-8 h-8 object-contain"
                />
                <div className="font-semibold text-xl" style={{ color: BRAND_COLORS.PRIMARY }}>
                  GigaWatt Academy
                </div>
              </div>
            </div>

            {/* How it Works */}
            <button 
              className="font-semibold text-xl hover:opacity-80 transition-opacity cursor-pointer" 
              style={{ color: BRAND_COLORS.PRIMARY }}
              aria-label="Learn how GigaWatt Academy training works"
            >
              How it Works
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <StreamlinedApplicationForm 
          onClose={() => navigate('/')} 
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/30 mt-24" role="contentinfo">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">© 2025 GigaWatt Academy. All rights reserved.</p>
            <p>
              Questions about the application process? 
              <a 
                href="mailto:admissions@gigawattacademy.com" 
                className="text-primary hover:underline ml-1"
                aria-label="Email admissions team at admissions@gigawattacademy.com"
              >
                admissions@gigawattacademy.com
              </a>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ApplicationPage;