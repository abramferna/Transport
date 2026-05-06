import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  CalculatorIcon, MoonStarsIcon, SunIcon, TruckIcon, PackageIcon, ClockIcon, ArrowRightIcon, SpinnerIcon,
  MapPinIcon, FlagIcon, PencilSimpleIcon, CheckCircleIcon,
} from "@phosphor-icons/react";

const ADDONS_LIST = [
  { id: "plataforma", label: "Plataforma elevadora", desc: "Carga/descarga sin muelle. +35€", icon: "package" },
  { id: "tauliner", label: "Tauliner", desc: "Camión tauliner. +35€", icon: "truck" },
  { id: "descarga_small", label: "Descarga con plataforma 1–3 palets", desc: "+35€", icon: "package" },
  { id: "descarga_media", label: "Descarga con plataforma hasta 8 palets", desc: "+70€", icon: "package" },
  { id: "full_truck", label: "Descarga camión completo con plataforma", desc: "+110€", icon: "truck" },
  { id: "descarga_extra", label: "Descarga extra misma población", desc: "+25€", icon: "package" },
  { id: "descarga_muelle", label: "Descarga muelle · conductor", desc: "+40€", icon: "package" },
  { id: "urgente", label: "Urgente · <24h", desc: "Sin previsión. ×1,20 sobre total", icon: "clock" },
];

const TIME_SLOTS = [
  { id: "manana", label: "Mañana", range: "8 — 11h" },
  { id: "mediodia", label: "Mediodía", range: "12 — 15h" },
  { id: "tarde", label: "Tarde", range: "15 — 17h" },
  { id: "nocturno", label: "Nocturno", range: "18h+", penalty: true },
];

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TownSelect = ({ value, onChange, towns, label, testid }) => {
  const grouped = useMemo(() => {
    const map = {};
    towns.forEach((t) => { (map[t.comarca] ||= []).push(t); });
    return Object.entries(map);
  }, [towns]);
  return (
    <label className="block">
      <span className="label-eyebrow block mb-2">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="select-base" data-testid={testid}>
        {grouped.map(([comarca, list]) => (
          <optgroup key={comarca} label={comarca}>
            {list.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );
};

export const QuoteCalculator = ({ initialPlan, onScrollToForm }) => {
  const [towns, setTowns] = useState([]);
  const [origin, setOrigin] = useState("girona");
  const [destination, setDestination] = useState("barcelona");
  const [weight, setWeight] = useState(800);
  const [volume, setVolume] = useState(4);
  const [addons, setAddons] = useState([]);
  const [timeSlot, setTimeSlot] = useState("manana");
  const [weekday, setWeekday] = useState(2);
  const [calc, setCalc] = useState(null);
  const [loading, setLoading] = useState(false);

  const [tipo, setTipo] = useState("b2c");
  const [planId, setPlanId] = useState("");
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", telefono: "", descripcion: "" });
  const [stops, setStops] = useState([{ direccion: "", franja: "manana" }]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  const toggleAddon = (id) => {
    setAddons((cur) => cur.includes(id) ? cur.filter((a) => a !== id) : [...cur, id]);
  };

  const updateStop = (i, field, val) =>
    setStops((cur) => cur.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  useEffect(() => {
    api.get("/towns").then((r) => setTowns(r.data.towns || [])).catch(() => {});
    api.get("/plans").then((r) => setPlans(r.data.plans || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialPlan) {
      setTipo("b2b");
      setPlanId(initialPlan.id);
      setTimeout(() => onScrollToForm?.(), 50);
    }
  }, [initialPlan, onScrollToForm]);

  useEffect(() => {
    if (tipo === "b2c") {
      setStops((prev) => [{ direccion: prev[0]?.direccion || "", franja: prev[0]?.franja || "manana" }]);
    } else {
      const plan = plans.find((p) => p.id === planId);
      const count = plan?.stops || 1;
      setStops((prev) => Array.from({ length: count }, (_, i) => prev[i] || { direccion: "", franja: "manana" }));
    }
  }, [tipo, planId, plans]);

  const isAfterHours = timeSlot === "nocturno";
  const isWeekend = weekday >= 5;

  const fetchCalc = useMemo(
    () => async (params) => {
      setLoading(true);
      let lastErr;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const r = await api.post("/calculate", params);
          setCalc(r.data);
          setLoading(false);
          return;
        } catch (e) {
          lastErr = e;
          if (attempt < 2) await new Promise((res) => setTimeout(res, 1200));
        }
      }
      toast.error("No se pudo calcular el precio");
      setLoading(false);
    }, []);

  useEffect(() => {
    fetchCalc({
      origin_town: origin, destination_town: destination,
      weight_kg: Number(weight) || 0, volume_m3: Number(volume) || 0,
      addons, time_slot: timeSlot, weekday: Number(weekday),
    });
  }, [origin, destination, weight, volume, addons, timeSlot, weekday, fetchCalc]);

  const originName = towns.find((t) => t.id === origin)?.name || "Girona";
  const destName = towns.find((t) => t.id === destination)?.name || "Barcelona";
  const selectedPlan = plans.find((p) => p.id === planId);

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        tipo,
        plan_id: tipo === "b2b" ? planId || null : null,
        nombre: form.nombre,
        empresa: form.empresa || null,
        email: form.email,
        telefono: form.telefono,
        origen: originName,
        destino: destName,
        origin_town: origin,
        destination_town: destination,
        peso_kg: tipo === "b2c" ? Number(weight) : null,
        volumen_m3: tipo === "b2c" ? Number(volume) : null,
        addons: tipo === "b2c" ? addons : null,
        time_slot: tipo === "b2c" ? timeSlot : null,
        servicio: tipo === "b2c" && addons.length ? addons.join("+") : null,
        hora_preferida: null,
        weekday: tipo === "b2c" ? Number(weekday) : null,
        descripcion: form.descripcion || null,
        estimated_price: tipo === "b2c" ? calc?.total_con_iva : null,
        paradas: stops.map((s, i) => ({ numero: i + 1, direccion: s.direccion, franja: s.franja })),
      };
      const r = await api.post("/quotes", payload);
      setSubmittedRef(r.data.reference);
      setStep(1);
      toast.success("Solicitud enviada", { description: `Referencia ${r.data.reference}` });
      setForm({ nombre: "", empresa: "", email: "", telefono: "", descripcion: "" });
      setStops([{ direccion: "", franja: "manana" }]);
    } catch {
      toast.error("No se pudo enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = (e) => {
    e.preventDefault();
    setStep(2);
    setTimeout(() => document.getElementById("solicitud")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const slotLabel = (id) => TIME_SLOTS.find((s) => s.id === id)?.label + " · " + TIME_SLOTS.find((s) => s.id === id)?.range;

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
            <p className="text-slate-600">Selecciona origen y destino, peso y volumen. Añade plataforma si no tienes muelle. Mínimo 85€. <strong className="text-[#0F172A]">Fuera del Gironès o destinos especiales</strong>: precio a consultar.</p>
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
              <TownSelect value={origin} onChange={setOrigin} towns={towns} label="Origen" testid="calc-origin" />
              <TownSelect value={destination} onChange={setDestination} towns={towns} label="Destino" testid="calc-destination" />
            </div>

            {calc?.breakdown && (
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-mono">
                <MapPinIcon size={14} className="text-[#1E3A8A]" weight="fill" />
                <span><strong>{calc.breakdown.km_recorridos_aprox} km</strong> aprox. desde la base</span>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={`Peso · ${weight >= 1000 ? `${(weight / 1000).toFixed(1)} t` : `${weight} kg`}`}>
                <input
                  type="range" min="50" max="6000" step="50"
                  value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full accent-[#1E3A8A]"
                  data-testid="calc-weight"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                  <span>50 kg</span><span>2 t</span><span>4 t</span><span>6 t · máx.</span>
                </div>
              </Field>
              <Field label={`Volumen · ${volume.toFixed(1)} m³ ${calc?.breakdown?.volumetric_kg ? `(equiv. ${calc.breakdown.volumetric_kg} kg)` : ""}`}>
                <input
                  type="range" min="0.5" max="34" step="0.5"
                  value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-[#FBBF24]"
                  data-testid="calc-volume"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                  <span>0,5 m³</span><span>12</span><span>24</span><span>34 m³ · máx.</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">Referencia: <span className="font-semibold text-slate-600">1 palet europeo (80×120 cm) ≈ 1,45 m³</span> · carga estándar 4 palets ≈ 5,8 m³</div>
              </Field>
            </div>

            {calc?.breakdown?.chargeable_kg > Number(weight) && (
              <div className="mt-3 text-xs text-[#1E3A8A] bg-[#1E3A8A]/5 border border-[#1E3A8A]/20 px-3 py-2">
                El volumen manda: facturamos por <strong>{calc.breakdown.chargeable_kg} kg</strong> (peso volumétrico, 176 kg/m³ del 12T).
              </div>
            )}

            <div className="mt-5">
              <div className="label-eyebrow mb-2 flex items-center justify-between">
                <span>Extras combinables (selecciona los que necesites)</span>
                {addons.length > 0 && <span className="text-[10px] text-[#1E3A8A] font-bold">{addons.length} activo{addons.length>1?"s":""}</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
                {ADDONS_LIST.map((s) => {
                  const active = addons.includes(s.id);
                  return (
                    <button
                      key={s.id} type="button"
                      onClick={() => toggleAddon(s.id)}
                      data-testid={`calc-addon-${s.id}`}
                      className={`text-left p-4 transition-colors duration-150 relative ${active ? "bg-[#0F172A] text-white" : "bg-white hover:bg-slate-50"}`}
                    >
                      <div className="font-bold text-sm flex items-center gap-2">
                        {s.icon === "truck" && <TruckIcon size={16} weight={active?"fill":"regular"} />}
                        {s.icon === "package" && <PackageIcon size={16} weight={active?"fill":"regular"} />}
                        {s.icon === "clock" && <ClockIcon size={16} weight={active?"fill":"regular"} />}
                        {s.label}
                      </div>
                      <div className={`text-xs mt-1 ${active ? "text-slate-300" : "text-slate-500"}`}>{s.desc}</div>
                      <div className={`absolute top-3 right-3 w-4 h-4 border-2 grid place-items-center ${active ? "bg-[#FBBF24] border-[#FBBF24]" : "border-slate-300"}`}>
                        {active && <span className="text-[#0F172A] font-bold text-xs leading-none">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {addons.length === 0 && (
                <div className="mt-2 text-xs text-slate-500">Sin extras: servicio estándar muelle a muelle.</div>
              )}
              <div className="mt-3 space-y-2">
                <div className="bg-[#FFF9EC] border border-[#FBBF24]/40 px-3 py-2 text-xs text-[#78350F] leading-snug">
                  <span className="font-bold">Descargas adicionales o situaciones especiales</span> — Contacta con nosotros antes de confirmar: <a href="https://wa.me/34673392259" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-[#92400E]">WhatsApp</a> o <a href="mailto:ViaNord@gmail.com" className="font-bold underline hover:text-[#92400E]">Email</a>.
                </div>
                <div className="bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600 leading-snug">
                  <span className="font-bold">Mercancía paletizada o preparada.</span> Toda la carga debe llegar paletizada o correctamente preparada para la descarga en destino. En caso contrario, consulta previamente con nosotros.
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Franja horaria de recogida (en origen)">
                <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200" data-testid="calc-time-slots">
                  {TIME_SLOTS.map((s) => {
                    const active = timeSlot === s.id;
                    return (
                      <button
                        key={s.id} type="button" onClick={() => setTimeSlot(s.id)}
                        data-testid={`calc-slot-${s.id}`}
                        className={`p-3 text-left transition-colors duration-150 ${active ? (s.penalty ? "bg-[#FBBF24] text-[#0F172A]" : "bg-[#1E3A8A] text-white") : "bg-white hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-1.5">
                          {s.id === "nocturno" ? <MoonStarsIcon size={14} weight={active?"fill":"regular"} /> : <SunIcon size={14} weight={active?"fill":"regular"} />}
                          <span className="font-bold text-sm">{s.label}</span>
                        </div>
                        <div className={`text-[11px] mt-0.5 font-mono ${active && !s.penalty ? "text-slate-300" : (active ? "text-[#0F172A]/70" : "text-slate-500")}`}>{s.range}</div>
                      </button>
                    );
                  })}
                </div>
                {isAfterHours && (
                  <div data-testid="badge-nocturno" className="mt-2 inline-flex items-center gap-1 bg-[#FBBF24] text-[#0F172A] text-xs font-bold px-2 py-0.5">
                    <MoonStarsIcon size={12} weight="fill" /> Recargo nocturno +25%
                  </div>
                )}
              </Field>
              <Field label="Día de la semana">
                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200" data-testid="calc-weekday">
                  {WEEKDAYS.map((d, i) => (
                    <button
                      key={d} type="button" onClick={() => setWeekday(i)}
                      className={`py-2 text-xs font-bold transition-colors duration-150 ${weekday === i ? "bg-[#1E3A8A] text-white" : "bg-white hover:bg-slate-50"}`}
                    >{d}</button>
                  ))}
                </div>
                {isWeekend && (
                  <div className="mt-2 text-xs bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30 px-2 py-1.5 font-medium">
                    Fin de semana: ruta ×2 y extras +15%
                  </div>
                )}
              </Field>
            </div>
          </div>

          {/* RESULT */}
          <div className="lg:col-span-5 bg-[#0F172A] text-white p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-56 h-56 bg-[#1E3A8A]/40 rounded-full blur-3xl" aria-hidden />
            <div className="relative">
              <div className="label-eyebrow text-[#FBBF24]">Estimación</div>
              <div className="text-xs text-slate-400 mt-1">{originName} → {destName}</div>
              <div className="mt-2 flex items-baseline gap-2" data-testid="calc-total">
                <span className="font-display text-6xl font-black tracking-tighter">
                  {loading ? <SpinnerIcon className="inline animate-spin" size={48} /> : `${(calc?.total_con_iva ?? 0).toFixed(2)}€`}
                </span>
                <span className="text-sm text-slate-400">IVA incl.</span>
              </div>
              <div className="text-sm text-slate-400 mt-1">Sin IVA: {(calc?.total_sin_iva ?? 0).toFixed(2)}€ · IVA 21%: {(calc?.iva_21 ?? 0).toFixed(2)}€</div>

              <div className="mt-6 border-t border-white/10 pt-5 space-y-2 text-sm">
                <Row k="Mínimo salida base" v={`${(calc?.breakdown?.minimo_salida_base ?? 0).toFixed(2)}€`} />
                <Row k={`Coste km (${calc?.breakdown?.km_recorridos_aprox ?? 0} km)`} v={`${(calc?.breakdown?.coste_km ?? 0).toFixed(2)}€`} />
                {calc?.breakdown?.premium_barcelona > 0 && <Row k="Premium proximidad BCN" v={`${calc.breakdown.premium_barcelona.toFixed(2)}€`} />}
                {calc?.breakdown?.premium_jonquera > 0 && <Row k="Premium frontera Jonquera" v={`${calc.breakdown.premium_jonquera.toFixed(2)}€`} />}
                <Row k="Recargo peso/volumen" v={`${(calc?.breakdown?.weight_surcharge ?? 0).toFixed(2)}€`} />
                {calc?.breakdown?.big_load_discount_pct > 0 && (
                  <Row k={`Descuento gran carga (-${calc.breakdown.big_load_discount_pct}%)`} v={`-${calc.breakdown.big_load_discount_amount.toFixed(2)}€`} highlight />
                )}
                {calc?.breakdown?.addons_flat > 0 && <Row k="Extras (fijo)" v={`${calc.breakdown.addons_flat.toFixed(2)}€`} />}
                {calc?.breakdown?.addons_route_pct_charge > 0 && <Row k="Ida + vuelta (+50% ruta)" v={`${calc.breakdown.addons_route_pct_charge.toFixed(2)}€`} />}
                {calc?.breakdown?.addons_multiplier > 1 && <Row k={`Multiplicador (×${calc.breakdown.addons_multiplier.toFixed(2)})`} v="urgente" highlight />}
                {calc?.breakdown?.fin_de_semana_base_x2 != null && (
                  <Row k="Fin de semana · ruta ×2" v={`${calc.breakdown.fin_de_semana_base_x2.toFixed(2)}€`} highlight />
                )}
                {calc?.breakdown?.fin_de_semana_extras_x1_15 != null && (
                  <Row k="Fin de semana · extras +15%" v={`${calc.breakdown.fin_de_semana_extras_x1_15.toFixed(2)}€`} highlight />
                )}
                {calc?.breakdown?.nocturno_recargo_25 != null && (
                  <Row k="Nocturno (+25%)" v={`${calc.breakdown.nocturno_recargo_25.toFixed(2)}€`} highlight />
                )}
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
                * Estimación orientativa. Mínimo 85€ por salida de base. El precio final puede variar según volumen real, accesos y condiciones específicas. Confirmaremos por escrito en menos de 4h.
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

            {/* Step indicator */}
            <div className="mt-8 flex items-center gap-3">
              <div className={`w-7 h-7 grid place-items-center font-bold text-sm border-2 ${step === 1 ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white text-[#0F172A] border-[#0F172A]"}`}>1</div>
              <div className="text-xs font-bold text-[#0F172A]">Datos del servicio</div>
            </div>
            <div className="ml-3.5 border-l-2 border-[#0F172A]/30 h-4" />
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 grid place-items-center font-bold text-sm border-2 ${step === 2 ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white/60 text-[#0F172A]/50 border-[#0F172A]/30"}`}>2</div>
              <div className={`text-xs font-bold ${step === 2 ? "text-[#0F172A]" : "text-[#0F172A]/50"}`}>Confirmación</div>
            </div>
          </div>

          {/* STEP 1 — FORM */}
          {step === 1 && (
            <form onSubmit={handleReview} className="lg:col-span-8 bg-white p-7" data-testid="quote-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 mb-5">
                {[{ id: "b2c", label: "Soy particular / envío puntual" }, { id: "b2b", label: "Soy profesional / plan semanal" }].map((t) => (
                  <button
                    key={t.id} type="button" onClick={() => { setTipo(t.id); setStep(1); }}
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
              </div>

              <div className="mt-4 bg-[#F8FAFC] border border-slate-200 p-3 text-xs text-slate-600 flex flex-wrap items-center gap-3">
                <span className="label-eyebrow">Ruta</span>
                <span className="font-bold text-[#0F172A]">{originName} → {destName}</span>
                <span className="font-mono">{calc?.breakdown?.km_recorridos_aprox ?? "—"} km</span>
                {tipo === "b2b" && selectedPlan && (
                  <span className="ml-auto text-[#1E3A8A] font-bold uppercase tracking-wider">{selectedPlan.name}</span>
                )}
              </div>

              {/* Paradas */}
              <div className="mt-5">
                <div className="label-eyebrow mb-1 flex items-center gap-2">
                  <FlagIcon size={14} weight="fill" className="text-[#1E3A8A]" />
                  {tipo === "b2c"
                    ? "Dirección de entrega · disponibilidad para descarga"
                    : `Paradas del plan (${stops.length}) · dirección y disponibilidad para descarga`}
                </div>
                <p className="text-xs text-slate-500 mb-3">La franja de recogida en origen ya queda registrada arriba. Indícanos aquí cuándo puede recibir la mercancía el destinatario.</p>
                <div className="space-y-3">
                  {stops.map((stop, i) => (
                    <div key={i} className="border border-slate-200 bg-[#F8FAFC] p-4">
                      <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                        <span className="bg-[#0F172A] text-white w-5 h-5 grid place-items-center text-[10px] font-bold">{i + 1}</span>
                        {tipo === "b2c" ? "Entrega" : `Parada ${i + 1}`}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Dirección *">
                          <input
                            required
                            placeholder="Calle, número, población"
                            value={stop.direccion}
                            onChange={(e) => updateStop(i, "direccion", e.target.value)}
                            className="input-base"
                          />
                        </Field>
                        <Field label="Disponibilidad descarga *">
                          <select
                            value={stop.franja}
                            onChange={(e) => updateStop(i, "franja", e.target.value)}
                            className="select-base"
                          >
                            {TIME_SLOTS.map((s) => (
                              <option key={s.id} value={s.id}>{s.label} · {s.range}{s.penalty ? " (+25%)" : ""}</option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Field label="Descripción de la mercancía / observaciones">
                  <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input-base resize-none" data-testid="form-descripcion" />
                </Field>
              </div>

              {tipo === "b2c" && calc && (
                <div className="mt-4 bg-[#F8FAFC] border border-slate-200 p-4 text-sm flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-600">Estimación actual:</span>
                  <span className="font-display font-black text-xl text-[#0F172A]">{calc.total_con_iva.toFixed(2)}€ <span className="text-xs text-slate-500 font-sans font-normal">IVA incl.</span></span>
                </div>
              )}

              <button
                type="submit"
                data-testid="form-review"
                className="mt-6 inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-bold px-6 h-12 transition-colors duration-150"
              >
                Revisar solicitud <ArrowRightIcon size={18} weight="bold" />
              </button>

              {submittedRef && (
                <div className="mt-5 bg-[#16A34A]/10 border border-[#16A34A] p-4 text-sm" data-testid="form-success">
                  <div className="font-bold text-[#16A34A]">Solicitud recibida.</div>
                  <div className="text-slate-700 mt-1">Tu referencia es <span className="font-mono font-bold">{submittedRef}</span>. Puedes consultarla en <a href={`/seguimiento/${submittedRef}`} className="underline">Seguimiento</a>.</div>
                </div>
              )}
            </form>
          )}

          {/* STEP 2 — CONFIRMATION */}
          {step === 2 && (
            <div className="lg:col-span-8 bg-white p-7" data-testid="quote-confirm">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircleIcon size={22} className="text-[#16A34A]" weight="fill" />
                <h4 className="font-display font-black text-xl text-[#0F172A] tracking-tight">Revisa los datos antes de enviar</h4>
              </div>

              <div className="space-y-px border border-slate-200 divide-y divide-slate-200 text-sm mb-6">
                <ConfirmRow label="Tipo" value={tipo === "b2c" ? "Particular / envío puntual" : "Profesional / plan semanal"} />
                {tipo === "b2b" && selectedPlan && <ConfirmRow label="Plan" value={selectedPlan.name} />}
                <ConfirmRow label="Nombre" value={form.nombre} />
                {form.empresa && <ConfirmRow label="Empresa" value={form.empresa} />}
                <ConfirmRow label="Email" value={form.email} />
                <ConfirmRow label="Teléfono" value={form.telefono} />
                <ConfirmRow label="Ruta" value={`${originName} → ${destName} (${calc?.breakdown?.km_recorridos_aprox ?? "—"} km)`} />
                {tipo === "b2c" && (
                  <>
                    <ConfirmRow label="Peso / Volumen" value={`${weight} kg · ${volume} m³`} />
                    {addons.length > 0 && <ConfirmRow label="Extras" value={addons.map((a) => ADDONS_LIST.find((x) => x.id === a)?.label).join(", ")} />}
                    {calc && <ConfirmRow label="Estimación" value={`${calc.total_con_iva.toFixed(2)}€ IVA incl.`} highlight />}
                  </>
                )}
                {form.descripcion && <ConfirmRow label="Observaciones" value={form.descripcion} />}
              </div>

              <div className="mb-6">
                <div className="label-eyebrow mb-3">
                  {stops.length === 1 ? "Dirección de entrega" : `Paradas (${stops.length})`}
                </div>
                <div className="space-y-2">
                  {stops.map((stop, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#F8FAFC] border border-slate-200 px-4 py-3 text-sm">
                      <span className="bg-[#0F172A] text-white w-5 h-5 grid place-items-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <div>
                        <div className="font-medium text-[#0F172A]">{stop.direccion || <span className="text-slate-400 italic">Sin dirección</span>}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{slotLabel(stop.franja)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-[#0F172A] font-bold px-5 h-12 transition-colors duration-150"
                >
                  <PencilSimpleIcon size={16} weight="bold" /> Editar datos
                </button>
                <button
                  type="button"
                  onClick={doSubmit}
                  disabled={submitting}
                  data-testid="form-submit"
                  className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold px-6 h-12 disabled:opacity-60 transition-colors duration-150"
                >
                  {submitting
                    ? <><SpinnerIcon className="animate-spin" size={18} /> Enviando…</>
                    : <><CheckCircleIcon size={18} weight="bold" /> Confirmar y enviar</>}
                </button>
              </div>
            </div>
          )}
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

const ConfirmRow = ({ label, value, highlight }) => (
  <div className={`flex gap-3 px-4 py-2.5 ${highlight ? "bg-[#F0FDF4]" : "bg-white"}`}>
    <span className="label-eyebrow text-slate-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
    <span className={`flex-1 ${highlight ? "font-bold text-[#16A34A]" : "text-[#0F172A]"}`}>{value}</span>
  </div>
);

export default QuoteCalculator;
