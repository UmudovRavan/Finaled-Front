import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import altensorLogo from '../assets/Altensor-Logo.png';
import { BLOG_POSTS } from '../data/blogData';
import { useLanguage } from '../context/LanguageContext';

const BlogPostPage = () => {
  const { slug } = useParams();
  const { t } = useLanguage();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavbar Component */}
      <TopNavbar />

      {/* Main Content */}
      <main className="pt-28 md:pt-36 pb-section-gap relative">
        {/* Background Ambient Glow */}
        <div className="halo-bg absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] max-w-4xl opacity-30"></div>

        {/* Post Container (Constrained width for reading comfort) */}
        <article className="px-container-padding-mobile max-w-[720px] mx-auto relative z-10">
          {/* Back to Editorial Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-label-sm text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors mb-8"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> {t('blog.backToBlog', {}, 'Back to Editorial')}
          </Link>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full border border-white/10 font-label-sm text-xs text-primary uppercase tracking-wider font-semibold">
                {post.category}
              </span>
              <span className="text-xs font-label-sm text-on-surface-variant/60">
                {post.readTime}
              </span>
            </div>

            <h1 className="font-headline-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6 leading-[1.15]">
              {post.title}
            </h1>

            {/* Author Metadata Row */}
            <div className="flex items-center gap-3 py-4 border-y border-white/10">
              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center border border-surface">
                {post.author.initials}
              </div>
              <div>
                <span className="block text-xs font-label-sm text-on-surface font-semibold">
                  {post.author.name}
                </span>
                <span className="block text-[11px] font-label-sm text-on-surface-variant/70">
                  {post.author.role} • {post.date}
                </span>
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div className="space-y-6 text-on-surface-variant/95 text-base md:text-lg leading-relaxed font-body-lg">
            <p className="text-on-surface font-medium text-lg md:text-xl leading-relaxed">
              {post.content.intro}
            </p>

            {/* Abstract Inline Visual Diagram */}
            <div className="my-10 p-8 rounded-2xl bg-surface-container-low border border-white/10 relative overflow-hidden flex items-center justify-center">
              <div className="blob-atmosphere w-48 h-48 opacity-40"></div>
              <svg className="w-full h-32 relative z-10" viewBox="0 0 400 120" fill="none">
                <path d="M40 60 C120 10, 280 110, 360 60" stroke="url(#post-inline-grad)" strokeWidth="3" strokeDasharray="6 6" />
                <circle cx="40" cy="60" r="8" fill="#ffafd6" />
                <circle cx="200" cy="60" r="10" fill="#7b4fe0" />
                <circle cx="360" cy="60" r="8" fill="#2e5fa3" />
                <defs>
                  <linearGradient id="post-inline-grad" x1="0" y1="0" x2="400" y2="0">
                    <stop offset="0%" stopColor="#ffafd6" />
                    <stop offset="50%" stopColor="#7b4fe0" />
                    <stop offset="100%" stopColor="#2e5fa3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {post.content.sections.map((sec, i) => (
              <div key={i} className="space-y-3 pt-4">
                <h3 className="font-headline-display text-xl md:text-2xl font-bold text-on-surface tracking-tight">
                  {sec.heading}
                </h3>
                <p>{sec.text}</p>
              </div>
            ))}

            {/* Pull Quote */}
            {post.content.pullQuote && (
              <blockquote className="border-l-2 border-primary pl-6 my-10 italic text-lg md:text-xl text-on-surface font-headline-display leading-relaxed bg-white/[0.02] py-4 rounded-r-xl">
                "{post.content.pullQuote}"
              </blockquote>
            )}

            <p className="pt-2">{post.content.conclusion}</p>
          </div>
        </article>

        {/* Related Posts Row */}
        {relatedPosts.length > 0 && (
          <section className="px-container-padding-mobile md:px-container-padding-desktop max-w-6xl mx-auto mt-24 pt-12 border-t border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline-display text-2xl font-bold text-on-surface">Related Articles</h3>
              <Link to="/blog" className="font-label-sm text-xs text-primary hover:underline uppercase tracking-wider font-semibold">
                View All →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="glass-card p-6 rounded-2xl border border-white/10 group hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block mb-2 font-label-sm text-[11px] text-primary uppercase tracking-wider font-semibold">
                      {rel.category}
                    </span>
                    <h4 className="font-headline-display text-lg font-bold leading-snug text-on-surface group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="font-body-md text-xs text-on-surface-variant/80 line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-label-sm text-on-surface-variant/60">
                    <span>{rel.author.name}</span>
                    <span>{rel.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Closing CTA */}
        <section className="mt-24 px-container-padding-mobile md:px-container-padding-desktop max-w-4xl mx-auto relative">
          <div className="blob-atmosphere top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-40"></div>
          <div className="relative w-full rounded-3xl overflow-hidden bg-surface-container-low border border-white/10 p-8 md:p-12 flex flex-col items-center text-center shadow-xl backdrop-blur-xl z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 via-surface/90 to-secondary-container/10 z-0"></div>
            <div className="relative z-10 max-w-lg">
              <h2 className="font-headline-display text-2xl md:text-3xl font-bold mb-3 text-on-surface">
                Build a smarter way to run your business.
              </h2>
              <p className="font-body-lg text-xs md:text-sm text-on-surface-variant/90 mb-6 leading-relaxed">
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

export default BlogPostPage;
