import { CourseContent, SlideContent } from '../../types/pipeline.types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export class PPTExtractor {
  async extract(input: Buffer | string): Promise<CourseContent> {
    // For now, we'll use a Python script with python-pptx
    // In production, you might want to use a dedicated service
    
    const tempDir = await fs.mkdtemp('/tmp/ppt-extract-');
    const inputPath = path.join(tempDir, 'input.pptx');
    
    try {
      // Write input to temp file
      if (Buffer.isBuffer(input)) {
        await fs.writeFile(inputPath, input);
      } else {
        await fs.copyFile(input, inputPath);
      }
      
      // Extract using Python script (we'll create this)
      const pythonScript = path.join(__dirname, 'extract_ppt.py');
      const { stdout } = await execAsync(`python3 ${pythonScript} ${inputPath}`);
      
      const extractedData = JSON.parse(stdout);
      
      return this.formatCourseContent(extractedData);
    } finally {
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  async extractImages(input: Buffer | string): Promise<string[]> {
    // Convert PPT slides to images using LibreOffice or similar
    const tempDir = await fs.mkdtemp('/tmp/ppt-images-');
    const inputPath = path.join(tempDir, 'input.pptx');
    
    try {
      if (Buffer.isBuffer(input)) {
        await fs.writeFile(inputPath, input);
      } else {
        await fs.copyFile(input, inputPath);
      }
      
      // Convert to images using LibreOffice in headless mode
      await execAsync(
        `libreoffice --headless --convert-to jpg --outdir ${tempDir} ${inputPath}`
      );
      
      // Read all generated images
      const files = await fs.readdir(tempDir);
      const images = files
        .filter(f => f.endsWith('.jpg'))
        .sort()
        .map(f => path.join(tempDir, f));
      
      // Convert to base64 or upload to storage
      const imageUrls: string[] = [];
      for (const imagePath of images) {
        const imageBuffer = await fs.readFile(imagePath);
        const base64 = imageBuffer.toString('base64');
        imageUrls.push(`data:image/jpeg;base64,${base64}`);
      }
      
      return imageUrls;
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  async extractSpeakerNotes(input: Buffer | string): Promise<Map<number, string>> {
    const content = await this.extract(input);
    const notes = new Map<number, string>();
    
    content.slides.forEach(slide => {
      if (slide.speakerNotes) {
        notes.set(slide.number, slide.speakerNotes);
      }
    });
    
    return notes;
  }

  private formatCourseContent(data: any): CourseContent {
    return {
      id: `course-${Date.now()}`,
      title: data.title || 'Untitled Course',
      slides: data.slides.map((slide: any, index: number) => ({
        number: index + 1,
        title: slide.title || '',
        bullets: slide.bullets || [],
        speakerNotes: slide.notes || '',
        images: slide.images || [],
      })),
      metadata: {
        author: data.author,
        createdAt: new Date(),
        slideCount: data.slides.length,
        estimatedDuration: data.slides.length * 30, // 30 seconds per slide estimate
      },
    };
  }
}