import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "node:crypto";

const store = new AsyncLocalStorage();

export function requestIdFrom(req) {
  const header = req.headers["x-request-id"];
  const value = typeof header === "string" ? header.trim() : "";
  if (/^[\w.:-]{8,128}$/.test(value)) return value;
  return crypto.randomUUID();
}

export function runWithRequest(req, fn) {
  return store.run({ requestId: requestIdFrom(req) }, fn);
}

export function currentRequestId() {
  return store.getStore()?.requestId;
}
