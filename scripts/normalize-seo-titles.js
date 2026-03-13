#!/usr/bin/env node
/**
 * Normalize SEO titles and descriptions across tool pages.
 * - Replace " - " with " – " (en dash) in titles and meta tags
 * - Ensures consistency for "Part of the ToolForge developer tools collection"
 *
 * Run from project root: node scripts/normalize-seo-titles.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Replace " - " with " – " (typographic en dash) only in <title> and meta content=
  // Avoid touching style/script (CSS minus, JS subtraction)
  content = content.replace(/<title>([^<]*)<\/title>/g, (_, inner) => {
    return "<title>" + inner.replace(/ - /g, " – ") + "</title>";
  });
  // In meta content that looks like a title (contains | ToolForge), replace " - " with " – "
  content = content.replace(
    /content="([^"]*)\| ToolForge"/g,
    (m, inner) => 'content="' + inner.replace(/ - /g, " – ") + '| ToolForge"'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

function main() {
  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".html"));
  let count = 0;
  for (const f of files) {
    const p = path.join(TOOLS_DIR, f);
    if (processFile(p)) {
      count++;
      console.log("Updated:", f);
    }
  }
  console.log(`\nDone. Updated ${count} of ${files.length} files.`);
}

main();
