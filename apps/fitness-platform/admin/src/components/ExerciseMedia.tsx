import { useEffect, useState } from "react";
import { API_BASE, getToken } from "../api.ts";

export type ParsedExerciseMedia =
  | { type: "youtube"; embedUrl: string; original: string }
  | { type: "vimeo"; embedUrl: string; original: string }
  | { type: "upload"; path: string }
  | { type: "direct"; href: string }
  | { type: "open"; href: string };

export function parseExerciseMedia(url: string): ParsedExerciseMedia | null {
  const t = url.trim();
  if (!t) return null;
  if (t.startsWith("/api/media/")) return { type: "upload", path: t };

  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");
  const original = t;

  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return id
      ? { type: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, original }
      : { type: "open", href: original };
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = u.searchParams.get("v");
    if (v)
      return { type: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${v}`, original };
    const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
    if (shorts)
      return {
        type: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${shorts[1]}`,
        original,
      };
    const embed = u.pathname.match(/^\/embed\/([^/?]+)/);
    if (embed)
      return {
        type: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${embed[1]}`,
        original,
      };
    return { type: "open", href: original };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const fromPlayer = u.pathname.match(/^\/video\/(\d+)/);
    if (fromPlayer)
      return {
        type: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${fromPlayer[1]}`,
        original,
      };
    const m = u.pathname.match(/^\/(\d+)/);
    const id = m?.[1];
    if (id) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}`, original };
    return { type: "open", href: original };
  }

  if (/\.(mp4|webm|mov)(\?|$)/i.test(u.pathname + u.search)) {
    return { type: "direct", href: original };
  }
  return { type: "open", href: original };
}

function TenantBlobVideo({ path }: { path: string }) {
  const [blobUrl, setBlobUrl] = useState<string | undefined>();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let tmp: string | undefined;
    const token = getToken();

    void (async () => {
      try {
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}${path}`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (!active) return;
        tmp = URL.createObjectURL(blob);
        setBlobUrl(tmp);
        setErr(null);
      } catch {
        if (active) {
          setErr("No se pudo cargar el vídeo");
          setBlobUrl(undefined);
        }
      }
    })();

    return () => {
      active = false;
      if (tmp) URL.revokeObjectURL(tmp);
    };
  }, [path]);

  if (err) return <p className="text-xs text-rose-300">{err}</p>;
  if (!blobUrl) return <p className="text-xs text-slate-500">Cargando vídeo…</p>;

  return (
    <video controls className="mt-2 w-full max-h-40 rounded-lg border border-slate-700 bg-black" src={blobUrl} />
  );
}

const iframeTitle = "Vídeo del ejercicio";

export function ExerciseMedia({
  videoUrl,
  compact,
}: {
  videoUrl: string | null | undefined;
  compact?: boolean;
}) {
  const parsed = videoUrl ? parseExerciseMedia(videoUrl) : null;
  if (!parsed) return null;

  if (parsed.type === "youtube" || parsed.type === "vimeo") {
    return (
      <div className="space-y-1">
        <div className={`overflow-hidden rounded-lg border border-slate-700 bg-black ${compact ? "max-w-xs" : "max-w-md"}`}>
          <div className="relative aspect-video w-full">
            <iframe
              title={iframeTitle}
              src={parsed.embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
        <a
          href={parsed.original}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-200 underline underline-offset-2"
        >
          Abrir en pestaña nueva
        </a>
      </div>
    );
  }

  if (parsed.type === "upload") {
    return <TenantBlobVideo path={parsed.path} />;
  }

  if (parsed.type === "direct") {
    return (
      <video controls className="mt-2 w-full max-h-48 rounded-lg border border-slate-700 bg-black" src={parsed.href} />
    );
  }

  return (
    <a
      href={parsed.href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex text-xs text-sky-300 underline"
    >
      Ver enlace
    </a>
  );
}
