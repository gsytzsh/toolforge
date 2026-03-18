#!/usr/bin/env node
/**
 * Generate category landing pages from tools-list.json.
 * Run: node scripts/generate-category-pages.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");
const CATEGORY_DIR = path.join(ROOT, "category");
const BASE_URL = (process.env.SITEMAP_BASE_URL || "https://toolforge.site").replace(/\/$/, "");

const CATEGORY_ORDER = [
  "JSON & API", "Encoding & Decoding", "Text Tools", "Images & Colors", "PDF & Export",
  "Date & Time", "Productivity", "Calculators", "Generators", "Unit Converters",
  "Security & Tokens", "Web & Network", "SEO Tools", "Developer Tools"
];

const CATEGORY_DESCRIPTIONS = {
  "JSON & API": "Open, format, validate and convert JSON, CSV, XML and YAML. Build and test API requests, inspect payloads and work with structured data.",
  "Encoding & Decoding": "Encode and decode Base64, URL, binary, hex and QR data for web, API and text-processing tasks.",
  "Text Tools": "Edit, clean, compare and transform text for writing, SEO, content cleanup and everyday copy work.",
  "Images & Colors": "Resize, compress and convert images, extract Base64 and use color tools for design and frontend work.",
  "PDF & Export": "Create browser-based PDFs from notes, tables, code, screenshots and uploaded files without extra software.",
  "Date & Time": "Convert timestamps, compare dates and work with calendars, week numbers, timers and time zones.",
  "Productivity": "Manage notes, checklists and small everyday tasks with lightweight tools that open instantly in the browser.",
  "Calculators": "Use focused calculators for percentages, loans, grades, statistics, health and other common number problems.",
  "Generators": "Generate random values like UUIDs, passwords, numbers and test data in a few clicks.",
  "Unit Converters": "Convert everyday units including length, weight, temperature, area, volume, speed and data size.",
  "Security & Tokens": "Generate passwords, inspect tokens, hash text and handle common browser-based security helper tasks.",
  "Web & Network": "Inspect URLs, IPs, headers, status codes and client details for web, hosting and network troubleshooting.",
  "SEO Tools": "Generate schema, meta tags, robots rules and other SEO utilities for site optimization.",
  "Developer Tools": "Format code, test regex, build SQL queries and other developer workflows for coding and debugging."
};

function slugify(str) {
  return String(str).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  let tools;
  try {
    tools = JSON.parse(fs.readFileSync(TOOLS_LIST, "utf8"));
  } catch (e) {
    console.error("Failed to read tools-list.json:", e.message);
    process.exit(1);
  }

  const byCat = {};
  tools.forEach((t) => {
    const c = t.category || "Other";
    if (!byCat[c]) byCat[c] = [];
    byCat[c].push(t);
  });

  if (!fs.existsSync(CATEGORY_DIR)) {
    fs.mkdirSync(CATEGORY_DIR, { recursive: true });
  }

  const order = CATEGORY_ORDER.concat(
    Object.keys(byCat).filter((c) => !CATEGORY_ORDER.includes(c))
  );

  const generated = [];
  for (const cat of order) {
    const list = byCat[cat];
    if (!list || list.length === 0) continue;

    const slug = slugify(cat);
    const desc = CATEGORY_DESCRIPTIONS[cat] || `${cat} tools for developers.`;
    const toolLinks = list
      .sort((a, b) => (a.popularOrder || 999) - (b.popularOrder || 999) || (a.name || "").localeCompare(b.name || ""))
      .map((t) => `    <li><a href="/tools/${t.file}.html">${escapeHtml(t.name)}</a></li>`)
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(cat)} – Developer Tools | ToolForge</title>
<meta name="description" content="${escapeHtml(desc)} Browse ${list.length} ${escapeHtml(cat)} tools. Part of the ToolForge developer tools collection.">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${BASE_URL}/category/${slug}.html">

<meta property="og:type" content="website">
<meta property="og:site_name" content="ToolForge">
<meta property="og:title" content="${escapeHtml(cat)} – Developer Tools | ToolForge">
<meta property="og:description" content="${escapeHtml(desc)} Browse ${list.length} ${escapeHtml(cat)} tools.">
<meta property="og:url" content="${BASE_URL}/category/${slug}.html">

<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(cat)} – Developer Tools | ToolForge">
<meta name="twitter:description" content="${escapeHtml(desc)} Browse ${list.length} ${escapeHtml(cat)} tools.">

<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<header class="top-nav">
  <a href="/" class="top-nav-brand">ToolForge</a>
  <nav id="tool-top-nav-menu" class="top-nav-menu" aria-label="Tool categories"></nav>
</header>
<main class="container">
<nav class="tool-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> &gt; <span>${escapeHtml(cat)}</span></nav>
<h1>${escapeHtml(cat)}</h1>
<p class="subtitle">${escapeHtml(desc)}</p>
<p><a href="/">Back to all tools</a></p>
<h3>Tools (${list.length})</h3>
<ul class="tool-category-list">
${toolLinks}
</ul>
</main>
<script src="/js/tool-common.js"></script>
</body>
</html>
`;

    const outPath = path.join(CATEGORY_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html, "utf8");
    generated.push(slug);
  }

  console.log(`Generated ${generated.length} category pages in category/`);
}

main();
