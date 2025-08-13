#!/usr/bin/env tsx

import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface RunwayTaskResponse {
  id: string;
  name?: string;
  createdAt?: string;
  status?: string;
}

interface RunwayTaskStatusResponse {
  id: string;
  status: string;
  progress?: number;
  artifacts?: Array<{
    id: string;
    createdAt: string;
    url: string;
    filename: string;
    mediaType: string;
  }>;
  failure?: string;
  failureCode?: string;
}

async function generateVideoWithRunway(prompt: string, apiKey: string): Promise<void> {
  try {
    console.log(chalk.cyan('🎬 Testing Runway API endpoints...'));
    console.log(chalk.gray('Prompt: ' + prompt));
    console.log('');
    
    // Try text-to-image first as a test
    console.log(chalk.yellow('📤 Testing text-to-image endpoint...'));
    const createResponse = await fetch('https://api.dev.runwayml.com/v1/text_to_image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'gen3a_turbo',
        width: 1280,
        height: 768,
        num_outputs: 1
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create task: ${createResponse.status} - ${errorText}`);
    }

    const task = await createResponse.json() as RunwayTaskResponse;
    console.log(chalk.green(`✅ Task created: ${task.id}`));
    console.log('');
    
    // Poll for completion
    console.log(chalk.yellow('⏳ Waiting for video generation...'));
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max (5 seconds * 120)
    let lastProgress = -1;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        }
      });
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(chalk.red(`Status check failed: ${errorText}`));
        attempts++;
        continue;
      }
      
      const status = await statusResponse.json() as RunwayTaskStatusResponse;
      
      // Show progress if available
      if (status.progress !== undefined && status.progress !== lastProgress) {
        lastProgress = status.progress;
        const progressBar = '█'.repeat(Math.floor(status.progress / 5)) + '░'.repeat(20 - Math.floor(status.progress / 5));
        process.stdout.write(`\r   Progress: [${progressBar}] ${status.progress}%`);
      }
      
      if (status.status === 'SUCCEEDED' && status.artifacts && status.artifacts.length > 0) {
        console.log(''); // New line after progress
        console.log(chalk.green('✅ Video generation complete!'));
        
        const videoArtifact = status.artifacts[0];
        console.log(chalk.cyan('📹 Video details:'));
        console.log(chalk.gray(`   ID: ${videoArtifact.id}`));
        console.log(chalk.gray(`   URL: ${videoArtifact.url}`));
        console.log(chalk.gray(`   Filename: ${videoArtifact.filename}`));
        console.log('');
        
        // Download the video
        console.log(chalk.yellow('📥 Downloading video...'));
        const videoResponse = await fetch(videoArtifact.url);
        if (!videoResponse.ok) {
          throw new Error(`Failed to download video: ${videoResponse.status}`);
        }
        
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
        
        // Save to output directory
        const outputDir = 'output/runway-test';
        await fs.mkdir(outputDir, { recursive: true });
        const outputPath = path.join(outputDir, `runway_${Date.now()}.mp4`);
        await fs.writeFile(outputPath, videoBuffer);
        
        console.log(chalk.green(`✅ Video saved to: ${outputPath}`));
        console.log(chalk.gray(`   Size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`));
        
        return;
      } else if (status.status === 'FAILED') {
        throw new Error(`Generation failed: ${status.failure} (${status.failureCode})`);
      } else if (status.status === 'CANCELLED') {
        throw new Error('Generation was cancelled');
      }
      
      attempts++;
      
      // Show status every 30 seconds
      if (attempts % 6 === 0) {
        console.log('');
        console.log(chalk.gray(`   Status: ${status.status} (${attempts * 5}s elapsed)`));
      }
    }
    
    throw new Error('Video generation timed out after 10 minutes');
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    throw error;
  }
}

async function testRunwayAPI() {
  console.log(chalk.bold.cyan('🚀 Runway API Test'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  
  const apiKey = process.env.RUNWAY_API_KEY;
  
  if (!apiKey) {
    console.error(chalk.red('❌ RUNWAY_API_KEY not found in environment variables'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ API Key found'));
  console.log('');
  
  // Test with a simple prompt
  const testPrompt = "A serene timelapse of clouds moving across a blue sky, with soft sunlight breaking through, cinematic quality, smooth camera movement";
  
  try {
    // First, let's check if we can access the API
    console.log(chalk.cyan('🔍 Testing API access...'));
    const testResponse = await fetch('https://api.dev.runwayml.com/v1/tasks?limit=1', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06',
      }
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      throw new Error(`API access test failed: ${testResponse.status} - ${errorText}`);
    }
    
    console.log(chalk.green('✅ API access confirmed'));
    console.log('');
    
    // Generate video
    await generateVideoWithRunway(testPrompt, apiKey);
    
    console.log('');
    console.log(chalk.green('🎉 Runway test completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('Test failed:'), error);
    
    // Provide helpful debugging info
    console.log('');
    console.log(chalk.yellow('📝 Debugging tips:'));
    console.log(chalk.gray('1. Verify your API key is correct'));
    console.log(chalk.gray('2. Check if your account has sufficient credits'));
    console.log(chalk.gray('3. Ensure the API key has the necessary permissions'));
    console.log(chalk.gray('4. API endpoint: https://api.dev.runwayml.com'));
    console.log(chalk.gray('5. Documentation: https://docs.dev.runwayml.com'));
    
    process.exit(1);
  }
}

// Run the test
testRunwayAPI().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});