#!/usr/bin/env node
/**
 * Add favorites.js before tool-common.js in all tool pages.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");

const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".html"));
let count = 0;
let skipped = 0;

function injectScripts(html) {
  if (html.includes('src="/js/favorites.js"')) return null;

  const pairNearBody = /<script src="\/js\/tool-common\.js"><\/script>\s*<\/body>/i;
  if (pairNearBody.test(html)) {
    return html.replace(
      pairNearBody,
      '<script src="/js/favorites.js"></script>\n<script src="/js/tool-common.js"></script>\n</body>'
    );
  }

  if (html.includes("</body>")) {
    return html.replace(
      "</body>",
      '<script src="/js/favorites.js"></script>\n<script src="/js/tool-common.js"></script>\n</body>'
    );
  }

  return null;
}

for (const file of files) {
  const p = path.join(TOOLS_DIR, file);
  let html = fs.readFileSync(p, "utf8");
  const next = injectScripts(html);
  if (!next || next === html) {
    skipped++;
    continue;
  }
  html = next;
  fs.writeFileSync(p, html, "utf8");
  count++;
}

console.log("Added favorites.js to " + count + " tool pages, skipped " + skipped + ".");
