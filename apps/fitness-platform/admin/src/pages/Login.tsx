import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, api, setToken } from "../api.ts";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("trainer@demo.fit");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api<{ token: string; user: { role: string } }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.user.role !== "TRAINER" && res.user.role !== "OWNER") {
        setError("Esta vista es solo para entrenadores / OWNER.");
        return;
      }
      setToken(res.token);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
      <h1 className="text-xl font-semibold text-white">Acceso entrenador</h1>
      <p className="mt-1 text-sm text-slate-400">
        Gestiona clientes, rutinas y solicitudes. API:{" "}
        <code className="rounded bg-slate-950 px-1 py-0.5 text-amber-200">{API_BASE}</code>
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-400"
          />
        </label>
        {error ? <div className="rounded-lg border border-rose-800 bg-rose-950/60 px-3 py-2 text-sm text-rose-100">{error}</div> : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-amber-400"
        >
          Entrar
        </button>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        Credenciales demo (tras seed): trainer@demo.fit / demo123
      </p>
    </div>
  );
}
