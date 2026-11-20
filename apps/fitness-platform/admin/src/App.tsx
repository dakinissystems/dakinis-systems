import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLogin } from "./pages/Login.tsx";
import { AdminDashboard } from "./pages/Dashboard.tsx";

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold tracking-wide text-amber-200">Dakinis · Fitness Admin</div>
          <a
            className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-200"
            href="http://localhost:5174/"
            target="_blank"
            rel="noreferrer"
          >
            Abrir app cliente
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/app" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
