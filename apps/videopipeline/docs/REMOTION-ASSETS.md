# Remotion Asset Management Guide

## Overview

Remotion is a React-based video creation framework that requires specific asset management practices. This document explains how the video pipeline handles assets for Remotion compatibility.

## The Public Folder Requirement

### Why Public Folder?

Remotion operates as a web application during video rendering. It serves assets through HTTP, which means:

1. **Web Server Access**: Assets must be in the `public/` directory to be served by the development server
2. **URL-based References**: Remotion components reference assets via URLs like `/images/slide1.png`
3. **Build-time Optimization**: During production builds, assets in `public/` are properly bundled

### What Happens Without Public Folder?

If assets are stored elsewhere (e.g., `pipeline-data/`):
- ❌ Remotion cannot access the files
- ❌ Video rendering fails with 404 errors
- ❌ Preview in Remotion Studio shows broken images

## Pipeline Asset Strategy

### Dual Storage Approach

The pipeline uses a dual storage strategy:

```
1. Pipeline Storage (pipeline-data/sessions/{sessionId}/)
   - For data processing
   - Metadata and intermediate files
   - Pipeline state management

2. Remotion Storage (public/sessions/{sessionId}/)
   - For Remotion access
   - All media assets (images, audio, video)
   - Direct HTTP serving
```

### Session-Based Organization

Each pipeline session gets unique folders:

```
pipeline-data/sessions/ps_abc123/    # Processing data
public/sessions/ps_abc123/           # Remotion assets
```

Benefits:
- Multiple concurrent sessions
- Clean separation of concerns
- Easy cleanup after processing
- No asset conflicts

## Asset Types and Locations

### Slide Images
- **Format**: PNG (4000x2250 recommended)
- **Pipeline**: `pipeline-data/sessions/{id}/stage-02-images/slides/`
- **Remotion**: `public/sessions/{id}/images/`
- **Reference**: `/sessions/{id}/images/Slide1.png`

### Audio Files
- **Format**: MP3 (from TTS)
- **Pipeline**: `pipeline-data/sessions/{id}/stage-09-tts-audio/`
- **Remotion**: `public/sessions/{id}/audio/`
- **Reference**: `/sessions/{id}/audio/narration.mp3`

### AI Videos
- **Format**: MP4
- **Pipeline**: `pipeline-data/sessions/{id}/stage-06-ai-videos/`
- **Remotion**: `public/sessions/{id}/videos/`
- **Reference**: `/sessions/{id}/videos/clip1.mp4`

## Implementation in Code

### Session Manager

The `SessionManager` class handles dual storage automatically:

```typescript
// In session-manager.ts
async prepareForRemotion(): Promise<string> {
  const publicPath = path.join('./public/sessions', this.sessionId);
  await fs.mkdir(publicPath, { recursive: true });
  
  // Copy images from pipeline to public
  await fs.cp(imagesPath, publicTarget, { recursive: true });
  
  return publicPath;
}
```

### Remotion Component

Remotion components reference public assets:

```tsx
// In VideoComposition.tsx
<Img src={`/sessions/${sessionId}/images/Slide1.png`} />
<Audio src={`/sessions/${sessionId}/audio/narration.mp3`} />
<Video src={`/sessions/${sessionId}/videos/intro.mp4`} />
```

## Best Practices

### 1. Always Copy to Public
```typescript
// ✅ Good
await fs.copyFile(
  'pipeline-data/sessions/ps_123/image.png',
  'public/sessions/ps_123/images/image.png'
);

// ❌ Bad - Remotion can't access
await fs.copyFile(
  'source/image.png',
  'pipeline-data/sessions/ps_123/image.png'
);
```

### 2. Use Consistent Paths
```typescript
// ✅ Good - predictable structure
const remotionPath = `/sessions/${sessionId}/images/${imageName}`;

// ❌ Bad - inconsistent paths
const remotionPath = `/temp/${randomId}/${imageName}`;
```

### 3. Clean Up After Processing
```typescript
// Clean both locations after video generation
await fs.rm(`pipeline-data/sessions/${sessionId}`, { recursive: true });
await fs.rm(`public/sessions/${sessionId}`, { recursive: true });
```

## Troubleshooting

### Issue: Images not showing in Remotion Studio

**Check:**
1. Files exist in `public/sessions/{sessionId}/images/`
2. Path in component matches: `/sessions/{sessionId}/images/filename.png`
3. Development server is running

### Issue: Video rendering fails

**Check:**
1. All assets copied to public folder
2. No typos in asset paths
3. Assets accessible via browser: `http://localhost:3000/sessions/{id}/images/test.png`

### Issue: Production build missing assets

**Check:**
1. Assets in `public/` before build
2. Build process includes public folder
3. Deployment includes public assets

## Testing Asset Access

Quick test to verify Remotion can access assets:

```bash
# Start Remotion studio
npm run remotion:studio

# In browser, navigate to:
http://localhost:3000/sessions/[your-session-id]/images/Slide1.png

# Should display the image directly
```

## Summary

- **Always** copy media assets to `public/sessions/{sessionId}/`
- **Never** reference files outside public folder in Remotion components
- **Use** session-based organization for clean separation
- **Test** asset access through browser before rendering

This dual storage approach ensures both pipeline processing and Remotion rendering work seamlessly together.