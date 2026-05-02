import { TruckIcon, ShieldCheckIcon, ThermometerIcon, ClockIcon } from "@phosphor-icons/react";

const FLEET_IMG = "https://images.unsplash.com/photo-1761479556231-570639303a51?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwyfHxmcmVpZ2h0JTIwdHJ1Y2slMjBoaWdod2F5fGVufDB8fHx8MTc3Nzc1NjEyM3ww&ixlib=rb-4.1.0&q=85";

const VEHICLES = [
  { name: "Furgoneta L1", payload: "hasta 800 kg", volume: "8 m³", best: "Particulares · paquetería" },
  { name: "Furgón L3H2", payload: "hasta 1.300 kg", volume: "15 m³", best: "Mudanzas pequeñas · e-commerce" },
  { name: "Camión 3.500 kg", payload: "hasta 1.500 kg", volume: "22 m³", best: "Distribución urbana" },
  { name: "Camión rígido 7.5T", payload: "hasta 4.000 kg", volume: "35 m³", best: "B2B paletizado" },
];

const FEATURES = [
  { icon: <ShieldCheckIcon size={22} weight="duotone" />, title: "Mercancía asegurada", desc: "Cobertura íntegra en cada viaje, sin franquicia oculta." },
  { icon: <ClockIcon size={22} weight="duotone" />, title: "Ventana horaria garantizada", desc: "±30 min sobre la hora pactada o reembolso del recargo." },
  { icon: <ThermometerIcon size={22} weight="duotone" />, title: "Temperatura controlada", desc: "Bajo demanda para mercancía sensible (refrigerado/seco)." },
];

export const Fleet = () => (
  <section id="flota" className="py-20 lg:py-28 bg-[#F8FAFC]" data-testid="fleet-section">
    <div className="max-w-7xl mx-auto px-5 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 border border-slate-200 mb-10">
        <div className="lg:col-span-7 bg-white p-8 lg:p-10">
          <div className="label-eyebrow mb-3">Flota & fiabilidad</div>
          <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
            Vehículos pensados<br />para tu carga.
          </h2>
          <p className="mt-5 text-slate-600 max-w-xl">
            Operamos con flota propia y colaboradores certificados. Mantenimiento preventivo cada 8.000 km y conductores con CAP en vigor.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-l-2 border-[#FBBF24] pl-4">
                <div className="text-[#1E3A8A] mb-2">{f.icon}</div>
                <div className="font-display font-bold text-[#0F172A]">{f.title}</div>
                <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 bg-cover bg-center min-h-[260px]" style={{ backgroundImage: `url(${FLEET_IMG})` }} aria-hidden />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
        {VEHICLES.map((v) => (
          <div key={v.name} className="bg-white p-6 hover:-translate-y-1 transition-transform duration-200">
            <TruckIcon size={28} weight="duotone" className="text-[#1E3A8A] mb-3" />
            <div className="font-display font-black text-[#0F172A] text-xl">{v.name}</div>
            <div className="font-mono text-xs text-slate-500 mt-1">{v.payload} · {v.volume}</div>
            <div className="mt-3 text-sm text-slate-700">{v.best}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Fleet;
