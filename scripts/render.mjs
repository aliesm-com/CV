import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");

export function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shortLink(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function asciiText(value) {
  return String(value)
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("·", "|")
    .replaceAll("’", "'")
    .replaceAll("‘", "'");
}

function asciiPeriod(period) {
  return asciiText(period);
}

function groupExperience(experience) {
  const groups = [];
  for (const job of experience) {
    const prev = groups[groups.length - 1];
    if (prev && prev.company === job.company) prev.roles.push(job);
    else groups.push({ company: job.company, roles: [job] });
  }
  return groups;
}

function companySpan(roles) {
  if (roles.length === 1) return asciiPeriod(roles[0].period);
  const latest = asciiPeriod(roles[0].period).split("-").pop().trim();
  const earliest = asciiPeriod(roles[roles.length - 1].period).split("-")[0].trim();
  return `${earliest} - ${latest}`;
}

function renderSkillsDesigned(skills) {
  return Object.entries(skills)
    .map(
      ([label, items]) => `
      <div class="skill-group">
        <h3 class="skill-label">${escapeHtml(label)}</h3>
        <p class="skill-line">${items.map((item) => escapeHtml(item)).join(" · ")}</p>
      </div>`
    )
    .join("");
}

function renderSkillsAts(skills) {
  return Object.entries(skills)
    .map(
      ([label, items]) => `
      <p class="skill-line"><span class="skill-label">${escapeHtml(label)}:</span> ${items
        .map((item) => escapeHtml(item))
        .join(", ")}</p>`
    )
    .join("");
}

function renderExperienceDesigned(experience) {
  return groupExperience(experience)
    .map((group) => {
      const multi = group.roles.length > 1;
      const primary = group.roles[0];
      const rolesHtml = group.roles
        .map(
          (job, index) => `
        <div class="role ${index === group.roles.length - 1 ? "is-last" : ""}">
          <div class="job-top">
            <div>
              <h3 class="job-role">${escapeHtml(job.role)}</h3>
              <p class="job-meta">
                ${
                  multi
                    ? ""
                    : `<span class="company-inline">${escapeHtml(job.company)}</span><span class="sep">/</span>`
                }
                <span>${escapeHtml(job.employment)}</span>
                <span class="sep">/</span>
                <span>${escapeHtml(job.location)}</span>
              </p>
            </div>
            <time class="job-period">${escapeHtml(job.period)}</time>
          </div>
          <ul class="bullets">
            ${job.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
          </ul>
        </div>`
        )
        .join("");

      return `
      <article class="job ${multi ? "is-multi" : "is-single"}">
        <div class="job-rail" aria-hidden="true"></div>
        <div class="job-body">
          ${
            multi
              ? `<header class="company-head">
            <div>
              <h3 class="company-name">${escapeHtml(group.company)}</h3>
              <p class="company-sub">${group.roles.length} roles · ${escapeHtml(
                  primary.location.split(",")[0] || primary.location
                )}</p>
            </div>
            <time class="company-span">${escapeHtml(companySpan(group.roles))}</time>
          </header>`
              : ""
          }
          <div class="roles">${rolesHtml}</div>
        </div>
      </article>`;
    })
    .join("");
}

function renderExperienceAts(experience) {
  return groupExperience(experience)
    .map((group) => {
      const multi = group.roles.length > 1;
      if (!multi) {
        const job = group.roles[0];
        return `
      <article class="job">
        <div class="job-top">
          <h3 class="job-role">${escapeHtml(job.role)}</h3>
          <div class="job-period">${escapeHtml(asciiPeriod(job.period))}</div>
        </div>
        <p class="job-meta">${escapeHtml(job.company)} | ${escapeHtml(job.employment)} | ${escapeHtml(job.location)}</p>
        <ul class="bullets">
          ${job.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
        </ul>
      </article>`;
      }

      return `
      <section class="company-block">
        <div class="job-top">
          <h3 class="company-name">${escapeHtml(group.company)}</h3>
          <div class="company-span">${escapeHtml(companySpan(group.roles))}</div>
        </div>
        ${group.roles
          .map(
            (job) => `
        <div class="role">
          <div class="job-top">
            <h4 class="job-role">${escapeHtml(job.role)}</h4>
            <div class="job-period">${escapeHtml(asciiPeriod(job.period))}</div>
          </div>
          <p class="job-meta">${escapeHtml(job.employment)} | ${escapeHtml(job.location)}</p>
          <ul class="bullets">
            ${job.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
          </ul>
        </div>`
          )
          .join("")}
      </section>`;
    })
    .join("");
}

function renderEducationDesigned(education) {
  return education
    .map(
      (ed) => `
      <div class="edu-item">
        <div class="edu-top">
          <strong>${escapeHtml(ed.degree)}</strong>
          <span>${escapeHtml(ed.period)}</span>
        </div>
        <p>${escapeHtml(ed.school)}</p>
      </div>`
    )
    .join("");
}

function renderEducationAts(education) {
  return education
    .map(
      (ed) => `
      <p class="edu-item"><strong>${escapeHtml(asciiText(ed.degree))}</strong> | ${escapeHtml(
        asciiText(ed.school)
      )} | ${escapeHtml(asciiPeriod(ed.period))}</p>`
    )
    .join("");
}

function renderLanguagesDesigned(languages) {
  return `
    <ul class="lang-list">
      ${languages
        .map(
          (lang) => `
        <li>
          <strong>${escapeHtml(lang.name)}</strong>
          <span>${escapeHtml(lang.level)}</span>
        </li>`
        )
        .join("")}
    </ul>`;
}

function renderLanguagesAts(languages) {
  return languages
    .map(
      (lang) =>
        `<p class="lang-item"><strong>${escapeHtml(lang.name)}:</strong> ${escapeHtml(lang.level)}</p>`
    )
    .join("");
}

function splitProjects(projects) {
  const opensource = projects.filter((p) => (p.type || "opensource") === "opensource");
  const enterprise = projects.filter((p) => p.type === "enterprise");
  return { opensource, enterprise };
}

function renderProjectsDesigned(projects) {
  const { opensource, enterprise } = splitProjects(projects);
  const chips = (items) =>
    items
      .map(
        (p) =>
          `<a class="project-chip" href="${escapeHtml(p.url)}"><strong>${escapeHtml(p.name)}</strong></a>`
      )
      .join("");

  return `
    <div class="projects-panel">
      <div class="project-group">
        <div class="project-label">Enterprise</div>
        <div class="project-chips">${chips(enterprise)}</div>
      </div>
      <div class="project-group">
        <div class="project-label">Open Source</div>
        <div class="project-chips">${chips(opensource)}</div>
      </div>
    </div>`;
}

function renderProjectsAts(projects) {
  const { opensource, enterprise } = splitProjects(projects);
  const block = (label, items) =>
    `<p class="project-item"><span class="skill-label">${label}:</span> ${items
      .map(
        (p) =>
          `${escapeHtml(asciiText(p.name))} - ${escapeHtml(asciiText(p.description))} (${escapeHtml(
            shortLink(p.url)
          )})`
      )
      .join("; ")}</p>`;

  return `${block("Enterprise", enterprise)}${block("Open Source", opensource)}`;
}

function renderCertificationsDesigned(certifications) {
  return `
    <ul class="cert-list">
      ${certifications
        .map((cert) => {
          const title = typeof cert === "string" ? cert : cert.name;
          const issuer = typeof cert === "string" ? "" : cert.issuer || "";
          const url = typeof cert === "string" ? "" : cert.url || "";
          const nameHtml = url
            ? `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>`
            : escapeHtml(title);
          return `
        <li>
          <strong>${nameHtml}</strong>
          ${issuer ? `<span>${escapeHtml(issuer)}</span>` : ""}
        </li>`;
        })
        .join("")}
    </ul>`;
}

function renderCertificationsAts(certifications) {
  return certifications
    .map((cert) => {
      const title = typeof cert === "string" ? cert : cert.name;
      const issuer = typeof cert === "string" ? "" : cert.issuer || "";
      return `<p class="cert-item"><strong>${escapeHtml(title)}</strong>${
        issuer ? ` - ${escapeHtml(issuer)}` : ""
      }</p>`;
    })
    .join("");
}

function photoBlock(profile, showPhoto) {
  if (!showPhoto) return "";
  const photoPath = path.join(ROOT, profile.photo);
  const hasPhoto = fs.existsSync(photoPath);
  const src = hasPhoto ? `../${profile.photo}` : "";
  return `
    <div class="photo-frame" aria-label="Profile photo">
      ${
        hasPhoto
          ? `<img src="${src}" alt="${escapeHtml(profile.name)}" />`
          : `<div class="photo-placeholder">Add photo<br/>assets/photo.jpg</div>`
      }
    </div>`;
}

function toolbar(variants, currentFile) {
  const links = variants
    .map((v) => {
      const active = v.file === currentFile ? "active" : "";
      return `<a class="${active}" href="./${v.file}">${escapeHtml(v.label)}</a>`;
    })
    .join("");

  return `
    <nav class="toolbar">
      <span class="label">Preview</span>
      ${links}
      <button onclick="window.print()">Print / PDF</button>
    </nav>`;
}

function contactRowDesigned(profile) {
  const items = [
    `<span>${escapeHtml(profile.phone)}</span>`,
    `<a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>`,
    `<span>${escapeHtml(profile.location)}</span>`,
    `<a href="${escapeHtml(profile.links.linkedin)}">${escapeHtml(shortLink(profile.links.linkedin))}</a>`,
    `<a href="${escapeHtml(profile.links.github)}">${escapeHtml(shortLink(profile.links.github))}</a>`,
  ];
  if (profile.links.website) {
    items.push(
      `<a href="${escapeHtml(profile.links.website)}">${escapeHtml(shortLink(profile.links.website))}</a>`
    );
  }
  return items.join('<span class="contact-dot" aria-hidden="true"></span>');
}

function contactRowAts(profile) {
  const parts = [
    profile.phone,
    profile.email,
    asciiText(profile.location),
    shortLink(profile.links.linkedin),
    shortLink(profile.links.github),
  ];
  if (profile.links.website) parts.push(shortLink(profile.links.website));
  return escapeHtml(parts.join(" | "));
}

export function renderResume({ profile, role, showPhoto, variants, currentFile, mode = "designed" }) {
  if (mode === "ats") {
    return renderAtsResume({ profile, role, variants, currentFile });
  }

  const headerClass = showPhoto ? "hero" : "hero no-photo";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(profile.name)} — ${escapeHtml(role.targetRole)} resume" />
  <title>${escapeHtml(profile.name)} — ${escapeHtml(role.targetRole)}</title>
  <link rel="stylesheet" href="../styles/resume.css" />
</head>
<body>
  ${toolbar(variants, currentFile)}
  <main class="page" role="document">
    <header class="${headerClass}">
      <div class="hero-copy">
        <p class="role-chip">${escapeHtml(role.targetRole)}</p>
        <h1 class="name">${escapeHtml(profile.name)}</h1>
        <p class="headline">${escapeHtml(role.headline)}</p>
        <div class="contact">${contactRowDesigned(profile)}</div>
      </div>
      ${photoBlock(profile, showPhoto)}
    </header>

    <div class="body">
      <div class="main">
        <section class="block">
          <h2 class="section-title"><span>01</span> Professional Summary</h2>
          <p class="summary">${escapeHtml(role.summary)}</p>
        </section>
        <section class="block">
          <h2 class="section-title"><span>02</span> Experience</h2>
          <div class="timeline">${renderExperienceDesigned(role.experience)}</div>
        </section>
        <section class="block projects-block">
          <h2 class="section-title"><span>03</span> Projects</h2>
          ${renderProjectsDesigned(profile.projects)}
        </section>
      </div>
      <aside class="side">
        <section class="block">
          <h2 class="section-title"><span>04</span> Skills</h2>
          ${renderSkillsDesigned(role.skills)}
        </section>
        <section class="block">
          <h2 class="section-title"><span>05</span> Education</h2>
          ${renderEducationDesigned(profile.education)}
        </section>
        <section class="block">
          <h2 class="section-title"><span>06</span> Certifications</h2>
          ${renderCertificationsDesigned(profile.certifications)}
        </section>
        <section class="block">
          <h2 class="section-title"><span>07</span> Languages</h2>
          ${renderLanguagesDesigned(profile.languages)}
          <ul class="extra-list compact">
            ${profile.volunteering.map((v) => `<li><strong>Volunteer</strong> ${escapeHtml(v)}</li>`).join("")}
          </ul>
        </section>
      </aside>
    </div>
  </main>
</body>
</html>`;
}

function renderAtsResume({ profile, role, variants, currentFile }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(profile.name)} — ${escapeHtml(role.targetRole)} ATS resume" />
  <title>${escapeHtml(profile.name)} — ${escapeHtml(role.targetRole)} (ATS)</title>
  <link rel="stylesheet" href="../styles/ats.css" />
</head>
<body>
  ${toolbar(variants, currentFile)}
  <main class="page" role="document">
    <header class="header">
      <h1 class="name">${escapeHtml(profile.name)}</h1>
      <p class="target-role">${escapeHtml(asciiText(role.targetRole))}</p>
      <p class="headline">${escapeHtml(asciiText(role.headline))}</p>
      <p class="contact">${contactRowAts(profile)}</p>
    </header>

    <section class="section">
      <h2 class="section-title">SUMMARY</h2>
      <p class="summary">${escapeHtml(asciiText(role.summary))}</p>
    </section>

    <section class="section">
      <h2 class="section-title">EXPERIENCE</h2>
      ${renderExperienceAts(role.experience)}
    </section>

    <section class="section">
      <h2 class="section-title">PROJECTS</h2>
      ${renderProjectsAts(profile.projects)}
    </section>

    <section class="section">
      <h2 class="section-title">SKILLS</h2>
      ${renderSkillsAts(role.skills)}
    </section>

    <section class="section">
      <h2 class="section-title">EDUCATION</h2>
      ${renderEducationAts(profile.education)}
    </section>

    <section class="section">
      <h2 class="section-title">CERTIFICATIONS</h2>
      ${renderCertificationsAts(profile.certifications)}
    </section>

    <section class="section">
      <h2 class="section-title">LANGUAGES</h2>
      ${renderLanguagesAts(profile.languages)}
    </section>

    <section class="section">
      <h2 class="section-title">VOLUNTEERING</h2>
      ${profile.volunteering.map((v) => `<p class="vol-item">${escapeHtml(v)}</p>`).join("")}
    </section>
  </main>
</body>
</html>`;
}

export function listVariants() {
  return [
    {
      id: "senior-software-engineer",
      roleFile: "content/senior-software-engineer.json",
      showPhoto: true,
      mode: "designed",
      file: "senior-software-engineer-with-photo.html",
      pdf: "Ali_Esmaeili_Senior_Software_Engineer_With_Photo.pdf",
      label: "Senior · Photo",
    },
    {
      id: "senior-software-engineer",
      roleFile: "content/senior-software-engineer.json",
      showPhoto: false,
      mode: "designed",
      file: "senior-software-engineer-no-photo.html",
      pdf: "Ali_Esmaeili_Senior_Software_Engineer_No_Photo.pdf",
      label: "Senior · No Photo",
    },
    {
      id: "principal-tech-lead",
      roleFile: "content/principal-tech-lead.json",
      showPhoto: true,
      mode: "designed",
      file: "principal-tech-lead-with-photo.html",
      pdf: "Ali_Esmaeili_Principal_Tech_Lead_With_Photo.pdf",
      label: "Lead · Photo",
    },
    {
      id: "principal-tech-lead",
      roleFile: "content/principal-tech-lead.json",
      showPhoto: false,
      mode: "designed",
      file: "principal-tech-lead-no-photo.html",
      pdf: "Ali_Esmaeili_Principal_Tech_Lead_No_Photo.pdf",
      label: "Lead · No Photo",
    },
    {
      id: "senior-software-engineer",
      roleFile: "content/senior-software-engineer.json",
      showPhoto: false,
      mode: "ats",
      file: "senior-software-engineer-ats.html",
      pdf: "Ali_Esmaeili_Senior_Software_Engineer_ATS.pdf",
      label: "Senior · ATS",
    },
    {
      id: "principal-tech-lead",
      roleFile: "content/principal-tech-lead.json",
      showPhoto: false,
      mode: "ats",
      file: "principal-tech-lead-ats.html",
      pdf: "Ali_Esmaeili_Principal_Tech_Lead_ATS.pdf",
      label: "Lead · ATS",
    },
  ];
}
