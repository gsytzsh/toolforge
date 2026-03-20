#!/usr/bin/env node
/**
 * Enhance HowTo + FAQ content for high-priority tool pages.
 * Rewrites:
 * 1) <section class="how-to-use">
 * 2) <section class="faq">
 * 3) HowTo JSON-LD script
 * 4) FAQPage JSON-LD script
 *
 * Run: node scripts/enhance-top-tool-content.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");

const TARGET_FILES = [
  "json-viewer",
  "json-to-csv",
  "json-to-xml",
  "json-diff",
  "json-path-tester",
  "yaml-json-converter",
  "base64-encode",
  "url-encode-decode",
  "uuid-generator",
  "timestamp-converter",
  "password-generator",
  "hash-generator",
  "jwt-inspector",
  "jwt-generator",
  "html-formatter",
  "js-beautify-minify",
  "sql-formatter",
  "regex-replace-tester",
  "curl-to-fetch",
  "ip-info",
  "meta-tag-preview",
  "open-graph-generator",
  "twitter-card-generator",
  "robots-txt-generator",
  "canonical-tag-generator",
  "utm-builder",
  "loan-calculator",
  "bmi-calculator",
  "age-calculator",
  "unit-price-calculator",
];

const CONTENT = {
  "json-viewer": {
    purpose: "inspect, validate and format JSON quickly before sending payloads to APIs or saving config files",
    input: "paste raw JSON into the editor",
    configure: "Use format and tree controls to expand or collapse nested objects while checking structure.",
    run: "Run format or validation to catch syntax errors and normalize indentation.",
    result: "Copy the cleaned JSON output for your API request, logs or documentation.",
    specificQ: "Why does JSON Viewer fail on some payloads copied from logs?",
    specificA: "Log snippets often include trailing commas, single quotes or non-JSON prefixes. Remove those wrappers and validate again.",
    processing: "local",
  },
  "json-to-csv": {
    purpose: "convert array-based JSON into tabular CSV for spreadsheets, BI tools or quick exports",
    input: "paste JSON records or load your sample JSON",
    configure: "Review detected keys and ensure records share consistent field names before conversion.",
    run: "Start conversion to flatten rows and generate a CSV table.",
    result: "Copy or download CSV output for Excel, Google Sheets or data import tasks.",
    specificQ: "How are nested JSON fields handled in JSON to CSV?",
    specificA: "Nested values are typically flattened or stringified. For best results, pre-normalize deeply nested objects before converting.",
    processing: "local",
  },
  "json-to-xml": {
    purpose: "transform JSON payloads into XML format for legacy services, integrations and feed generation",
    input: "enter the JSON object you want to transform",
    configure: "Check root element and array behavior so the generated XML matches your target schema.",
    run: "Convert JSON to XML and review generated tags and hierarchy.",
    result: "Copy XML output and test it with your receiving API or validator.",
    specificQ: "Can JSON to XML preserve numeric and boolean data types exactly?",
    specificA: "XML stores text nodes, so type semantics depend on the consumer schema. Validate against the target XSD when strict typing matters.",
    processing: "local",
  },
  "json-diff": {
    purpose: "compare two JSON documents and locate changed keys, values and structures",
    input: "paste JSON A and JSON B into the two input panels",
    configure: "Format both payloads first so key order and nesting are easier to compare.",
    run: "Run diff to highlight additions, deletions and modified fields.",
    result: "Review the differences and copy the changed sections into your changelog or review note.",
    specificQ: "Why do two JSON files look different even when data is equivalent?",
    specificA: "Ordering, whitespace and type mismatches can create noisy diffs. Normalize formatting and confirm value types before final comparison.",
    processing: "local",
  },
  "json-path-tester": {
    purpose: "test JSONPath expressions against real payloads before using them in automation or ETL flows",
    input: "paste a sample JSON payload and a JSONPath query",
    configure: "Adjust path syntax and filters to match your data shape exactly.",
    run: "Execute the query and inspect matched nodes.",
    result: "Copy the working JSONPath expression into your script, workflow or monitoring rule.",
    specificQ: "What should I check if a JSONPath query returns no results?",
    specificA: "Verify path notation, array indexes and key spelling. Small differences in nesting are the most common cause of empty results.",
    processing: "local",
  },
  "yaml-json-converter": {
    purpose: "switch between YAML and JSON when working with configs, CI pipelines and API specs",
    input: "paste YAML or JSON source content",
    configure: "Choose conversion direction and quickly verify indentation and quoting before converting.",
    run: "Convert and inspect the output format for structural correctness.",
    result: "Copy the converted content into your config file or deployment pipeline.",
    specificQ: "Why does YAML to JSON conversion break on some files?",
    specificA: "Invalid indentation, tabs, anchors or malformed lists can fail parsing. Lint YAML first if conversion errors persist.",
    processing: "local",
  },
  "base64-encode": {
    purpose: "encode plain text to Base64 or decode Base64 strings during API debugging and header checks",
    input: "type plain text or paste an existing Base64 string",
    configure: "Select encode or decode mode based on the data you are handling.",
    run: "Run conversion and verify output instantly.",
    result: "Copy the converted value into your request body, header or test data.",
    specificQ: "Is Base64 output secure for storing secrets?",
    specificA: "No. Base64 is only an encoding format. Use encryption or proper secret storage for sensitive values.",
    processing: "local",
  },
  "url-encode-decode": {
    purpose: "encode and decode URLs or query parameters safely for links, redirects and API calls",
    input: "paste a full URL, query string or parameter value",
    configure: "Choose encode or decode mode to match your workflow.",
    run: "Convert and verify reserved characters are handled correctly.",
    result: "Copy the final URL string back into your app, script or browser test.",
    specificQ: "Should I encode an entire URL or only query parameters?",
    specificA: "Usually encode parameter values, not separators like '?' '&' '='. Encoding the whole URL can make routing unreadable.",
    processing: "local",
  },
  "uuid-generator": {
    purpose: "create UUID values for IDs in databases, logs, test fixtures and API resources",
    input: "open the generator and prepare to create a new UUID",
    configure: "Use generation controls if your workflow needs repeated values quickly.",
    run: "Generate a fresh UUID and confirm format.",
    result: "Copy the UUID into your record, payload or fixture data.",
    specificQ: "Can UUID Generator create collisions in normal usage?",
    specificA: "UUID v4 collisions are extremely unlikely for typical workloads. They are suitable for most application identifiers.",
    processing: "local",
  },
  "timestamp-converter": {
    purpose: "convert Unix timestamps and readable dates when debugging logs, APIs and schedulers",
    input: "enter a Unix timestamp or a calendar date-time value",
    configure: "Select seconds or milliseconds and confirm timezone context before converting.",
    run: "Run conversion and inspect both machine and human-readable formats.",
    result: "Copy converted time values for documentation, monitoring or request payloads.",
    specificQ: "Why is my converted timestamp off by several hours?",
    specificA: "Timezone mismatch is the usual cause. Confirm whether your source data is UTC or local time before converting.",
    processing: "local",
  },
  "password-generator": {
    purpose: "generate strong passwords with configurable length and character sets",
    input: "set desired password length and character options",
    configure: "Enable uppercase, lowercase, numbers and symbols according to your policy.",
    run: "Generate a password and review complexity.",
    result: "Copy the generated password into your account setup or secret manager.",
    specificQ: "What length is recommended for generated passwords?",
    specificA: "For most accounts, 16+ characters with mixed character types gives strong practical security.",
    processing: "local",
  },
  "hash-generator": {
    purpose: "create cryptographic digests for checksums, signatures and integrity checks",
    input: "paste text or data that you want to hash",
    configure: "Choose the hash algorithm required by your target system.",
    run: "Generate hash output and verify expected format.",
    result: "Copy the digest for comparison, storage or downstream verification.",
    specificQ: "Can Hash Generator recover original text from a hash?",
    specificA: "No. Hash functions are one-way by design. You can only compare hashes, not reverse them to original input.",
    processing: "local",
  },
  "jwt-inspector": {
    purpose: "decode JWT structure and inspect header, payload and expiry claims quickly",
    input: "paste a JWT token into the input field",
    configure: "Inspect header and payload sections while checking timestamps and claims.",
    run: "Decode token data and review claim values.",
    result: "Use decoded output to troubleshoot auth flow or token configuration.",
    specificQ: "Does JWT Inspector validate token signature automatically?",
    specificA: "Decoding and signature validation are different steps. Use the correct secret/public key to verify signatures when needed.",
    processing: "local",
  },
  "jwt-generator": {
    purpose: "create test JWT tokens for authentication demos and development environments",
    input: "enter header, payload and signing key data",
    configure: "Choose signing algorithm and set claims like exp, iat and issuer.",
    run: "Generate the JWT string for your test case.",
    result: "Copy token output to Postman, frontend auth tests or local API calls.",
    specificQ: "Should JWT Generator be used for production secrets?",
    specificA: "Use it for development and testing. Production token signing should happen in controlled backend infrastructure.",
    processing: "local",
  },
  "html-formatter": {
    purpose: "beautify raw HTML so markup is easier to read, debug and review",
    input: "paste minified or compact HTML markup",
    configure: "Check that your snippet is complete enough to parse correctly.",
    run: "Run formatting to normalize indentation and line breaks.",
    result: "Copy readable HTML back into your editor or code review comment.",
    specificQ: "Why does formatted HTML output differ from my original spacing?",
    specificA: "Formatter tools normalize whitespace and indentation intentionally. Compare rendered DOM structure instead of exact spacing.",
    processing: "local",
  },
  "js-beautify-minify": {
    purpose: "beautify JavaScript for readability or minify it for compact distribution",
    input: "paste JavaScript source code into the editor",
    configure: "Choose beautify or minify mode based on your goal.",
    run: "Process code and review transformed output.",
    result: "Copy the result into your build step, script file or debugging session.",
    specificQ: "Can minification change JavaScript behavior?",
    specificA: "Well-formed code should remain functionally equivalent, but always run tests after minifying critical logic.",
    processing: "local",
  },
  "sql-formatter": {
    purpose: "reformat SQL queries to improve readability and maintain consistent style",
    input: "paste raw SQL into the input panel",
    configure: "Choose formatting preferences such as keyword casing and line breaks.",
    run: "Format SQL and inspect clause structure.",
    result: "Copy the cleaned query into your migration, notebook or review diff.",
    specificQ: "Will SQL Formatter validate query correctness?",
    specificA: "Formatting improves readability but does not guarantee semantic correctness. Execute queries in your DB environment to validate.",
    processing: "local",
  },
  "regex-replace-tester": {
    purpose: "test regex patterns and replacement rules before applying them in production scripts",
    input: "paste sample text, regex pattern and replacement expression",
    configure: "Toggle regex flags such as global, multiline or case-insensitive mode.",
    run: "Execute replace and inspect changed output.",
    result: "Copy the final pattern and replacement string into your codebase.",
    specificQ: "Why does my regex replacement only change the first match?",
    specificA: "Most engines need the global flag to replace all matches. Check flags and escaping in both pattern and replacement.",
    processing: "local",
  },
  "curl-to-fetch": {
    purpose: "convert cURL commands into fetch code for frontend and Node.js workflows",
    input: "paste a cURL command with headers and body",
    configure: "Review method, headers and payload parsing after conversion.",
    run: "Generate fetch code snippet.",
    result: "Copy generated fetch code into your app or API test harness.",
    specificQ: "Are all cURL options supported when converting to fetch?",
    specificA: "Common headers, methods and bodies are supported. Advanced options like retries or TLS flags may require manual edits.",
    processing: "local",
  },
  "ip-info": {
    purpose: "look up IP-related network details for diagnostics and traffic analysis",
    input: "enter an IP address or use your current client IP",
    configure: "Confirm whether you need geolocation, ASN or connection metadata.",
    run: "Fetch and inspect IP details returned by the tool.",
    result: "Use the output for troubleshooting, audit notes or network triage.",
    specificQ: "Why can geolocation results differ between providers?",
    specificA: "IP geolocation databases are estimates and update on different schedules, so city-level accuracy can vary.",
    processing: "mixed",
  },
  "meta-tag-preview": {
    purpose: "preview title and meta description snippets before publishing SEO changes",
    input: "enter title, description and URL fields",
    configure: "Adjust character length to avoid truncation in search results.",
    run: "Generate and preview the snippet output.",
    result: "Copy optimized meta tags into your page head template.",
    specificQ: "What title and description length works best for previews?",
    specificA: "Aim for concise titles and descriptions that communicate intent clearly; exact truncation depends on device and SERP layout.",
    processing: "local",
  },
  "open-graph-generator": {
    purpose: "generate Open Graph tags for better social sharing previews",
    input: "fill in og:title, og:description, og:url and image fields",
    configure: "Select the correct content type and image URL.",
    run: "Generate Open Graph tags and review markup.",
    result: "Copy tags into your page head and validate with social debuggers.",
    specificQ: "Why is my shared image not updating on social platforms?",
    specificA: "Platforms cache OG data. Re-scrape the URL in the platform debugger after updating your tags.",
    processing: "local",
  },
  "twitter-card-generator": {
    purpose: "create Twitter card meta tags for richer link cards on X/Twitter",
    input: "enter card type, title, description and optional image/site fields",
    configure: "Choose summary or summary_large_image based on your preview goal.",
    run: "Generate the Twitter card markup.",
    result: "Copy tags into your HTML head and test with a card validator.",
    specificQ: "Which Twitter card type should I choose?",
    specificA: "Use summary for text-first links and summary_large_image when image impact is important.",
    processing: "local",
  },
  "robots-txt-generator": {
    purpose: "build robots.txt rules for crawling control and sitemap discovery",
    input: "define user-agent rules and disallow/allow paths",
    configure: "Add sitemap URL and verify rule precedence for each crawler.",
    run: "Generate robots.txt output and review directives.",
    result: "Publish the file at /robots.txt and re-test in Search Console.",
    specificQ: "Can robots.txt remove already indexed pages?",
    specificA: "Not reliably. Use noindex signals or removals for indexed URLs; robots.txt mainly controls crawling access.",
    processing: "local",
  },
  "canonical-tag-generator": {
    purpose: "create canonical tags to reduce duplicate URL indexing issues",
    input: "enter the preferred canonical URL for the page",
    configure: "Confirm protocol, host and trailing slash match your final canonical policy.",
    run: "Generate canonical tag markup.",
    result: "Place the tag in the page head and verify with URL Inspection.",
    specificQ: "Should canonical tags point to redirected URLs?",
    specificA: "Use the final destination URL as canonical whenever possible to avoid conflicting consolidation signals.",
    processing: "local",
  },
  "utm-builder": {
    purpose: "build clean UTM campaign URLs for attribution and analytics reporting",
    input: "enter base URL and campaign parameters",
    configure: "Fill source, medium and campaign consistently to keep reports clean.",
    run: "Generate tracking URL with encoded parameters.",
    result: "Copy campaign link into ads, emails or social posts.",
    specificQ: "Why do inconsistent UTM names hurt reporting?",
    specificA: "Small naming differences split data into multiple buckets. Use a strict naming convention across teams.",
    processing: "local",
  },
  "loan-calculator": {
    purpose: "estimate monthly payments and total loan cost from principal, rate and term",
    input: "enter loan amount, interest rate and repayment period",
    configure: "Set term units and payment assumptions to match your contract.",
    run: "Calculate installment amount and totals.",
    result: "Use results to compare financing options or repayment plans.",
    specificQ: "Do loan calculator results include taxes and fees?",
    specificA: "Most basic loan calculations focus on principal and interest only. Add fees, insurance and taxes separately.",
    processing: "local",
  },
  "bmi-calculator": {
    purpose: "calculate body mass index from height and weight inputs",
    input: "enter your height and weight values",
    configure: "Select metric or imperial units before calculating.",
    run: "Calculate BMI score and category.",
    result: "Review the range as a quick screening reference, not a medical diagnosis.",
    specificQ: "Is BMI enough to evaluate overall health?",
    specificA: "BMI is a useful indicator but not a full health assessment. Body composition and medical context also matter.",
    processing: "local",
  },
  "age-calculator": {
    purpose: "calculate exact age and date differences for planning and records",
    input: "enter birth date and target date if needed",
    configure: "Confirm date format and timezone context for accurate day counts.",
    run: "Calculate age in years, months and days.",
    result: "Use output in forms, planning tools or eligibility checks.",
    specificQ: "Why can age differ by one day across systems?",
    specificA: "Timezone cutoffs and date parsing rules can shift boundary calculations. Keep date format and timezone consistent.",
    processing: "local",
  },
  "unit-price-calculator": {
    purpose: "compare product value by unit cost to make better purchase decisions",
    input: "enter item price and quantity/weight/volume",
    configure: "Use the same measurement unit across products before comparing.",
    run: "Calculate unit price for each item.",
    result: "Choose the option with better unit value for your budget.",
    specificQ: "How do I compare packs with different units fairly?",
    specificA: "Convert all products to the same base unit first, then compare calculated unit prices directly.",
    processing: "local",
  },
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getToolMap() {
  try {
    const tools = JSON.parse(fs.readFileSync(TOOLS_LIST, "utf8"));
    const map = new Map();
    tools.forEach((tool) => map.set(tool.file, tool));
    return map;
  } catch (e) {
    console.error("Failed to read tools-list.json:", e.message);
    process.exit(1);
  }
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
  const steps = [
    meta.input,
    meta.configure,
    meta.run,
    meta.result,
  ];
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

  const html = `<section class="faq">
<h3>Frequently Asked Questions</h3>
<dl class="faq-list">

  <dt>${escapeHtml(faqs[0].q)}</dt>
  <dd>${escapeHtml(faqs[0].a)}</dd>

  <dt>${escapeHtml(faqs[1].q)}</dt>
  <dd>${escapeHtml(faqs[1].a)}</dd>

  <dt>${escapeHtml(faqs[2].q)}</dt>
  <dd>${escapeHtml(faqs[2].a)}</dd>
</dl>
</section>`;

  return { faqs, html };
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

function replaceOne(content, regex, replacement, label, file) {
  if (!regex.test(content)) {
    return { content, changed: false, missing: `${file}: missing ${label}` };
  }
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

  if (found) {
    return { content: updated, inserted: false, found: true };
  }

  if (!updated.includes("</head>")) {
    return { content: updated, inserted: false, found: false, missingHead: true };
  }

  return {
    content: updated.replace("</head>", `${scriptTag}\n</head>`),
    inserted: true,
    found: false,
    missingHead: false,
  };
}

function main() {
  const toolMap = getToolMap();
  let updatedCount = 0;
  let skippedCount = 0;
  const warnings = [];

  TARGET_FILES.forEach((slug) => {
    const filePath = path.join(TOOLS_DIR, `${slug}.html`);
    const meta = CONTENT[slug];

    if (!meta) {
      warnings.push(`No content config: ${slug}`);
      skippedCount++;
      return;
    }
    if (!fs.existsSync(filePath)) {
      warnings.push(`Missing file: tools/${slug}.html`);
      skippedCount++;
      return;
    }

    const tool = toolMap.get(slug) || { file: slug, name: slug };
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    const howTo = buildHowToHtml(tool, meta);
    const faq = buildFaqHtml(tool, meta);
    const howToSchema = buildHowToSchema(tool, howTo.steps);
    const faqSchema = buildFaqSchema(faq.faqs);

    const howToResult = replaceOne(
      content,
      /<section class="how-to-use">[\s\S]*?<\/section>/,
      howTo.html,
      "how-to section",
      filePath
    );
    content = howToResult.content;
    if (howToResult.missing) warnings.push(howToResult.missing);

    const faqResult = replaceOne(
      content,
      /<section class="faq">[\s\S]*?<\/section>/,
      faq.html,
      "faq section",
      filePath
    );
    content = faqResult.content;
    if (faqResult.missing) warnings.push(faqResult.missing);

    const howToSchemaResult = upsertLdJsonByType(content, "HowTo", howToSchema);
    content = howToSchemaResult.content;
    if (!howToSchemaResult.found && !howToSchemaResult.inserted) {
      warnings.push(`${filePath}: missing HowTo schema and cannot insert`);
    }
    if (howToSchemaResult.missingHead) {
      warnings.push(`${filePath}: missing </head> while inserting HowTo schema`);
    }

    const faqSchemaResult = upsertLdJsonByType(content, "FAQPage", faqSchema);
    content = faqSchemaResult.content;
    if (!faqSchemaResult.found && !faqSchemaResult.inserted) {
      warnings.push(`${filePath}: missing FAQ schema and cannot insert`);
    }
    if (faqSchemaResult.missingHead) {
      warnings.push(`${filePath}: missing </head> while inserting FAQ schema`);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      updatedCount++;
      console.log(`Updated ${slug}.html`);
    } else {
      skippedCount++;
    }
  });

  console.log(`\nDone. Updated ${updatedCount} files, skipped ${skippedCount}.`);
  if (warnings.length) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log("- " + w));
  }
}

main();
