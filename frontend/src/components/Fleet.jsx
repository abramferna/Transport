import { TruckIcon, ShieldCheckIcon, ThermometerIcon, ClockIcon } from "@phosphor-icons/react";

const FLEET_IMG = "https://images.unsplash.com/photo-1761479556231-570639303a51?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwyfHxmcmVpZ2h0JTIwdHJ1Y2slMjBoaWdod2F5fGVufDB8fHx8MTc3Nzc1NjEyM3ww&ixlib=rb-4.1.0&q=85";

const VEHICLES = [
  { name: "Camión rígido 12T", payload: "hasta 6.000 kg", volume: "34 m³", best: "Carga completa Girona ⇄ Barcelona" },
  { name: "12T plataforma elevadora", payload: "hasta 6.000 kg", volume: "32 m³", best: "Puerta a puerta sin muelle · paletizado" },
  { name: "12T lonas / tautliner", payload: "hasta 6.000 kg", volume: "34 m³", best: "Cargas voluminosas o de gran longitud" },
  { name: "12T isotermo (bajo demanda)", payload: "hasta 5.500 kg", volume: "30 m³", best: "Mercancía sensible a temperatura" },
];

const FEATURES = [
  { icon: <ShieldCheckIcon size={22} weight="duotone" />, title: "Mercancía asegurada", desc: "Cobertura íntegra hasta 6.000 kg / 34 m³ · sin franquicia oculta." },
  { icon: <ClockIcon size={22} weight="duotone" />, title: "Ventana horaria garantizada", desc: "±30 min sobre la hora pactada o reembolso del recargo." },
  { icon: <ThermometerIcon size={22} weight="duotone" />, title: "Solo intercity, no urbano", desc: "Especialistas en eje Girona ⇄ Barcelona y Girona ⇄ La Jonquera. No realizamos reparto urbano." },
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
            Flota propia de camiones rígidos de 12 toneladas (MMA) con carga útil máxima de <strong className="text-[#0F172A]">6.000 kg / 34 m³</strong> y plataforma elevadora opcional. No realizamos reparto urbano: foco intercity en los corredores Girona ⇄ Barcelona y Girona ⇄ La Jonquera (frontera). Mantenimiento preventivo cada 8.000 km, conductores con CAP en vigor.
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
