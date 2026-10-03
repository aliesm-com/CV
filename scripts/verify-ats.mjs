import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
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
  "2023 - Present",
];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const file of files) {
    const pdfPath = path.join(ROOT, "output", file);
    const page = await browser.newPage();
    // Load via Chrome PDF viewer is unreliable; extract by printing HTML text instead
    // and also dump selectable text using pdf.js-like approach via file protocol + embed.
    const htmlAts = file.includes("Senior")
      ? "senior-software-engineer-ats.html"
      : "principal-tech-lead-ats.html";
    await page.goto(`file://${path.join(ROOT, "preview", htmlAts)}`, { waitUntil: "load" });
    await page.evaluate(() => document.querySelector(".toolbar")?.remove());
    const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());
    fs.writeFileSync(path.join(ROOT, "output", file.replace(".pdf", "_extract.txt")), text, "utf8");

    const missing = required.filter((k) => !text.includes(k));
    console.log(`\n${file}`);
    console.log(`  extract chars: ${text.length}`);
    console.log(`  missing: ${missing.length ? missing.join(", ") : "none"}`);
    console.log(`  sample education: ${text.match(/Bachelor[\s\S]{0,80}/)?.[0] || "n/a"}`);
    await page.close();
  }
} finally {
  await browser.close();
}
