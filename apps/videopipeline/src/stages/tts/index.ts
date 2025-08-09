import { NarrationScript, AudioFile } from '../../types/pipeline.types';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TTSConfig {
  provider: 'elevenlabs' | 'google' | 'azure';
  voiceId: string;
  apiKey: string;
  modelId?: string;
  optimizeLatency?: boolean;
}

export class TTSStage {
  private config: TTSConfig;
  private outputDir: string;

  constructor(config: TTSConfig) {
    this.config = config;
    this.outputDir = '/tmp/tts-output';
  }

  async generateAudio(narrations: NarrationScript[]): Promise<AudioFile[]> {
    await this.ensureOutputDir();
    
    const audioFiles: AudioFile[] = [];
    
    // Process in batches for efficiency
    const batchSize = 5;
    for (let i = 0; i < narrations.length; i += batchSize) {
      const batch = narrations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(narration => this.generateSingleAudio(narration))
      );
      audioFiles.push(...batchResults);
    }
    
    return audioFiles;
  }

  private async generateSingleAudio(narration: NarrationScript): Promise<AudioFile> {
    if (this.config.provider === 'elevenlabs') {
      return this.generateElevenLabsAudio(narration);
    }
    
    throw new Error(`TTS provider ${this.config.provider} not implemented`);
  }

  private async generateElevenLabsAudio(narration: NarrationScript): Promise<AudioFile> {
    try {
      // Best practice: Use appropriate model based on requirements
      // Eleven Flash v2.5 for low latency, Multilingual v2 for quality
      const modelId = this.config.modelId || 'eleven_multilingual_v2';
      
      // Best practice: Optimize text with SSML-like markers for better expression
      const optimizedText = this.optimizeTextForTTS(narration.mainNarration, narration.emphasis);
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`,
        {
          text: optimizedText,
          model_id: modelId,
          voice_settings: {
            // Best practice: Balanced settings for educational content
            stability: 0.5,        // Moderate stability for natural variation
            similarity_boost: 0.75, // High similarity for consistency
            style: 0.3,            // Some style for engagement
            use_speaker_boost: true
          },
          // Best practice: Apply text normalization for better pronunciation
          apply_text_normalization: true,
          // Optional: Use seed for consistency across regenerations
          seed: narration.slideNumber,
          // Best practice: Use previous/next text for better continuity
          previous_text: this.getPreviousContext(narration.slideNumber),
          next_text: this.getNextContext(narration.slideNumber),
          // Optimize for latency if configured
          optimize_streaming_latency: this.config.optimizeLatency ? 2 : 0
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      // Save audio file
      const filename = `slide_${narration.slideNumber}_audio.mp3`;
      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, response.data);

      // Get actual duration (would need audio analysis library)
      const duration = await this.getAudioDuration(filepath);

      return {
        slideNumber: narration.slideNumber,
        url: filepath,
        duration: duration || narration.duration,
        format: 'mp3',
        voiceId: this.config.voiceId,
      };
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw new Error(`Failed to generate audio for slide ${narration.slideNumber}`);
    }
  }

  private optimizeTextForTTS(text: string, emphasis?: Array<{ text: string }>): string {
    let optimizedText = text;
    
    // Best practice: Add pauses and emphasis for better delivery
    // Add slight pauses after periods
    optimizedText = optimizedText.replace(/\. /g, '... ');
    
    // Add emphasis to key phrases
    if (emphasis && emphasis.length > 0) {
      emphasis.forEach(emp => {
        // For ElevenLabs, emphasis comes from punctuation and context
        // Add subtle emphasis with punctuation
        optimizedText = optimizedText.replace(
          emp.text,
          `*${emp.text}*`
        );
      });
    }
    
    // Add emotional context for better expression
    // ElevenLabs interprets context from the text itself
    optimizedText = this.addEmotionalContext(optimizedText);
    
    return optimizedText;
  }

  private addEmotionalContext(text: string): string {
    // Best practice: Add contextual cues for emotion
    // Example: "Let's explore" becomes "Let's explore excitedly"
    const emotionalMarkers = {
      'Let\'s explore': 'Let\'s explore with curiosity',
      'Important': 'This is particularly important',
      'Remember': 'Remember carefully',
      'Consider': 'Consider thoughtfully',
    };
    
    let enhancedText = text;
    Object.entries(emotionalMarkers).forEach(([original, enhanced]) => {
      enhancedText = enhancedText.replace(original, enhanced);
    });
    
    return enhancedText;
  }

  private async getAudioDuration(filepath: string): Promise<number> {
    // In production, use an audio library like ffprobe or music-metadata
    // For now, estimate based on text length (150 words per minute)
    // This is a placeholder - implement actual duration detection
    return 30; // Default 30 seconds per slide
  }

  private getPreviousContext(slideNumber: number): string {
    // In production, maintain context from previous narrations
    // This helps with voice continuity
    return '';
  }

  private getNextContext(slideNumber: number): string {
    // In production, provide upcoming context for smoother transitions
    return '';
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  // Alternative implementation for different voice styles
  async generateWithVoiceClone(
    narration: NarrationScript,
    voiceSamplePath: string
  ): Promise<AudioFile> {
    // Best practice for voice cloning:
    // - Use 60+ seconds of clean audio for instant cloning
    // - 30+ minutes for professional cloning
    // - Ensure no background noise or effects
    
    const formData = new FormData();
    formData.append('text', narration.mainNarration);
    formData.append('voice_sample', await fs.readFile(voiceSamplePath));
    
    // Implementation would follow ElevenLabs voice cloning API
    throw new Error('Voice cloning not yet implemented');
  }
}