import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
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
        <HowItWorks />
        <ServiceModels onSelectPlan={handleSelectPlan} />
        <QuoteCalculator initialPlan={selectedPlan} />
        <Coverage />
        <Fleet />
        <FAQ />
        <section className="bg-[#F8FAFC] py-10 lg:py-14" aria-label="Flota de ViaNordTrans">
          <div className="max-w-7xl mx-auto px-5 lg:px-8">
            <figure className="overflow-hidden border border-slate-200 border-b-4 border-b-[#FBBF24] bg-[#012030]">
              <img
                src="/vnt-truck-side.webp"
                alt="Camión de ViaNordTrans listo para salir a ruta"
                className="block h-[320px] w-full object-cover object-[center_55%] brightness-110 sm:h-[400px] lg:h-[520px]"
                width="2400"
                height="3600"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}
