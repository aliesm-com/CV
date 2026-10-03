# Ali Esmaeili — Resume Builder

Editable, ATS-friendly resume project with a developer-focused design and PDF export.

## Variants

| Target role | Photo | Preview | PDF |
|---|---|---|---|
| Senior Software Engineer | Yes | `preview/senior-software-engineer-with-photo.html` | `output/Ali_Esmaeili_Senior_Software_Engineer_With_Photo.pdf` |
| Senior Software Engineer | No | `preview/senior-software-engineer-no-photo.html` | `output/Ali_Esmaeili_Senior_Software_Engineer_No_Photo.pdf` |
| Principal / Tech Lead | Yes | `preview/principal-tech-lead-with-photo.html` | `output/Ali_Esmaeili_Principal_Tech_Lead_With_Photo.pdf` |
| Principal / Tech Lead | No | `preview/principal-tech-lead-no-photo.html` | `output/Ali_Esmaeili_Principal_Tech_Lead_No_Photo.pdf` |
| Senior Software Engineer | ATS single-column | `preview/senior-software-engineer-ats.html` | `output/Ali_Esmaeili_Senior_Software_Engineer_ATS.pdf` |
| Principal / Tech Lead | ATS single-column | `preview/principal-tech-lead-ats.html` | `output/Ali_Esmaeili_Principal_Tech_Lead_ATS.pdf` |

## Quick start

```bash
npm install
npm run build
npm run preview
```

Open [http://localhost:4173](http://localhost:4173).

## How to edit

All content is JSON — no need to touch HTML for normal updates:

- `content/profile.json` — name, contacts, education, languages, photo path
- `content/senior-software-engineer.json` — Senior SWE summary, skills, experience
- `content/principal-tech-lead.json` — Team Lead / Principal summary, skills, experience
- `styles/resume.css` — visual theme
- `assets/photo.svg` — temporary placeholder

### Add your real photo

1. Put your photo at `assets/photo.jpg` (square crop works best)
2. Update `content/profile.json`:

```json
"photo": "assets/photo.jpg"
```

3. Rebuild:

```bash
npm run build
```

## Export PDF

```bash
npm run build
```

PDFs land in `output/`.

Browser load stays fast because fonts are local WOFF2 files in `assets/fonts/` (no Google Fonts network fetch / giant embeds). Photo quality is kept high.

You can also open any HTML preview and use **Print → Save as PDF**.

## ATS notes

- Real selectable text (not an image-based resume body)
- Standard headings: Professional Summary, Experience, Skills, Education
- Skills rendered as plain text lines (better ATS parse than icon grids)
- Keyword coverage: Python, Django, Go, LLMs, NLP, Streamlit, n8n, Ansible, Docker, CI/CD, team leadership
- For ATS portals use `*_ATS.pdf` (single-column, Arial, no photo, standard headings)
- Designed `*_With_Photo.pdf` / `*_No_Photo.pdf` are for humans / email
- Links: [LinkedIn](https://www.linkedin.com/in/aliesm-com/), [GitHub](https://github.com/aliesm-com), [Website](https://aliesm.com)

Verify ATS text extract:

```bash
npm run verify:ats
```

## Suggested usage

- LinkedIn Easy Apply / company portals → `*_No_Photo.pdf`
- Direct email to hiring managers → `*_With_Photo.pdf`
- IC senior roles → Senior Software Engineer variants
- Lead / Principal / engineering management-leaning roles → Principal Tech Lead variants
