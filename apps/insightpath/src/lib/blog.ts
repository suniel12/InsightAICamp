import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  category: string;
  tags: string[];
  featuredImage: string;
  metaDescription: string;
  structuredData?: any;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
  mdxSource?: any;
}

const POSTS_PATH = path.join(process.cwd(), 'content', 'blog');

// Helper to ensure the posts directory exists
function ensurePostsDirectory() {
  if (!fs.existsSync(POSTS_PATH)) {
    fs.mkdirSync(POSTS_PATH, { recursive: true });
  }
}

// Get all post filenames
export function getPostFilenames(): string[] {
  ensurePostsDirectory();
  return fs.readdirSync(POSTS_PATH).filter((path) => /\.mdx?$/.test(path));
}

// Get post slugs for static paths
export function getPostSlugs(): string[] {
  return getPostFilenames().map((filename) => filename.replace(/\.mdx?$/, ''));
}

// Read and parse a single post
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  ensurePostsDirectory();
  
  const postFilenames = getPostFilenames();
  const filename = postFilenames.find(
    (file) => file.replace(/\.mdx?$/, '') === slug
  );

  if (!filename) {
    return null;
  }

  const filePath = path.join(POSTS_PATH, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // Serialize MDX content
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    },
  });

  return {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    author: data.author || { name: 'GigaWatt Academy', role: 'Editorial Team' },
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    readingTime: data.readingTime || Math.ceil(content.split(' ').length / 200),
    category: data.category || 'Data Center Careers',
    tags: data.tags || [],
    featuredImage: data.featuredImage || '/images/blog-default.jpg',
    metaDescription: data.metaDescription || data.excerpt,
    structuredData: data.structuredData,
    content,
    mdxSource,
  };
}

// Get all posts with metadata
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  ensurePostsDirectory();
  
  const filenames = getPostFilenames();
  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.mdx?$/, '');
      const post = await getPostBySlug(slug);
      if (!post) return null;
      
      // Return only metadata for listing pages
      const { content, mdxSource, ...meta } = post;
      return meta;
    })
  );

  // Filter out nulls and sort by date
  return posts
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

// Get posts by category
export async function getPostsByCategory(category: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.category === category);
}

// Get posts by tag
export async function getPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.tags.includes(tag));
}

// Get related posts (by tags and category)
export async function getRelatedPosts(
  currentSlug: string,
  limit: number = 3
): Promise<BlogPostMeta[]> {
  const currentPost = await getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = await getAllPosts();
  
  // Score posts by relevance
  const scoredPosts = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      let score = 0;
      
      // Same category = 2 points
      if (post.category === currentPost.category) score += 2;
      
      // Each shared tag = 1 point
      post.tags.forEach((tag) => {
        if (currentPost.tags.includes(tag)) score += 1;
      });
      
      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredPosts.slice(0, limit).map(({ post }) => post);
}

// Search posts (simple text search)
export async function searchPosts(query: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  const searchTerm = query.toLowerCase();
  
  return allPosts.filter((post) => {
    return (
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
      post.category.toLowerCase().includes(searchTerm)
    );
  });
}

// Get featured posts
export async function getFeaturedPosts(limit: number = 5): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts();
  // For now, return the most recent posts as featured
  // You can add a 'featured' field in frontmatter later
  return allPosts.slice(0, limit);
}

// Generate RSS feed data
export async function generateRSSFeed(): Promise<string> {
  const posts = await getAllPosts();
  const siteUrl = 'https://gigawattacademy.com';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GigaWatt Academy Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Expert insights on data center careers, training, and industry trends</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <description>${post.excerpt}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join('')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return rss;
}