import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MagnifyingGlassIcon, PackageIcon, TruckIcon, CheckCircleIcon, MapPinLineIcon, ClockIcon, XCircleIcon,
} from "@phosphor-icons/react";

const STEPS = [
  { id: "pendiente", label: "Solicitud recibida", icon: PackageIcon },
  { id: "confirmado", label: "Confirmada", icon: CheckCircleIcon },
  { id: "en_ruta", label: "En ruta", icon: TruckIcon },
  { id: "entregado", label: "Entregado", icon: MapPinLineIcon },
];

export default function Tracking() {
  const { reference: refParam } = useParams();
  const navigate = useNavigate();
  const [ref, setRef] = useState(refParam || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (r) => {
    if (!r) return;
    setLoading(true);
    try {
      const res = await api.get(`/quotes/${r.toUpperCase()}`);
      setData(res.data);
    } catch {
      toast.error("Referencia no encontrada");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (refParam) search(refParam); /* eslint-disable-next-line */ }, [refParam]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!ref) return;
    navigate(`/seguimiento/${ref.toUpperCase()}`);
    search(ref);
  };

  const stepIndex = data ? STEPS.findIndex((s) => s.id === data.status) : -1;
  const isCancelled = data?.status === "cancelado";

  return (
    <div className="min-h-screen bg-white" data-testid="tracking-page">
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 lg:px-8 py-16">
        <div className="label-eyebrow mb-2">Seguimiento de envío</div>
        <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
          Consulta tu envío.
        </h1>
        <p className="mt-4 text-slate-600">Introduce tu referencia (formato TR240312AB12) para ver el estado actualizado.</p>

        <form onSubmit={onSubmit} className="mt-8 flex gap-px bg-slate-200 border border-slate-300" data-testid="tracking-form">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="TR________"
            className="flex-1 px-4 h-12 outline-none font-mono uppercase tracking-wider text-[#0F172A] bg-white"
            data-testid="tracking-input"
          />
          <button
            type="submit"
            data-testid="tracking-submit"
            className="bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-bold px-6 h-12 inline-flex items-center gap-2 transition-colors duration-150"
          >
            <MagnifyingGlassIcon size={18} weight="bold" /> Buscar
          </button>
        </form>

        {loading && <div className="mt-10 text-slate-500">Cargando…</div>}

        {data && (
          <div className="mt-10 border border-slate-200" data-testid="tracking-result">
            <div className="bg-[#0F172A] text-white p-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="label-eyebrow text-[#FBBF24]">Referencia</div>
                <div className="font-mono font-bold text-2xl mt-1">{data.reference}</div>
              </div>
              <div className="text-right">
                <div className="label-eyebrow text-slate-400">Cliente</div>
                <div className="font-display font-bold text-xl mt-1">{data.nombre}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 border-b border-slate-200">
              <Info k="Origen" v={data.origen} />
              <Info k="Destino" v={data.destino} />
              <Info k="Tipo" v={data.tipo === "b2b" ? "Plan B2B" : "Servicio puntual"} />
            </div>

            <div className="p-6 sm:p-8">
              {isCancelled ? (
                <div className="border border-slate-300 p-6 flex items-center gap-3 text-slate-700">
                  <XCircleIcon size={28} className="text-slate-500" />
                  <div>
                    <div className="font-bold">Envío cancelado</div>
                    <div className="text-sm text-slate-500">Si crees que es un error, contáctanos.</div>
                  </div>
                </div>
              ) : (
                <ol className="relative space-y-6 ml-2">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const reached = i <= stepIndex;
                    return (
                      <li key={s.id} className="relative pl-12">
                        {i < STEPS.length - 1 && (
                          <span className={`absolute left-[14px] top-9 bottom-[-24px] w-0.5 ${reached && i < stepIndex ? "bg-[#1E3A8A]" : "bg-slate-200"}`} />
                        )}
                        <span className={`absolute left-0 top-0 w-8 h-8 grid place-items-center ${reached ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                          <Icon size={16} weight={reached ? "fill" : "regular"} />
                        </span>
                        <div className={`font-display font-bold ${reached ? "text-[#0F172A]" : "text-slate-400"}`}>{s.label}</div>
                        {i === stepIndex && (
                          <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1">
                            <ClockIcon size={12} /> Actualizado {new Date(data.updated_at).toLocaleString("es-ES")}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const Info = ({ k, v }) => (
  <div className="bg-white p-5">
    <div className="label-eyebrow">{k}</div>
    <div className="font-semibold text-[#0F172A] mt-1">{v || "—"}</div>
  </div>
);
