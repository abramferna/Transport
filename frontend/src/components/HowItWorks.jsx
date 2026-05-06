import { PackageIcon, MapPinIcon, TruckIcon, HeadsetIcon } from "@phosphor-icons/react";

const steps = [
  {
    n: "01",
    icon: <PackageIcon size={28} weight="duotone" />,
    title: "Contratas el plan o servicio",
    desc: "Elige el plan B2B que mejor encaja o solicita un servicio puntual. Te enviamos confirmación y presupuesto en menos de 4h.",
  },
  {
    n: "02",
    icon: <MapPinIcon size={28} weight="duotone" />,
    title: "Definimos rutas y horarios",
    desc: "Acordamos días de recogida, horarios, puntos de entrega y cualquier necesidad especial (plataforma elevadora, paradas extra, etc.).",
  },
  {
    n: "03",
    icon: <TruckIcon size={28} weight="duotone" />,
    title: "Realizamos los servicios",
    desc: "Nuestro equipo ejecuta las rutas con puntualidad. Camión propio, conductor responsable y seguimiento de cada entrega.",
  },
  {
    n: "04",
    icon: <HeadsetIcon size={28} weight="duotone" />,
    title: "Soporte continuo",
    desc: "Estamos disponibles para resolver incidencias, ajustar rutas o añadir servicios. Contacto directo siempre, sin centralitas.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-16 lg:py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-12">
          <div className="label-eyebrow text-[#FBBF24] mb-3">Proceso</div>
          <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-white leading-[0.95]">
            Cómo funciona
          </h2>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto">
            Sin complicaciones. En cuatro pasos tienes el servicio en marcha.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {steps.map((s, i) => (
            <div key={s.n} className="bg-[#0F172A] p-7 relative group hover:bg-white/5 transition-colors duration-200">
              <div className="text-[#FBBF24]/20 font-display font-black text-7xl leading-none absolute top-4 right-5 select-none">
                {s.n}
              </div>
              <div className="text-[#FBBF24] mb-4 relative">{s.icon}</div>
              <h3 className="font-display font-black text-white text-lg tracking-tight mb-2 relative">
                {s.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed relative">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 text-[#FBBF24]/30 text-2xl z-10">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#calculadora"
            className="inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0F172A] font-bold px-8 h-12 transition-colors duration-150"
          >
            Solicitar presupuesto ahora
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
