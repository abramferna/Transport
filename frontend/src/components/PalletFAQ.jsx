const QUESTIONS = [
  {
    question: "¿Cómo se calcula el precio de cada línea?",
    answer: "Se multiplica el precio por palé de la zona de destino por los palés facturables. El origen se recoge como referencia y no tiene coste en esta tarifa.",
  },
  {
    question: "¿Qué significa “palés facturables”?",
    answer: "El número de palés se multiplica por el factor que corresponde al peso de cada palé: hasta 500 kg, ×1; hasta 750 kg, ×1,2; hasta 1.000 kg, ×1,5; y hasta 1.300 kg, ×1,8.",
  },
  {
    question: "¿Qué ocurre si un palé pesa más de 1.300 kg?",
    answer: "Esa línea aparece como “Consultar” y no se suma al total automático. Envíanos los datos para recibir una valoración.",
  },
  {
    question: "¿Puedo incluir destinos y orígenes distintos?",
    answer: "Sí. Añade una línea por cada destino y señala su origen. El presupuesto suma las líneas que están dentro de la tarifa automática.",
  },
  {
    question: "¿Y si mi destino no aparece en la lista?",
    answer: "La tarifa automática cubre las poblaciones indicadas en las cinco zonas. Para otros destinos, contacta con nosotros y revisaremos el recorrido.",
  },
  {
    question: "¿El precio incluye otros servicios o recargos?",
    answer: "Esta calculadora aplica únicamente la tarifa por palé y zona del documento facilitado. Fecha, horario, accesos y necesidades especiales se confirman con ViaNordTrans antes de cerrar el servicio.",
  },
];

export default function PalletFAQ() {
  return (
    <section id="faq" className="bg-[#f0f3f4] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1160px] gap-8 px-5 lg:grid-cols-[.75fr_1.25fr] lg:gap-16 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">
            <span className="h-[2px] w-7 bg-[#e8aa14]" /> Información de la tarifa
          </div>
          <h2 className="text-3xl font-black leading-tight tracking-[-.04em] text-[#082c3a] sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            Detalles para interpretar correctamente tu presupuesto por palé.
          </p>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 px-4 py-3 text-sm font-bold text-[#163744] marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
                {question}
                <span className="text-lg font-medium text-[#087a98] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-3xl px-4 pb-4 text-sm leading-relaxed text-slate-600 sm:px-5">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
