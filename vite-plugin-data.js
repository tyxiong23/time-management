import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve("data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(key) {
  // Sanitize key to prevent path traversal
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(DATA_DIR, `${safe}.json`);
}

export default function dataPlugin() {
  return {
    name: "labflow-data",
    configureServer(server) {
      ensureDataDir();

      // GET /api/data/:key
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/data\/([a-zA-Z0-9_-]+)$/);
        if (!match) return next();

        const key = match[1];
        const fp = filePath(key);

        if (req.method === "GET") {
          if (fs.existsSync(fp)) {
            res.setHeader("Content-Type", "application/json");
            res.end(fs.readFileSync(fp, "utf-8"));
          } else {
            res.statusCode = 404;
            res.end("null");
          }
          return;
        }

        if (req.method === "PUT") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            fs.writeFileSync(fp, body, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }

        next();
      });
    },
  };
}
