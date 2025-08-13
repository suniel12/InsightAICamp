export interface SlideContent {
  number: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
  images?: Array<{
    url: string;
    position: { x: number; y: number };
  }>;
  originalImageUrl?: string;  // Path to the original slide image
  enhancedImageUrl?: string;  // Path to the enhanced slide image
}

export interface CourseContent {
  id: string;
  title: string;
  slides: SlideContent[];
  metadata: {
    author?: string;
    createdAt: Date;
    slideCount: number;
    estimatedDuration: number;
  };
}

export interface NarrationScript {
  slideNumber: number;
  mainNarration: string;
  duration: number;
  emphasis?: Array<{
    text: string;
    startTime: number;
    endTime: number;
  }>;
  videoSuggestions?: VideoOpportunity[];
}

export interface VideoOpportunity {
  slideNumber: number;
  startTime: number;
  duration: number;
  prompt: string;
  priority: 'essential' | 'nice-to-have' | 'optional';
  type: 'overview' | 'process' | 'comparison' | 'demonstration' | 'concept';
}

export interface AudioFile {
  slideNumber: number;
  url: string;
  duration: number;
  format: 'mp3' | 'wav';
  voiceId?: string;
}

export interface SpeechMark {
  time: number;
  type: 'sentence' | 'word' | 'viseme' | 'ssml';
  start: number;
  end: number;
  value: string;
}

export interface AudioSegment {
  id: string;
  contentType: 'slide' | 'ai-image' | 'ai-video';
  contentId: number | string;
  narrationText: string;
  audioFile: string;
  duration: number;
  speechMarks?: SpeechMark[];
  startTime: number;
  endTime: number;
  metadata?: {
    provider: string;
    voiceId: string;
    createdAt: string;
    fileSize: number;
  };
}

export interface SegmentedAudioCollection {
  segments: AudioSegment[];
  totalDuration: number;
  sessionId: string;
  createdAt: string;
  metadata: {
    segmentCount: number;
    provider: string;
    voiceId: string;
    totalFileSize: number;
  };
}

export interface GeneratedVideo {
  id: string;
  slideNumber: number;
  url: string;
  duration: number;
  prompt: string;
  provider: 'runway' | 'veo' | 'pika' | 'stability';
  cost: number;
}

export interface PipelineJob {
  id: string;
  courseId: string;
  stage: PipelineStage;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  retries: number;
}

export type PipelineStage = 
  | 'extraction'          // Stage 1: PPT content extraction
  | 'image-export'        // Stage 2: Slide image export
  | 'analysis'           // Stage 3: Personalized analysis & narration
  | 'enhancement'        // Stage 4: Enhanced PPT creation
  | 'script-generation'  // Stage 5: Script & media planning
  | 'media-generation'   // Stage 6: AI media creation
  | 'narration-prep'     // Stage 7: Final narration preparation
  | 'segmentation'       // Stage 8: Narration segmentation
  | 'tts'               // Stage 9: Segmented TTS generation
  | 'timeline'          // Stage 10: Content-aware timeline
  | 'assembly';         // Stage 11: Video assembly

export interface PipelineConfig {
  llm: {
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    apiKey: string;
  };
  tts: {
    provider: 'elevenlabs' | 'google' | 'azure';
    voiceId: string;
    apiKey: string;
  };
  videoGen: {
    provider: 'runway' | 'veo' | 'pika' | 'stability';
    apiKey: string;
    maxVideosPerCourse: number;
    maxDurationPerVideo: number;
  };
  output: {
    format: 'mp4' | 'webm' | 'interactive';
    resolution: '720p' | '1080p' | '4k';
    fps: 24 | 30 | 60;
  };
}