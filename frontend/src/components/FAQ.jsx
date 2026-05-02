import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";

const FAQS = [
  {
    q: "¿Cómo funciona el recargo a partir de las 18h?",
    a: "Cualquier servicio cuya hora de recogida sea a partir de las 18:00 o antes de las 07:00 lleva un recargo del 25% sobre el subtotal. La calculadora aplica este incremento de forma automática y transparente.",
  },
  {
    q: "¿Cuál es la diferencia entre 'Plan semanal' y 'Servicio puntual'?",
    a: "Los planes semanales (B2B) son tarifas planas con días pactados — ideales para profesionales con envíos recurrentes. El servicio puntual (B2C) se factura por viaje, con calculadora abierta y sin compromiso.",
  },
  {
    q: "¿Hacéis entregas puerta a puerta?",
    a: "Sí. La modalidad puerta a puerta tiene un coste fijo adicional de 12€ e incluye la subida o bajada de mercancía hasta acceso a planta baja. Para pisos sin ascensor consultar.",
  },
  {
    q: "¿Cubrís solo Girona y Barcelona?",
    a: "Nuestro corredor principal es Girona ⇄ Barcelona, pero servimos también cercanías (Figueres, Granollers, Mataró, Hospitalet, Cornellà…). Para rutas fuera de zona se aplica tarifa por km.",
  },
  {
    q: "¿Qué pasa si necesito el envío para hoy?",
    a: "Selecciona la opción 'Urgente' en la calculadora. Disponibilidad sujeta a confirmación en menos de 30 minutos. Recargo del 30%.",
  },
  {
    q: "¿Cómo recibo el seguimiento?",
    a: "Tras enviar la solicitud recibirás una referencia (ej. TR240312AB12). Con ella puedes consultar el estado en cualquier momento desde la página de Seguimiento.",
  },
  {
    q: "¿Está la mercancía asegurada?",
    a: "Sí, todos los servicios incluyen seguro de mercancías hasta el valor declarado. Para cargas de alto valor es necesario aviso previo.",
  },
];

export const FAQ = () => (
  <section id="faq" className="py-20 lg:py-28 bg-white" data-testid="faq-section">
    <div className="max-w-7xl mx-auto px-5 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="label-eyebrow mb-3">Preguntas frecuentes</div>
          <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-[#0F172A] leading-[0.95]">
            Todo claro,<br />sin letra pequeña.
          </h2>
          <p className="mt-5 text-slate-600">¿No encuentras tu duda? Escríbenos por WhatsApp o Telegram, respondemos en minutos.</p>
        </div>
        <div className="lg:col-span-8">
          <Accordion type="single" collapsible className="border border-slate-200" data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-200 last:border-b-0">
                <AccordionTrigger
                  className="px-5 py-5 hover:bg-slate-50 hover:no-underline text-left font-display font-bold text-[#0F172A] text-base"
                  data-testid={`faq-q-${i}`}
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 text-slate-600 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  </section>
);

export default FAQ;
