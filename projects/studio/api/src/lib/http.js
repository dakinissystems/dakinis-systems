export function sendJson(res, body, status = 200) {
  if (body === null && status === 204) {
    res.writeHead(204, { "X-Dakinis-Service": "dakinis-studio-api" });
    res.end();
    return { status: 204, body: null };
  }
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "X-Dakinis-Service": "dakinis-studio-api",
  });
  res.end(payload);
  return { status, body };
}

export function notFound(res) {
  return sendJson(res, { error: "not_found" }, 404);
}

export function badRequest(res, message) {
  return sendJson(res, { error: "bad_request", message }, 400);
}

export function conflict(res, message) {
  return sendJson(res, { error: "conflict", message }, 409);
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export async function parseJson(req) {
  const raw = await readBody(req);
  if (!raw) return {};
  return JSON.parse(raw);
}
