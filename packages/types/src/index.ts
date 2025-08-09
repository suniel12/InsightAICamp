// Shared types across all applications

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'processing' | 'published' | 'archived';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student';
  createdAt: Date;
}

export interface VideoAsset {
  id: string;
  url: string;
  duration: number;
  format: string;
  resolution: string;
  size: number;
}

export interface ProcessingJob {
  id: string;
  type: 'extraction' | 'narration' | 'tts' | 'video' | 'assembly';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}