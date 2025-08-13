import { CourseContent, SlideContent } from '../../types/pipeline.types';
import { PPTExtractor } from './ppt-extractor';
import { PDFExtractor } from './pdf-extractor';

export class ExtractionStage {
  private pptExtractor: PPTExtractor;
  private pdfExtractor: PDFExtractor;

  constructor() {
    this.pptExtractor = new PPTExtractor();
    this.pdfExtractor = new PDFExtractor();
  }

  async extract(input: Buffer | string, fileType: 'ppt' | 'pdf'): Promise<CourseContent> {
    if (fileType === 'ppt') {
      return this.pptExtractor.extract(input);
    } else {
      return this.pdfExtractor.extract(input);
    }
  }

  // Extract slide images for visual display
  async extractSlideImages(input: Buffer | string, fileType: 'ppt' | 'pdf'): Promise<string[]> {
    if (fileType === 'ppt') {
      return this.pptExtractor.extractImages(input);
    } else {
      return this.pdfExtractor.extractImages(input);
    }
  }

  // Parse speaker notes from PowerPoint
  async extractSpeakerNotes(input: Buffer | string): Promise<Map<number, string>> {
    return this.pptExtractor.extractSpeakerNotes(input);
  }
}