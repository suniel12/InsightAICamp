import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { QuizState, RoleRecommendation } from './types';
import { QUESTION_FLOW } from './data';
import { determineRecommendedRole } from './logic';

export const CareerQuiz = () => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionId: 'q1',
    answers: {},
    questionPath: [],
    isComplete: false
  });
  const [recommendation, setRecommendation] = useState<RoleRecommendation | null>(null);

  const currentQuestion = QUESTION_FLOW[quizState.currentQuestionId];
  const progress = quizState.questionPath.length + 1;
  const totalQuestions = 5;

  const handleAnswer = (optionId: string) => {
    const newAnswers = { ...quizState.answers, [quizState.currentQuestionId]: optionId };
    const newPath = [...quizState.questionPath, quizState.currentQuestionId];
    
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    const nextQuestionId = selectedOption?.nextQuestionId;
    
    if (!nextQuestionId) {
      // Quiz complete - generate recommendation
      const finalRecommendation = determineRecommendedRole(newAnswers);
      setRecommendation(finalRecommendation);
      setQuizState({
        ...quizState,
        answers: newAnswers,
        questionPath: newPath,
        isComplete: true
      });
    } else {
      // Continue to next question
      setQuizState({
        currentQuestionId: nextQuestionId,
        answers: newAnswers,
        questionPath: newPath,
        isComplete: false
      });
    }
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestionId: 'q1',
      answers: {},
      questionPath: [],
      isComplete: false
    });
    setRecommendation(null);
  };

  if (quizState.isComplete && recommendation) {
    return (
      <Card className="card-glow max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary">{Math.round(recommendation.confidenceScore * 100)}% Success Match</CardTitle>
          <p className="text-muted-foreground">Based on your profile, you're an excellent fit for our program</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Recommended: {recommendation.title}</h3>
            <p className="text-muted-foreground mb-6">
              {recommendation.description}
            </p>
            <div className="text-sm text-muted-foreground italic mb-4">
              {recommendation.reasoning}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{recommendation.programDuration}</div>
              <div className="text-sm text-muted-foreground">Program Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">${Math.round((recommendation.salaryRange.min + recommendation.salaryRange.max) / 2 / 1000)}K</div>
              <div className="text-sm text-muted-foreground">Average Salary</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-center">Why This Role Fits You:</h4>
            <ul className="space-y-1">
              {recommendation.personalizedInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4">
            <Button 
              className="btn-hero flex-1" 
              style={{ backgroundColor: '#1F5F5F', color: 'white' }}
              onClick={() => navigate('/application')}
            >
              Start Your Application
            </Button>
            <Button variant="outline" onClick={resetQuiz}>Retake Quiz</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Career Discovery Assessment</CardTitle>
          <Badge variant="secondary">{progress} of {totalQuestions}</Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(progress / totalQuestions) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold mb-6">{currentQuestion.text}</h3>
        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-primary hover:text-primary-foreground transition-smooth group"
              onClick={() => handleAnswer(option.id)}
            >
              <div className="w-full">
                <div className="font-semibold mb-1 whitespace-normal break-words">{option.text}</div>
                {option.description && (
                  <div className="text-sm text-muted-foreground group-hover:text-primary-foreground/80 whitespace-normal break-words leading-relaxed">
                    {option.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};