(function(){
  "use strict";

  let allTools = [];

  const KEY_NAV_CATEGORIES = [
    "JSON & Data",
    "Encoding & Decoding",
    "Text",
    "PDF & Export",
    "Date & Time",
    "Security & Tokens",
    "Code & Formatting"
  ];

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
    "JSON & Data": "Open, format, validate and convert JSON, CSV, XML and YAML for APIs, logs and structured data work.",
    "Encoding & Decoding": "Encode and decode Base64, URL, binary, hex and QR data for web, API and text-processing tasks.",
    "Text": "Edit, clean, compare and transform text for writing, SEO, content cleanup and everyday copy work.",
    "Images & Colors": "Resize, compress and convert images, extract Base64 and use color tools for design and frontend work.",
    "PDF & Export": "Create browser-based PDFs from notes, tables, code, screenshots and uploaded files without extra software.",
    "Date & Time": "Convert timestamps, compare dates and work with calendars, week numbers, timers and time zones.",
    "Time & Planning": "Plan meetings, focus sessions, countdowns and work schedules with simple time-planning tools.",
    "Daily Productivity": "Manage notes, checklists and small everyday tasks with lightweight tools that open instantly in the browser.",
    "Money & Decisions": "Split bills, compare prices and handle quick money, shopping and decision-making calculations.",
    "Generators & Converters": "Generate random values and convert everyday units, numbers and formats in a few clicks.",
    "Calculators": "Use focused calculators for percentages, loans, grades, statistics and other common number problems.",
    "Security & Tokens": "Generate passwords, inspect tokens, hash text and handle common browser-based security helper tasks.",
    "Web & Network": "Inspect URLs, IPs, headers, status codes and client details for web, hosting and network troubleshooting.",
    "API & Data": "Build requests, inspect payloads, test paths and work faster with API and structured-data helper tools.",
    "Code & Formatting": "Format code, minify snippets and clean structured text so it is easier to read, share and debug.",
    "Debug & Testing": "Test regex, diffs, rewrites and other developer workflows before you apply changes in real projects.",
    "Database": "Build SQL queries, WHERE clauses and other database helpers for faster drafting and testing.",
    "Schedules & Infra": "Create cron schedules and other small infrastructure helpers for automation and operations work.",
    "SEO & Webmaster": "Generate schema, meta tags, robots rules and other SEO and webmaster utilities for site optimization."
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

  function slugify(str) {
    return String(str).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
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
      section.id = "cat-" + slugify(cat);
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

  function renderTopNav(groups) {
    const menu = document.getElementById("top-nav-menu");
    if (!menu) return;
    const otherCats = CATEGORY_ORDER.concat(
      Object.keys(groups).filter(function(c) { return CATEGORY_ORDER.indexOf(c) === -1; })
    ).filter(function(c) { return KEY_NAV_CATEGORIES.indexOf(c) === -1; })
     .filter(function(c) { return groups[c] && groups[c].length > 0; });

    menu.innerHTML = "";

    KEY_NAV_CATEGORIES.forEach(function(cat) {
      const tools = groups[cat];
      if (!tools || tools.length === 0) return;
      const sortedTools = sortTools(tools);
      const item = document.createElement("div");
      item.className = "top-nav-item";
      const trigger = document.createElement("button");
      trigger.className = "top-nav-trigger";
      trigger.type = "button";
      trigger.textContent = cat + " ▾";
      trigger.setAttribute("aria-haspopup", "true");
      trigger.setAttribute("aria-expanded", "false");
      const dropdown = document.createElement("div");
      dropdown.className = "top-nav-dropdown";
      dropdown.setAttribute("role", "menu");
      sortedTools.forEach(function(tool) {
        const a = document.createElement("a");
        a.href = "/tools/" + tool.file + ".html";
        a.textContent = tool.name;
        a.setAttribute("role", "menuitem");
        dropdown.appendChild(a);
      });
      item.appendChild(trigger);
      item.appendChild(dropdown);
      menu.appendChild(item);
    });

    if (otherCats.length > 0) {
      const item = document.createElement("div");
      item.className = "top-nav-item";
      const trigger = document.createElement("button");
      trigger.className = "top-nav-trigger";
      trigger.type = "button";
      trigger.textContent = "Other ▾";
      trigger.setAttribute("aria-haspopup", "true");
      trigger.setAttribute("aria-expanded", "false");
      const dropdown = document.createElement("div");
      dropdown.className = "top-nav-dropdown top-nav-dropdown-other";
      dropdown.setAttribute("role", "menu");
      otherCats.forEach(function(cat) {
        const tools = groups[cat];
        if (!tools || tools.length === 0) return;
        const sortedTools = sortTools(tools);
        const group = document.createElement("div");
        group.className = "top-nav-dropdown-group";
        const groupTitle = document.createElement("div");
        groupTitle.className = "top-nav-dropdown-group-title";
        groupTitle.textContent = cat;
        group.appendChild(groupTitle);
        sortedTools.forEach(function(tool) {
          const a = document.createElement("a");
          a.href = "/tools/" + tool.file + ".html";
          a.textContent = tool.name;
          a.setAttribute("role", "menuitem");
          group.appendChild(a);
        });
        dropdown.appendChild(group);
      });
      item.appendChild(trigger);
      item.appendChild(dropdown);
      menu.appendChild(item);
    }
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

  function scrollToHash() {
    var hash = location.hash;
    if (hash && hash.indexOf("cat-") === 1) {
      var el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  fetch("/tools-list.json")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      allTools = data;
      var grouped = groupByCategory(allTools);
      renderTopNav(grouped);
      render(allTools);
      var popular = allTools.filter(function(t) { return t.popular; });
      popular.sort(function(a, b) { return (a.popularOrder || 0) - (b.popularOrder || 0); });
      renderPopularTools(popular);
      scrollToHash();
    });

  window.addEventListener("hashchange", scrollToHash);
})();
