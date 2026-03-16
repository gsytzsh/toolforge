#!/usr/bin/env node
/**
 * Unified build script: generate category pages and sitemap.
 * Run: node scripts/build.js
 */

const path = require("path");

const ROOT = path.resolve(__dirname, "..");

console.log("===== ToolForge build =====\n");

try {
  console.log("1. Generating category pages...");
  require("./generate-category-pages.js");
  console.log("   Done.\n");

  console.log("2. Generating sitemap...");
  require("./generate-sitemap.js");
  console.log("   Done.\n");

  console.log("===== Build complete =====");
} catch (e) {
  console.error("Build failed:", e.message);
  process.exit(1);
}
