import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ExerciseMedia } from "../components/ExerciseMedia.tsx";
import { api, getToken, setToken } from "../api.ts";

type Dashboard = {
  profile: {
    id: string;
    trackingFrequency: string;
    objective: string | null;
    heightCm: number | null;
  };
  trainer: { name: string | null; email: string };
  activeRoutine: {
    title: string;
    description: string | null;
    days: {
      dayNumber: number;
      title: string | null;
      exercises: {
        orderIndex: number;
        reps: string | null;
        sets: number | null;
        exercise: { name: string; videoUrl?: string | null };
      }[];
    }[];
  } | null;
  lastBodyMetric: { weightKg: number | null; bodyFatPercent: number | null; recordedAt: string } | null;
  openFeedbackRequests: number;
  nextCheckInHint: string;
};

const feedbackTypes = [
  { id: "ROUTINE_CHANGE", label: "Cambio de rutina" },
  { id: "BODY_UPDATE", label: "Actualización corporal / control" },
  { id: "PAIN", label: "Molestia / dolor" },
  { id: "DIFFICULTY", label: "Demasiado fácil / difícil" },
  { id: "OBJECTIVE_CHANGE", label: "Nuevo objetivo" },
];

export function ClientDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const hasToken = Boolean(getToken());
  const [weightKg, setWeightKg] = useState("");
  const [bf, setBf] = useState("");
  const [metricNotes, setMetricNotes] = useState("");
  const [fbType, setFbType] = useState(feedbackTypes[0].id);
  const [fbMessage, setFbMessage] = useState("");
  const [fbError, setFbError] = useState<string | null>(null);

  const dash = useQuery({
    enabled: hasToken,
    queryKey: ["client", "dashboard"],
    queryFn: () => api<Dashboard>("/api/client/dashboard"),
  });

  const fbList = useQuery({
    enabled: hasToken,
    queryKey: ["client", "feedback"],
    queryFn: () =>
      api<
        {
          id: string;
          type: string;
          message: string;
          status: string;
          createdAt: string;
        }[]
      >("/api/client/feedback"),
  });

  const metrics = useQuery({
    enabled: hasToken,
    queryKey: ["client", "metrics"],
    queryFn: () =>
      api<
        {
          id: string;
          recordedAt: string;
          weightKg: number | null;
          bodyFatPercent: number | null;
          notes?: string | null;
        }[]
      >("/api/client/body-metrics"),
  });

  const addMetric = useMutation({
    mutationFn: async () => {
      const w = Number(weightKg);
      const bfv = bf === "" ? undefined : Number(bf);
      if (!Number.isFinite(w)) throw new Error("Peso obligatorio");
      return api("/api/client/body-metrics", {
        method: "POST",
        body: JSON.stringify({
          weightKg: w,
          bodyFatPercent: bfv,
          notes: metricNotes || undefined,
        }),
      });
    },
    onSuccess: () => {
      setMetricNotes("");
      void qc.invalidateQueries({ queryKey: ["client"] });
    },
    onError: () => {},
  });

  const addFeedback = useMutation({
    mutationFn: async () => {
      const message = fbMessage.trim();
      if (message.length < 3) throw new Error("Escribe un mensaje más largo.");
      await api("/api/client/feedback", {
        method: "POST",
        body: JSON.stringify({ type: fbType, message }),
      });
    },
    onSuccess: () => {
      setFbMessage("");
      setFbError(null);
      void qc.invalidateQueries({ queryKey: ["client"] });
    },
    onError: (e) => {
      setFbError(e instanceof Error ? e.message : "Error");
    },
  });

  if (!hasToken) return <Navigate to="/login" replace />;

  function logout() {
    setToken(null);
    navigate("/login");
  }

  if (dash.isLoading) return <div className="text-slate-400">Cargando…</div>;
  if (dash.isError) {
    return (
      <div className="rounded-xl border border-rose-900 bg-rose-950/40 p-6 text-rose-100">
        <div className="font-semibold">No se pudo cargar el panel</div>
        <p className="mt-2 text-sm text-rose-200/90">¿Seguro que el API está arriba?</p>
        <button
          type="button"
          onClick={() => void dash.refetch()}
          className="mt-4 rounded-lg bg-rose-800 px-4 py-2 text-sm text-white"
        >
          Reintentar
        </button>
        <button type="button" onClick={() => navigate("/login")} className="ml-3 mt-4 text-sm underline">
          Volver al login
        </button>
      </div>
    );
  }

  const data = dash.data!;
  const last = metrics.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Panel cliente</h1>
          <p className="text-sm text-slate-400">
            Entrenador: <span className="text-emerald-200">{data.trainer.name ?? data.trainer.email}</span>
          </p>
        </div>
        <button type="button" onClick={() => logout()} className="text-sm text-slate-400 underline">
          Salir
        </button>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Control de métricas</h2>
          <p className="mt-2 text-sm text-slate-400">
            Frecuencia asignada: <span className="text-emerald-200">{data.profile.trackingFrequency}</span>.
            Tip:{" "}
            <span className="text-slate-200">{data.nextCheckInHint}</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Último registro:{" "}
            {data.lastBodyMetric
              ? `${data.lastBodyMetric.weightKg ?? "?"} kg · ${data.lastBodyMetric.bodyFatPercent ?? "?"} % grasa`
              : "sin datos"}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs text-slate-400">
              Peso (kg)
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400">
              Grasa % (opcional)
              <input
                type="number"
                step="0.1"
                value={bf}
                onChange={(e) => setBf(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
          </div>
          <label className="mt-3 block text-xs text-slate-400">
            Notas
            <input
              value={metricNotes}
              onChange={(e) => setMetricNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={addMetric.isPending}
            onClick={() => void addMetric.mutate()}
            className="mt-3 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            Registrar ahora
          </button>

          <div className="mt-4 border-t border-slate-800 pt-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Historial corto</div>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {last.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <span>{new Date(m.recordedAt).toLocaleDateString()}</span>
                  <span>
                    {m.weightKg ?? "?"} kg · {m.bodyFatPercent ?? "?"} % grasa
                  </span>
                </li>
              ))}
              {last.length === 0 ? <li className="text-slate-500">Vacío.</li> : null}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">Mensajes al entrenador</h2>
          <p className="mt-2 text-sm text-slate-400">
            Solicitudes abiertas: <span className="text-amber-200">{data.openFeedbackRequests}</span>
          </p>
          <div className="mt-4 space-y-2">
            <label className="block text-xs text-slate-400">
              Tipo
              <select
                value={fbType}
                onChange={(e) => setFbType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              >
                {feedbackTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-slate-400">
              Mensaje
              <textarea
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            {fbError ? <div className="text-sm text-rose-300">{fbError}</div> : null}
            <button
              type="button"
              disabled={addFeedback.isPending}
              onClick={() => {
                setFbError(null);
                void addFeedback.mutate();
              }}
              className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
            >
              Enviar solicitud
            </button>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Recientes</div>
            <ul className="mt-2 space-y-2 text-sm">
              {(fbList.data ?? []).slice(0, 5).map((f) => (
                <li key={f.id} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{f.type}</span>
                    <span>{f.status}</span>
                  </div>
                  <div className="mt-1 text-slate-200">{f.message}</div>
                </li>
              ))}
              {(fbList.data ?? []).length === 0 ? <li className="text-slate-500 text-sm">Sin mensajes.</li> : null}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Rutina activa</h2>
        {!data.activeRoutine ? (
          <p className="mt-3 text-sm text-slate-400">Aún sin rutina — el entrenador puede asignarla desde Admin.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-xl font-medium text-emerald-200">{data.activeRoutine.title}</div>
              {data.activeRoutine.description ? (
                <p className="text-sm text-slate-400">{data.activeRoutine.description}</p>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.activeRoutine.days.map((d) => (
                <div key={d.dayNumber} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="text-sm font-semibold text-white">
                    Día {d.dayNumber}
                    {d.title ? ` — ${d.title}` : ""}
                  </div>
                  <ul className="mt-3 space-y-4 text-sm text-slate-300">
                    {d.exercises.map((ex, i) => (
                      <li key={i} className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                        <div className="font-medium text-slate-100">
                          {ex.exercise.name}: {ex.sets ?? "?"}×{ex.reps ?? "?"}
                        </div>
                        {ex.exercise.videoUrl ? (
                          <ExerciseMedia videoUrl={ex.exercise.videoUrl} compact />
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">Sin vídeo — el entrenador puede añadirlo en Admin.</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
