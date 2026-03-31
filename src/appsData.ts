export type Platform = "Google AI Studio" | "Leap.new" | "Lovable.dev" | "Bolt.new" | "GitHub"

export interface App {
  id: number
  name: string
  description: string
  platform: Platform
  category: string
  tags: string[]
  featured: boolean
  initials: string
  launchUrl?: string
  githubUrl?: string
}

export const PLATFORMS: { name: Platform; short: string; description: string; color: string }[] = [
  {
    name: "Google AI Studio",
    short: "G",
    description: "AI-powered applications built with Google's cutting-edge AI models",
    color: "#4285F4",
  },
  {
    name: "Leap.new",
    short: "L",
    description: "Rapid prototyping and deployment with Leap's modern framework",
    color: "#10B981",
  },
  {
    name: "Lovable.dev",
    short: "L",
    description: "Beautiful, user-friendly applications crafted with Lovable",
    color: "#F59E0B",
  },
  {
    name: "Bolt.new",
    short: "B",
    description: "Lightning-fast full-stack apps built with Bolt's AI platform",
    color: "#8B5CF6",
  },
  {
    name: "GitHub",
    short: "GH",
    description: "Custom-built applications hosted and deployed from GitHub",
    color: "#E5E5E5",
  },
]

export const CATEGORIES = [
  "AI Tools",
  "Productivity",
  "Business",
  "Finance",
  "Marketing",
  "Utilities",
  "Health",
  "Developer Tools",
  "Real Estate",
  "Education",
]

export const APPS: App[] = [
  {
    id: 1,
    name: "Social Media Scheduler",
    description:
      "Schedule and manage posts across all major social media platforms with AI-powered content suggestions.",
    platform: "Lovable.dev",
    category: "Marketing",
    tags: ["Social Media", "Marketing", "Automation"],
    featured: true,
    initials: "S",
  },
  {
    id: 2,
    name: "E-Commerce Dashboard",
    description:
      "Real-time analytics dashboard for e-commerce businesses with sales tracking, inventory management, and customer insights.",
    platform: "Bolt.new",
    category: "Business",
    tags: ["Analytics", "E-Commerce", "Dashboard"],
    featured: true,
    initials: "E",
  },
  {
    id: 3,
    name: "Smart Task Manager",
    description:
      "Intelligent project management app with AI-driven task prioritization and team collaboration features.",
    platform: "Lovable.dev",
    category: "Productivity",
    tags: ["Productivity", "Teams", "AI"],
    featured: true,
    initials: "S",
  },
  {
    id: 4,
    name: "AI Content Generator",
    description:
      "Advanced AI-powered content creation tool built with Google AI Studio. Generate blog posts, social media content, and marketing copy instantly.",
    platform: "Google AI Studio",
    category: "AI Tools",
    tags: ["AI", "Content", "Marketing"],
    featured: true,
    initials: "A",
  },
  {
    id: 5,
    name: "Learning Management System",
    description:
      "Comprehensive online learning platform with course creation, student tracking, and interactive assessments.",
    platform: "Bolt.new",
    category: "Education",
    tags: ["Education", "Learning", "Courses"],
    featured: true,
    initials: "L",
  },
  {
    id: 6,
    name: "AI Image Studio",
    description:
      "Create stunning AI-generated images, edit photos with AI tools, and design graphics for any purpose.",
    platform: "Google AI Studio",
    category: "AI Tools",
    tags: ["AI", "Images", "Design"],
    featured: true,
    initials: "A",
  },
  {
    id: 7,
    name: "Fitness Companion",
    description:
      "AI-powered fitness tracking with personalized workout plans, nutrition guidance, and progress analytics.",
    platform: "Bolt.new",
    category: "Health",
    tags: ["Fitness", "Health", "AI"],
    featured: true,
    initials: "F",
  },
  {
    id: 8,
    name: "AI Chat Assistant",
    description:
      "A powerful conversational AI built with Google AI Studio. Features real-time streaming responses, context memory, and multi-turn conversations.",
    platform: "Google AI Studio",
    category: "AI Tools",
    tags: ["AI", "Chat", "Productivity"],
    featured: true,
    initials: "A",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 9,
    name: "Portfolio Builder",
    description:
      "Drag-and-drop portfolio creator built on Lovable.dev. Create stunning portfolios in minutes with AI-powered design suggestions.",
    platform: "Lovable.dev",
    category: "Business",
    tags: ["Portfolio", "Design", "AI"],
    featured: true,
    initials: "P",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 10,
    name: "Code Playground",
    description:
      "Interactive code editor and runner built with Bolt.new. Supports JavaScript, Python, and TypeScript with real-time preview.",
    platform: "Bolt.new",
    category: "Developer Tools",
    tags: ["Code", "Developer", "Education"],
    featured: true,
    initials: "C",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 11,
    name: "Image Generator",
    description:
      "AI-powered image generation tool using Stable Diffusion. Create stunning artwork from text prompts with style controls.",
    platform: "Leap.new",
    category: "AI Tools",
    tags: ["AI", "Images", "Art"],
    featured: true,
    initials: "I",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 12,
    name: "Code Review Assistant",
    description:
      "Automated code review tool that analyzes pull requests, suggests improvements, and ensures code quality standards.",
    platform: "GitHub",
    category: "Developer Tools",
    tags: ["Developer", "AI", "Code"],
    featured: false,
    initials: "C",
  },
  {
    id: 13,
    name: "Invoice Generator Pro",
    description:
      "Professional invoice creation and management system with automated billing, payment tracking, and client management.",
    platform: "Leap.new",
    category: "Finance",
    tags: ["Business", "Finance", "Invoicing"],
    featured: false,
    initials: "I",
  },
  {
    id: 14,
    name: "Weather Intelligence",
    description:
      "Hyper-local weather forecasting app with AI predictions, severe weather alerts, and historical data analysis.",
    platform: "GitHub",
    category: "Utilities",
    tags: ["Weather", "AI", "Data"],
    featured: false,
    initials: "W",
  },
  {
    id: 15,
    name: "Real Estate Finder",
    description:
      "Smart property search platform with AI-powered recommendations, virtual tours, and market analysis.",
    platform: "Lovable.dev",
    category: "Real Estate",
    tags: ["Real Estate", "AI", "Search"],
    featured: false,
    initials: "R",
  },
  {
    id: 16,
    name: "Crypto Portfolio Tracker",
    description:
      "Track your cryptocurrency investments in real-time with advanced charting, alerts, and portfolio analytics.",
    platform: "Leap.new",
    category: "Finance",
    tags: ["Crypto", "Finance", "Trading"],
    featured: false,
    initials: "C",
  },
  {
    id: 17,
    name: "Fitness Tracker",
    description:
      "Comprehensive fitness tracking app with workout plans, progress charts, and nutrition logging.",
    platform: "GitHub",
    category: "Health",
    tags: ["Fitness", "Health", "Tracking"],
    featured: false,
    initials: "F",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 18,
    name: "Voice Notes AI",
    description:
      "Speech-to-text note-taking app with AI summarization. Record meetings and get instant summaries and action items.",
    platform: "Google AI Studio",
    category: "AI Tools",
    tags: ["Voice", "AI", "Productivity"],
    featured: false,
    initials: "V",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 19,
    name: "E-Commerce Store",
    description:
      "Full-stack e-commerce platform with Stripe payments, inventory management, and admin dashboard.",
    platform: "Bolt.new",
    category: "Business",
    tags: ["E-Commerce", "Payments", "Business"],
    featured: false,
    initials: "E",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 20,
    name: "Weather Dashboard",
    description:
      "Beautiful weather dashboard with 7-day forecasts, radar maps, and severe weather alerts. Built during a hackathon.",
    platform: "GitHub",
    category: "Utilities",
    tags: ["Weather", "Dashboard", "Data"],
    featured: false,
    initials: "W",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 21,
    name: "Social Media Dashboard",
    description:
      "Unified social media management tool. Schedule posts, track analytics, and manage multiple accounts.",
    platform: "GitHub",
    category: "Marketing",
    tags: ["Social Media", "Analytics", "Marketing"],
    featured: false,
    initials: "S",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 22,
    name: "Task Manager Pro",
    description:
      "Full-featured project management tool with Kanban boards, Gantt charts, and team collaboration features.",
    platform: "GitHub",
    category: "Productivity",
    tags: ["Productivity", "Teams", "Kanban"],
    featured: false,
    initials: "T",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 23,
    name: "Music Visualizer",
    description:
      "Real-time audio visualizer with WebGL shaders. Upload tracks or connect Spotify for stunning visual experiences.",
    platform: "GitHub",
    category: "Utilities",
    tags: ["Music", "Visualization", "WebGL"],
    featured: false,
    initials: "M",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 24,
    name: "Markdown Editor",
    description:
      "Distraction-free markdown editor with live preview, syntax highlighting, and cloud sync.",
    platform: "GitHub",
    category: "Productivity",
    tags: ["Writing", "Markdown", "Editor"],
    featured: false,
    initials: "M",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 25,
    name: "Budget Planner",
    description:
      "Smart budgeting app with expense categorization, savings goals, and financial insights powered by AI.",
    platform: "GitHub",
    category: "Finance",
    tags: ["Finance", "Budget", "AI"],
    featured: false,
    initials: "B",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 26,
    name: "Recipe Finder",
    description:
      "AI-powered recipe discovery app. Snap a photo of ingredients and get personalized recipe suggestions.",
    platform: "GitHub",
    category: "Utilities",
    tags: ["Food", "AI", "Recipes"],
    featured: false,
    initials: "R",
    githubUrl: "https://github.com/lordamos/ThoughtlyfeWebsite",
  },
  {
    id: 27,
    name: "2025 Aura Sync",
    description: "Next-generation synchronization platform for modern digital workflows.",
    platform: "GitHub",
    category: "Utilities",
    tags: ["Sync", "Workflow", "Automation"],
    featured: true,
    initials: "A",
    githubUrl: "https://github.com/lordamos/2025AURASYNC",
    launchUrl: "https://2025aurasync-cwuorjyio-sumthin3lseinc-4001s-projects.vercel.app",
  },
  {
    id: 28,
    name: "PassionPlay AI Co-Pilot",
    description: "AI-driven co-pilot for creative content generation and management.",
    platform: "GitHub",
    category: "AI Tools",
    tags: ["AI", "Co-Pilot", "Creative"],
    featured: true,
    initials: "P",
    githubUrl: "https://github.com/lordamos/PassionPlay-AI-Co-Pilot-netify",
    launchUrl: "https://passionplay-ai-co-pilot-netify-i2dxe3bva.vercel.app",
  },
]
