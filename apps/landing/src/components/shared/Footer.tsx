import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BRAND_COLORS } from '@/constants/styles';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCareerAssessmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      // Navigate to home page first, then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('career-quiz');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById('career-quiz');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src="/favicon.png"
                alt="GigaWatt Academy Logo"
                className="h-7 w-7 object-contain"
              />
              <span className="text-lg font-bold" style={{ color: BRAND_COLORS.PRIMARY }}>
                GigaWatt Academy
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              The Talent Engine for the AI Economy
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6 md:gap-8">
            <Link to="/jobs" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Browse Jobs
            </Link>
            <Link to="/blog" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Read Blog
            </Link>
            <Link to="/demo" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              View Demo
            </Link>
            <a 
              href="#career-quiz" 
              onClick={handleCareerAssessmentClick}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Career Assessment
            </a>
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 text-center md:text-left">
              © 2025 GigaWatt Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs">
              <Link to="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};