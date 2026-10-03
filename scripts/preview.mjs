import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { ROOT } from "./render.mjs";

const port = Number(process.env.PORT || 4173);
const previewDir = path.join(ROOT, "preview");

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    }[ext] || "application/octet-stream"
  );
}

function rebuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/build.mjs", "--html-only"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build failed with code ${code}`));
    });
  });
}

await rebuild();

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let rel = urlPath === "/" ? "/preview/index.html" : urlPath;

  if (rel.startsWith("/styles/")) rel = rel;
  else if (rel.startsWith("/assets/")) rel = rel;
  else if (rel.startsWith("/preview/")) rel = rel;
  else rel = path.posix.join("/preview", rel);

  const filePath = path.join(ROOT, rel.replace(/^\//, ""));
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`\nResume preview: http://localhost:${port}`);
  console.log("Edit content/*.json then re-run npm run build (or restart preview).\n");
});
