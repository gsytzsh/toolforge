(function(){
  "use strict";

  let allTools = [];

  const KEY_NAV_CATEGORIES = [
    "JSON & API",
    "Encoding & Decoding",
    "Text Tools",
    "Developer Tools",
    "PDF & Export",
    "Date & Time",
    "Web & Network"
  ];

  const CATEGORY_ORDER = [
    "JSON & API",
    "Encoding & Decoding",
    "Text Tools",
    "Images & Colors",
    "PDF & Export",
    "Date & Time",
    "Productivity",
    "Calculators",
    "Generators",
    "Unit Converters",
    "Security & Tokens",
    "Web & Network",
    "SEO Tools",
    "Developer Tools"
  ];

  const CATEGORY_DESCRIPTIONS = {
    "JSON & API": "Open, format, validate and convert JSON, CSV, XML and YAML. Build and test API requests, inspect payloads and work with structured data.",
    "Encoding & Decoding": "Encode and decode Base64, URL, binary, hex and QR data for web, API and text-processing tasks.",
    "Text Tools": "Edit, clean, compare and transform text for writing, SEO, content cleanup and everyday copy work.",
    "Images & Colors": "Resize, compress and convert images, extract Base64 and use color tools for design and frontend work.",
    "PDF & Export": "Create browser-based PDFs from notes, tables, code, screenshots and uploaded files without extra software.",
    "Date & Time": "Convert timestamps, compare dates and work with calendars, week numbers, timers and time zones.",
    "Productivity": "Manage notes, checklists and small everyday tasks with lightweight tools that open instantly in the browser.",
    "Calculators": "Use focused calculators for percentages, loans, grades, statistics, health and other common number problems.",
    "Generators": "Generate random values like UUIDs, passwords, numbers and test data in a few clicks.",
    "Unit Converters": "Convert everyday units including length, weight, temperature, area, volume, speed and data size.",
    "Security & Tokens": "Generate passwords, inspect tokens, hash text and handle common browser-based security helper tasks.",
    "Web & Network": "Inspect URLs, IPs, headers, status codes and client details for web, hosting and network troubleshooting.",
    "SEO Tools": "Generate schema, meta tags, robots rules and other SEO utilities for site optimization.",
    "Developer Tools": "Format code, test regex, build SQL queries and other developer workflows for coding and debugging."
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
      const catSlug = slugify(cat);
      section.innerHTML = "<h2 class=\"category-title\"><a href=\"/category/" + catSlug + ".html\">" + cat + "</a></h2>" + description;

      const grid = document.createElement("div");
      grid.className = "tool-grid";

      sortedTools.forEach(function(tool) {
        const card = document.createElement("a");
        card.href = "/tools/" + tool.file + ".html";
        card.className = "tool-card";
        card.textContent = tool.name;
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

  function renderFavorites() {
    const section = document.getElementById("favorites-section");
    const grid = document.getElementById("favorites-grid");
    if (!section || !grid) return;
    var favs = window.ToolFavorites ? window.ToolFavorites.get() : [];
    if (favs.length === 0) {
      section.style.display = "none";
      return;
    }
    var map = {};
    allTools.forEach(function(t) { map[t.file] = t; });
    var tools = favs.map(function(f) { return map[f]; }).filter(Boolean);
    section.style.display = "block";
    grid.innerHTML = "";
    tools.forEach(function(tool) {
      const a = document.createElement("a");
      a.href = "/tools/" + tool.file + ".html";
      a.className = "tool-link-plain";
      a.textContent = tool.name;
      grid.appendChild(a);
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

  function initMobileNav() {
    const toggle = document.getElementById("top-nav-toggle");
    const menu = document.getElementById("top-nav-menu");
    const header = document.querySelector(".top-nav");
    if (!toggle || !menu || !header) return;
    toggle.addEventListener("click", function() {
      const open = header.classList.toggle("top-nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll(".top-nav-trigger").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        if (window.innerWidth > 768) return;
        e.preventDefault();
        const item = btn.closest(".top-nav-item");
        item.classList.toggle("top-nav-item-open");
      });
    });
    menu.addEventListener("click", function(e) {
      if (e.target.tagName === "A") header.classList.remove("top-nav-open");
    });
  }

  fetch("/tools-list.json")
    .then(function(r) { return r.json(); })
    .then(function(data) {
      allTools = data;
      var grouped = groupByCategory(allTools);
      renderTopNav(grouped);
      initMobileNav();
      render(allTools);
      renderFavorites();
      var popular = allTools.filter(function(t) { return t.popular; });
      popular.sort(function(a, b) { return (a.popularOrder || 0) - (b.popularOrder || 0); });
      renderPopularTools(popular);
      scrollToHash();
    });

  window.addEventListener("hashchange", scrollToHash);
  window.addEventListener("storage", function(e) {
    if (e.key === "toolforge_favorites") renderFavorites();
  });
})();
