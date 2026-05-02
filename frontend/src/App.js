import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";
import Tracking from "@/pages/Tracking";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/seguimiento" element={<Tracking />} />
          <Route path="/seguimiento/:reference" element={<Tracking />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
