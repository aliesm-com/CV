import fs from "node:fs";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { ROOT } from "./render.mjs";

const files = [
  "Ali_Esmaeili_Senior_Software_Engineer_ATS.pdf",
  "Ali_Esmaeili_Principal_Tech_Lead_ATS.pdf",
];

const required = [
  "SUMMARY",
  "EXPERIENCE",
  "SKILLS",
  "EDUCATION",
  "Python",
  "Django",
  "Go",
  "Docker",
  "Ansible",
  "Streamlit",
  "n8n",
  "Islamic Azad University",
  "2018 - 2022",
  "2022 - 2026",
  "Bachelor",
];

for (const file of files) {
  const buf = fs.readFileSync(path.join(ROOT, "output", file));
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  const raw = result.text || "";
  const text = raw.replace(/\s+/g, " ").trim();
  fs.writeFileSync(path.join(ROOT, "output", file.replace(".pdf", "_extract.txt")), raw, "utf8");

  const missing = required.filter((k) => !text.includes(k));
  console.log(`\n${file}`);
  console.log(`  chars: ${text.length}`);
  console.log(`  missing: ${missing.length ? missing.join(", ") : "none"}`);
  console.log(`  education: ${text.match(/Bachelor[\s\S]{0,100}/)?.[0]?.replace(/\s+/g, " ") || "n/a"}`);
  await parser.destroy?.();
}
