#!/usr/bin/env node
/**
 * Add How-to Use section and FAQ Schema to all tool pages.
 * Run: node scripts/add-howto-faq.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_LIST = path.join(ROOT, "tools-list.json");
const TOOLS_DIR = path.join(ROOT, "tools");

// How-to templates by category
const HOW_TO_TEMPLATES = {
  "JSON & API": {
    steps: [
      "Copy and paste your JSON data into the input field.",
      "Select the operation you want to perform (format, validate, convert, etc.).",
      "Click the action button to process your data.",
      "Review the result and click Copy to use it in your project."
    ]
  },
  "Encoding & Decoding": {
    steps: [
      "Enter the text or encoded string you want to convert.",
      "Choose the encoding or decoding mode.",
      "Click Convert to see the result.",
      "Copy the output to use it in your application."
    ]
  },
  "Text Tools": {
    steps: [
      "Paste your text into the input area.",
      "Select the transformation you need (case change, remove lines, etc.).",
      "Click the action button to apply the changes.",
      "Copy the processed text for your use."
    ]
  },
  "Developer Tools": {
    steps: [
      "Enter your code or data into the input field.",
      "Choose the formatting or validation option you need.",
      "Click the process button to see the result.",
      "Copy or download the output for your project."
    ]
  },
  "Calculators": {
    steps: [
      "Enter the required values in the input fields.",
      "Select any additional options if available.",
      "Click Calculate to see the result.",
      "Use the calculated value for your planning or decision."
    ]
  },
  "Generators": {
    steps: [
      "Configure the generation options (length, character sets, etc.).",
      "Click Generate to create your random value.",
      "Review the generated result.",
      "Copy the value to use it in your application."
    ]
  },
  "Unit Converters": {
    steps: [
      "Enter the value you want to convert.",
      "Select the source unit from the dropdown.",
      "View the converted values in all units.",
      "Use the result for your calculation or project."
    ]
  },
  "Date & Time": {
    steps: [
      "Enter the date or time value.",
      "Select the target format or timezone if applicable.",
      "Click Convert or Calculate to see the result.",
      "Copy the converted value for your use."
    ]
  },
  "PDF & Export": {
    steps: [
      "Paste your content or upload your file.",
      "Configure the export options (format, quality, etc.).",
      "Click the Generate or Convert button.",
      "Download the exported file to your device."
    ]
  },
  "Images & Colors": {
    steps: [
      "Upload your image or enter the color value.",
      "Adjust the settings (size, format, compression, etc.).",
      "Click Process to see the preview.",
      "Download the processed image or copy the color code."
    ]
  },
  "Web & Network": {
    steps: [
      "Enter the URL, IP address or other network data.",
      "Select the analysis or lookup option you need.",
      "Click the action button to get results.",
      "Review the information for your troubleshooting."
    ]
  },
  "SEO Tools": {
    steps: [
      "Enter your website URL or meta information.",
      "Configure the SEO parameters you want to generate.",
      "Click Generate to create the tags or code.",
      "Copy the output and add it to your webpage."
    ]
  },
  "Security & Tokens": {
    steps: [
      "Enter your text or select the token type.",
      "Configure security options (length, algorithm, etc.).",
      "Click Generate or Hash to process.",
      "Copy the secure value for your application."
    ]
  },
  "Productivity": {
    steps: [
      "Enter your task or time information.",
      "Select any preferences or settings.",
      "Click the action button to get results.",
      "Use the output to improve your workflow."
    ]
  }
};

// FAQ templates by category
const FAQ_TEMPLATES = {
  "JSON & API": {
    questions: [
      { q: "What is JSON?", a: "JSON (JavaScript Object Notation) is a lightweight data format used for storing and exchanging data between systems. It uses human-readable key-value pairs and is commonly used in web APIs." },
      { q: "Is my data sent to a server?", a: "No. All JSON processing happens entirely in your browser. Your data never leaves your device, ensuring complete privacy and security." },
      { q: "Can I use this for large JSON files?", a: "Yes, but very large files (over 10MB) may cause browser performance issues. For best results, keep files under 5MB." }
    ]
  },
  "Encoding & Decoding": {
    questions: [
      { q: "What is Base64 encoding?", a: "Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. It's commonly used for embedding images in HTML or transmitting binary data over text protocols." },
      { q: "Is Base64 encryption?", a: "No. Base64 is encoding, not encryption. It's designed for data compatibility, not security. Anyone can decode Base64 strings back to the original data." },
      { q: "Does this work offline?", a: "Yes. All encoding and decoding happens in your browser without any server connection." }
    ]
  },
  "Calculators": {
    questions: [
      { q: "How accurate are these calculations?", a: "Our calculators use standard mathematical formulas and provide results with appropriate precision for most use cases." },
      { q: "Can I use this for professional purposes?", a: "While our calculators are accurate, please verify critical calculations with professional tools or experts for important decisions." }
    ]
  },
  "Generators": {
    questions: [
      { q: "Are the generated values secure?", a: "Yes. We use cryptographically secure random number generators (crypto.getRandomValues) when available in your browser." },
      { q: "Can I generate multiple values at once?", a: "Currently you can generate one value at a time. Click Generate again to create a new value." },
      { q: "Is there a limit on how many I can generate?", a: "No limit. You can generate as many values as you need, all processed locally in your browser." }
    ]
  },
  "Unit Converters": {
    questions: [
      { q: "What units are supported?", a: "We support common units including metric (meters, kilograms) and imperial (feet, pounds) systems, plus specialized units for data, speed, and more." },
      { q: "How precise are the conversions?", a: "Results are shown with up to 6 decimal places for accuracy. You can round as needed for your use case." }
    ]
  },
  "Date & Time": {
    questions: [
      { q: "What timezone is used?", a: "By default, we use your browser's local timezone. Some tools let you select specific timezones for conversion." },
      { q: "What is Unix timestamp?", a: "Unix timestamp is the number of seconds (or milliseconds) since January 1, 1970 UTC. It's commonly used in programming and databases." }
    ]
  },
  "PDF & Export": {
    questions: [
      { q: "Is my content uploaded?", a: "No. All PDF generation happens in your browser using client-side libraries. Your data stays private." },
      { q: "What format is the output?", a: "PDF files are generated in standard PDF/A format compatible with most viewers and printers." },
      { q: "Can I edit the PDF after generation?", a: "The PDF is ready for download. You can edit it with any PDF editor if needed." }
    ]
  },
  "Images & Colors": {
    questions: [
      { q: "What image formats are supported?", a: "We support common formats including JPEG, PNG, WebP, and GIF for upload and export." },
      { q: "Is there a file size limit?", a: "Most browsers handle images up to 10MB well. Larger files may cause performance issues." },
      { q: "Are color values accurate?", a: "Yes. We use standard color conversion formulas for accurate HEX, RGB, HSL, and CMYK values." }
    ]
  },
  "Web & Network": {
    questions: [
      { q: "Is my data logged?", a: "No. All lookups and analysis happen in your browser or through direct API calls. We don't store any of your queries." },
      { q: "Why is some information missing?", a: "Some data depends on external APIs or the target server's response. If information is unavailable, it may be due to API limits or server restrictions." }
    ]
  },
  "SEO Tools": {
    questions: [
      { q: "Do I need to know HTML?", a: "No. Our tools generate the code for you. Just fill in your information and copy the output." },
      { q: "Where do I add the generated code?", a: "Meta tags go in the <head> section of your HTML. Schema markup can be added as JSON-LD script anywhere on the page." },
      { q: "Will this improve my SEO?", a: "Proper meta tags and structured data help search engines understand your content better, which can improve visibility in search results." }
    ]
  },
  "Security & Tokens": {
    questions: [
      { q: "Are generated passwords secure?", a: "Yes. We use cryptographically secure random generation. For maximum security, use passwords of 16+ characters with mixed character types." },
      { q: "Is my input data stored?", a: "No. All processing happens in your browser. Nothing is sent to our servers or stored." },
      { q: "What hash algorithms are supported?", a: "We support SHA-256 and other common algorithms using the Web Crypto API for secure hashing." }
    ]
  },
  "Text Tools": {
    questions: [
      { q: "Is there a text length limit?", a: "Most browsers handle text up to 100,000 characters well. Very large texts may cause slower performance." },
      { q: "Does this preserve formatting?", a: "It depends on the specific tool. Case converters preserve line breaks, while some tools like word counters analyze all text." }
    ]
  },
  "Developer Tools": {
    questions: [
      { q: "What programming languages are supported?", a: "Our tools support common languages including JavaScript, Python, Java, SQL, HTML, CSS, and more for formatting." },
      { q: "Is my code sent anywhere?", a: "No. All code formatting and analysis happens locally in your browser for complete privacy." },
      { q: "Can I use this offline?", a: "Yes. Once the page loads, all tools work without an internet connection." }
    ]
  },
  "Productivity": {
    questions: [
      { q: "Is my data saved?", a: "Some tools use browser localStorage to save your work locally. Data is stored only on your device and can be cleared anytime." },
      { q: "Can I access my notes from other devices?", a: "Currently data is stored locally in your browser. For cross-device access, consider exporting your data." }
    ]
  }
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(str) {
  return String(str).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function main() {
  let tools;
  try {
    tools = JSON.parse(fs.readFileSync(TOOLS_LIST, "utf8"));
  } catch (e) {
    console.error("Failed to read tools-list.json:", e.message);
    process.exit(1);
  }

  const toolMap = {};
  tools.forEach(t => {
    toolMap[t.file] = t;
  });

  const files = fs.readdirSync(TOOLS_DIR).filter(f => f.endsWith(".html"));
  let updated = 0;
  let skipped = 0;

  files.forEach(file => {
    const toolName = file.replace(".html", "");
    const tool = toolMap[toolName];
    if (!tool) {
      skipped++;
      return;
    }

    const filePath = path.join(TOOLS_DIR, file);
    let content = fs.readFileSync(filePath, "utf8");

    // Skip if already has how-to section
    if (content.includes('class="how-to-use"') || content.includes('class="faq"')) {
      console.log(`Skipping ${file}: already has How-to/FAQ`);
      skipped++;
      return;
    }

    const category = tool.category || "Developer Tools";
    const howToData = HOW_TO_TEMPLATES[category] || HOW_TO_TEMPLATES["Developer Tools"];
    const faqData = FAQ_TEMPLATES[category] || FAQ_TEMPLATES["Developer Tools"];

    // Generate How-to HTML
    const howToHtml = `
<section class="how-to-use">
<h3>How to Use ${escapeHtml(tool.name)}</h3>
<ol class="how-to-steps">
${howToData.steps.map((step, i) => `  <li><strong>Step ${i + 1}:</strong> ${step}</li>`).join("\n")}
</ol>
</section>`;

    // Generate FAQ HTML and Schema
    const faqHtml = `
<section class="faq">
<h3>Frequently Asked Questions</h3>
<dl class="faq-list">
${faqData.questions.map(faq => `
  <dt>${escapeHtml(faq.q)}</dt>
  <dd>${escapeHtml(faq.a)}</dd>`).join("\n")}
</dl>
</section>`;

    // Generate FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.questions.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    };

    // Generate HowTo Schema
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to Use ${tool.name}`,
      "step": howToData.steps.map((step, i) => ({
        "@type": "HowToStep",
        "position": i + 1,
        "text": step
      }))
    };

    // Find position before closing </main> tag
    const mainCloseIndex = content.lastIndexOf("</main>");
    if (mainCloseIndex === -1) {
      console.log(`Skipping ${file}: no </main> tag found`);
      skipped++;
      return;
    }

    // Insert How-to and FAQ before </main>
    const insertContent = howToHtml + faqHtml + "\n";
    content = content.slice(0, mainCloseIndex) + insertContent + content.slice(mainCloseIndex);

    // Add HowTo Schema before existing schemas or before </head>
    const headCloseIndex = content.lastIndexOf("</head>");
    const schemaScript = `
<script type="application/ld+json">
${JSON.stringify(howToSchema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(faqSchema, null, 2)}
</script>
`;
    content = content.slice(0, headCloseIndex) + schemaScript + content.slice(headCloseIndex);

    fs.writeFileSync(filePath, content, "utf8");
    updated++;
    console.log(`Updated ${file}`);
  });

  console.log(`\nDone. Updated ${updated} files, skipped ${skipped} files.`);
}

main();
