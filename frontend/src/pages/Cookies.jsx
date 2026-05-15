import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-[#0F172A] mb-3 pb-2 border-b border-slate-200">{title}</h2>
    <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function Cookies() {
  const handleResetConsent = () => {
    localStorage.removeItem("vnt_cookie_consent");
    window.location.reload();
  };

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
          <div className="label-eyebrow mb-2">Transparencia digital</div>
          <h1 className="font-display font-black text-4xl tracking-tighter text-[#0F172A] mb-2">Política de Cookies</h1>
          <p className="text-sm text-slate-400">Última actualización: mayo de 2025</p>
        </div>

        <Section title="1. ¿Qué son las cookies?">
          <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en el dispositivo del usuario cuando este los visita. Permiten al sitio recordar información sobre la visita para facilitar la navegación y mejorar la experiencia del usuario.</p>
        </Section>

        <Section title="2. Cookies que utilizamos">
          <p>Este sitio web utiliza únicamente cookies técnicas y funcionales estrictamente necesarias para el funcionamiento básico del sitio. No utilizamos cookies de seguimiento, publicidad o análisis de terceros.</p>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  {["Nombre", "Tipo", "Finalidad", "Duración"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-[#0F172A] border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["vnt_cookie_consent", "Técnica / funcional", "Almacena la aceptación del aviso de cookies para no mostrarlo de nuevo", "1 año (localStorage)"],
                  ["Sesión del navegador", "Técnica", "Gestión de la sesión de usuario en el navegador", "Sesión"],
                ].map(([name, type, purpose, duration]) => (
                  <tr key={name} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono text-slate-700">{name}</td>
                    <td className="px-3 py-2">{type}</td>
                    <td className="px-3 py-2">{purpose}</td>
                    <td className="px-3 py-2 text-slate-500">{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3">Las cookies técnicas y estrictamente necesarias <strong>no requieren consentimiento</strong> del usuario según el artículo 22.2 de la LSSI-CE y el Considerando 66 de la Directiva ePrivacy.</p>
        </Section>

        <Section title="3. Cookies de terceros">
          <p>Actualmente este sitio web <strong>no utiliza cookies de terceros</strong> (Google Analytics, Facebook Pixel, herramientas publicitarias, etc.). Si en el futuro incorporásemos alguna, actualizaríamos esta política y solicitaríamos el consentimiento previo e informado del usuario.</p>
        </Section>

        <Section title="4. Cómo gestionar las cookies">
          <p>Puede configurar su navegador para bloquear, eliminar o recibir avisos sobre las cookies. Tenga en cuenta que deshabilitar cookies técnicas puede afectar al funcionamiento del sitio web.</p>
          <p>Instrucciones para los navegadores más habituales:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] underline underline-offset-2">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] underline underline-offset-2">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] underline underline-offset-2">Safari</a></li>
            <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] underline underline-offset-2">Microsoft Edge</a></li>
          </ul>
        </Section>

        <Section title="5. Retirar el consentimiento">
          <p>Puede retirar el consentimiento prestado en cualquier momento restableciendo el aviso de cookies:</p>
          <button
            onClick={handleResetConsent}
            className="mt-3 px-4 h-9 bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-colors"
          >
            Restablecer preferencias de cookies
          </button>
        </Section>

        <Section title="6. Más información">
          <p>Para cualquier consulta sobre el uso de cookies, puede contactar con nosotros en <strong>ViaNord@gmail.com</strong>.</p>
          <p>También puede consultar nuestra <Link to="/privacidad" className="text-[#1E3A8A] underline underline-offset-2 hover:text-[#0F172A]">Política de Privacidad</Link> y el <Link to="/aviso-legal" className="text-[#1E3A8A] underline underline-offset-2 hover:text-[#0F172A]">Aviso Legal</Link>.</p>
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
