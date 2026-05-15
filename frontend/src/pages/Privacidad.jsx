import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-[#0F172A] mb-3 pb-2 border-b border-slate-200">{title}</h2>
    <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display font-black tracking-tighter text-[#0F172A] text-base leading-none">ViaNordTrans</span>
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors">← Volver</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-10">
          <div className="label-eyebrow mb-2">Protección de datos</div>
          <h1 className="font-display font-black text-4xl tracking-tighter text-[#0F172A] mb-2">Política de Privacidad</h1>
          <p className="text-sm text-slate-400">Última actualización: mayo de 2025</p>
        </div>

        <Section title="1. Responsable del tratamiento">
          <ul className="space-y-1">
            <li><strong>Responsable:</strong> ViaNordTrans</li>
            <li><strong>NIF:</strong> 41644986J</li>
            <li><strong>Domicilio:</strong> C/ Gavarres 35, Castell d'Aro, Girona, Catalunya</li>
            <li><strong>Contacto:</strong> ViaNord@gmail.com · +34 673 392 259</li>
          </ul>
        </Section>

        <Section title="2. Datos que recogemos">
          <p>A través del Sitio Web podemos recoger los siguientes datos personales:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Nombre y apellidos</strong>, para la gestión del presupuesto.</li>
            <li><strong>Correo electrónico</strong>, para el envío de la confirmación del presupuesto.</li>
            <li><strong>Teléfono</strong>, si lo facilita voluntariamente para contacto comercial.</li>
            <li><strong>Datos del envío</strong> (origen, destino, peso, volumen), necesarios para calcular el presupuesto.</li>
          </ul>
          <p className="mt-2">No recogemos datos especialmente sensibles (salud, ideología, etc.).</p>
        </Section>

        <Section title="3. Finalidad y base jurídica del tratamiento">
          <p>Tratamos sus datos con las siguientes finalidades:</p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-3 py-2 font-semibold text-[#0F172A] border-b border-slate-200">Finalidad</th>
                  <th className="text-left px-3 py-2 font-semibold text-[#0F172A] border-b border-slate-200">Base jurídica</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Elaborar y enviar el presupuesto solicitado", "Ejecución de un precontrato (art. 6.1.b RGPD)"],
                  ["Gestión administrativa y facturación", "Obligación legal (art. 6.1.c RGPD)"],
                  ["Comunicaciones comerciales sobre nuestros servicios", "Interés legítimo / consentimiento (art. 6.1.f-a RGPD)"],
                  ["Seguimiento del estado del envío", "Ejecución del contrato (art. 6.1.b RGPD)"],
                ].map(([fin, base]) => (
                  <tr key={fin} className="border-b border-slate-100">
                    <td className="px-3 py-2">{fin}</td>
                    <td className="px-3 py-2 text-slate-500">{base}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Conservación de los datos">
          <p>Conservaremos sus datos durante el tiempo necesario para la prestación del servicio contratado y, posteriormente, durante los plazos de conservación exigidos por la normativa aplicable (fiscal, mercantil, etc.), con un máximo de <strong>5 años</strong> desde la última interacción.</p>
        </Section>

        <Section title="5. Destinatarios y transferencias internacionales">
          <p>Sus datos no se cederán a terceros salvo obligación legal. Utilizamos los siguientes proveedores de servicio que actúan como encargados del tratamiento:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Resend Inc.</strong> (resend.com) — envío transaccional de correos electrónicos. Servidores en la UE disponibles. Puede consultar su política en <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] underline underline-offset-2">resend.com/privacy</a>.</li>
            <li><strong>Supabase Inc.</strong> — base de datos de presupuestos. Datos almacenados en la UE (West EU). Puede consultar su política en <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] underline underline-offset-2">supabase.com/privacy</a>.</li>
          </ul>
          <p className="mt-2">No realizamos transferencias internacionales fuera del Espacio Económico Europeo sin las garantías adecuadas.</p>
        </Section>

        <Section title="6. Derechos del interesado">
          <p>Puede ejercer en cualquier momento los siguientes derechos dirigiéndose a <strong>ViaNord@gmail.com</strong> con copia de su DNI/NIE:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Acceso</strong> a sus datos personales.</li>
            <li><strong>Rectificación</strong> de datos inexactos o incompletos.</li>
            <li><strong>Supresión</strong> ("derecho al olvido").</li>
            <li><strong>Limitación</strong> del tratamiento.</li>
            <li><strong>Portabilidad</strong> de los datos.</li>
            <li><strong>Oposición</strong> al tratamiento.</li>
            <li><strong>Retirada del consentimiento</strong>, sin que ello afecte a la licitud del tratamiento previo.</li>
          </ul>
          <p className="mt-2">Tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (aepd.es) si considera que el tratamiento no es conforme al RGPD.</p>
        </Section>

        <Section title="7. Seguridad">
          <p>Aplicamos medidas técnicas y organizativas adecuadas para garantizar la seguridad de sus datos personales y evitar su destrucción, pérdida, acceso no autorizado o divulgación accidental.</p>
        </Section>

        <Section title="8. Cookies">
          <p>Para información sobre el uso de cookies, consulte nuestra <Link to="/cookies" className="text-[#1E3A8A] underline underline-offset-2 hover:text-[#0F172A]">Política de Cookies</Link>.</p>
        </Section>
      </main>

      <footer className="border-t border-slate-200 px-5 py-6 mt-4">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 text-xs text-slate-400">
          <Link to="/aviso-legal" className="hover:text-[#0F172A]">Aviso legal</Link>
          <Link to="/privacidad" className="hover:text-[#0F172A]">Política de privacidad</Link>
          <Link to="/cookies" className="hover:text-[#0F172A]">Política de cookies</Link>
          <span className="ml-auto">© {new Date().getFullYear()} ViaNordTrans</span>
        </div>
      </footer>
    </div>
  );
}
