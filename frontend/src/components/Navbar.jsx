import { Link } from "react-router-dom";
import { ListIcon, WhatsappLogoIcon, EnvelopeIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const WHATSAPP_URL = "https://wa.me/34673392259?text=Hola%2C%20soy%20transportista%20y%20me%20interesa%20unirme%20a%20la%20red%20ViaNordTrans.";
const EMAIL_URL = "mailto:ViaNord@gmail.com?subject=Quiero%20unirme%20a%20la%20red%20ViaNordTrans";

const items = [
  { id: "modelos", label: "Servicios" },
  { id: "calculadora", label: "Calculadora" },
  { id: "cobertura", label: "Cobertura" },
  { id: "flota", label: "Flota" },
  { id: "faq", label: "FAQ" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40" data-testid="main-navbar">
      {/* Announcement bar */}
      <div className="bg-[#0F172A] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <p className="text-[11px] text-slate-400 leading-snug hidden sm:block">
            <span className="text-white font-medium">ViaNordTrans</span> resuelve envíos urgentes y necesidades recurrentes de transporte para empresas, con eficiencia, rapidez y precios competitivos.
          </p>
          <div className="flex items-center gap-3 ml-auto flex-shrink-0">
            <span className="text-[11px] text-slate-400 hidden sm:inline">¿Transportista? Únete a nuestra red →</span>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-bold px-2.5 py-1 transition-colors duration-150"
              aria-label="Contactar por WhatsApp"
            >
              <WhatsappLogoIcon size={13} weight="fill" /> WhatsApp
            </a>
            <a
              href={EMAIL_URL}
              className="inline-flex items-center gap-1.5 border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white text-[11px] font-bold px-2.5 py-1 transition-colors duration-150"
              aria-label="Contactar por email"
            >
              <EnvelopeIcon size={13} weight="fill" /> Email
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="backdrop-blur-xl bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
            <Logo size={36} />
            <div className="leading-none">
              <div className="font-display font-black tracking-tighter text-[#0F172A] text-lg">ViaNordTrans</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold">Girona · Barcelona · Jonquera</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {items.map((it) => (
              <a
                key={it.id}
                href={`#${it.id}`}
                data-testid={`nav-link-${it.id}`}
                className="text-sm font-medium text-slate-700 hover:text-[#1E3A8A] transition-colors duration-150"
              >
                {it.label}
              </a>
            ))}
            <Link
              to="/seguimiento"
              data-testid="nav-link-tracking"
              className="text-sm font-medium text-slate-700 hover:text-[#1E3A8A] transition-colors duration-150"
            >
              Seguimiento
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#calculadora"
              data-testid="nav-cta-quote"
              className="hidden sm:inline-flex bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-bold text-sm px-4 h-10 items-center transition-colors duration-150"
            >
              Pedir presupuesto
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden w-10 h-10 grid place-items-center border border-slate-300"
              data-testid="nav-mobile-toggle"
              aria-label="Menú"
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-5 py-4 flex flex-col gap-3">
              {items.map((it) => (
                <a
                  key={it.id}
                  href={`#${it.id}`}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium py-2"
                >
                  {it.label}
                </a>
              ))}
              <Link to="/seguimiento" className="text-sm font-medium py-2">Seguimiento</Link>
              <div className="border-t border-slate-100 pt-3 flex gap-3">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3 py-2">
                  <WhatsappLogoIcon size={14} weight="fill" /> Transportistas
                </a>
                <a href={EMAIL_URL}
                  className="inline-flex items-center gap-1.5 border border-slate-300 text-slate-600 text-xs font-bold px-3 py-2">
                  <EnvelopeIcon size={14} weight="fill" /> Email
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
