#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const BASE_URL = (process.env.SITEMAP_BASE_URL || "https://www.toolforge.site").replace(/\/$/, "");

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function insertAfter(html, marker, block) {
  if (!html.includes(marker)) return html;
  return html.replace(marker, marker + "\n" + block);
}

function ensureSocialMeta(html, slug) {
  if (html.includes('rel="canonical"') || html.includes("property=\"og:title\"")) {
    return html;
  }

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="([^"]*)">/i);

  if (!titleMatch || !descMatch) return html;

  const title = escapeAttr(titleMatch[1].trim());
  const description = escapeAttr(descMatch[1].trim());
  const url = escapeAttr(`${BASE_URL}/tools/${slug}.html`);

  const block = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="ToolForge">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
  ].join("\n");

  if (html.includes('<meta name="viewport"')) {
    return insertAfter(html, html.match(/<meta name="viewport"[^>]*>/i)[0], block);
  }

  if (html.includes('<meta name="description"')) {
    return insertAfter(html, html.match(/<meta name="description"[^>]*>/i)[0], block);
  }

  return html;
}

function ensureMainLandmark(html) {
  if (html.includes("<main") || !html.includes('<div class="container">')) {
    return html;
  }

  let next = html.replace('<div class="container">', '<main class="container">');

  const scriptIndex = next.lastIndexOf("<script");
  const bodyIndex = next.lastIndexOf("</body>");
  const boundary = scriptIndex !== -1 ? scriptIndex : bodyIndex;
  const closeIndex = next.lastIndexOf("</div>", boundary);

  if (closeIndex === -1) return html;

  return next.slice(0, closeIndex) + "</main>" + next.slice(closeIndex + 6);
}

function humanizeId(id) {
  const overrides = {
    P: "Principal",
    r: "Annual rate percent",
    t: "Time years",
    csv: "CSV input",
    json: "JSON input",
    xml: "XML input",
    html: "HTML input",
    hex: "Hex input",
    text: "Text input",
    input: "Input",
    output: "Output",
  };

  if (overrides[id]) return overrides[id];

  return id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ensureAriaLabels(html) {
  html = html.replace(/<(textarea|select)((?:"[^"]*"|'[^']*'|[^'">])*\sid="([^"]+)"(?:"[^"]*"|'[^']*'|[^'">])*)>/g, (match, tag, attrs, id) => {
    if (/aria-label=/i.test(attrs)) return match;
    return `<${tag}${attrs} aria-label="${escapeAttr(humanizeId(id))}">`;
  });

  html = html.replace(/<input((?:"[^"]*"|'[^']*'|[^'">])*\sid="([^"]+)"(?:"[^"]*"|'[^']*'|[^'">])*)>/g, (match, attrs, id) => {
    if (/aria-label=/i.test(attrs)) return match;
    const typeMatch = attrs.match(/\stype="([^"]+)"/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : "text";
    if (["checkbox", "radio", "hidden", "button", "submit"].includes(type)) {
      return match;
    }
    return `<input${attrs} aria-label="${escapeAttr(humanizeId(id))}">`;
  });

  return html;
}

function normalizeFile(filePath) {
  const slug = path.basename(filePath, ".html");
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  html = ensureSocialMeta(html, slug);
  html = ensureMainLandmark(html);
  html = ensureAriaLabels(html);

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }

  return false;
}

function main() {
  const files = fs.readdirSync(TOOLS_DIR)
    .filter((name) => name.endsWith(".html"))
    .map((name) => path.join(TOOLS_DIR, name));

  let updated = 0;
  files.forEach((filePath) => {
    if (normalizeFile(filePath)) updated += 1;
  });

  console.log(`Normalized ${updated} tool pages.`);
}

main();
