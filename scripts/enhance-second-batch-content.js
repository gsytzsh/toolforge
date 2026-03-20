#!/usr/bin/env node
/**
 * Enhance HowTo + FAQ content for the second batch of tool pages.
 * Run: node scripts/enhance-second-batch-content.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_DIR = path.join(ROOT, "tools");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");

const CONTENT = {
  "json-schema-generator": {
    purpose: "generate JSON Schema from sample payloads so validation rules can be reused across services",
    input: "paste representative JSON samples into the input area",
    configure: "Review inferred field types and optional keys before generating schema.",
    run: "Generate the schema and inspect required properties and nested definitions.",
    result: "Copy schema output into your API contracts, validators or documentation.",
    specificQ: "Why does JSON Schema Generator infer wrong types for some fields?",
    specificA: "Type inference depends on sample data. Include diverse examples for fields that can vary, then adjust schema manually if needed.",
    processing: "local",
  },
  "schema-validator": {
    purpose: "validate structured data and schema markup before publishing pages",
    input: "paste schema JSON-LD or markup content you want to test",
    configure: "Confirm schema type and required fields are present.",
    run: "Run validation and review warnings or errors line by line.",
    result: "Fix markup issues and copy the corrected schema into your page.",
    specificQ: "Can Schema Validator guarantee rich result eligibility?",
    specificA: "Validation helps correctness, but rich results still depend on page quality, policy compliance and Google's rendering decisions.",
    processing: "local",
  },
  "json-postman-converter": {
    purpose: "convert request definitions between JSON formats used in API tooling workflows",
    input: "paste source request JSON from your current tool",
    configure: "Check method, headers and body mappings before conversion.",
    run: "Convert to the target structure and inspect output fields.",
    result: "Import converted JSON into Postman or your API client.",
    specificQ: "What should I verify after converting JSON for Postman?",
    specificA: "Always verify auth headers, environment variables and body mode because different tools model them differently.",
    processing: "local",
  },
  "api-mock-generator": {
    purpose: "create mock API responses quickly for frontend and integration testing",
    input: "enter sample fields or payload structure for the mock response",
    configure: "Set response shape, sample values and status behavior for your test case.",
    run: "Generate mock payload output.",
    result: "Copy mock response data into fixtures or local mock servers.",
    specificQ: "Can API Mock Generator replace full backend integration tests?",
    specificA: "Mocks speed up UI and contract testing, but they should complement, not replace, end-to-end backend validation.",
    processing: "local",
  },
  "http-request-builder": {
    purpose: "build HTTP requests with method, headers and body for debugging API calls",
    input: "enter endpoint URL, method and payload fields",
    configure: "Add headers, auth tokens and body format to match your API requirements.",
    run: "Generate or preview the request configuration.",
    result: "Copy the request details into your API client or documentation.",
    specificQ: "Why does my built request still fail with 401 or 403?",
    specificA: "Check authorization headers, token freshness and required scope permissions. Request shape may be correct while credentials are not.",
    processing: "local",
  },
  "curl-builder": {
    purpose: "generate cURL commands for API testing and reproducible request debugging",
    input: "enter URL, method, headers and request body values",
    configure: "Review escaping, quoting and content type options.",
    run: "Generate the final cURL command.",
    result: "Run the command in terminal or share it for debugging.",
    specificQ: "How can I avoid quote and escaping issues in cURL commands?",
    specificA: "Use single quotes around JSON bodies where possible and escape inner quotes consistently for your shell.",
    processing: "local",
  },
  "graphql-query-builder": {
    purpose: "build GraphQL queries and mutations with correct field selection and variables",
    input: "enter operation type, fields and variables",
    configure: "Check argument names and nesting to match your GraphQL schema.",
    run: "Generate query text for your request.",
    result: "Copy the generated query into your client, resolver tests or docs.",
    specificQ: "Why does GraphQL Query Builder output still fail validation?",
    specificA: "Server schema and local query assumptions may differ. Verify field names, variable types and required arguments against introspection docs.",
    processing: "local",
  },
  "sql-query-builder": {
    purpose: "compose SQL select statements faster with structured fields and conditions",
    input: "provide table, selected columns and filter inputs",
    configure: "Set joins, conditions and ordering for your query intent.",
    run: "Generate SQL query text.",
    result: "Copy SQL into your editor, migration or BI workflow.",
    specificQ: "Does SQL Query Builder prevent SQL injection by itself?",
    specificA: "Builders help structure queries, but secure parameterization must still be handled in your application runtime.",
    processing: "local",
  },
  "sql-where-builder": {
    purpose: "construct complex WHERE clauses with nested conditions and operators",
    input: "enter filter conditions and logical operators",
    configure: "Review precedence of AND/OR groups before generating output.",
    run: "Generate WHERE clause text.",
    result: "Paste the clause into your SQL query and run tests.",
    specificQ: "Why do my WHERE results differ after adding OR conditions?",
    specificA: "Operator precedence can change logic unexpectedly. Use parentheses to make intended grouping explicit.",
    processing: "local",
  },
  "json-get-converter": {
    purpose: "convert JSON into query-style parameter strings for GET requests and debugging",
    input: "paste JSON input containing keys and values",
    configure: "Review nested object handling and array serialization style.",
    run: "Convert JSON to GET-style parameter output.",
    result: "Use the generated query string in URLs or API tests.",
    specificQ: "How are arrays encoded in JSON to GET conversion?",
    specificA: "Encoding conventions vary by backend. Confirm whether your API expects repeated keys, bracket notation or comma-joined values.",
    processing: "local",
  },
  "json-to-pdf": {
    purpose: "export JSON data into readable PDF output for sharing and archiving",
    input: "paste or load JSON data to export",
    configure: "Adjust layout options and verify content structure before export.",
    run: "Generate PDF from your JSON content.",
    result: "Download PDF for reporting, handoff or documentation.",
    specificQ: "Can JSON to PDF handle deeply nested objects cleanly?",
    specificA: "Deep nesting may reduce readability in fixed-width layouts. Flatten key fields first for cleaner PDF reports.",
    processing: "local",
  },
  "csv-to-pdf": {
    purpose: "convert CSV tables into printable PDF documents",
    input: "paste CSV text or upload a CSV file",
    configure: "Check delimiter and column alignment before export.",
    run: "Generate PDF table output.",
    result: "Download the PDF for sharing, filing or review.",
    specificQ: "What causes broken columns in CSV to PDF output?",
    specificA: "Unescaped delimiters or inconsistent row lengths are common causes. Normalize CSV formatting first.",
    processing: "local",
  },
  "excel-to-pdf": {
    purpose: "turn spreadsheet content into PDF format for easier sharing",
    input: "upload or paste tabular data from Excel",
    configure: "Adjust page size and orientation for wide sheets.",
    run: "Convert spreadsheet data to PDF.",
    result: "Download the generated PDF for distribution.",
    specificQ: "Why does Excel to PDF truncate some columns?",
    specificA: "Page width and font scale can clip wide tables. Try landscape orientation or split data into sections.",
    processing: "local",
  },
  "html-to-pdf": {
    purpose: "convert HTML snippets into PDF files for snapshots and reports",
    input: "paste HTML content you want to export",
    configure: "Review styling and page breaks before rendering.",
    run: "Generate the PDF output.",
    result: "Download PDF and verify layout in a viewer.",
    specificQ: "Why can HTML to PDF look different from browser preview?",
    specificA: "Print rendering rules differ from screen rendering. Explicit print styles improve consistency.",
    processing: "local",
  },
  "markdown-to-pdf": {
    purpose: "export Markdown notes into PDF for documentation and sharing",
    input: "paste Markdown content into the editor",
    configure: "Review headings, lists and code blocks for expected formatting.",
    run: "Render and convert Markdown to PDF.",
    result: "Download the final document for handoff or archive.",
    specificQ: "Do Markdown extensions always render in Markdown to PDF?",
    specificA: "Not all extensions are supported the same way. Test advanced tables or plugins before relying on final output.",
    processing: "local",
  },
  "text-to-pdf": {
    purpose: "convert plain text into clean PDF documents quickly",
    input: "paste plain text content to export",
    configure: "Adjust spacing and line breaks for readability.",
    run: "Generate PDF from text input.",
    result: "Download PDF for printing or sharing.",
    specificQ: "How can I keep text wrapping readable in Text to PDF?",
    specificA: "Use shorter line lengths and clear paragraph breaks before exporting to improve PDF readability.",
    processing: "local",
  },
  "xml-to-pdf": {
    purpose: "export XML content as PDF for review or documentation",
    input: "paste XML source text",
    configure: "Format XML first so hierarchy is easier to read in PDF.",
    run: "Generate PDF from XML data.",
    result: "Download and share formatted XML output.",
    specificQ: "Why does XML to PDF look dense on long files?",
    specificA: "Large XML trees are verbose by nature. Collapse unneeded nodes or split files for better readability.",
    processing: "local",
  },
  "yaml-to-pdf": {
    purpose: "convert YAML configs into PDF snapshots for docs and approvals",
    input: "paste YAML content into the tool",
    configure: "Validate indentation and structure before exporting.",
    run: "Render and export YAML to PDF.",
    result: "Download PDF for sharing with non-technical stakeholders.",
    specificQ: "What if YAML to PDF output shows parse errors?",
    specificA: "Parsing fails on indentation or syntax mistakes. Lint YAML first, then retry export.",
    processing: "local",
  },
  "x-robots-tag-generator": {
    purpose: "create X-Robots-Tag headers to control indexing of files and non-HTML resources",
    input: "select directives like noindex, nofollow or noarchive",
    configure: "Review directives for each content type you serve.",
    run: "Generate X-Robots-Tag header output.",
    result: "Apply header on server responses and test with crawlers.",
    specificQ: "When should I use X-Robots-Tag instead of meta robots?",
    specificA: "X-Robots-Tag is ideal for PDFs, images and other non-HTML resources where meta tags are unavailable.",
    processing: "local",
  },
  "meta-robots-generator": {
    purpose: "generate meta robots tags for page-level crawl and index control",
    input: "choose indexing and snippet directives",
    configure: "Confirm directives align with your SEO strategy for that page.",
    run: "Generate meta robots tag markup.",
    result: "Insert the tag in your page head and re-crawl.",
    specificQ: "Can conflicting robots directives cause indexing issues?",
    specificA: "Yes. Keep robots rules consistent across meta tags, headers and canonical directives to avoid mixed signals.",
    processing: "local",
  },
  "robots-txt-tester": {
    purpose: "test robots.txt rules against target URLs before publishing changes",
    input: "paste robots.txt content and a test URL",
    configure: "Select or enter the user-agent to evaluate.",
    run: "Run rules test and inspect allow/disallow result.",
    result: "Adjust rules and retest until behavior matches intent.",
    specificQ: "Why does Robots.txt Tester disagree with live crawl behavior?",
    specificA: "Cached robots files, redirect chains and user-agent differences can affect live behavior. Recheck deployed file and fetch timing.",
    processing: "local",
  },
  "sitemap-validator": {
    purpose: "validate sitemap XML structure and detect formatting errors before submission",
    input: "paste sitemap XML content or sample URL list",
    configure: "Check protocol, encoding and required tags.",
    run: "Validate sitemap and inspect reported errors.",
    result: "Fix issues before submitting sitemap to search engines.",
    specificQ: "Does Sitemap Validator check if URLs are actually indexable?",
    specificA: "Schema validation checks format, not indexability. Also verify robots rules, status codes and canonical signals.",
    processing: "local",
  },
  "schema-faq-generator": {
    purpose: "generate FAQ structured data for eligible question-answer content",
    input: "enter questions and answers for your page",
    configure: "Ensure each answer is concise and matches visible on-page content.",
    run: "Generate FAQPage JSON-LD markup.",
    result: "Add the script to your page and validate markup.",
    specificQ: "Can generated FAQ schema appear without visible FAQ content?",
    specificA: "Usually no. Structured data should reflect visible content to avoid policy issues.",
    processing: "local",
  },
  "schema-markup-generator": {
    purpose: "create structured data snippets for common schema types",
    input: "choose schema type and fill required fields",
    configure: "Review mandatory vs optional properties before generating.",
    run: "Generate JSON-LD schema markup.",
    result: "Paste generated markup in your page head or body.",
    specificQ: "How do I choose the right schema type for a page?",
    specificA: "Choose the type that best matches primary page intent and visible content, then include only truthful properties.",
    processing: "local",
  },
  "breadcrumb-schema-generator": {
    purpose: "generate breadcrumb structured data to clarify site hierarchy for search engines",
    input: "enter breadcrumb labels and URLs in order",
    configure: "Confirm path order from homepage to current page.",
    run: "Generate BreadcrumbList JSON-LD output.",
    result: "Add markup to template and test in validators.",
    specificQ: "Should breadcrumb schema match on-page breadcrumb links exactly?",
    specificA: "Yes, keep labels and URLs consistent between visible breadcrumbs and schema for stronger clarity signals.",
    processing: "local",
  },
  "hreflang-tag-generator": {
    purpose: "create hreflang tags for multilingual or multi-regional pages",
    input: "enter alternate URLs with language-region codes",
    configure: "Check reciprocal mapping and x-default configuration.",
    run: "Generate hreflang tag set.",
    result: "Insert tags into head and verify in Search Console reports.",
    specificQ: "What is a common hreflang implementation mistake?",
    specificA: "Missing reciprocal references is very common. Every alternate URL should reference the others consistently.",
    processing: "local",
  },
  "heading-structure-checker": {
    purpose: "audit heading hierarchy to improve content structure and accessibility",
    input: "paste HTML or page content for heading analysis",
    configure: "Review heading levels and sequence from H1 to lower levels.",
    run: "Run checker and inspect skipped or repeated levels.",
    result: "Adjust heading order to reflect clear document structure.",
    specificQ: "Does heading order directly guarantee better ranking?",
    specificA: "Not by itself, but strong structure improves readability, accessibility and content clarity signals.",
    processing: "local",
  },
  "slug-generator": {
    purpose: "convert text titles into URL-friendly slugs for pages and posts",
    input: "enter the title or phrase to transform",
    configure: "Choose separator and casing style for your URL convention.",
    run: "Generate slug output.",
    result: "Use the slug in route paths, filenames or CMS URLs.",
    specificQ: "Should slugs include stop words like 'the' and 'of'?",
    specificA: "They can, but concise slugs are usually cleaner. Keep URLs readable and stable rather than over-optimizing.",
    processing: "local",
  },
  "password-strength-checker": {
    purpose: "estimate password strength and identify weak credential patterns",
    input: "enter a candidate password for analysis",
    configure: "Review strength indicators like length, character diversity and predictability.",
    run: "Run strength check and inspect feedback.",
    result: "Improve password until strength recommendations are met.",
    specificQ: "Does Password Strength Checker store my password?",
    specificA: "This tool checks input in-browser for quick feedback, so you can evaluate password quality without server-side storage.",
    processing: "local",
  },
  "uuid-validator": {
    purpose: "verify whether strings match valid UUID formats before processing",
    input: "paste one or multiple UUID candidates",
    configure: "Check expected UUID version or accepted format rules.",
    run: "Validate inputs and review pass/fail results.",
    result: "Use validated IDs in API calls, imports or database operations.",
    specificQ: "Why does UUID Validator reject some IDs from external systems?",
    specificA: "Some systems use non-standard formats or remove dashes. Normalize format and confirm version expectations before validation.",
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
