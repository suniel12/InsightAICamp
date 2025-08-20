import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../content/blog');
const OUTPUT_FILE = path.join(__dirname, '../src/data/blogContent.json');

function generateBlogContent() {
  // Ensure content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('Content directory does not exist:', CONTENT_DIR);
    return;
  }

  // Get all MDX files
  const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.mdx'));
  
  const posts = files.map(filename => {
    const filePath = path.join(CONTENT_DIR, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Extract slug from filename (remove date prefix and .mdx extension)
    const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx$/, '');
    
    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Generate ID from slug or use existing
    const id = data.id || slug.replace(/-/g, '_');
    
    return {
      id,
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: content, // Full markdown content
      author: data.author,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
      readingTime: data.readingTime || readingTime,
      category: data.category,
      tags: data.tags || [],
      featuredImage: data.featuredImage,
      metaDescription: data.metaDescription,
      structuredData: data.structuredData,
      filename
    };
  });
  
  // Sort by published date (newest first)
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Write to JSON file with full content
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
  
  console.log(`✅ Generated blog content for ${posts.length} posts`);
  console.log(`📝 Output: ${OUTPUT_FILE}`);
  
  // Show post titles
  posts.forEach(post => {
    console.log(`  - ${post.title} (${post.content.split(' ').length} words)`);
  });
}

generateBlogContent();