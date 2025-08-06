import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import section components
import { HeroSection } from '../components/sections/HeroSection';
import { QuizSection } from '../components/sections/QuizSection';
import { MarketOpportunitySection } from '../components/sections/MarketOpportunitySection';
// import { CurriculumSection } from '../components/sections/CurriculumSection';
// import { SuccessStoriesSection } from '../components/sections/SuccessStoriesSection';
import { GuaranteeSection } from '../components/sections/GuaranteeSection';
// import { UrgencySection } from '../components/sections/UrgencySection';
import { FAQSection } from '../components/sections/FAQSection';
import { FinalCTASection } from '../components/sections/FinalCTASection';

// Import modal components
import { HowItWorksModal } from '../components/modals/HowItWorksModal';

// Import quiz component
import { CareerQuiz } from '../components/quiz/CareerQuiz';






const LandingPage = () => {
  const [seatsRemaining, setSeatsRemaining] = useState(47);
  const [showQuiz, setShowQuiz] = useState(false);    
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Simulate live activity
  useEffect(() => {
    const interval = setInterval(() => {
      setSeatsRemaining(prev => Math.max(20, prev - Math.floor(Math.random() * 2)));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection 
        onStartQuiz={() => setShowQuiz(true)} 
        onShowHowItWorks={() => setShowHowItWorks(true)} 
      />
      <QuizSection />
      <MarketOpportunitySection />
      {/* <CurriculumSection /> */}
      {/* <SuccessStoriesSection /> */}
      <GuaranteeSection />
      {/* <UrgencySection seatsRemaining={seatsRemaining} /> */}
      <FAQSection />
      <FinalCTASection onStartQuiz={() => setShowQuiz(true)} />

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
    </div>
  );
};

export default LandingPage;