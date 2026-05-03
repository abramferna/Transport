import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CheckCircleIcon, BuildingOfficeIcon, HouseIcon, ArrowRightIcon, StarIcon } from "@phosphor-icons/react";

const B2B_IMG = "https://images.pexels.com/photos/34968619/pexels-photo-34968619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const B2C_IMG = "https://images.unsplash.com/photo-1606722590635-747d0d915f3e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHZhbiUyMGJveGVzfGVufDB8fHx8MTc3Nzc1NjEyM3ww&ixlib=rb-4.1.0&q=85";

export const ServiceModels = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get("/plans").then((r) => setPlans(r.data.plans || [])).catch(() => {});
  }, []);

  return (
    <section id="modelos" className="py-20 lg:py-28 bg-white" data-testid="service-models-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-5">
            <div className="label-eyebrow mb-3">Modelos de servicio</div>
            <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
              Dos modelos.<br />Cero sorpresas.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <p className="text-slate-600 leading-relaxed">
              Camión con o sin plataforma elevadora según tus necesidades. Cobertura en todo el Gironès con puntas a Barcelona y La Jonquera. Entrega garantizada en 24h, o el mismo día si lo necesitas. Fuera de zona, disponibilidad y precio a consultar.
            </p>
          </div>
        </div>

        {/* Bento: B2B vs B2C overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-16">
          <div className="lg:col-span-7 bg-[#0F172A] text-white p-8 lg:p-10 relative overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-300" style={{ backgroundImage: `url(${B2B_IMG})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/95 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#FBBF24] text-[#0F172A] w-10 h-10 grid place-items-center"><BuildingOfficeIcon size={22} weight="fill" /></span>
                <span className="label-eyebrow text-[#FBBF24]">Profesionales · B2B</span>
              </div>
              <h3 className="font-display text-3xl lg:text-4xl font-black tracking-tighter mb-3">Rutas fijas, precio cerrado cada semana</h3>
              <p className="text-slate-300 max-w-md mb-6">Días pactados, tarifa fija y camión con o sin plataforma. Para empresas, distribuidores y operadores del Gironès que necesitan regularidad.</p>
              <a href="#planes" className="inline-flex items-center gap-2 text-[#FBBF24] font-bold hover:gap-3 transition-all">
                Ver planes <ArrowRightIcon size={16} weight="bold" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200 p-8 lg:p-10 relative overflow-hidden group">
            <div className="absolute right-[-30px] bottom-[-30px] w-56 h-56 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${B2C_IMG})` }} />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#1E3A8A] text-white w-10 h-10 grid place-items-center"><HouseIcon size={22} weight="fill" /></span>
                <span className="label-eyebrow text-[#1E3A8A]">Particulares · B2C</span>
              </div>
              <h3 className="font-display text-3xl lg:text-4xl font-black tracking-tighter text-[#0F172A] mb-3">Envío puntual, precio al momento</h3>
              <p className="text-slate-700 max-w-xs mb-6">Calcula y solicita en segundos. Con o sin plataforma, urgente o planificado. Entrega en 24h o el mismo día en todo el Gironès.</p>
              <a href="#calculadora" className="inline-flex items-center gap-2 text-[#1E3A8A] font-bold hover:gap-3 transition-all">
                Calcular tarifa <ArrowRightIcon size={16} weight="bold" />
              </a>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div id="planes" className="border-t border-slate-200 pt-14">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-4">
            <div>
              <div className="label-eyebrow mb-2">Planes B2B</div>
              <h3 className="font-display text-3xl lg:text-4xl font-black tracking-tighter text-[#0F172A]">Precio cerrado semanal</h3>
            </div>
            <div className="text-sm text-slate-500 font-mono">Precios sin IVA · Cancelación 48h</div>
          </div>

          <div className="mb-8 bg-[#0F172A] text-white px-5 py-3 flex items-center gap-3 flex-wrap">
            <span className="bg-[#FBBF24] text-[#0F172A] text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-1">Promo</span>
            <span className="text-sm">Reserva <strong className="text-[#FBBF24]">4 semanas seguidas</strong> y obtén un <strong className="text-[#FBBF24]">−10%</strong> en cualquier plan. Pregunta por la promo al solicitar tu presupuesto.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
            {plans.map((p) => (
              <div
                key={p.id}
                data-testid={`plan-card-${p.id}`}
                className={`relative bg-white p-7 transition-transform duration-200 hover:-translate-y-1 ${p.popular ? "lg:scale-[1.01]" : ""}`}
              >
                {p.popular && (
                  <div className="absolute top-0 right-0 bg-[#FBBF24] text-[#0F172A] text-[11px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 flex items-center gap-1">
                    <StarIcon size={12} weight="fill" /> Popular
                  </div>
                )}
                <div className="label-eyebrow text-slate-500">{p.name}</div>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-5xl font-black tracking-tighter text-[#0F172A]">{p.price_week}€</span>
                  <span className="text-sm text-slate-500 mb-1.5">/semana</span>
                </div>
                <div className="mt-1 text-sm text-slate-500">{p.frequency} · hasta {p.weight_limit_kg} kg</div>
                <div className="text-xs text-slate-400 mt-1 italic">{p.best_for}</div>

                <ul className="mt-6 space-y-2.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircleIcon size={18} weight="fill" className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPlan?.(p)}
                  data-testid={`plan-cta-${p.id}`}
                  className={`mt-7 w-full h-11 font-bold text-sm transition-colors duration-150 ${
                    p.popular
                      ? "bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A]"
                      : "bg-[#0F172A] hover:bg-[#1E3A8A] text-white"
                  }`}
                >
                  Solicitar este plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceModels;
