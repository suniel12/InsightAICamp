import { ScriptSegment } from '../script/generator';
import { AIMediaOpportunity } from '../media/opportunity-detector';
import { GeneratedVideo } from '../../types/pipeline.types';

export interface TimelineEvent {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'slide' | 'ai-video' | 'ai-image' | 'slide-with-overlay' | 'transition';
  content: {
    slideNumber?: number;
    slidePath?: string;
    videoId?: string;
    videoPath?: string;
    imagePath?: string;
    overlayPath?: string;
    description?: string;
    transition?: 'fade' | 'dissolve' | 'cut' | 'zoom';
  };
  narrationSegment?: string; // Part of narration for this event
}

export interface Timeline {
  events: TimelineEvent[];
  totalDuration: number;
  audioTrack: {
    path?: string;
    duration: number;
  };
}

export class TimelinePlanner {
  private transitionDuration: number = 0.5; // seconds

  async planTimeline(
    scriptSegments: ScriptSegment[],
    slideImages: string[],
    aiMediaOpportunities: AIMediaOpportunity[],
    generatedVideos?: GeneratedVideo[]
  ): Promise<Timeline> {
    console.log('Planning visual timeline...');
    
    const events: TimelineEvent[] = [];
    let currentTime = 0;
    
    // Create a map of AI media by slide number
    const mediaBySlide = new Map<number, AIMediaOpportunity>();
    aiMediaOpportunities.forEach(opp => {
      mediaBySlide.set(opp.slideNumber, opp);
    });
    
    // Create a map of generated videos by slide number
    const videosBySlide = new Map<number, GeneratedVideo>();
    generatedVideos?.forEach(video => {
      videosBySlide.set(video.slideNumber, video);
    });
    
    // Process each script segment
    for (let i = 0; i < scriptSegments.length; i++) {
      const segment = scriptSegments[i];
      const slideImage = slideImages[i];
      const aiMedia = mediaBySlide.get(segment.slideNumber);
      const generatedVideo = videosBySlide.get(segment.slideNumber);
      
      // Check if we have AI media for this slide
      if (aiMedia && aiMedia.type === 'video' && generatedVideo) {
        // Plan video insertion
        const videoEvent = this.createVideoEvent(
          currentTime,
          generatedVideo,
          aiMedia,
          segment
        );
        events.push(videoEvent);
        currentTime = videoEvent.endTime;
      } else if (aiMedia && aiMedia.type === 'image') {
        // Plan slide with image overlay
        const overlayEvent = this.createOverlayEvent(
          currentTime,
          slideImage,
          segment,
          aiMedia
        );
        events.push(overlayEvent);
        currentTime = overlayEvent.endTime;
      } else {
        // Regular slide display
        const slideEvent = this.createSlideEvent(
          currentTime,
          slideImage,
          segment
        );
        events.push(slideEvent);
        currentTime = slideEvent.endTime;
      }
      
      // Add transition if not last slide
      if (i < scriptSegments.length - 1) {
        const transitionEvent = this.createTransitionEvent(currentTime);
        events.push(transitionEvent);
        currentTime = transitionEvent.endTime;
      }
    }
    
    const totalDuration = currentTime;
    
    // Assign narration segments to events
    this.assignNarrationToEvents(events, scriptSegments);
    
    console.log(`  Created timeline with ${events.length} events, duration: ${Math.round(totalDuration)}s`);
    
    return {
      events,
      totalDuration,
      audioTrack: {
        duration: totalDuration
      }
    };
  }

  private createSlideEvent(
    startTime: number,
    slidePath: string,
    segment: ScriptSegment
  ): TimelineEvent {
    return {
      id: `slide-${segment.slideNumber}`,
      startTime,
      endTime: startTime + segment.duration,
      duration: segment.duration,
      type: 'slide',
      content: {
        slideNumber: segment.slideNumber,
        slidePath,
        description: `Display slide ${segment.slideNumber}`,
        transition: 'fade'
      }
    };
  }

  private createVideoEvent(
    startTime: number,
    video: GeneratedVideo,
    opportunity: AIMediaOpportunity,
    segment: ScriptSegment
  ): TimelineEvent {
    const videoDuration = opportunity.duration || 5;
    
    return {
      id: `video-${segment.slideNumber}`,
      startTime,
      endTime: startTime + videoDuration,
      duration: videoDuration,
      type: 'ai-video',
      content: {
        slideNumber: segment.slideNumber,
        videoId: video.id,
        videoPath: video.url,
        description: opportunity.description,
        transition: 'dissolve'
      }
    };
  }

  private createOverlayEvent(
    startTime: number,
    slidePath: string,
    segment: ScriptSegment,
    opportunity: AIMediaOpportunity
  ): TimelineEvent {
    return {
      id: `overlay-${segment.slideNumber}`,
      startTime,
      endTime: startTime + segment.duration,
      duration: segment.duration,
      type: 'slide-with-overlay',
      content: {
        slideNumber: segment.slideNumber,
        slidePath,
        overlayPath: opportunity.prompt, // This would be the generated image path
        description: opportunity.description,
        transition: 'fade'
      }
    };
  }

  private createTransitionEvent(startTime: number): TimelineEvent {
    return {
      id: `transition-${startTime}`,
      startTime,
      endTime: startTime + this.transitionDuration,
      duration: this.transitionDuration,
      type: 'transition',
      content: {
        transition: 'dissolve'
      }
    };
  }

  private assignNarrationToEvents(
    events: TimelineEvent[],
    scriptSegments: ScriptSegment[]
  ): void {
    // Map script segments to timeline events
    for (const event of events) {
      if (event.content.slideNumber) {
        const segment = scriptSegments.find(
          s => s.slideNumber === event.content.slideNumber
        );
        if (segment) {
          event.narrationSegment = segment.content;
        }
      }
    }
  }

  optimizeTimeline(timeline: Timeline): Timeline {
    // Optimize timeline for smooth playback
    const optimized = { ...timeline };
    
    // Ensure no gaps in timeline
    for (let i = 1; i < optimized.events.length; i++) {
      const prevEvent = optimized.events[i - 1];
      const currentEvent = optimized.events[i];
      
      if (currentEvent.startTime !== prevEvent.endTime) {
        // Adjust timing to eliminate gap
        const gap = currentEvent.startTime - prevEvent.endTime;
        currentEvent.startTime = prevEvent.endTime;
        currentEvent.endTime -= gap;
        
        // Adjust all subsequent events
        for (let j = i + 1; j < optimized.events.length; j++) {
          optimized.events[j].startTime -= gap;
          optimized.events[j].endTime -= gap;
        }
      }
    }
    
    return optimized;
  }

  exportForRemotion(timeline: Timeline): any {
    // Export timeline in format suitable for Remotion
    return {
      durationInFrames: Math.ceil(timeline.totalDuration * 30), // 30 fps
      fps: 30,
      width: 1920,
      height: 1080,
      timeline: timeline.events.map(event => ({
        from: Math.floor(event.startTime * 30),
        durationInFrames: Math.ceil(event.duration * 30),
        type: event.type,
        props: {
          ...event.content,
          narration: event.narrationSegment
        }
      }))
    };
  }

  generateTimelineDescription(timeline: Timeline): string {
    let description = 'Timeline Overview:\n\n';
    
    for (const event of timeline.events) {
      const timeStr = `${event.startTime.toFixed(1)}s - ${event.endTime.toFixed(1)}s`;
      
      switch (event.type) {
        case 'slide':
          description += `${timeStr}: Slide ${event.content.slideNumber}\n`;
          break;
        case 'ai-video':
          description += `${timeStr}: AI Video - ${event.content.description}\n`;
          break;
        case 'slide-with-overlay':
          description += `${timeStr}: Slide ${event.content.slideNumber} with AI image overlay\n`;
          break;
        case 'transition':
          description += `${timeStr}: Transition\n`;
          break;
      }
    }
    
    description += `\nTotal Duration: ${timeline.totalDuration.toFixed(1)} seconds`;
    
    return description;
  }
}