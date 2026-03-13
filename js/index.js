(function(){
  "use strict";

  let allTools = [];

  const CATEGORY_ORDER = [
    "JSON & Data",
    "Encoding & Decoding",
    "Text",
    "Images & Colors",
    "PDF & Export",
    "Date & Time",
    "Time & Planning",
    "Daily Productivity",
    "Money & Decisions",
    "Generators & Converters",
    "Calculators",
    "Security & Tokens",
    "Web & Network",
    "API & Data",
    "Code & Formatting",
    "Debug & Testing",
    "Database",
    "Schedules & Infra",
    "SEO & Webmaster"
  ];

  const CATEGORY_DESCRIPTIONS = {
    "JSON & Data": "Format, validate, convert and inspect JSON, CSV, XML and related data formats.",
    "Encoding & Decoding": "Encode, decode and transform Base64, URL, binary, hex, QR and other text formats.",
    "Text": "Clean up, count, compare and transform text for writing, content work and daily editing.",
    "Images & Colors": "Resize, compress and convert images, then work with colors and image-related utilities.",
    "PDF & Export": "Turn text, code, notes, tables and files into browser-generated PDF documents.",
    "Date & Time": "Convert timestamps, compare dates and work with calendars, timers and time zones.",
    "Time & Planning": "Plan schedules, compare meeting times and manage focus or daily time blocks.",
    "Daily Productivity": "Organize notes, lists and simple workflows to get everyday tasks done faster.",
    "Money & Decisions": "Compare prices, split bills and calculate common money-related everyday decisions.",
    "Generators & Converters": "Generate values and convert units, numbers and formats used in daily work.",
    "Calculators": "Solve common math, finance, school and number problems with focused calculators.",
    "Security & Tokens": "Generate passwords, inspect JWTs, hash values and handle security-related tasks.",
    "Web & Network": "Inspect URLs, HTTP headers, status codes, user agents and other web request details.",
    "API & Data": "Work with APIs, requests, schemas, payloads and developer-facing data inspection tools.",
    "Code & Formatting": "Format code and structured text so it is easier to read, copy and debug.",
    "Debug & Testing": "Test regex, diffs and rewrite rules to debug code and verify expected behavior.",
    "Database": "Build SQL queries and database-related snippets for quick drafting and testing.",
    "Schedules & Infra": "Create cron schedules and other infrastructure-oriented helper outputs.",
    "SEO & Webmaster": "Generate metadata, schema, robots rules and other technical SEO helper outputs."
  };

  function groupByCategory(list) {
    const groups = {};
    list.forEach(function(tool) {
      const cat = tool.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    });
    return groups;
  }

  function sortTools(tools) {
    return tools.slice().sort(function(a, b) {
      const aPopular = typeof a.popularOrder === "number" ? a.popularOrder : Number.POSITIVE_INFINITY;
      const bPopular = typeof b.popularOrder === "number" ? b.popularOrder : Number.POSITIVE_INFINITY;
      if (aPopular !== bPopular) return aPopular - bPopular;
      return a.name.localeCompare(b.name);
    });
  }

  function render(list) {
    const container = document.getElementById("tool-list");
    container.innerHTML = "";

    if (list.length === 0) {
      container.innerHTML = '<p class="no-results">No tools match your search.</p>';
      return;
    }

    const grouped = groupByCategory(list);
    const order = CATEGORY_ORDER.concat(
      Object.keys(grouped).filter(function(c) { return CATEGORY_ORDER.indexOf(c) === -1; })
    );

    order.forEach(function(cat) {
      const tools = grouped[cat];
      if (!tools || tools.length === 0) return;
      const sortedTools = sortTools(tools);

      const section = document.createElement("section");
      section.className = "tool-section";
      const description = CATEGORY_DESCRIPTIONS[cat]
        ? "<p class=\"category-description\">" + CATEGORY_DESCRIPTIONS[cat] + "</p>"
        : "";
      section.innerHTML = "<h2 class=\"category-title\">" + cat + "</h2>" + description;

      const grid = document.createElement("div");
      grid.className = "tool-grid";

      sortedTools.forEach(function(tool) {
        const card = document.createElement("a");
        card.href = "/tools/" + tool.file + ".html";
        card.className = "tool-card";
        card.innerHTML = "<div class=\"tool-title\">" + tool.name + "</div>";
        grid.appendChild(card);
      });

      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  function renderPopularTools(tools) {
    const el = document.getElementById("popular-tools-row");
    if (!el) return;
    el.innerHTML = "";
    tools.forEach(function(tool) {
      const a = document.createElement("a");
      a.href = "/tools/" + tool.file + ".html";
      a.className = "popular-tool-tag";
      a.textContent = tool.tag || tool.name;
      el.appendChild(a);
    });
  }

  function searchTools() {
    const keyword = document.getElementById("search").value.toLowerCase().trim();
    const filtered = keyword
      ? allTools.filter(function(t) { return t.name.toLowerCase().indexOf(keyword) !== -1; })
      : allTools;
    render(filtered);
  }

  window.searchTools = searchTools;

  fetch("/tools-list.json")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      allTools = data;
      render(allTools);
      var popular = allTools.filter(function(t) { return t.popular; });
      popular.sort(function(a, b) { return (a.popularOrder || 0) - (b.popularOrder || 0); });
      renderPopularTools(popular);
    });
})();
