import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname);
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const backendOrigin = process.env.AGENTPAY_BACKEND_ORIGIN || "http://127.0.0.1:3000";
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || process.env.AGENTPAY_SESSION_TOKEN_SECRET || process.env.AGENTPAY_ADMIN_TOKEN_SECRET || "development-session-token-secret";
const adminCookieName = "agentpay_admin_session";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8"
};

function resolveStaticPath(requestUrl) {
  const { pathname } = new URL(requestUrl, `http://${host}:${port}`);
  const cleanPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const directPath = normalize(join(root, cleanPath));

  if (!directPath.startsWith(root)) {
    return null;
  }

  if (!extname(directPath) && existsSync(`${directPath}.html`)) {
    return `${directPath}.html`;
  }

  if (existsSync(directPath) && statSync(directPath).isFile()) {
    return directPath;
  }

  return null;
}

function safeEqualText(left, right) {
  const leftBytes = Buffer.from(String(left));
  const rightBytes = Buffer.from(String(right));
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function parseCookies(request) {
  return Object.fromEntries(String(request.headers.cookie || "").split(";").map((part) => {
    const [name, ...rest] = part.trim().split("=");
    return [name, decodeURIComponent(rest.join("=") || "")];
  }).filter(([name]) => name));
}

function verifyAdminCookie(request) {
  const token = parseCookies(request)[adminCookieName];
  const match = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(token || "");
  if (!match) return false;
  const [, subject, signature] = match;
  const expectedSignature = createHmac("sha256", adminSessionSecret).update(subject).digest("base64url");
  if (!safeEqualText(signature, expectedSignature)) return false;
  const payload = JSON.parse(Buffer.from(subject, "base64url").toString("utf8"));
  return payload.role === "admin" && payload.expiresAt > Date.now();
}

function sendLoginPage(response) {
  response.writeHead(401, { "content-type": "text/html; charset=utf-8" });
  response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AgentPay Admin Login</title>
    <link rel="stylesheet" href="./app.css">
  </head>
  <body class="login-body">
    <main class="login-shell">
      <section class="panel login-panel">
        <p class="eyebrow">AgentPay Admin</p>
        <h1>Marketplace Listing Dashboard</h1>
        <p class="form-note">Admin login is required before opening the backend dashboard.</p>
        <form class="stack-form" method="post" action="${backendOrigin}/api/auth/login">
          <label>Username <input name="username" autocomplete="username" required></label>
          <label>Password <input name="password" type="password" autocomplete="current-password" required></label>
          <button class="primary-button" type="submit">Log In</button>
        </form>
      </section>
    </main>
  </body>
</html>`);
}

createServer((request, response) => {
  const { pathname } = new URL(request.url || "/", `http://${host}:${port}`);
  if ((pathname === "/app" || pathname === "/app.html") && !verifyAdminCookie(request)) {
    sendLoginPage(response);
    return;
  }

  const filePath = resolveStaticPath(request.url || "/");

  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const contentType = mimeTypes[extname(filePath)] || "application/octet-stream";
  response.writeHead(200, { "content-type": contentType });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`AgentPay preview: http://${host}:${port}/`);
});
