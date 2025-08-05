import React from 'react';
import { CareerQuiz } from '../quiz/CareerQuiz';

export const QuizSection: React.FC = () => {
  return (
    <section className="py-20 gradient-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Is This Your Next Career Move?
          </h2>
          <p className="text-xl text-muted-foreground">Find Out in 30 Seconds</p>
        </div>
        <CareerQuiz />
      </div>
    </section>
  );
};