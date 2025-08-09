import { CourseContent, NarrationScript, VideoOpportunity, GeneratedVideo } from '../../types/pipeline.types';
import axios from 'axios';

interface VideoGenConfig {
  provider: 'runway' | 'veo' | 'pika' | 'stability';
  apiKey: string;
  maxVideosPerCourse: number;
  maxDurationPerVideo: number;
  quality?: 'standard' | 'high';
  stylePreset?: string;
}

export class VideoStage {
  private config: VideoGenConfig;

  constructor(config: VideoGenConfig) {
    this.config = config;
  }

  async identifyOpportunities(
    content: CourseContent,
    narrations: NarrationScript[]
  ): Promise<VideoOpportunity[]> {
    const opportunities: VideoOpportunity[] = [];
    
    // Collect opportunities from narration analysis
    narrations.forEach(narration => {
      if (narration.videoSuggestions && narration.videoSuggestions.length > 0) {
        opportunities.push(...narration.videoSuggestions);
      }
    });
    
    // Add strategic opportunities based on content analysis
    const additionalOpportunities = this.analyzeContentForVideos(content);
    opportunities.push(...additionalOpportunities);
    
    // Rank and filter opportunities
    return this.rankAndFilterOpportunities(opportunities);
  }

  async generateVideos(opportunities: VideoOpportunity[]): Promise<GeneratedVideo[]> {
    const videos: GeneratedVideo[] = [];
    
    // Best practice: Process in optimal batch sizes
    // Runway Gen-3 charges in 5-second increments, so optimize for that
    for (const opportunity of opportunities) {
      try {
        const video = await this.generateSingleVideo(opportunity);
        videos.push(video);
      } catch (error) {
        console.error(`Failed to generate video for slide ${opportunity.slideNumber}:`, error);
        // Continue with other videos even if one fails
      }
    }
    
    return videos;
  }

  private async generateSingleVideo(opportunity: VideoOpportunity): Promise<GeneratedVideo> {
    // Best practice: Optimize prompt based on provider capabilities
    const optimizedPrompt = this.optimizePromptForProvider(opportunity.prompt);
    
    if (this.config.provider === 'runway') {
      return this.generateRunwayVideo(opportunity, optimizedPrompt);
    }
    
    throw new Error(`Video provider ${this.config.provider} not implemented`);
  }

  private async generateRunwayVideo(
    opportunity: VideoOpportunity,
    prompt: string
  ): Promise<GeneratedVideo> {
    try {
      // Best practice: Structure prompt with clear sections
      const structuredPrompt = this.structureRunwayPrompt(prompt, opportunity.type);
      
      // Best practice: Optimize duration for credit usage (5-second increments)
      const optimizedDuration = Math.ceil(opportunity.duration / 5) * 5;
      
      const response = await axios.post(
        'https://api.runwayml.com/v1/generations',
        {
          model: 'gen3_turbo', // Use turbo for cost efficiency
          prompt: structuredPrompt,
          duration: optimizedDuration,
          // Best practice: Motion intensity based on content type
          motion_intensity: this.getMotionIntensity(opportunity.type),
          // Video settings for quality
          resolution: this.config.quality === 'high' ? '1080p' : '720p',
          fps: 24, // Standard for educational content
          // Style modifiers for consistency
          style_preset: this.config.stylePreset || 'professional',
          // Seed for reproducibility
          seed: opportunity.slideNumber,
          // Camera movement for dynamic shots
          camera_motion: this.getCameraMotion(opportunity.type),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Wait for generation to complete
      const videoUrl = await this.pollForCompletion(response.data.id);

      return {
        id: `video_${opportunity.slideNumber}_${Date.now()}`,
        slideNumber: opportunity.slideNumber,
        url: videoUrl,
        duration: optimizedDuration,
        prompt: structuredPrompt,
        provider: 'runway',
        cost: this.calculateCost(optimizedDuration),
      };
    } catch (error) {
      console.error('Runway video generation error:', error);
      throw error;
    }
  }

  private optimizePromptForProvider(prompt: string): string {
    // Best practice: Keep prompts clear and structured
    // Remove unnecessary details that might confuse the model
    
    // For Runway Gen-3: Simple, straightforward prompts work best
    let optimized = prompt
      .replace(/\s+/g, ' ') // Remove extra whitespace
      .trim();
    
    // Add quality modifiers
    if (!optimized.includes('high quality')) {
      optimized = `High quality, professional ${optimized}`;
    }
    
    // Add lighting if not specified
    if (!optimized.includes('lighting')) {
      optimized += ', well-lit, professional lighting';
    }
    
    return optimized;
  }

  private structureRunwayPrompt(prompt: string, type: VideoOpportunity['type']): string {
    // Best practice: Structure prompt with scene, subject, and camera movement
    const templates: Record<VideoOpportunity['type'], string> = {
      overview: `[SCENE] ${prompt} [CAMERA] Slow dolly shot revealing the full scene [STYLE] Cinematic, professional, clean`,
      process: `[SCENE] ${prompt} [CAMERA] Following shot showing progression [STYLE] Clear, educational, step-by-step`,
      demonstration: `[SCENE] ${prompt} [CAMERA] Close-up transitioning to medium shot [STYLE] Detailed, instructional`,
      concept: `[SCENE] ${prompt} [CAMERA] Orbiting shot for full perspective [STYLE] Abstract visualization, modern`,
      comparison: `[SCENE] ${prompt} [CAMERA] Split screen or side-by-side view [STYLE] Clear contrast, educational`,
    };
    
    return templates[type] || prompt;
  }

  private getMotionIntensity(type: VideoOpportunity['type']): number {
    // Best practice: Motion intensity 1-5 based on content type
    const intensityMap: Record<VideoOpportunity['type'], number> = {
      overview: 3,      // Moderate movement for engagement
      process: 4,       // Higher movement to show progression
      demonstration: 2, // Lower movement for clarity
      concept: 3,       // Moderate for abstract concepts
      comparison: 2,    // Lower to focus on differences
    };
    
    return intensityMap[type] || 3;
  }

  private getCameraMotion(type: VideoOpportunity['type']): string {
    // Best practice: Specify camera movement for dynamic videos
    const cameraMap: Record<VideoOpportunity['type'], string> = {
      overview: 'slow_zoom_out',
      process: 'tracking_shot',
      demonstration: 'steady_cam',
      concept: 'orbital',
      comparison: 'static',
    };
    
    return cameraMap[type] || 'smooth_motion';
  }

  private analyzeContentForVideos(content: CourseContent): VideoOpportunity[] {
    const opportunities: VideoOpportunity[] = [];
    
    // Best practice: Strategic video placement
    // 1. Opening hook - always essential
    if (content.slides.length > 0) {
      opportunities.push({
        slideNumber: 1,
        startTime: 0,
        duration: 5,
        prompt: this.generateOpeningPrompt(content.slides[0]),
        priority: 'essential',
        type: 'overview',
      });
    }
    
    // 2. Major concept introductions
    content.slides.forEach((slide, index) => {
      if (this.isConceptIntroduction(slide)) {
        opportunities.push({
          slideNumber: index + 1,
          startTime: 0,
          duration: 5,
          prompt: this.generateConceptPrompt(slide),
          priority: 'nice-to-have',
          type: 'concept',
        });
      }
    });
    
    // 3. Complex processes or workflows
    content.slides.forEach((slide, index) => {
      if (this.isProcessExplanation(slide)) {
        opportunities.push({
          slideNumber: index + 1,
          startTime: 0,
          duration: 10,
          prompt: this.generateProcessPrompt(slide),
          priority: 'essential',
          type: 'process',
        });
      }
    });
    
    return opportunities;
  }

  private isConceptIntroduction(slide: any): boolean {
    const conceptKeywords = ['introduction', 'overview', 'what is', 'understanding', 'fundamentals'];
    const text = `${slide.title} ${slide.bullets.join(' ')}`.toLowerCase();
    return conceptKeywords.some(keyword => text.includes(keyword));
  }

  private isProcessExplanation(slide: any): boolean {
    const processKeywords = ['step', 'process', 'workflow', 'procedure', 'how to', 'method'];
    const text = `${slide.title} ${slide.bullets.join(' ')}`.toLowerCase();
    return processKeywords.some(keyword => text.includes(keyword));
  }

  private generateOpeningPrompt(slide: any): string {
    return `Modern, professional establishing shot of ${slide.title}, cinematic quality, smooth camera movement revealing the subject`;
  }

  private generateConceptPrompt(slide: any): string {
    return `Clear visualization of ${slide.title} concept, modern graphics, professional presentation, educational style`;
  }

  private generateProcessPrompt(slide: any): string {
    return `Step-by-step demonstration of ${slide.title}, clear progression, professional environment, instructional video style`;
  }

  private rankAndFilterOpportunities(opportunities: VideoOpportunity[]): VideoOpportunity[] {
    // Sort by priority and slide number
    const priorityOrder = { 'essential': 0, 'nice-to-have': 1, 'optional': 2 };
    
    return opportunities
      .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.slideNumber - b.slideNumber;
      })
      .slice(0, this.config.maxVideosPerCourse);
  }

  private calculateCost(duration: number): number {
    // Runway Gen-3: $0.05 per second (5 credits at $0.01 each)
    return duration * 0.05;
  }

  private async pollForCompletion(generationId: string): Promise<string> {
    // Poll Runway API for video completion
    // This is a simplified version - implement actual polling logic
    return `https://storage.runwayml.com/videos/${generationId}.mp4`;
  }
}