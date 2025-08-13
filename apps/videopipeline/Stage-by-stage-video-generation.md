# Stage-by-Stage Video Generation Process

## Overview
This document provides a complete, repeatable process for generating videos from PowerPoint presentations using the video pipeline. Each stage is documented with specific commands, expected outputs, and validation steps.

## Prerequisites
- Node.js and npm installed
- Required API keys configured in `.env`:
  - `GOOGLE_GEMINI_API_KEY`
  - `ELEVENLABS_API_KEY`
  - `IMAGEN_API_KEY` (if using AI image generation)
- PowerPoint file to convert

## Pipeline Architecture
The pipeline uses a **segment-based architecture** where:
- Segments are the primary organizing principle (not slides)
- Each segment = one visual content + one audio file
- 1:1 mapping between segments and timeline events
- Segments can be: slides, AI-generated images, or AI-generated videos

## Complete Pipeline Execution

### Stage 1: Input Processing
**Purpose**: Upload PowerPoint and extract metadata

```bash
# Create a new session
SESSION_ID="ps_$(date +%s | md5 | head -c 10)"
echo "Created session: $SESSION_ID"

# Copy PowerPoint to input directory
mkdir -p pipeline-data/sessions/$SESSION_ID/stage-01-input
cp "path/to/your/presentation.pptx" pipeline-data/sessions/$SESSION_ID/stage-01-input/

# Run Stage 1
npx tsx src/scripts/stages/run-stage-1-input.ts $SESSION_ID
```

**Expected Output**:
- `pipeline-data/sessions/$SESSION_ID/stage-01-input/output.json`
- Extracted presentation metadata

---

### Stage 4: Enhanced PPT Processing
**Purpose**: Extract slides as PNG images

```bash
# Run Stage 4
npx tsx src/scripts/stages/run-stage-4-enhanced-ppt.ts $SESSION_ID
```

**Expected Output**:
- `pipeline-data/sessions/$SESSION_ID/stage-04-enhanced-ppt/slides/Slide1.png`
- `pipeline-data/sessions/$SESSION_ID/stage-04-enhanced-ppt/slides/Slide2.png`
- ... (one PNG per slide)

**Validation**:
```bash
ls -la pipeline-data/sessions/$SESSION_ID/stage-04-enhanced-ppt/slides/*.png
```

---

### Stage 5: Script & Video Planning
**Purpose**: Generate narration script and plan AI media

```bash
# Run Stage 5
npx tsx src/scripts/stages/run-stage-5-script-planning.ts $SESSION_ID
```

**Expected Output**:
- `stage-05-script-video-planning/complete-narration.md` - Full narration script
- `stage-05-script-video-planning/media-plan.json` - AI media generation plan
- `stage-05-script-video-planning/image-prompts.json` - AI image prompts
- `stage-05-script-video-planning/video-prompts.json` - AI video prompts

**Validation**:
```bash
# Check if narration was generated
cat pipeline-data/sessions/$SESSION_ID/stage-05-script-video-planning/complete-narration.md | head -20
```

---

### Stage 6: AI Media Generation
**Purpose**: Generate AI images and videos based on prompts

```bash
# Run Stage 6
npx tsx src/scripts/stages/run-stage-6-ai-media.ts $SESSION_ID
```

**Expected Output**:
- `stage-06-ai-media/images/` - AI-generated images
- `stage-06-ai-media/videos/` - AI-generated videos
- `stage-06-ai-media/media-manifest.json` - Media inventory

**Note**: This stage may take time depending on AI service response times.

---

### Stage 8: Narration Segmentation
**Purpose**: Parse narration into segments mapped to visual content

```bash
# Create formatted narration first (if not exists)
cat > pipeline-data/sessions/$SESSION_ID/stage-08-final-narration/narration-formatted.md << 'EOF'
# Formatted Narration

## Segment 1: Video - slide4_vid1.mp4 [0.0s - 18.2s]
**Duration:** 18.2s | **Pace:** normal | **Type:** ai-video

[Narration text for segment 1...]

**Key Terms:** data center, servers, digital

---

## Segment 2: Slide 1 - Intro to Data centers demo enhanced.pptx [18.7s - 34.6s]
**Duration:** 15.9s | **Pace:** normal | **Type:** slide

[Narration text for segment 2...]

**Key Terms:** data center, infrastructure, research

---

[Continue for all segments...]
EOF

# Run Stage 8 segmentation
npx tsx src/scripts/stages/run-stage-8-segmentation.ts $SESSION_ID
```

**Expected Output**:
- `stage-08-segmentation/narration-segments.json` - Structured segments with correct mappings

**Critical**: Verify slide numbers in the output:
```bash
# Check slide mappings
cat pipeline-data/sessions/$SESSION_ID/stage-08-segmentation/narration-segments.json | grep -A2 '"slide"'
```

**Common Issues & Fixes**:
- If slide numbers are wrong (using segment numbers), manually edit the JSON
- Ensure slides are numbered 1-6, not by segment number

---

### Stage 9: Text-to-Speech (Segmented)
**Purpose**: Generate individual audio files for each segment

```bash
# Run Stage 9
npx tsx src/scripts/stages/run-stage-9-segmented-tts.ts $SESSION_ID
```

**Expected Output**:
- `stage-09-segmented-tts/segment-1-0.0.mp3`
- `stage-09-segmented-tts/segment-2-18.7.mp3`
- ... (one MP3 per segment)
- `stage-09-segmented-tts/segmented-audio-collection.json`

**Validation**:
```bash
# Check all audio files were generated
ls -la pipeline-data/sessions/$SESSION_ID/stage-09-segmented-tts/*.mp3 | wc -l
# Should match the number of segments
```

---

### Stage 10: Timeline Generation
**Purpose**: Create content-aware timeline with segment-event mapping

```bash
# Run Stage 10
npx tsx run-stage10.ts $SESSION_ID
```

**Expected Output**:
- `stage-10-content-aware-timeline/timeline.json` - Full timeline with all metadata
- `stage-10-content-aware-timeline/timeline-simplified.json` - Simplified version

**Critical Validation**:
```bash
# Verify slide mappings are correct
cat pipeline-data/sessions/$SESSION_ID/stage-10-content-aware-timeline/timeline.json | grep '"slideNumber"'
```

**Expected Mappings**:
- Segment 2 → Slide 1
- Segment 4 → Slide 2  
- Segment 5 → Slide 3
- Segment 7 → Slide 4
- Segment 8 → Slide 5
- Segment 9 → Slide 6

**Fix if needed**:
```bash
# Edit timeline.json and timeline-simplified.json to correct slide numbers
# Make sure slidePath matches slideNumber (Slide1.png for slideNumber: 1)
```

---

### Stage 11: Final Video Assembly
**Purpose**: Combine all assets into final video

```bash
# Run Stage 11
npx tsx run-stage11.ts $SESSION_ID
```

**Expected Output**:
- `output/video-output/segmented_video_[timestamp].mp4` - Final video
- `output/video-output/SegmentedComposition.tsx` - Remotion composition
- `output/video-output/public/` - All media assets copied

**Note**: This stage takes several minutes for rendering.

---

## Complete Pipeline Script

Save this as `run-complete-pipeline.sh`:

```bash
#!/bin/bash

# Check if session ID provided
if [ -z "$1" ]; then
    SESSION_ID="ps_$(date +%s | md5 | head -c 10)"
    echo "Created new session: $SESSION_ID"
else
    SESSION_ID=$1
    echo "Using session: $SESSION_ID"
fi

# Check if PowerPoint provided
if [ -z "$2" ]; then
    echo "Usage: ./run-complete-pipeline.sh [session_id] <powerpoint_file>"
    exit 1
fi

POWERPOINT_FILE=$2

echo "Starting pipeline for: $POWERPOINT_FILE"
echo "Session ID: $SESSION_ID"

# Stage 1: Input
echo "Stage 1: Processing input..."
mkdir -p pipeline-data/sessions/$SESSION_ID/stage-01-input
cp "$POWERPOINT_FILE" pipeline-data/sessions/$SESSION_ID/stage-01-input/
npx tsx src/scripts/stages/run-stage-1-input.ts $SESSION_ID

# Stage 4: Extract slides
echo "Stage 4: Extracting slides..."
npx tsx src/scripts/stages/run-stage-4-enhanced-ppt.ts $SESSION_ID

# Stage 5: Script planning
echo "Stage 5: Planning script and media..."
npx tsx src/scripts/stages/run-stage-5-script-planning.ts $SESSION_ID

# Stage 6: AI media generation
echo "Stage 6: Generating AI media..."
npx tsx src/scripts/stages/run-stage-6-ai-media.ts $SESSION_ID

# Stage 8: Segmentation
echo "Stage 8: Segmenting narration..."
npx tsx src/scripts/stages/run-stage-8-segmentation.ts $SESSION_ID

# Stage 9: TTS
echo "Stage 9: Generating audio..."
npx tsx src/scripts/stages/run-stage-9-segmented-tts.ts $SESSION_ID

# Stage 10: Timeline
echo "Stage 10: Creating timeline..."
npx tsx run-stage10.ts $SESSION_ID

# Stage 11: Final assembly
echo "Stage 11: Assembling final video..."
npx tsx run-stage11.ts $SESSION_ID

echo "Pipeline complete! Check output/video-output/ for the final video."
```

---

## Common Issues and Fixes

### 1. Incorrect Slide Numbering
**Problem**: Segments incorrectly using segment numbers as slide numbers
**Fix**: 
- Edit `stage-08-segmentation/narration-segments.json`
- Ensure slide segments have correct slide numbers (1-6, not segment numbers)

### 2. Missing Audio Files
**Problem**: Stage 9 fails to generate audio for some segments
**Fix**:
- Check narration format in Stage 8 output
- Ensure all segments have narrationText field
- Re-run Stage 9

### 3. Old Files in Public Directory
**Problem**: Stage 11 uses old slide images mixed with new ones
**Fix**:
- Stage 11 now includes automatic cleanup
- Manually clean if needed: `rm output/video-output/public/*.{png,mp3,mp4}`

### 4. Timeline Slide Mapping Errors
**Problem**: Timeline has wrong slide numbers/paths
**Fix**:
- Edit both `timeline.json` and `timeline-simplified.json`
- Ensure slideNumber matches the actual slide (1-6)
- Ensure slidePath matches: `Slide1.png` for slideNumber: 1

---

## Validation Checklist

### Before Starting:
- [ ] `.env` file has all required API keys
- [ ] PowerPoint file is accessible
- [ ] Previous session outputs cleared (if needed)

### After Each Stage:
- [ ] Stage 1: `output.json` created
- [ ] Stage 4: All slide PNGs extracted
- [ ] Stage 5: Narration script generated
- [ ] Stage 6: AI media files created
- [ ] Stage 8: Segments JSON has correct structure
- [ ] Stage 9: All audio MP3s generated
- [ ] Stage 10: Timeline has correct mappings
- [ ] Stage 11: Final video rendered successfully

### Final Output:
- [ ] Video duration matches timeline
- [ ] Audio syncs with visuals
- [ ] All slides appear in correct order
- [ ] AI media appears at correct times
- [ ] Transitions are smooth

---

## Quick Start for New Video

```bash
# 1. Set up your PowerPoint
cp "your-presentation.pptx" input.pptx

# 2. Run complete pipeline
./run-complete-pipeline.sh "" input.pptx

# 3. Find your video
ls -la output/video-output/segmented_video_*.mp4
```

---

## Notes

- The pipeline is designed for 6-slide presentations with AI enhancements
- Adjust prompts in Stage 5 for different AI media requirements
- TTS uses ElevenLabs by default (can be changed in Stage 9)
- Video rendering takes 5-10 minutes depending on duration
- Keep session IDs for debugging and iteration