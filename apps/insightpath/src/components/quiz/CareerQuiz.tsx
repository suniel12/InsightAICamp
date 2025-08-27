import React, { useState, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Clock, DollarSign, Target, TrendingUp, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AssessmentState, MultiPathRecommendation, Question, GridQuestion, MultiSelectQuestion, CareerPath } from './types';
import { QUICK_ASSESSMENT, DETAILED_ASSESSMENT } from './data';
import { generateMultiPathRecommendation } from './logic';
import { QUIZ_CONFIG, BRAND_COLORS } from '@/constants/styles';

export const CareerQuiz = () => {
  const navigate = useNavigate();
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    tier: 1,
    currentQuestionId: 'q1',
    answers: {},
    questionPath: []
  });
  const [recommendation, setRecommendation] = useState<MultiPathRecommendation | null>(null);

  const currentQuestions = QUICK_ASSESSMENT;
  const currentQuestion = currentQuestions[assessmentState.currentQuestionId];
  
  // Quick assessment is always 5 questions
  const totalQuestions = QUIZ_CONFIG.TOTAL_QUICK_QUESTIONS;
  const currentProgress = assessmentState.questionPath.length + 1;

  const handleAnswer = useCallback((optionId: string | string[]) => {
    const newAnswers = { ...assessmentState.answers, [assessmentState.currentQuestionId]: optionId };
    const newPath = [...assessmentState.questionPath, assessmentState.currentQuestionId];
    
    if (assessmentState.tier === 1) {
      const question = currentQuestion as Question;
      const selectedOption = question.options.find(opt => opt.id === (Array.isArray(optionId) ? optionId[0] : optionId));
      const nextQuestionId = selectedOption?.nextQuestionId;
      
      if (!nextQuestionId) {
        // Quick assessment complete - show results immediately
        const quickRecommendation = generateMultiPathRecommendation(newAnswers, false);
        setRecommendation(quickRecommendation);
        setAssessmentState({
          ...assessmentState,
          answers: newAnswers,
          questionPath: newPath
        });
      } else {
        // Continue to next question
        setAssessmentState({
          ...assessmentState,
          currentQuestionId: nextQuestionId,
          answers: newAnswers,
          questionPath: newPath
        });
      }
    } else {
      // Detailed assessment - move to next question sequentially
      const detailedQuestionIds = Object.keys(DETAILED_ASSESSMENT);
      const currentIndex = detailedQuestionIds.indexOf(assessmentState.currentQuestionId);
      const nextQuestionId = detailedQuestionIds[currentIndex + 1];
      
      if (!nextQuestionId) {
        // Detailed assessment complete - generate recommendation
        const finalRecommendation = generateMultiPathRecommendation(newAnswers, true);
        setRecommendation(finalRecommendation);
        setAssessmentState({
          ...assessmentState,
          answers: newAnswers,
          questionPath: newPath,
          isDetailedComplete: true
        });
      } else {
        setAssessmentState({
          ...assessmentState,
          currentQuestionId: nextQuestionId,
          answers: newAnswers,
          questionPath: newPath
        });
      }
    }
  }, [assessmentState, currentQuestion]);

  const handleGridAnswer = useCallback((category: string, value: string) => {
    const currentAnswers = assessmentState.answers[assessmentState.currentQuestionId] as Record<string, string> || {};
    const newGridAnswers = { ...currentAnswers, [category]: value };
    
    // Update answers without advancing to next question
    setAssessmentState({
      ...assessmentState,
      answers: { ...assessmentState.answers, [assessmentState.currentQuestionId]: newGridAnswers }
    });
  }, [assessmentState]);

  // Initialize grid question with default "None" values
  const initializeGridQuestion = (gridQuestion: GridQuestion) => {
    const currentAnswers = assessmentState.answers[assessmentState.currentQuestionId] as Record<string, string> || {};
    
    // If no answers exist for this question, initialize all categories with "None"
    if (Object.keys(currentAnswers).length === 0) {
      const defaultAnswers: Record<string, string> = {};
      gridQuestion.categories.forEach(category => {
        defaultAnswers[category] = 'None';
      });
      
      setAssessmentState({
        ...assessmentState,
        answers: { ...assessmentState.answers, [assessmentState.currentQuestionId]: defaultAnswers }
      });
      
      return defaultAnswers;
    }
    
    return currentAnswers;
  };

  const handleMultiSelectAnswer = useCallback((optionId: string, checked: boolean) => {
    const currentAnswers = assessmentState.answers[assessmentState.currentQuestionId] as string[] || [];
    let newAnswers: string[] = [];
    
    if (checked) {
      newAnswers = [...currentAnswers, optionId];
    } else {
      newAnswers = currentAnswers.filter(id => id !== optionId);
    }
    
    // Update answers without advancing to next question
    setAssessmentState({
      ...assessmentState,
      answers: { ...assessmentState.answers, [assessmentState.currentQuestionId]: newAnswers }
    });
  }, [assessmentState]);

  // Removed progressive disclosure functionality

  const resetQuiz = useCallback(() => {
    setAssessmentState({
      tier: 1,
      currentQuestionId: 'q1',
      answers: {},
      questionPath: []
    });
    setRecommendation(null);
  }, []);

  // Removed progressive disclosure - quiz goes directly to results after 5 questions

  // Final Results Screen
  if (recommendation) {
    interface PathCardProps {
      path: CareerPath;
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      description: string;
    }

    const PathCard = memo(({ path, icon: Icon, title, description }: PathCardProps) => (
      <Card className="border-2 border-muted hover:border-primary/30 transition-colors h-full">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-lg">{title}</h4>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h5 className="font-semibold text-xl mb-3">{path.title}</h5>
              <p className="text-muted-foreground leading-relaxed">{path.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Salary Range</span>
                <div className="text-2xl font-bold text-primary mt-1">
                  ${path.salaryRange.min.toLocaleString()}-${path.salaryRange.max.toLocaleString()}
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Training Duration</span>
                <div className="text-2xl font-bold text-primary mt-1">{path.trainingDuration}</div>
              </div>
            </div>
            
            <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
              <span className="text-sm font-medium text-accent uppercase tracking-wide">Why This Path</span>
              <div className="mt-2 text-sm leading-relaxed">{path.reasoning}</div>
            </div>
            
          </div>
        </CardContent>
      </Card>
    ));

    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4">
        <Card className="card-glow">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl text-primary mb-4">Your Personalized Career Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="max-w-3xl mx-auto">
              <h4 className="font-semibold text-xl mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Your Personalized Insights
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {recommendation.personalizedInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {recommendation.skillsGapAnalysis && (
              <div className="max-w-3xl mx-auto mt-8 pt-8 border-t">
                <h4 className="font-semibold text-xl mb-6 flex items-center gap-3">
                  <Award className="w-6 h-6 text-primary" />
                  Skills Gap Analysis
                </h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-800 mb-3">Your Current Strengths</h5>
                    <div className="space-y-2">
                      {recommendation.skillsGapAnalysis.currentSkills.slice(0, 4).map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-3">Recommended Focus Areas</h5>
                    <div className="space-y-2">
                      {recommendation.skillsGapAnalysis.trainingRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-700">
                          <Target className="w-4 h-4" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Two potential roles for you</h3>
          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            <PathCard
              path={recommendation.fastestPath}
              icon={Clock}
              title="FASTEST PATH"
              description="Get employed quickly"
            />
            <PathCard
              path={recommendation.highestSalaryPath}
              icon={DollarSign}
              title="HIGHEST SALARY"
              description="Maximum earning potential"
            />
          </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h4 className="text-2xl font-bold mb-4">Ready to Transform Your Career?</h4>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have successfully transitioned into high-paying data center careers. 
              Our proven training program gets you job-ready in weeks, not years.
            </p>
            <div className="flex justify-center">
              <Button 
                className="btn-hero px-8 py-3 text-lg" 
                style={{ backgroundColor: BRAND_COLORS.PRIMARY, color: BRAND_COLORS.WHITE }}
                onClick={() => navigate('/application')}
              >
                Start Your Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Question Rendering
  const renderQuestion = () => {
    if (currentQuestion.type === 'grid') {
      const gridQuestion = currentQuestion as GridQuestion;
      const currentAnswers = initializeGridQuestion(gridQuestion);
      
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-6">{gridQuestion.text}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2"></th>
                  {gridQuestion.scaleOptions.map(option => (
                    <th key={option} className="text-center p-2 text-sm">{option}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridQuestion.categories.map(category => (
                  <tr key={category} className="border-t">
                    <td className="p-2 text-sm font-medium">{category}</td>
                    {gridQuestion.scaleOptions.map(option => (
                      <td key={option} className="text-center p-2">
                        <input
                          type="radio"
                          name={category}
                          value={option}
                          checked={currentAnswers[category] === option}
                          onChange={() => handleGridAnswer(category, option)}
                          className="w-4 h-4"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button 
            className="w-full mt-4"
            onClick={() => {
              // Advance to next question - grid is always complete with defaults
              handleAnswer(currentAnswers);
            }}
          >
            Continue
          </Button>
        </div>
      );
    }

    if (currentQuestion.type === 'multiselect') {
      const multiQuestion = currentQuestion as MultiSelectQuestion;
      const currentAnswers = assessmentState.answers[assessmentState.currentQuestionId] as string[] || [];
      
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-6">{multiQuestion.text}</h3>
          <div className="space-y-3">
            {multiQuestion.options.map((option) => (
              <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id={option.id}
                  checked={currentAnswers.includes(option.id)}
                  onCheckedChange={(checked) => handleMultiSelectAnswer(option.id, checked as boolean)}
                />
                <label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
          <Button 
            className="w-full mt-4"
            onClick={() => {
              const currentAnswers = assessmentState.answers[assessmentState.currentQuestionId] as string[] || [];
              handleAnswer(currentAnswers);
            }}
            disabled={(() => {
              const currentAnswers = assessmentState.answers[assessmentState.currentQuestionId] as string[] || [];
              return currentAnswers.length === 0;
            })()}
          >
            Continue
          </Button>
        </div>
      );
    }

    // Regular question
    const regularQuestion = currentQuestion as Question;
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-6">{regularQuestion.text}</h3>
        <div className="space-y-3">
          {regularQuestion.options.map((option) => (
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
      </div>
    );
  };

  // Main Question Screen
  return (
    <Card className="card-glow max-w-2xl mx-auto" role="form" aria-labelledby="quiz-title">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle id="quiz-title">Career Discovery Assessment</CardTitle>
          <Badge variant="secondary" aria-label={`Question ${currentProgress} of ${totalQuestions}`}>
            {currentProgress} of {totalQuestions}
          </Badge>
        </div>
        <div 
          className="w-full bg-muted rounded-full h-2" 
          role="progressbar" 
          aria-valuenow={currentProgress} 
          aria-valuemin={1} 
          aria-valuemax={totalQuestions}
          aria-label={`Quiz progress: ${currentProgress} of ${totalQuestions} questions completed`}
        >
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(currentProgress / totalQuestions) * 100}%`,
              transition: `width ${QUIZ_CONFIG.PROGRESS_BAR_TRANSITION}ms ease-in-out`
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div role="group" aria-labelledby="quiz-title">
          {renderQuestion()}
        </div>
      </CardContent>
    </Card>
  );
};