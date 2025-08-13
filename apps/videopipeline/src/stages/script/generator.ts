import OpenAI from 'openai';
import { SlideAnalysis, UserContext } from '../analysis/visual-analyzer';

export interface ScriptSegment {
  slideNumber: number;
  content: string;
  duration: number; // seconds
  visualHints: string[];
  concepts: string[];
  potentialEnhancements: {
    type: 'video' | 'image' | 'none';
    reasoning: string;
  };
}

export interface Script {
  segments: ScriptSegment[];
  totalDuration: number;
  tone: 'professional' | 'casual' | 'academic';
  pacing: 'slow' | 'normal' | 'fast';
}

export class ScriptGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateScript(
    slideAnalyses: SlideAnalysis[],
    userContext: UserContext
  ): Promise<Script> {
    console.log('Generating personalized script...');
    
    // Determine appropriate tone and pacing based on user context
    const { tone, pacing } = this.determineStyle(userContext);
    
    // Generate script segments for each slide
    const segments: ScriptSegment[] = [];
    let totalDuration = 0;
    
    for (const analysis of slideAnalyses) {
      const segment = await this.generateSegment(
        analysis,
        userContext,
        slideAnalyses,
        tone,
        pacing
      );
      segments.push(segment);
      totalDuration += segment.duration;
    }
    
    // Ensure smooth transitions between segments
    const smoothedSegments = await this.smoothTransitions(segments);
    
    return {
      segments: smoothedSegments,
      totalDuration,
      tone,
      pacing
    };
  }

  private determineStyle(userContext: UserContext): { 
    tone: 'professional' | 'casual' | 'academic';
    pacing: 'slow' | 'normal' | 'fast';
  } {
    let tone: 'professional' | 'casual' | 'academic' = 'professional';
    let pacing: 'slow' | 'normal' | 'fast' = 'normal';
    
    // Determine tone based on context
    if (userContext.industry.toLowerCase().includes('academic') || 
        userContext.industry.toLowerCase().includes('education')) {
      tone = 'academic';
    } else if (userContext.expertise === 'beginner') {
      tone = 'casual';
    }
    
    // Determine pacing based on expertise
    if (userContext.expertise === 'beginner') {
      pacing = 'slow';
    } else if (userContext.expertise === 'expert') {
      pacing = 'fast';
    }
    
    return { tone, pacing };
  }

  private async generateSegment(
    analysis: SlideAnalysis,
    userContext: UserContext,
    allSlides: SlideAnalysis[],
    tone: string,
    pacing: string
  ): Promise<ScriptSegment> {
    const prompt = `Generate a narration script segment for this slide.

SLIDE CONTENT:
Title: ${analysis.title}
Key Points: ${analysis.keyPoints.join(', ')}
Visual Elements: ${analysis.visualElements.join(', ')}
Concepts: ${analysis.concepts.join(', ')}
Narrative Focus: ${analysis.narrativeFocus}
Complexity: ${analysis.complexity}

USER CONTEXT:
Background: ${userContext.background}
Expertise: ${userContext.expertise}
Industry: ${userContext.industry}
Goals: ${userContext.goals}

STYLE:
Tone: ${tone}
Pacing: ${pacing}

REQUIREMENTS:
1. Create natural, conversational narration
2. Adapt complexity to user's expertise level
3. Focus on concepts the user needs to understand
4. Identify if this content would benefit from:
   - AI-generated video (for things never seen before)
   - AI-generated image (for additional context)
   - Neither (slide is sufficient)
5. Estimate speaking duration (${pacing === 'slow' ? '150' : pacing === 'fast' ? '180' : '160'} words per minute)

OUTPUT FORMAT:
{
  "narration": "The actual narration text",
  "duration": number (in seconds),
  "visualHints": ["hints about what could be shown"],
  "concepts": ["key concepts being explained"],
  "enhancement": {
    "type": "video|image|none",
    "reasoning": "why this enhancement would help"
  }
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator who adapts content to the learner\'s background.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    try {
      // Remove markdown code block if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsed = JSON.parse(cleanContent);
      
      return {
        slideNumber: analysis.slideNumber,
        content: parsed.narration,
        duration: parsed.duration || 30,
        visualHints: parsed.visualHints || [],
        concepts: parsed.concepts || analysis.concepts,
        potentialEnhancements: {
          type: parsed.enhancement?.type || 'none',
          reasoning: parsed.enhancement?.reasoning || ''
        }
      };
    } catch (error) {
      // Fallback if JSON parsing fails
      console.error('Error parsing script segment:', error);
      
      return {
        slideNumber: analysis.slideNumber,
        content: content,
        duration: 30,
        visualHints: [],
        concepts: analysis.concepts,
        potentialEnhancements: {
          type: 'none',
          reasoning: 'Could not determine enhancement'
        }
      };
    }
  }

  private async smoothTransitions(segments: ScriptSegment[]): Promise<ScriptSegment[]> {
    // Ensure smooth transitions between segments
    const smoothed: ScriptSegment[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      
      if (next) {
        // Add transition phrases if needed
        const needsTransition = !current.content.match(/Now|Next|Let's|Moving/i);
        
        if (needsTransition && i < segments.length - 1) {
          // Add a natural transition to the end of current segment
          const transitionPhrases = [
            `Now let's look at ${next.concepts[0] || 'the next topic'}.`,
            `Moving forward, `,
            `Building on this, `,
            `Next, we'll explore `,
            `This brings us to `
          ];
          
          const transition = transitionPhrases[i % transitionPhrases.length];
          current.content = current.content.trimEnd() + ' ' + transition;
          current.duration += 2; // Add 2 seconds for transition
        }
      }
      
      smoothed.push(current);
    }
    
    return smoothed;
  }

  async generateSummaryIntro(
    slideAnalyses: SlideAnalysis[],
    userContext: UserContext
  ): Promise<string> {
    // Generate an introduction that sets context
    const topics = slideAnalyses.map(s => s.title).join(', ');
    
    const prompt = `Create a brief introduction for a presentation about: ${topics}

USER CONTEXT:
${JSON.stringify(userContext, null, 2)}

Make it personal and relevant to their background. Maximum 3 sentences.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content || 'Welcome to this presentation.';
  }
}