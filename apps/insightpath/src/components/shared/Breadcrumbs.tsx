import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Handle blog post slugs
      if (pathSegments[0] === 'blog' && index === 1) {
        const post = blogPosts.find(p => p.slug === segment);
        if (post) {
          items.push({
            label: post.title,
            href: isLast ? undefined : currentPath,
          });
          return;
        }
      }

      // Handle regular pages
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      items.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return items;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on homepage
  if (pathSegments.length === 0) {
    return null;
  }

  // Generate JSON-LD structured data for breadcrumbs
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gigawattacademy.com/',
      },
      ...breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: crumb.label,
        item: crumb.href ? `https://gigawattacademy.com${crumb.href}` : undefined,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};