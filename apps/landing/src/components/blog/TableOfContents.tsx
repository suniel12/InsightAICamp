import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BRAND_COLORS } from '@/constants/styles';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [headings, setHeadings] = useState<TOCItem[]>([]);

  // Extract headings from content
  useEffect(() => {
    const extractedHeadings: TOCItem[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line) => {
      const h2Match = line.match(/^## (.+)/);
      const h3Match = line.match(/^### (.+)/);
      
      if (h2Match) {
        const text = h2Match[1];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        extractedHeadings.push({ id, text, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        extractedHeadings.push({ id, text, level: 3 });
      }
    });
    
    setHeadings(extractedHeadings);
  }, [content]);

  // Track active heading on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -70% 0px',
        threshold: 1.0,
      }
    );

    // Wait for DOM to be ready
    setTimeout(() => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });
    }, 100);

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Table of Contents</h3>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`${heading.level === 3 ? 'ml-4' : ''}`}
            >
              <button
                onClick={() => handleClick(heading.id)}
                className={`flex items-start gap-2 text-sm transition-colors hover:text-white text-left w-full ${
                  activeId === heading.id 
                    ? 'text-white font-medium' 
                    : 'text-slate-400'
                }`}
                style={{
                  color: activeId === heading.id ? BRAND_COLORS.PRIMARY : undefined,
                }}
              >
                <ChevronRight 
                  className={`w-3 h-3 mt-1 flex-shrink-0 transition-transform ${
                    activeId === heading.id ? 'rotate-90' : ''
                  }`}
                />
                <span className="line-clamp-2">{heading.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};