import { Link } from "react-router-dom"

export default function Home() {
  return (
    <>
      <section className="relative h-screen flex items-center px-8 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/50 z-[1]" />

        {/* Hero Text */}
        <h1 className="relative z-[2] font-serif text-7xl font-black leading-[0.95] tracking-tight bg-gradient-to-r from-[#C9A227] via-[#F7E7A9] to-[#D4AF37] bg-clip-text text-transparent">
          Don't Just Be Better.<br/>Be Sumthin3lse.
        </h1>
      </section>

      <section className="px-8 py-32 max-w-4xl">
        <h2 className="font-serif text-5xl font-bold mb-8">
          We Redesign Foundations.
        </h2>
        <p className="font-sans text-xl">
          Intelligence is structural.
        </p>
      </section>

      <section className="pulse-void pt-[240px] pb-40 px-8">
        <div className="max-w-4xl">
          <p className="font-sans text-2xl font-medium">
            Ready to construct your next evolution?
          </p>

          <div className="mt-10">
            <Link to="/lab" className="
              inline-block
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
              HIRE THE ARCHITECT
            </Link>
          </div>

          <div className="mt-14">
            <p className="font-serif text-3xl bg-gradient-to-r from-[#C9A227] via-[#F7E7A9] to-[#D4AF37] bg-clip-text text-transparent">
              Become Sumthin3lse.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
