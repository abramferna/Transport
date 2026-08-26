import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  CheckCircleIcon,
  StarIcon,
  WarningIcon,
  ClockIcon,
  MapPinIcon,
  XCircleIcon,
  CurrencyEurIcon,
} from "@phosphor-icons/react";

const PLAN_IDEAL = {
  basico: "Envíos puntuales o necesidades ocasionales. Ideal para autónomos y pymes que necesitan regularidad sin un gran compromiso semanal.",
  estandar: "Empresas con distribución constante y planificada. Perfecto para distribuidores y operadores del Gironès con 2 rutas semanales fijas.",
  premium: "Empresas que necesitan una logística casi interna: hora exacta, contacto directo con el conductor y máxima estabilidad del servicio.",
};

const CONDITIONS = [
  { icon: <CurrencyEurIcon size={16} weight="fill" />, text: "Km extra fuera de ruta: precio a consultar según distancia." },
  { icon: <MapPinIcon size={16} weight="fill" />, text: "Paradas extra no incluidas en el plan: con recargo pactado previamente." },
  { icon: <XCircleIcon size={16} weight="fill" />, text: "Cancelación con menos de 6h de antelación: devolución del 50% del importe." },
  { icon: <ClockIcon size={16} weight="fill" />, text: "Tiempo de espera superior a 30 min: 10€ adicionales. A partir de 2h el porte se cancela, se devuelve la mercancía a origen y no se reembolsa el servicio." },
];

export const ServiceModels = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get("/plans").then((r) => setPlans(r.data.plans || [])).catch(() => {});
  }, []);

  return (
    <section id="modelos" className="py-16 lg:py-20 bg-white" data-testid="service-models-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Plans */}
        <div id="planes" className="border-t border-slate-200 pt-14">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-4">
            <div>
              <div className="label-eyebrow mb-2">Planes B2B</div>
              <h3 className="font-display text-3xl lg:text-4xl font-black tracking-tighter text-[#012030]">Precio cerrado semanal</h3>
            </div>
            <div className="text-sm text-slate-500 font-mono">Precios sin IVA · Mínimo 2 semanas</div>
          </div>

          <div className="mb-8 bg-[#012030] text-white px-5 py-3 flex items-center gap-3 flex-wrap">
            <span className="bg-[#FBBF24] text-[#012030] text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-1">Promo</span>
            <span className="text-sm">Reserva <strong className="text-[#FBBF24]">4 semanas seguidas</strong> y obtén un <strong className="text-[#FBBF24]">−10%</strong> en cualquier plan. Pregunta por la promo al solicitar tu presupuesto.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
            {plans.map((p) => {
              const idealKey = p.id?.toLowerCase();
              const idealText = PLAN_IDEAL[idealKey] || p.best_for;
              return (
                <div
                  key={p.id}
                  data-testid={`plan-card-${p.id}`}
                  className={`relative bg-white p-7 flex flex-col transition-transform duration-200 hover:-translate-y-1 ${p.popular ? "lg:scale-[1.01]" : ""}`}
                >
                  {p.popular && (
                    <div className="absolute top-0 right-0 bg-[#FBBF24] text-[#012030] text-[11px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 flex items-center gap-1">
                      <StarIcon size={12} weight="fill" /> Popular
                    </div>
                  )}

                  <div className="label-eyebrow text-slate-500">{p.name}</div>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="font-display text-5xl font-black tracking-tighter text-[#012030]">{p.price_week}€</span>
                    <span className="text-sm text-slate-500 mb-1.5">/semana</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{p.frequency} · hasta {p.weight_limit_kg} kg</div>

                  {/* Ideal para */}
                  {idealText && (
                    <div className="mt-4 bg-slate-50 border-l-4 border-[#FBBF24] px-3 py-2">
                      <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-0.5">Ideal para</div>
                      <p className="text-xs text-slate-600 leading-snug">{idealText}</p>
                    </div>
                  )}

                  {/* Incluye */}
                  <div className="mt-5">
                    <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-2">Incluye</div>
                    <ul className="space-y-2">
                      {p.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircleIcon size={16} weight="fill" className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Condición mínimo */}
                  <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1.5">
                    <WarningIcon size={13} weight="fill" className="text-amber-400 flex-shrink-0" />
                    Contratación mínima: <strong className="text-slate-500">2 semanas</strong>
                  </div>

                  <button
                    onClick={() => onSelectPlan?.(p)}
                    data-testid={`plan-cta-${p.id}`}
                    className={`mt-5 w-full h-11 font-bold text-sm transition-colors duration-150 ${
                      p.popular
                        ? "bg-[#FBBF24] hover:bg-[#F59E0B] text-[#012030]"
                        : "bg-[#012030] hover:bg-[#013044] text-white"
                    }`}
                  >
                    Solicitar este plan
                  </button>
                </div>
              );
            })}
          </div>

          {/* Conditions block */}
          <div className="mt-8 border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <WarningIcon size={18} weight="fill" className="text-amber-500" />
              <h4 className="font-bold text-[#012030] text-sm tracking-wide uppercase">Condiciones del servicio</h4>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONDITIONS.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="text-slate-400 flex-shrink-0 mt-0.5">{c.icon}</span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceModels;
