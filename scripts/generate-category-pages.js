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
const BASE_URL = (process.env.SITEMAP_BASE_URL || "https://www.toolforge.site").replace(/\/$/, "");

const CATEGORY_ORDER = [
  "JSON & Data", "Encoding & Decoding", "Text", "Images & Colors", "PDF & Export",
  "Date & Time", "Time & Planning", "Daily Productivity", "Money & Decisions",
  "Generators & Converters", "Calculators", "Security & Tokens", "Web & Network",
  "API & Data", "Code & Formatting", "Debug & Testing", "Database",
  "Schedules & Infra", "SEO & Webmaster"
];

const CATEGORY_DESCRIPTIONS = {
  "JSON & Data": "Open, format, validate and convert JSON, CSV, XML and YAML for APIs, logs and structured data work.",
  "Encoding & Decoding": "Encode and decode Base64, URL, binary, hex and QR data for web, API and text-processing tasks.",
  "Text": "Edit, clean, compare and transform text for writing, SEO, content cleanup and everyday copy work.",
  "Images & Colors": "Resize, compress and convert images, extract Base64 and use color tools for design and frontend work.",
  "PDF & Export": "Create browser-based PDFs from notes, tables, code, screenshots and uploaded files without extra software.",
  "Date & Time": "Convert timestamps, compare dates and work with calendars, week numbers, timers and time zones.",
  "Time & Planning": "Plan meetings, focus sessions, countdowns and work schedules with simple time-planning tools.",
  "Daily Productivity": "Manage notes, checklists and small everyday tasks with lightweight tools that open instantly in the browser.",
  "Money & Decisions": "Split bills, compare prices and handle quick money, shopping and decision-making calculations.",
  "Generators & Converters": "Generate random values and convert everyday units, numbers and formats in a few clicks.",
  "Calculators": "Use focused calculators for percentages, loans, grades, statistics and other common number problems.",
  "Security & Tokens": "Generate passwords, inspect tokens, hash text and handle common browser-based security helper tasks.",
  "Web & Network": "Inspect URLs, IPs, headers, status codes and client details for web, hosting and network troubleshooting.",
  "API & Data": "Build requests, inspect payloads, test paths and work faster with API and structured-data helper tools.",
  "Code & Formatting": "Format code, minify snippets and clean structured text so it is easier to read, share and debug.",
  "Debug & Testing": "Test regex, diffs, rewrites and other developer workflows before you apply changes in real projects.",
  "Database": "Build SQL queries, WHERE clauses and other database helpers for faster drafting and testing.",
  "Schedules & Infra": "Create cron schedules and other small infrastructure helpers for automation and operations work.",
  "SEO & Webmaster": "Generate schema, meta tags, robots rules and other SEO and webmaster utilities for site optimization."
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
<link rel="canonical" href="${BASE_URL}/category/${slug}.html">
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
