import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/data/blogPosts';
import { BRAND_COLORS } from '@/constants/styles';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Link to={`/blog/${post.slug}`} className="block hover:no-underline">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-slate-700 bg-slate-800/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ backgroundColor: BRAND_COLORS.PRIMARY + '20', color: BRAND_COLORS.PRIMARY }}
            >
              {post.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map(tag => (
              <span 
                key={tag} 
                className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs px-2 py-1 text-slate-400">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};