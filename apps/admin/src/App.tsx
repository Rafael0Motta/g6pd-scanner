import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Substances } from "./pages/Substances";
import { Products } from "./pages/Products";

function Layout({ children }: { children: React.ReactNode }) {
  const { sair, admin } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">G6PD Scanner — Admin</span>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "font-semibold text-green-700" : "text-gray-500")}>
              Dashboard
            </NavLink>
            <NavLink to="/substancias" className={({ isActive }) => (isActive ? "font-semibold text-green-700" : "text-gray-500")}>
              Base de substâncias
            </NavLink>
            <NavLink to="/produtos" className={({ isActive }) => (isActive ? "font-semibold text-green-700" : "text-gray-500")}>
              Produtos escaneados
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {admin?.email}
          <button onClick={sair} className="rounded border border-gray-300 px-3 py-1 text-gray-700">
            Sair
          </button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}

export default function App() {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/substancias" element={<Substances />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
