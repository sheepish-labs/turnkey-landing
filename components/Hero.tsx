export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#FAF8F5] pt-20 overflow-hidden">
      {/* Teal accent shape */}
      <div
        className="absolute top-0 right-0 w-[45%] h-full bg-[#1D8A8A]/8 rounded-bl-[80px]"
        aria-hidden="true"
      />
      <div
        className="absolute top-24 right-12 w-64 h-64 rounded-full bg-[#1D8A8A]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-2xl">
          <p className="text-[#1D8A8A] font-medium text-sm uppercase tracking-widest mb-6">
            Coming Soon
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-[#1a1a1a] leading-tight mb-8">
            Your move,<br />
            <span className="text-[#1D8A8A]">handled.</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 leading-relaxed mb-10 max-w-xl">
            TurnKey gives real estate agents the tools to guide buyers and
            sellers through every step of the journey — with clarity,
            confidence, and care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#early-access"
              className="inline-flex items-center justify-center bg-[#C4674A] hover:bg-[#a8553a] text-white font-medium px-8 py-4 rounded-lg transition-colors duration-200 text-base"
            >
              Request Early Access
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center border border-[#1D8A8A] text-[#1D8A8A] hover:bg-[#1D8A8A] hover:text-white font-medium px-8 py-4 rounded-lg transition-colors duration-200 text-base"
            >
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
