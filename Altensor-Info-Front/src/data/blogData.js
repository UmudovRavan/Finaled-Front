export const BLOG_CATEGORIES = ['All', 'Product', 'CRM', 'Productivity', 'Company'];

export const BLOG_POSTS = [
  {
    id: '1',
    slug: 'architecture-of-intelligent-workflows',
    category: 'Product',
    categoryColor: 'from-[#ffafd6] to-[#c6318f]',
    title: 'The Architecture of Intelligent Workflows',
    excerpt: 'Exploring how minimalist design principles applied to enterprise software can drastically reduce cognitive friction and unlock team focus.',
    author: { name: 'Alexander Reed', initials: 'AR', role: 'Head of Product Design' },
    date: 'August 14, 2024',
    readTime: '6 min read',
    featured: true,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    gradientTheme: 'from-[#c6318f] via-[#7b4fe0] to-[#2e5fa3]',
    content: {
      intro: 'Modern enterprise software has spent the last decade accumulating feature debt. What began as sleek productivity tools evolved into dense, hyper-fragmented dashboards that demand constant cognitive overhead.',
      sections: [
        {
          heading: '1. The Cognitive Cost of Friction',
          text: 'Every redundant click, unnecessary notification badge, and dense data table imposes a tax on human attention. When team members spend 40% of their working hours navigating software mechanics rather than solving domain problems, velocity collapses.'
        },
        {
          heading: '2. Whitespace as an Operational Priority',
          text: 'In the Altensor system, whitespace is not empty space—it is functional buffer. By prioritizing clear visual hierarchy, contextual actions, and restrained color palettes, we reduce context switching and foster continuous flow states.'
        }
      ],
      pullQuote: 'Minimalism in enterprise tools is not aesthetic luxury—it is an economic multiplier for human velocity.',
      conclusion: 'Designing intelligent workflows requires the courage to subtract. When the interface gets out of the way, meaningful execution takes center stage.'
    }
  },
  {
    id: '2',
    slug: 'navigating-client-relationships-digital-era',
    category: 'CRM',
    categoryColor: 'from-[#d0bcff] to-[#541eb8]',
    title: 'Navigating Client Relationships in a Noisy Digital Era',
    excerpt: 'Why quality of interaction supersedes volume in modern B2B engagements, and how quiet CRM architecture drives long-term retention.',
    author: { name: 'Elena Vance', initials: 'EV', role: 'Director of Customer Experience' },
    date: 'August 10, 2024',
    readTime: '4 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    gradientTheme: 'from-[#541eb8] via-[#4270b5] to-[#003063]',
    content: {
      intro: 'Traditional CRMs were built as digital filing cabinets—dense databases optimized for record-keeping rather than building meaningful enterprise partnerships.',
      sections: [
        {
          heading: 'Signal Over Noise',
          text: 'Rather than tracking every trivial touchpoint, modern relationship systems synthesize high-intent signals. Knowing when a client needs strategic support outweighs automated spam sequences.'
        }
      ],
      pullQuote: 'Deep client trust is built through intentional clarity, not automated outreach volume.',
      conclusion: 'A CRM should empower account managers to listen better, act faster, and cultivate authentic enterprise relationships.'
    }
  },
  {
    id: '3',
    slug: 'embracing-whitespace-in-task-management',
    category: 'Productivity',
    categoryColor: 'from-[#a9c7ff] to-[#4270b5]',
    title: 'Embracing Whitespace in Task Management',
    excerpt: 'How reducing visual clutter directly impacts team velocity and focus across multi-disciplinary engineering and editorial teams.',
    author: { name: 'Julian Hayes', initials: 'JH', role: 'Lead Operations Architect' },
    date: 'August 04, 2024',
    readTime: '5 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    gradientTheme: 'from-[#4270b5] via-[#a9c7ff] to-[#c6318f]',
    content: {
      intro: 'Visual clutter in project management boards is the silent killer of sprint progress. When everything looks urgent, nothing gets prioritized effectively.',
      sections: [
        {
          heading: 'Restrained Spatial Hierarchy',
          text: 'By enforcing strict layout boundaries and muted card states, teams can immediately spot bottleneck items without scanning hundreds of micro-badges.'
        }
      ],
      pullQuote: 'Clarity comes from what you choose to hide until the user explicitly needs it.',
      conclusion: 'Streamlined task systems respect human focus and build operational confidence.'
    }
  },
  {
    id: '4',
    slug: 'designing-for-quiet-confidence',
    category: 'Company',
    categoryColor: 'from-[#ffafd6] to-[#d0bcff]',
    title: 'Designing for Quiet Confidence: The Altensor Philosophy',
    excerpt: 'Behind our product choices: why we built a calm, unified workspace that shuns artificial engagement hacks.',
    author: { name: 'Sophia Chen', initials: 'SC', role: 'Co-Founder & CEO' },
    date: 'July 28, 2024',
    readTime: '7 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    gradientTheme: 'from-[#c6318f] via-[#d0bcff] to-[#a9c7ff]',
    content: {
      intro: 'We started Altensor with a simple thesis: business software should feel as serene, powerful, and deliberate as high-end architecture.',
      sections: [
        {
          heading: 'Building Tools That Serve, Not Distract',
          text: 'We explicitly rejected dark patterns, gamified streak badges, and aggressive notification pings. Enterprise workers deserve software that values their focus.'
        }
      ],
      pullQuote: 'Great software feels calm under pressure. It provides answers before you ask, and steps aside when you execute.',
      conclusion: 'Our commitment to quiet confidence guides every line of code and pixel we craft.'
    }
  },
  {
    id: '5',
    slug: 'synthesizing-data-streams-with-editorial-ai',
    category: 'Product',
    categoryColor: 'from-[#ffafd6] to-[#c6318f]',
    title: 'Synthesizing Complex Data Streams with Editorial AI',
    excerpt: 'Transforming unstructured enterprise metrics into distilled, actionable summaries for C-suite decision making.',
    author: { name: 'Marcus Thorne', initials: 'MT', role: 'Principal AI Scientist' },
    date: 'July 19, 2024',
    readTime: '5 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    gradientTheme: 'from-[#7b4fe0] via-[#c6318f] to-[#ffafd6]',
    content: {
      intro: 'Raw data is abundant; actionable clarity is rare. AI in the enterprise should act as an editorial filter, distilling noise into narrative insight.',
      sections: [
        {
          heading: 'Contextual Synthesis Engine',
          text: 'Our AI models cross-reference pipeline changes, team tasks, and client notes to surface only high-confidence executive takeaways.'
        }
      ],
      pullQuote: 'The goal of AI in business is not more generated content—it is faster human comprehension.',
      conclusion: 'Editorial AI bridges the gap between raw telemetry and executive decision making.'
    }
  },
  {
    id: '6',
    slug: 'the-future-of-unified-enterprise-workspaces',
    category: 'CRM',
    categoryColor: 'from-[#d0bcff] to-[#541eb8]',
    title: 'The Future of Unified Enterprise Workspaces',
    excerpt: 'Why standalone app silos are giving way to single-canvas environments with zero context-switching.',
    author: { name: 'Alexander Reed', initials: 'AR', role: 'Head of Product Design' },
    date: 'July 11, 2024',
    readTime: '4 min read',
    featured: false,
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    gradientTheme: 'from-[#541eb8] via-[#2e5fa3] to-[#ffafd6]',
    content: {
      intro: 'The modern workforce switches between an average of 12 apps per hour. Context switching degrades mental clarity and fragments institutional knowledge.',
      sections: [
        {
          heading: 'Single Canvas Architecture',
          text: 'Bringing tasks, CRM leads, and editorial AI under one unified design system restores mental focus and accelerates operational velocity.'
        }
      ],
      pullQuote: 'Unified software creates unified teams.',
      conclusion: 'The era of app chaos is ending; the era of calm unified workspaces is here.'
    }
  }
];
