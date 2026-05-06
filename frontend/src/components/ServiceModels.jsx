import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  CheckCircleIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  StarIcon,
  UserIcon,
  WarningIcon,
  ClockIcon,
  MapPinIcon,
  XCircleIcon,
  CurrencyEurIcon,
} from "@phosphor-icons/react";

const B2B_IMG = "https://images.pexels.com/photos/34968619/pexels-photo-34968619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const PLAN_IDEAL = {
  basico: "Empresas con envíos puntuales o volumen bajo. Ideal para autónomos y pymes que necesitan regularidad sin un gran compromiso.",
  estandar: "Empresas con distribución regular en la zona. Perfecto para distribuidores, tiendas y operadores del Gironès con 2-3 rutas semanales.",
  premium: "Operadores logísticos y grandes empresas que necesitan servicio diario, cobertura amplia y atención exclusiva.",
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-5">
            <div className="label-eyebrow mb-3">Modelos de servicio</div>
            <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
              Rutas fijas o<br />envío puntual.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <p className="text-slate-600 leading-relaxed">
              Camión con o sin plataforma elevadora según tus necesidades. Cobertura en todo el Gironès con puntas a Barcelona y La Jonquera. Entrega garantizada en 24h, o el mismo día si lo necesitas. Fuera de zona, disponibilidad y precio a consultar.
            </p>
          </div>
        </div>

        {/* B2B hero card */}
        <div className="mb-16">
          <div className="bg-[#0F172A] text-white p-8 lg:p-12 relative overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{ backgroundImage: `url(${B2B_IMG})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/95 to-transparent" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-[#FBBF24] text-[#0F172A] w-10 h-10 grid place-items-center"><BuildingOfficeIcon size={22} weight="fill" /></span>
                  <span className="label-eyebrow text-[#FBBF24]">Empresas y profesionales</span>
                </div>
                <h3 className="font-display text-3xl lg:text-5xl font-black tracking-tighter mb-4">Rutas fijas, precio cerrado cada semana</h3>
                <p className="text-slate-300 max-w-lg mb-6">Días pactados, tarifa fija y camión con o sin plataforma. Para empresas, distribuidores y operadores del Gironès que necesitan regularidad y previsibilidad.</p>
                <a href="#planes" className="inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-bold px-5 h-11 transition-colors duration-150">
                  Ver planes <ArrowRightIcon size={16} weight="bold" />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
                {[
                  { k: "24h", v: "plazo máximo de entrega" },
                  { k: "Mismo día", v: "disponible bajo petición" },
                  { k: "Con/sin", v: "plataforma elevadora" },
                  { k: "Fuera zona", v: "precio a consultar" },
                ].map((s) => (
                  <div key={s.v} className="bg-[#0F172A]/60 p-5">
                    <div className="font-display text-2xl font-black text-[#FBBF24] leading-none">{s.k}</div>
                    <div className="label-eyebrow mt-2 text-slate-400 text-[10px]">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Particulars notice */}
          <div className="mt-3 bg-slate-50 border border-slate-200 px-5 py-3 flex items-center gap-3">
            <UserIcon size={16} className="text-slate-500 flex-shrink-0" weight="fill" />
            <p className="text-sm text-slate-600">
              <strong className="text-[#0F172A]">También atendemos a particulares.</strong>{" "}
              Usa la calculadora para obtener tu precio y envíanos la solicitud — te confirmamos en menos de 4h.{" "}
              <a href="#calculadora" className="text-[#1E3A8A] font-semibold underline underline-offset-2 hover:text-[#0F172A]">Calcular precio</a>
            </p>
          </div>
        </div>

        {/* Plans */}
        <div id="planes" className="border-t border-slate-200 pt-14">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-4">
            <div>
              <div className="label-eyebrow mb-2">Planes B2B</div>
              <h3 className="font-display text-3xl lg:text-4xl font-black tracking-tighter text-[#0F172A]">Precio cerrado semanal</h3>
            </div>
            <div className="text-sm text-slate-500 font-mono">Precios sin IVA · Mínimo 2 semanas</div>
          </div>

          <div className="mb-8 bg-[#0F172A] text-white px-5 py-3 flex items-center gap-3 flex-wrap">
            <span className="bg-[#FBBF24] text-[#0F172A] text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-1">Promo</span>
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
                        ? "bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A]"
                        : "bg-[#0F172A] hover:bg-[#1E3A8A] text-white"
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
              <h4 className="font-bold text-[#0F172A] text-sm tracking-wide uppercase">Condiciones del servicio</h4>
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
