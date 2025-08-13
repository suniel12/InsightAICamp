import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface SlideAnalysis {
  slideNumber: number;
  title: string;
  keyPoints: string[];
  visualElements: string[];
  concepts: string[];
  narrativeFocus: string;
  complexity: 'simple' | 'moderate' | 'complex';
  connectionToPrevious?: string;
  connectionToNext?: string;
  biologicalAnalogies?: string[];
}

export interface BatchAnalysisResult {
  presentationOverview: string;
  totalSlides: number;
  slides: SlideAnalysis[];
  overallNarrativeArc: string;
  suggestedDuration: string;
}

export interface UserContext {
  background: string;
  expertise: 'beginner' | 'intermediate' | 'expert';
  industry: string;
  goals: string;
}

export class BatchAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzePresentationBatch(
    slideImages: string[],
    userContext: UserContext
  ): Promise<BatchAnalysisResult> {
    console.log(`🎯 Preparing batch analysis of ${slideImages.length} slides with GPT-5 Nano...`);
    
    // Read all images and convert to base64
    const imageContents = await Promise.all(
      slideImages.map(async (imagePath) => {
        const imageBuffer = await fs.readFile(imagePath);
        return {
          path: imagePath,
          base64: imageBuffer.toString('base64')
        };
      })
    );

    const prompt = `You are analyzing a complete ${slideImages.length}-slide presentation about Data Centers.
This is a holistic analysis - consider the entire narrative flow and how concepts build upon each other.

USER CONTEXT:
- Background: ${userContext.background}
- Expertise Level: ${userContext.expertise}
- Industry: ${userContext.industry}
- Goals: ${userContext.goals}

IMPORTANT: Since the user is a ${userContext.background} with ${userContext.expertise} level expertise, use biological analogies and life science concepts to explain technical concepts where appropriate.

Analyze ALL slides together and provide:

1. PRESENTATION OVERVIEW: Main theme, objectives, and target learning outcomes
2. FOR EACH SLIDE provide:
   - Slide number and title
   - Key points (bullet points from the slide)
   - Visual elements (diagrams, charts, images)
   - Core concepts that need explanation
   - How it connects to the previous slide (if applicable)
   - How it transitions to the next slide (if applicable)
   - Biological analogies that would help explain complex concepts
   - Suggested narrative focus for this specific user
   - Complexity level (simple/moderate/complex)
3. OVERALL NARRATIVE ARC: How the story flows from beginning to end
4. SUGGESTED DURATION: Total time for video presentation

Consider that this user understands biological systems, cellular processes, and ecosystems, so draw parallels to these concepts when explaining data center infrastructure.

Respond in JSON format:
{
  "presentationOverview": "string",
  "totalSlides": number,
  "slides": [
    {
      "slideNumber": number,
      "title": "string",
      "keyPoints": ["string"],
      "visualElements": ["string"],
      "concepts": ["string"],
      "connectionToPrevious": "string or null",
      "connectionToNext": "string or null",
      "biologicalAnalogies": ["string"],
      "narrativeFocus": "string",
      "complexity": "simple|moderate|complex"
    }
  ],
  "overallNarrativeArc": "string",
  "suggestedDuration": "string"
}`;

    // Create message content with all images
    const messageContent: any[] = [
      { type: 'text', text: prompt }
    ];

    // Add all images to the message
    imageContents.forEach((img, index) => {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${img.base64}`,
          detail: 'high'
        }
      });
    });

    console.log(`📡 Sending batch to GPT-5 Nano API...`);
    console.log(`   (This may take 10-20 seconds for comprehensive analysis)`);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator who specializes in making complex technical concepts accessible through analogies and clear explanations.'
          },
          {
            role: 'user',
            content: messageContent
          }
        ],
        max_completion_tokens: 50000  // High limit for comprehensive analysis of many slides
        // Note: GPT-5 Nano only supports default temperature (1.0)
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT-5 Nano');
      }

      // Parse JSON response
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const analysis = JSON.parse(cleanContent);

      return {
        presentationOverview: analysis.presentationOverview || 'Data Center presentation',
        totalSlides: analysis.totalSlides || slideImages.length,
        slides: analysis.slides || [],
        overallNarrativeArc: analysis.overallNarrativeArc || 'Progressive introduction to data center concepts',
        suggestedDuration: analysis.suggestedDuration || `${slideImages.length * 60} seconds`
      };

    } catch (error) {
      console.error('Error in batch analysis:', error);
      throw error;
    }
  }

  generateNarrationScript(analysis: BatchAnalysisResult, userContext: UserContext): string {
    let script = `# Personalized Narration Script for ${userContext.background}\n\n`;
    script += `## Presentation Overview\n${analysis.presentationOverview}\n\n`;
    script += `---\n\n`;

    analysis.slides.forEach((slide) => {
      script += `## Slide ${slide.slideNumber}: ${slide.title}\n\n`;
      
      if (slide.connectionToPrevious) {
        script += `*[Transition from previous]*: ${slide.connectionToPrevious}\n\n`;
      }

      script += `### Main Narration\n`;
      script += `${slide.narrativeFocus}\n\n`;

      if (slide.biologicalAnalogies && slide.biologicalAnalogies.length > 0) {
        script += `### Biological Analogies\n`;
        slide.biologicalAnalogies.forEach(analogy => {
          script += `- ${analogy}\n`;
        });
        script += '\n';
      }

      if (slide.keyPoints.length > 0) {
        script += `### Key Points to Cover\n`;
        slide.keyPoints.forEach(point => {
          script += `- ${point}\n`;
        });
        script += '\n';
      }

      if (slide.connectionToNext) {
        script += `*[Leading to next]*: ${slide.connectionToNext}\n`;
      }

      script += `\n---\n\n`;
    });

    script += `## Closing\n${analysis.overallNarrativeArc}\n\n`;
    script += `**Total Duration**: ${analysis.suggestedDuration}\n`;

    return script;
  }
}