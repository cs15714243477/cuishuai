const allowedOrigins = new Set([
  "https://lnlxkj.com",
  "https://www.lnlxkj.com",
  "https://cs15714243477.github.io",
  "null",
  "http://localhost:8787",
  "http://127.0.0.1:8787",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "";
  const allowOrigin = allowedOrigins.has(origin) ? origin : "https://lnlxkj.com";
  return {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "vary": "Origin",
  };
}

const fallbackHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "https://lnlxkj.com",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
};

const pluginFiles = {
  "/plugin/annotateweb.js": {
    key: "plugin/annotateweb.js",
    type: "application/javascript; charset=utf-8",
  },
  "/plugin/html2canvas.min.js": {
    key: "plugin/html2canvas.min.js",
    type: "application/javascript; charset=utf-8",
  },
};

function json(data, init = {}, request) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...(request ? corsHeaders(request) : fallbackHeaders), ...(init.headers || {}) },
  });
}

function normalizePageKey(value) {
  return String(value || "/")
    .replace(/^https?:\/\/[^/]+/i, "")
    .split("#")[0]
    .trim() || "/";
}

function storageKey(siteId, pageKey) {
  const safeSite = String(siteId || "default").replace(/[^\w.-]/g, "_");
  return `${safeSite}:${normalizePageKey(pageKey)}`;
}

function cleanOperation(op) {
  if (!op || typeof op !== "object") return null;
  const allowed = {};
  for (const key of [
    "tool", "color", "lineWidth", "compositeOperation", "points", "startX",
    "startY", "endX", "endY", "centerX", "centerY", "radius", "text",
    "x", "y", "font", "lineHeight", "author", "createdAt", "updatedAt",
  ]) {
    if (Object.prototype.hasOwnProperty.call(op, key)) allowed[key] = op[key];
  }
  return allowed.tool ? allowed : null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    if (pluginFiles[url.pathname]) {
      const asset = pluginFiles[url.pathname];
      const body = await env.ANNOTATIONS.get(asset.key);
      if (!body) {
        return new Response("Plugin asset not found", {
          status: 404,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
      return new Response(body, {
        headers: {
          "content-type": asset.type,
          "cache-control": "public, max-age=300",
          "access-control-allow-origin": "*",
        },
      });
    }

    if (!url.pathname.startsWith("/annotations")) {
      return json({ ok: false, message: "Not found" }, { status: 404 }, request);
    }

    if (!env.ANNOTATIONS) {
      return json({ ok: false, message: "Missing ANNOTATIONS binding" }, { status: 500 }, request);
    }

    if (request.method === "GET") {
      const siteId = url.searchParams.get("siteId") || "default";
      const pageKey = normalizePageKey(url.searchParams.get("pageKey"));
      const key = storageKey(siteId, pageKey);
      const stored = await env.ANNOTATIONS.get(key, "json");
      return json(stored || {
        siteId,
        pageKey,
        annotations: [],
        updatedAt: null,
      }, {}, request);
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return json({ ok: false, message: "Invalid JSON body" }, { status: 400 }, request);
      }

      const siteId = String(body.siteId || "default").slice(0, 80);
      const pageKey = normalizePageKey(body.pageKey || body.url);
      const annotations = Array.isArray(body.annotations)
        ? body.annotations.map(cleanOperation).filter(Boolean).slice(0, 2000)
        : [];

      const payload = {
        siteId,
        pageKey,
        pageTitle: String(body.title || "").slice(0, 200),
        pageUrl: String(body.url || "").slice(0, 500),
        annotations,
        updatedAt: new Date().toISOString(),
      };

      await env.ANNOTATIONS.put(storageKey(siteId, pageKey), JSON.stringify(payload));
      return json({ ok: true, count: annotations.length, updatedAt: payload.updatedAt }, {}, request);
    }

    if (request.method === "DELETE") {
      const siteId = url.searchParams.get("siteId") || "default";
      const pageKey = normalizePageKey(url.searchParams.get("pageKey"));
      await env.ANNOTATIONS.delete(storageKey(siteId, pageKey));
      return json({ ok: true }, {}, request);
    }

    return json({ ok: false, message: "Method not allowed" }, { status: 405 }, request);
  },
};
