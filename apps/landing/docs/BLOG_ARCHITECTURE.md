# Blog Architecture Migration Guide

## Overview

The blog system has been migrated from a single 2,844-line TypeScript file to a scalable MDX-based architecture that supports hundreds of posts without performance degradation.

## Old Architecture Problems

- **Single file with 2,844 lines** (`src/data/blogPosts.ts`)
- **Performance issues**: Entire file loaded for single post access
- **Git conflicts**: Multiple editors = merge conflicts
- **Build time**: Any edit rebuilds entire data file
- **Memory bloat**: All posts in client bundle

## New Architecture Benefits

- **Separate MDX files**: Each post is independent
- **Git-friendly**: No merge conflicts between posts
- **Incremental builds**: Only changed files rebuild
- **Scalable**: Handles hundreds of posts efficiently
- **Future-ready**: Easy to add CMS integration later

## Directory Structure

```
apps/landing/
├── content/
│   └── blog/                              # Blog posts in MDX format
│       ├── 2025-01-21-data-center-technician-daily-work.mdx
│       ├── 2025-01-20-how-to-become-data-center-technician.mdx
│       └── [date]-[slug].mdx
├── scripts/
│   └── generate-blog-index.js             # Generates JSON index at build time
├── src/
│   ├── data/
│   │   ├── blogPosts.ts                   # Legacy data (kept for backward compatibility)
│   │   └── blogIndex.json                 # Generated index of all posts
│   └── lib/
│       ├── blog.ts                        # Server-side utilities (for future use)
│       └── blogClient.ts                  # Client-side blog utilities
```

## How It Works

### 1. Content Creation
Create new blog posts as MDX files in `content/blog/`:

```mdx
---
title: "Your Blog Title"
excerpt: "Brief description..."
author:
  name: "Author Name"
  role: "Author Role"
publishedAt: "2025-01-22T10:00:00Z"
category: "Career Guide"
tags:
  - tag1
  - tag2
featuredImage: "/blog/image.jpg"
metaDescription: "SEO description..."
---

# Your Blog Title

Your markdown content here...
```

### 2. Build Process
The build process automatically:
1. Scans all MDX files in `content/blog/`
2. Extracts frontmatter metadata
3. Generates `src/data/blogIndex.json`
4. Makes posts available to React components

### 3. Data Access
Use the new client utilities:

```typescript
import { getAllPosts, getPostBySlug, searchPosts } from '@/lib/blogClient';

// Get all posts
const posts = getAllPosts();

// Get single post metadata
const post = getPostBySlug('my-post-slug');

// Search posts
const results = searchPosts('data center');
```

## Adding New Blog Posts

### Method 1: Manual Creation
1. Create MDX file: `content/blog/YYYY-MM-DD-slug.mdx`
2. Add frontmatter and content
3. Run `npm run generate:blog-index`
4. Post appears on site

### Method 2: Using the Playbook
Follow the established blog creation playbook in `/docs/BLOG_CREATION_PLAYBOOK.md`

## Migration Status

✅ **Completed:**
- Created MDX file structure
- Installed dependencies (gray-matter, mdx packages)
- Built blog utilities
- Migrated all 7 existing posts to MDX
- Updated components to use new data source
- Added build-time index generation
- Tested new system

⚠️ **Current Limitations:**
- Content still served from legacy `blogPosts.ts` for full text
- MDX rendering not fully dynamic in Vite (requires build step)
- No hot reload for MDX content changes

## Future Enhancements

### Phase 1: Full MDX Integration (Next Sprint)
- Dynamic MDX loading with Vite
- Remove dependency on legacy data file
- Hot reload for content changes

### Phase 2: CMS Integration (50+ posts)
- Headless CMS (Contentful/Strapi)
- Editorial workflow
- Version control

### Phase 3: Performance Optimization (100+ posts)
- Static generation with ISR
- CDN caching
- Search indexing with Algolia

## Commands

```bash
# Generate blog index
npm run generate:blog-index

# Development (auto-generates index)
npm run dev

# Build (auto-generates index)
npm run build

# Add new post
# 1. Create MDX file in content/blog/
# 2. Index regenerates on next dev/build
```

## Best Practices

1. **Naming Convention**: `YYYY-MM-DD-slug.mdx`
2. **Frontmatter**: Always include all required fields
3. **Images**: Store in `public/blog/` directory
4. **SEO**: Write compelling metaDescriptions
5. **Categories**: Use consistent category names
6. **Tags**: 5-7 relevant tags per post

## Troubleshooting

### Blog post not appearing?
- Check filename format
- Verify frontmatter is valid YAML
- Run `npm run generate:blog-index`
- Check for errors in console

### Build failing?
- Ensure all MDX files have valid frontmatter
- Check for special characters in YAML
- Verify date format is ISO 8601

### Performance issues?
- Consider implementing pagination
- Lazy load images
- Use search indexing for large datasets

## Conclusion

This new architecture provides a solid foundation for scaling from 7 to 700+ blog posts while maintaining performance, developer experience, and content management flexibility.