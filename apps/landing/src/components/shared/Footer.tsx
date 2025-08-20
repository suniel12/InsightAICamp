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
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/favicon.png"
                alt="GigaWatt Academy Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold" style={{ color: BRAND_COLORS.PRIMARY }}>
                GigaWatt Academy
              </span>
            </div>
            <p className="text-sm text-slate-400">
            The Talent Engine for the AI Economy
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/jobs" className="text-slate-400 hover:text-primary text-sm transition-colors">
                Browse Jobs
              </Link>
              <Link to="/blog" className="text-slate-400 hover:text-primary text-sm transition-colors">
                Read Blog
              </Link>
              <Link to="/demo" className="text-slate-400 hover:text-primary text-sm transition-colors">
                View Demo
              </Link>
              <a 
                href="#career-quiz" 
                onClick={handleCareerAssessmentClick}
                className="text-slate-400 hover:text-primary text-sm transition-colors cursor-pointer"
              >
                Career Assessment
              </a>
            </div>
          </div>
          
          {/* Company section - disabled for now
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-primary text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a href="mailto:contact@gigawattacademy.com" className="text-slate-400 hover:text-primary text-sm transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary text-sm transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          */}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
            <p className="text-sm text-slate-400 text-center md:text-left">
              © 2025 <span className="font-semibold" style={{ color: BRAND_COLORS.PRIMARY }}>GigaWatt Academy</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/privacy" className="text-slate-400 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-600">•</span>
              <Link to="/terms" className="text-slate-400 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};