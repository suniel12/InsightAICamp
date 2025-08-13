import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch';

export interface ImageGenerationRequest {
  prompt: string;
  slideNumber: number;
  fileName: string;
  purpose?: string;
}

export interface GeneratedImage {
  fileName: string;
  slideNumber: number;
  prompt: string;
  url?: string;
  localPath: string;
  status: 'success' | 'failed' | 'placeholder';
  error?: string;
}

export class ImagenGenerator {
  private genAI: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    try {
      console.log(`🎨 Generating image for slide ${request.slideNumber}...`);
      
      // Use Gemini's imagen model (when available)
      // Note: As of now, Imagen might not be directly available through Gemini API
      // This is a placeholder for when it becomes available
      
      const model = this.genAI.getGenerativeModel({ 
        model: 'imagen-4-ultra' // or appropriate model name when available
      });

      // Enhanced prompt for better results
      const enhancedPrompt = `Create a professional educational illustration:
${request.prompt}

Style: Clean, modern, educational infographic
Quality: High resolution, suitable for presentation
Color scheme: Professional with accent colors
Details: Clear labels and annotations where appropriate`;

      // Generate image (placeholder for actual API call)
      // When Imagen is available through Gemini, it would be something like:
      // const result = await model.generateImage({ prompt: enhancedPrompt });
      
      // For now, return placeholder
      return {
        fileName: request.fileName,
        slideNumber: request.slideNumber,
        prompt: request.prompt,
        localPath: '',
        status: 'placeholder',
        error: 'Imagen 4 Ultra API not yet available through Gemini'
      };
      
    } catch (error) {
      console.error(`❌ Error generating image:`, error);
      return {
        fileName: request.fileName,
        slideNumber: request.slideNumber,
        prompt: request.prompt,
        localPath: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateBatch(requests: ImageGenerationRequest[]): Promise<GeneratedImage[]> {
    console.log(`🎨 Generating ${requests.length} images...`);
    
    const results: GeneratedImage[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(req => this.generateImage(req))
      );
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  // Alternative: Use Stability AI or other image generation APIs
  async generateWithStabilityAI(
    request: ImageGenerationRequest,
    apiKey: string
  ): Promise<GeneratedImage> {
    try {
      const response = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: request.prompt,
                weight: 1
              }
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJSON = await response.json() as any;
      const image = responseJSON.artifacts[0];
      
      // Save base64 image to file
      const imageData = Buffer.from(image.base64, 'base64');
      const outputPath = `generated_${request.fileName}`;
      await fs.writeFile(outputPath, imageData);

      return {
        fileName: request.fileName,
        slideNumber: request.slideNumber,
        prompt: request.prompt,
        localPath: outputPath,
        status: 'success'
      };
      
    } catch (error) {
      console.error('Stability AI error:', error);
      return {
        fileName: request.fileName,
        slideNumber: request.slideNumber,
        prompt: request.prompt,
        localPath: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Placeholder for when Imagen 4 Ultra becomes available
export class Imagen4UltraGenerator {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(prompt: string, options?: any): Promise<Buffer | null> {
    // This will be implemented when Imagen 4 Ultra API is available
    console.log('Imagen 4 Ultra API integration pending...');
    console.log('Prompt:', prompt);
    
    // Return null for now
    return null;
  }
}