import { CourseContent, PipelineConfig, PipelineJob } from '../types/pipeline.types';
import { ExtractionStage } from '../stages/extraction';
import { NarrationStage } from '../stages/narration';
import { SlidesStage } from '../stages/slides';
import { TTSStage } from '../stages/tts';
import { VideoStage } from '../stages/video';
import { AssemblyStage } from '../stages/assembly';

export class VideoPipeline {
  private config: PipelineConfig;
  private stages: {
    extraction: ExtractionStage;
    narration: NarrationStage;
    slides: SlidesStage;
    tts: TTSStage;
    video: VideoStage;
    assembly: AssemblyStage;
  };

  constructor(config: PipelineConfig) {
    this.config = config;
    
    // Initialize all pipeline stages
    this.stages = {
      extraction: new ExtractionStage(),
      narration: new NarrationStage(config.llm),
      slides: new SlidesStage(),
      tts: new TTSStage(config.tts),
      video: new VideoStage(config.videoGen),
      assembly: new AssemblyStage(config.output),
    };
  }

  async processCourse(inputFile: Buffer | string, fileType: 'ppt' | 'pdf'): Promise<string> {
    console.log('🚀 Starting video pipeline processing...');
    
    try {
      // Stage 1: Extract content from PPT/PDF
      console.log('📄 Stage 1: Extracting content...');
      const content = await this.stages.extraction.extract(inputFile, fileType);
      console.log(`✅ Extracted ${content.slides.length} slides`);
      
      // Stage 2: Generate narration scripts
      console.log('✍️ Stage 2: Generating narration scripts...');
      const narrations = await this.stages.narration.generate(content);
      console.log(`✅ Generated narration for ${narrations.length} slides`);
      
      // Stage 3: Enhance slides (if needed)
      console.log('🎨 Stage 3: Enhancing slides...');
      const enhancedSlides = await this.stages.slides.enhance(content.slides);
      console.log(`✅ Enhanced ${enhancedSlides.length} slides`);
      
      // Stage 4: Generate audio narration
      console.log('🎙️ Stage 4: Generating audio narration...');
      const audioFiles = await this.stages.tts.generateAudio(narrations);
      console.log(`✅ Generated ${audioFiles.length} audio files`);
      
      // Stage 5: Identify and generate videos
      console.log('🎬 Stage 5: Generating AI videos...');
      const videoOpportunities = await this.stages.video.identifyOpportunities(content, narrations);
      const videos = await this.stages.video.generateVideos(
        videoOpportunities.slice(0, this.config.videoGen.maxVideosPerCourse)
      );
      console.log(`✅ Generated ${videos.length} AI videos`);
      
      // Stage 6: Assemble final video
      console.log('🎞️ Stage 6: Assembling final video...');
      const outputPath = await this.stages.assembly.assemble({
        slides: enhancedSlides,
        audio: audioFiles,
        videos,
        narrations,
      });
      console.log(`✅ Final video assembled at: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Pipeline error:', error);
      throw error;
    }
  }

  async processInParallel(courses: Array<{ file: Buffer | string; type: 'ppt' | 'pdf' }>): Promise<string[]> {
    console.log(`🚀 Processing ${courses.length} courses in parallel...`);
    
    const results = await Promise.all(
      courses.map(course => this.processCourse(course.file, course.type))
    );
    
    console.log(`✅ Successfully processed ${results.length} courses`);
    return results;
  }

  // Get pipeline status for monitoring
  async getStatus(jobId: string): Promise<PipelineJob> {
    // This would connect to your job queue/database
    // For now, returning a mock status
    return {
      id: jobId,
      courseId: 'course-123',
      stage: 'assembly',
      status: 'processing',
      input: {},
      retries: 0,
    };
  }

  // Estimate cost for a course
  async estimateCost(slideCount: number): Promise<{
    narration: number;
    tts: number;
    videos: number;
    total: number;
  }> {
    const wordCount = slideCount * 150; // Estimate 150 words per slide
    
    return {
      narration: slideCount * 0.001,  // LLM generation cost
      tts: wordCount * 0.00001,        // TTS cost per word
      videos: this.config.videoGen.maxVideosPerCourse * 2.0, // ~$2 per video
      total: 0,
    };
  }
}