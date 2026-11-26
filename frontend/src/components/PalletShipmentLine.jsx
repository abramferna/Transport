import { useEffect, useMemo, useRef, useState } from "react";
import { MapPinIcon, MinusIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

const normalize = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();

export const decimalInput = (value) => {
  const number = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(number) ? number : null;
};

export const requestError = (error, fallback) => {
  const message = error?.response?.data?.error ?? error?.response?.data?.detail;
  if (Array.isArray(message)) {
    const messages = message.map((item) => item?.msg).filter(Boolean);
    return messages.length ? messages.join(" ") : fallback;
  }
  return typeof message === "string" && message ? message : fallback;
};

export const formatNumber = (value, digits = 2) =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: digits }).format(value);

export const formatEuro = (value) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);

export const fieldClass =
  "mt-1.5 h-12 w-full rounded-sm border border-slate-300 bg-white px-3.5 text-[15px] font-medium text-[#102d3a] outline-none transition focus:border-[#087a98] focus:ring-2 focus:ring-[#087a98]/15";

export const Label = ({ children, htmlFor, optional }) => (
  <label htmlFor={htmlFor} className="text-[11px] font-extrabold uppercase tracking-[.12em] text-[#536872]">
    {children}{optional && <span className="ml-1.5 normal-case font-medium tracking-normal text-slate-400">· sin coste</span>}
  </label>
);

function TownPicker({ value, towns, onChange, lineIndex, selectedPrice }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const editing = useRef(false);
  const rootRef = useRef(null);
  const matches = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return towns.slice(0, 8);
    return towns.filter((town) => normalize(town.name).includes(needle)).slice(0, 8);
  }, [query, towns]);

  useEffect(() => {
    if (!editing.current) setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        editing.current = false;
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Label htmlFor={`destination-${lineIndex}`}>Destino</Label>
      <div className="relative mt-1.5">
        <MapPinIcon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id={`destination-${lineIndex}`}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`destination-options-${lineIndex}`}
          aria-autocomplete="list"
          aria-label={`Población de destino, línea ${lineIndex}`}
          placeholder="Busca una población…"
          className={`${fieldClass} pl-9 pr-16`}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            editing.current = true;
            if (value) onChange("");
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && matches.length === 1) {
              event.preventDefault();
              onChange(matches[0].name);
              setQuery(matches[0].name);
              editing.current = false;
              setOpen(false);
            }
          }}
        />
        {selectedPrice != null && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
            {formatEuro(selectedPrice)}
          </span>
        )}
      </div>
      {open && (
        <ul
          id={`destination-options-${lineIndex}`}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto border border-slate-200 bg-white py-1 shadow-xl"
        >
          {matches.length ? matches.map((town) => (
            <li key={town.name} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={town.name === value}
                onClick={() => {
                  onChange(town.name);
                  setQuery(town.name);
                  editing.current = false;
                  setOpen(false);
                }}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-sm hover:bg-slate-50 focus:bg-slate-50"
              >
                <span className="font-semibold text-[#163443]">{town.name}</span>
                <span className="text-xs text-slate-500">
                  Zona {town.zone} · {formatEuro(town.price)}/palé
                </span>
              </button>
            </li>
          )) : (
            <li className="px-3.5 py-3 text-sm text-slate-500">No está en la tarifa automática. Contacta para consultar.</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function PalletShipmentLine({ line, index, towns, result, onChange, onRemove, canRemove }) {
  const destination = towns.find((town) => town.name === line.town);
  const lineResult = result?.lines?.[index];
  const palletsValue = decimalInput(line.pallets);
  const weightValue = decimalInput(line.weight_kg);
  const overWeight = weightValue > 1300;
  const invalidPallets = line.pallets.trim() !== "" && (palletsValue == null || palletsValue < 0.1);
  const invalidWeight = line.weight_kg.trim() !== "" && (weightValue == null || weightValue < 1);

  return (
    <article className="border border-slate-200 bg-white" aria-label={`Línea de envío ${index + 1}`}>
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#f7f9fa] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center bg-[#092c3a] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-sm font-bold text-[#183846]">Punto de entrega</span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 items-center gap-1.5 px-2 text-xs font-bold text-slate-500 transition hover:bg-white hover:text-red-700"
            aria-label={`Eliminar línea ${index + 1}`}
          >
            <TrashIcon size={15} aria-hidden="true" /> Quitar
          </button>
        )}
      </div>

      <div className="grid gap-x-5 gap-y-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-12 lg:items-end">
        <div className="sm:col-span-2 lg:col-span-3">
          <Label htmlFor={`origin-${index}`} optional>Origen</Label>
          <input
            id={`origin-${index}`}
            className={fieldClass}
            value={line.origin}
            maxLength={160}
            placeholder="Población o dirección"
            onChange={(event) => onChange({ origin: event.target.value })}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <TownPicker
            value={line.town}
            towns={towns}
            onChange={(town) => onChange({ town })}
            lineIndex={index + 1}
            selectedPrice={destination?.price}
          />
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor={`pallets-${index}`}>N.º de palés</Label>
          <div className="mt-1.5 flex h-12 border border-slate-300 bg-white">
            <button
              type="button"
              className="grid w-10 shrink-0 place-items-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              onClick={() => onChange({ pallets: String(Math.max(0.1, (decimalInput(line.pallets) || 1) - 1)) })}
              aria-label={`Quitar un palé en línea ${index + 1}`}
            >
              <MinusIcon size={15} />
            </button>
            <input
              id={`pallets-${index}`}
              className="min-w-0 w-full border-x border-slate-200 text-center text-sm font-bold text-[#102d3a] outline-none focus:bg-slate-50"
              type="text"
              inputMode="decimal"
              value={line.pallets}
              onChange={(event) => onChange({ pallets: event.target.value })}
              aria-label={`Número de palés, línea ${index + 1}`}
            />
            <button
              type="button"
              className="grid w-10 shrink-0 place-items-center text-slate-600 transition hover:bg-slate-50"
              onClick={() => onChange({ pallets: String(Math.min(999, (decimalInput(line.pallets) || 0) + 1)) })}
              aria-label={`Añadir un palé en línea ${index + 1}`}
            >
              <PlusIcon size={15} />
            </button>
          </div>
          <p className={`mt-1 text-[10px] ${invalidPallets ? "text-red-700" : "text-slate-400"}`}>
            {invalidPallets ? "El mínimo es 0,1 palés." : "Se admiten fracciones"}
          </p>
        </div>

        <div className="lg:col-span-3">
          <Label htmlFor={`weight-${index}`}>Peso de cada palé</Label>
          <div className="relative mt-1.5">
            <input
              id={`weight-${index}`}
              type="text"
              inputMode="decimal"
              className={`${fieldClass} pr-12`}
              value={line.weight_kg}
              placeholder="500"
              onChange={(event) => onChange({ weight_kg: event.target.value })}
              aria-label={`Peso por palé en kg, línea ${index + 1}`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
          </div>
          {invalidWeight && <p className="mt-1 text-[10px] text-red-700">El peso mínimo es 1 kg por palé.</p>}
        </div>

        {overWeight ? (
          <div className="sm:col-span-2 lg:col-span-12 border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900" role="status">
            Más de 1.300 kg por palé: esta línea requiere una valoración personalizada.
          </div>
        ) : lineResult ? (
          <div className="sm:col-span-2 lg:col-span-12 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <span>
              Zona {lineResult.zone} · factor ×{formatNumber(lineResult.factor, 1)} · {formatNumber(lineResult.billable_pallets, 2)} palés facturables
            </span>
            <strong className="text-sm text-[#143746]">{formatEuro(lineResult.subtotal)}</strong>
          </div>
        ) : null}
      </div>
    </article>
  );
}
