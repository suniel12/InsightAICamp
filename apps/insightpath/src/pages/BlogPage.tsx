import React, { useState, useMemo } from 'react';
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { BlogList } from '@/components/blog/BlogList';
import blogContent from '@/data/blogContent.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen } from 'lucide-react';
import { BRAND_COLORS } from '@/constants/styles';

const BlogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get all posts and categories from blogContent
  const allPosts = useMemo(() => blogContent, []);
  const categories = useMemo(() => {
    const cats = new Set(blogContent.map(post => post.category));
    return Array.from(cats);
  }, []);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    
    // Apply category filter
    if (selectedCategory) {
      posts = posts.filter(post => post.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.category.toLowerCase().includes(searchLower)
      );
    }
    
    return posts;
  }, [searchQuery, selectedCategory, allPosts]);

  return (
    <div className="min-h-screen bg-slate-900">
      <NavigationHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8" style={{ color: BRAND_COLORS.PRIMARY }} />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                GigaWatt Academy Blog
              </h1>
            </div>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Expert insights on data center careers, cloud engineering, and the future of AI infrastructure
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? "bg-primary" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
              >
                All Posts
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-primary" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Featured Article</h2>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-lg border border-primary/20">
                <h3 className="text-3xl font-bold text-white mb-4">
                  {filteredPosts[0].title}
                </h3>
                <p className="text-lg text-slate-300 mb-6">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      By {filteredPosts[0].author.name}
                    </span>
                    <span className="text-sm text-slate-400">
                      {filteredPosts[0].readingTime} min read
                    </span>
                  </div>
                  <Button 
                    className="btn-hero"
                    style={{ backgroundColor: BRAND_COLORS.PRIMARY, color: 'white' }}
                    onClick={() => window.location.href = `/blog/${filteredPosts[0].slug}`}
                  >
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory ? `${selectedCategory} Articles` : 'All Articles'}
              </h2>
              <p className="text-slate-400">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
              </p>
            </div>
            
            {filteredPosts.length > 0 ? (
              <BlogList posts={filteredPosts.slice(1)} />
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-slate-400">No articles found matching your criteria.</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 px-4 bg-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated on AI Infrastructure Careers
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              Get weekly insights on data center jobs, career tips, and industry trends
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              <Button 
                className="btn-hero"
                style={{ backgroundColor: BRAND_COLORS.PRIMARY, color: 'white' }}
              >
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;