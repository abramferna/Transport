import { ArrowRightIcon, ClockIcon, ShieldCheckIcon, TruckIcon } from "@phosphor-icons/react";
import IntroVideo from "@/components/IntroVideo";

export const Hero = () => {
  return (
    <section className="relative bg-[#012030] overflow-hidden" data-testid="hero-section">
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />
      <div className="absolute right-0 top-0 bottom-0 hidden w-[42%] lg:block" aria-hidden>
        <img
          src="/vnt-fleet-hero.png"
          alt=""
          className="h-full w-full scale-105 object-cover opacity-60 grayscale-[35%] blur-[2px]"
        />
        <div className="absolute inset-0 bg-[#012030]/55" />
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#012030] to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="order-2 lg:order-1 lg:col-span-6 fade-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block w-10 h-[2px] bg-[#FBBF24]" />
              <span className="label-eyebrow text-[#FBBF24]">Envíos urgentes · Siempre a tiempo</span>
            </div>
            <h1 className="font-display font-black tracking-tighter leading-[0.92] text-white text-4xl sm:text-5xl lg:text-6xl">
              Soluciones<br />
              logísticas<br />
              para empresas.
            </h1>
            <p className="mt-4 font-display font-bold text-lg sm:text-xl text-[#FBBF24] tracking-tight">
              Entregas rápidas, precios cerrados y sin sorpresas.
            </p>
            <p className="mt-3 text-base text-slate-300 max-w-xl leading-relaxed">
              Rutas fijas o envíos puntuales. Flota propia, base en Girona. Servicios urgentes el mismo día o en plazos de 24h.{" "}
              <span className="font-medium">Envíos fuera de ruta a consultar.</span>
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#calculadora"
                data-testid="hero-cta-calculator"
                className="group inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#012030] font-bold px-6 h-12 transition-colors duration-150"
              >
                Calcular precio ahora
                <ArrowRightIcon size={18} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#como-funciona"
                data-testid="hero-cta-services"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-6 h-12 transition-colors duration-150"
              >
                Cómo funciona
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="border border-white/25 bg-[#001A28]/80 p-3 shadow-2xl shadow-black/25 backdrop-blur-sm">
              <IntroVideo />
            </div>
          </div>

        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {[
              { icon: <ClockIcon size={22} weight="duotone" />, k: "<1h", v: "respuesta presupuesto" },
              { icon: <TruckIcon size={22} weight="duotone" />, k: "Propia", v: "flota · base Girona" },
              { icon: <ShieldCheckIcon size={22} weight="duotone" />, k: "100%", v: "asegurado" },
            ].map((s) => (
              <div key={s.v} className="bg-[#012030] p-5 lg:p-6">
                <div className="text-[#FBBF24] mb-2">{s.icon}</div>
                <div className="font-display text-3xl font-black text-white leading-none">{s.k}</div>
                <div className="label-eyebrow mt-2 text-slate-400">{s.v}</div>
              </div>
            ))}
        </div>
      </div>

      <div className="relative h-1 bg-[#FBBF24]" />
    </section>
  );
};

export default Hero;
