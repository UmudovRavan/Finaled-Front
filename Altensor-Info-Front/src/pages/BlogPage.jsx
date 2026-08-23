import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import altensorLogo from '../assets/Altensor-Logo.png';
import { BLOG_CATEGORIES, BLOG_POSTS } from '../data/blogData';
import { useLanguage } from '../context/LanguageContext';

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);
  const { t } = useLanguage();

  const featuredPost = BLOG_POSTS.find((post) => post.featured) || BLOG_POSTS[0];
  const gridPosts = BLOG_POSTS.filter((post) => {
    if (activeCategory === 'All') return !post.featured;
    return post.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const displayedPosts = gridPosts.slice(0, visibleCount);

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavbar Component */}
      <TopNavbar />

      {/* Main Content */}
      <main className="pt-28 md:pt-36 pb-section-gap relative">
        {/* Background Ambient Glow */}
        <div className="halo-bg absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] max-w-5xl opacity-35"></div>

        {/* 1. Blog Header / Hero */}
        <header className="px-container-padding-mobile md:px-container-padding-desktop max-w-5xl mx-auto pt-6 pb-10 text-center relative z-10">
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/5 border border-white/10 font-label-sm text-xs text-primary uppercase tracking-widest font-semibold mb-3">
            {t('blog.editorial', {}, 'EDITORIAL')}
          </span>
          <h1 className="font-headline-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-on-surface mb-4 leading-tight">
            {t('blog.title', {}, 'Insights on intelligent work')}
          </h1>
          <p className="font-body-lg text-base md:text-lg text-on-surface-variant/90 max-w-2xl mx-auto leading-relaxed">
            {t('blog.subtitle', {}, 'Perspectives on enterprise software, restrained design, and the architecture of calm workflows.')}
          </p>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mt-10 overflow-x-auto pb-2 scrollbar-none">
            {BLOG_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full font-label-sm text-xs uppercase tracking-wider transition-all border whitespace-nowrap ${isActive
                    ? 'bg-white/10 text-primary border-primary/50 shadow-md font-semibold'
                    : 'bg-transparent text-on-surface-variant/70 border-transparent hover:text-on-surface hover:bg-white/5'
                    }`}
                >
                  {cat === 'All' ? t('blog.allCategories', {}, 'All') : cat}
                </button>
              );
            })}
          </div>
        </header>

        {/* Liquid Divider Wave */}
        <div className="w-full overflow-hidden my-4">
          <svg className="w-full h-auto pointer-events-none opacity-30" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 C320,100 420,0 720,50 C1020,100 1120,0 1440,50 L1440,100 L0,100 Z" fill="none" stroke="rgba(255, 175, 214, 0.2)" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* 2. Featured Post Card */}
        {activeCategory === 'All' && featuredPost && (
          <section className="px-container-padding-mobile md:px-container-padding-desktop max-w-6xl mx-auto mb-16 relative z-10">
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="block glass-card rounded-3xl border border-white/15 overflow-hidden group hover:border-primary/40 transition-all duration-500 shadow-2xl bg-surface-container-low/80"
            >
              <div className="grid md:grid-cols-12 gap-0 items-center">
                {/* Featured Rich Image Thumbnail */}
                <div className="md:col-span-7 h-[300px] md:h-[420px] relative overflow-hidden bg-surface-container-high">
                  <img
                    src={featuredPost.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/30 via-transparent to-secondary-container/20 pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-background/80 pointer-events-none"></div>
                </div>

                {/* Featured Post Details */}
                <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-between h-full">
                  <div>
                    <span className="inline-block px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full border border-white/10 font-label-sm text-xs text-primary uppercase tracking-wider font-semibold mb-4">
                      Featured • {featuredPost.category}
                    </span>
                    <h2 className="font-headline-display text-2xl md:text-3xl font-bold leading-tight text-on-surface group-hover:text-primary transition-colors mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="font-body-md text-sm md:text-base text-on-surface-variant/90 leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center border border-surface">
                        {featuredPost.author.initials}
                      </div>
                      <div>
                        <span className="block text-xs font-label-sm text-on-surface font-semibold">
                          {featuredPost.author.name}
                        </span>
                        <span className="block text-[11px] font-label-sm text-on-surface-variant/70">
                          {featuredPost.date}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-label-sm text-on-surface-variant/80 font-medium">
                      {featuredPost.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* 3. Post Grid */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedPosts.map((post, idx) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl bg-surface-container-low/70 ${idx % 3 === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
              >
                <div>
                  {/* Rich Post Image Thumbnail */}
                  <div className="h-52 relative overflow-hidden bg-surface-container-high">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-2.5 py-1 bg-surface/85 backdrop-blur-md rounded-full border border-white/10 font-label-sm text-[11px] uppercase tracking-wider text-primary font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="font-headline-display text-xl font-bold leading-snug text-on-surface group-hover:text-primary transition-colors mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="font-body-md text-xs text-on-surface-variant/85 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="px-6 pb-6 pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[11px] flex items-center justify-center border border-surface">
                      {post.author.initials}
                    </div>
                    <span className="text-xs font-label-sm text-on-surface-variant/80">
                      {post.author.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-label-sm text-on-surface-variant/60">
                    {post.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 4. Pagination / Load More */}
          {visibleCount < gridPosts.length && (
            <div className="mt-14 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 3)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full btn-secondary font-label-sm text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface border border-white/10 transition-colors cursor-pointer"
              >
                {t('blog.loadMore', {}, 'Load More Articles')} <span className="material-symbols-outlined text-base">expand_more</span>
              </button>
            </div>
          )}
        </section>

        {/* 5. Closing CTA */}
        <section className="mt-28 px-container-padding-mobile md:px-container-padding-desktop max-w-4xl mx-auto relative">
          <div className="blob-atmosphere top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-40"></div>
          <div className="relative w-full rounded-3xl overflow-hidden bg-surface-container-low border border-white/10 p-8 md:p-14 flex flex-col items-center text-center shadow-xl backdrop-blur-xl z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 via-surface/90 to-secondary-container/10 z-0"></div>
            <div className="relative z-10 max-w-lg">
              <h2 className="font-headline-display text-2xl md:text-4xl font-bold mb-3 text-on-surface">
                Build a smarter way to run your business.
              </h2>
              <p className="font-body-lg text-sm md:text-base text-on-surface-variant/90 mb-6 leading-relaxed">
                Join forward-thinking enterprises that value design, clarity, and performance.
              </p>
              <button className="btn-primary px-8 py-3.5 rounded-full font-label-sm text-xs uppercase tracking-widest shadow-lg font-semibold">
                Get Started Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <footer id="about" className="w-full py-16 px-container-padding-mobile md:px-container-padding-desktop grid grid-cols-2 md:grid-cols-12 gap-8 bg-surface-container-lowest relative z-10 border-t border-white/10">
        <div className="col-span-2 md:col-span-4 flex flex-col justify-between mb-8 md:mb-0">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={altensorLogo} alt="Altensor Logo" className="h-7 w-auto object-contain opacity-90" />
              <span className="font-headline-display text-xl font-bold text-on-surface tracking-tight">
                Altensor
              </span>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant/70 max-w-xs leading-relaxed">
              Intelligent Editorial Systems for modern enterprise teams.
            </p>
          </div>
          <p className="font-body-md text-xs text-on-surface-variant/50 mt-8 md:mt-0">
            © 2024 Altensor Inc. All rights reserved.
          </p>
        </div>
        <div className="col-span-1 md:col-span-4 md:col-start-6">
          <h5 className="font-label-sm text-xs text-on-surface/60 mb-4 uppercase tracking-widest font-semibold">Platform</h5>
          <ul className="space-y-3 text-xs font-body-md">
            <li><Link className="text-on-surface-variant hover:text-primary transition-colors block" to="/">Task Management</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary transition-colors block" to="/">CRM</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary transition-colors block" to="/">Editorial AI</Link></li>
          </ul>
        </div>
        <div className="col-span-1 md:col-span-3">
          <h5 className="font-label-sm text-xs text-on-surface/60 mb-4 uppercase tracking-widest font-semibold">Company</h5>
          <ul className="space-y-3 text-xs font-body-md">
            <li><Link className="text-on-surface-variant hover:text-primary transition-colors block" to="/blog">Company Blog</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary transition-colors block" to="/">Our Philosophy</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary transition-colors block" to="/">Contact</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
