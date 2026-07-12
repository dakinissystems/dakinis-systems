import { readBody, sendJson } from "../lib/http.js";
import { requireAuth } from "../middleware/auth.js";
import * as tracks from "./tracks.js";
import * as playlists from "./playlists.js";
import * as rooms from "./rooms.js";
import * as streams from "./streams.js";
import * as skins from "./skins.js";

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {import('node:url').UrlWithParsedQuery} url
 */
export async function handleRequest(req, res, url) {
  const method = req.method ?? "GET";
  const path = url.pathname ?? "/";

  if (method === "GET" && path === "/health") {
    return sendJson(res, 200, { ok: true, service: "akoenet-media", version: "0.1.0" });
  }

  if (!path.startsWith("/media")) {
    return sendJson(res, 404, { error: "not_found" });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const rest = path.slice("/media".length) || "/";

  if (rest === "/tracks" && method === "GET") return tracks.list(req, res, user);
  if (rest === "/tracks" && method === "POST") return tracks.create(req, res, user);
  if (rest.startsWith("/tracks/") && method === "GET") {
    return tracks.getOne(req, res, user, rest.slice("/tracks/".length));
  }
  if (rest.startsWith("/tracks/") && method === "DELETE") {
    return tracks.remove(req, res, user, rest.slice("/tracks/".length));
  }

  if (rest === "/playlists" && method === "GET") return playlists.list(req, res, user);
  if (rest === "/playlists" && method === "POST") return playlists.create(req, res, user);
  if (rest.match(/^\/playlists\/[^/]+$/) && method === "GET") {
    return playlists.getOne(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/playlists\/[^/]+$/) && method === "PATCH") {
    return playlists.patch(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/playlists\/[^/]+$/) && method === "DELETE") {
    return playlists.remove(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/playlists\/[^/]+\/tracks$/) && method === "PUT") {
    return playlists.reorder(req, res, user, rest.split("/")[2]);
  }

  if (rest === "/favorites" && method === "GET") return tracks.listFavorites(req, res, user);
  if (rest.match(/^\/favorites\/[^/]+$/) && method === "POST") {
    return tracks.addFavorite(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/favorites\/[^/]+$/) && method === "DELETE") {
    return tracks.removeFavorite(req, res, user, rest.split("/")[2]);
  }

  if (rest === "/rooms" && method === "POST") return rooms.create(req, res, user);
  if (rest.match(/^\/rooms\/[^/]+$/) && method === "GET") {
    return rooms.getOne(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/rooms\/[^/]+\/join$/) && method === "POST") {
    return rooms.join(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/rooms\/[^/]+\/leave$/) && method === "POST") {
    return rooms.leave(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/rooms\/[^/]+\/state$/) && method === "PATCH") {
    return rooms.patchState(req, res, user, rest.split("/")[2]);
  }

  if (rest === "/streams/search" && method === "GET") return streams.search(req, res, user, url);
  if (rest === "/streams/favorites" && method === "GET") return streams.favorites(req, res, user);

  if (rest === "/skins" && method === "GET") return skins.list(req, res, user);
  if (rest.match(/^\/skins\/[^/]+\/manifest$/) && method === "GET") {
    return skins.manifest(req, res, user, rest.split("/")[2]);
  }
  if (rest.match(/^\/skins\/[^/]+\/install$/) && method === "POST") {
    return skins.install(req, res, user, rest.split("/")[2]);
  }

  return sendJson(res, 404, { error: "not_found", path: rest });
}

export { readBody };
