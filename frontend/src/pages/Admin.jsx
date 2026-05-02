import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  GaugeIcon, BuildingOfficeIcon, HouseIcon, ClockCountdownIcon, ArrowClockwiseIcon, EnvelopeSimpleIcon, PhoneIcon,
} from "@phosphor-icons/react";

const STATUS_OPTIONS = [
  { id: "pendiente", label: "Pendiente" },
  { id: "confirmado", label: "Confirmado" },
  { id: "en_ruta", label: "En ruta" },
  { id: "entregado", label: "Entregado" },
  { id: "cancelado", label: "Cancelado" },
];

const STATUS_COLORS = {
  pendiente: "bg-[#FBBF24] text-[#0F172A]",
  confirmado: "bg-[#2563EB] text-white",
  en_ruta: "bg-[#1E3A8A] text-white",
  entregado: "bg-[#16A34A] text-white",
  cancelado: "bg-slate-400 text-white",
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, q] = await Promise.all([api.get("/stats"), api.get("/quotes")]);
      setStats(s.data);
      setQuotes(q.data);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (ref, newStatus) => {
    try {
      await api.patch(`/quotes/${ref}/status`, { status: newStatus });
      toast.success("Estado actualizado");
      load();
      setSelected(null);
    } catch {
      toast.error("No se pudo actualizar");
    }
  };

  const filtered = quotes.filter((q) => filter === "all" || q.tipo === filter);

  return (
    <div className="min-h-screen bg-[#F1F5F9]" data-testid="admin-page">
      <Navbar />
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="label-eyebrow mb-1">Panel administrativo</div>
            <h1 className="font-display font-black tracking-tighter text-3xl sm:text-4xl text-[#0F172A]">Solicitudes recibidas</h1>
          </div>
          <button
            onClick={load}
            data-testid="admin-refresh"
            className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-bold px-4 h-10 transition-colors duration-150"
          >
            <ArrowClockwiseIcon size={16} weight="bold" /> Actualizar
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200 mb-8" data-testid="admin-stats">
          <Stat icon={<GaugeIcon size={22} weight="duotone" />} label="Total" value={stats?.total ?? "—"} />
          <Stat icon={<BuildingOfficeIcon size={22} weight="duotone" />} label="B2B" value={stats?.b2b ?? "—"} accent="#FBBF24" />
          <Stat icon={<HouseIcon size={22} weight="duotone" />} label="B2C" value={stats?.b2c ?? "—"} accent="#1E3A8A" />
          <Stat icon={<ClockCountdownIcon size={22} weight="duotone" />} label="Pendientes" value={stats?.pendientes ?? "—"} accent="#DC2626" />
        </div>

        <div className="bg-white border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 flex-wrap">
            {[
              { id: "all", label: "Todas" },
              { id: "b2b", label: "B2B" },
              { id: "b2c", label: "B2C" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                data-testid={`admin-filter-${f.id}`}
                className={`text-xs font-bold px-3 h-8 transition-colors duration-150 ${
                  filter === f.id ? "bg-[#0F172A] text-white" : "bg-white border border-slate-300 hover:bg-slate-50"
                }`}
              >{f.label}</button>
            ))}
            <span className="ml-auto text-xs text-slate-500 font-mono">{filtered.length} resultados</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="admin-table">
              <thead>
                <tr className="text-left">
                  {["Ref.", "Tipo", "Cliente", "Ruta", "Estimado", "Fecha", "Estado", ""].map((h) => (
                    <th key={h} className="label-eyebrow px-4 py-3 border-b border-slate-200 bg-[#F8FAFC]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Cargando…</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No hay solicitudes todavía.</td></tr>}
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(q)} data-testid={`admin-row-${q.reference}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold">{q.reference}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${q.tipo === "b2b" ? "bg-[#FBBF24] text-[#0F172A]" : "bg-[#1E3A8A] text-white"}`}>{q.tipo}</span></td>
                    <td className="px-4 py-3"><div className="font-semibold">{q.nombre}</div><div className="text-xs text-slate-500">{q.empresa || q.email}</div></td>
                    <td className="px-4 py-3 text-slate-700">{q.origen} → {q.destino}</td>
                    <td className="px-4 py-3 font-mono">{q.estimated_price ? `${q.estimated_price.toFixed(2)}€` : (q.plan_id ? q.plan_id : "—")}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(q.created_at).toLocaleString("es-ES")}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${STATUS_COLORS[q.status]}`}>{q.status}</span></td>
                    <td className="px-4 py-3 text-right text-slate-400">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => setSelected(null)} data-testid="admin-detail-modal">
            <div className="bg-white w-full max-w-2xl border border-slate-200 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-[#0F172A] text-white p-6 flex items-start justify-between gap-4">
                <div>
                  <div className="label-eyebrow text-[#FBBF24]">Solicitud · {selected.tipo.toUpperCase()}</div>
                  <div className="font-display font-black text-3xl mt-2">{selected.reference}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none" data-testid="admin-detail-close">×</button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Detail k="Nombre" v={selected.nombre} />
                <Detail k="Empresa" v={selected.empresa} />
                <Detail k="Email" v={<a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1 text-[#1E3A8A] hover:underline"><EnvelopeSimpleIcon size={13} /> {selected.email}</a>} />
                <Detail k="Teléfono" v={<a href={`tel:${selected.telefono}`} className="inline-flex items-center gap-1 text-[#1E3A8A] hover:underline"><PhoneIcon size={13} /> {selected.telefono}</a>} />
                <Detail k="Origen" v={selected.origen} />
                <Detail k="Destino" v={selected.destino} />
                <Detail k="Ruta" v={selected.route} />
                <Detail k="Servicio" v={selected.servicio} />
                <Detail k="Peso" v={selected.peso_kg ? `${selected.peso_kg} kg` : null} />
                <Detail k="Hora preferida" v={selected.hora_preferida != null ? `${String(selected.hora_preferida).padStart(2,"0")}:00` : null} />
                <Detail k="Plan" v={selected.plan_id} />
                <Detail k="Estimado" v={selected.estimated_price ? `${selected.estimated_price.toFixed(2)}€` : null} />
                <div className="sm:col-span-2"><Detail k="Descripción" v={selected.descripcion} /></div>
              </div>
              <div className="px-6 pb-6">
                <div className="label-eyebrow mb-3">Cambiar estado</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-slate-200 border border-slate-200">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateStatus(selected.reference, s.id)}
                      data-testid={`admin-status-${s.id}`}
                      className={`p-3 text-xs font-bold transition-colors duration-150 ${selected.status === s.id ? "bg-[#0F172A] text-white" : "bg-white hover:bg-slate-50"}`}
                    >{s.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const Stat = ({ icon, label, value, accent = "#0F172A" }) => (
  <div className="bg-white p-5">
    <div className="flex items-center gap-2"><span style={{ color: accent }}>{icon}</span><span className="label-eyebrow">{label}</span></div>
    <div className="font-display font-black text-4xl mt-2 text-[#0F172A]">{value}</div>
  </div>
);

const Detail = ({ k, v }) => (
  <div className="border-b border-slate-200 pb-2">
    <div className="label-eyebrow mb-1">{k}</div>
    <div className="font-medium text-[#0F172A]">{v || <span className="text-slate-400">—</span>}</div>
  </div>
);
