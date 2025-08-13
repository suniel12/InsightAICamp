# Segmented Audio-Video Pipeline

This document describes the new segmented audio-video pipeline architecture that provides perfect synchronization between narration audio and visual content.

## Overview

The segmented pipeline solves the audio-visual synchronization problem by generating individual audio files for each content segment (slide, image, or video) rather than one continuous audio file. This ensures perfect timing alignment.

## Architecture Changes

### Before (Original Pipeline)
- Single continuous audio file for entire presentation
- Timeline estimated based on text analysis 
- Visual transitions didn't align with narration content
- Difficult to adjust individual segments

### After (Segmented Pipeline)
- Individual audio files for each content segment
- Timeline based on actual audio durations
- Perfect audio-visual synchronization
- Easy to adjust or regenerate individual segments

## Pipeline Stages

### Stage 8A: Narration Segmentation
**Location**: `src/stages/segmentation/narration-segmenter.ts`

Parses the formatted narration script and creates discrete segments for each content piece.

```typescript
const segmenter = new NarrationSegmenter({
  sessionId: 'ps_mNLd3DCJ',
  sessionDir: './pipeline-data/sessions/ps_mNLd3DCJ'
});

const segments = await segmenter.segmentNarration();
```

**Output Structure**:
```typescript
interface NarrationSegment {
  id: string;
  slideNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  narrationText: string;
  contentType: 'slide' | 'slide-with-overlay' | 'ai-video';
  pace: 'fast' | 'normal' | 'slow';
  keyTerms: string[];
}
```

### Stage 9A: Segmented TTS Generation
**Location**: `src/stages/tts/segmented-tts.ts`

Generates individual audio files for each narration segment using TTS providers.

```typescript
const ttsStage = new SegmentedTTSStage({
  provider: 'elevenlabs',
  voiceId: 'MFZUKuGQUsGJPQjTS4wC',
  apiKey: process.env.ELEVENLABS_API_KEY,
  outputFormat: 'mp3'
});

const audioCollection = await ttsStage.generateSegmentedAudio(segments, sessionDir);
```

**Features**:
- Parallel processing with concurrency control
- Multiple TTS provider support (ElevenLabs, AWS Polly, Google)
- Speech marks for word-level timing (where supported)
- Precise audio duration measurement using ffprobe

### Stage 10A: Content-Aware Timeline
**Location**: `src/stages/timeline/content-aware-planner.ts`

Creates a timeline using actual audio segment durations rather than estimates.

```typescript
const planner = new ContentAwareTimelinePlanner({
  sessionId: SESSION_ID,
  sessionDir,
  transitionDuration: 0.5
});

const timeline = await planner.createTimeline(audioCollection);
```

**Timeline Events**:
- Each event has precise start/end times based on audio duration
- Supports slides, AI images, AI videos, and transitions
- Includes reference to corresponding audio segment

### Stage 11: Segmented Video Assembly
**Location**: `src/stages/assembly/segmented-assembly.ts`

Uses Remotion to assemble video with multiple synchronized audio tracks.

```typescript
const assembler = new SegmentedAssemblyStage({
  format: 'mp4',
  resolution: '1080p',
  fps: 30
});

const videoPath = await assembler.assemble({
  timeline,
  slideImages,
  aiVideos,
  aiImages
});
```

## Usage

### Running the Segmented Pipeline

1. **Test Segmentation** (recommended first step):
```bash
npx tsx src/scripts/test-segmentation.ts
```

2. **Run Complete Segmented Pipeline**:
```bash
npx tsx src/scripts/run-segmented-pipeline.ts
```

### Prerequisites

- Existing session with formatted narration (`stage-08-final-narration/narration-formatted.md`)
- Media manifest (`stage-06-ai-media/media-manifest.json`)
- Enhanced slide images in output directory
- ElevenLabs API key (or other TTS provider configured)

### Environment Variables

```bash
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=MFZUKuGQUsGJPQjTS4wC  # Optional, defaults to this voice
```

## Directory Structure

```
pipeline-data/sessions/{sessionId}/
├── stage-08a-narration-segmentation/
│   └── narration-segments.json
├── stage-09-segmented-tts/
│   ├── segment-1-0.0.mp3
│   ├── segment-2-35.7.mp3
│   ├── ...
│   └── segmented-audio-collection.json
├── stage-10-content-aware-timeline/
│   ├── timeline.json
│   └── timeline-simplified.json
└── stage-11-segmented-video/
    ├── segmented-pipeline-metadata.json
    └── final-video.mp4
```

## Benefits

1. **Perfect Synchronization**: Audio and visual content are precisely aligned
2. **Easy Debugging**: Individual segments can be identified and fixed
3. **Faster Iteration**: Regenerate only problematic segments
4. **Better Error Recovery**: Failed segments don't affect others
5. **Scalable**: Process segments in parallel for faster generation
6. **Word-Level Sync**: Support for speech marks enables subtitle generation

## Data Structures

### AudioSegment
```typescript
interface AudioSegment {
  id: string;
  contentType: 'slide' | 'ai-image' | 'ai-video';
  contentId: number | string;
  narrationText: string;
  audioFile: string;           // Path to individual audio file
  duration: number;            // Precise duration from actual audio
  speechMarks?: SpeechMark[];  // Word-level timing data
  startTime: number;           // Cumulative start time in final timeline
  endTime: number;             // Cumulative end time in final timeline
}
```

### SegmentedAudioCollection
```typescript
interface SegmentedAudioCollection {
  segments: AudioSegment[];
  totalDuration: number;       // Sum of all segment durations
  sessionId: string;
  createdAt: string;
  metadata: {
    segmentCount: number;
    provider: string;
    voiceId: string;
    totalFileSize: number;
  };
}
```

### ContentAwareTimeline
```typescript
interface ContentAwareTimeline {
  events: ContentAwareTimelineEvent[];
  totalDuration: number;
  audioCollection: SegmentedAudioCollection;
  metadata: {
    method: 'content-aware-segmented';
    segmentCount: number;
    transitionDuration: number;
  };
}
```

## Remotion Composition

The segmented assembly creates a Remotion composition with:

- **Multiple Audio Sequences**: Each segment gets its own `<Audio>` component
- **Precise Timing**: Uses `from` prop to start audio at exact frame
- **Visual Components**: Enhanced slide, overlay, and video components
- **Smooth Transitions**: Fade effects between content segments

## Troubleshooting

### Common Issues

1. **Missing Formatted Narration**: Ensure `stage-08-final-narration/narration-formatted.md` exists
2. **TTS API Errors**: Check API key and rate limits
3. **Missing Media Files**: Verify slide images and AI media exist
4. **Timing Issues**: Use test script to validate segmentation

### Debug Commands

```bash
# Test segmentation parsing
npx tsx src/scripts/test-segmentation.ts

# Check existing session data
ls pipeline-data/sessions/ps_mNLd3DCJ/

# Validate audio files
ffprobe pipeline-data/sessions/ps_mNLd3DCJ/stage-09-segmented-tts/*.mp3
```

## Migration from Original Pipeline

Existing sessions can use the segmented pipeline if they have:
1. Formatted narration script
2. Media manifest
3. Enhanced slide images

The segmented pipeline is complementary - original pipeline stages 1-8 remain unchanged.

## Future Enhancements

- **Real-time Processing**: Stream TTS generation during segmentation
- **Advanced Speech Marks**: Word-level highlighting in videos  
- **Dynamic Segments**: Adjust segment boundaries based on speech patterns
- **Multiple Voices**: Different voices for different content types
- **Subtitle Generation**: Automatic subtitle track creation from speech marks