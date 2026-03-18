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

function main() {
  const files = fs.readdirSync(TOOLS_DIR).filter((f) => f.endsWith(".html"));
  let updated = 0;
  let skipped = 0;

  files.forEach((file) => {
    const filePath = path.join(TOOLS_DIR, file);
    let content = fs.readFileSync(filePath, "utf8");

    // Check if already has robots meta tag
    if (content.includes('<meta name="robots"')) {
      console.log(`Skipping ${file}: already has robots meta`);
      skipped++;
      return;
    }

    // Find the last <meta> tag and insert robots after it
    const lastMetaIndex = content.lastIndexOf("<meta");
    if (lastMetaIndex === -1) {
      console.log(`Skipping ${file}: no meta tags found`);
      skipped++;
      return;
    }

    const robotsMeta = '\n<meta name="robots" content="index, follow">';
    const insertPos = content.indexOf(">", lastMetaIndex) + 1;
    content = content.slice(0, insertPos) + robotsMeta + content.slice(insertPos);

    fs.writeFileSync(filePath, content, "utf8");
    updated++;
    console.log(`Updated ${file}`);
  });

  console.log(`\nDone. Updated ${updated} files, skipped ${skipped} files.`);
}

main();
