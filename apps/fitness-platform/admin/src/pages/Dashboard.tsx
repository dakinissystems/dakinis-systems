import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ExerciseMedia } from "../components/ExerciseMedia.tsx";
import { API_BASE, api, getToken, setToken } from "../api.ts";

type ClientRow = {
  id: string;
  trackingFrequency: string;
  objective: string | null;
  user: { id: string; email: string; name: string | null };
  lastBodyMetric?: { weightKg: number | null; bodyFatPercent: number | null; recordedAt: string } | null;
};

type RoutineRow = {
  id: string;
  title: string;
  goal: string | null;
  days: { dayNumber: number; title: string | null }[];
};

type FeedbackRow = {
  id: string;
  type: string;
  message: string;
  status: string;
  updatedAt: string;
  client: { user: { email: string; name: string | null } };
};

type ExerciseLibraryRow = { id: string; name: string; videoUrl: string | null };

const freqs = ["DAILY", "WEEKLY", "MONTHLY"] as const;

function ExerciseVideoEditor({ exercise }: { exercise: ExerciseLibraryRow }) {
  const qc = useQueryClient();
  const [url, setUrl] = useState(exercise.videoUrl ?? "");
  useEffect(() => setUrl(exercise.videoUrl ?? ""), [exercise.id, exercise.videoUrl]);

  const patch = useMutation({
    mutationFn: (videoUrl: string | null) =>
      api(`/api/admin/exercises/${exercise.id}`, {
        method: "PATCH",
        body: JSON.stringify({ videoUrl }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "exercises"] }),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", file);
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/admin/exercises/${exercise.id}/media`, {
        method: "POST",
        headers,
        body: fd,
      });
      const text = await res.text();
      if (!res.ok) {
        let msg = text;
        try {
          const j = JSON.parse(text) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }
      return text ? (JSON.parse(text) as unknown) : null;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "exercises"] }),
  });

  function saveUrl() {
    const t = url.trim();
    void patch.mutate(t === "" ? null : t);
  }

  return (
    <li className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
      <div className="font-medium text-white">{exercise.name}</div>
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end">
        <label className="block min-w-0 flex-1 text-xs text-slate-400">
          Enlace YouTube / Vimeo / URL de vídeo
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100"
          />
        </label>
        <button
          type="button"
          disabled={patch.isPending}
          onClick={() => saveUrl()}
          className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-600 disabled:opacity-50"
        >
          Guardar enlace
        </button>
        <label className="block shrink-0 text-xs text-slate-400">
          Subir archivo
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
            disabled={upload.isPending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void upload.mutate(f);
            }}
            className="mt-1 block w-full text-[11px] text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-amber-600 file:px-2 file:py-1 file:text-slate-950"
          />
        </label>
      </div>
      {patch.isError || upload.isError ? (
        <p className="mt-2 text-xs text-rose-400">
          {(patch.error ?? upload.error) instanceof Error
            ? (patch.error ?? upload.error).message
            : "Error"}
        </p>
      ) : null}
      {exercise.videoUrl ? (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Vista previa</div>
          <ExerciseMedia videoUrl={exercise.videoUrl} compact />
        </div>
      ) : null}
    </li>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const hasToken = Boolean(getToken());

  const [clientEmail, setClientEmail] = useState("alumno.nuevo@demo.fit");
  const [clientPassword, setClientPassword] = useState("demo123");
  const [clientName, setClientName] = useState("Nuevo alumno");
  const [clientFreq, setClientFreq] = useState<(typeof freqs)[number]>("WEEKLY");

  const [routineTitle, setRoutineTitle] = useState("Microciclo fuerza");
  const [routineGoal, setRoutineGoal] = useState("Progresión 4 semanas");
  const [day1Ex, setDay1Ex] = useState("Dominadas asistidas");
  const [day2Ex, setDay2Ex] = useState("Peso muerto rumano");
  const [day1Video, setDay1Video] = useState("");
  const [day2Video, setDay2Video] = useState("");

  const [assignClientId, setAssignClientId] = useState<string | undefined>(undefined);
  const [assignRoutineId, setAssignRoutineId] = useState<string | undefined>(undefined);

  const clients = useQuery({
    enabled: hasToken,
    queryKey: ["admin", "clients"],
    queryFn: () => api<ClientRow[]>("/api/admin/clients"),
  });

  const routines = useQuery({
    enabled: hasToken,
    queryKey: ["admin", "routines"],
    queryFn: () => api<RoutineRow[]>("/api/admin/routines"),
  });

  const feedback = useQuery({
    enabled: hasToken,
    queryKey: ["admin", "feedback"],
    queryFn: () => api<FeedbackRow[]>("/api/admin/feedback"),
  });

  const exercisesLib = useQuery({
    enabled: hasToken,
    queryKey: ["admin", "exercises"],
    queryFn: () => api<ExerciseLibraryRow[]>("/api/admin/exercises"),
  });

  const clientOptions = clients.data ?? [];
  const routineOptions = routines.data ?? [];
  const resolvedClientId = assignClientId ?? clientOptions[0]?.id ?? "";
  const resolvedRoutineId = assignRoutineId ?? routineOptions[0]?.id ?? "";

  const createClient = useMutation({
    mutationFn: () =>
      api("/api/admin/clients", {
        method: "POST",
        body: JSON.stringify({
          email: clientEmail,
          password: clientPassword,
          name: clientName,
          trackingFrequency: clientFreq,
        }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  const patchClient = useMutation({
    mutationFn: (p: { profileId: string; trackingFrequency: string }) =>
      api(`/api/admin/clients/${p.profileId}`, {
        method: "PATCH",
        body: JSON.stringify({ trackingFrequency: p.trackingFrequency }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "clients"] }),
  });

  const createRoutine = useMutation({
    mutationFn: () =>
      api("/api/admin/routines", {
        method: "POST",
        body: JSON.stringify({
          title: routineTitle,
          goal: routineGoal,
          days: [
            {
              dayNumber: 1,
              title: "Tirón + accesorios",
              exercises: [
                {
                  exerciseName: day1Ex,
                  sets: 4,
                  reps: "6–8",
                  ...(day1Video.trim() ? { videoUrl: day1Video.trim() } : {}),
                },
              ],
            },
            {
              dayNumber: 2,
              title: "Cadena posterior",
              exercises: [
                {
                  exerciseName: day2Ex,
                  sets: 3,
                  reps: "8–10",
                  ...(day2Video.trim() ? { videoUrl: day2Video.trim() } : {}),
                },
              ],
            },
          ],
        }),
      }),
    onSuccess: () =>
      void qc.invalidateQueries({
        predicate: (q) =>
          Boolean(q.queryKey[0] === "admin" && (q.queryKey[1] === "routines" || q.queryKey[1] === "exercises")),
      }),
  });

  const assignRoutine = useMutation({
    mutationFn: () =>
      api("/api/admin/assign-routine", {
        method: "POST",
        body: JSON.stringify({
          clientProfileId: resolvedClientId,
          routineId: resolvedRoutineId,
        }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  const patchFeedback = useMutation({
    mutationFn: (p: { id: string; status: "OPEN" | "REVIEWING" | "CLOSED" }) =>
      api(`/api/admin/feedback/${p.id}`, { method: "PATCH", body: JSON.stringify({ status: p.status }) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "feedback"] }),
  });

  if (!hasToken) return <Navigate to="/login" replace />;

  function logout() {
    setToken(null);
    navigate("/login");
  }

  function onCreateClient(e: FormEvent) {
    e.preventDefault();
    void createClient.mutate();
  }

  if (clients.isLoading || routines.isLoading || feedback.isLoading || exercisesLib.isLoading) {
    return <div className="text-slate-400">Cargando panel…</div>;
  }

  if (
    clients.isError ||
    routines.isError ||
    feedback.isError ||
    exercisesLib.isError
  ) {
    return (
      <div className="rounded-xl border border-rose-900 bg-rose-950/40 p-6 text-rose-100">
        Error al cargar datos del admin. ¿API en marcha?
        <button type="button" className="mt-3 block text-sm underline" onClick={() => void clients.refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Panel entrenador</h1>
          <p className="text-sm text-slate-400">Clientes, frecuencia de control, rutinas y bandeja de solicitudes.</p>
        </div>
        <button type="button" onClick={() => logout()} className="text-sm text-slate-400 underline">
          Salir
        </button>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onCreateClient}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-inner"
        >
          <h2 className="text-lg font-semibold text-amber-100">Nuevo cliente</h2>
          <p className="mt-1 text-sm text-slate-400">Crea usuario rol CLIENT y su ficha (perfil + frecuencia de seguimiento).</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs text-slate-400">
              Email
              <input
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400">
              Contraseña temporal
              <input
                type="password"
                value={clientPassword}
                onChange={(e) => setClientPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400 md:col-span-2">
              Nombre visible
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400 md:col-span-2">
              Frecuencia de control inicial
              <select
                value={clientFreq}
                onChange={(e) => setClientFreq(e.target.value as (typeof freqs)[number])}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              >
                {freqs.map((f) => (
                  <option key={f} value={f}>
                    {f === "DAILY" ? "Diario" : f === "WEEKLY" ? "Semanal" : "Mensual"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={createClient.isPending}
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Crear cliente
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-inner">
          <h2 className="text-lg font-semibold text-amber-100">Crear rutina (2 microdías)</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ejercicios nuevos se guardan en la biblioteca por nombre (tenant). Luego asígnala abajo.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs text-slate-400 md:col-span-2">
              Título
              <input
                value={routineTitle}
                onChange={(e) => setRoutineTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400 md:col-span-2">
              Objetivo corto
              <input
                value={routineGoal}
                onChange={(e) => setRoutineGoal(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400">
              Día 1 — ejercicio
              <input
                value={day1Ex}
                onChange={(e) => setDay1Ex(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400">
              Día 1 — vídeo (YouTube/Vimeo opcional)
              <input
                value={day1Video}
                onChange={(e) => setDay1Video(e.target.value)}
                placeholder="https://youtu.be/…"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400">
              Día 2 — ejercicio
              <input
                value={day2Ex}
                onChange={(e) => setDay2Ex(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-400">
              Día 2 — vídeo (YouTube/Vimeo opcional)
              <input
                value={day2Video}
                onChange={(e) => setDay2Video(e.target.value)}
                placeholder="https://vimeo.com/…"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={createRoutine.isPending}
            onClick={() => void createRoutine.mutate()}
            className="mt-4 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Guardar rutina
          </button>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <h3 className="text-sm font-semibold text-white">Asignar rutina activa</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs text-slate-400">
                Cliente (perfil)
                <select
                  value={resolvedClientId}
                  onChange={(e) => setAssignClientId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
                >
                  {clientOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user.name ?? c.user.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-400">
                Rutina
                <select
                  value={resolvedRoutineId}
                  onChange={(e) => setAssignRoutineId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm"
                >
                  {routineOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              disabled={assignRoutine.isPending || !resolvedClientId || !resolvedRoutineId}
              onClick={() => void assignRoutine.mutate()}
              className="mt-4 rounded-lg border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-40"
            >
              Activar para el cliente seleccionado
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-amber-100">Biblioteca — vídeos por ejercicio</h2>
        <p className="mt-1 text-sm text-slate-400">
          Los enlaces se guardan en el ejercicio (compartido en el gimnasio / tenant). Los clientes los ven embebidos en su
          rutina. Subida: MP4, MOV o WebM (límite por defecto en el API: 45&nbsp;MB; variable{" "}
          <code className="text-amber-200/90">FITNESS_UPLOAD_MAX_MB</code>).
        </p>
        <ul className="mt-4 space-y-3">
          {(exercisesLib.data ?? []).map((ex) => (
            <ExerciseVideoEditor key={ex.id} exercise={ex} />
          ))}
          {(exercisesLib.data ?? []).length === 0 ? (
            <li className="text-sm text-slate-500">Aún no hay ejercicios en la biblioteca. Crea una rutina para generarlos.</li>
          ) : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-amber-100">Clientes y frecuencia</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm text-slate-200">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2">Cliente</th>
                <th className="px-2 py-2">Objetivo</th>
                <th className="px-2 py-2">Última métrica</th>
                <th className="px-2 py-2">Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {clientOptions.map((c) => (
                <tr key={c.id} className="border-t border-slate-800">
                  <td className="px-2 py-3">
                    <div className="font-medium text-white">{c.user.name ?? "—"}</div>
                    <div className="text-xs text-slate-500">{c.user.email}</div>
                  </td>
                  <td className="px-2 py-3 text-slate-400">{c.objective ?? "—"}</td>
                  <td className="px-2 py-3 text-slate-400">
                    {c.lastBodyMetric
                      ? `${c.lastBodyMetric.weightKg ?? "?"} kg · ${c.lastBodyMetric.bodyFatPercent ?? "?"} %`
                      : "sin datos"}
                  </td>
                  <td className="px-2 py-3">
                    <select
                      value={c.trackingFrequency}
                      onChange={(e) =>
                        void patchClient.mutate({
                          profileId: c.id,
                          trackingFrequency: e.target.value,
                        })
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    >
                      {freqs.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-amber-100">Solicitudes del cliente</h2>
        <p className="mt-1 text-sm text-slate-400">
          Cambios de rutina, dolor u objetivos. Los clientes pueden avisarte desde su app para que revises métricas o ajustes
          cargas.
        </p>
        <ul className="mt-4 space-y-3">
          {(feedback.data ?? []).map((fb) => (
            <li key={fb.id} className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>{fb.client.user.name ?? fb.client.user.email}</span>
                <span>{new Date(fb.updatedAt).toLocaleString()}</span>
              </div>
              <div className="mt-2 text-sm font-semibold text-white">{fb.type}</div>
              <p className="mt-2 text-sm text-slate-200">{fb.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] uppercase tracking-wide text-amber-200">
                  {fb.status}
                </span>
                <button
                  type="button"
                  onClick={() => void patchFeedback.mutate({ id: fb.id, status: "REVIEWING" })}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-900"
                >
                  Marcar revisando
                </button>
                <button
                  type="button"
                  onClick={() => void patchFeedback.mutate({ id: fb.id, status: "CLOSED" })}
                  className="rounded-lg bg-emerald-800 px-2 py-1 text-[11px] text-white hover:bg-emerald-700"
                >
                  Cerrar
                </button>
              </div>
            </li>
          ))}
          {(feedback.data ?? []).length === 0 ? <li className="text-sm text-slate-500">Sin solicitudes por ahora.</li> : null}
        </ul>
      </section>
    </div>
  );
}
