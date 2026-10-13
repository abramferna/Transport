import { TruckIcon, ShieldCheckIcon, RoadHorizonIcon, ClockIcon } from "@phosphor-icons/react";

const VEHICLES = [
  { name: "Furgón cerrado", payload: "hasta 6.000 kg", volume: "34 m³", best: "Carga paletizada protegida" },
  { name: "Plataforma elevadora", payload: "hasta 6.000 kg", volume: "32 m³", best: "Puerta a puerta sin muelle" },
  { name: "Lonas / tautliner", payload: "hasta 6.000 kg", volume: "34 m³", best: "Cargas voluminosas o de gran longitud" },
];

const FEATURES = [
  { icon: <ShieldCheckIcon size={22} weight="duotone" />, title: "Mercancía asegurada", desc: "Cobertura íntegra en cada viaje, sin franquicia oculta." },
  { icon: <ClockIcon size={22} weight="duotone" />, title: "Mismo día o siguiente", desc: "Entregas planificadas en franjas horarias. Sin sorpresas." },
  { icon: <RoadHorizonIcon size={22} weight="duotone" />, title: "Express y bajo consulta", desc: "Ruta express La Jonquera ⇄ Barcelona. Resto de España con antelación." },
];

export const Fleet = () => (
  <section id="flota" className="py-20 lg:py-28 bg-[#F8FAFC]" data-testid="fleet-section">
    <div className="max-w-7xl mx-auto px-5 lg:px-8">
      <div className="relative isolate overflow-hidden border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 mb-10">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full overflow-hidden md:w-[70%]" aria-hidden="true">
          <img
            src="/vnt-truck-loading.webp"
            alt=""
            className="absolute inset-y-0 left-0 h-full w-[72%] scale-105 object-cover object-center opacity-30 blur-[3px]"
            width="2400"
            height="3600"
            loading="lazy"
            decoding="async"
          />
          <img
            src="/vnt-truck-side.webp"
            alt=""
            className="absolute inset-y-0 right-0 h-full w-[72%] scale-105 object-cover object-center opacity-25 blur-[3px]"
            width="2400"
            height="3600"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-white/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/25" />
        </div>
        <div className="relative z-10 md:max-w-[76%]">
          <div className="label-eyebrow mb-3">Flota & fiabilidad</div>
          <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#012030] leading-[0.95]">
            Vehículos pensados<br />para tu carga.
          </h2>
          <p className="mt-5 text-slate-600 max-w-xl">
            Trabajamos con <strong>flota propia 12T</strong> y carga útil máxima de <strong>6.000 kg / 34 m³</strong>. Recogida y entrega en el día o al día siguiente, planificadas con antelación. Cubrimos los dos corredores desde Girona: sur a Barcelona y norte a La Jonquera. Conductores con CAP en vigor y mercancía asegurada en cada servicio.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-l-2 border-[#FBBF24] pl-4">
                <div className="text-[#013044] mb-2">{f.icon}</div>
                <div className="font-display font-bold text-[#012030]">{f.title}</div>
                <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
        {VEHICLES.map((v) => (
          <div key={v.name} className="bg-white p-6 hover:-translate-y-1 transition-transform duration-200">
            <TruckIcon size={28} weight="duotone" className="text-[#013044] mb-3" />
            <div className="font-display font-black text-[#012030] text-xl">{v.name}</div>
            <div className="font-mono text-xs text-slate-500 mt-1">{v.payload} · {v.volume}</div>
            <div className="mt-3 text-sm text-slate-700">{v.best}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Fleet;
