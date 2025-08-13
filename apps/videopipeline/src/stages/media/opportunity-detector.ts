import OpenAI from 'openai';
import { ScriptSegment } from '../script/generator';
import { SlideAnalysis, UserContext } from '../analysis/visual-analyzer';

export interface AIMediaOpportunity {
  slideNumber: number;
  type: 'video' | 'image';
  priority: 'essential' | 'high' | 'medium' | 'low';
  score: number; // 0-1
  reasoning: string;
  prompt: string;
  duration?: number; // for videos
  insertionPoint: 'replace' | 'overlay' | 'after';
  description: string; // What the media will show
}

export class AIMediaOpportunityDetector {
  private openai: OpenAI;
  private maxVideos: number;
  private maxPerSlide: number;

  constructor(apiKey: string, maxVideos: number = 4, maxPerSlide: number = 1) {
    this.openai = new OpenAI({ apiKey });
    this.maxVideos = maxVideos;
    this.maxPerSlide = maxPerSlide;
  }

  async detectOpportunities(
    scriptSegments: ScriptSegment[],
    slideAnalyses: SlideAnalysis[],
    userContext: UserContext
  ): Promise<AIMediaOpportunity[]> {
    console.log('Detecting AI media opportunities...');
    
    const opportunities: AIMediaOpportunity[] = [];
    
    // Analyze each slide for opportunities
    for (let i = 0; i < scriptSegments.length; i++) {
      const segment = scriptSegments[i];
      const analysis = slideAnalyses[i];
      
      const opportunity = await this.analyzeSlideOpportunity(
        segment,
        analysis,
        userContext
      );
      
      if (opportunity && opportunity.score > 0.7) {
        opportunities.push(opportunity);
      }
    }
    
    // Sort by score and limit to maxVideos
    const selectedOpportunities = this.selectBestOpportunities(opportunities);
    
    console.log(`  Selected ${selectedOpportunities.length} AI media opportunities`);
    
    return selectedOpportunities;
  }

  private async analyzeSlideOpportunity(
    segment: ScriptSegment,
    analysis: SlideAnalysis,
    userContext: UserContext
  ): Promise<AIMediaOpportunity | null> {
    const prompt = `Analyze if this slide would benefit from AI-generated media (video or image).

SLIDE CONTENT:
Title: ${analysis.title}
Key Points: ${analysis.keyPoints.join(', ')}
Concepts: ${analysis.concepts.join(', ')}
Complexity: ${analysis.complexity}

NARRATION:
${segment.content}

USER CONTEXT:
Background: ${userContext.background}
Expertise: ${userContext.expertise}
Industry: ${userContext.industry}

CRITICAL RULES:
1. ONLY recommend video for things the user has NEVER seen and cannot imagine from text
2. Videos should show physical spaces, processes in motion, or transformations
3. Images can supplement understanding but shouldn't duplicate slide content
4. Consider user's ${userContext.expertise} level - beginners need more visual help

EXAMPLES OF GOOD VIDEO OPPORTUNITIES:
- "Inside a data center" for someone who's never been in one
- "How cooling systems work" showing actual equipment in operation
- "Scale of global infrastructure" showing massive server farms
- "Manufacturing process" showing assembly line in action

EXAMPLES OF BAD VIDEO OPPORTUNITIES:
- Statistics or numbers (better as charts)
- Definitions (better as text)
- Abstract concepts (better as diagrams)
- Things already clear from the slide

Evaluate and respond in JSON:
{
  "recommend": true/false,
  "type": "video" or "image",
  "score": 0.0-1.0 (confidence this adds unique value),
  "priority": "essential|high|medium|low",
  "reasoning": "Why this specific media adds unique value",
  "prompt": "Detailed prompt for Runway (video) or DALL-E (image)",
  "duration": 3-7 (seconds, for video only),
  "description": "What the viewer will see",
  "insertionPoint": "replace|overlay|after"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying when AI-generated media adds genuine educational value. Be selective - only recommend when it truly enhances understanding.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 80000
      });

      const content = response.choices[0].message.content;
      if (!content) return null;

      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const result = JSON.parse(cleanContent);
      
      if (!result.recommend || result.score < 0.7) {
        return null;
      }

      return {
        slideNumber: analysis.slideNumber,
        type: result.type,
        priority: result.priority,
        score: result.score,
        reasoning: result.reasoning,
        prompt: this.enhancePrompt(result.prompt, result.type),
        duration: result.duration,
        insertionPoint: result.insertionPoint,
        description: result.description
      };
    } catch (error) {
      console.error(`Error analyzing slide ${analysis.slideNumber}:`, error);
      return null;
    }
  }

  private enhancePrompt(basePrompt: string, type: 'video' | 'image'): string {
    if (type === 'video') {
      // Enhance prompt for Runway Gen-3
      return `${basePrompt}

Style: Cinematic, professional, high-quality
Camera: Smooth movement, steady shots
Lighting: Well-lit, clear visibility
Quality: 4K, photorealistic
Avoid: Text overlays, logos, watermarks`;
    } else {
      // Enhance prompt for image generation
      return `${basePrompt}

Style: Professional, clean, educational
Quality: High-resolution, detailed
Composition: Clear focal point, good contrast
Avoid: Text, logos, cluttered backgrounds`;
    }
  }

  private selectBestOpportunities(
    opportunities: AIMediaOpportunity[]
  ): AIMediaOpportunity[] {
    // Sort by score and priority
    const sorted = opportunities.sort((a, b) => {
      // Priority weight
      const priorityWeight = {
        'essential': 4,
        'high': 3,
        'medium': 2,
        'low': 1
      };
      
      const aWeight = a.score * priorityWeight[a.priority];
      const bWeight = b.score * priorityWeight[b.priority];
      
      return bWeight - aWeight;
    });
    
    // Select top opportunities
    const selected: AIMediaOpportunity[] = [];
    const slidesWithMedia = new Set<number>();
    
    for (const opp of sorted) {
      // Check if we've reached max videos
      if (selected.filter(o => o.type === 'video').length >= this.maxVideos) {
        if (opp.type === 'video') continue;
      }
      
      // Check if this slide already has media
      if (slidesWithMedia.has(opp.slideNumber)) {
        continue; // Skip if slide already has media (maxPerSlide = 1)
      }
      
      selected.push(opp);
      slidesWithMedia.add(opp.slideNumber);
    }
    
    // Sort by slide number for chronological order
    return selected.sort((a, b) => a.slideNumber - b.slideNumber);
  }

  async generateRunwayPrompts(
    opportunities: AIMediaOpportunity[]
  ): Promise<Map<number, string>> {
    const prompts = new Map<number, string>();
    
    for (const opp of opportunities) {
      if (opp.type === 'video') {
        const runwayPrompt = `
RUNWAY GEN-3 PROMPT:
${opp.prompt}

Duration: ${opp.duration} seconds
Aspect Ratio: 16:9
Resolution: 1920x1080

IMPORTANT: Create smooth, professional footage suitable for educational content.`;
        
        prompts.set(opp.slideNumber, runwayPrompt);
      }
    }
    
    return prompts;
  }
}