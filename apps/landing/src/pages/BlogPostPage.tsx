import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/shared/ScrollProgress';
import { BlogPost } from '@/components/blog/BlogPost';
import { getPostBySlug } from '@/lib/blogClient';
import blogContent from '@/data/blogContent.json';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  
  // Get the full post from the new MDX-based content
  const post = useMemo(() => {
    return blogContent.find(p => p.slug === slug);
  }, [slug]);
  
  useEffect(() => {
    if (post) {
      // Update page title
      document.title = `${post.title} | GigaWatt Academy Blog`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.metaDescription);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = post.metaDescription;
        document.head.appendChild(meta);
      }

      // Update Open Graph tags
      const updateOGTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) {
          tag.setAttribute('content', content);
        } else {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          tag.setAttribute('content', content);
          document.head.appendChild(tag);
        }
      };

      updateOGTag('og:title', post.title);
      updateOGTag('og:description', post.excerpt);
      updateOGTag('og:type', 'article');
      updateOGTag('og:url', window.location.href);
      updateOGTag('article:author', post.author.name);
      updateOGTag('article:published_time', post.publishedAt);
      
      if (post.updatedAt) {
        updateOGTag('article:modified_time', post.updatedAt);
      }

      // Add structured data
      if (post.structuredData) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(post.structuredData);
        document.head.appendChild(script);
      }
    }
    
    setLoading(false);
  }, [post]);

  if (!loading && !post) {
    return <Navigate to="/blog" replace />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <ScrollProgress />
      <NavigationHeader />
      <BlogPost post={post} />
      <Footer />
    </div>
  );
};

export default BlogPostPage;