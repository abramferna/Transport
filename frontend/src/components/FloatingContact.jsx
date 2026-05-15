import { WhatsappLogoIcon } from "@phosphor-icons/react";

export const FloatingContact = () => {
  const wa = "34673392259";
  const msg = encodeURIComponent("Hola, me gustaría solicitar un presupuesto de transporte.");

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="floating-contact">
      <a
        href={`https://wa.me/${wa}?text=${msg}`}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="floating-whatsapp"
        className="w-14 h-14 grid place-items-center bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-xl transition-colors duration-150 pulse-ring"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsappLogoIcon size={28} weight="fill" />
      </a>
    </div>
  );
};

export default FloatingContact;
