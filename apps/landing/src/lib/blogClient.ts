import blogIndex from '@/data/blogIndex.json';

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
  filename: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

// Get all blog posts metadata
export function getAllPosts(): BlogPostMeta[] {
  return blogIndex as BlogPostMeta[];
}

// Get post by slug
export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return blogIndex.find((post: any) => post.slug === slug);
}

// Get posts by category
export function getPostsByCategory(category: string): BlogPostMeta[] {
  return blogIndex.filter((post: any) => post.category === category);
}

// Get posts by tag
export function getPostsByTag(tag: string): BlogPostMeta[] {
  return blogIndex.filter((post: any) => post.tags.includes(tag));
}

// Get related posts
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPostMeta[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];
  
  // Score posts by relevance
  const scoredPosts = blogIndex
    .filter((post: any) => post.slug !== currentSlug)
    .map((post: any) => {
      let score = 0;
      
      // Same category = 2 points
      if (post.category === currentPost.category) score += 2;
      
      // Each shared tag = 1 point
      post.tags.forEach((tag: string) => {
        if (currentPost.tags.includes(tag)) score += 1;
      });
      
      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  
  return scoredPosts.slice(0, limit).map(({ post }) => post as BlogPostMeta);
}

// Search posts
export function searchPosts(query: string): BlogPostMeta[] {
  const searchTerm = query.toLowerCase();
  
  return blogIndex.filter((post: any) => {
    return (
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm)) ||
      post.category.toLowerCase().includes(searchTerm)
    );
  });
}

// Get featured posts (most recent for now)
export function getFeaturedPosts(limit: number = 5): BlogPostMeta[] {
  return blogIndex.slice(0, limit) as BlogPostMeta[];
}

// Get unique categories
export function getCategories(): string[] {
  const categories = new Set(blogIndex.map((post: any) => post.category));
  return Array.from(categories);
}

// Get all unique tags
export function getAllTags(): string[] {
  const tags = new Set(blogIndex.flatMap((post: any) => post.tags));
  return Array.from(tags);
}