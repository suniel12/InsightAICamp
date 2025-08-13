import { AudioSegment } from '../../types/pipeline.types';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface NarrationSegment {
  id: string;
  slideNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  narrationText: string;
  contentType: 'slide' | 'slide-with-overlay' | 'ai-video';
  pace: 'fast' | 'normal' | 'slow';
  keyTerms: string[];
}

export interface SegmentationConfig {
  sessionId: string;
  sessionDir: string;
  mediaManifest?: any;
}

export class NarrationSegmenter {
  private config: SegmentationConfig;

  constructor(config: SegmentationConfig) {
    this.config = config;
  }

  async segmentNarration(): Promise<NarrationSegment[]> {
    console.log('📝 Segmenting narration based on formatted script...');
    
    const narrationPath = path.join(this.config.sessionDir, 'stage-08-final-narration/narration-formatted.md');
    const narrationContent = await fs.readFile(narrationPath, 'utf-8');
    
    const segments = this.parseFormattedNarration(narrationContent);
    
    // Load media manifest to determine content types
    let mediaManifest = null;
    try {
      const manifestPath = path.join(this.config.sessionDir, 'stage-06-ai-media/media-manifest.json');
      mediaManifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    } catch (error) {
      console.warn('  ⚠️  Could not load media manifest, using fallback content types');
    }
    
    // Enhance segments with media information
    const enhancedSegments = this.enhanceWithMediaInfo(segments, mediaManifest);
    
    console.log(`  ✓ Segmented into ${enhancedSegments.length} segments`);
    
    return enhancedSegments;
  }

  private parseFormattedNarration(content: string): NarrationSegment[] {
    const segments: NarrationSegment[] = [];
    
    // Split by slide sections using the markdown structure
    const slideMatches = content.match(/## Slide \d+.*?(?=## Slide|\n---\n\n$|$)/gs);
    
    if (!slideMatches) {
      throw new Error('Could not parse formatted narration - no slide sections found');
    }

    for (const slideMatch of slideMatches) {
      const segment = this.parseSlideSection(slideMatch);
      if (segment) {
        segments.push(segment);
      }
    }

    return segments;
  }

  private parseSlideSection(section: string): NarrationSegment | null {
    // Extract slide number
    const slideNumberMatch = section.match(/## Slide (\d+)/);
    if (!slideNumberMatch) return null;
    const slideNumber = parseInt(slideNumberMatch[1]);

    // Extract timing info [start - end]
    const timingMatch = section.match(/\[(\d+\.?\d*)s - (\d+\.?\d*)s\]/);
    if (!timingMatch) return null;
    const startTime = parseFloat(timingMatch[1]);
    const endTime = parseFloat(timingMatch[2]);
    const duration = endTime - startTime;

    // Extract duration, pace, and type from the metadata line
    const metadataMatch = section.match(/\*\*Duration:\*\* ([\d.]+)s \| \*\*Pace:\*\* (\w+) \| \*\*Type:\*\* ([\w-]+)/);
    if (!metadataMatch) return null;
    const pace = metadataMatch[2] as 'fast' | 'normal' | 'slow';
    const contentType = metadataMatch[3] as 'slide' | 'slide-with-overlay' | 'ai-video';

    // Extract narration text (between metadata and key terms)
    const narrationMatch = section.match(/\*\*Type:\*\* [\w-]+\n\n(.*?)\n\n\*\*Key Terms:\*\*/s);
    if (!narrationMatch) return null;
    const narrationText = narrationMatch[1].trim();

    // Extract key terms
    const keyTermsMatch = section.match(/\*\*Key Terms:\*\* (.+)/);
    const keyTerms = keyTermsMatch ? keyTermsMatch[1].split(', ').map(term => term.trim()) : [];

    const id = `segment-${slideNumber}-${startTime.toFixed(1)}`;

    return {
      id,
      slideNumber,
      startTime,
      endTime,
      duration,
      narrationText,
      contentType,
      pace,
      keyTerms
    };
  }

  private enhanceWithMediaInfo(segments: NarrationSegment[], mediaManifest: any): NarrationSegment[] {
    if (!mediaManifest) {
      return segments;
    }

    return segments.map(segment => {
      // Check if this segment should have AI media based on manifest
      let enhancedContentType = segment.contentType;
      
      // Check for AI images
      const aiImage = mediaManifest.images?.find((img: any) => img.slide === segment.slideNumber);
      if (aiImage && segment.contentType === 'slide') {
        enhancedContentType = 'slide-with-overlay';
      }

      // Check for AI videos
      const aiVideo = mediaManifest.videos?.find((vid: any) => vid.slide === segment.slideNumber);
      if (aiVideo && segment.contentType !== 'ai-video') {
        // For now, keep the original type unless explicitly marked as ai-video
        // This allows for mixed content where videos are embedded within slides
      }

      return {
        ...segment,
        contentType: enhancedContentType
      };
    });
  }

  async createAudioSegments(narrationSegments: NarrationSegment[]): Promise<AudioSegment[]> {
    console.log('🔄 Converting narration segments to audio segments...');
    
    const audioSegments: AudioSegment[] = [];
    
    for (const segment of narrationSegments) {
      const audioSegment: AudioSegment = {
        id: segment.id,
        contentType: this.mapContentType(segment.contentType),
        contentId: segment.slideNumber,
        narrationText: segment.narrationText,
        audioFile: '', // Will be populated by TTS stage
        duration: 0,   // Will be populated by TTS stage
        startTime: segment.startTime,
        endTime: segment.endTime,
        metadata: {
          provider: '',
          voiceId: '',
          createdAt: new Date().toISOString(),
          fileSize: 0
        }
      };
      
      audioSegments.push(audioSegment);
    }
    
    console.log(`  ✓ Created ${audioSegments.length} audio segment templates`);
    
    return audioSegments;
  }

  private mapContentType(contentType: string): 'slide' | 'ai-image' | 'ai-video' {
    switch (contentType) {
      case 'slide-with-overlay':
        return 'slide'; // Will be handled as slide with overlay in timeline
      case 'ai-video':
        return 'ai-video';
      default:
        return 'slide';
    }
  }

  async saveSegments(narrationSegments: NarrationSegment[], outputDir: string): Promise<string> {
    await fs.mkdir(outputDir, { recursive: true });
    
    const segmentData = {
      sessionId: this.config.sessionId,
      createdAt: new Date().toISOString(),
      totalSegments: narrationSegments.length,
      segments: narrationSegments,
      metadata: {
        totalDuration: narrationSegments[narrationSegments.length - 1]?.endTime || 0,
        averageSegmentDuration: narrationSegments.reduce((sum, seg) => sum + seg.duration, 0) / narrationSegments.length
      }
    };
    
    const outputPath = path.join(outputDir, 'narration-segments.json');
    await fs.writeFile(outputPath, JSON.stringify(segmentData, null, 2));
    
    console.log(`  ✓ Saved narration segments to ${outputPath}`);
    
    return outputPath;
  }
}