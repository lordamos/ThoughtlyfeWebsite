import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ImportedApp {
  id: string
  name: string
  initials: string
  platform: "GitHub"
  category: string
  description: string
  tags: string[]
  launchUrl: string
  githubUrl: string
  featured: boolean
  deploymentId?: string
}

interface GitHubRepoMeta {
  owner: string
  repo: string
  name: string
  fullName: string
  description: string
  defaultBranch: string
  language: string | null
  topics: string[]
  stars: number
  isPrivate: boolean
  homepage: string | null
  htmlUrl: string
}

type ImportStep =
  | "idle"
  | "fetching-meta"
  | "confirm"
  | "deploying"
  | "polling"
  | "ready"
  | "error"

const CATEGORY_OPTIONS = [
  "AI Tools", "Productivity", "Business", "Finance", "Marketing",
  "Utilities", "Health", "Developer Tools", "Real Estate", "Education",
  "Entertainment", "Social", "Other",
]

function getInitials(name: string): string {
  return name
    .split(/[\s-_]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "A"
}

function guessCategory(topics: string[], language: string | null, description: string): string {
  const all = [...topics, description.toLowerCase(), (language || "").toLowerCase()].join(" ")
  if (/ai|ml|machine.learn|gpt|llm|openai|gemini|claude/.test(all)) return "AI Tools"
  if (/finance|crypto|budget|invest|stock|trading/.test(all)) return "Finance"
  if (/health|fitness|workout|nutrition|medical/.test(all)) return "Health"
  if (/real.estate|property|housing/.test(all)) return "Real Estate"
  if (/education|learn|course|school|tutor/.test(all)) return "Education"
  if (/market|seo|social.media|campaign|ads/.test(all)) return "Marketing"
  if (/business|crm|invoice|erp|saas/.test(all)) return "Business"
  if (/developer|api|cli|devtool|code|github/.test(all)) return "Developer Tools"
  if (/util|tool|helper|convert|generator/.test(all)) return "Utilities"
  if (/product|task|project|kanban|todo/.test(all)) return "Productivity"
  return "Other"
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          done
            ? "bg-[#D4AF37] text-black"
            : active
            ? "bg-[#4B0082] border-2 border-[#D4AF37] text-[#D4AF37]"
            : "bg-white/5 border border-white/20 text-neutral-600"
        }`}
      >
        {done ? "✓" : active ? "●" : "○"}
      </div>
      <span className={`text-[9px] uppercase tracking-widest ${active || done ? "text-[#D4AF37]" : "text-neutral-600"}`}>
        {label}
      </span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GitHubImport({
  onClose,
  onImported,
}: {
  onClose: () => void
  onImported: (app: ImportedApp) => void
}) {
  const [step, setStep] = useState<ImportStep>("idle")
  const [url, setUrl] = useState("")
  const [meta, setMeta] = useState<GitHubRepoMeta | null>(null)
  const [category, setCategory] = useState("Other")
  const [customName, setCustomName] = useState("")
  const [customDesc, setCustomDesc] = useState("")
  const [error, setError] = useState("")
  const [deploymentId, setDeploymentId] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
  const [pollCount, setPollCount] = useState(0)
  const [statusMsg, setStatusMsg] = useState("")
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  // ── Step 1: Fetch GitHub metadata ─────────────────────────────────────────
  async function handleFetchMeta() {
    if (!url.trim()) return
    setStep("fetching-meta")
    setError("")
    try {
      const res = await fetch(`/api/github-repo?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch repo")
      setMeta(data)
      setCustomName(data.name)
      setCustomDesc(data.description)
      setCategory(guessCategory(data.topics, data.language, data.description))
      setStep("confirm")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not fetch repo metadata")
      setStep("error")
    }
  }

  // ── Step 2: Deploy to Vercel ──────────────────────────────────────────────
  async function handleDeploy() {
    if (!meta) return
    setStep("deploying")
    setStatusMsg("Creating Vercel project and triggering deployment…")
    setError("")
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: meta.owner,
          repo: meta.repo,
          ref: meta.defaultBranch,
          name: customName || meta.name,
          description: customDesc || meta.description,
        }),
      })
      const data = await res.json()

      if (res.status === 200 && data.success && data.liveUrl) {
        // Deployed immediately
        setLiveUrl(data.liveUrl)
        setDeploymentId(data.deploymentId)
        setStep("ready")
        return
      }

      if (res.status === 202 && data.pending) {
        // Still building — start polling
        setDeploymentId(data.deploymentId)
        setStep("polling")
        setStatusMsg("Building your app on Vercel… this usually takes 30–90 seconds.")
        startPolling(data.deploymentId)
        return
      }

      throw new Error(data.error || "Deployment failed")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deployment failed")
      setStep("error")
    }
  }

  // ── Polling ───────────────────────────────────────────────────────────────
  function startPolling(dplId: string) {
    let count = 0
    pollRef.current = setInterval(async () => {
      count++
      setPollCount(count)
      try {
        const res = await fetch(`/api/deploy-status?deploymentId=${dplId}`)
        const data = await res.json()
        if (data.ready && data.liveUrl) {
          clearInterval(pollRef.current!)
          setLiveUrl(data.liveUrl)
          setStep("ready")
        } else if (data.error) {
          clearInterval(pollRef.current!)
          setError("Deployment failed or was cancelled. Check the Vercel dashboard.")
          setStep("error")
        } else {
          setStatusMsg(`Building… (${count * 5}s elapsed) — status: ${data.status}`)
        }
        // Timeout after 4 minutes
        if (count >= 48) {
          clearInterval(pollRef.current!)
          setError("Deployment timed out after 4 minutes. It may still complete — check your Vercel dashboard.")
          setStep("error")
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 5000)
  }

  // ── Finish: add app to Your Apps ──────────────────────────────────────────
  function handleAddToSGA() {
    if (!meta || !liveUrl) return
    const app: ImportedApp = {
      id: `imported-${meta.owner}-${meta.repo}-${Date.now()}`,
      name: customName || meta.name,
      initials: getInitials(customName || meta.name),
      platform: "GitHub",
      category,
      description: customDesc || meta.description || "Imported from GitHub.",
      tags: meta.topics.slice(0, 5).length > 0
        ? meta.topics.slice(0, 5)
        : [meta.language || "GitHub"].filter(Boolean),
      launchUrl: liveUrl,
      githubUrl: meta.htmlUrl,
      featured: false,
      deploymentId,
    }
    onImported(app)
    onClose()
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  const steps: { key: ImportStep | "confirm"; label: string }[] = [
    { key: "fetching-meta", label: "Fetch" },
    { key: "confirm", label: "Review" },
    { key: "deploying", label: "Deploy" },
    { key: "ready", label: "Launch" },
  ]
  const stepOrder = ["fetching-meta", "confirm", "deploying", "polling", "ready"]
  const currentIdx = stepOrder.indexOf(step)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl bg-[#0d0d1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(75,0,130,0.3)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#D4AF37] flex items-center justify-center">
                <span className="font-serif text-black text-xs font-black">S3</span>
              </div>
              <div>
                <p className="font-serif text-white font-bold text-sm">Import from GitHub</p>
                <p className="font-sans text-[10px] text-neutral-500 uppercase tracking-widest">SGA · Auto-deploy to Vercel Sandbox</p>
              </div>
            </div>
            <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors text-xl">✕</button>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-8 px-6 py-4 border-b border-white/5">
            {steps.map((s) => (
              <StepDot
                key={s.key}
                label={s.label}
                active={currentIdx === stepOrder.indexOf(s.key as ImportStep)}
                done={currentIdx > stepOrder.indexOf(s.key as ImportStep)}
              />
            ))}
          </div>

          {/* Body */}
          <div className="px-6 py-6">

            {/* ── IDLE: URL input ── */}
            {step === "idle" && (
              <div className="space-y-4">
                <p className="font-sans text-sm text-neutral-300 leading-relaxed">
                  Paste any public GitHub repository URL. SGA will fetch the metadata, deploy it to Vercel, and launch it live in your sandbox.
                </p>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFetchMeta()}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-sans text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                  <button
                    onClick={handleFetchMeta}
                    disabled={!url.trim()}
                    className="bg-[#D4AF37] text-black font-sans uppercase tracking-widest text-xs px-5 py-3 rounded-lg hover:bg-[#4B0082] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Fetch →
                  </button>
                </div>
                <p className="font-sans text-[10px] text-neutral-600">
                  Supports any public GitHub repo. Private repos require a GitHub token configured on the server.
                </p>
              </div>
            )}

            {/* ── FETCHING META ── */}
            {step === "fetching-meta" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
                <p className="font-sans text-sm text-neutral-400">Fetching repository metadata from GitHub…</p>
              </div>
            )}

            {/* ── CONFIRM ── */}
            {step === "confirm" && meta && (
              <div className="space-y-4">
                {/* Repo card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#D4AF37] flex items-center justify-center font-serif text-black text-lg font-black shrink-0">
                    {getInitials(customName || meta.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-white font-bold truncate">{meta.fullName}</p>
                    <p className="font-sans text-xs text-neutral-400 mt-0.5 line-clamp-2">{meta.description || "No description"}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {meta.topics.slice(0, 4).map((t) => (
                        <span key={t} className="text-[9px] font-sans uppercase tracking-wider text-neutral-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                      {meta.language && (
                        <span className="text-[9px] font-sans uppercase tracking-wider text-[#D4AF37]/70 bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">{meta.language}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <label className="font-sans text-[10px] uppercase tracking-widest text-neutral-500 mb-1 block">App Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] uppercase tracking-widest text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] uppercase tracking-widest text-neutral-500 mb-1 block">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setStep("idle"); setMeta(null) }}
                    className="flex-1 border border-white/20 text-neutral-400 font-sans uppercase tracking-widest text-xs py-3 rounded-lg hover:border-white/40 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleDeploy}
                    className="flex-1 bg-[#D4AF37] text-black font-sans uppercase tracking-widest text-xs py-3 rounded-lg hover:bg-[#4B0082] hover:text-white transition-colors"
                  >
                    Deploy to Vercel →
                  </button>
                </div>
              </div>
            )}

            {/* ── DEPLOYING / POLLING ── */}
            {(step === "deploying" || step === "polling") && (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#D4AF37] flex items-center justify-center">
                      <span className="font-serif text-black text-xs font-black">S3</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-serif text-white font-bold mb-1">
                    {step === "deploying" ? "Deploying to Vercel…" : "Building your app…"}
                  </p>
                  <p className="font-sans text-xs text-neutral-400 max-w-xs leading-relaxed">{statusMsg}</p>
                  {step === "polling" && (
                    <div className="mt-4 flex justify-center gap-1">
                      {[0,1,2,3,4].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40"
                          style={{
                            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                            backgroundColor: pollCount % 5 === i ? "#D4AF37" : "rgba(212,175,55,0.2)"
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="font-sans text-[10px] text-neutral-600 text-center max-w-xs">
                  Vercel is cloning your repo, installing dependencies, and building the app. This usually takes 30–90 seconds.
                </p>
              </div>
            )}

            {/* ── READY ── */}
            {step === "ready" && (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-2xl">
                    ✓
                  </div>
                  <div className="text-center">
                    <p className="font-serif text-white font-bold text-lg">Deployment Ready!</p>
                    <p className="font-sans text-xs text-neutral-400 mt-1">Your app is live and sandboxed.</p>
                  </div>
                </div>

                {/* Live URL preview */}
                <div className="bg-white/5 border border-[#D4AF37]/20 rounded-xl p-4">
                  <p className="font-sans text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1">Live URL</p>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-white hover:text-[#D4AF37] transition-colors break-all"
                  >
                    {liveUrl} ↗
                  </a>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 border border-white/20 text-neutral-400 font-sans uppercase tracking-widest text-xs py-3 rounded-lg hover:border-white/40 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddToSGA}
                    className="flex-1 bg-[#D4AF37] text-black font-sans uppercase tracking-widest text-xs py-3 rounded-lg hover:bg-[#4B0082] hover:text-white transition-colors"
                  >
                    Add to SGA →
                  </button>
                </div>
              </div>
            )}

            {/* ── ERROR ── */}
            {step === "error" && (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="font-sans text-xs text-red-400 leading-relaxed">{error}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep("idle"); setError(""); setMeta(null) }}
                    className="flex-1 border border-white/20 text-neutral-400 font-sans uppercase tracking-widest text-xs py-3 rounded-lg hover:border-white/40 hover:text-white transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-white/5 text-neutral-300 font-sans uppercase tracking-widest text-xs py-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
