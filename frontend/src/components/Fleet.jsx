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
      <div className="border border-slate-200 bg-white p-8 lg:p-10 mb-10">
          <div className="label-eyebrow mb-3">Flota & fiabilidad</div>
          <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
            Vehículos pensados<br />para tu carga.
          </h2>
          <p className="mt-5 text-slate-600 max-w-xl">
            Trabajamos con <strong className="text-[#0F172A]">flota propia 12T</strong> y carga útil máxima de <strong className="text-[#0F172A]">6.000 kg / 34 m³</strong>. Recogida y entrega en el día o al día siguiente, planificadas con antelación. Cubrimos los dos corredores desde Girona: sur a Barcelona y norte a La Jonquera. Conductores con CAP en vigor y mercancía asegurada en cada servicio.
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
