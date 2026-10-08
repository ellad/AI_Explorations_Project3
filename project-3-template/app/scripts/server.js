import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function resolvePath(pathname) {
  const decodedPath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidate = normalize(join(root, decodedPath || "index.html"));
  if (!candidate.startsWith(root)) return null;

  try {
    return statSync(candidate).isDirectory() ? join(candidate, "index.html") : candidate;
  } catch {
    return null;
  }
}

createServer((request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const filePath = resolvePath(pathname);

  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Cloud Closet is available at http://127.0.0.1:${port}`);
});
