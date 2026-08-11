import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AvisoMedico } from "./components/AvisoMedico";
import { BottomNav } from "./components/BottomNav";
import { Onboarding } from "./pages/Onboarding";
import { Scanner } from "./pages/Scanner";
import { Catalogo } from "./pages/Catalogo";
import { ProductDetail } from "./pages/ProductDetail";
import { SubstanceSearch } from "./pages/SubstanceSearch";
import { isOnboardingConcluido } from "./lib/deviceId";

export default function App() {
  const [carregando, setCarregando] = useState(true);
  const [onboardingConcluido, setOnboardingConcluido] = useState(false);
  const location = useLocation();

  useEffect(() => {
    isOnboardingConcluido().then((concluido) => {
      setOnboardingConcluido(concluido);
      setCarregando(false);
    });
  }, []);

  if (carregando) {
    return <div className="flex h-full items-center justify-center text-gray-400">Carregando…</div>;
  }

  if (!onboardingConcluido) {
    return <Onboarding onConcluido={() => setOnboardingConcluido(true)} />;
  }

  const mostrarNav = location.pathname !== "/onboarding";

  return (
    <div className="flex h-full flex-col">
      <AvisoMedico />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/scanner" replace />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/substancias" element={<SubstanceSearch />} />
          <Route path="*" element={<Navigate to="/scanner" replace />} />
        </Routes>
      </div>
      {mostrarNav && <BottomNav />}
    </div>
  );
}
