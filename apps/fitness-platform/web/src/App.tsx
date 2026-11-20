import { Navigate, Route, Routes } from "react-router-dom";
import { ClientLogin } from "./pages/Login.tsx";
import { ClientDashboard } from "./pages/Dashboard.tsx";

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold tracking-wide text-emerald-300">Dakinis · Fitness Cliente</div>
          <a
            className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-200"
            href="http://localhost:5175/"
            target="_blank"
            rel="noreferrer"
          >
            Abrir Admin (entrenador)
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/app" element={<ClientDashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
