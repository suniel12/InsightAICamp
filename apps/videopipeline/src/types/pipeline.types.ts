export interface SlideContent {
  number: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
  images?: Array<{
    url: string;
    position: { x: number; y: number };
  }>;
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
  | 'extraction'
  | 'narration'
  | 'slides'
  | 'tts'
  | 'video-detection'
  | 'video-generation'
  | 'assembly'
  | 'enhancement';

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