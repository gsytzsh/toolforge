#!/usr/bin/env node
/**
 * Migrate old categories to new simplified categories.
 * Run: node scripts/migrate-categories.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");

// Category migration mapping
const CATEGORY_MAP = {
  // Keep these as-is
  "Encoding & Decoding": "Encoding & Decoding",
  "Text": "Text Tools",
  "Images & Colors": "Images & Colors",
  "Web & Network": "Web & Network",
  "SEO & Webmaster": "SEO Tools",

  // Merge JSON & Data + API & Data → JSON & API
  "JSON & Data": "JSON & API",
  "API & Data": "JSON & API",

  // Merge Code & Formatting + Debug & Testing + Database → Developer Tools
  "Code & Formatting": "Developer Tools",
  "Debug & Testing": "Developer Tools",
  "Database": "Developer Tools",

  // Merge Date & Time + Time & Planning → Date & Time
  "Date & Time": "Date & Time",
  "Time & Planning": "Date & Time",

  // Merge Daily Productivity + parts of Time & Planning → Productivity
  "Daily Productivity": "Productivity",

  // Merge Calculators + Money & Decisions → Calculators
  "Calculators": "Calculators",
  "Money & Decisions": "Calculators",

  // Split Generators & Converters → Generators + Unit Converters
  "PDF & Export": "PDF & Export",
  "Security & Tokens": "Security & Tokens",
  "Generators & Converters": "SPLIT" // Special handling
};

// Tools that should go to "Generators" from Generators & Converters
const GENERATOR_TOOLS = [
  "uuid-generator", "uuid-validator", "password-generator", "password-strength-checker",
  "random-number-generator", "random-string-generator", "dice-roller", "coin-flip",
  "random-yes-no", "mac-address-generator", "test-data-generator"
];

// Tools that should go to "Unit Converters" from Generators & Converters
const CONVERTER_TOOLS = [
  "base-converter", "byte-size-converter", "percentage-calculator",
  "temperature-converter", "length-converter", "weight-converter",
  "roman-numerals", "area-converter", "volume-converter", "speed-converter"
];

function main() {
  let tools;
  try {
    tools = JSON.parse(fs.readFileSync(TOOLS_LIST, "utf8"));
  } catch (e) {
    console.error("Failed to read tools-list.json:", e.message);
    process.exit(1);
  }

  const oldCounts = {};
  const newCounts = {};

  tools.forEach((t) => {
    const oldCat = t.category || "Other";
    oldCounts[oldCat] = (oldCounts[oldCat] || 0) + 1;

    let newCat = CATEGORY_MAP[oldCat] || oldCat;

    // Handle special split case for Generators & Converters
    if (oldCat === "Generators & Converters" && newCat === "SPLIT") {
      if (GENERATOR_TOOLS.includes(t.file)) {
        newCat = "Generators";
      } else if (CONVERTER_TOOLS.includes(t.file)) {
        newCat = "Unit Converters";
      } else {
        // Default to Generators for remaining
        newCat = "Generators";
      }
    }

    t.category = newCat;
    newCounts[newCat] = (newCounts[newCat] || 0) + 1;
  });

  // Sort tools within each category by name
  tools.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return (a.name || "").localeCompare(b.name || "");
  });

  fs.writeFileSync(TOOLS_LIST, JSON.stringify(tools, null, 2) + "\n", "utf8");

  console.log("=== Category Migration Complete ===\n");
  console.log("Old categories:");
  Object.entries(oldCounts).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${count} tools: ${cat}`);
  });

  console.log("\nNew categories:");
  Object.entries(newCounts).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
    const bar = "█".repeat(Math.ceil(count / 3));
    console.log(`  ${count} tools: ${cat} ${bar}`);
  });

  console.log("\nTotal tools:", tools.length);
  console.log("Total categories:", Object.keys(newCounts).length);
}

main();
