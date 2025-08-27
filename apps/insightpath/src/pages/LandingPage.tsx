import { useState } from 'react';

// Import section components
import { HeroSection } from '../components/sections/HeroSection';
import { ComparisonSection } from '../components/sections/ComparisonSection';
import { HowItWorksSection } from '../components/sections/HowItWorksSection';
import { UseCasesSection } from '../components/sections/UseCasesSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { FAQSection } from '../components/sections/FAQSection';
import { FinalCTASection } from '../components/sections/FinalCTASection';

// Import modal components
import { HowItWorksModal } from '../components/modals/HowItWorksModal';

const LandingPage = () => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        onShowHowItWorks={() => setShowHowItWorks(true)} 
      />
      <main id="main-content" role="main">
        <ComparisonSection />
        <HowItWorksSection />
        <UseCasesSection />
        <FeaturesSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      {/* How It Works Modal */}
      <HowItWorksModal isOpen={showHowItWorks} onClose={setShowHowItWorks} />
    </div>
  );
};

export default LandingPage;