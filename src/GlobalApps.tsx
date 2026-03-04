import { useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { APPS, CATEGORIES, PLATFORMS, type App, type Platform } from "./appsData"

// ─── Platform badge colour map ───────────────────────────────────────────────
const PLATFORM_COLORS: Record<Platform, string> = {
  "Google AI Studio": "#4285F4",
  "Leap.new": "#10B981",
  "Lovable.dev": "#F59E0B",
  "Bolt.new": "#8B5CF6",
  GitHub: "#E5E5E5",
}

const PLATFORM_BG: Record<Platform, string> = {
  "Google AI Studio": "rgba(66,133,244,0.15)",
  "Leap.new": "rgba(16,185,129,0.15)",
  "Lovable.dev": "rgba(245,158,11,0.15)",
  "Bolt.new": "rgba(139,92,246,0.15)",
  GitHub: "rgba(229,229,229,0.1)",
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-xl px-6 py-5 min-w-[130px]">
      <span className="text-2xl mb-1">{icon}</span>
      <span className="font-serif text-3xl font-bold text-[#D4AF37]">{value}</span>
      <span className="font-sans text-xs uppercase tracking-widest text-neutral-400 mt-1">{label}</span>
    </div>
  )
}

// ─── Platform pill ────────────────────────────────────────────────────────────
function PlatformPill({ platform }: { platform: Platform }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full border"
      style={{
        color: PLATFORM_COLORS[platform],
        borderColor: PLATFORM_COLORS[platform] + "55",
        background: PLATFORM_BG[platform],
      }}
    >
      {platform}
    </span>
  )
}

// ─── App Card ─────────────────────────────────────────────────────────────────
function AppCard({ app, onLaunch }: { app: App; onLaunch: (app: App) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="relative group bg-[#0d0d1a] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#D4AF37]/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] transition-all duration-300"
    >
      {app.featured && (
        <span className="absolute top-3 right-3 text-[9px] font-sans uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
          Featured
        </span>
      )}

      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center font-serif text-xl font-bold text-black shrink-0"
        style={{ background: "linear-gradient(135deg, #C9A227, #D4AF37)" }}
      >
        {app.initials}
      </div>

      {/* Name + platform */}
      <div>
        <h3 className="font-serif text-base font-bold text-white leading-tight">{app.name}</h3>
        <div className="mt-1">
          <PlatformPill platform={app.platform} />
        </div>
      </div>

      {/* Description */}
      <p className="font-sans text-xs text-neutral-400 leading-relaxed line-clamp-3 flex-1">
        {app.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {app.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-sans uppercase tracking-wider text-neutral-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onLaunch(app)}
          className="flex-1 text-xs font-sans uppercase tracking-widest bg-[#D4AF37] text-black px-3 py-2 rounded-lg hover:bg-[#4B0082] hover:text-white transition-colors duration-200"
        >
          Launch App
        </button>
        {app.githubUrl && (
          <a
            href={app.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-sans uppercase tracking-widest border border-white/20 text-neutral-400 px-3 py-2 rounded-lg hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors duration-200"
          >
            GitHub
          </a>
        )}
      </div>
    </motion.div>
  )
}

// ─── Sandbox Modal ────────────────────────────────────────────────────────────
function SandboxModal({ app, onClose }: { app: App; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a14]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm font-bold text-black"
              style={{ background: "linear-gradient(135deg, #C9A227, #D4AF37)" }}
            >
              {app.initials}
            </div>
            <div>
              <p className="font-serif text-white text-sm font-bold">{app.name}</p>
              <PlatformPill platform={app.platform} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {app.launchUrl && (
              <a
                href={app.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-sans uppercase tracking-widest text-neutral-400 border border-white/20 px-3 py-1.5 rounded-lg hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-colors"
              >
                Open in New Tab ↗
              </a>
            )}
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors text-xl leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sandbox content */}
        <div className="flex-1 flex items-center justify-center bg-[#07070f]">
          {app.launchUrl ? (
            <iframe
              ref={iframeRef}
              src={app.launchUrl}
              title={app.name}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          ) : (
            <div className="text-center max-w-md px-8">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-serif text-3xl font-bold text-black mx-auto mb-6"
                style={{ background: "linear-gradient(135deg, #C9A227, #D4AF37)" }}
              >
                {app.initials}
              </div>
              <h2 className="font-serif text-2xl font-bold text-white mb-3">{app.name}</h2>
              <p className="font-sans text-neutral-400 text-sm leading-relaxed mb-6">{app.description}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {app.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-sans uppercase tracking-wider text-neutral-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="font-sans text-xs text-neutral-600 italic">
                Live sandbox URL not yet configured for this app.
              </p>
              {app.githubUrl && (
                <a
                  href={app.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-xs font-sans uppercase tracking-widest border border-white/20 text-neutral-400 px-4 py-2 rounded-lg hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"
                >
                  View on GitHub ↗
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── How It Works step ────────────────────────────────────────────────────────
function HowStep({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-full border border-[#D4AF37]/40 flex items-center justify-center font-serif text-[#D4AF37] font-bold text-sm">
        {num}
      </div>
      <div>
        <h4 className="font-serif text-white font-bold mb-1">{title}</h4>
        <p className="font-sans text-sm text-neutral-400 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GlobalApps() {
  const location = useLocation()
  const isSGA = location.pathname === "/sga"
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [activePlatform, setActivePlatform] = useState<string>("All")
  const [selectedApp, setSelectedApp] = useState<App | null>(null)

  const filtered = useMemo(() => {
    return APPS.filter((app) => {
      const matchSearch =
        search === "" ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase()) ||
        app.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchCat = activeCategory === "All" || app.category === activeCategory
      const matchPlat = activePlatform === "All" || app.platform === activePlatform
      return matchSearch && matchCat && matchPlat
    })
  }, [search, activeCategory, activePlatform])

  const featuredApps = APPS.filter((a) => a.featured)
  const categoryCounts: Record<string, number> = { All: APPS.length }
  CATEGORIES.forEach((c) => {
    categoryCounts[c] = APPS.filter((a) => a.category === c).length
  })
  const platformCounts: Record<string, number> = { All: APPS.length }
  PLATFORMS.forEach((p) => {
    platformCounts[p.name] = APPS.filter((a) => a.platform === p.name).length
  })

  return (
    <div className="min-h-screen bg-[#07070f] text-white">

      {/* ── SGA Mini Header ── */}
      <header className="fixed top-0 w-full z-50 bg-[rgba(7,7,15,0.92)] backdrop-blur-[12px] border-b border-[rgba(212,175,55,0.25)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="font-sans text-[#D4AF37] text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
            ← Sumthin3lse
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#D4AF37] flex items-center justify-center">
              <span className="font-serif text-black text-[10px] font-black">S3</span>
            </div>
            <span className="font-serif text-white text-sm font-bold tracking-widest">
              {isSGA ? "SGA" : "GLOBAL APPS"}
            </span>
          </div>
          <nav className="flex gap-6 font-sans text-[11px] uppercase tracking-widest text-neutral-400">
            <a href="#portfolio" className="hover:text-[#D4AF37] transition-colors">Apps</a>
            <a href="#your-apps" className="hover:text-[#D4AF37] transition-colors">Your Apps</a>
            <a href="https://github.com/lordamos/ThoughtlyfeWebsite" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">GitHub</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6 text-center">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[700px] rounded-full bg-[#4B0082]/20 blur-[120px]" />
        </div>

        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/hero-poster.webp"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
        >
          <source src="/hero-bg.webm" type="video/webm" />
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070f]/60 via-transparent to-[#07070f] z-[1]" />

        <div className="relative z-[2]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)]">
              <span className="font-serif text-black text-2xl font-black">S3</span>
            </div>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-[#C9A227] via-[#F7E7A9] to-[#D4AF37] bg-clip-text text-transparent">
            {isSGA ? "SGA" : "SUMTHIN3LSE"}
          </h1>
          <p className="font-sans uppercase tracking-[0.3em] text-neutral-400 mt-2 text-sm">
            {isSGA ? "Sumthin3lse Global Apps" : "Global Apps"}
          </p>
          <p className="font-sans text-lg text-neutral-300 mt-6 max-w-xl mx-auto leading-relaxed">
            A curated portfolio of cutting-edge applications built across the most innovative platforms. Import from GitHub, add from any source, and launch every app live in its own sandbox.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <StatCard value="26" label="Live Apps" icon="⚡" />
            <StatCard value="6+" label="Platforms" icon="🌐" />
            <StatCard value="120+" label="GitHub Repos" icon="</>" />
            <StatCard value="100%" label="Sandboxed" icon="🛡" />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a
              href="#portfolio"
              className="bg-[#D4AF37] text-black font-sans uppercase tracking-widest text-sm px-8 py-3 rounded-none hover:bg-[#4B0082] hover:text-white transition-colors duration-200"
            >
              Explore Apps ↓
            </a>
            <a
              href="https://github.com/lordamos/ThoughtlyfeWebsite"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-neutral-300 font-sans uppercase tracking-widest text-sm px-8 py-3 rounded-none hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors duration-200"
            >
              Import from GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/10 bg-[#0a0a14] py-6 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "26", l: "Total Apps" },
            { v: "6", l: "Platforms" },
            { v: "13", l: "Categories" },
            { v: "11", l: "Featured" },
          ].map(({ v, l }) => (
            <div key={l}>
              <p className="font-serif text-3xl font-bold text-[#D4AF37]">{v}</p>
              <p className="font-sans text-xs uppercase tracking-widest text-neutral-500 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Spotlight / Featured ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-2">Featured</p>
        <h2 className="font-serif text-4xl font-bold text-white mb-10">Spotlight Apps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredApps.slice(0, 3).map((app) => (
            <AppCard key={app.id} app={app} onLaunch={setSelectedApp} />
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#0a0a14] border-y border-white/10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-2">How It Works</p>
          <h2 className="font-serif text-4xl font-bold text-white mb-12">From GitHub to Live Sandbox</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <HowStep num="01" title="Import or Add" body="Import apps directly from your GitHub repos with one click, or manually add apps from any platform — Google AI Studio, Leap, Lovable, Bolt, and more." />
            <HowStep num="02" title="Browse & Discover" body="Explore the portfolio of apps organized by category, platform, and tags. Use search and filters to find exactly what you need." />
            <HowStep num="03" title="Click to Launch" body="Click any app card to instantly launch it in a fully functional sandbox environment. No setup, no configuration needed." />
            <HowStep num="04" title="Full Sandbox Experience" body="Each app runs in its own isolated sandbox with full functionality. Go fullscreen, refresh, or open in a new tab anytime." />
            <HowStep num="05" title="Secure & Isolated" body="Every app runs in a sandboxed iframe with proper permissions. APIs and integrations work seamlessly within each sandbox." />
          </div>
        </div>
      </section>

      {/* ── Platforms ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-2">Built Across</p>
        <h2 className="font-serif text-4xl font-bold text-white mb-10">Multiple Platforms</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setActivePlatform(p.name); document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" }) }}
              className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5 text-left hover:border-[#D4AF37]/40 transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-serif font-bold text-sm mb-3"
                style={{ background: p.color + "22", color: p.color }}
              >
                {p.short}
              </div>
              <p className="font-serif text-white text-sm font-bold group-hover:text-[#D4AF37] transition-colors">{p.name}</p>
              <p className="font-sans text-xs text-neutral-500 mt-1 leading-snug">{p.description}</p>
              <p className="font-sans text-xs text-[#D4AF37] mt-2">{platformCounts[p.name]} apps</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Portfolio / All Apps ── */}
      <section id="portfolio" className="bg-[#0a0a14] border-t border-white/10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-2">App Portfolio</p>
          <h2 className="font-serif text-4xl font-bold text-white mb-8">
            Showing {filtered.length} of {APPS.length} apps
          </h2>

          {/* Search */}
          <div className="relative mb-6 max-w-lg">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search apps, categories, tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-white/10 text-white placeholder-neutral-600 font-sans text-sm pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                    : "border-white/10 text-neutral-400 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                }`}
              >
                {cat}
                <span className="ml-1 opacity-60">{categoryCounts[cat] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-10">
            {["All", ...PLATFORMS.map((p) => p.name)].map((plat) => (
              <button
                key={plat}
                onClick={() => setActivePlatform(plat)}
                className={`font-sans text-xs uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                  activePlatform === plat
                    ? "bg-[#4B0082] text-white border-[#4B0082]"
                    : "border-white/10 text-neutral-400 hover:border-[#4B0082]/60 hover:text-purple-300"
                }`}
              >
                {plat}
                <span className="ml-1 opacity-60">{platformCounts[plat] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* App grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filtered.map((app) => (
                <AppCard key={app.id} app={app} onLaunch={setSelectedApp} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-neutral-600">No apps found.</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); setActivePlatform("All") }}
                className="mt-4 font-sans text-sm text-[#D4AF37] underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Recently Added ── */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <p className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-2">Recently Added</p>
        <h2 className="font-serif text-4xl font-bold text-white mb-10">Latest Additions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {APPS.slice(0, 4).map((app) => (
            <AppCard key={app.id} app={app} onLaunch={setSelectedApp} />
          ))}
        </div>
      </section>

      {/* ── Your Apps ── */}
      <section id="your-apps" className="bg-[#0a0a14] border-y border-white/10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-2">Your Apps</p>
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Your Personal Portfolio</h2>
          <p className="font-sans text-neutral-400 text-sm leading-relaxed mb-10 max-w-xl">
            Apps you've built or imported from GitHub will appear here. Connect your GitHub account and import any repo to launch it instantly in the SGA sandbox.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Placeholder cards */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center hover:border-[#D4AF37]/30 transition-colors duration-300 min-h-[200px] cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors">
                  <span className="text-white/30 text-2xl group-hover:text-[#D4AF37]/60 transition-colors">+</span>
                </div>
                <p className="font-sans text-xs uppercase tracking-widest text-neutral-600 group-hover:text-neutral-400 transition-colors">
                  {i === 1 ? "Import from GitHub" : i === 2 ? "Add New App" : "Connect Platform"}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <a
              href="https://github.com/lordamos/ThoughtlyfeWebsite"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#D4AF37] text-black font-sans uppercase tracking-widest text-sm px-8 py-3 rounded-none hover:bg-[#4B0082] hover:text-white transition-colors duration-200"
            >
              Import from GitHub
            </a>
            <button className="border border-white/20 text-neutral-300 font-sans uppercase tracking-widest text-sm px-8 py-3 rounded-none hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors duration-200">
              Add Manually
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0a0a14] border-t border-white/10 px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Expand Your Portfolio</p>
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Built Something Amazing?</h2>
          <p className="font-sans text-neutral-400 leading-relaxed mb-10">
            Add your latest creation to the portfolio. Whether it's an AI tool, a productivity app, or a custom solution — showcase it here and launch it instantly from the sandbox.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-[#D4AF37] text-black font-sans uppercase tracking-widest text-sm px-8 py-3 rounded-none hover:bg-[#4B0082] hover:text-white transition-colors duration-200">
              Add New App
            </button>
            <a
              href="https://github.com/lordamos/ThoughtlyfeWebsite"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-neutral-300 font-sans uppercase tracking-widest text-sm px-8 py-3 rounded-none hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors duration-200"
            >
              Import from GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#D4AF37] flex items-center justify-center">
            <span className="font-serif text-black text-xs font-black">S3</span>
          </div>
          <p className="font-serif text-[#D4AF37] text-lg font-bold">{isSGA ? "SGA — Sumthin3lse Global Apps" : "SUMTHIN3LSE"}</p>
        </div>
        <p className="font-sans text-xs text-neutral-600 uppercase tracking-widest">Global Apps · Powered by Synthetic Intelligence</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link to="/" className="font-sans text-xs text-neutral-600 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Home</Link>
          <Link to="/lab" className="font-sans text-xs text-neutral-600 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Lab</Link>
          <Link to="/sga" className="font-sans text-xs text-neutral-600 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">SGA</Link>
          <a href="https://github.com/lordamos/ThoughtlyfeWebsite" target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-neutral-600 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">GitHub</a>
        </div>
      </footer>

      {/* ── Sandbox Modal ── */}
      {selectedApp && <SandboxModal app={selectedApp} onClose={() => setSelectedApp(null)} />}
    </div>
  )
}
