import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightIcon,
  CaretDownIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardTextIcon,
  ClockIcon,
  PackageIcon,
  PlusIcon,
  SpinnerIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import PalletShipmentLine, {
  decimalInput,
  fieldClass,
  formatEuro,
  formatNumber,
  Label,
  requestError,
} from "@/components/PalletShipmentLine";

export default function PalletQuoteCalculator() {
  const nextId = useRef(2);
  const [zones, setZones] = useState([]);
  const [towns, setTowns] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState("");
  const [lines, setLines] = useState([{ id: 1, origin: "", origin_manual: false, town: "", pallets: "1", weight_kg: "500" }]);
  const [quote, setQuote] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", empresa: "", comentarios: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/pallet-rates")
      .then(({ data }) => {
        if (!active) return;
        setZones(data.zones);
        setTowns(data.towns);
        setRatesError("");
      })
      .catch(() => {
        if (active) setRatesError("No se pudo cargar la tarifa. Recarga la página o contacta con ViaNordTrans.");
      })
      .finally(() => {
        if (active) setRatesLoading(false);
      });
    return () => { active = false; };
  }, []);

  const townByName = useMemo(() => new Map(towns.map((town) => [town.name, town])), [towns]);
  const readyLines = useMemo(() => lines.every((line) => (
    (line.origin_manual ? Boolean(line.origin.trim()) : townByName.has(line.origin)) &&
    townByName.has(line.town) &&
    (decimalInput(line.pallets) ?? 0) >= 0.1 &&
    (decimalInput(line.weight_kg) ?? 0) >= 1
  )), [lines, townByName]);

  useEffect(() => {
    if (ratesLoading || ratesError || !readyLines) {
      setQuote(null);
      setCalculating(false);
      setCalculationError("");
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setCalculating(true);
      setCalculationError("");
      api.post("/pallet-calculate", {
        lines: lines.map(({ origin, origin_manual, town, pallets, weight_kg }) => ({
          origin: origin.slice(0, 160),
          origin_manual,
          town,
          pallets,
          weight_kg,
        })),
      })
        .then(({ data }) => {
          if (active) setQuote(data);
        })
        .catch((error) => {
          if (active) {
            setQuote(null);
            setCalculationError(requestError(error, "No se pudo calcular este presupuesto."));
          }
        })
        .finally(() => {
          if (active) setCalculating(false);
        });
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [lines, ratesError, ratesLoading, readyLines]);

  const consultationRequired = Boolean(quote?.consultation_required);
  const validForSubmit = Boolean(quote && !calculating && consent && form.nombre.trim() &&
    form.telefono.replace(/\D/g, "").length >= 8 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && !sending && !submission);

  const updateLine = (id, changes) => {
    setSubmission(null);
    setQuote(null);
    setLines((current) => current.map((line) => line.id === id ? { ...line, ...changes } : line));
  };

  const addLine = () => {
    if (lines.length >= 20) return;
    setSubmission(null);
    setQuote(null);
    setLines((current) => [
      ...current,
      { id: nextId.current++, origin: "", origin_manual: false, town: "", pallets: "1", weight_kg: "500" },
    ]);
  };

  const removeLine = (id) => {
    setSubmission(null);
    setQuote(null);
    setLines((current) => current.filter((line) => line.id !== id));
  };

  const quoteText = () => {
    if (!quote) return "";
    const rows = quote.lines.map((line, index) => (
      `${index + 1}. ${line.origin || "Origen sin especificar"} → ${line.destination} · ` +
      `Zona ${line.zone} · ${formatEuro(line.unit_price)}/palé · ${formatNumber(line.pallets)} palés · ` +
      `${formatNumber(line.weight_kg_per_pallet)} kg/palé → factor ×${line.factor == null ? "consultar" : formatNumber(line.factor, 1)} · ` +
      `${line.consultation_required
        ? "Consultar"
        : `${formatNumber(line.pallets)} × ${formatNumber(line.factor, 1)} = ${formatNumber(line.billable_pallets)} palés facturables; ${formatNumber(line.billable_pallets)} × ${formatEuro(line.unit_price)} = ${formatEuro(line.subtotal)}`}`
    ));
    rows.push(`Palés introducidos: ${formatNumber(quote.input_pallets)}`);
    rows.push(`Palés facturables: ${formatNumber(quote.billable_pallets)}`);
    rows.push(quote.total == null
      ? quote.lines.some((line) => line.origin_requires_consultation)
        ? "PRESUPUESTO APARTE: el origen está fuera del corredor automático."
        : "PRESUPUESTO PENDIENTE DE VALORACIÓN: hay una línea no calculable automáticamente."
      : `${consultationRequired ? "TOTAL PARCIAL" : "TOTAL PRESUPUESTO"}: ${formatEuro(quote.total)}`);
    if (consultationRequired) {
      rows.push("Hay líneas que requieren presupuesto aparte o valoración manual; no están incluidas en el total.");
    }
    return rows.join("\n");
  };

  const copyQuote = async () => {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(quoteText());
      setCopyMessage("Presupuesto copiado");
    } catch {
      setCopyMessage("No se pudo copiar. Selecciona el importe y cópialo manualmente.");
    }
    window.setTimeout(() => setCopyMessage(""), 3000);
  };

  const submitQuote = async (event) => {
    event.preventDefault();
    if (!validForSubmit) return;
    setSending(true);
    setCalculationError("");
    try {
      const { data } = await api.post("/pallet-quotes", {
        lines: quote.lines.map((line) => ({
          origin: line.origin,
          origin_manual: line.origin_manual,
          town: line.destination,
          pallets: line.pallets,
          weight_kg: line.weight_kg_per_pallet,
        })),
        ...form,
        consent,
        quote_accepted: !consultationRequired,
      });
      setSubmission(data);
      setConsent(false);
    } catch (error) {
      setCalculationError(requestError(error, "No se pudo enviar. Comprueba la conexión e inténtalo de nuevo."));
    } finally {
      setSending(false);
    }
  };

  const totalPalletsLabel = quote ? formatNumber(quote.input_pallets) : "—";
  const billablePalletsLabel = quote ? formatNumber(quote.billable_pallets) : "—";

  return (
    <>
      <section id="calculadora" className="scroll-mt-24 bg-[#f0f3f4] py-7 sm:py-10 lg:py-12" data-testid="pallet-calculator">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-7">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#697c84]">
                <span className="h-[2px] w-7 bg-[#e8aa14]" />
                Presupuesto de transporte · Girona
              </div>
              <h1 className="text-[clamp(1.8rem,4vw,2.75rem)] font-black leading-none tracking-[-.05em] text-[#082c3a]">
                Calcula tu presupuesto
              </h1>
            </div>
            <p className="max-w-[390px] text-sm leading-relaxed text-[#5c7079]">
              Elige origen y destino. Fuera del corredor, el envío pasa a presupuesto aparte.
            </p>
          </div>

          {ratesError ? (
            <div className="border border-red-200 bg-white p-5 text-sm font-semibold text-red-800" role="alert">{ratesError}</div>
          ) : ratesLoading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 border border-slate-200 bg-white text-sm text-slate-500">
              <SpinnerIcon size={19} className="animate-spin" aria-hidden="true" /> Cargando municipios y tarifas…
            </div>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-0 lg:border lg:border-slate-200">
              <div className="space-y-3 lg:bg-white lg:p-6 xl:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-3 lg:border-0 lg:px-0 lg:pt-0">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#163744]">
                    <PackageIcon size={18} className="text-[#087a98]" aria-hidden="true" />
                    {lines.length === 1 ? "Presupuesto · 1 línea" : `Presupuesto · ${lines.length} líneas`}
                  </div>
                  <span className="text-[11px] text-slate-500">Busca y selecciona origen y destino de la lista</span>
                </div>

                {lines.map((line, index) => (
                  <PalletShipmentLine
                    key={line.id}
                    line={line}
                    index={index}
                    towns={towns}
                    result={quote}
                    onChange={(changes) => updateLine(line.id, changes)}
                    onRemove={() => removeLine(line.id)}
                    canRemove={lines.length > 1}
                  />
                ))}

                {calculationError && !submission && (
                  <p className="border-l-2 border-red-600 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{calculationError}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={addLine}
                    disabled={lines.length >= 20}
                    className="inline-flex min-h-11 items-center gap-2 border border-[#173947] bg-white px-4 text-sm font-bold text-[#173947] transition hover:bg-[#f1f6f7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PlusIcon size={16} aria-hidden="true" /> Añadir destino
                  </button>
                  <div className="flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
                    {calculating && <SpinnerIcon size={16} className="animate-spin" aria-hidden="true" />}
                    {calculating ? "Actualizando presupuesto…" : quote ? "Cálculo actualizado" : "Completa destino, palés y peso"}
                  </div>
                </div>

                {quote && (
                  <div className="grid grid-cols-3 border border-slate-200 bg-[#f7f9fa] text-center" aria-live="polite">
                    <div className="border-r border-slate-200 px-2 py-3">
                      <strong className="block text-base text-[#173947]">{lines.length}</strong>
                      <span className="text-[10px] text-slate-500">líneas</span>
                    </div>
                    <div className="border-r border-slate-200 px-2 py-3">
                      <strong className="block text-base text-[#173947]">{totalPalletsLabel}</strong>
                      <span className="text-[10px] text-slate-500">palés introducidos</span>
                    </div>
                    <div className="px-2 py-3">
                      <strong className="block text-base text-[#173947]">{billablePalletsLabel}</strong>
                      <span className="text-[10px] text-slate-500">palés facturables</span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] leading-relaxed text-slate-500">
                  Los municipios de zonas 1–3 permiten calcular el envío automáticamente. Un origen de zonas 4–5 o fuera de la lista se envía como presupuesto aparte.
                  El importe reproduce la tarifa por palé proporcionada; no desglosa el IVA.
                </p>
              </div>

              <aside className="bg-[#062b39] p-5 text-white sm:p-6 lg:sticky lg:top-28 lg:min-h-[370px] lg:self-stretch lg:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#a7bbc2]">Tarifa por zona</div>
                    <p className="mt-2 text-sm text-[#d2dde1]">
                      {quote?.lines.length
                        ? quote.lines.map((line) => `${line.origin || "Origen"} → ${line.destination}`).join(" · ")
                        : "Completa una línea para calcular"}
                    </p>
                  </div>
                  <TruckIcon size={22} weight="duotone" className="shrink-0 text-[#f6bb26]" aria-hidden="true" />
                </div>

                <div className="mt-5 border-b border-white/15 pb-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[clamp(2.6rem,7vw,3.6rem)] font-black leading-none tracking-[-.07em] text-white" aria-live="polite">
                      {calculating ? "…" : quote ? quote.total == null ? "Aparte" : formatEuro(quote.total) : "—"}
                    </span>
                    <span className="text-xs text-[#a9bdc4]">
                      {quote?.total == null && quote
                        ? quote.lines.some((line) => line.origin_requires_consultation) ? "fuera del corredor" : "requiere valoración"
                        : consultationRequired ? "total parcial · consultar" : "presupuesto"}
                    </span>
                  </div>
                  {quote?.consultation_required && (
                    <p className="mt-2 text-xs leading-relaxed text-amber-200">
                      Algunas líneas requieren presupuesto aparte o valoración y no están incluidas en el total.
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-[#d0dce0]">
                  {quote?.lines.length ? quote.lines.map((line, index) => (
                    <div key={`${line.destination}-${index}`} className="flex justify-between gap-3">
                      <span className="min-w-0 truncate">Línea {index + 1} · Z{line.zone} · {formatEuro(line.unit_price)}/palé</span>
                      <strong>{line.subtotal == null ? "Consultar" : formatEuro(line.subtotal)}</strong>
                    </div>
                  )) : (
                    <p className="leading-relaxed text-[#d0dce0]">
                      Precio = palés facturables × tarifa de la zona de destino. El peso determina el factor aplicado.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => document.getElementById("aceptar-presupuesto")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  disabled={!quote || calculating}
                  className="mt-6 flex min-h-12 w-full items-center justify-between gap-3 bg-[#f6bb26] px-4 text-sm font-black text-[#102c38] transition hover:bg-[#ffd04d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {!quote
                    ? calculating ? "Calculando…" : "Completa el envío"
                    : consultationRequired ? "Solicitar valoración" : "Aceptar pedido"}
                  <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
                </button>
                <p className="mt-3 text-[10px] leading-relaxed text-[#a9bdc4]">
                  La tarifa automática se aplica con origen dentro del corredor. Los demás orígenes pasan a presupuesto aparte.
                </p>
                <button
                  type="button"
                  onClick={copyQuote}
                  disabled={!quote || calculating}
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 border border-white/25 px-3 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ClipboardTextIcon size={15} aria-hidden="true" /> Copiar presupuesto
                </button>
                {copyMessage && <p className="mt-2 text-center text-xs text-[#f6bb26]" role="status">{copyMessage}</p>}
              </aside>
            </div>
          )}

          {quote && (
            <form
              id="aceptar-presupuesto"
              onSubmit={submitQuote}
              className="mt-5 scroll-mt-28 border border-slate-200 bg-white p-4 sm:p-6 lg:mt-7 lg:p-8"
              data-testid="pallet-quote-form"
            >
              {submission ? (
                <div className="flex flex-col gap-4 border-l-4 border-emerald-600 bg-emerald-50 p-5 sm:flex-row sm:items-center">
                  <CheckCircleIcon size={28} className="shrink-0 text-emerald-700" weight="fill" aria-hidden="true" />
                  <div>
                    <h2 className="text-lg font-black text-emerald-950">
                      Solicitud recibida · Ref. {submission.reference}
                    </h2>
                    <p className="mt-1 text-sm text-emerald-900">
                      {submission.consultation_required
                        ? "Revisaremos las líneas pendientes de valoración y te contactaremos para confirmar el precio."
                        : "Hemos recibido el presupuesto aceptado. Te enviaremos la confirmación por email."}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[.18em] text-[#71838b]">Último paso</div>
                      <h2 className="mt-1 text-xl font-black tracking-tight text-[#123443]">
                        {consultationRequired ? "Solicita una valoración" : "Aceptar presupuesto"}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500">Te enviaremos la referencia a tu email.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor="customer-name">Nombre y apellidos *</Label>
                      <input id="customer-name" className={fieldClass} autoComplete="name" maxLength={160} required value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="customer-phone">Teléfono *</Label>
                      <input id="customer-phone" className={fieldClass} autoComplete="tel" type="tel" maxLength={40} required value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="customer-email">Email *</Label>
                      <input id="customer-email" className={fieldClass} autoComplete="email" type="email" maxLength={254} required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="customer-company">Empresa</Label>
                      <input id="customer-company" className={fieldClass} autoComplete="organization" maxLength={160} value={form.empresa} onChange={(event) => setForm({ ...form, empresa: event.target.value })} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <Label htmlFor="customer-comments">Comentarios / dirección de recogida</Label>
                      <textarea
                        id="customer-comments"
                        className="mt-1.5 min-h-20 w-full rounded-sm border border-slate-300 bg-white px-3.5 py-3 text-sm text-[#102d3a] outline-none transition focus:border-[#087a98] focus:ring-2 focus:ring-[#087a98]/15"
                        maxLength={2000}
                        value={form.comentarios}
                        onChange={(event) => setForm({ ...form, comentarios: event.target.value })}
                      />
                    </div>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-3 border border-slate-200 bg-[#f7f9fa] p-3.5 text-xs leading-relaxed text-slate-700">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#087a98]"
                    />
                    <span>
                      {consultationRequired
                        ? "Solicito presupuesto aparte o valoración de las líneas marcadas para consultar y acepto enviar estos datos para que ViaNordTrans pueda gestionar mi solicitud."
                        : "He revisado y acepto este presupuesto y autorizo el envío de mis datos para tramitar el pedido."}
                      {" "}Consulta la{" "}
                      <a href="/privacidad" target="_blank" rel="noreferrer" className="font-bold text-[#087a98] underline">política de privacidad</a>.
                    </span>
                  </label>

                  {calculationError && (
                    <p className="mt-3 text-sm text-red-700" role="alert">{calculationError}</p>
                  )}

                  <div className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-xs text-slate-500">
                      <ClockIcon size={15} className="mr-1 inline align-[-3px]" aria-hidden="true" />
                      {consultationRequired ? "El precio final se confirma tras valorar esas líneas." : "La solicitud queda registrada y recibirás una referencia."}
                    </p>
                    <button
                      type="submit"
                      disabled={!validForSubmit}
                      className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#082c3a] px-6 text-sm font-black text-white transition hover:bg-[#0b4053] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {sending ? <SpinnerIcon size={17} className="animate-spin" aria-hidden="true" /> : <CheckIcon size={17} weight="bold" aria-hidden="true" />}
                      {sending ? "Enviando…" : consultationRequired ? "Enviar para valorar" : "Aceptar pedido y enviar"}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <details id="zonas" className="mt-4 scroll-mt-24 border border-slate-200 bg-white">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 text-sm font-bold text-[#173947] [&::-webkit-details-marker]:hidden sm:px-5">
              <span>Ver zonas y municipios · {towns.length} municipios</span>
              <CaretDownIcon size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
            </summary>
            <div className="grid gap-px border-t border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-3">
              {zones.map((zone) => (
                <div key={zone.id} className="bg-white p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-black text-[#133442]">Zona {zone.id} · {zone.name}</h2>
                    <strong className="shrink-0 text-sm text-[#123443]">{formatEuro(zone.price)}/palé</strong>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{zone.coverage}</p>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
                    {towns.filter((town) => town.zone === zone.id).map((town) => town.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      <div className="h-1 bg-[#f6bb26]" aria-hidden="true" />
    </>
  );
}
