#!/usr/bin/env node
/**
 * Normalize SEO meta tags for all tool pages.
 * Adds: robots meta tag if missing.
 * Run: node scripts/normalize-tool-seo.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");

function addRobotsInHead(content) {
  const headMatch = content.match(/<head[\s\S]*?<\/head>/i);
  if (!headMatch) return { content, updated: false, reason: "no head" };

  const head = headMatch[0];
  if (/<meta\s+name="robots"\s+/i.test(head)) {
    return { content, updated: false, reason: "already has robots meta in head" };
  }

  const robotsMeta = '\n<meta name="robots" content="index, follow">';
  const updatedHead = head.replace(/<\/head>/i, robotsMeta + "\n</head>");
  const updatedContent = content.replace(head, updatedHead);
  return { content: updatedContent, updated: true };
}

function main() {
  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".html"));
  let updated = 0;
  let skipped = 0;
  let skippedNoHead = 0;

  files.forEach((file) => {
    const filePath = path.join(TOOLS_DIR, file);
    let content = fs.readFileSync(filePath, "utf8");

    const result = addRobotsInHead(content);
    if (!result.updated) {
      if (result.reason === "no head") skippedNoHead++;
      skipped++;
      console.log(`Skipping ${file}: ${result.reason}`);
      return;
    }

    fs.writeFileSync(filePath, result.content, "utf8");
    updated++;
    console.log(`Updated ${file}`);
  });

  console.log(`\nDone. Updated ${updated} files, skipped ${skipped} files (no-head: ${skippedNoHead}).`);
}

main();
