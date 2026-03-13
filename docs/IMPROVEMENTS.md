# ToolForge 代码结构改进建议

基于当前代码结构整理的改进点，按优先级和投入产出比排序，可按需采纳。

---

## 1. 首页：脚本外置，减少内联

**现状**：`index.html` 内约 90 行内联脚本（fetch、render、search），不利于复用和缓存。

**建议**：
- 将首页逻辑抽到 `js/index.js`（或 `js/home.js`），在 `index.html` 底部用 `<script src="/js/index.js"></script>` 引入。
- 好处：浏览器可缓存 JS、代码可读性更好、后续可做压缩或合并。

---

## 2. 首页：Popular Tools 数据驱动

**现状**：Popular Tools 的 6 个链接在 `index.html` 里写死，增删改都要改 HTML。

**建议**：
- 在 `tools-list.json` 中为需要展示的工具有选择地增加字段，例如 `"popular": true` 或 `"featured": true`。
- 或在项目根目录增加小型配置（如 `config.json`）维护一个 `popularToolIds: ["uuid-generator", "json-viewer", ...]`。
- 首页通过同一份 `tools-list.json`（或 config）动态渲染 Popular Tools 区域，与工具列表保持一致数据源。

这样新增/下线工具或调整“热门”列表时只改数据，不用改 HTML。

---

## 3. 首页：合并 render 中的重复逻辑

**现状**：`render()` 里先按 `CATEGORY_ORDER` 遍历一遍，再对“剩余分类”遍历一遍，两段逻辑几乎相同。

**建议**：
- 先得到 `grouped`，再构造“最终顺序”：`const order = [...CATEGORY_ORDER, ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c))]`。
- 然后只用一个 `order.forEach(cat => { ... })` 渲染，避免重复的 section/grid/card 创建代码。

---

## 4. 工具页：统一头部/尾部与 SEO 片段

**现状**：每个 `tools/*.html` 都重复完整 HTML 骨架、`<link rel="stylesheet" href="/css/style.css">`、Back to ToolForge 链接等，部分页面缺少 `<meta name="viewport">`。

**建议**：
- **短期**：在项目里放一份“工具页模板”文档或注释块，列出必须包含的片段（charset、viewport、title、description、样式、Back 链接），新工具复制该模板，减少遗漏。
- **中期**（若愿意引入轻量构建）：用一次性的 HTML 模板（如 Node 脚本 + 简单替换）根据 `tools-list.json` 生成各工具页的头部/尾部，工具本身只保留中间“内容+脚本”片段，便于统一加 viewport、结构化数据等。

不强制上框架，用脚本做一次性生成即可。

---

## 5. 清理未使用的 js/tools.js

**现状**：`js/tools.js` 中有 `base64Encode`、`caseConvert`、`uuidGenerate` 等，但各工具页（如 `uuid-generator.html`、`base64-encode.html`）均为内联脚本，未引用 `tools.js`。当前仅 `tools/url-to-qr.html` 引用了 `/js/qrcode.min.js`。

**建议**：
- 若确认无其他地方引用：删除 `js/tools.js`，或把其中仍有用的函数迁移到对应工具页内联中，避免“死代码”混淆。
- 若计划让多个工具共用逻辑：再考虑保留并让相关工具页显式引用该文件。

---

## 6. CSS 结构（可选）

**现状**：所有样式在 `css/style.css` 单文件中，已按功能块注释或分区时问题不大。

**建议**：
- 若文件继续变长，可拆成例如：`base.css`（body、container、字体）、`home.css`（搜索、Popular、about）、`tools.css`（tool-card、tool-section）。首页和工具页按需引入。
- 若当前单文件仍可接受，可暂不拆，只保持顺序一致（如：基础 → 首页 → 工具列表 → 工具页）。

---

## 7. 构建脚本统一

**现状**：存在 `build.sh` 与 `scripts/generate-sitemap.js`。`build.sh` 会按目录下的 HTML 重新生成 `tools-list.json`（无 category）并覆盖，且 sitemap 格式与 `generate-sitemap.js` 生成的不完全一致（如 lastmod、changefreq）。

**建议**：
- 以 `tools-list.json` 为唯一数据源，sitemap 只由 `node scripts/generate-sitemap.js` 生成，不在 `build.sh` 里再写一套 sitemap 逻辑。
- `build.sh` 若仍需要，只做：环境检查、调用 `generate-sitemap.js`、或部署前复制/压缩等，避免覆盖手写的 `tools-list.json`；若不需要，可删除或标记为废弃，并在 README 中说明推荐用法（例如：改完 `tools-list.json` 后运行 `node scripts/generate-sitemap.js`）。

---

## 8. 工具页内联样式收敛

**现状**：部分工具（如 `json-viewer.html`）在页面内带较大 `<style>` 块，其它工具多为共用 `style.css`。

**建议**：
- 工具专属的样式（如 JSON 高亮、代码块背景）可集中放到 `css/tools-extra.css`，只在需要的工具页引入，减少各 HTML 内的重复样式。
- 或保留在对应工具页内，但尽量只保留“该工具独有”的规则，通用部分放在 `style.css`。

---

## 小结

| 项 | 建议 | 收益 |
|----|------|------|
| 1 | 首页 JS 外置到 `js/index.js` | 可维护性、缓存 |
| 2 | Popular Tools 由数据驱动 | 配置化、少改 HTML |
| 3 | 合并 render 双循环 | 代码更短、少重复 |
| 4 | 工具页模板/生成 | 统一 SEO、viewport |
| 5 | 清理或迁移 `js/tools.js` | 避免死代码 |
| 6 | 按需拆分 CSS | 大项目时更清晰 |
| 7 | 统一 sitemap 与 build | 行为可预期 |
| 8 | 工具页样式收敛 | 样式更易维护 |

建议优先做 **1、2、3、5、7**，改动小、收益明确；4、6、8 可在工具数量或样式再增多时再做。
