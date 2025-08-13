#!/usr/bin/env tsx

import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

async function testRunwayEndpoints() {
  console.log(chalk.bold.cyan('🚀 Runway API Endpoint Test'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  
  const apiKey = process.env.RUNWAY_API_KEY;
  
  if (!apiKey) {
    console.error(chalk.red('❌ RUNWAY_API_KEY not found'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ API Key found'));
  console.log(chalk.gray(`Key starts with: ${apiKey.substring(0, 10)}...`));
  console.log('');
  
  const endpoints = [
    { name: 'Root', url: 'https://api.dev.runwayml.com/', method: 'GET' },
    { name: 'Health', url: 'https://api.dev.runwayml.com/health', method: 'GET' },
    { name: 'Status', url: 'https://api.dev.runwayml.com/status', method: 'GET' },
    { name: 'User Info', url: 'https://api.dev.runwayml.com/v1/user', method: 'GET' },
    { name: 'Models', url: 'https://api.dev.runwayml.com/v1/models', method: 'GET' },
    { name: 'Tasks List', url: 'https://api.dev.runwayml.com/v1/tasks', method: 'GET' },
    { name: 'Text to Image', url: 'https://api.dev.runwayml.com/v1/text_to_image', method: 'OPTIONS' },
    { name: 'Image to Video', url: 'https://api.dev.runwayml.com/v1/image_to_video', method: 'OPTIONS' },
  ];
  
  console.log(chalk.yellow('Testing endpoints...'));
  console.log('');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000),
      });
      
      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 200 || status === 204) {
        console.log(chalk.green(`✅ ${endpoint.name}: ${status} ${statusText}`));
        
        // Try to get response body if it's JSON
        if (endpoint.method === 'GET' && status === 200) {
          try {
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              const data = await response.json();
              if (endpoint.name === 'Models' && Array.isArray(data)) {
                console.log(chalk.gray(`   Available models: ${data.join(', ')}`));
              } else if (endpoint.name === 'User Info') {
                console.log(chalk.gray(`   User data received`));
              }
            }
          } catch {}
        }
      } else if (status === 401) {
        console.log(chalk.red(`❌ ${endpoint.name}: ${status} Unauthorized - Check API key`));
      } else if (status === 404) {
        console.log(chalk.yellow(`⚠️  ${endpoint.name}: ${status} Not Found`));
      } else {
        console.log(chalk.yellow(`⚠️  ${endpoint.name}: ${status} ${statusText}`));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(chalk.red(`❌ ${endpoint.name}: Timeout`));
      } else {
        console.log(chalk.red(`❌ ${endpoint.name}: ${error.message}`));
      }
    }
  }
  
  console.log('');
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  
  // Try to make a simple POST request to see what the API expects
  console.log(chalk.cyan('Testing POST to text_to_image...'));
  try {
    const testResponse = await fetch('https://api.dev.runwayml.com/v1/text_to_image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        prompt: 'A simple test image',
      })
    });
    
    const responseText = await testResponse.text();
    console.log(chalk.gray('Response status:', testResponse.status));
    console.log(chalk.gray('Response:', responseText.substring(0, 200)));
    
    // If we get a validation error, it might tell us what parameters are needed
    if (testResponse.status === 400 || testResponse.status === 422) {
      try {
        const errorData = JSON.parse(responseText);
        console.log(chalk.yellow('Validation error details:'));
        console.log(JSON.stringify(errorData, null, 2));
      } catch {}
    }
  } catch (error) {
    console.error(chalk.red('POST test failed:'), error);
  }
  
  console.log('');
  console.log(chalk.cyan('📝 Documentation:'));
  console.log(chalk.gray('Main docs: https://docs.dev.runwayml.com/'));
  console.log(chalk.gray('API reference: https://docs.dev.runwayml.com/api/'));
  console.log(chalk.gray('Dev portal: https://dev.runwayml.com/'));
}

// Run the test
testRunwayEndpoints().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});