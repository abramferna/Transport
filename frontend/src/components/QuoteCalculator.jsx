import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  CalculatorIcon, MoonStarsIcon, SunIcon, TruckIcon, PackageIcon, ClockIcon, ArrowRightIcon, SpinnerIcon,
} from "@phosphor-icons/react";

const SERVICES = [
  { id: "estandar", label: "Estándar (muelle a muelle)", desc: "Carga/descarga en muelle." },
  { id: "puerta", label: "Puerta a puerta", desc: "Recogida y entrega en domicilio. +12€" },
  { id: "urgente", label: "Urgente (mismo día)", desc: "Servicio express. +30%" },
];

const ROUTES = [
  { id: "girona-barcelona", label: "Girona ⇄ Barcelona" },
  { id: "barcelona-girona", label: "Barcelona ⇄ Girona" },
  { id: "girona-cercanias", label: "Girona y cercanías" },
  { id: "barcelona-cercanias", label: "Barcelona y cercanías" },
  { id: "intra-girona", label: "Dentro de Girona" },
  { id: "intra-barcelona", label: "Dentro de Barcelona" },
  { id: "otros", label: "Otra ruta" },
];

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const QuoteCalculator = ({ initialPlan, onScrollToForm }) => {
  const [route, setRoute] = useState("girona-barcelona");
  const [weight, setWeight] = useState(150);
  const [service, setService] = useState("estandar");
  const [hour, setHour] = useState(10);
  const [weekday, setWeekday] = useState(2);
  const [calc, setCalc] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [tipo, setTipo] = useState("b2c");
  const [planId, setPlanId] = useState("");
  const [form, setForm] = useState({
    nombre: "", empresa: "", email: "", telefono: "", origen: "", destino: "", descripcion: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  useEffect(() => {
    if (initialPlan) {
      setTipo("b2b");
      setPlanId(initialPlan.id);
      setTimeout(() => onScrollToForm?.(), 50);
    }
  }, [initialPlan, onScrollToForm]);

  const isAfterHours = hour >= 18 || hour < 7;

  const fetchCalc = useMemo(
    () => async (params) => {
      setLoading(true);
      try {
        const r = await api.post("/calculate", params);
        setCalc(r.data);
      } catch {
        toast.error("No se pudo calcular el precio");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCalc({ route, weight_kg: Number(weight) || 0, service, hour: Number(hour), weekday: Number(weekday) });
  }, [route, weight, service, hour, weekday, fetchCalc]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        tipo,
        plan_id: tipo === "b2b" ? planId || null : null,
        nombre: form.nombre,
        empresa: form.empresa || null,
        email: form.email,
        telefono: form.telefono,
        origen: form.origen || ROUTES.find((r) => r.id === route)?.label,
        destino: form.destino || ROUTES.find((r) => r.id === route)?.label,
        route,
        peso_kg: tipo === "b2c" ? Number(weight) : null,
        servicio: tipo === "b2c" ? service : null,
        hora_preferida: tipo === "b2c" ? Number(hour) : null,
        weekday: tipo === "b2c" ? Number(weekday) : null,
        descripcion: form.descripcion || null,
        estimated_price: tipo === "b2c" ? calc?.total_con_iva : null,
      };
      const r = await api.post("/quotes", payload);
      setSubmittedRef(r.data.reference);
      toast.success("Solicitud enviada", { description: `Referencia ${r.data.reference}` });
      setForm({ nombre: "", empresa: "", email: "", telefono: "", origen: "", destino: "", descripcion: "" });
    } catch {
      toast.error("No se pudo enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="calculadora" className="py-20 lg:py-28 bg-[#F1F5F9] border-y border-slate-200" data-testid="calculator-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <div className="label-eyebrow mb-3">Calculadora instantánea</div>
            <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
              Tu precio,<br />en 4 segundos.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-slate-600">Configura tu envío. El precio incluye recargo nocturno (a partir de las 18h) y fines de semana de forma automática.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 border border-slate-200">
          {/* CONTROLS */}
          <div className="lg:col-span-7 bg-white p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6">
              <CalculatorIcon size={20} className="text-[#1E3A8A]" weight="duotone" />
              <span className="label-eyebrow">Parámetros del envío</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Ruta">
                <select value={route} onChange={(e) => setRoute(e.target.value)} className="select-base" data-testid="calc-route">
                  {ROUTES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </Field>
              <Field label={`Peso · ${weight} kg`}>
                <input
                  type="range" min="1" max="2000" step="1"
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full accent-[#1E3A8A]"
                  data-testid="calc-weight"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                  <span>1 kg</span><span>500</span><span>1000</span><span>2000 kg</span>
                </div>
              </Field>
            </div>

            <div className="mt-5">
              <div className="label-eyebrow mb-2">Tipo de servicio</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    data-testid={`calc-service-${s.id}`}
                    className={`text-left p-4 transition-colors duration-150 ${service === s.id ? "bg-[#0F172A] text-white" : "bg-white hover:bg-slate-50"}`}
                  >
                    <div className="font-bold text-sm flex items-center gap-2">
                      {s.id === "estandar" && <TruckIcon size={16} weight={service===s.id?"fill":"regular"} />}
                      {s.id === "puerta" && <PackageIcon size={16} weight={service===s.id?"fill":"regular"} />}
                      {s.id === "urgente" && <ClockIcon size={16} weight={service===s.id?"fill":"regular"} />}
                      {s.label}
                    </div>
                    <div className={`text-xs mt-1 ${service === s.id ? "text-slate-300" : "text-slate-500"}`}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={`Hora de recogida · ${String(hour).padStart(2, "0")}:00`}>
                <input
                  type="range" min="0" max="23" step="1"
                  value={hour} onChange={(e) => setHour(Number(e.target.value))}
                  className="w-full accent-[#1E3A8A]"
                  data-testid="calc-hour"
                />
                <div className="flex items-center gap-2 mt-2 text-xs">
                  {isAfterHours ? (
                    <span className="inline-flex items-center gap-1 bg-[#FBBF24] text-[#0F172A] font-bold px-2 py-0.5">
                      <MoonStarsIcon size={12} weight="fill" /> Recargo nocturno +25%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <SunIcon size={12} weight="fill" /> Horario diurno (07:00 – 17:59)
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Día de la semana">
                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200" data-testid="calc-weekday">
                  {WEEKDAYS.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setWeekday(i)}
                      className={`py-2 text-xs font-bold transition-colors duration-150 ${weekday === i ? "bg-[#1E3A8A] text-white" : "bg-white hover:bg-slate-50"}`}
                    >{d}</button>
                  ))}
                </div>
                {weekday === 5 && <div className="mt-2 text-xs text-slate-600">+15€ recargo sábado</div>}
                {weekday === 6 && <div className="mt-2 text-xs text-slate-600">+30€ recargo domingo / festivo</div>}
              </Field>
            </div>
          </div>

          {/* RESULT */}
          <div className="lg:col-span-5 bg-[#0F172A] text-white p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-56 h-56 bg-[#1E3A8A]/40 rounded-full blur-3xl" aria-hidden />
            <div className="relative">
              <div className="label-eyebrow text-[#FBBF24]">Estimación</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-6xl font-black tracking-tighter">
                  {loading ? <SpinnerIcon className="inline animate-spin" size={48} /> : `${(calc?.total_con_iva ?? 0).toFixed(2)}€`}
                </span>
                <span className="text-sm text-slate-400">IVA incl.</span>
              </div>
              <div className="text-sm text-slate-400 mt-1">Sin IVA: {(calc?.total_sin_iva ?? 0).toFixed(2)}€ · IVA 21%: {(calc?.iva_21 ?? 0).toFixed(2)}€</div>

              <div className="mt-6 border-t border-white/10 pt-5 space-y-2 text-sm">
                <Row k="Ruta base" v={`${(calc?.breakdown?.base_route ?? 0).toFixed(2)}€`} />
                <Row k="Recargo peso" v={`${(calc?.breakdown?.weight_surcharge ?? 0).toFixed(2)}€`} />
                <Row k="Recargo servicio" v={`${(calc?.breakdown?.service_surcharge ?? 0).toFixed(2)}€`} />
                {calc?.breakdown?.nocturno_recargo_25 != null && (
                  <Row k="Nocturno (+25%)" v={`${calc.breakdown.nocturno_recargo_25.toFixed(2)}€`} highlight />
                )}
                {calc?.breakdown?.sabado != null && <Row k="Sábado" v={`${calc.breakdown.sabado.toFixed(2)}€`} highlight />}
                {calc?.breakdown?.domingo_festivo != null && <Row k="Domingo/festivo" v={`${calc.breakdown.domingo_festivo.toFixed(2)}€`} highlight />}
                {calc?.service_label && <Row k="Modalidad" v={calc.service_label} />}
              </div>

              <a
                href="#solicitud"
                onClick={() => { setTipo("b2c"); setPlanId(""); }}
                data-testid="calc-cta-request"
                className="mt-7 w-full inline-flex items-center justify-between bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-bold px-5 h-12 transition-colors duration-150"
              >
                <span>Solicitar este envío</span>
                <ArrowRightIcon size={18} weight="bold" />
              </a>

              <div className="mt-4 text-[11px] text-slate-400 leading-relaxed">
                * Estimación orientativa. El precio final puede variar según volumen real, accesos y condiciones específicas. Confirmaremos el coste por escrito en menos de 4h.
              </div>
            </div>
          </div>
        </div>

        {/* REQUEST FORM */}
        <div id="solicitud" className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 border border-slate-200">
          <div className="lg:col-span-4 bg-[#FBBF24] p-7">
            <div className="label-eyebrow text-[#0F172A]/70">Solicitud de presupuesto</div>
            <h3 className="font-display font-black tracking-tighter text-3xl text-[#0F172A] mt-3 leading-tight">
              Te respondemos<br />en menos de 4h.
            </h3>
            <p className="text-[#0F172A]/80 mt-4 text-sm">Cuéntanos qué necesitas y nuestro equipo te confirmará disponibilidad y precio cerrado.</p>
            <div className="mt-6 space-y-2 text-[#0F172A] text-sm font-medium">
              <div>· Sin compromiso</div>
              <div>· Confirmación por email + WhatsApp</div>
              <div>· Referencia para seguimiento online</div>
            </div>
          </div>

          <form onSubmit={submit} className="lg:col-span-8 bg-white p-7" data-testid="quote-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 mb-5">
              {[{ id: "b2c", label: "Soy particular / envío puntual" }, { id: "b2b", label: "Soy profesional / plan semanal" }].map((t) => (
                <button
                  key={t.id} type="button" onClick={() => setTipo(t.id)}
                  data-testid={`form-tipo-${t.id}`}
                  className={`p-4 text-left text-sm font-bold transition-colors duration-150 ${tipo === t.id ? "bg-[#0F172A] text-white" : "bg-white hover:bg-slate-50 text-[#0F172A]"}`}
                >{t.label}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre completo *">
                <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-base" data-testid="form-nombre" />
              </Field>
              <Field label={tipo === "b2b" ? "Empresa *" : "Empresa (opcional)"}>
                <input required={tipo === "b2b"} value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} className="input-base" data-testid="form-empresa" />
              </Field>
              <Field label="Email *">
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base" data-testid="form-email" />
              </Field>
              <Field label="Teléfono *">
                <input required value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input-base" data-testid="form-telefono" />
              </Field>
              <Field label="Origen">
                <input placeholder="Calle, ciudad" value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} className="input-base" data-testid="form-origen" />
              </Field>
              <Field label="Destino">
                <input placeholder="Calle, ciudad" value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} className="input-base" data-testid="form-destino" />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Descripción de la mercancía / observaciones">
                <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input-base resize-none" data-testid="form-descripcion" />
              </Field>
            </div>

            {tipo === "b2c" && calc && (
              <div className="mt-4 bg-[#F8FAFC] border border-slate-200 p-4 text-sm flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-600">Adjuntamos tu estimación actual:</span>
                <span className="font-display font-black text-xl text-[#0F172A]">{calc.total_con_iva.toFixed(2)}€ <span className="text-xs text-slate-500 font-sans font-normal">IVA incl.</span></span>
              </div>
            )}
            {tipo === "b2b" && planId && (
              <div className="mt-4 bg-[#F8FAFC] border border-slate-200 p-4 text-sm">
                Plan seleccionado: <span className="font-bold uppercase tracking-wider">{planId}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-testid="form-submit"
              className="mt-6 inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-bold px-6 h-12 disabled:opacity-60 transition-colors duration-150"
            >
              {submitting ? <><SpinnerIcon className="animate-spin" size={18} /> Enviando…</> : <>Enviar solicitud <ArrowRightIcon size={18} weight="bold" /></>}
            </button>

            {submittedRef && (
              <div className="mt-5 bg-[#16A34A]/10 border border-[#16A34A] p-4 text-sm" data-testid="form-success">
                <div className="font-bold text-[#16A34A]">Solicitud recibida.</div>
                <div className="text-slate-700 mt-1">Tu referencia es <span className="font-mono font-bold">{submittedRef}</span>. Puedes consultarla en <a href={`/seguimiento/${submittedRef}`} className="underline">Seguimiento</a>.</div>
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{`
        .input-base { width:100%; border:1px solid #CBD5E1; background:#fff; padding:10px 12px; font-size:14px; outline:none; }
        .input-base:focus { border-color:#1E3A8A; box-shadow:0 0 0 1px #1E3A8A; }
        .select-base { width:100%; border:1px solid #CBD5E1; background:#fff; padding:10px 12px; font-size:14px; outline:none; appearance:none; }
        .select-base:focus { border-color:#1E3A8A; box-shadow:0 0 0 1px #1E3A8A; }
      `}</style>
    </section>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="label-eyebrow block mb-2">{label}</span>
    {children}
  </label>
);

const Row = ({ k, v, highlight }) => (
  <div className={`flex items-center justify-between ${highlight ? "text-[#FBBF24] font-bold" : "text-slate-300"}`}>
    <span>{k}</span><span className="font-mono">{v}</span>
  </div>
);

export default QuoteCalculator;
