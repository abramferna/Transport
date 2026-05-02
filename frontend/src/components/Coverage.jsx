import { MapPinIcon, RoadHorizonIcon, ClockClockwiseIcon } from "@phosphor-icons/react";

const ZONES = [
  { name: "La Jonquera (frontera)", time: "55 min · norte", color: "#FBBF24" },
  { name: "Figueres / Vilafant", time: "35 min", color: "#FBBF24" },
  { name: "Girona (polígonos)", time: "0 km · base", color: "#1E3A8A" },
  { name: "Salt / Sarrià", time: "5 min", color: "#1E3A8A" },
  { name: "La Bisbal / Begur", time: "30-40 min · costa", color: "#1E40AF" },
  { name: "Granollers / Mataró", time: "55-70 min", color: "#2563EB" },
  { name: "Barcelona (polígonos)", time: "1h 15min", color: "#FBBF24" },
  { name: "Hospitalet / Cornellà", time: "1h 25min", color: "#FBBF24" },
];

export const Coverage = () => (
  <section id="cobertura" className="py-20 lg:py-28 bg-white" data-testid="coverage-section">
    <div className="max-w-7xl mx-auto px-5 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
        <div className="lg:col-span-6">
          <div className="label-eyebrow mb-3">Zona de cobertura</div>
          <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
            Dos corredores.<br />Un solo equipo.
          </h2>
        </div>
        <div className="lg:col-span-6">
          <p className="text-slate-600 leading-relaxed">
            Especialización absoluta en dos ejes desde nuestra base en Girona: <strong className="text-[#0F172A]">Girona ⇄ Barcelona</strong> (AP-7 sur, +160 km) y <strong className="text-[#0F172A]">Girona ⇄ La Jonquera</strong> (AP-7 norte, frontera francesa). Flota propia de 12T entre polígonos industriales. <strong className="text-[#0F172A]">No realizamos reparto urbano</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 border border-slate-200">
        {/* Map visualization */}
        <div className="lg:col-span-7 bg-[#F8FAFC] p-8 lg:p-10 relative min-h-[420px] overflow-hidden">
          <div className="grid-bg absolute inset-0 opacity-50" />
          <div className="absolute inset-0">
            <svg viewBox="0 0 600 380" className="w-full h-full">
              {/* AP-7 norte (Girona → La Jonquera) */}
              <line x1="300" y1="200" x2="160" y2="50" stroke="#0F172A" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="300" y1="200" x2="160" y2="50" stroke="#FBBF24" strokeWidth="6" strokeOpacity="0.25" />
              {/* AP-7 sur (Girona → Barcelona) */}
              <line x1="300" y1="200" x2="540" y2="340" stroke="#0F172A" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="300" y1="200" x2="540" y2="340" stroke="#FBBF24" strokeWidth="6" strokeOpacity="0.25" />

              {/* La Jonquera */}
              <g transform="translate(160,50)">
                <circle r="9" fill="#FBBF24" />
                <circle r="22" fill="#FBBF24" fillOpacity="0.25" />
                <text x="-118" y="6" fontFamily="Cabinet Grotesk" fontSize="18" fontWeight="900" fill="#0F172A">LA JONQUERA</text>
                <text x="-32" y="22" fontFamily="IBM Plex Sans" fontSize="10" fill="#64748B">frontera</text>
              </g>
              <circle cx="220" cy="120" r="5" fill="#1E40AF" />
              <text x="160" y="138" fontFamily="IBM Plex Sans" fontSize="11" fill="#334155">Figueres</text>

              {/* Girona base */}
              <g transform="translate(300,200)">
                <circle r="11" fill="#1E3A8A" />
                <circle r="26" fill="#1E3A8A" fillOpacity="0.18" />
                <text x="16" y="6" fontFamily="Cabinet Grotesk" fontSize="22" fontWeight="900" fill="#0F172A">GIRONA</text>
                <text x="16" y="22" fontFamily="IBM Plex Sans" fontSize="10" fill="#64748B" letterSpacing="2">BASE</text>
              </g>

              {/* Costa (lateral) */}
              <circle cx="380" cy="220" r="4" fill="#1E40AF" />
              <text x="388" y="224" fontFamily="IBM Plex Sans" fontSize="10" fill="#334155">Begur / Pals</text>

              {/* Granollers / Mataró */}
              <circle cx="430" cy="280" r="5" fill="#1E40AF" />
              <text x="440" y="285" fontFamily="IBM Plex Sans" fontSize="11" fill="#334155">Granollers</text>

              {/* Barcelona */}
              <g transform="translate(540,340)">
                <circle r="9" fill="#FBBF24" />
                <circle r="22" fill="#FBBF24" fillOpacity="0.25" />
                <text x="-128" y="6" fontFamily="Cabinet Grotesk" fontSize="20" fontWeight="900" fill="#0F172A">BARCELONA</text>
              </g>
            </svg>
          </div>
          <div className="absolute bottom-6 left-6 bg-[#0F172A] text-white px-4 py-3 flex items-center gap-3">
            <RoadHorizonIcon size={20} className="text-[#FBBF24]" weight="duotone" />
            <div>
              <div className="font-display font-black tracking-tight text-lg leading-none">~ 60 + 100 km</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mt-1">norte y sur desde Girona</div>
            </div>
          </div>
        </div>

        {/* Zone list */}
        <div className="lg:col-span-5 bg-white">
          <div className="grid grid-cols-1 divide-y divide-slate-200">
            {ZONES.map((z) => (
              <div key={z.name} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-150">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2" style={{ background: z.color }} />
                  <span className="font-semibold text-[#0F172A] text-sm">{z.name}</span>
                </div>
                <span className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
                  <ClockClockwiseIcon size={13} /> {z.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Coverage;
