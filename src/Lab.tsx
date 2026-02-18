import { useState } from "react"
import { motion } from "framer-motion"

export default function Lab() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const handleConstruct = () => {
    setLoading(true)
    setTimeout(() => {
      setResult("Strategic Brand Positioning Framework\n\n1. Core Identity\n2. Market Distinction\n3. Narrative Dominance")
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="px-8 pt-32 pb-40">

      <h1 className="font-serif text-5xl font-bold text-white">
        Brand Positioning Lab
      </h1>

      <p className="font-sans text-xl mt-6 text-neutral-200">
        Positioning precedes power.
      </p>

      <div className="mt-12 h-[1px] bg-[rgba(255,255,255,0.08)]" />

      <div className="mt-16 max-w-2xl">
        <label className="uppercase tracking-[0.16em] text-sm text-neutral-400">
          INDUSTRY
        </label>

        <input className="w-full mt-4 p-4 bg-black border border-[rgba(255,255,255,0.08)] text-white" />

        <button onClick={handleConstruct} className="
          mt-8
          bg-[#D4AF37]
          text-black
          uppercase
          tracking-[0.16em]
          px-10
          py-[14px]
          rounded-none
          transition-colors duration-200
          hover:bg-[#4B0082]
          hover:text-white
        ">
          CONSTRUCT
        </button>

        {loading && (
          <p className="processing uppercase tracking-[0.12em] mt-6">
            PROCESSING…
          </p>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="border border-[rgba(255,255,255,0.08)] p-8 mt-8"
          >
            <pre className="whitespace-pre-wrap font-sans text-neutral-200">
              {result}
            </pre>

            <button className="mt-6 text-[#D4AF37] uppercase tracking-[0.16em] text-sm hover:text-white transition-colors">
              COPY
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
