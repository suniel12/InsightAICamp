import OpenAI from 'openai';
import { Timeline, TimelineEvent } from '../timeline/planner';
import { ScriptSegment } from '../script/generator';
import { UserContext } from '../analysis/visual-analyzer';

export interface FinalNarration {
  fullScript: string;
  segments: NarrationSegment[];
  totalDuration: number;
  wordsPerMinute: number;
}

export interface NarrationSegment {
  text: string;
  startTime: number;
  endTime: number;
  visualType: 'slide' | 'ai-video' | 'ai-image' | 'transition';
  slideNumber?: number;
  emphasis?: string[];
  pace: 'slow' | 'normal' | 'fast';
}

export class FinalNarrationGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateFinalNarration(
    timeline: Timeline,
    initialScript: ScriptSegment[],
    userContext: UserContext
  ): Promise<FinalNarration> {
    console.log('Generating final continuous narration...');
    
    // Create narration segments for each timeline event
    const segments: NarrationSegment[] = [];
    
    for (const event of timeline.events) {
      if (event.type === 'transition') continue; // Skip transitions
      
      const segment = await this.generateSegmentNarration(
        event,
        timeline,
        initialScript,
        userContext
      );
      
      segments.push(segment);
    }
    
    // Smooth transitions between segments
    const smoothedSegments = await this.smoothSegmentTransitions(segments, userContext);
    
    // Combine into full script
    const fullScript = smoothedSegments.map(s => s.text).join(' ');
    
    // Calculate total duration and pace
    const totalDuration = timeline.totalDuration;
    const wordCount = fullScript.split(' ').length;
    const wordsPerMinute = (wordCount / totalDuration) * 60;
    
    console.log(`  Generated ${wordCount} words, ${Math.round(wordsPerMinute)} WPM`);
    
    return {
      fullScript,
      segments: smoothedSegments,
      totalDuration,
      wordsPerMinute
    };
  }

  private async generateSegmentNarration(
    event: TimelineEvent,
    timeline: Timeline,
    initialScript: ScriptSegment[],
    userContext: UserContext
  ): Promise<NarrationSegment> {
    // Find the corresponding initial script segment
    const scriptSegment = initialScript.find(
      s => s.slideNumber === event.content.slideNumber
    );
    
    // Get previous and next events for context
    const eventIndex = timeline.events.indexOf(event);
    const prevEvent = eventIndex > 0 ? timeline.events[eventIndex - 1] : null;
    const nextEvent = eventIndex < timeline.events.length - 1 
      ? timeline.events[eventIndex + 1] : null;
    
    const prompt = `Generate narration for this specific moment in the video.

CURRENT VISUAL:
Type: ${event.type}
${event.type === 'ai-video' ? `Video shows: ${event.content.description}` : ''}
${event.type === 'slide' ? `Slide ${event.content.slideNumber} content` : ''}
Duration: ${event.duration} seconds

INITIAL SCRIPT FOR THIS SECTION:
${scriptSegment?.content || 'No initial script available'}

USER CONTEXT:
Background: ${userContext.background}
Expertise: ${userContext.expertise}

${prevEvent ? `COMING FROM: ${prevEvent.type}` : 'This is the beginning'}
${nextEvent ? `GOING TO: ${nextEvent.type}` : 'This is the end'}

REQUIREMENTS:
1. If showing AI video, naturally describe what we're seeing
2. If showing slide, explain the content naturally
3. Create smooth transitions in and out
4. Match duration: approximately ${Math.round(event.duration * 160 / 60)} words
5. Be conversational and engaging
6. Never say "as you can see" or "the slide shows"

${event.type === 'ai-video' ? `
EXAMPLE for video:
"Let's take a look inside a modern data center. Here we can see rows upon rows of server racks, 
each containing dozens of machines working in perfect synchronization. Notice the sophisticated 
cooling systems maintaining optimal temperatures..."
` : ''}

Generate the narration text only:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are creating smooth, continuous narration for an educational video. The narration should flow naturally and guide the viewer through what they\'re seeing.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const narrationText = response.choices[0].message.content || scriptSegment?.content || '';
    
    // Determine pace based on content complexity
    const pace = this.determinePace(narrationText, event.duration);
    
    return {
      text: narrationText,
      startTime: event.startTime,
      endTime: event.endTime,
      visualType: event.type as any,
      slideNumber: event.content.slideNumber,
      emphasis: this.extractEmphasisPoints(narrationText),
      pace
    };
  }

  private async smoothSegmentTransitions(
    segments: NarrationSegment[],
    userContext: UserContext
  ): Promise<NarrationSegment[]> {
    const smoothed: NarrationSegment[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      
      if (next) {
        // Check if we need a transition phrase
        const needsTransition = this.needsTransitionPhrase(current, next);
        
        if (needsTransition) {
          // Generate appropriate transition
          const transition = await this.generateTransitionPhrase(
            current,
            next,
            userContext
          );
          
          // Append transition to current segment
          current.text = current.text.trimEnd() + ' ' + transition;
        }
      }
      
      smoothed.push(current);
    }
    
    return smoothed;
  }

  private needsTransitionPhrase(
    current: NarrationSegment,
    next: NarrationSegment
  ): boolean {
    // Check if transition is needed based on visual change
    if (current.visualType !== next.visualType) {
      return true; // Different visual types need transition
    }
    
    // Check if the text already has a natural transition
    const hasNaturalTransition = /Now|Next|Let's|Moving|Building on|This brings us/i.test(
      current.text.slice(-50) // Check last 50 characters
    );
    
    return !hasNaturalTransition;
  }

  private async generateTransitionPhrase(
    current: NarrationSegment,
    next: NarrationSegment,
    userContext: UserContext
  ): Promise<string> {
    // Generate contextual transition based on visual types
    const transitions: Record<string, string[]> = {
      'slide-to-video': [
        "Let's see this in action.",
        "Here's what this looks like in practice.",
        "Let me show you how this works.",
        "Take a look at this."
      ],
      'video-to-slide': [
        "Now that we've seen that,",
        "Building on what we just saw,",
        "With that context,",
        "This brings us to"
      ],
      'slide-to-slide': [
        "Moving forward,",
        "Next,",
        "Now let's explore",
        "This leads us to"
      ]
    };
    
    const transitionKey = `${current.visualType}-to-${next.visualType}`.replace('ai-', '');
    const options = transitions[transitionKey] || transitions['slide-to-slide'];
    
    // Select transition based on position
    const index = current.slideNumber ? (current.slideNumber - 1) % options.length : 0;
    return options[index];
  }

  private determinePace(text: string, duration: number): 'slow' | 'normal' | 'fast' {
    const wordCount = text.split(' ').length;
    const wordsPerSecond = wordCount / duration;
    
    if (wordsPerSecond < 2.3) return 'slow';
    if (wordsPerSecond > 3) return 'fast';
    return 'normal';
  }

  private extractEmphasisPoints(text: string): string[] {
    // Extract key phrases that should be emphasized
    const emphasisPatterns = [
      /critical|important|key|essential|crucial/gi,
      /remember|note|notice/gi,
      /first|second|third|finally/gi,
      /however|but|although/gi
    ];
    
    const emphasisPoints: string[] = [];
    
    for (const pattern of emphasisPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        emphasisPoints.push(...matches);
      }
    }
    
    return [...new Set(emphasisPoints)]; // Remove duplicates
  }

  async adjustForTiming(
    narration: FinalNarration,
    targetDuration: number
  ): Promise<FinalNarration> {
    // Adjust narration if it's too long or short
    const currentDuration = narration.totalDuration;
    const difference = Math.abs(targetDuration - currentDuration);
    
    if (difference < 2) {
      // Close enough, no adjustment needed
      return narration;
    }
    
    if (currentDuration > targetDuration) {
      // Narration is too long, need to trim
      console.log(`  Trimming narration from ${currentDuration}s to ${targetDuration}s`);
      
      // Identify less important segments to trim
      // This is simplified - in production, use AI to identify trimmable content
      const trimRatio = targetDuration / currentDuration;
      
      for (const segment of narration.segments) {
        const words = segment.text.split(' ');
        const targetWords = Math.floor(words.length * trimRatio);
        segment.text = words.slice(0, targetWords).join(' ');
      }
    } else {
      // Narration is too short, need to expand
      console.log(`  Expanding narration from ${currentDuration}s to ${targetDuration}s`);
      
      // Add pauses or additional context
      // This is simplified - in production, use AI to add relevant content
      for (const segment of narration.segments) {
        if (segment.pace === 'fast') {
          segment.pace = 'normal';
        } else if (segment.pace === 'normal') {
          segment.pace = 'slow';
        }
      }
    }
    
    return narration;
  }
}