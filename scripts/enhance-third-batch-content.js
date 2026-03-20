#!/usr/bin/env node
/**
 * Enhance HowTo + FAQ content for the third batch of tool pages.
 * Run: node scripts/enhance-third-batch-content.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");

const CONTENT = {
  "url-parser": {
    purpose: "split URLs into protocol, host, path, query and hash parts for debugging",
    input: "paste a full URL into the parser input",
    configure: "Check whether you also need decoded query parameters and path segments.",
    run: "Parse the URL and inspect each extracted component.",
    result: "Copy parsed fields for troubleshooting routing, tracking or redirects.",
    specificQ: "Why does URL Parser show empty query params on some links?",
    specificA: "Parameters may be encoded in fragments or nested values. Confirm the URL uses standard query syntax after '?'.",
    processing: "local",
  },
  "http-header-parser": {
    purpose: "analyze raw HTTP header blocks into readable key-value format",
    input: "paste request or response headers from logs or DevTools",
    configure: "Keep one header per line and preserve the original delimiter style.",
    run: "Parse headers and inspect normalized output.",
    result: "Copy clean header output into bug reports or API docs.",
    specificQ: "What causes HTTP Header Parser to skip certain lines?",
    specificA: "Malformed header syntax or wrapped continuation lines can fail parsing. Normalize lines before running.",
    processing: "local",
  },
  "http-header-builder": {
    purpose: "build HTTP header sets for API requests and integration testing",
    input: "enter header names and values you need in your request",
    configure: "Review auth, content-type and custom headers for duplicates.",
    run: "Generate a structured header block.",
    result: "Copy generated headers into cURL, fetch or Postman.",
    specificQ: "Why does my request still fail after using HTTP Header Builder?",
    specificA: "Header structure may be correct but token scope, endpoint policy or payload format may still be invalid.",
    processing: "local",
  },
  "http-status-lookup": {
    purpose: "look up HTTP status codes and their meanings for faster debugging",
    input: "enter a numeric HTTP status code",
    configure: "Check whether you need client, server or redirect class references.",
    run: "Search the status table and view explanation text.",
    result: "Use the code description in incident notes or API diagnostics.",
    specificQ: "Can HTTP Status Lookup explain service-specific error bodies?",
    specificA: "It explains generic status semantics. Vendor-specific error details still come from the API's own response schema.",
    processing: "local",
  },
  "http-status-reference": {
    purpose: "browse HTTP status classes and common troubleshooting context",
    input: "search or scroll status code categories",
    configure: "Filter by 2xx, 3xx, 4xx or 5xx as needed.",
    run: "Open a code entry and review meaning and usage.",
    result: "Apply the reference during API design, logging and support triage.",
    specificQ: "How should I choose between 400 and 422 in APIs?",
    specificA: "Teams vary, but a common pattern is 400 for malformed requests and 422 for semantically invalid inputs.",
    processing: "local",
  },
  "http-headers-reference": {
    purpose: "review standard HTTP headers and practical usage examples",
    input: "search for a header name or category",
    configure: "Compare request and response header contexts before using one.",
    run: "Open header details and inspect descriptions.",
    result: "Use the reference to configure servers, clients or proxies correctly.",
    specificQ: "Why are some headers ignored by browsers?",
    specificA: "Security policies, CORS constraints and restricted header lists can block or override certain headers in browser contexts.",
    processing: "local",
  },
  "ip-subnet-calculator": {
    purpose: "calculate subnet ranges, mask size and usable host counts",
    input: "enter IP address and CIDR prefix",
    configure: "Confirm whether you are working in private or public address space.",
    run: "Calculate network, broadcast and host ranges.",
    result: "Use results for network planning, firewall rules or documentation.",
    specificQ: "Why is my usable host count lower than expected?",
    specificA: "Traditional IPv4 subnetting reserves network and broadcast addresses, reducing assignable host count.",
    processing: "local",
  },
  "ip-number-converter": {
    purpose: "convert IPv4 addresses to numeric form and back for tooling compatibility",
    input: "paste an IPv4 value or numeric representation",
    configure: "Select conversion direction before running.",
    run: "Convert and verify output format.",
    result: "Copy converted value for databases, logs or scripts.",
    specificQ: "Why does IP Number Converter reject some addresses?",
    specificA: "Invalid octets, non-IPv4 formats or out-of-range numeric values are common validation failures.",
    processing: "local",
  },
  "port-reference": {
    purpose: "check common network ports and associated service conventions",
    input: "search by port number or service name",
    configure: "Confirm protocol context such as TCP vs UDP where relevant.",
    run: "Look up the port entry and review notes.",
    result: "Use the reference while debugging firewall and connectivity issues.",
    specificQ: "Can Port Reference confirm if a port is safe to expose publicly?",
    specificA: "It provides common usage context, but exposure decisions still require security review and environment-specific risk checks.",
    processing: "local",
  },
  "mimetype-reference": {
    purpose: "find MIME types for file extensions and response headers",
    input: "search by extension or MIME type",
    configure: "Check expected content-type for downloads and API responses.",
    run: "Locate the matching MIME mapping.",
    result: "Apply correct content-type values in servers and storage metadata.",
    specificQ: "Why does wrong MIME type break file rendering?",
    specificA: "Browsers and apps rely on MIME hints for handling content. Incorrect types can trigger downloads or blocking behavior.",
    processing: "local",
  },
  "cdn-libraries-reference": {
    purpose: "quickly find CDN links for common frontend libraries",
    input: "search the library catalog by name",
    configure: "Compare versions and choose the one compatible with your project.",
    run: "Copy script or stylesheet CDN URL.",
    result: "Paste links into your HTML template for rapid prototyping.",
    specificQ: "Should CDN Libraries Reference be used in production by default?",
    specificA: "CDNs are convenient, but production setups often prefer pinned versions and controlled asset hosting for stability.",
    processing: "local",
  },
  "linux-commands-reference": {
    purpose: "look up common Linux commands and quick usage reminders",
    input: "search commands by task or keyword",
    configure: "Check examples carefully before running on production hosts.",
    run: "Open command details and usage notes.",
    result: "Use the reference to speed up terminal workflows and onboarding.",
    specificQ: "Can Linux Commands Reference replace man pages?",
    specificA: "It is a fast cheat sheet, while man pages remain the authoritative source for complete options and edge cases.",
    processing: "local",
  },
  "git-commands-reference": {
    purpose: "review common Git commands for branching, history and conflict workflows",
    input: "search by operation such as commit, rebase or stash",
    configure: "Confirm command scope before running destructive operations.",
    run: "Open example usage and option notes.",
    result: "Apply commands in your repository with fewer context switches.",
    specificQ: "Why should I double-check reset and rebase commands?",
    specificA: "History-rewriting commands can remove or reorder commits, so review branch state and backups first.",
    processing: "local",
  },
  "frontend-shortcuts-reference": {
    purpose: "find useful frontend development shortcuts and quick keyboard actions",
    input: "browse by editor, browser or workflow category",
    configure: "Focus on the toolchain you use daily.",
    run: "Review listed shortcuts and their effects.",
    result: "Adopt shortcuts to speed up debugging and coding loops.",
    specificQ: "Why do some shortcuts not work on my machine?",
    specificA: "OS-level mappings and editor keybindings can override defaults. Check your local keymap settings.",
    processing: "local",
  },
  "unicode-reference": {
    purpose: "inspect Unicode code points and character metadata quickly",
    input: "enter a character or code point to look up",
    configure: "Switch between hex and decimal representations as needed.",
    run: "Resolve character details and encoding information.",
    result: "Use output in text processing, escaping or debugging workflows.",
    specificQ: "Why do Unicode characters display differently across apps?",
    specificA: "Font support, normalization and rendering engines vary, which can change appearance for the same code point.",
    processing: "local",
  },
  "ascii-table": {
    purpose: "reference ASCII codes for control and printable characters",
    input: "search by character or numeric code",
    configure: "Check decimal, hex and binary columns based on your need.",
    run: "Locate the target ASCII entry in the table.",
    result: "Use code mappings in parsing, protocol or embedded tasks.",
    specificQ: "Does ASCII Table include extended non-ASCII characters?",
    specificA: "Core ASCII is 7-bit only. Extended sets are encoding-specific and should be treated separately.",
    processing: "local",
  },
  "eascii-table": {
    purpose: "review extended ASCII mappings for legacy text systems",
    input: "search code values in the extended table",
    configure: "Confirm which code page your source system uses.",
    run: "Find character mapping for the target code.",
    result: "Use mapping data during encoding migration or parsing fixes.",
    specificQ: "Why can extended ASCII mappings differ by environment?",
    specificA: "Extended ASCII depends on code page definitions, so the same byte may map to different characters across systems.",
    processing: "local",
  },
  "operator-precedence-reference": {
    purpose: "check language operator precedence and associativity rules",
    input: "search operators or precedence levels",
    configure: "Pick the language context relevant to your expression.",
    run: "Review execution order for involved operators.",
    result: "Refactor expressions with clearer parentheses where needed.",
    specificQ: "Why are precedence bugs hard to detect in reviews?",
    specificA: "Expressions can look valid while evaluating unexpectedly. Explicit parentheses reduce ambiguity and review risk.",
    processing: "local",
  },
  "keycode-reference": {
    purpose: "look up keyboard key codes and event values for frontend handlers",
    input: "press keys or search by key name",
    configure: "Compare key, code and legacy keyCode values for compatibility.",
    run: "Inspect captured keyboard event fields.",
    result: "Use values to implement shortcuts and input controls.",
    specificQ: "Should I rely on keyCode in new browser code?",
    specificA: "Prefer modern KeyboardEvent properties like key and code. keyCode is legacy and may behave inconsistently.",
    processing: "local",
  },
  "magic-bytes-reference": {
    purpose: "identify file types using signature bytes and headers",
    input: "search by hex signature or file extension",
    configure: "Check the beginning bytes from a file dump or payload.",
    run: "Match signature against known file type entries.",
    result: "Use matches in forensic checks, uploads or parser routing.",
    specificQ: "Can Magic Bytes Reference guarantee full file integrity?",
    specificA: "It helps identify likely file type, but full integrity requires deeper parsing and validation.",
    processing: "local",
  },
  "web-dimensions-reference": {
    purpose: "reference common web layout dimensions and breakpoints",
    input: "browse dimension presets by device class",
    configure: "Align presets with your design system breakpoints.",
    run: "Inspect recommended widths, heights and viewport ranges.",
    result: "Apply values during responsive planning and QA.",
    specificQ: "Should I design only for popular viewport sizes?",
    specificA: "Use reference sizes as anchors, but fluid layouts should still adapt to many intermediate dimensions.",
    processing: "local",
  },
  "viewport-size": {
    purpose: "detect current viewport dimensions for responsive debugging",
    input: "open the tool in target browser/device context",
    configure: "Resize window or rotate device to observe changes.",
    run: "Read live viewport width and height values.",
    result: "Use measurements to tune media queries and layout behavior.",
    specificQ: "Why does viewport size differ from device resolution?",
    specificA: "CSS pixels and device pixels differ by DPR scaling, so viewport units usually report CSS pixel dimensions.",
    processing: "local",
  },
  "color-picker": {
    purpose: "select colors and copy HEX/RGB values for design and frontend work",
    input: "choose a color from the picker or enter a value manually",
    configure: "Adjust hue, saturation and brightness to fine-tune output.",
    run: "Preview color variations and contrast as needed.",
    result: "Copy color codes into CSS, tokens or design docs.",
    specificQ: "How can Color Picker help maintain a consistent palette?",
    specificA: "Use it to standardize exact color codes and avoid visually similar but different values across components.",
    processing: "local",
  },
  "color-converter": {
    purpose: "convert between HEX, RGB, HSL and related color formats",
    input: "enter color value in any supported format",
    configure: "Verify source format before conversion.",
    run: "Convert and inspect equivalent color values.",
    result: "Use converted values in code, design systems or exports.",
    specificQ: "Why do converted color strings sometimes look different?",
    specificA: "Rounding and representation differences can change displayed strings while still representing near-identical colors.",
    processing: "local",
  },
  "color-midpoint-calculator": {
    purpose: "calculate midpoint colors between two endpoints for gradients and palettes",
    input: "enter start and end color values",
    configure: "Check interpolation method and format output preference.",
    run: "Calculate midpoint and preview transition.",
    result: "Use midpoint values for balanced gradient steps.",
    specificQ: "Is midpoint color interpolation always perceptually uniform?",
    specificA: "Not always. RGB interpolation is simple but may not match human perception; HSL/LAB approaches can differ.",
    processing: "local",
  },
  "image-resizer": {
    purpose: "resize images for web performance and layout constraints",
    input: "upload an image file to the resizer",
    configure: "Set target width, height and keep-aspect preferences.",
    run: "Resize image and preview output dimensions.",
    result: "Download resized file for websites, apps or social media.",
    specificQ: "Why does image quality drop after resizing?",
    specificA: "Aggressive downscaling or compression settings reduce detail. Tune output size and quality together.",
    processing: "local",
  },
  "image-to-base64": {
    purpose: "convert image files to Base64 strings for embedding and transport",
    input: "upload an image from your device",
    configure: "Confirm output format and data URI requirements.",
    run: "Generate Base64 string from image bytes.",
    result: "Copy Base64 output for HTML, CSS or API payloads.",
    specificQ: "When should I avoid embedding images as Base64?",
    specificA: "Large Base64 payloads can increase document size and reduce cache efficiency. External assets are often better for big images.",
    processing: "local",
  },
  "base64-image-viewer": {
    purpose: "preview Base64 image data and verify decoded output visually",
    input: "paste Base64 image data or data URI",
    configure: "Check header prefix and encoding integrity before decoding.",
    run: "Render the decoded image preview.",
    result: "Inspect output and copy corrected Base64 if needed.",
    specificQ: "Why does Base64 Image Viewer fail to render some strings?",
    specificA: "Missing prefixes, invalid padding or corrupted data can break decoding. Validate the Base64 string format first.",
    processing: "local",
  },
  "svg-viewer-editor": {
    purpose: "preview and edit SVG markup directly in the browser",
    input: "paste SVG code into the editor panel",
    configure: "Adjust attributes, viewBox and styles while previewing output.",
    run: "Render SVG and inspect visual changes in real time.",
    result: "Copy updated SVG markup back into your project.",
    specificQ: "Why does an SVG render blank after editing?",
    specificA: "Invalid XML syntax, missing namespaces or incorrect viewBox values are common reasons for blank rendering.",
    processing: "local",
  },
  "qr-code-decoder": {
    purpose: "decode QR code content from uploaded images quickly",
    input: "upload a clear image containing a QR code",
    configure: "Crop or retry with higher contrast if decoding fails.",
    run: "Decode the QR payload from the image.",
    result: "Copy decoded text or URL for verification and reuse.",
    specificQ: "What improves QR Code Decoder success rate on blurry images?",
    specificA: "Higher contrast, straight framing and better image resolution usually improve recognition reliability.",
    processing: "local",
  },
};

const TARGET_FILES = Object.keys(CONTENT);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getToolMap() {
  const tools = JSON.parse(fs.readFileSync(TOOLS_LIST, "utf8"));
  const map = new Map();
  tools.forEach((tool) => map.set(tool.file, tool));
  return map;
}

function getProcessingFaq(toolName, mode) {
  if (mode === "mixed") {
    return {
      q: `Does ${toolName} always work fully offline?`,
      a: `${toolName} does core rendering in your browser, but some network details may come from external lookup services depending on the feature.`,
    };
  }
  return {
    q: `Does ${toolName} send my input to a server?`,
    a: `For normal usage, ${toolName} processes data locally in your browser so you can test quickly without uploading project files.`,
  };
}

function buildHowToHtml(tool, meta) {
  const steps = [meta.input, meta.configure, meta.run, meta.result];
  return {
    steps,
    html: `<section class="how-to-use">
<h3>How to Use ${escapeHtml(tool.name)}</h3>
<ol class="how-to-steps">
  <li><strong>Step 1:</strong> ${escapeHtml(steps[0])}</li>
  <li><strong>Step 2:</strong> ${escapeHtml(steps[1])}</li>
  <li><strong>Step 3:</strong> ${escapeHtml(steps[2])}</li>
  <li><strong>Step 4:</strong> ${escapeHtml(steps[3])}</li>
</ol>
</section>`,
  };
}

function buildFaqHtml(tool, meta) {
  const faqs = [
    {
      q: `What is ${tool.name} mainly used for?`,
      a: `${tool.name} is mainly used to ${meta.purpose}.`,
    },
    getProcessingFaq(tool.name, meta.processing),
    {
      q: meta.specificQ,
      a: meta.specificA,
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

function buildHowToSchema(tool, steps) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Use ${tool.name}`,
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

function replaceOne(content, regex, replacement) {
  if (!regex.test(content)) return { content, changed: false };
  const updated = content.replace(regex, replacement);
  return { content: updated, changed: updated !== content };
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

  if (found) return updated;
  if (!updated.includes("</head>")) return updated;
  return updated.replace("</head>", `${scriptTag}\n</head>`);
}

function main() {
  const toolMap = getToolMap();
  let updated = 0;
  let skipped = 0;

  TARGET_FILES.forEach((slug) => {
    const filePath = path.join(TOOLS_DIR, `${slug}.html`);
    if (!fs.existsSync(filePath)) {
      skipped++;
      return;
    }

    const meta = CONTENT[slug];
    const tool = toolMap.get(slug) || { file: slug, name: slug };
    const howTo = buildHowToHtml(tool, meta);
    const faq = buildFaqHtml(tool, meta);
    const howToSchema = buildHowToSchema(tool, howTo.steps);
    const faqSchema = buildFaqSchema(faq.faqs);

    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    content = replaceOne(
      content,
      /<section class="how-to-use">[\s\S]*?<\/section>/,
      howTo.html
    ).content;

    content = replaceOne(
      content,
      /<section class="faq">[\s\S]*?<\/section>/,
      faq.html
    ).content;

    content = upsertLdJsonByType(content, "HowTo", howToSchema);
    content = upsertLdJsonByType(content, "FAQPage", faqSchema);

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      updated++;
      console.log(`Updated ${slug}.html`);
    } else {
      skipped++;
    }
  });

  console.log(`\nDone. Updated ${updated} files, skipped ${skipped}.`);
}

main();
