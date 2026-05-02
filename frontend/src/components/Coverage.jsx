import { MapPinIcon, RoadHorizonIcon, ClockClockwiseIcon } from "@phosphor-icons/react";

const ZONES = [
  { name: "Girona ciudad", time: "0 km · base", color: "#1E3A8A" },
  { name: "Salt / Sarrià", time: "5 min", color: "#1E3A8A" },
  { name: "Figueres", time: "35 min", color: "#1E40AF" },
  { name: "La Bisbal", time: "30 min", color: "#1E40AF" },
  { name: "Granollers", time: "55 min", color: "#2563EB" },
  { name: "Mataró", time: "1h 5min", color: "#2563EB" },
  { name: "Barcelona ciudad", time: "1h 15min", color: "#FBBF24" },
  { name: "Hospitalet / Cornellà", time: "1h 25min", color: "#FBBF24" },
];

export const Coverage = () => (
  <section id="cobertura" className="py-20 lg:py-28 bg-white" data-testid="coverage-section">
    <div className="max-w-7xl mx-auto px-5 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
        <div className="lg:col-span-6">
          <div className="label-eyebrow mb-3">Zona de cobertura</div>
          <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
            El corredor<br />Girona — Barcelona.
          </h2>
        </div>
        <div className="lg:col-span-6">
          <p className="text-slate-600 leading-relaxed">
            Especialización absoluta en el eje AP-7 / N-II. Conocemos los muelles, los horarios de carga de los polígonos y las restricciones del centro de Barcelona. Servimos también cercanías y poblaciones intermedias.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 border border-slate-200">
        {/* Map visualization */}
        <div className="lg:col-span-7 bg-[#F8FAFC] p-8 lg:p-10 relative min-h-[420px] overflow-hidden">
          <div className="grid-bg absolute inset-0 opacity-50" />
          <div className="absolute inset-0">
            <svg viewBox="0 0 600 380" className="w-full h-full">
              {/* AP-7 line */}
              <line x1="80" y1="80" x2="520" y2="320" stroke="#0F172A" strokeWidth="3" strokeDasharray="6 4" />
              {/* Yellow truck path */}
              <line x1="80" y1="80" x2="520" y2="320" stroke="#FBBF24" strokeWidth="6" strokeOpacity="0.25" />
              {/* Girona pin */}
              <g transform="translate(80,80)">
                <circle r="9" fill="#1E3A8A" />
                <circle r="22" fill="#1E3A8A" fillOpacity="0.15" />
                <text x="14" y="6" fontFamily="Cabinet Grotesk" fontSize="20" fontWeight="900" fill="#0F172A">GIRONA</text>
              </g>
              {/* Intermediate */}
              <circle cx="220" cy="155" r="5" fill="#1E40AF" />
              <text x="230" y="160" fontFamily="IBM Plex Sans" fontSize="11" fill="#334155">Granollers</text>
              <circle cx="370" cy="240" r="5" fill="#1E40AF" />
              <text x="380" y="245" fontFamily="IBM Plex Sans" fontSize="11" fill="#334155">Mataró</text>
              {/* Barcelona */}
              <g transform="translate(520,320)">
                <circle r="9" fill="#FBBF24" />
                <circle r="22" fill="#FBBF24" fillOpacity="0.25" />
                <text x="-128" y="6" fontFamily="Cabinet Grotesk" fontSize="20" fontWeight="900" fill="#0F172A">BARCELONA</text>
              </g>
            </svg>
          </div>
          <div className="absolute bottom-6 left-6 bg-[#0F172A] text-white px-4 py-3 flex items-center gap-3">
            <RoadHorizonIcon size={20} className="text-[#FBBF24]" weight="duotone" />
            <div>
              <div className="font-display font-black tracking-tight text-lg leading-none">~ 100 km</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mt-1">corredor principal</div>
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
