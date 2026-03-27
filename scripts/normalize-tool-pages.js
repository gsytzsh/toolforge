#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");
const BASE_URL = (process.env.SITEMAP_BASE_URL || "https://toolforge.site").replace(/\/$/, "");

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function slugifyCategory(name) {
  return String(name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
    csv: "CSV input",
    json: "JSON input",
    xml: "XML input",
    html: "HTML input",
    hex: "Hex input",
    text: "Text input",
    input: "Input text",
    output: "Output text",
    url: "URL",
    uuid: "UUID",
    ua: "User agent",
    pwd: "Password",
    yaml: "YAML input",
    bin: "Binary input",
    expr: "Expression",
    num: "Number",
    val: "Value",
    header: "Header input",
    result: "Result text",
    pattern: "Regex pattern",
    token: "JWT token",
    secret: "Secret key",
    curl: "cURL command",
    cron: "Cron expression",
    jsonA: "JSON A",
    jsonB: "JSON B",
    min: "Minimum value",
    max: "Maximum value",
    count: "Count",
    year: "Year",
    title: "Title",
    note: "Note",
    code: "Status code",
    slug: "Slug",
    fromBase: "Source base",
    targetWidth: "Target width",
    targetHeight: "Target height",
    morse: "Morse code",
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

function shouldNormalizeLabel(current, preferred, id) {
  const currentTrimmed = current.trim();
  if (!currentTrimmed || currentTrimmed === preferred) return false;
  const genericLabels = new Set([
    "Input",
    "Input text",
    "Output",
    "Output text",
    "Val",
    "Url",
    "Uuid",
    "Ua",
    "Pwd",
    "Yaml",
    "Bin",
    "Expr",
    "Num",
    "Code",
    "Json A",
    "Json B",
    "Curl",
    "Header",
    "Header input",
    "Result",
    "Result text",
    "Pattern",
    "Token",
    "Morse",
  ]);

  return genericLabels.has(currentTrimmed) || currentTrimmed.toLowerCase() === id.toLowerCase();
}

function normalizeExistingLabelText(html) {
  html = html.replace(/<(textarea|select)((?:"[^"]*"|'[^']*'|[^'">])*\sid="([^"]+)"(?:"[^"]*"|'[^']*'|[^'">])*)\saria-label="([^"]+)"([^>]*)>/g, (match, tag, before, id, current, after) => {
    const preferred = humanizeId(id);
    if (!shouldNormalizeLabel(current, preferred, id)) return match;
    return `<${tag}${before} aria-label="${escapeAttr(preferred)}"${after}>`;
  });

  html = html.replace(/<input((?:"[^"]*"|'[^']*'|[^'">])*\sid="([^"]+)"(?:"[^"]*"|'[^']*'|[^'">])*)\saria-label="([^"]+)"([^>]*)>/g, (match, before, id, current, after) => {
    const preferred = humanizeId(id);
    if (!shouldNormalizeLabel(current, preferred, id)) return match;
    return `<input${before} aria-label="${escapeAttr(preferred)}"${after}>`;
  });

  html = html.replace(/<label([^>]+for="([^"]+)"[^>]*) class="sr-only">([^<]*)<\/label>/g, (match, attrs, id, current) => {
    const preferred = humanizeId(id);
    if (!shouldNormalizeLabel(current, preferred, id)) return match;
    return `<label${attrs} class="sr-only">${escapeAttr(preferred)}</label>`;
  });

  return html;
}

function hasLabelFor(html, id) {
  const pattern = new RegExp(`<label[^>]+for=["']${id}["']`, "i");
  return pattern.test(html);
}

function ensureHiddenLabels(html) {
  html = html.replace(/<(textarea|select)((?:"[^"]*"|'[^']*'|[^'">])*\sid="([^"]+)"(?:"[^"]*"|'[^']*'|[^'">])*)>/g, (match, tag, attrs, id) => {
    if (hasLabelFor(html, id)) return match;
    const ariaMatch = attrs.match(/\saria-label="([^"]+)"/i);
    const labelText = ariaMatch ? ariaMatch[1] : humanizeId(id);
    return `<label for="${id}" class="sr-only">${escapeAttr(labelText)}</label>\n${match}`;
  });

  html = html.replace(/<input((?:"[^"]*"|'[^']*'|[^'">])*\sid="([^"]+)"(?:"[^"]*"|'[^']*'|[^'">])*)>/g, (match, attrs, id) => {
    if (hasLabelFor(html, id)) return match;
    const typeMatch = attrs.match(/\stype="([^"]+)"/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : "text";
    if (["checkbox", "radio", "hidden", "button", "submit"].includes(type)) {
      return match;
    }
    const ariaMatch = attrs.match(/\saria-label="([^"]+)"/i);
    const labelText = ariaMatch ? ariaMatch[1] : humanizeId(id);
    return `<label for="${id}" class="sr-only">${escapeAttr(labelText)}</label>\n${match}`;
  });

  return html;
}

function ensureStaticCategoryLink(html, slug, categoryBySlug) {
  const category = categoryBySlug.get(slug);
  if (!category) return html;

  const categorySlug = slugifyCategory(category);
  const categoryHref = `/category/${categorySlug}.html`;
  const block = `<p class="static-tool-discovery"><a href="${categoryHref}">More in ${escapeHtml(category)}</a></p>`;

  if (/<p class="static-tool-discovery">[\s\S]*?<\/p>/i.test(html)) {
    return html.replace(/<p class="static-tool-discovery">[\s\S]*?<\/p>/i, block);
  }

  if (html.includes(`href="${categoryHref}"`)) return html;

  const backLinkRegex = /<p>\s*<a href="\/">Back to all tools(?: on ToolForge)?<\/a>\s*<\/p>/i;
  return html.replace(backLinkRegex, (match) => `${match}\n${block}`);
}

function normalizeFile(filePath, categoryBySlug) {
  const slug = path.basename(filePath, ".html");
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  html = ensureSocialMeta(html, slug);
  html = ensureMainLandmark(html);
  html = ensureAriaLabels(html);
  html = ensureHiddenLabels(html);
  html = normalizeExistingLabelText(html);
  html = ensureStaticCategoryLink(html, slug, categoryBySlug);

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }

  return false;
}

function main() {
  const tools = JSON.parse(fs.readFileSync(TOOLS_LIST, "utf8"));
  const categoryBySlug = new Map(
    tools
      .filter((tool) => tool && tool.file && tool.category)
      .map((tool) => [tool.file, tool.category])
  );

  const files = fs.readdirSync(TOOLS_DIR)
    .filter((name) => name.endsWith(".html"))
    .map((name) => path.join(TOOLS_DIR, name));

  let updated = 0;
  files.forEach((filePath) => {
    if (normalizeFile(filePath, categoryBySlug)) updated += 1;
  });

  console.log(`Normalized ${updated} tool pages.`);
}

main();
