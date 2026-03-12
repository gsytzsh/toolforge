#!/usr/bin/env node
/**
 * Generate sitemap.xml from tools-list.json.
 * Run from project root: node scripts/generate-sitemap.js
 *
 * Optional env: SITEMAP_BASE_URL (default https://www.toolforge.site)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");
const SITEMAP_OUT = path.join(ROOT, "sitemap.xml");

const BASE_URL = (process.env.SITEMAP_BASE_URL || "https://www.toolforge.site").replace(/\/$/, "");
const TODAY = new Date().toISOString().slice(0, 10);

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function main() {
  let tools;
  try {
    const raw = fs.readFileSync(TOOLS_LIST, "utf8");
    tools = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read tools-list.json:", e.message);
    process.exit(1);
  }

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>${escapeXml(BASE_URL + "/")}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    "    <changefreq>weekly</changefreq>",
    "    <priority>1.0</priority>",
    "  </url>",
  ];

  for (const tool of tools) {
    const file = tool.file || tool;
    const loc = `${BASE_URL}/tools/${file}.html`;
    lines.push(
      "  <url>",
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${TODAY}</lastmod>`,
      "    <changefreq>monthly</changefreq>",
      "    <priority>0.8</priority>",
      "  </url>"
    );
  }

  lines.push("</urlset>");
  const xml = lines.join("\n");

  fs.writeFileSync(SITEMAP_OUT, xml, "utf8");
  console.log(`Wrote ${SITEMAP_OUT} (${tools.length + 1} URLs, lastmod=${TODAY})`);
}

main();
