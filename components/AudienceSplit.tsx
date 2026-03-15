export default function AudienceSplit() {
  return (
    <section className="bg-[#F0ECE6] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
            Built for agents. Designed for brokerages.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Agents */}
          <div className="bg-white rounded-2xl p-10 border border-[#F0ECE6] shadow-sm">
            <div className="inline-block bg-[#1D8A8A]/10 text-[#1D8A8A] text-sm font-medium px-3 py-1 rounded-full mb-6">
              For Agents
            </div>
            <h3 className="font-serif text-2xl text-[#1a1a1a] mb-4">
              Stand out in a crowded market.
            </h3>
            <p className="text-stone-500 leading-relaxed mb-6">
              Your clients deserve more than a spreadsheet and a prayer. TurnKey
              gives independent agents a branded client experience platform
              that&apos;s typically reserved for the biggest teams in the business.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Branded client dashboards",
                "Seller & buyer tools in one platform",
                "Automated timelines and task reminders",
                "Vendor directory management",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-stone-600">
                  <span className="text-[#1D8A8A] mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#F0ECE6] pt-6">
              <p className="text-sm text-stone-400 mb-1">Individual license</p>
              <p className="font-serif text-2xl text-[#1a1a1a]">
                ~$10K / year
              </p>
            </div>
          </div>

          {/* For Brokerages */}
          <div className="bg-[#1D8A8A] rounded-2xl p-10 shadow-sm">
            <div className="inline-block bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full mb-6">
              For Brokerages
            </div>
            <h3 className="font-serif text-2xl text-white mb-4">
              Elevate your entire team.
            </h3>
            <p className="text-[#e8f5f5] leading-relaxed mb-6">
              Partner with TurnKey as your brokerage&apos;s exclusive client
              experience platform. Equip every agent with a consistent,
              professional brand — and give your leadership a real view of what&apos;s
              happening across every transaction.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Brokerage-wide branding and customization",
                "Centralized transaction oversight",
                "Preferred pricing for all agents",
                "Dedicated onboarding and support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#e8f5f5]">
                  <span className="text-[#C4674A] mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/20 pt-6">
              <p className="text-sm text-[#e8f5f5]/70 mb-1">
                Exclusive partnership
              </p>
              <p className="font-serif text-2xl text-white">
                Let&apos;s talk
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
