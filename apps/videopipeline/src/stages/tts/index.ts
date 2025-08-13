import { AudioSegment, SegmentedAudioCollection, SpeechMark } from '../../types/pipeline.types';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

export interface SegmentedTTSConfig {
  provider: 'elevenlabs' | 'aws-polly' | 'google';
  voiceId: string;
  apiKey: string;
  speechMarks?: boolean; // Enable speech marks for word-level timing
  outputFormat: 'mp3' | 'wav';
}

export interface TTSSegmentResult {
  segment: AudioSegment;
  audioFilePath: string;
  duration: number;
  speechMarks?: SpeechMark[];
  metadata: {
    fileSize: number;
    generationTime: number;
  };
}

export class SegmentedTTSStage {
  private config: SegmentedTTSConfig;

  constructor(config: SegmentedTTSConfig) {
    this.config = config;
  }

  async generateSegmentedAudio(
    audioSegments: AudioSegment[], 
    sessionDir: string
  ): Promise<SegmentedAudioCollection> {
    console.log(chalk.cyan('🎤 Generating segmented TTS audio...'));
    console.log(chalk.gray(`  Provider: ${this.config.provider}`));
    console.log(chalk.gray(`  Segments: ${audioSegments.length}`));
    console.log(chalk.gray(`  Voice: ${this.config.voiceId}`));

    const outputDir = path.join(sessionDir, 'stage-09-segmented-tts');
    await fs.mkdir(outputDir, { recursive: true });

    const results: TTSSegmentResult[] = [];
    let totalDuration = 0;
    let totalFileSize = 0;

    // Process segments in parallel with concurrency limit
    const concurrencyLimit = 3;
    for (let i = 0; i < audioSegments.length; i += concurrencyLimit) {
      const batch = audioSegments.slice(i, i + concurrencyLimit);
      
      console.log(chalk.yellow(`\n🔄 Processing batch ${Math.floor(i / concurrencyLimit) + 1}/${Math.ceil(audioSegments.length / concurrencyLimit)}`));
      
      const batchPromises = batch.map(segment => 
        this.generateSingleSegment(segment, outputDir)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Update totals
      for (const result of batchResults) {
        totalDuration += result.duration;
        totalFileSize += result.metadata.fileSize;
        console.log(chalk.green(`  ✓ ${result.segment.id}: ${result.duration.toFixed(1)}s (${Math.round(result.metadata.fileSize / 1024)}KB)`));
      }
    }

    // Create final collection with updated segments
    const finalSegments = results.map(result => ({
      ...result.segment,
      audioFile: result.audioFilePath,
      duration: result.duration,
      speechMarks: result.speechMarks,
      metadata: {
        ...result.segment.metadata!,
        provider: this.config.provider,
        voiceId: this.config.voiceId,
        fileSize: result.metadata.fileSize
      }
    }));

    // Update start/end times based on actual audio durations
    let cumulativeTime = 0;
    for (const segment of finalSegments) {
      segment.startTime = cumulativeTime;
      segment.endTime = cumulativeTime + segment.duration;
      cumulativeTime += segment.duration;
    }

    const collection: SegmentedAudioCollection = {
      segments: finalSegments,
      totalDuration,
      sessionId: sessionDir.split('/').pop() || '',
      createdAt: new Date().toISOString(),
      metadata: {
        segmentCount: finalSegments.length,
        provider: this.config.provider,
        voiceId: this.config.voiceId,
        totalFileSize
      }
    };

    // Save collection metadata
    const collectionPath = path.join(outputDir, 'segmented-audio-collection.json');
    await fs.writeFile(collectionPath, JSON.stringify(collection, null, 2));

    console.log(chalk.green('\n✅ Segmented TTS generation complete!'));
    console.log(chalk.gray(`  Total duration: ${totalDuration.toFixed(1)}s`));
    console.log(chalk.gray(`  Total size: ${Math.round(totalFileSize / 1024 / 1024 * 100) / 100}MB`));
    console.log(chalk.gray(`  Collection saved: ${collectionPath}`));

    return collection;
  }

  private async generateSingleSegment(
    segment: AudioSegment, 
    outputDir: string
  ): Promise<TTSSegmentResult> {
    const startTime = Date.now();
    const fileName = `${segment.id}.${this.config.outputFormat}`;
    const audioFilePath = path.join(outputDir, fileName);

    let duration: number;
    let speechMarks: SpeechMark[] | undefined;
    let fileSize: number;

    try {
      switch (this.config.provider) {
        case 'elevenlabs':
          ({ duration, speechMarks, fileSize } = await this.generateWithElevenLabs(segment.narrationText, audioFilePath));
          break;
        case 'aws-polly':
          ({ duration, speechMarks, fileSize } = await this.generateWithAWSPolly(segment.narrationText, audioFilePath));
          break;
        case 'google':
          ({ duration, speechMarks, fileSize } = await this.generateWithGoogle(segment.narrationText, audioFilePath));
          break;
        default:
          throw new Error(`Unsupported TTS provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(chalk.red(`  ❌ Failed to generate ${segment.id}:`), error);
      throw error;
    }

    const generationTime = Date.now() - startTime;

    return {
      segment,
      audioFilePath,
      duration,
      speechMarks,
      metadata: {
        fileSize,
        generationTime
      }
    };
  }

  private async generateWithElevenLabs(text: string, outputPath: string): Promise<{
    duration: number;
    speechMarks?: SpeechMark[];
    fileSize: number;
  }> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(outputPath, buffer);
    
    // Get audio duration using ffprobe-like calculation
    const duration = await this.getAudioDuration(outputPath);
    
    return {
      duration,
      fileSize: buffer.length,
      speechMarks: undefined // ElevenLabs doesn't provide speech marks yet
    };
  }

  private async generateWithAWSPolly(text: string, outputPath: string): Promise<{
    duration: number;
    speechMarks?: SpeechMark[];
    fileSize: number;
  }> {
    // AWS Polly implementation with speech marks
    // This would require AWS SDK setup
    throw new Error('AWS Polly implementation not yet available');
  }

  private async generateWithGoogle(text: string, outputPath: string): Promise<{
    duration: number;
    speechMarks?: SpeechMark[];
    fileSize: number;
  }> {
    // Google Cloud TTS implementation
    throw new Error('Google TTS implementation not yet available');
  }

  private async getAudioDuration(filePath: string): Promise<number> {
    try {
      // Use ffprobe to get precise duration
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync(
        `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`
      );
      
      return parseFloat(stdout.trim());
    } catch (error) {
      console.warn(`Could not get precise duration for ${filePath}, using estimation`);
      
      // Fallback: estimate based on text length and speech rate
      const text = ''; // We'd need to pass this through
      const wordsPerMinute = 150; // Average speech rate
      const wordCount = text.split(' ').length;
      return (wordCount / wordsPerMinute) * 60;
    }
  }

  async loadExistingCollection(sessionDir: string): Promise<SegmentedAudioCollection | null> {
    try {
      const collectionPath = path.join(sessionDir, 'stage-09-segmented-tts/segmented-audio-collection.json');
      const content = await fs.readFile(collectionPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
}