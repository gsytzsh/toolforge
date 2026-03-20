#!/usr/bin/env node
/**
 * One-shot enhancement for all remaining tool pages that have not been customized yet.
 * Rule: pages already containing "mainly used for?" FAQ are treated as already enhanced.
 *
 * Run: node scripts/enhance-all-remaining-content.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");

const CATEGORY_GUIDE = {
  "JSON & API": {
    step2: "Choose the parsing, conversion or validation options that match your API/data format.",
    step3: "Run the tool action and verify structure, types and output fields.",
    step4: "Copy the result into your API workflow, test case or integration config.",
    issueQ: "What should I check if the output looks wrong?",
    issueA: "Validate source syntax first, then verify field types, nesting and delimiter/encoding expectations.",
  },
  "Encoding & Decoding": {
    step2: "Select encode or decode mode and confirm the expected input/output format.",
    step3: "Run conversion and inspect whether special characters are preserved correctly.",
    step4: "Copy the transformed value for your request, payload or debugging workflow.",
    issueQ: "What should I check if conversion fails?",
    issueA: "Check invalid characters, bad padding, wrong mode selection and mixed text/binary assumptions.",
  },
  "Text Tools": {
    step2: "Choose transformation options such as case, trimming, filtering or replacement rules.",
    step3: "Run processing and compare the transformed text with your expected result.",
    step4: "Copy cleaned text into documents, code comments or content pipelines.",
    issueQ: "Why does processed text differ from expectation?",
    issueA: "Whitespace rules, hidden characters and line-ending differences are common reasons for unexpected text output.",
  },
  "Developer Tools": {
    step2: "Configure language-specific settings and formatting/validation options before running.",
    step3: "Execute the main action and review syntax, structure or generated code output.",
    step4: "Copy results into your editor, scripts or review notes.",
    issueQ: "How can I troubleshoot incorrect developer-tool output?",
    issueA: "Confirm input syntax, language mode and escaping rules; then test with a smaller sample to isolate issues.",
  },
  Calculators: {
    step2: "Fill all required fields and confirm unit assumptions before calculation.",
    step3: "Run the calculation and review intermediate values where available.",
    step4: "Use the result in planning, estimation or comparison decisions.",
    issueQ: "Why do calculator results differ from another source?",
    issueA: "Differences usually come from rounding precision, unit assumptions or formula variants used by each tool.",
  },
  Generators: {
    step2: "Set generation options like format, length or character constraints.",
    step3: "Generate output and verify it matches your downstream requirements.",
    step4: "Copy generated values into test data, configs or app workflows.",
    issueQ: "Why do generated values look inconsistent between runs?",
    issueA: "Most generators are intentionally random; if deterministic output is needed, use a fixed seed strategy externally.",
  },
  "Unit Converters": {
    step2: "Confirm source and target units to avoid conversion-base mismatches.",
    step3: "Run conversion and compare values across units.",
    step4: "Use converted values in specs, calculations or reports.",
    issueQ: "What causes incorrect conversion results?",
    issueA: "Most issues come from wrong unit selection, decimal separator confusion or misread original measurements.",
  },
  "Date & Time": {
    step2: "Confirm timezone and timestamp precision (seconds vs milliseconds) where applicable.",
    step3: "Run conversion/calculation and inspect date boundaries carefully.",
    step4: "Copy normalized date-time values for logs, scheduling or APIs.",
    issueQ: "Why can date results be off by hours or days?",
    issueA: "Timezone offsets, daylight-saving changes and mixed UTC/local assumptions are the most common causes.",
  },
  "PDF & Export": {
    step2: "Adjust layout, content and export settings before generating the file.",
    step3: "Generate output and preview formatting, pagination and readability.",
    step4: "Download or copy export output for sharing and archiving.",
    issueQ: "Why does exported PDF layout look different than expected?",
    issueA: "Page width, font rendering and print-style behavior can affect output; simplify layout or adjust export settings.",
  },
  "Images & Colors": {
    step2: "Set processing options such as dimensions, quality, format or color model.",
    step3: "Run processing and inspect visual output for quality and accuracy.",
    step4: "Copy values or download output assets for design and frontend use.",
    issueQ: "Why does image/color output differ across tools?",
    issueA: "Color spaces, compression settings and rendering engines can vary, so verify format assumptions and quality settings.",
  },
  "Web & Network": {
    step2: "Provide the exact URL/IP/header data and confirm protocol context.",
    step3: "Run analysis and inspect parsed fields, status or lookup results.",
    step4: "Use results to debug routing, connectivity or HTTP behavior.",
    issueQ: "Why can web/network results vary across environments?",
    issueA: "Network path, DNS, CDN caching, region and request headers can all change observed behavior.",
  },
  "SEO Tools": {
    step2: "Configure directives, tags or structured-data fields based on page intent.",
    step3: "Generate output and verify it aligns with visible page content.",
    step4: "Add generated markup to templates and revalidate in search tooling.",
    issueQ: "Why might SEO output still not produce expected search behavior?",
    issueA: "Correct markup helps, but crawling, indexing and ranking also depend on content quality, site signals and recrawl timing.",
  },
  "Security & Tokens": {
    step2: "Choose algorithm, token options or password constraints as needed.",
    step3: "Run generation/verification and inspect security-related output fields.",
    step4: "Use output in dev/test workflows or controlled security tooling.",
    issueQ: "What should I verify when security output seems invalid?",
    issueA: "Check algorithm choice, key/secret format, encoding mode and token expiration assumptions.",
  },
  Productivity: {
    step2: "Set preferences and structure input so results match your workflow.",
    step3: "Run the main action and review generated planning or note output.",
    step4: "Use or export results to your daily process and tracking tools.",
    issueQ: "Why does productivity output not match my intended workflow?",
    issueA: "Adjust input structure and options first; small setup choices can strongly influence generated output quality.",
  },
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceCleanup(text) {
  return stripTags(text).replace(/[.。]+$/, "").trim();
}

function extractMetaDescription(content) {
  const m = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? sentenceCleanup(m[1]) : "";
}

function extractSubtitle(content) {
  const m = content.match(/<p class="subtitle">([\s\S]*?)<\/p>/i);
  return m ? sentenceCleanup(m[1]) : "";
}

function derivePurpose(toolName, subtitle, description) {
  const base = subtitle || description;
  if (!base) return `handle ${toolName.toLowerCase()} tasks quickly in the browser`;

  let p = base;
  const toolNameLower = toolName.toLowerCase();
  p = p.replace(new RegExp(`^${toolNameLower}\\s+`, "i"), "");
  p = p.replace(/^free online\s+/i, "");
  p = p.replace(/^online\s+/i, "");
  p = p.replace(/^to\s+/i, "");

  if (p.length < 12) return `handle ${toolName.toLowerCase()} tasks quickly in the browser`;
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function isMixedProcessing(content, category) {
  if (category === "Web & Network") return true;
  if (/\bfetch\s*\(/.test(content)) return true;
  if (/XMLHttpRequest/.test(content)) return true;
  return false;
}

function buildHowTo(toolName, category) {
  const guide = CATEGORY_GUIDE[category] || CATEGORY_GUIDE["Developer Tools"];
  const steps = [
    `Open ${toolName} and enter your source input data in the main field.`,
    guide.step2,
    guide.step3,
    guide.step4,
  ];

  return {
    steps,
    html: `<section class="how-to-use">
<h3>How to Use ${escapeHtml(toolName)}</h3>
<ol class="how-to-steps">
  <li><strong>Step 1:</strong> ${escapeHtml(steps[0])}</li>
  <li><strong>Step 2:</strong> ${escapeHtml(steps[1])}</li>
  <li><strong>Step 3:</strong> ${escapeHtml(steps[2])}</li>
  <li><strong>Step 4:</strong> ${escapeHtml(steps[3])}</li>
</ol>
</section>`,
  };
}

function buildFaq(toolName, purpose, category, mixedProcessing) {
  const guide = CATEGORY_GUIDE[category] || CATEGORY_GUIDE["Developer Tools"];
  const faqs = [
    {
      q: `What is ${toolName} mainly used for?`,
      a: `${toolName} is mainly used to ${purpose}.`,
    },
    mixedProcessing
      ? {
          q: `Does ${toolName} always work fully offline?`,
          a: `${toolName} provides browser-based processing for most tasks, but some features may rely on external network lookups.`,
        }
      : {
          q: `Does ${toolName} send my input to a server?`,
          a: `For normal usage, ${toolName} processes data locally in your browser so you can work without uploading project files.`,
        },
    {
      q: guide.issueQ,
      a: guide.issueA,
    },
  ];

  return {
    faqs,
    html: `<section class="faq">
<h3>Frequently Asked Questions</h3>
<dl class="faq-list">

  <dt>${escapeHtml(faqs[0].q)}</dt>
  <dd>${escapeHtml(faqs[0].a)}</dd>

  <dt>${escapeHtml(faqs[1].q)}</dt>
  <dd>${escapeHtml(faqs[1].a)}</dd>

  <dt>${escapeHtml(faqs[2].q)}</dt>
  <dd>${escapeHtml(faqs[2].a)}</dd>
</dl>
</section>`,
  };
}

function buildHowToSchema(toolName, steps) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Use ${toolName}`,
    step: steps.map((text, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      text,
    })),
  };
}

function buildFaqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

function replaceSection(content, regex, replacement) {
  if (!regex.test(content)) return { content, ok: false };
  return { content: content.replace(regex, replacement), ok: true };
}

function upsertLdJsonByType(content, type, schemaObject) {
  const scriptTag = `<script type="application/ld+json">
${JSON.stringify(schemaObject, null, 2)}
</script>`;

  let found = false;
  const updated = content.replace(
    /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g,
    (match, jsonText) => {
      try {
        const obj = JSON.parse(jsonText);
        if (obj && obj["@type"] === type) {
          found = true;
          return scriptTag;
        }
      } catch (e) {
        return match;
      }
      return match;
    }
  );

  if (found) return { content: updated, inserted: false };
  if (!updated.includes("</head>")) return { content: updated, inserted: false };
  return { content: updated.replace("</head>", `${scriptTag}\n</head>`), inserted: true };
}

function main() {
  const tools = JSON.parse(fs.readFileSync(TOOLS_LIST, "utf8"));

  let updated = 0;
  let skipped = 0;
  let noSections = 0;

  for (const tool of tools) {
    const filePath = path.join(TOOLS_DIR, `${tool.file}.html`);
    if (!fs.existsSync(filePath)) {
      skipped++;
      continue;
    }

    let content = fs.readFileSync(filePath, "utf8");

    // Already enhanced in previous batches: skip.
    if (/mainly used for\?/i.test(content)) {
      skipped++;
      continue;
    }

    const subtitle = extractSubtitle(content);
    const description = extractMetaDescription(content);
    const purpose = derivePurpose(tool.name, subtitle, description);
    const mixed = isMixedProcessing(content, tool.category);

    const howTo = buildHowTo(tool.name, tool.category);
    const faq = buildFaq(tool.name, purpose, tool.category, mixed);

    const howToRes = replaceSection(
      content,
      /<section class="how-to-use">[\s\S]*?<\/section>/,
      howTo.html
    );
    content = howToRes.content;

    const faqRes = replaceSection(
      content,
      /<section class="faq">[\s\S]*?<\/section>/,
      faq.html
    );
    content = faqRes.content;

    if (!howToRes.ok || !faqRes.ok) {
      noSections++;
      skipped++;
      continue;
    }

    const howToSchema = buildHowToSchema(tool.name, howTo.steps);
    const faqSchema = buildFaqSchema(faq.faqs);

    content = upsertLdJsonByType(content, "HowTo", howToSchema).content;
    content = upsertLdJsonByType(content, "FAQPage", faqSchema).content;

    fs.writeFileSync(filePath, content, "utf8");
    updated++;
    console.log(`Updated ${tool.file}.html`);
  }

  console.log(`\nDone. Updated ${updated} files, skipped ${skipped} files (missing sections: ${noSections}).`);
}

main();
