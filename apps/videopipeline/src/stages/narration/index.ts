import { CourseContent, NarrationScript, VideoOpportunity } from '../../types/pipeline.types';
import OpenAI from 'openai';

export class NarrationStage {
  private openai: OpenAI;
  
  constructor(config: { provider: string; model: string; apiKey: string }) {
    this.openai = new OpenAI({ apiKey: config.apiKey });
  }

  async generate(content: CourseContent): Promise<NarrationScript[]> {
    const narrations: NarrationScript[] = [];
    
    for (const slide of content.slides) {
      const narration = await this.generateSlideNarration(slide, content);
      narrations.push(narration);
    }
    
    return narrations;
  }

  private async generateSlideNarration(slide: any, context: CourseContent): Promise<NarrationScript> {
    const prompt = `
You are an expert educational content narrator. Generate engaging narration for this slide.

Slide ${slide.number}: ${slide.title}

Content:
${slide.bullets.join('\n')}

Speaker Notes:
${slide.speakerNotes || 'None'}

Instructions:
1. Create conversational, engaging narration (150-200 words)
2. Use analogies and examples where helpful
3. Maintain a professional but friendly tone
4. If this concept would benefit from a video demonstration, suggest one
5. Identify key phrases that should be emphasized

Return a JSON object with:
{
  "narration": "The main narration text",
  "duration": estimated duration in seconds,
  "videoSuggestion": {
    "needed": true/false,
    "prompt": "Video generation prompt if needed",
    "type": "overview|process|demonstration|concept",
    "priority": "essential|nice-to-have|optional"
  },
  "emphasis": ["key phrase 1", "key phrase 2"]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        slideNumber: slide.number,
        mainNarration: result.narration,
        duration: result.duration || this.estimateDuration(result.narration),
        videoSuggestions: result.videoSuggestion?.needed ? [{
          slideNumber: slide.number,
          startTime: 0,
          duration: 8,
          prompt: result.videoSuggestion.prompt,
          priority: result.videoSuggestion.priority || 'nice-to-have',
          type: result.videoSuggestion.type || 'concept',
        }] : [],
        emphasis: result.emphasis?.map((text: string, index: number) => ({
          text,
          startTime: index * 2,
          endTime: index * 2 + 2,
        })),
      };
    } catch (error) {
      console.error('Error generating narration:', error);
      // Fallback to basic narration
      return {
        slideNumber: slide.number,
        mainNarration: this.generateBasicNarration(slide),
        duration: 30,
      };
    }
  }

  private generateBasicNarration(slide: any): string {
    let narration = `${slide.title}. `;
    
    if (slide.bullets.length > 0) {
      narration += slide.bullets.join('. ') + '.';
    }
    
    if (slide.speakerNotes) {
      narration += ` ${slide.speakerNotes}`;
    }
    
    return narration;
  }

  private estimateDuration(text: string): number {
    // Estimate ~150 words per minute speaking rate
    const words = text.split(' ').length;
    return Math.ceil((words / 150) * 60);
  }

  async identifyVideoOpportunities(
    content: CourseContent,
    narrations: NarrationScript[]
  ): Promise<VideoOpportunity[]> {
    const opportunities: VideoOpportunity[] = [];
    
    // Collect all video suggestions from narrations
    narrations.forEach(narration => {
      if (narration.videoSuggestions) {
        opportunities.push(...narration.videoSuggestions);
      }
    });
    
    // Analyze content for additional opportunities
    const additionalOpportunities = await this.analyzeForVideoOpportunities(content);
    opportunities.push(...additionalOpportunities);
    
    // Sort by priority and return top opportunities
    return opportunities.sort((a, b) => {
      const priorityOrder = { 'essential': 0, 'nice-to-have': 1, 'optional': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private async analyzeForVideoOpportunities(content: CourseContent): Promise<VideoOpportunity[]> {
    const opportunities: VideoOpportunity[] = [];
    
    // Look for keywords that suggest video would be helpful
    const videoKeywords = {
      overview: ['overview', 'introduction', 'architecture', 'system', 'infrastructure'],
      process: ['process', 'workflow', 'steps', 'procedure', 'flow'],
      demonstration: ['how to', 'example', 'demonstration', 'shows', 'illustrates'],
      concept: ['concept', 'principle', 'theory', 'understanding', 'fundamental'],
    };
    
    content.slides.forEach(slide => {
      const text = `${slide.title} ${slide.bullets.join(' ')}`.toLowerCase();
      
      for (const [type, keywords] of Object.entries(videoKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          opportunities.push({
            slideNumber: slide.number,
            startTime: 0,
            duration: 8,
            prompt: this.generateVideoPrompt(slide, type as any),
            priority: 'nice-to-have',
            type: type as any,
          });
          break;
        }
      }
    });
    
    return opportunities;
  }

  private generateVideoPrompt(slide: any, type: string): string {
    const prompts: Record<string, string> = {
      overview: `Wide shot of modern data center showing ${slide.title}, professional lighting, clean environment`,
      process: `Step-by-step visualization of ${slide.title}, clear progression, professional animation`,
      demonstration: `Close-up demonstration of ${slide.title}, detailed view, professional setting`,
      concept: `Visual representation of ${slide.title} concept, abstract visualization, modern design`,
    };
    
    return prompts[type] || `Professional visualization of ${slide.title}`;
  }
}