import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, ArrowLeft, Share2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPost as BlogPostType } from '@/data/blogPosts';
import { BRAND_COLORS } from '@/constants/styles';
import { useNavigate, Link } from 'react-router-dom';

interface BlogPostProps {
  post: BlogPostType;
}

export const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Add structured data to head
  useEffect(() => {
    // Add main article structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.metaDescription,
      "author": {
        "@type": "Person",
        "name": post.author.name,
        "jobTitle": post.author.role
      },
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt || post.publishedAt,
      "publisher": {
        "@type": "Organization",
        "name": "GigaWatt Academy",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/favicon.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    });
    document.head.appendChild(script);

    // Add additional structured data if provided
    const structuredDataScripts: HTMLScriptElement[] = [];
    if (post.structuredData) {
      const dataArray = Array.isArray(post.structuredData) ? post.structuredData : [post.structuredData];
      dataArray.forEach((data, index) => {
        const additionalScript = document.createElement('script');
        additionalScript.type = 'application/ld+json';
        additionalScript.text = JSON.stringify(data);
        document.head.appendChild(additionalScript);
        structuredDataScripts.push(additionalScript);
      });
    }

    return () => {
      document.head.removeChild(script);
      structuredDataScripts.forEach(s => {
        if (document.head.contains(s)) {
          document.head.removeChild(s);
        }
      });
    };
  }, [post]);

  // Custom components for markdown rendering
  const markdownComponents = {
    h1: ({ children, ...props }: any) => (
      <h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4 text-white" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-white" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-xl md:text-2xl font-bold mt-6 mb-3 text-white" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className="text-lg md:text-xl font-semibold mt-4 mb-2 text-white" {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }: any) => (
      <p className="mb-4 text-slate-300 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc ml-6 mb-4 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal ml-6 mb-4 space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-slate-300" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-white" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic text-slate-300" {...props}>
        {children}
      </em>
    ),
    a: ({ href, children, ...props }: any) => {
      // Check if it's an internal link
      const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
      
      if (isInternal) {
        if (href.startsWith('#')) {
          // Anchor link
          return (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector(href);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              {...props}
            >
              {children}
            </a>
          );
        } else {
          // Internal route link
          return (
            <Link
              to={href}
              className="text-primary hover:text-primary/80 underline transition-colors"
              {...props}
            >
              {children}
            </Link>
          );
        }
      }
      
      // External link
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children, ...props }: any) => (
      <blockquote 
        className="border-l-4 border-primary/50 pl-4 my-4 italic text-slate-400"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ inline, children, ...props }: any) => {
      if (inline) {
        return (
          <code 
            className="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-primary"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className="text-sm text-slate-300" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: any) => (
      <pre 
        className="bg-slate-900 p-4 rounded-lg overflow-x-auto my-4"
        {...props}
      >
        {children}
      </pre>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-slate-700" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-slate-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="divide-y divide-slate-800" {...props}>
        {children}
      </tbody>
    ),
    th: ({ children, ...props }: any) => (
      <th 
        className="px-4 py-2 text-left text-sm font-medium text-slate-300"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td 
        className="px-4 py-2 text-sm text-slate-400"
        {...props}
      >
        {children}
      </td>
    ),
    hr: ({ ...props }: any) => (
      <hr className="my-8 border-slate-700" {...props} />
    ),
    // Handle checkbox lists (task lists)
    input: ({ type, checked, ...props }: any) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            disabled
            className="mr-2"
            {...props}
          />
        );
      }
      return null;
    },
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="mb-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>
        <Button
          variant="ghost"
          onClick={handleShare}
          className="text-slate-400 hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Badge 
            variant="secondary"
            style={{ backgroundColor: BRAND_COLORS.PRIMARY + '20', color: BRAND_COLORS.PRIMARY }}
          >
            {post.category}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime} min read</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          {post.title}
        </h1>
        
        <p className="text-xl text-slate-300 mb-6">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-b border-slate-700 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">{post.author.name}</p>
                <p className="text-xs text-slate-400">{post.author.role}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeSlug,
            [rehypeAutolinkHeadings, { 
              behavior: 'prepend',
              properties: {
                className: 'anchor-link',
                ariaLabel: 'Link to section'
              },
              content: {
                type: 'element',
                tagName: 'span',
                properties: {
                  className: 'anchor-icon'
                },
                children: []
              }
            }]
          ]}
          components={markdownComponents}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      <div className="mt-12 pt-8 border-t border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Related Topics</h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="text-slate-300 border-slate-600 hover:bg-slate-700 cursor-pointer"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 p-8 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <h3 className="text-2xl font-bold mb-4 text-white">Ready to Start Your Data Center Career?</h3>
        <p className="text-slate-300 mb-6">
          Join GigaWatt Academy and get direct access to hiring partners.
        </p>
        <Button 
          className="btn-hero"
          style={{ backgroundColor: BRAND_COLORS.PRIMARY, color: 'white' }}
          onClick={() => navigate('/application')}
        >
          Apply Now
        </Button>
      </div>
    </article>
  );
};