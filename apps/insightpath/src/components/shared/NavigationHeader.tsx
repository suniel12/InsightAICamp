import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BRAND_COLORS } from '@/constants/styles';
import { cn } from '@/lib/utils';

interface NavigationHeaderProps {
  className?: string;
  onShowHowItWorks?: () => void;
}

export const NavigationHeader = ({ className, onShowHowItWorks }: NavigationHeaderProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={cn("border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50", className)}>
      <nav aria-label="Primary" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3" aria-label="Go to homepage">
              <img
                src="/favicon.png"
                alt="InsightPath Logo"
                className="h-8 w-8 object-contain"
                decoding="async"
              />
              <span className="hidden sm:block text-xl font-bold" style={{ color: BRAND_COLORS.PRIMARY }}>
                InsightPath
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/features"
                className="font-bold hover:opacity-80 transition-opacity"
                style={{ color: BRAND_COLORS.PRIMARY }}
              >
                Features
              </Link>
              <Link
                to="/use-cases"
                className="font-bold hover:opacity-80 transition-opacity"
                style={{ color: BRAND_COLORS.PRIMARY }}
              >
                Use Cases
              </Link>
              <Link
                to="/pricing"
                className="font-bold hover:opacity-80 transition-opacity"
                style={{ color: BRAND_COLORS.PRIMARY }}
              >
                Pricing
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Show Jobs, Blog and Demo on mobile, hide on desktop (they're in the left nav) */}
            <div className="flex md:hidden items-center space-x-2">
              <Link
                to="/features"
                className="font-bold hover:opacity-80 transition-opacity text-sm"
                style={{ color: BRAND_COLORS.PRIMARY }}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="font-bold hover:opacity-80 transition-opacity text-sm"
                style={{ color: BRAND_COLORS.PRIMARY }}
              >
                Pricing
              </Link>
            </div>
            
            {/* Hide "How it Works" on mobile */}
            {onShowHowItWorks && location.pathname === '/' && (
              <button 
                onClick={onShowHowItWorks}
                className="hidden sm:block text-sm font-medium hover:opacity-80 transition-opacity text-slate-300" 
              >
                How it Works
              </button>
            )}
            
            <Button
              className="text-white font-bold text-sm sm:text-base"
              style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
              onClick={() => {
                const comparisonSection = document.getElementById('comparison');
                if (comparisonSection) {
                  comparisonSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};