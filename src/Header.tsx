import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Header() {
  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)

  useEffect(() => {
    let lastY = window.scrollY
    let accumulator = 0

    const onScroll = () => {
      const current = window.scrollY
      setAtTop(current < 10)

      const delta = current - lastY
      accumulator += delta

      if (delta > 0) {
        setVisible(false)
        accumulator = 0
      } else if (accumulator < -30) {
        setVisible(true)
        accumulator = 0
      }

      lastY = current
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      animate={{ y: visible ? 0 : "-100%" }}
      transition={{
        duration: visible ? 0.2 : 0.4,
        ease: visible ? "easeOut" : "easeInOut"
      }}
      className={`fixed top-0 w-full z-50 transition-all ${
        atTop
          ? "bg-black"
          : "bg-[rgba(0,0,0,0.8)] backdrop-blur-[12px] border-b border-[rgba(212,175,55,0.6)]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
        <Link to="/" className="font-serif text-white scale-90">
          Sumthin3lse
        </Link>

        <nav className="flex gap-8 font-sans text-[#E5E5E5]">
          <Link className="uppercase tracking-[0.12em] hover:text-[#D4AF37] hover:tracking-[0.18em] transition-all duration-200" to="/">
            Home
          </Link>
          <Link className="uppercase tracking-[0.12em] hover:text-[#D4AF37] hover:tracking-[0.18em] transition-all duration-200" to="/lab">
            Lab
          </Link>
          <Link className="uppercase tracking-[0.12em] hover:text-[#D4AF37] hover:tracking-[0.18em] transition-all duration-200" to="/meditation">
            Meditate
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
