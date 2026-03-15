const problems = [
  {
    title: "Clients in the dark",
    description:
      "Buyers and sellers rarely know where they stand. They're waiting on calls, chasing emails, and piecing together a process that should feel seamless.",
    icon: "🌑",
  },
  {
    title: "Agents overwhelmed",
    description:
      "Managing timelines, vendors, documents, and client emotions at once — without the right tools, great agents burn out fast.",
    icon: "⚡",
  },
  {
    title: "Experiences that don't match the moment",
    description:
      "Buying or selling a home is one of the biggest decisions in a person's life. Most transaction software doesn't treat it that way.",
    icon: "📋",
  },
];

export default function Problem() {
  return (
    <section className="bg-[#FAF8F5] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
            Real estate transactions are broken.
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Not because agents don&apos;t care. Because the tools haven&apos;t caught up.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl p-8 border border-[#F0ECE6] shadow-sm"
            >
              <div className="text-3xl mb-5">{p.icon}</div>
              <h3 className="font-serif text-xl text-[#1a1a1a] mb-3">
                {p.title}
              </h3>
              <p className="text-stone-500 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
