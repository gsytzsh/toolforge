# ToolForge

Free online developer tools collection: JSON formatter, Base64 encoder, UUID generator, JWT tools, PDF converters, SEO utilities and more.

**Live site:** [toolforge.site](https://toolforge.site)

## Features

- **160+ tools** across multiple categories
- **No backend required** – all tools run in the browser
- **Static site** – HTML, CSS, vanilla JS
- **SEO-friendly** – sitemap, meta tags, canonical URLs

## Categories

| Category | Examples |
|----------|----------|
| Encoding & Decoding | Base64, URL Encode, HTML Escape, Hex, Morse Code |
| JSON & Data | JSON Viewer, JSON Diff, JSON to CSV/XML/YAML |
| PDF & Export | JSON/CSV/Excel/Image/Markdown/HTML to PDF |
| Security & Tokens | Password Generator, Hash, JWT, UUID |
| SEO & Webmaster | Robots.txt, Sitemap, Schema, OG, UTM, Canonical |
| Code & Formatting | Regex, SQL Formatter, HTML/XML Formatter, Cron |
| Web & Network | IP Info, HTTP Status, cURL to Fetch, URL Parser |
| Calculators | Loan, BMI, Percentage, Scientific, Date Diff |
| Text | Case Converter, Lorem Ipsum, Slug, Emoji Remover |
| Date & Time | Timestamp, Timezone, Calendar, Stopwatch |
| Images & Colors | Color Picker, Image to Base64, Image Resize |
| Daily Productivity | Notes & Lists, Pomodoro, Reading Time |

## Project Structure

```
toolforge/
├── index.html          # Homepage
├── tools-list.json     # Tool catalog (name, category, popular)
├── sitemap.xml         # Generated sitemap
├── css/style.css       # Global styles
├── js/
│   ├── index.js        # Homepage logic, search, categories
│   └── tools.js        # Shared tool utilities
├── tools/              # 160+ tool pages (*.html)
└── scripts/
    ├── generate-sitemap.js    # Build sitemap from tools-list.json
    ├── normalize-tool-pages.js # Canonical, OG, Twitter meta
    └── normalize-seo-titles.js # Title/description typography
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
| `node scripts/generate-sitemap.js` | Regenerate `sitemap.xml` from `tools-list.json` |
| `node scripts/normalize-tool-pages.js` | Add canonical, OG, Twitter meta to tool pages |
| `node scripts/normalize-seo-titles.js` | Normalize ` - ` → ` – ` in titles and meta |

The `build.sh` script is used on the deployment server for meta updates and sitemap generation.

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
3. Run `node scripts/generate-sitemap.js` to update the sitemap

## License

MIT
