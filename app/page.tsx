import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import AudienceSplit from "@/components/AudienceSplit";
import MissionQuote from "@/components/MissionQuote";
import EarlyAccess from "@/components/EarlyAccess";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <AudienceSplit />
        <MissionQuote />
        <EarlyAccess />
      </main>
      <Footer />
    </>
  );
}
