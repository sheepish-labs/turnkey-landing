"use client";

import { useState } from "react";

const tabs = [
  {
    id: "seller",
    label: "Seller Tools",
    features: [
      {
        name: "Net Sheet Calculator",
        description:
          "Give sellers a clear picture of what they'll walk away with — before and after close.",
      },
      {
        name: "Holding Cost Calculator",
        description:
          "Show the real cost of waiting. Help sellers make confident, data-informed decisions.",
      },
      {
        name: "Progress Tracker",
        description:
          "A visual timeline that keeps sellers informed at every milestone from listing to close.",
      },
      {
        name: "Vendor Directory",
        description:
          "Your curated list of trusted stagers, photographers, inspectors, and more — always at hand.",
      },
    ],
  },
  {
    id: "buyer",
    label: "Buyer Tools",
    features: [
      {
        name: "Progress Tracker",
        description:
          "Buyers see exactly where they are in the process — from pre-approval to move-in day.",
      },
      {
        name: '"This or That" Neighborhood Game',
        description:
          "An interactive tool to help buyers clarify what they actually want in a neighborhood.",
      },
      {
        name: "Showing Feedback",
        description:
          "Capture buyer reactions after every showing. No more lost notes or fuzzy recollections.",
      },
      {
        name: "Document Hub",
        description:
          "All their docs in one organized place — offers, disclosures, inspection reports, and more.",
      },
    ],
  },
  {
    id: "agent",
    label: "Agent Tools",
    features: [
      {
        name: "Client Dashboard",
        description:
          "See every active client and their current status at a glance. Nothing slips through.",
      },
      {
        name: "Branded Experience",
        description:
          "Your name, your logo, your colors. TurnKey powers the experience — you own the relationship.",
      },
      {
        name: "Task Management",
        description:
          "Automated task reminders tied to transaction milestones. Stay ahead without micromanaging.",
      },
      {
        name: "Communication Log",
        description:
          "A clear record of every touchpoint. Perfect for teams and compliance.",
      },
    ],
  },
];

export default function Features() {
  const [activeTab, setActiveTab] = useState("seller");
  const current = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="bg-[#FAF8F5] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1a1a1a] mb-4">
            Built for every side of the deal
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto">
            Whether you&apos;re listing, buying, or managing both — TurnKey has tools
            built for the moment.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-[#1D8A8A] text-white"
                  : "bg-white border border-[#F0ECE6] text-stone-600 hover:border-[#1D8A8A] hover:text-[#1D8A8A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {current.features.map((feature) => (
            <div
              key={feature.name}
              className="bg-white rounded-xl p-6 border border-[#F0ECE6] shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-[#C4674A] mb-4" />
              <h3 className="font-serif text-lg text-[#1a1a1a] mb-2">
                {feature.name}
              </h3>
              <p className="text-stone-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
