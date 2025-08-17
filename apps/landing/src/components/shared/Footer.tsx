import { Link } from 'react-router-dom';
import { BRAND_COLORS } from '@/constants/styles';

export const Footer = () => {
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/" className="text-slate-400 hover:text-primary text-sm transition-colors">
                Career Programs
              </Link>
              <Link to="/jobs" className="text-slate-400 hover:text-primary text-sm transition-colors">
                Browse Jobs
              </Link>
              <Link to="/application" className="text-slate-400 hover:text-primary text-sm transition-colors">
                Apply Now
              </Link>
              <Link to="/demo" className="text-slate-400 hover:text-primary text-sm transition-colors">
                View Demo
              </Link>
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
          <p className="text-center text-sm text-slate-400">
            © 2025 <span className="font-semibold" style={{ color: BRAND_COLORS.PRIMARY }}>GigaWatt Academy</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};