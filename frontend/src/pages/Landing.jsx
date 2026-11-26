import Navbar from "@/components/Navbar";
import IntroVideo from "@/components/IntroVideo";
import PalletQuoteCalculator from "@/components/PalletQuoteCalculator";
import PalletFAQ from "@/components/PalletFAQ";
import Fleet from "@/components/Fleet";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

export default function Landing() {
  return (
    <div data-testid="landing-page">
      <Navbar />
      <main>
        <PalletQuoteCalculator />
        <section className="bg-[#012030] py-10 lg:py-14" aria-label="Equipo y transporte de ViaNordTrans">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 grid gap-8 md:grid-cols-2 items-center">
            <figure className="overflow-hidden border border-white/20 border-b-4 border-b-[#FBBF24] max-w-md w-full mx-auto">
              <img
                src="/vnt-delivery-handoff.webp"
                alt="Equipo de ViaNordTrans junto a su camión"
                className="block w-full aspect-[4/5] object-cover object-[center_45%] brightness-110"
                width="2400"
                height="3600"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div>
              <div className="mb-3 text-[10px] font-black uppercase tracking-[.2em] text-[#fbbf24]">ViaNordTrans · base Girona</div>
              <h2 className="text-3xl font-black leading-tight tracking-[-.04em] text-white sm:text-4xl">Equipo y flota propios.</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">
                Transporte de mercancías con atención directa. Consulta disponibilidad, accesos y necesidades de carga con nuestro equipo.
              </p>
              <a href="https://wa.me/34609928719" className="mt-5 inline-flex min-h-11 items-center gap-2 bg-[#f6bb26] px-4 text-sm font-black text-[#102c38] transition hover:bg-[#ffd04d]">
                Consultar por WhatsApp
              </a>
            </div>
            <div className="md:col-span-2">
              <IntroVideo />
            </div>
          </div>
        </section>
        <Fleet />
        <PalletFAQ />
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
