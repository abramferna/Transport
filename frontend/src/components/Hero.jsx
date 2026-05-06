import { ArrowRightIcon, ClockIcon, ShieldCheckIcon, TruckIcon } from "@phosphor-icons/react";

const HERO_IMG = "https://images.pexels.com/photos/27099096/pexels-photo-27099096.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export const Hero = () => {
  return (
    <section className="relative bg-[#0F172A] overflow-hidden" data-testid="hero-section">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/85 to-[#0F172A]/30" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 fade-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block w-10 h-[2px] bg-[#FBBF24]" />
              <span className="label-eyebrow text-[#FBBF24]">Transporte profesional · Girona · Barcelona · Jonquera</span>
            </div>
            <h1 className="font-display font-black tracking-tighter leading-[0.92] text-white text-4xl sm:text-5xl lg:text-6xl">
              Transporte para empresas<br />
              en <span className="text-[#FBBF24]">Girona, Barcelona</span><br />
              y La Jonquera.
            </h1>
            <p className="mt-4 font-display font-bold text-lg sm:text-xl text-[#FBBF24] tracking-tight">
              Entregas rápidas, precios cerrados y sin sorpresas.
            </p>
            <p className="mt-3 text-base text-slate-300 max-w-xl leading-relaxed">
              Rutas fijas o envíos puntuales. Camión propio, base Girona. Entrega en 24h o el mismo día.{" "}
              <span className="text-white font-medium">Envíos fuera de ruta a consultar.</span>
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#calculadora"
                data-testid="hero-cta-calculator"
                className="group inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-bold px-6 h-12 transition-colors duration-150"
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

          <div className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-px bg-white/10 border border-white/10">
            {[
              { icon: <ClockIcon size={22} weight="duotone" />, k: "<4h", v: "respuesta presupuesto" },
              { icon: <TruckIcon size={22} weight="duotone" />, k: "Propia", v: "flota · base Girona" },
              { icon: <ShieldCheckIcon size={22} weight="duotone" />, k: "100%", v: "asegurado" },
            ].map((s) => (
              <div key={s.v} className="bg-[#0F172A] p-5 lg:p-6">
                <div className="text-[#FBBF24] mb-2">{s.icon}</div>
                <div className="font-display text-3xl font-black text-white leading-none">{s.k}</div>
                <div className="label-eyebrow mt-2 text-slate-400">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-1 bg-[#FBBF24]" />
    </section>
  );
};

export default Hero;
