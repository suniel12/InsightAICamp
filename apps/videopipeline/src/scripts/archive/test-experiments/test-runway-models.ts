#!/usr/bin/env tsx

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

async function testModels() {
  const apiKey = process.env.RUNWAY_API_KEY;
  
  if (!apiKey) {
    console.error('No API key');
    return;
  }

  // Test with different model names and endpoints
  console.log(chalk.cyan('Testing different model configurations...'));
  console.log('');
  
  // Test configurations
  const tests = [
    // Text to Image attempts
    { endpoint: '/v1/text_to_image', model: 'default', body: { prompt: 'test' } },
    { endpoint: '/v1/text_to_image', model: 'gen3', body: { prompt: 'test', model: 'gen3' } },
    { endpoint: '/v1/text_to_image', model: 'stable-diffusion', body: { prompt: 'test', model: 'stable-diffusion' } },
    
    // Image to Video attempts (need to provide an image)
    { endpoint: '/v1/image_to_video', model: 'gen3a_turbo', body: { 
      prompt: 'animate this image',
      model: 'gen3a_turbo',
      image_url: 'https://via.placeholder.com/1280x768.png'
    }},
    
    // Direct generation endpoint attempts
    { endpoint: '/v1/generate', model: 'gen3a_turbo', body: { 
      model: 'gen3a_turbo',
      prompt: 'clouds in the sky',
      duration: 5
    }},
    { endpoint: '/v1/generations', model: 'gen3a_turbo', body: { 
      model: 'gen3a_turbo',
      prompt: 'clouds in the sky',
      duration: 5
    }},
  ];
  
  for (const test of tests) {
    console.log(chalk.yellow(`Testing: ${test.endpoint} with model: ${test.model}`));
    
    try {
      const response = await fetch(`https://api.dev.runwayml.com${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify(test.body)
      });
      
      const text = await response.text();
      
      if (response.status === 200 || response.status === 201) {
        console.log(chalk.green(`  ✅ Success! Status: ${response.status}`));
        try {
          const data = JSON.parse(text);
          console.log(chalk.gray(`  Response: ${JSON.stringify(data).substring(0, 150)}`));
        } catch {
          console.log(chalk.gray(`  Response: ${text.substring(0, 150)}`));
        }
      } else if (response.status === 404) {
        console.log(chalk.red(`  ❌ Endpoint not found`));
      } else if (response.status === 400 || response.status === 422) {
        console.log(chalk.yellow(`  ⚠️  Validation error: ${text}`));
      } else {
        console.log(chalk.red(`  ❌ Status: ${response.status} - ${text.substring(0, 100)}`));
      }
    } catch (error: any) {
      console.log(chalk.red(`  ❌ Error: ${error.message}`));
    }
    
    console.log('');
  }
  
  // Also try to check if there's a way to list available models
  console.log(chalk.cyan('Checking for model listing endpoint...'));
  const modelEndpoints = ['/v1/models', '/models', '/v1/list-models'];
  
  for (const endpoint of modelEndpoints) {
    try {
      const response = await fetch(`https://api.dev.runwayml.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        }
      });
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(chalk.green(`✅ Found models at ${endpoint}:`));
        console.log(data);
        break;
      }
    } catch {}
  }
}

testModels().catch(console.error);