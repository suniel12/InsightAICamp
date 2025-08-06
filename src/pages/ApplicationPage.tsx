import React from 'react';
import { StreamlinedApplicationForm } from '../components/forms/StreamlinedApplicationForm';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplicationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button and Academy Name */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-muted/50"
              >
                <ArrowLeft className="w-4 h-4" color="#1F5F5F" strokeWidth={3} />
              </Button>
              
              <div className="font-semibold text-xl" style={{ color: '#1F5F5F' }}>
                GigaWatt Academy
              </div>
            </div>

            {/* How it Works */}
            <button 
              className="font-semibold text-xl hover:opacity-80 transition-opacity cursor-pointer" 
              style={{ color: '#1F5F5F' }}
            >
              How it Works
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <StreamlinedApplicationForm 
          onClose={() => navigate('/')} 
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/30 mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">© 2025 GigaWatt Academy. All rights reserved.</p>
            <p>
              Questions about the application process? 
              <a href="mailto:admissions@gigawattacademy.com" className="text-primary hover:underline ml-1">
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