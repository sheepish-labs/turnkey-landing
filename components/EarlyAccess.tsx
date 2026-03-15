"use client";

import { useState } from "react";

export default function EarlyAccess() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      // For now, open mailto. Replace with API call when backend is ready.
      window.location.href = `mailto:hello@turnkeyhomes.app?subject=Early Access Request&body=Hi, I'd like early access to TurnKey. My email is: ${email}`;
      setSubmitted(true);
    }
  }

  return (
    <section id="early-access" className="bg-[#FAF8F5] py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
          Be among the first agents to use TurnKey.
        </h2>
        <p className="text-stone-500 text-lg mb-10">
          We&apos;re opening early access to a small group of agents who want to
          help shape what TurnKey becomes. No commitment required — just a
          chance to get in early.
        </p>
        {submitted ? (
          <div className="bg-[#1D8A8A]/10 border border-[#1D8A8A]/30 rounded-xl p-8">
            <p className="font-serif text-xl text-[#1D8A8A]">
              You&apos;re on the list.
            </p>
            <p className="text-stone-500 mt-2">
              We&apos;ll be in touch when your spot opens up.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-5 py-4 rounded-lg border border-[#F0ECE6] bg-white text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1D8A8A]/40 text-base"
            />
            <button
              type="submit"
              className="bg-[#C4674A] hover:bg-[#a8553a] text-white font-medium px-8 py-4 rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              Request Early Access
            </button>
          </form>
        )}
        <p className="text-stone-400 text-sm mt-4">
          No spam. No pressure. Just a seat at the table.
        </p>
      </div>
    </section>
  );
}
