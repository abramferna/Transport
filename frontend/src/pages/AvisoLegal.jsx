import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-[#0F172A] mb-3 pb-2 border-b border-slate-200">{title}</h2>
    <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function AvisoLegal() {
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
          <div className="label-eyebrow mb-2">Información legal</div>
          <h1 className="font-display font-black text-4xl tracking-tighter text-[#0F172A] mb-2">Aviso Legal</h1>
          <p className="text-sm text-slate-400">Última actualización: mayo de 2025</p>
        </div>

        <Section title="1. Datos del titular">
          <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos identificativos del titular del sitio web:</p>
          <ul className="mt-3 space-y-1">
            <li><strong>Nombre comercial:</strong> ViaNordTrans</li>
            <li><strong>NIF/CIF:</strong> [NÚMERO NIF/CIF]</li>
            <li><strong>Domicilio social:</strong> Girona, Catalunya, España</li>
            <li><strong>Correo electrónico:</strong> ViaNord@gmail.com</li>
            <li><strong>Teléfono:</strong> +34 673 392 259</li>
          </ul>
        </Section>

        <Section title="2. Objeto y ámbito de aplicación">
          <p>El presente Aviso Legal regula el uso del sitio web <strong>transport-theta-ochre.vercel.app</strong> (en adelante, "el Sitio Web"), cuya titularidad corresponde a ViaNordTrans.</p>
          <p>El acceso y uso del Sitio Web implica la aceptación plena y sin reservas de las condiciones establecidas en este Aviso Legal. Si no está de acuerdo con alguna de las condiciones aquí establecidas, le rogamos que no acceda ni utilice el Sitio Web.</p>
        </Section>

        <Section title="3. Actividad">
          <p>ViaNordTrans es una empresa de transporte de mercancías por carretera especializada en el corredor norte de Catalunya: Girona, Barcelona y La Jonquera. A través del Sitio Web se ofrece información sobre los servicios disponibles y se facilita la solicitud de presupuestos de transporte.</p>
        </Section>

        <Section title="4. Propiedad intelectual e industrial">
          <p>Todos los contenidos del Sitio Web (textos, imágenes, logotipos, diseño gráfico, código fuente, etc.) son propiedad de ViaNordTrans o de terceros que han autorizado su uso, y están protegidos por las leyes españolas e internacionales de propiedad intelectual e industrial.</p>
          <p>Queda expresamente prohibida la reproducción, distribución, transformación o comunicación pública, total o parcial, de los contenidos del Sitio Web sin la autorización previa y por escrito de ViaNordTrans, salvo para uso personal y privado.</p>
        </Section>

        <Section title="5. Responsabilidad y uso del sitio web">
          <p>ViaNordTrans no garantiza la ausencia de errores en el acceso al Sitio Web ni en su contenido, ni que este se encuentre permanentemente disponible. Se reserva el derecho a modificar, suspender o interrumpir el acceso al Sitio Web en cualquier momento y sin previo aviso.</p>
          <p>El usuario se compromete a hacer un uso diligente y lícito del Sitio Web, asumiendo la responsabilidad por los daños y perjuicios que pudiera causar por incumplimiento de estas condiciones.</p>
        </Section>

        <Section title="6. Política de privacidad y cookies">
          <p>El tratamiento de los datos personales recabados a través del Sitio Web se rige por la <Link to="/privacidad" className="text-[#1E3A8A] underline underline-offset-2 hover:text-[#0F172A]">Política de Privacidad</Link> y la <Link to="/cookies" className="text-[#1E3A8A] underline underline-offset-2 hover:text-[#0F172A]">Política de Cookies</Link>.</p>
        </Section>

        <Section title="7. Legislación y jurisdicción aplicable">
          <p>El presente Aviso Legal se rige íntegramente por la legislación española. Para la resolución de cualquier controversia derivada del acceso o uso del Sitio Web, las partes se someten a los Juzgados y Tribunales de Girona, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</p>
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
