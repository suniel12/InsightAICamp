import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface SlideAnalysis {
  slideNumber: number;
  imagePath: string;
  title: string;
  keyPoints: string[];
  visualElements: string[];
  concepts: string[];
  narrativeFocus: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface UserContext {
  background: string;
  expertise: 'beginner' | 'intermediate' | 'expert';
  industry: string;
  goals: string;
}

export class VisualAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeSlides(
    slideImages: string[], 
    userContext: UserContext
  ): Promise<SlideAnalysis[]> {
    const analyses: SlideAnalysis[] = [];
    
    console.log(`Analyzing ${slideImages.length} slides with Vision AI...`);
    
    for (let i = 0; i < slideImages.length; i++) {
      const imagePath = slideImages[i];
      const slideNumber = i + 1;
      
      try {
        console.log(`  Analyzing slide ${slideNumber}...`);
        const analysis = await this.analyzeSlide(
          imagePath, 
          slideNumber, 
          userContext
        );
        analyses.push(analysis);
      } catch (error) {
        console.error(`  Error analyzing slide ${slideNumber}:`, error);
        // Create fallback analysis
        analyses.push({
          slideNumber,
          imagePath,
          title: `Slide ${slideNumber}`,
          keyPoints: [],
          visualElements: [],
          concepts: [],
          narrativeFocus: 'General content explanation',
          complexity: 'moderate'
        });
      }
    }
    
    return analyses;
  }

  private async analyzeSlide(
    imagePath: string,
    slideNumber: number,
    userContext: UserContext
  ): Promise<SlideAnalysis> {
    // Read image and convert to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const prompt = `Analyze this presentation slide and provide structured information.

USER CONTEXT:
- Background: ${userContext.background}
- Expertise Level: ${userContext.expertise}
- Industry: ${userContext.industry}
- Goals: ${userContext.goals}

Extract and provide:
1. Main title or topic of the slide
2. Key points or bullets (as an array)
3. Visual elements present (charts, diagrams, images)
4. Core concepts that might need explanation
5. Suggested narrative focus for this user
6. Complexity level of the content

Consider the user's background when identifying concepts that need explanation.
Someone with ${userContext.expertise} expertise in ${userContext.industry} may need different explanations than others.

Respond in JSON format:
{
  "title": "string",
  "keyPoints": ["string"],
  "visualElements": ["string"],
  "concepts": ["string"],
  "narrativeFocus": "string",
  "complexity": "simple|moderate|complex"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_completion_tokens: 30000  // High limit for detailed analysis per slide
      // Note: GPT-5 Nano only supports default temperature (1.0)
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from Vision AI');
    }

    try {
      // Parse JSON response, removing markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const analysis = JSON.parse(cleanContent);
      
      return {
        slideNumber,
        imagePath,
        title: analysis.title || `Slide ${slideNumber}`,
        keyPoints: analysis.keyPoints || [],
        visualElements: analysis.visualElements || [],
        concepts: analysis.concepts || [],
        narrativeFocus: analysis.narrativeFocus || '',
        complexity: analysis.complexity || 'moderate'
      };
    } catch (parseError) {
      console.error('Error parsing Vision AI response:', parseError);
      // Extract what we can from the text response
      return {
        slideNumber,
        imagePath,
        title: `Slide ${slideNumber}`,
        keyPoints: this.extractBullets(content),
        visualElements: [],
        concepts: [],
        narrativeFocus: content.substring(0, 200),
        complexity: 'moderate'
      };
    }
  }

  private extractBullets(text: string): string[] {
    // Simple extraction of bullet points from text
    const bullets: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || 
          trimmed.startsWith('-') || 
          trimmed.startsWith('*') ||
          trimmed.match(/^\d+\./)) {
        bullets.push(trimmed.replace(/^[•\-\*]|\d+\./, '').trim());
      }
    }
    
    return bullets;
  }

  async batchAnalyze(
    slideImages: string[],
    userContext: UserContext,
    batchSize: number = 3
  ): Promise<SlideAnalysis[]> {
    const results: SlideAnalysis[] = [];
    
    for (let i = 0; i < slideImages.length; i += batchSize) {
      const batch = slideImages.slice(i, i + batchSize);
      const batchAnalyses = await Promise.all(
        batch.map(async (imagePath, index) => {
          const slideNumber = i + index + 1;
          return this.analyzeSlide(imagePath, slideNumber, userContext);
        })
      );
      results.push(...batchAnalyses);
      
      console.log(`  Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(slideImages.length / batchSize)}`);
    }
    
    return results;
  }
}