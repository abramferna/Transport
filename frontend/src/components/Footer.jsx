import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export const Footer = () => (
  <footer className="bg-[#0F172A] text-slate-300" data-testid="main-footer">
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <Logo size={36} />
            <div>
              <div className="font-display font-black tracking-tighter text-white text-lg leading-none">vianord</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-slate-500 font-bold mt-1">Girona · Barcelona · Jonquera</div>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-md">Vianord. Transporte de mercancías especializado en el corredor norte de Catalunya: Girona, Barcelona y La Jonquera. Cargas semanales para profesionales y servicios puntuales paletizados con flota propia.</p>
        </div>

        <div>
          <div className="label-eyebrow text-slate-500 mb-4">Plataforma</div>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#modelos" className="hover:text-[#FBBF24] transition-colors">Servicios</a></li>
            <li><a href="/#calculadora" className="hover:text-[#FBBF24] transition-colors">Calculadora</a></li>
            <li><a href="/#cobertura" className="hover:text-[#FBBF24] transition-colors">Cobertura</a></li>
            <li><Link to="/seguimiento" className="hover:text-[#FBBF24] transition-colors">Seguimiento</Link></li>
            <li><Link to="/admin" className="hover:text-[#FBBF24] transition-colors">Panel admin</Link></li>
          </ul>
        </div>

        <div>
          <div className="label-eyebrow text-slate-500 mb-4">Contacto</div>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2"><PhoneIcon size={14} /> +34 600 000 000</li>
            <li className="flex items-center gap-2"><EnvelopeIcon size={14} /> hola@vianord.cat</li>
            <li className="flex items-center gap-2"><MapPinIcon size={14} /> Girona · Barcelona</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>© {new Date().getFullYear()} Vianord. Todos los derechos reservados.</div>
        <div className="font-mono">v1.0 · construido en Catalunya</div>
      </div>
    </div>
  </footer>
);

export default Footer;
