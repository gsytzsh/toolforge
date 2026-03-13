# ToolForge 建议新增工具清单

基于当前 100 个工具与常见工具站（RapidTables、SmallDev.tools、DevUtils 等）对比，按类别列出**建议新增**的工具，便于扩展与 SEO。

---

## 一、Encoders & Decoders

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **Hex Encode / Decode** | 文本 ⇄ 十六进制，开发调试常用 | 高 |
| **ROT13** | ROT13 编码/解码，经典小工具 | 中 |
| **QR Code Decoder** | 上传二维码图片解析出 URL/文本（与现有 Url to QR 配对） | 高 |
| **ASCII to Hex / Hex to ASCII** | 单字节十六进制与字符互转 | 中 |

**已有**：Base64、URL、HTML、Binary、Morse，覆盖较好，优先补 **Hex** 和 **QR Decode**。

---

## 二、JSON & Data

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **JSON Sort Keys** | 按 key 排序格式化 JSON | 中 |
| **YAML Formatter / Validator** | YAML 格式化与校验（现有为 YAML⇄JSON） | 中 |
| **TOML to JSON** | 配置文件格式转换 | 低 |

**已有**：Viewer、Diff、CSV、YAML 转换、Minify、XML 互转、Validator，可优先做 **JSON Sort Keys**。

---

## 三、Text

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **Character / String Length** | 字符数、字节数（UTF-8） | 高 |
| **Extract Emails** | 从文本中提取所有邮箱地址 | 高 |
| **Extract URLs** | 从文本中提取所有链接 | 高 |
| **ROT13** | 若放在 Encoders 则 Text 可不重复 | - |
| **Remove Accents / Normalize** | 去除重音符号、Unicode 规范化 | 中 |
| **Text to Slug** | 与现有 Slug Generator 可能重叠，可合并或做「从长文生成 slug」 | 低 |

**已有**：Word counter、Statistics、Lorem、Slug、Emoji 移除、Markdown、Find-Replace、Sort/Dedup、Reverse、Invert case、Notepad、Line number、Remove line breaks、Number to words、Text diff。建议补 **String length**、**Extract emails**、**Extract URLs**。

---

## 四、Code & Format

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **HTML Formatter / Prettify** | HTML 格式化缩进 | 高 |
| **JavaScript Beautify / Minify** | JS 格式化与压缩 | 高 |
| **JSON to Table** | JSON 转 HTML 表格或 Markdown 表格 | 中 |
| **XML Minify** | 与现有 XML Formatter 配对 | 中 |

**已有**：Regex、SQL、Cron、Unix 权限、ASCII、Binary 计算、CSS Minify、XML Formatter。优先 **HTML Formatter**、**JS Beautify/Minify**。

---

## 五、Hash & Security

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **HMAC Generator** | 按算法 + 密钥生成 HMAC | 中 |
| **Certificate / PEM Decoder** | 解析 PEM 证书显示主体/有效期等 | 中 |
| **Bcrypt Hash / Verify** | 密码哈希校验（需注意实现安全） | 中 |

**已有**：Hash、Password、Strength、JWT。可选 **HMAC**、**PEM Decoder**。

---

## 六、Image & Color

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **Image Resizer** | 按宽高/比例缩放图片 | 高 |
| **Color Palette Generator** | 从单色生成调色板（互补、渐变等） | 中 |
| **PNG / JPEG Compressor** | 与现有 Image Compressor 可合并或细分 | 低 |

**已有**：Compressor、Image⇄Base64、Color picker、Color converter。可补 **Image Resizer**、**Palette Generator**。

---

## 七、Calculators & Converters

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **Area Converter** | 平方米、亩、平方英尺等 | 高 |
| **Volume Converter** | 升、加仑、立方米等 | 高 |
| **Speed Converter** | km/h、m/s、mph、节等 | 高 |
| **Data Transfer / Bitrate** | Mbps、MB/s 等 | 中 |
| **Percentage Increase/Decrease** | 增减百分比计算 | 中 |

**已有**：长度、重量、温度、字节、罗马数字、分数、平均数、BMI、小费、贷款、利息、GPA、GCD/LCM、质数、阶乘、标准差、排列组合、科学计算器、成绩、单利等。RapidTables 类站点常有的 **Area / Volume / Speed** 可优先补。

---

## 八、Generators & Converters

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **Random String Generator** | 指定长度、字符集的随机字符串 | 高 |
| **Lorem Ipsum (Paragraphs)** | 按段落数生成（若现有仅按词可增强） | 中 |
| **Fake Data / Placeholder** | 假姓名、地址、手机号等（前端占位） | 中 |

**已有**：UUID、随机数、百分比、Dice、Coin、Yes/No 等。可补 **Random String**、**Fake Data**。

---

## 九、Network & HTTP

| 建议工具 | 说明 | 常见度 |
|----------|------|--------|
| **Whois Lookup** | 域名 Whois 查询（需后端或第三方 API） | 高 |
| **DNS Lookup** | A/AAAA/TXT 等（同上） | 高 |
| **Request Headers / What is my IP** | 显示当前请求头与 IP（可增强现有 Ip Info） | 中 |
| **JSON from URL** | 输入 URL 拉取并格式化 JSON | 中 |

**已有**：IP、HTTP Status、Header Parser、cURL→Fetch、URL Parser、User-Agent、URL→QR。若有条件可做 **Whois**、**DNS** 或 **JSON from URL**。

---

## 十、优先级汇总（建议实现顺序）

**高优先级（流量与需求都高）**

1. **Hex Encode / Decode**
2. **Character / String Length**
3. **HTML Formatter (Prettify)**
4. **JavaScript Beautify & Minify**
5. **Extract Emails from Text**
6. **Extract URLs from Text**
7. **Image Resizer**
8. **Area Converter**
9. **Volume Converter**
10. **Speed Converter**
11. **Random String Generator**
12. **QR Code Decoder**

**中优先级（补全品类）**

13. ROT13  
14. JSON Sort Keys  
15. HMAC Generator  
16. Color Palette Generator  
17. YAML Formatter/Validator  
18. XML Minify  
19. Percentage Increase/Decrease  
20. JSON from URL（若可调用接口）

**低优先级（差异化）**

21. PEM / Certificate Decoder  
22. Whois / DNS Lookup（需后端或 API）  
23. Fake Data Generator  
24. TOML to JSON  

---

按上述顺序逐步添加，既能补全「工具站该有的」常见项，又利于 SEO 和广告展示量。每加一批后可在 `tools-list.json` 和 sitemap 中同步更新。
