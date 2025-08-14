#!/usr/bin/env tsx

import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateSegmentedTTS(sessionId: string) {
  console.log(chalk.bold.cyan('🎙️  Stage 9: Generating Segmented TTS Audio'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  if (!process.env.ELEVENLABS_API_KEY) {
    console.error(chalk.red('❌ ELEVENLABS_API_KEY not found'));
    process.exit(1);
  }

  try {
    // Create output directory
    const stage9Dir = path.join('pipeline-data/sessions', sessionId, 'stage-09-segmented-tts');
    await fs.mkdir(stage9Dir, { recursive: true });
    
    // Load segments
    const segmentsFile = path.join('pipeline-data/sessions', sessionId, 'stage-08-segmentation/narration-segments.json');
    const segmentsData = await fs.readFile(segmentsFile, 'utf-8');
    const segments = JSON.parse(segmentsData);
    
    console.log(chalk.cyan(`📋 Found ${segments.length} segments to process`));
    console.log('');
    
    const voice_id = 'pNInz6obpgDQGcFmaJgB'; // Adam voice from ElevenLabs
    const generatedAudio = [];

    for (const segment of segments) {
      const audioFileName = `segment-${segment.segmentNumber}-${segment.startTime}.mp3`;
      console.log(chalk.yellow(`🎧 Generating audio for Segment ${segment.segmentNumber}`));
      console.log(chalk.gray(`   Text: ${segment.narrationText.substring(0, 100)}...`));
      console.log(chalk.gray(`   Duration: ${segment.duration}s`));
      console.log('');

      try {
        // Generate audio using ElevenLabs
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY!
          },
          body: JSON.stringify({
            text: segment.narrationText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
        }

        // Save the audio file
        const audioBuffer = await response.arrayBuffer();
        const audioPath = path.join(stage9Dir, audioFileName);
        await fs.writeFile(audioPath, Buffer.from(audioBuffer));
        
        // Get audio duration using ffprobe
        const { execSync } = require('child_process');
        const durationOutput = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`, { encoding: 'utf8' });
        const actualDuration = parseFloat(durationOutput.trim());
        
        console.log(chalk.green(`✅ Generated: ${audioFileName}`));
        console.log(chalk.gray(`   Actual duration: ${actualDuration.toFixed(2)}s`));
        
        generatedAudio.push({
          segmentNumber: segment.segmentNumber,
          filename: audioFileName,
          filepath: audioPath,
          expectedDuration: segment.duration,
          actualDuration: actualDuration,
          startTime: segment.startTime,
          endTime: segment.endTime,
          contentType: segment.contentType,
          contentFile: segment.contentFile
        });
        
      } catch (error) {
        console.error(chalk.red(`❌ Failed to generate audio for segment ${segment.segmentNumber}:`), error);
      }
      
      console.log('');
    }
    
    // Create audio collection manifest
    const audioCollection = {
      sessionId,
      generatedAt: new Date().toISOString(),
      persona: 'Helpdesk/Desktop Support Technician',
      totalSegments: segments.length,
      generatedAudio: generatedAudio,
      totalExpectedDuration: Math.max(...segments.map((s: any) => s.endTime)),
      totalActualDuration: generatedAudio.reduce((sum, audio) => sum + audio.actualDuration, 0),
      voice: {
        provider: 'ElevenLabs',
        voice_id: voice_id,
        voice_name: 'Adam'
      }
    };
    
    await fs.writeFile(
      path.join(stage9Dir, 'segmented-audio-collection.json'),
      JSON.stringify(audioCollection, null, 2),
      'utf-8'
    );
    
    console.log(chalk.bold.green('✅ Stage 9 Complete!'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan('📊 Audio Generation Summary:'));
    console.log(chalk.gray(`  • Total segments processed: ${segments.length}`));
    console.log(chalk.gray(`  • Audio files generated: ${generatedAudio.length}`));
    console.log(chalk.gray(`  • Expected total duration: ${audioCollection.totalExpectedDuration}s`));
    console.log(chalk.gray(`  • Actual total duration: ${audioCollection.totalActualDuration.toFixed(2)}s`));
    
    console.log('');
    console.log(chalk.cyan('📁 Generated Audio Files:'));
    for (const audio of generatedAudio) {
      console.log(chalk.gray(`  • ${audio.filename} (${audio.actualDuration.toFixed(2)}s)`));
    }
    
    console.log('');
    console.log(chalk.yellow(`📍 Location: ${stage9Dir}`));
    console.log('');
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  1. Create timeline (Stage 10)'));
    console.log(chalk.gray('  2. Assemble final video (Stage 11)'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error generating TTS audio:'), error);
    process.exit(1);
  }
}

// Run the script
const sessionId = process.argv[2] || 'ps_f573d96a24';
generateSegmentedTTS(sessionId);