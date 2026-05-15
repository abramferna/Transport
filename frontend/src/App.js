import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";
import Tracking from "@/pages/Tracking";
import AvisoLegal from "@/pages/AvisoLegal";
import Privacidad from "@/pages/Privacidad";
import Cookies from "@/pages/Cookies";
import { CookieBanner } from "@/components/CookieBanner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <CookieBanner />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/calculadora" element={<Navigate to="/#calculadora" replace />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/seguimiento" element={<Tracking />} />
          <Route path="/seguimiento/:reference" element={<Tracking />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cookies" element={<Cookies />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
