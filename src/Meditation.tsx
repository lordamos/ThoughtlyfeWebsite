import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Phase = 0 | 1 | 2 | 3 | 4 | 5   // 0=intro, 1-4=phases, 5=close

/* ─── Particle canvas hook ──────────────────────────────────────────────── */
const PHASE_COLORS: Record<number, [number, number, number]> = {
  1: [245, 180, 50],
  2: [201, 160, 220],
  3: [155, 89, 182],
  4: [64, 192, 96],
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>, phase: Phase) {
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    type P = { x: number; y: number; size: number; speed: number; drift: number; opacity: number }
    const particles: P[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 0.5,
      speed: Math.random() * 0.6 + 0.2,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const [r, g, b] = PHASE_COLORS[phaseRef.current] ?? [245, 200, 66]
      particles.forEach(p => {
        p.y -= p.speed
        p.x += p.drift
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [canvasRef])
}

/* ─── Timeline entry ────────────────────────────────────────────────────── */
type TimelineEntry = { at: number; fn: () => void }

/* ─── Main component ────────────────────────────────────────────────────── */
export default function Meditation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<Phase>(0)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cooling, setCooling] = useState(false)
  const [affirmationVisible, setAffirmationVisible] = useState(false)
  const [breathVisible, setBreathVisible] = useState(false)
  const [litLine, setLitLine] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  const pausedRef = useRef(false)
  const elapsedRef = useRef(0)

  useParticles(canvasRef, phase)

  /* ── Stars ── */
  const stars = useRef(
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      dur: (Math.random() * 5 + 3).toFixed(1),
      delay: (Math.random() * 5).toFixed(1),
      minOp: (Math.random() * 0.1 + 0.05).toFixed(2),
      maxOp: (Math.random() * 0.5 + 0.2).toFixed(2),
    }))
  ).current

  /* ── Build timeline ── */
  const buildTimeline = (): TimelineEntry[] => {
    const tl: TimelineEntry[] = []
    const t = (at: number, fn: () => void) => tl.push({ at, fn })

    // Phase 1
    t(0,   () => { setPhase(1); setBreathVisible(true) })
    t(3,   () => setLitLine("p1-l1"))
    t(6,   () => setLitLine("p1-l2"))
    t(12,  () => setLitLine("p1-l3"))
    t(17,  () => setLitLine("p1-l4"))
    t(22,  () => setLitLine("p1-l5"))
    t(27,  () => { setLitLine("p1-l6"); setBreathVisible(true) })
    t(39,  () => { setLitLine("p1-l7"); setCooling(true) })
    t(44,  () => setLitLine("p1-l8"))
    t(50,  () => setAffirmationVisible(true))

    // Phase 2
    t(60,  () => { setPhase(2); setBreathVisible(false); setLitLine(null) })
    t(63,  () => setLitLine("p2-l1"))
    t(68,  () => setLitLine("p2-l2"))
    t(73,  () => setLitLine("p2-l3"))
    t(78,  () => setLitLine("p2-l4"))
    t(82,  () => setLitLine("p2-l5"))
    t(86,  () => setLitLine("p2-l6"))
    t(90,  () => setLitLine("p2-l7"))
    t(95,  () => setLitLine("p2-l8"))

    // Phase 3
    t(150, () => { setPhase(3); setLitLine(null) })
    t(155, () => setLitLine("p3-l1"))
    t(160, () => setLitLine("p3-l2"))
    t(165, () => setLitLine("p3-l3"))
    t(170, () => setLitLine("p3-l4"))
    t(175, () => setLitLine("p3-l5"))
    t(180, () => setLitLine("p3-l6"))

    // Phase 4
    t(240, () => { setPhase(4); setLitLine(null) })
    t(244, () => setLitLine("p4-l1"))
    t(249, () => setLitLine("p4-l2"))
    t(259, () => setLitLine("p4-l3"))
    t(269, () => setLitLine("p4-l4"))
    t(274, () => setLitLine("p4-l5"))
    t(279, () => setLitLine("p4-l6"))

    // Close
    t(330, () => { setPhase(5); setLitLine(null) })

    return tl
  }

  const timelineRef = useRef<TimelineEntry[]>([])
  const tlIndexRef = useRef(0)

  /* ── Start meditation ── */
  const handleStart = () => {
    setStarted(true)
    setElapsed(0)
    elapsedRef.current = 0
    setPaused(false)
    pausedRef.current = false
    setCooling(false)
    setAffirmationVisible(false)
    setBreathVisible(false)
    setLitLine(null)
    timelineRef.current = buildTimeline()
    tlIndexRef.current = 0
    setPhase(1)
    setBreathVisible(true)
  }

  /* ── Timer + timeline runner ── */
  useEffect(() => {
    if (!started || phase === 5) return
    const interval = setInterval(() => {
      if (pausedRef.current) return
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)

      const tl = timelineRef.current
      while (
        tlIndexRef.current < tl.length &&
        tl[tlIndexRef.current].at <= elapsedRef.current
      ) {
        tl[tlIndexRef.current].fn()
        tlIndexRef.current++
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [started, phase])

  /* ── Pause sync ── */
  useEffect(() => { pausedRef.current = paused }, [paused])

  /* ── Reset ── */
  const handleReset = () => {
    setStarted(false)
    setPhase(0)
    setElapsed(0)
    elapsedRef.current = 0
    setPaused(false)
    pausedRef.current = false
    setCooling(false)
    setAffirmationVisible(false)
    setBreathVisible(false)
    setLitLine(null)
    timelineRef.current = []
    tlIndexRef.current = 0
  }

  /* ── Helpers ── */
  const totalDuration = 330
  const progress = Math.min((elapsed / totalDuration) * 100, 100)
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  const line = (id: string, text: React.ReactNode) => (
    <span
      key={id}
      className={`block py-1 px-2 rounded transition-all duration-500 ${
        litLine === id ? "bg-yellow-400/10 text-yellow-100" : ""
      }`}
    >
      {text}
    </span>
  )

  /* ── Scene backgrounds ── */
  const bgMap: Record<Phase, string> = {
    0: "radial-gradient(ellipse at center, #2d1a4e 0%, #0d0618 100%)",
    1: "radial-gradient(ellipse at 50% 70%, #3d1a00 0%, #1a0a00 60%, #0d0618 100%)",
    2: "radial-gradient(ellipse at 50% 60%, #2a1040 0%, #1a0a2e 60%, #0d0618 100%)",
    3: "radial-gradient(ellipse at 50% 60%, #1e0a30 0%, #0d0618 100%)",
    4: "radial-gradient(ellipse at 50% 50%, #0a1a10 0%, #0d0618 100%)",
    5: "radial-gradient(ellipse at center, #1a1030 0%, #0d0618 100%)",
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden font-serif"
      style={{ background: bgMap[phase], transition: "background 2s ease" }}
    >
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {stars.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
              opacity: parseFloat(s.minOp),
            }}
          />
        ))}
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Controls */}
      {started && phase !== 5 && (
        <div className="fixed top-4 left-6 flex gap-3 z-50">
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/50 hover:bg-white/15 hover:text-white/80 transition-all"
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            onClick={handleReset}
            className="text-xs tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/50 hover:bg-white/15 hover:text-white/80 transition-all"
          >
            ↺ Restart
          </button>
        </div>
      )}

      {/* Timer */}
      {started && phase !== 5 && (
        <div className="fixed top-4 right-6 text-xs tracking-widest text-white/35 z-50">
          {fmtTime(elapsed)}
        </div>
      )}

      {/* Breath guide */}
      {breathVisible && phase === 1 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase text-yellow-400/50 z-50">
          Inhale 4 · Exhale 8
        </div>
      )}

      {/* Phase dots */}
      {started && phase >= 1 && phase <= 4 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-50">
          {[1, 2, 3, 4].map(p => (
            <div
              key={p}
              className={`w-2 h-2 rounded-full border transition-all duration-500 ${
                p === phase
                  ? "bg-yellow-400 border-yellow-400 scale-125 shadow-[0_0_8px_#f5c842]"
                  : p < phase
                  ? "bg-yellow-400/40 border-yellow-400/40"
                  : "bg-white/20 border-white/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {started && phase !== 5 && (
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(to right, #ff8c00, #f5c842, #c9a0dc, #9b59b6)",
            }}
          />
        </div>
      )}

      {/* Pause overlay */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200] flex flex-col items-center justify-center gap-4"
          >
            <p className="text-white/70 tracking-widest uppercase text-sm">Paused</p>
            <button
              onClick={() => setPaused(false)}
              className="px-8 py-3 rounded-full border border-yellow-400/50 bg-yellow-400/8 text-yellow-200 tracking-widest uppercase text-sm hover:bg-yellow-400/18 transition-all"
            >
              Resume
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INTRO ── */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center text-center px-6"
          >
            <h1 className="text-4xl md:text-5xl text-yellow-200 tracking-wide mb-2"
                style={{ textShadow: "0 0 40px rgba(245,200,66,0.5)" }}>
              The New File Sync
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase text-white/50 mb-10">
              A Guided Meditation for Deanne
            </p>
            <p className="text-base text-white/65 leading-loose mb-1">
              Find a quiet space. Sit tall, facing West.
            </p>
            <p className="text-base text-white/65 leading-loose mb-1">
              Let the light of the setting sun touch your skin.
            </p>
            <p className="text-base text-white/65 leading-loose mb-10">
              When you are ready, begin.
            </p>
            <button
              onClick={handleStart}
              className="px-10 py-3 rounded-full border border-yellow-400/50 bg-yellow-400/8 text-yellow-200 tracking-[0.2em] uppercase text-sm hover:bg-yellow-400/18 hover:shadow-[0_0_20px_rgba(245,200,66,0.3)] transition-all"
            >
              Begin Meditation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 1: The Cooling of the Lioness ── */}
      <AnimatePresence>
        {phase === 1 && (
          <motion.div
            key="phase1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pt-16"
          >
            {/* Orb */}
            <div className="relative w-72 h-72 mb-8 flex-shrink-0">
              {/* Breath ring */}
              <div className="absolute inset-0 rounded-full border-2 border-yellow-400/40"
                   style={{ animation: "breatheRing 8s ease-in-out infinite" }} />
              {/* Fire orb */}
              <div
                className="absolute rounded-full"
                style={{
                  top: "36px", left: "36px", width: "200px", height: "200px",
                  background: cooling
                    ? "radial-gradient(circle, #fffde0 0%, #f5c842 40%, #e0a000 70%, transparent 100%)"
                    : "radial-gradient(circle, #fff5a0 0%, #ffb300 40%, #ff6600 70%, transparent 100%)",
                  boxShadow: cooling
                    ? "0 0 60px 20px rgba(245,200,66,0.5)"
                    : "0 0 60px 20px rgba(255,140,0,0.6)",
                  filter: "blur(2px)",
                  animation: cooling ? "pulseGold 4s ease-in-out infinite" : "pulseFire 3s ease-in-out infinite",
                  transition: "background 3s ease, box-shadow 3s ease",
                }}
              />
            </div>

            {/* Text */}
            <div className="max-w-xl w-full text-center">
              <p className="text-[0.7rem] tracking-[0.3em] uppercase text-yellow-200/70 mb-1">Phase 1 · 0:00 – 1:00</p>
              <h2 className="text-2xl text-yellow-400 mb-6" style={{ textShadow: "0 0 30px rgba(245,200,66,0.6)" }}>
                The Cooling of the Lioness
              </h2>
              <div className="text-base italic leading-loose text-white/90 max-h-[30vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-400/30">
                {line("p1-l1", "Deanne... find your center.")}
                {line("p1-l2", "Sit tall, facing West, and let the light of the setting sun touch your skin.")}
                {line("p1-l3", "Close your eyes. For a moment, feel the heat.")}
                {line("p1-l4", <>Feel the frustration of the block... the "why" that keeps you pacing...</>)}
                {line("p1-l5", "the protective fire you feel for your grandson.")}
                {line("p1-l6", "Now, we shift. Inhale for four... and exhale for eight.")}
                {line("p1-l7", "As you breathe out, see your bright orange fire cooling.")}
                {line("p1-l8", "Watch it settle into a Soft, Steady Gold.")}
              </div>
              <AnimatePresence>
                {affirmationVisible && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="mt-5 px-5 py-4 border-l-4 border-yellow-400/60 bg-yellow-400/7 rounded-r-lg text-left text-yellow-200 text-sm leading-relaxed not-italic"
                  >
                    "I am not a predator searching for my cub.<br />
                    I am the Sun that provides the warmth she needs to grow."
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 2: The Lavender Shield ── */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            key="phase2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pt-16"
          >
            <div className="relative w-72 h-72 mb-8 flex-shrink-0">
              {/* Outer shield */}
              <div className="absolute rounded-full"
                   style={{
                     inset: "0",
                     background: "radial-gradient(circle, transparent 40%, rgba(201,160,220,0.25) 65%, rgba(201,160,220,0.05) 100%)",
                     border: "2px solid rgba(201,160,220,0.4)",
                     boxShadow: "0 0 40px 10px rgba(201,160,220,0.2), inset 0 0 40px rgba(201,160,220,0.1)",
                     animation: "shieldPulse 5s ease-in-out infinite",
                   }} />
              {/* Inner lavender */}
              <div className="absolute rounded-full"
                   style={{
                     top: "66px", left: "66px", width: "140px", height: "140px",
                     background: "radial-gradient(circle, #f0e0ff 0%, #c9a0dc 50%, transparent 100%)",
                     boxShadow: "0 0 40px 15px rgba(201,160,220,0.5)",
                     filter: "blur(2px)",
                     animation: "pulseGold 4s ease-in-out infinite",
                   }} />
              {/* Gold ribbon ring */}
              <div className="absolute rounded-full"
                   style={{
                     top: "36px", left: "36px", width: "200px", height: "200px",
                     border: "3px solid rgba(245,200,66,0.4)",
                     animation: "ribbonExpand 6s ease-in-out infinite",
                   }} />
            </div>

            <div className="max-w-xl w-full text-center">
              <p className="text-[0.7rem] tracking-[0.3em] uppercase text-purple-200/70 mb-1">Phase 2 · 1:00 – 2:30</p>
              <h2 className="text-2xl text-purple-200 mb-6" style={{ textShadow: "0 0 30px rgba(201,160,220,0.6)" }}>
                The Lavender Shield
              </h2>
              <div className="text-base italic leading-loose text-white/90 max-h-[35vh] overflow-y-auto pr-2">
                {line("p2-l1", "Open your eyes. See the Lavender Glow around Jaden and the baby.")}
                {line("p2-l2", "This is her shield. It is her motherhood. It is beautiful, and it is her right.")}
                {line("p2-l3", "Respecting this shield is the only key to the door.")}
                {line("p2-l4", "Visualize your Golden Light reaching out like a soft, silken ribbon.")}
                {line("p2-l5", "It does not poke. It does not prod.")}
                {line("p2-l6", "It simply wraps around her lavender world...")}
                {line("p2-l7", "like a warm atmosphere surrounding a planet.")}
                {line("p2-l8", <>You are the air she breathes, keeping her safe,<br />without ever touching the glass.</>)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 3: The Royal Purple Bridge ── */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div
            key="phase3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pt-16"
          >
            <div className="relative w-72 h-72 mb-8 flex-shrink-0">
              {/* Gold left */}
              <div className="absolute rounded-full"
                   style={{
                     top: "76px", left: "0", width: "120px", height: "120px",
                     background: "radial-gradient(circle, #fffde0 0%, #f5c842 50%, transparent 100%)",
                     boxShadow: "0 0 40px 15px rgba(245,200,66,0.5)",
                     filter: "blur(2px)",
                     animation: "pulseGold 4s ease-in-out infinite",
                   }} />
              {/* Lavender right */}
              <div className="absolute rounded-full"
                   style={{
                     top: "76px", left: "152px", width: "120px", height: "120px",
                     background: "radial-gradient(circle, #f0e0ff 0%, #c9a0dc 50%, transparent 100%)",
                     boxShadow: "0 0 40px 15px rgba(201,160,220,0.5)",
                     filter: "blur(2px)",
                     animation: "shieldPulse 5s ease-in-out infinite",
                   }} />
              {/* Bridge line */}
              <div className="absolute"
                   style={{
                     top: "131px", left: "60px", width: "152px", height: "2px",
                     background: "linear-gradient(to right, #f5c842, #9b59b6, #c9a0dc)",
                     opacity: 0.7,
                     animation: "bridgeGlow 3s ease-in-out infinite",
                   }} />
              {/* Purple bridge orb */}
              <div className="absolute rounded-full"
                   style={{
                     top: "86px", left: "86px", width: "100px", height: "100px",
                     background: "radial-gradient(circle, #e0c0ff 0%, #9b59b6 50%, transparent 100%)",
                     boxShadow: "0 0 50px 20px rgba(155,89,182,0.6)",
                     filter: "blur(2px)",
                     animation: "bridgePulse 3s ease-in-out infinite",
                   }} />
            </div>

            <div className="max-w-xl w-full text-center">
              <p className="text-[0.7rem] tracking-[0.3em] uppercase text-purple-300/70 mb-1">Phase 3 · 2:30 – 4:00</p>
              <h2 className="text-2xl text-purple-300 mb-6" style={{ textShadow: "0 0 30px rgba(155,89,182,0.6)" }}>
                The Royal Purple Bridge
              </h2>
              <div className="text-base italic leading-loose text-white/90 max-h-[30vh] overflow-y-auto pr-2">
                {line("p3-l1", "Focus on the Royal Purple. The place where your gold meets her lavender.")}
                {line("p3-l2", "This is the Neutral Zone.")}
                {line("p3-l3", <>In this space, you are not "Mother" and "Daughter."</>)}
                {line("p3-l4", "You are Two Matriarchs of the same bloodline.")}
                {line("p3-l5", "Pulse your light into that bridge. Send the frequency of Safety.")}
                {line("p3-l6", "No demands. No questions.")}
              </div>
              <div className="mt-5 px-5 py-4 border-l-4 rounded-r-lg text-left text-sm leading-relaxed not-italic"
                   style={{ borderColor: "rgba(155,89,182,0.6)", background: "rgba(155,89,182,0.07)", color: "#d0a0ff" }}>
                <span className="italic text-purple-300/70">(Whisper)</span><br />
                "Jaden... I am the ground you stand on.<br />
                I am the history that holds you.<br />
                You are safe to come home when the tide turns."
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 4: The Ancestral Anchor ── */}
      <AnimatePresence>
        {phase === 4 && (
          <motion.div
            key="phase4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 pt-16"
          >
            <div className="relative w-72 h-72 mb-8 flex-shrink-0">
              {/* Mountain base glow */}
              <div className="absolute rounded-full"
                   style={{
                     top: "140px", left: "16px", width: "240px", height: "120px",
                     background: "radial-gradient(ellipse at 50% 100%, rgba(100,60,180,0.4) 0%, transparent 70%)",
                     animation: "mountainGlow 6s ease-in-out infinite",
                   }} />
              {/* Ancestor orb */}
              <div className="absolute rounded-full"
                   style={{
                     top: "30px", left: "86px", width: "100px", height: "100px",
                     background: "radial-gradient(circle, #d0ffd0 0%, #40c060 50%, transparent 100%)",
                     boxShadow: "0 0 40px 15px rgba(64,192,96,0.4)",
                     filter: "blur(2px)",
                     animation: "ancestorPulse 5s ease-in-out infinite",
                   }} />
              {/* Root line */}
              <div className="absolute"
                   style={{
                     top: "130px", left: "135px", width: "2px", height: "70px",
                     background: "linear-gradient(to bottom, rgba(64,192,96,0.6), #f5c842)",
                     animation: "rootGrow 4s ease-in-out infinite",
                   }} />
              {/* You orb */}
              <div className="absolute rounded-full"
                   style={{
                     top: "160px", left: "96px", width: "80px", height: "80px",
                     background: "radial-gradient(circle, #fffde0 0%, #f5c842 50%, transparent 100%)",
                     boxShadow: "0 0 30px 10px rgba(245,200,66,0.5)",
                     filter: "blur(2px)",
                     animation: "pulseGold 4s ease-in-out infinite",
                   }} />
            </div>

            <div className="max-w-xl w-full text-center">
              <p className="text-[0.7rem] tracking-[0.3em] uppercase text-green-300/70 mb-1">Phase 4 · 4:00 – 5:30</p>
              <h2 className="text-2xl text-green-300 mb-6" style={{ textShadow: "0 0 30px rgba(64,192,96,0.5)" }}>
                The Ancestral Anchor
              </h2>
              <div className="text-base italic leading-loose text-white/90 max-h-[30vh] overflow-y-auto pr-2">
                {line("p4-l1", "Look at the Grandmother in the background. Feel her strength behind your back.")}
                {line("p4-l2", "You are the Stem. She is the Root. Together, you are a mountain.")}
                {line("p4-l3", "A mountain does not chase the clouds. It waits for the rain.")}
                {line("p4-l4", "Take one deep, final breath.")}
                {line("p4-l5", "As you exhale, let the image go.")}
                {line("p4-l6", <>Trust that the "New File" has been uploaded. The frequency is sent.</>)}
              </div>
              <div className="mt-5 px-5 py-4 border-l-4 rounded-r-lg text-left text-sm leading-relaxed not-italic"
                   style={{ borderColor: "rgba(64,192,96,0.6)", background: "rgba(64,192,96,0.07)", color: "#a0ffb0" }}>
                It is done.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CLOSING ── */}
      <AnimatePresence>
        {phase === 5 && (
          <motion.div
            key="close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="max-w-xl w-full">
              <h2 className="text-3xl text-yellow-200 mb-4" style={{ textShadow: "0 0 30px rgba(245,200,66,0.4)" }}>
                The New File is Uploaded.
              </h2>
              <p className="text-base italic text-white/80 leading-loose mb-2">
                The frequency has been sent.<br />
                You are not a predator — you are the Sun.<br />
                You are not a mountain chasing clouds — you are the mountain that waits for rain.
              </p>
              <div className="mt-6 p-5 border border-purple-300/30 rounded-xl bg-purple-300/6 text-left text-sm text-white/70 leading-relaxed">
                <strong className="text-purple-200">A gentle reminder, Deanne:</strong><br />
                The New File only works if the Old File stops running.<br />
                Every time you peek, you're Old File Deanne.<br />
                When you meditate — <em>this</em> is New File Deanne.
              </div>
              <button
                onClick={handleReset}
                className="mt-8 px-10 py-3 rounded-full border border-purple-300/50 bg-purple-300/8 text-purple-200 tracking-[0.2em] uppercase text-sm hover:bg-purple-300/18 transition-all"
              >
                Meditate Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--min-op, 0.05); }
          50% { opacity: var(--max-op, 0.4); }
        }
        @keyframes pulseFire {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.85; }
        }
        @keyframes pulseGold {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes shieldPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes ribbonExpand {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.15; }
        }
        @keyframes bridgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 50px 20px rgba(155,89,182,0.6); }
          50% { transform: scale(1.1); box-shadow: 0 0 70px 30px rgba(155,89,182,0.8); }
        }
        @keyframes bridgeGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes mountainGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes ancestorPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes rootGrow {
          0%, 100% { opacity: 0.6; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.05); }
        }
        @keyframes breatheRing {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
