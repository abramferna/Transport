import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServiceModels from "@/components/ServiceModels";
import QuoteCalculator from "@/components/QuoteCalculator";
import Coverage from "@/components/Coverage";
import Fleet from "@/components/Fleet";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

export default function Landing() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      const el = document.getElementById("solicitud");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div data-testid="landing-page">
      <Navbar />
      <main>
        <Hero />
        <ServiceModels onSelectPlan={handleSelectPlan} />
        <QuoteCalculator initialPlan={selectedPlan} />
        <Coverage />
        <Fleet />
        <FAQ />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
