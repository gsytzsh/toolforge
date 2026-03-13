(function(){
  "use strict";

  let allTools = [];

  const CATEGORY_ORDER = [
    "Encoders & Decoders",
    "JSON & Data",
    "Hash & Security",
    "Image & Color",
    "Text",
    "Date & Time",
    "Network & HTTP",
    "Code & Format",
    "Generators & Converters",
    "Calculators"
  ];

  function groupByCategory(list) {
    const groups = {};
    list.forEach(function(tool) {
      const cat = tool.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    });
    return groups;
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

      const section = document.createElement("section");
      section.className = "tool-section";
      section.innerHTML = "<h2 class=\"category-title\">" + cat + "</h2>";

      const grid = document.createElement("div");
      grid.className = "tool-grid";

      tools.forEach(function(tool) {
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
