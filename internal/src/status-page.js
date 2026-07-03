/** Página de estado mínima — copia alineada con platform scaffolds. */
export function renderStatusPage({ service, title, phase, description, endpoints = [] }) {
  const list = endpoints.map((e) => `<li><code>${e}</code></li>`).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Dakinis Platform</title>
  <style>
    :root { --bg:#08111d; --surface:#122840; --text:#f0f4f9; --muted:#b8c6d9; --accent:#2dd4bf; --line:#23415f; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, system-ui, sans-serif; background: var(--bg); color: var(--text); display: grid; place-items: center; padding: 1.5rem; }
    main { max-width: 32rem; width: 100%; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 1.5rem 1.75rem; }
    h1 { margin: 0 0 .25rem; font-size: 1.35rem; }
    .badge { display: inline-block; margin-bottom: 1rem; padding: .2rem .55rem; border-radius: 999px; font-size: .75rem; font-weight: 600; background: rgba(45,212,191,.15); color: var(--accent); border: 1px solid rgba(45,212,191,.35); }
    p { color: var(--muted); line-height: 1.5; margin: 0 0 1rem; }
    ul { margin: 0; padding-left: 1.15rem; color: var(--muted); }
    code { color: var(--accent); font-size: .9em; }
    footer { margin-top: 1.25rem; font-size: .8rem; color: var(--muted); }
    a { color: var(--accent); }
  </style>
</head>
<body>
  <main>
    <span class="badge">${phase}</span>
    <h1>${title}</h1>
    <p>${description}</p>
    <p><strong>Service:</strong> <code>${service}</code></p>
    <ul>${list}</ul>
    <footer>Dakinis Platform · Internal API · <a href="/health">/health</a></footer>
  </main>
</body>
</html>`;
}

export function sendHtml(res, status, html, service) {
  const payload = html;
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "X-Dakinis-Service": service,
  });
  res.end(payload);
}
