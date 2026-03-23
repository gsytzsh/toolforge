# ToolForge

Free online developer tools collection: JSON formatter, Base64 encoder, UUID generator, JWT tools, PDF converters, SEO utilities and more.

**Live site:** [toolforge.site](https://toolforge.site)

## Features

- **212 tools** across 14 categories
- **Category landing pages** – dedicated pages per category for SEO
- **No backend required** – all tools run in the browser
- **Static site** – HTML, CSS, vanilla JS
- **SEO-friendly** – sitemap, meta tags, canonical URLs, Schema.org, breadcrumbs, related tools
- **Mobile-friendly** – hamburger nav on small screens, back-to-top on tool pages
- **Custom 404** – friendly error page with links to popular tools

## Categories

| Category | Examples |
|----------|----------|
| JSON & API | JSON Viewer, JSON Diff, JSON to CSV/XML/YAML |
| Encoding & Decoding | Base64, URL Encode, HTML Escape, Hex, Morse Code, Gzip, Punycode |
| Text Tools | Case Converter, Lorem Ipsum, Slug, Word Frequency, Text Statistics |
| Images & Colors | Color Picker, Image to Base64, Image Resize, SVG Viewer |
| PDF & Export | JSON/CSV/Excel/Image/Markdown/HTML to PDF |
| Date & Time | Timestamp, Timezone, Calendar, Stopwatch, Countdown |
| Productivity | Notes & Lists, Reading Time, Speech Time |
| Calculators | Loan, BMI, Percentage, Scientific, Date Diff |
| Generators | UUID, Random Number, Random String |
| Unit Converters | Length, Weight, Temperature, Area, Volume |
| Security & Tokens | Password Generator, Hash, JWT, UUID |
| Web & Network | IP Info, HTTP Status, URL Parser, Viewport Size |
| SEO Tools | Robots.txt, Sitemap, Schema, OG, UTM, Canonical |
| Developer Tools | Regex, SQL Formatter, HTML/XML Formatter, Cron, Unicode Reference |

## Project Structure

```
toolforge/
├── index.html              # Homepage 
├── 404.html                # Custom 404 page
├── tools-list.json         # Tool catalog (name, category, popular)
├── sitemap.xml             # Generated sitemap
├── favicon.png             # Site favicon
├── css/style.css           # Global styles
├── js/
│   ├── index.js            # Homepage logic, search, categories, top nav
│   └── tool-common.js      # Tool pages: top nav, breadcrumb, related tools, Schema
├── tools/                  # 212 tool pages (*.html)
├── category/               # 14 category landing pages (generated)
└── scripts/
    ├── build.js                    # Unified build (category pages + sitemap)
    ├── generate-sitemap.js         # Build sitemap from tools-list.json
    ├── generate-category-pages.js  # Generate category/*.html
    ├── normalize-tool-pages.js     # Canonical, OG, Twitter meta
    └── normalize-seo-titles.js    # Title/description typography
```

## Local Development

1. Clone the repo and serve the project with any static server:

```bash
# Python
python3 -m http.server 8000

# Node (npx serve)
npx serve .

# Or open index.html directly (some tools may need a server for CORS)
```

2. Open `http://localhost:8000` in your browser.

## Build & Scripts

| Script | Purpose |
|--------|---------|
| `node scripts/build.js` | **Unified build** – runs category pages + sitemap |
| `node scripts/generate-sitemap.js` | Regenerate `sitemap.xml` from `tools-list.json` |
| `node scripts/generate-category-pages.js` | Regenerate `category/*.html` landing pages |
| `node scripts/normalize-tool-pages.js` | Add canonical, OG, Twitter meta to tool pages |
| `node scripts/normalize-seo-titles.js` | Normalize ` - ` → ` – ` in titles and meta |

**After adding or changing tools**, run:

```bash
node scripts/generate-category-pages.js
node scripts/generate-sitemap.js
```

## Deployment

- **CI/CD:** GitHub Actions on push to `main`
- **Deploy target:** SCP to server (`/data/www/toolforge`)
- **Secrets:** `SERVER_IP`, `SERVER_USER`, `SERVER_SSH_KEY`

## Adding a New Tool

1. Create `tools/your-tool-name.html` with the standard ToolForge layout
2. Add an entry to `tools-list.json`:
   ```json
   {"file":"your-tool-name","name":"Your Tool Name","category":"Category Name"}
   ```
3. Run:
   ```bash
   node scripts/generate-category-pages.js
   node scripts/generate-sitemap.js
   ```
