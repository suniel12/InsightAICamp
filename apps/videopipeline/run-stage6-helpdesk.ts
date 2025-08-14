#!/usr/bin/env tsx

import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function generateHelpdeskImages(sessionId: string) {
  console.log(chalk.bold.cyan('🎨 Generating Stage 6: AI Images for Helpdesk Persona'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.yellow(`📁 Session: ${sessionId}`));
  console.log('');

  if (!process.env.OPENAI_API_KEY) {
    console.error(chalk.red('❌ OPENAI_API_KEY not found'));
    process.exit(1);
  }

  try {
    // Create output directories
    const stage6Dir = path.join('pipeline-data/sessions', sessionId, 'stage-06-ai-media');
    const imagesDir = path.join(stage6Dir, 'images');
    await fs.mkdir(imagesDir, { recursive: true });
    
    // Load image prompts
    const promptsFile = path.join('pipeline-data/sessions', sessionId, 'stage-05-script-video-planning/image-prompts.json');
    const promptsData = await fs.readFile(promptsFile, 'utf-8');
    const prompts = JSON.parse(promptsData);
    
    console.log(chalk.cyan(`📋 Found ${prompts.images.length} image prompts to generate`));
    console.log('');
    
    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const generatedImages = [];

    for (const imagePrompt of prompts.images) {
      console.log(chalk.yellow(`🖼️  Generating: ${imagePrompt.id}`));
      console.log(chalk.gray(`   Purpose: ${imagePrompt.purpose}`));
      console.log(chalk.gray(`   Timing: ${imagePrompt.timing}`));
      console.log('');

      try {
        // Generate image using DALL-E
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: imagePrompt.prompt,
          size: '1792x1024',
          quality: 'hd',
          n: 1,
        });

        if (response.data && response.data[0] && response.data[0].url) {
          const imageUrl = response.data[0].url;
          
          // Download the image
          console.log(chalk.cyan(`📥 Downloading image...`));
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          
          // Save the image
          const filename = `${imagePrompt.id}.png`;
          const filepath = path.join(imagesDir, filename);
          await fs.writeFile(filepath, Buffer.from(imageBuffer));
          
          console.log(chalk.green(`✅ Saved: ${filename}`));
          
          generatedImages.push({
            id: imagePrompt.id,
            filename: filename,
            slide: imagePrompt.slide,
            purpose: imagePrompt.purpose,
            timing: imagePrompt.timing,
            filepath: filepath
          });
          
        } else {
          throw new Error('No image URL returned');
        }
        
      } catch (error) {
        console.error(chalk.red(`❌ Failed to generate ${imagePrompt.id}:`), error);
      }
      
      console.log('');
    }
    
    // Create media manifest
    const mediaManifest = {
      sessionId,
      generatedAt: new Date().toISOString(),
      persona: 'Helpdesk/Desktop Support Technician',
      images: generatedImages,
      videos: [
        {
          id: 'slide4_vid1',
          filename: 'slide4_vid1.mp4',
          slide: '4',
          purpose: 'data center walkthrough',
          timing: 'reused from previous session'
        }
      ],
      totalAssets: generatedImages.length + 1
    };
    
    await fs.writeFile(
      path.join(stage6Dir, 'media-manifest.json'),
      JSON.stringify(mediaManifest, null, 2),
      'utf-8'
    );
    
    console.log(chalk.bold.green('✅ Stage 6 Complete!'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.cyan('📁 Generated Assets:'));
    
    for (const img of generatedImages) {
      console.log(chalk.gray(`  • ${img.filename} (Slide ${img.slide})`));
    }
    console.log(chalk.gray(`  • slide4_vid1.mp4 (reused)`));
    
    console.log('');
    console.log(chalk.yellow(`📍 Location: ${stage6Dir}`));
    console.log('');
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  1. Review generated images'));
    console.log(chalk.gray('  2. Create formatted narration (Stage 8)'));
    console.log(chalk.gray('  3. Segment narration'));
    console.log(chalk.gray('  4. Generate TTS audio (Stage 9)'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error generating images:'), error);
    process.exit(1);
  }
}

// Run the script
const sessionId = process.argv[2] || 'ps_f573d96a24';
generateHelpdeskImages(sessionId);