import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";
import { WarningCircleIcon } from "@phosphor-icons/react";

const FAQS = [
  {
    q: "¿Qué significa 'urgente' y cuándo se aplica?",
    a: "Se considera urgente cuando la solicitud llega con menos de 24h y requiere reorganizar la planificación. Aplicamos un recargo del 20% sobre el total. Los servicios planificados con antelación (mismo día o día siguiente) no llevan recargo.",
  },
  {
    q: "¿Cómo funciona el recargo a partir de las 18h?",
    a: "La franja nocturna (a partir de las 18h) lleva un recargo del 25% sobre el subtotal. La calculadora aplica este incremento de forma automática y transparente.",
  },
  {
    q: "¿Y los sábados, domingos o festivos?",
    a: "En fin de semana o festivos la ruta base se multiplica ×2 (mínimo 200€ por salida) y todos los extras suben un 15% adicional. El recargo nocturno se acumula si la franja es ≥18h. La calculadora lo refleja en tiempo real.",
  },
  {
    q: "¿Hacéis entregas dentro de ciudades grandes?",
    a: "No realizamos reparto urbano ni entregamos en el interior de grandes ciudades (Barcelona ciudad, Girona centro…). Sí entregamos en polígonos industriales, pueblos y urbanizaciones con buen acceso para camión 12T. Si tienes dudas sobre la dirección de entrega, consúltanos antes de tramitar la solicitud.",
  },
  {
    q: "¿Qué camión utilizáis? ¿Hay restricciones de acceso?",
    a: "Trabajamos exclusivamente con camión rígido 12T. Carga útil máxima 6.000 kg / 34 m³. Disponemos de furgón cerrado, lonas (tautliner) y plataforma elevadora. Al ser 12T, no podemos acceder a zonas de carga limitada, centros históricos ni vías con restricción de altura o tonelaje.",
  },
  {
    q: "¿Cuál es la diferencia entre 'Plan semanal' y 'Servicio puntual'?",
    a: "Los planes semanales (B2B) son tarifas planas con días y paradas pactadas, ideales para empresas con envíos recurrentes. El servicio puntual se factura por viaje usando la calculadora, sin compromiso de permanencia.",
  },
  {
    q: "¿Hacéis entregas puerta a puerta?",
    a: "Sí, en polígonos y direcciones con acceso para camión 12T. Con plataforma elevadora podemos descargar sin necesidad de muelle (+35€). No realizamos reparto en pisos ni zonas urbanas restringidas.",
  },
  {
    q: "¿Qué zona cubrís?",
    a: "Operamos desde nuestra base en Girona dos corredores principales: sur hacia Barcelona (~100 km) y norte hacia La Jonquera / frontera francesa (~60 km). Cubrimos todo el Gironès más puntas a ambos extremos. Fuera de esta zona, consulta disponibilidad y precio — no descartamos nada sin valorarlo.",
  },
  {
    q: "¿Qué pasa si necesito el envío para hoy?",
    a: "Selecciona la opción 'Urgente' en la calculadora y envía la solicitud. Confirmamos disponibilidad en menos de 30 minutos. Se aplica un recargo del 20% por reorganización de ruta.",
  },
  {
    q: "¿Por qué se factura por volumen y no solo por peso?",
    a: "Aplicamos peso facturable = max(peso real, volumen × 176 kg/m³), ajustado a la densidad de nuestro 12T (6.000 kg / 34 m³). Una carga ligera pero voluminosa ocupa espacio que impide aceptar otras cargas, por lo que el precio refleja el espacio realmente utilizado. La calculadora lo muestra de forma transparente.",
  },
  {
    q: "¿Cómo recibo el seguimiento del envío?",
    a: "Tras enviar la solicitud recibirás una referencia única (ej. TR240312AB12). Con ella puedes consultar el estado en cualquier momento desde la sección Seguimiento, y te notificamos por email y WhatsApp.",
  },
  {
    q: "¿Está la mercancía asegurada?",
    a: "Sí, todos los servicios incluyen seguro de mercancías hasta el valor declarado. Para cargas de alto valor es necesario aviso previo para ajustar la cobertura.",
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
          <p className="mt-5 text-slate-600">¿No encuentras tu duda? Escríbenos por WhatsApp, respondemos en minutos.</p>

          {/* 12T notice */}
          <div className="mt-8 bg-[#0F172A] text-white p-5">
            <div className="flex items-start gap-3">
              <WarningCircleIcon size={20} className="text-[#FBBF24] flex-shrink-0 mt-0.5" weight="fill" />
              <div>
                <div className="font-bold text-sm text-[#FBBF24] mb-1">Camión 12T · acceso necesario</div>
                <p className="text-xs text-slate-300 leading-relaxed">No entregamos dentro de grandes ciudades. Sí entregamos en polígonos, pueblos y urbanizaciones con acceso para 12T. Consúltanos si tienes dudas sobre tu dirección.</p>
              </div>
            </div>
          </div>
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
