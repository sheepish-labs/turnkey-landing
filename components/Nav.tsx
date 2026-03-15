export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#F0ECE6]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-serif text-2xl text-[#1D8A8A] tracking-tight">
          TurnKey
        </span>
        <a
          href="#early-access"
          className="bg-[#C4674A] hover:bg-[#a8553a] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors duration-200"
        >
          Request Access
        </a>
      </div>
    </nav>
  );
}
