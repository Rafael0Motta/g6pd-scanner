import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/scanner", label: "Escanear", icon: "📷" },
  { to: "/catalogo", label: "Histórico", icon: "🗂️" },
  { to: "/substancias", label: "Buscar", icon: "🔍" },
];

export function BottomNav() {
  return (
    <nav className="grid grid-cols-3 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 text-xs ${isActive ? "text-green-700 font-semibold" : "text-gray-500"}`
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
