import { Link } from "react-router-dom";
import { TruckIcon, ListIcon } from "@phosphor-icons/react";
import { useState } from "react";

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
    <header
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200"
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
          <span className="bg-[#0F172A] text-[#FBBF24] w-9 h-9 grid place-items-center">
            <TruckIcon weight="fill" size={20} />
          </span>
          <div className="leading-none">
            <div className="font-display font-black tracking-tighter text-[#0F172A] text-lg">TransGirBcn</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold">Girona ⇄ Barcelona</div>
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
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
