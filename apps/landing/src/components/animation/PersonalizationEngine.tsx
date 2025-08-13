import React, { useMemo } from 'react';

// Enhanced personalization engine based on master script metadata
export interface UserProfile {
  audience: string[];
  skipSegments?: string[];
  preferredSpeed?: number;
  completedModules?: string[];
  learningPath?: 'beginner' | 'it_support' | 'software_engineer' | 'datacenter_tech' | 'manager';
  interactionPreferences?: {
    showQuizzes: boolean;
    showAnnotations: boolean;
    enableInteractivity: boolean;
  };
}

export interface SegmentMetadata {
  id: string;
  audience: string[];
  duration: number;
  dependency?: string;
  canSkipIf?: string[];
  prerequisiteKnowledge?: string[];
  learningObjective?: string;
  quizCheckpoint?: boolean;
  complexity?: 'basic' | 'intermediate' | 'advanced';
  optional?: boolean;
}

// Personalization decision engine
export class PersonalizationEngine {
  private userProfile: UserProfile;

  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile;
  }

  // Determine if a segment should be shown
  shouldShowSegment(segmentMeta: SegmentMetadata): boolean {
    // Check explicit skip list
    if (this.userProfile.skipSegments?.includes(segmentMeta.id)) {
      return false;
    }

    // Check canSkipIf conditions
    if (segmentMeta.canSkipIf?.some(role => this.userProfile.audience.includes(role))) {
      return false;
    }

    // Check audience targeting
    if (segmentMeta.audience.length > 0 && !segmentMeta.audience.includes('ALL')) {
      const hasMatchingAudience = segmentMeta.audience.some(audience => 
        this.userProfile.audience.includes(audience)
      );
      if (!hasMatchingAudience && !segmentMeta.optional) {
        return false;
      }
    }

    // Check prerequisites
    if (segmentMeta.prerequisiteKnowledge) {
      // In a full implementation, this would check completed modules
      // For now, we assume prerequisites are met
    }

    return true;
  }

  // Get personalized duration based on user profile
  getPersonalizedDuration(baseDuration: number, segmentMeta: SegmentMetadata): number {
    let multiplier = 1;

    // Adjust based on learning path
    switch (this.userProfile.learningPath) {
      case 'beginner':
        multiplier = 1.2; // 20% longer for more explanation
        break;
      case 'manager':
        multiplier = 0.7; // 30% shorter, focus on key points
        break;
      case 'software_engineer':
        multiplier = 0.8; // 20% shorter, skip basics
        break;
      default:
        multiplier = 1;
    }

    // Apply user's preferred speed
    if (this.userProfile.preferredSpeed) {
      multiplier /= this.userProfile.preferredSpeed;
    }

    return Math.round(baseDuration * multiplier);
  }

  // Determine if quiz checkpoints should be shown
  shouldShowQuiz(segmentMeta: SegmentMetadata): boolean {
    if (!segmentMeta.quizCheckpoint) return false;
    if (!this.userProfile.interactionPreferences?.showQuizzes) return false;
    
    // Skip quizzes for advanced users on basic topics
    if (segmentMeta.complexity === 'basic' && 
        this.userProfile.audience.includes('SOFTWARE_ENGINEER')) {
      return false;
    }

    return true;
  }

  // Get content depth level
  getContentDepth(segmentMeta: SegmentMetadata): 'overview' | 'standard' | 'detailed' {
    if (this.userProfile.learningPath === 'manager') return 'overview';
    if (this.userProfile.learningPath === 'beginner') return 'detailed';
    return 'standard';
  }
}

// React hook for using personalization in components
export const usePersonalization = (userProfile: UserProfile) => {
  const engine = useMemo(() => new PersonalizationEngine(userProfile), [userProfile]);
  
  return {
    shouldShowSegment: (segmentMeta: SegmentMetadata) => engine.shouldShowSegment(segmentMeta),
    getPersonalizedDuration: (duration: number, segmentMeta: SegmentMetadata) => 
      engine.getPersonalizedDuration(duration, segmentMeta),
    shouldShowQuiz: (segmentMeta: SegmentMetadata) => engine.shouldShowQuiz(segmentMeta),
    getContentDepth: (segmentMeta: SegmentMetadata) => engine.getContentDepth(segmentMeta),
  };
};

// Quiz checkpoint component
export const QuizCheckpoint: React.FC<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  onComplete: (correct: boolean) => void;
  delay?: number;
  duration?: number;
}> = ({ question, options, correctAnswer, explanation, onComplete, delay = 0, duration = 300 }) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [showExplanation, setShowExplanation] = React.useState(false);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    onComplete(answerIndex === correctAnswer);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0,0,0,0.95)',
        border: '2px solid #0066CC',
        borderRadius: 12,
        padding: 24,
        maxWidth: 600,
        width: '90%',
      }}
    >
      <h3 style={{ color: 'white', fontSize: 20, marginBottom: 16 }}>
        📝 Knowledge Check
      </h3>
      
      <p style={{ color: '#ccc', fontSize: 16, marginBottom: 20, lineHeight: 1.5 }}>
        {question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedAnswer === index 
                ? (index === correctAnswer ? '#28a745' : '#dc3545')
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              cursor: selectedAnswer !== null ? 'default' : 'pointer',
              fontSize: 14,
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            {String.fromCharCode(65 + index)}. {option}
          </button>
        ))}
      </div>

      {showExplanation && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: 'rgba(0,102,204,0.2)',
            borderRadius: 6,
            border: '1px solid #0066CC',
          }}
        >
          <p style={{ color: '#ccc', fontSize: 14, margin: 0, lineHeight: 1.4 }}>
            <strong style={{ color: '#0066CC' }}>Explanation:</strong> {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

// Default user profiles for testing
export const DEFAULT_PROFILES: Record<string, UserProfile> = {
  beginner: {
    audience: ['BEGINNER'],
    learningPath: 'beginner',
    interactionPreferences: {
      showQuizzes: true,
      showAnnotations: true,
      enableInteractivity: true,
    },
  },
  itSupport: {
    audience: ['IT_SUPPORT'],
    learningPath: 'it_support',
    skipSegments: [],
    interactionPreferences: {
      showQuizzes: true,
      showAnnotations: true,
      enableInteractivity: true,
    },
  },
  softwareEngineer: {
    audience: ['SOFTWARE_ENGINEER'],
    learningPath: 'software_engineer',
    canSkipIf: ['M3.1_BASICS_001'],
    interactionPreferences: {
      showQuizzes: false,
      showAnnotations: false,
      enableInteractivity: false,
    },
  },
  manager: {
    audience: ['MANAGER', 'CTO'],
    learningPath: 'manager',
    preferredSpeed: 1.5,
    interactionPreferences: {
      showQuizzes: false,
      showAnnotations: false,
      enableInteractivity: false,
    },
  },
  returningViewer: {
    audience: ['ALL'],
    skipSegments: ['M3.1_INTRO_001'],
    preferredSpeed: 1.2,
    interactionPreferences: {
      showQuizzes: false,
      showAnnotations: false,
      enableInteractivity: false,
    },
  },
};