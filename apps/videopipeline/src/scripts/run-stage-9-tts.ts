#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import { TTSStage } from '../stages/tts';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_ID = 'ps_mNLd3DCJ';

async function runStage9TTS() {
  console.log(chalk.bold.cyan('🎬 Stage 9: Text-to-Speech Audio Generation'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionManager = new PipelineSession(SESSION_ID);
  await sessionManager.load();
  console.log(chalk.green(`✅ Session loaded: ${SESSION_ID}`));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Load Stage 8 narration
  console.log(chalk.yellow('\n📚 Loading Stage 8 narration...'));
  const narrationPath = path.join(sessionDir, 'stage-08-final-narration/narration.json');
  const narrationData = JSON.parse(await fs.readFile(narrationPath, 'utf-8'));
  
  console.log(chalk.gray(`  Word count: ${narrationData.fullScript.split(/\s+/).length}`));
  console.log(chalk.gray(`  Duration: ${narrationData.totalDuration.toFixed(1)}s`));
  console.log(chalk.gray(`  WPM: ${narrationData.wordsPerMinute.toFixed(0)}`));
  
  // Create Stage 9 output directory
  const stage9Dir = path.join(sessionDir, 'stage-09-tts-audio');
  await fs.mkdir(stage9Dir, { recursive: true });
  
  // Check for ElevenLabs API key
  if (!process.env.ELEVENLABS_API_KEY) {
    console.log(chalk.red('❌ ELEVENLABS_API_KEY not found in environment'));
    console.log(chalk.yellow('Creating silent audio fallback...'));
    
    // Create silent audio as fallback
    const { execSync } = await import('child_process').then(m => m);
    const silentAudioPath = path.join(stage9Dir, 'narration.mp3');
    const duration = Math.ceil(narrationData.totalDuration);
    
    try {
      execSync(
        `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -q:a 9 -acodec libmp3lame "${silentAudioPath}" -y`,
        { stdio: 'pipe' }
      );
      
      console.log(chalk.green(`✅ Silent audio created (${duration}s)`));
      
      // Save metadata
      await saveAudioMetadata(stage9Dir, {
        provider: 'silent',
        duration,
        format: 'mp3',
        path: silentAudioPath,
        createdAt: new Date().toISOString()
      });
      
      return;
    } catch (error) {
      console.error(chalk.red('Failed to create silent audio'));
      process.exit(1);
    }
  }
  
  // Generate audio with ElevenLabs
  console.log(chalk.yellow('\n🎙️  Generating audio with ElevenLabs...'));
  console.log(chalk.gray(`  Voice ID: ${process.env.ELEVENLABS_VOICE_ID || 'Default'}`));
  
  const ttsStage = new TTSStage({
    provider: 'elevenlabs',
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
    apiKey: process.env.ELEVENLABS_API_KEY
  });
  
  // Prepare narration for TTS
  const narrationScripts = [{
    slideNumber: 1, // Single continuous narration
    mainNarration: narrationData.fullScript,
    duration: narrationData.totalDuration
  }];
  
  try {
    console.log(chalk.cyan('  Sending request to ElevenLabs API...'));
    const startTime = Date.now();
    
    const audioFiles = await ttsStage.generateAudio(narrationScripts);
    const audioFile = audioFiles[0];
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(chalk.green(`  ✓ Audio generated in ${generationTime}s`));
    
    // Save audio file to Stage 9 directory
    const finalAudioPath = path.join(stage9Dir, 'narration.mp3');
    
    // If the audio file is in a temp location, copy it
    if (audioFile.url && audioFile.url !== finalAudioPath) {
      await fs.copyFile(audioFile.url, finalAudioPath);
      console.log(chalk.gray(`  ✓ Audio saved to stage directory`));
    }
    
    // Get actual audio duration using ffprobe
    const actualDuration = await getAudioDuration(finalAudioPath);
    console.log(chalk.gray(`  ✓ Actual audio duration: ${actualDuration.toFixed(1)}s`));
    
    // Save audio metadata
    const metadata = {
      provider: 'elevenlabs',
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
      duration: actualDuration,
      format: 'mp3',
      path: finalAudioPath,
      fileSize: (await fs.stat(finalAudioPath)).size,
      generationTime,
      createdAt: new Date().toISOString(),
      narrationStats: {
        wordCount: narrationData.fullScript.split(/\s+/).length,
        targetDuration: narrationData.totalDuration,
        actualDuration,
        targetWPM: narrationData.wordsPerMinute,
        actualWPM: (narrationData.fullScript.split(/\s+/).length / actualDuration) * 60
      }
    };
    
    await saveAudioMetadata(stage9Dir, metadata);
    
    console.log(chalk.green('\n✅ Stage 9 completed successfully!'));
    console.log(chalk.gray(`  Output: ${stage9Dir}`));
    console.log(chalk.gray(`  Audio file: narration.mp3`));
    console.log(chalk.gray(`  File size: ${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB`));
    console.log(chalk.gray(`  Duration: ${actualDuration.toFixed(1)}s`));
    console.log(chalk.gray(`  Actual WPM: ${metadata.narrationStats.actualWPM.toFixed(0)}`));
    
  } catch (error: any) {
    console.error(chalk.red(`❌ ElevenLabs API error: ${error.message}`));
    
    // Check if it's a quota error
    if (error.message?.includes('quota') || error.response?.status === 401) {
      console.log(chalk.yellow('\n⚠️  Quota exceeded or authentication issue'));
      console.log(chalk.yellow('Creating silent audio as fallback...'));
      
      // Create silent audio fallback
      const { execSync } = await import('child_process').then(m => m);
      const silentAudioPath = path.join(stage9Dir, 'narration.mp3');
      const duration = Math.ceil(narrationData.totalDuration);
      
      try {
        execSync(
          `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -q:a 9 -acodec libmp3lame "${silentAudioPath}" -y`,
          { stdio: 'pipe' }
        );
        
        console.log(chalk.green(`✅ Silent audio created (${duration}s)`));
        
        await saveAudioMetadata(stage9Dir, {
          provider: 'silent-fallback',
          duration,
          format: 'mp3',
          path: silentAudioPath,
          createdAt: new Date().toISOString(),
          error: error.message
        });
        
      } catch (ffmpegError) {
        console.error(chalk.red('Failed to create fallback audio'));
        process.exit(1);
      }
    } else {
      throw error;
    }
  }
}

async function saveAudioMetadata(stage9Dir: string, metadata: any) {
  await fs.writeFile(
    path.join(stage9Dir, 'audio-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
}

async function getAudioDuration(audioPath: string): Promise<number> {
  const { execSync } = await import('child_process');
  try {
    const output = execSync(
      `ffprobe -i "${audioPath}" -show_entries format=duration -v quiet -of csv="p=0"`,
      { encoding: 'utf-8' }
    );
    return parseFloat(output.trim());
  } catch (error) {
    console.warn(chalk.yellow('Could not determine audio duration, using estimate'));
    return 300; // Default 5 minutes
  }
}

// Run the script
runStage9TTS().catch(error => {
  console.error(chalk.red('❌ Stage 9 failed:'), error);
  process.exit(1);
});