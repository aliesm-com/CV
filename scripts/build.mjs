import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
import { ROOT, listVariants, readJson, renderResume } from "./render.mjs";

const htmlOnly = process.argv.includes("--html-only");
const outDir = path.join(ROOT, "output");
const previewDir = path.join(ROOT, "preview");

function ensureDirs() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });
  fs.mkdirSync(path.join(ROOT, "assets"), { recursive: true });
}

function writeHtml(variants) {
  const profile = readJson("content/profile.json");
  const roleCache = new Map();

  for (const variant of variants) {
    if (!roleCache.has(variant.roleFile)) {
      roleCache.set(variant.roleFile, readJson(variant.roleFile));
    }

    const html = renderResume({
      profile,
      role: roleCache.get(variant.roleFile),
      showPhoto: variant.showPhoto,
      mode: variant.mode || "designed",
      variants,
      currentFile: variant.file,
    });

    fs.writeFileSync(path.join(previewDir, variant.file), html, "utf8");
    console.log(`HTML  → preview/${variant.file}`);
  }

  const index = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ali Esmaeili — Resume Preview</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 20px; color: #12171f; }
    a { color: #0284c7; }
    li { margin: 8px 0; }
    code { background: #f4f7fb; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>Resume Preview</h1>
  <p>Edit JSON in <code>content/</code>, then run <code>npm run build</code>.</p>
  <ol>
    ${variants.map((v) => `<li><a href="./${v.file}">${v.label}</a> → PDF: <code>output/${v.pdf}</code></li>`).join("")}
  </ol>
</body>
</html>`;

  fs.writeFileSync(path.join(previewDir, "index.html"), index, "utf8");
}

async function writePdfs(variants) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });

  try {
    for (const variant of variants) {
      const page = await browser.newPage();
      // Avoid networkidle0 — it waited on Google Fonts and bloated embeds.
      const fileUrl = `file://${path.join(previewDir, variant.file)}`;
      await page.emulateMediaType("print");
      await page.goto(fileUrl, { waitUntil: "load" });
      await page.evaluate(async () => {
        document.querySelector(".toolbar")?.remove();
        if (document.fonts?.ready) await document.fonts.ready;
      });
      await page.pdf({
        path: path.join(outDir, variant.pdf),
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        preferCSSPageSize: true,
        tagged: false,
        outline: false,
      });
      await page.close();
      const sizeKb = Math.round(fs.statSync(path.join(outDir, variant.pdf)).size / 1024);
      console.log(`PDF   → output/${variant.pdf} (${sizeKb} KB)`);
    }
  } finally {
    await browser.close();
  }
}

ensureDirs();
const variants = listVariants();
writeHtml(variants);

if (!htmlOnly) {
  await writePdfs(variants);
  console.log("\nDone. Open preview/index.html or files in output/.");
} else {
  console.log("\nHTML only. Run npm run preview to review.");
}
