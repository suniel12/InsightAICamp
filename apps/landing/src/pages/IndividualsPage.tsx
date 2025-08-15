import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';

// Import section components
import { HeroSection } from '../components/sections/HeroSection';
import { QuizSection } from '../components/sections/QuizSection';
import { MarketOpportunitySection } from '../components/sections/MarketOpportunitySection';
import { GuaranteeSection } from '../components/sections/GuaranteeSection';
import { FAQSection } from '../components/sections/FAQSection';
import { FinalCTASection } from '../components/sections/FinalCTASection';

// Import modal components
import { HowItWorksModal } from '../components/modals/HowItWorksModal';

// Import quiz component
import { CareerQuiz } from '../components/quiz/CareerQuiz';

const IndividualsPage = () => {
  const [showQuiz, setShowQuiz] = useState(false);    
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onShowHowItWorks={() => setShowHowItWorks(true)} />
      
      <HeroSection 
        onShowHowItWorks={() => setShowHowItWorks(true)} 
      />
      
      <main id="main-content" role="main">
        <QuizSection />
        <GuaranteeSection />
        <MarketOpportunitySection />
        <FAQSection />
        <FinalCTASection />
      </main>

      {/* Career Quiz Modal */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Career Discovery Assessment</DialogTitle>
          </DialogHeader>
          <CareerQuiz />
        </DialogContent>
      </Dialog>

      {/* How It Works Modal */}
      <HowItWorksModal isOpen={showHowItWorks} onClose={setShowHowItWorks} />
      
      <Footer />
    </div>
  );
};

export default IndividualsPage;