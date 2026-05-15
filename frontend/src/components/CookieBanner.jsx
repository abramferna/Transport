import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CookieIcon, XIcon } from "@phosphor-icons/react";

const CONSENT_KEY = "vnt_cookie_consent";

export const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F172A] text-white border-t-2 border-[#FBBF24] shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <CookieIcon size={22} weight="fill" className="text-[#FBBF24] flex-shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-slate-300 flex-1 leading-relaxed">
          Usamos cookies técnicas estrictamente necesarias para el funcionamiento del sitio. No utilizamos cookies de seguimiento ni publicidad.{" "}
          <Link to="/cookies" className="text-[#FBBF24] underline underline-offset-2 hover:text-amber-300 transition-colors">
            Más información
          </Link>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="h-9 px-4 text-xs font-bold text-slate-400 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
          >
            Solo esenciales
          </button>
          <button
            onClick={accept}
            className="h-9 px-5 text-xs font-bold bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
