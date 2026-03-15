export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-white/10 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <p className="font-serif text-xl text-[#1D8A8A]">TurnKey</p>
          <p className="text-stone-500 text-sm mt-1">
            A product by Sheepish Labs Inc.
          </p>
        </div>
        <div className="text-center">
          <a
            href="https://turnkeyhomes.app"
            className="text-stone-400 hover:text-white text-sm transition-colors"
          >
            turnkeyhomes.app
          </a>
        </div>
        <p className="text-stone-600 text-sm">
          © 2026 Sheepish Labs Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
