import { useEffect, useState } from "react";
import { WhatsappLogoIcon, XIcon, ChatCircleDotsIcon } from "@phosphor-icons/react";
import { api } from "@/lib/api";

export const FloatingContact = () => {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState({ whatsapp: "" });

  useEffect(() => {
    api.get("/contact-info").then((r) => setInfo(r.data)).catch(() => {});
  }, []);

  const wa = info.whatsapp || "34673392259";
  const msg = encodeURIComponent("Hola, me gustaría solicitar un presupuesto de transporte.");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" data-testid="floating-contact">
      {open && (
        <div className="flex flex-col gap-2 fade-up">
          <a
            href={`https://wa.me/${wa}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="floating-whatsapp"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold pl-4 pr-5 h-12 transition-colors duration-150 shadow-lg"
          >
            <WhatsappLogoIcon size={22} weight="fill" /> WhatsApp
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid="floating-toggle"
        className={`relative w-14 h-14 grid place-items-center text-white shadow-xl transition-colors duration-150 ${
          open ? "bg-[#0F172A]" : "bg-[#16A34A] pulse-ring"
        }`}
        aria-label="Contacto rápido"
      >
        {open ? <XIcon size={24} weight="bold" /> : <ChatCircleDotsIcon size={26} weight="fill" />}
      </button>
    </div>
  );
};

export default FloatingContact;
