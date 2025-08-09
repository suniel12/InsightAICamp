import { SlideContent } from '../../types/pipeline.types';
import axios from 'axios';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SlideEnhancement {
  slideNumber: number;
  originalContent: SlideContent;
  enhancedImageUrl?: string;
  visualElements?: Array<{
    type: 'diagram' | 'chart' | 'icon' | 'background';
    url: string;
    position?: { x: number; y: number };
  }>;
  layout?: 'standard' | 'two-column' | 'centered' | 'visual-heavy';
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export class SlidesStage {
  private outputDir: string;
  private brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };

  constructor() {
    this.outputDir = '/tmp/enhanced-slides';
    this.brandColors = {
      primary: '#2563eb',    // Blue
      secondary: '#10b981',  // Green
      accent: '#f59e0b',     // Amber
      background: '#ffffff', // White
    };
  }

  async enhance(slides: SlideContent[]): Promise<SlideEnhancement[]> {
    await this.ensureOutputDir();
    
    const enhanced: SlideEnhancement[] = [];
    
    for (const slide of slides) {
      const enhancement = await this.enhanceSingleSlide(slide);
      enhanced.push(enhancement);
    }
    
    return enhanced;
  }

  private async enhanceSingleSlide(slide: SlideContent): Promise<SlideEnhancement> {
    // Determine optimal layout based on content
    const layout = this.determineLayout(slide);
    
    // Generate visual elements if needed
    const visualElements = await this.generateVisualElements(slide);
    
    // Create enhanced slide image
    const enhancedImageUrl = await this.createEnhancedSlide(slide, layout, visualElements);
    
    return {
      slideNumber: slide.number,
      originalContent: slide,
      enhancedImageUrl,
      visualElements,
      layout,
      colorScheme: this.brandColors,
    };
  }

  private determineLayout(slide: SlideContent): SlideEnhancement['layout'] {
    // Best practice: Choose layout based on content type
    const bulletCount = slide.bullets.length;
    const hasImages = slide.images && slide.images.length > 0;
    const titleLength = slide.title.length;
    
    if (hasImages && bulletCount <= 3) {
      return 'visual-heavy';
    } else if (bulletCount > 5) {
      return 'two-column';
    } else if (titleLength > 50 || bulletCount === 0) {
      return 'centered';
    }
    
    return 'standard';
  }

  private async generateVisualElements(slide: SlideContent): Promise<SlideEnhancement['visualElements']> {
    const elements: SlideEnhancement['visualElements'] = [];
    
    // Analyze content for visual opportunities
    const contentType = this.analyzeContentType(slide);
    
    switch (contentType) {
      case 'process':
        // Generate process diagram
        elements.push({
          type: 'diagram',
          url: await this.generateProcessDiagram(slide),
        });
        break;
        
      case 'comparison':
        // Generate comparison chart
        elements.push({
          type: 'chart',
          url: await this.generateComparisonChart(slide),
        });
        break;
        
      case 'list':
        // Add icon for each bullet point
        for (let i = 0; i < slide.bullets.length; i++) {
          elements.push({
            type: 'icon',
            url: await this.selectIcon(slide.bullets[i]),
            position: { x: 50, y: 200 + i * 80 },
          });
        }
        break;
        
      default:
        // Add subtle background pattern
        elements.push({
          type: 'background',
          url: await this.generateBackgroundPattern(slide.number),
        });
    }
    
    return elements;
  }

  private analyzeContentType(slide: SlideContent): string {
    const text = `${slide.title} ${slide.bullets.join(' ')}`.toLowerCase();
    
    if (text.includes('step') || text.includes('process') || text.includes('workflow')) {
      return 'process';
    } else if (text.includes('vs') || text.includes('compare') || text.includes('difference')) {
      return 'comparison';
    } else if (slide.bullets.length > 3) {
      return 'list';
    }
    
    return 'standard';
  }

  private async createEnhancedSlide(
    slide: SlideContent,
    layout: SlideEnhancement['layout'],
    visualElements: SlideEnhancement['visualElements']
  ): Promise<string> {
    // Create slide using sharp (image processing library)
    const width = 1920;
    const height = 1080;
    
    // Start with base slide
    let composite = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: this.brandColors.background,
      },
    });
    
    // Add visual elements as overlays
    const overlays: any[] = [];
    
    // Add title
    const titleSvg = this.createTitleSvg(slide.title, layout);
    overlays.push({
      input: Buffer.from(titleSvg),
      top: 100,
      left: 100,
    });
    
    // Add bullets based on layout
    const bulletsSvg = this.createBulletsSvg(slide.bullets, layout);
    overlays.push({
      input: Buffer.from(bulletsSvg),
      top: layout === 'centered' ? 400 : 250,
      left: layout === 'two-column' ? 100 : 150,
    });
    
    // Apply overlays
    if (overlays.length > 0) {
      composite = composite.composite(overlays);
    }
    
    // Save enhanced slide
    const filename = `slide_${slide.number}_enhanced.png`;
    const filepath = path.join(this.outputDir, filename);
    await composite.png().toFile(filepath);
    
    return filepath;
  }

  private createTitleSvg(title: string, layout: SlideEnhancement['layout']): string {
    const fontSize = layout === 'centered' ? 72 : 56;
    const x = layout === 'centered' ? 960 : 100;
    const textAnchor = layout === 'centered' ? 'middle' : 'start';
    
    return `
      <svg width="1920" height="200">
        <text 
          x="${x}" 
          y="100" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold"
          fill="${this.brandColors.primary}"
          text-anchor="${textAnchor}"
        >
          ${this.escapeXml(title)}
        </text>
      </svg>
    `;
  }

  private createBulletsSvg(bullets: string[], layout: SlideEnhancement['layout']): string {
    const fontSize = 32;
    const lineHeight = 50;
    const maxWidth = layout === 'two-column' ? 800 : 1600;
    
    let svgContent = `<svg width="${maxWidth}" height="${bullets.length * lineHeight + 100}">`;
    
    bullets.forEach((bullet, index) => {
      const y = index * lineHeight + 40;
      const column = layout === 'two-column' && index >= bullets.length / 2 ? 1 : 0;
      const x = column * 850 + 40;
      const adjustedY = column === 1 ? y - (bullets.length / 2) * lineHeight : y;
      
      // Add bullet point
      svgContent += `
        <circle cx="${x - 20}" cy="${adjustedY - 10}" r="5" fill="${this.brandColors.accent}" />
        <text 
          x="${x}" 
          y="${adjustedY}" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize}"
          fill="#333333"
        >
          ${this.escapeXml(bullet)}
        </text>
      `;
    });
    
    svgContent += '</svg>';
    return svgContent;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async generateProcessDiagram(slide: SlideContent): Promise<string> {
    // In production, use a diagram generation service or library
    // For now, return a placeholder
    return '/assets/process-diagram-placeholder.svg';
  }

  private async generateComparisonChart(slide: SlideContent): Promise<string> {
    // In production, use a chart generation library
    return '/assets/comparison-chart-placeholder.svg';
  }

  private async selectIcon(bulletText: string): Promise<string> {
    // In production, use an icon selection AI or library
    // Map keywords to appropriate icons
    const iconMap: Record<string, string> = {
      'server': '🖥️',
      'network': '🌐',
      'storage': '💾',
      'security': '🔒',
      'cloud': '☁️',
      'data': '📊',
    };
    
    const text = bulletText.toLowerCase();
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (text.includes(keyword)) {
        return icon;
      }
    }
    
    return '•';
  }

  private async generateBackgroundPattern(slideNumber: number): Promise<string> {
    // Generate subtle geometric pattern based on slide number for variety
    const patterns = ['dots', 'lines', 'grid', 'waves'];
    const pattern = patterns[slideNumber % patterns.length];
    return `/assets/pattern-${pattern}.svg`;
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  // Method to convert existing PowerPoint slides to images
  async convertSlidesToImages(pptxPath: string): Promise<string[]> {
    const outputDir = path.join(this.outputDir, 'converted');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Use LibreOffice or unoconv for conversion
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      // Convert PPTX to PDF first for better quality
      await execAsync(`libreoffice --headless --convert-to pdf --outdir ${outputDir} ${pptxPath}`);
      
      const pdfPath = path.join(outputDir, path.basename(pptxPath, '.pptx') + '.pdf');
      
      // Convert PDF to images using ImageMagick or similar
      await execAsync(`convert -density 150 ${pdfPath} ${outputDir}/slide-%03d.png`);
      
      // Get list of generated images
      const files = await fs.readdir(outputDir);
      const images = files
        .filter(f => f.startsWith('slide-') && f.endsWith('.png'))
        .sort()
        .map(f => path.join(outputDir, f));
      
      return images;
    } catch (error) {
      console.error('Slide conversion error:', error);
      throw new Error('Failed to convert slides to images');
    }
  }
}