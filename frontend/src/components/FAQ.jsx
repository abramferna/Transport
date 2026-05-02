import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";

const FAQS = [
  {
    q: "¿Cómo funciona el recargo a partir de las 18h?",
    a: "Cualquier servicio cuya hora de recogida sea a partir de las 18:00 o antes de las 07:00 lleva un recargo del 25% sobre el subtotal. La calculadora aplica este incremento de forma automática y transparente.",
  },
  {
    q: "¿Y los sábados, domingos o festivos?",
    a: "En fin de semana o festivos aplicamos doble recargo automático: la ruta base se multiplica ×2 (mínimo 200€ por salida) y todos los extras (peso, volumen, modalidad) suben un 15%. El recargo nocturno se aplica encima si la hora es ≥18h. La calculadora lo refleja en tiempo real.",
  },
  {
    q: "¿Cuál es la diferencia entre 'Plan semanal' y 'Servicio puntual'?",
    a: "Los planes semanales (B2B) son tarifas planas con días pactados — ideales para profesionales con envíos recurrentes. El servicio puntual (B2C) se factura por viaje, con calculadora abierta y sin compromiso.",
  },
  {
    q: "¿Hacéis entregas puerta a puerta?",
    a: "Sí, en polígonos y direcciones con acceso para camión 12T. Disponemos de plataforma elevadora para descarga sin muelle (+35€). No realizamos reparto urbano ni entregas en pisos.",
  },
  {
    q: "¿Cubrís solo Girona y Barcelona?",
    a: "Operamos dos corredores principales desde nuestra base en Girona: hacia el sur (Girona ⇄ Barcelona, 100 km) y hacia el norte (Girona ⇄ La Jonquera, frontera francesa, 60 km). Servimos más de 50 municipios entre Alt Empordà, Selva, Maresme, Vallès, Barcelonès y Baix Llobregat. No hacemos reparto urbano dentro de las ciudades, sí entregas en polígonos.",
  },
  {
    q: "¿Qué pasa si necesito el envío para hoy?",
    a: "Selecciona la opción 'Urgente' en la calculadora. Disponibilidad sujeta a confirmación en menos de 30 minutos. Recargo del 30%.",
  },
  {
    q: "¿Por qué se factura por volumen y no solo por peso?",
    a: "Aplicamos peso facturable = max(peso real, volumen × 333 kg/m³). Una carga ligera pero voluminosa (cajas grandes, mobiliario) ocupa espacio que impide aceptar otras cargas, por lo que el precio refleja el espacio realmente utilizado del camión. La calculadora lo aplica de forma transparente.",
  },
  {
    q: "¿Qué tamaño de camión usáis?",
    a: "Toda nuestra flota son camiones rígidos de 12 toneladas (MMA) — capacidad útil máxima de 6.000 kg y 34 m³. Disponibles en versión furgón cerrado, lonas (tautliner), plataforma elevadora e isotermo bajo demanda.",
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
