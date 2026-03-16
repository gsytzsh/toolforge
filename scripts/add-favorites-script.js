#!/usr/bin/env node
/**
 * Add favorites.js before tool-common.js in all tool pages.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const MARKER = '<script src="/js/tool-common.js"></script>';
const INSERT = '<script src="/js/favorites.js"></script>\n<script src="/js/tool-common.js"></script>';

const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".html"));
let count = 0;

for (const file of files) {
  const p = path.join(TOOLS_DIR, file);
  let html = fs.readFileSync(p, "utf8");
  if (html.includes('src="/js/favorites.js"')) continue;
  if (!html.includes(MARKER)) continue;
  html = html.replace(MARKER, INSERT);
  fs.writeFileSync(p, html, "utf8");
  count++;
}

console.log("Added favorites.js to " + count + " tool pages");
