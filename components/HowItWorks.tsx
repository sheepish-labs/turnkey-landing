const steps = [
  {
    number: "01",
    title: "Sign your client",
    description:
      "Add a buyer or seller to TurnKey. Their personalized dashboard is ready instantly — no setup, no data entry.",
  },
  {
    number: "02",
    title: "Dashboard auto-populates",
    description:
      "Timelines, tasks, documents, and milestones populate based on transaction type. Everything your client needs, in one place.",
  },
  {
    number: "03",
    title: "Client guided to close",
    description:
      "Your client follows a clear path from offer to keys — with progress tracking, vendor connections, and your brand front and center.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F0ECE6] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
            How TurnKey works
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Three steps. Zero confusion. One seamless experience for you and
            your clients.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-[#1D8A8A]/30"
            aria-hidden="true"
          />
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#1D8A8A] flex items-center justify-center mb-6 z-10">
                <span className="font-serif text-xl text-white">{step.number}</span>
              </div>
              <h3 className="font-serif text-xl text-[#1a1a1a] mb-3">
                {step.title}
              </h3>
              <p className="text-stone-500 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
