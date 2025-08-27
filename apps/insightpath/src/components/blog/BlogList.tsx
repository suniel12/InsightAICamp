import React from 'react';
import { BlogCard } from './BlogCard';
import { BlogPost } from '@/data/blogPosts';

interface BlogListProps {
  posts: BlogPost[];
}

export const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};