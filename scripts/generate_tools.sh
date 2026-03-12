#!/bin/bash

TOOLS_DIR="/data/toolforge/tools"

declare -A tools

tools=(
	["timestamp-converter"]="Timestamp Converter"
	["url-encode"]="URL Encode"
	["url-decode"]="URL Decode"
	["text-reverser"]="Text Reverser"
	["character-counter"]="Character Counter"
	["random-number"]="Random Number Generator"
	["password-generator"]="Password Generator"
	["case-converter"]="Case Converter"
	["lorem-generator"]="Lorem Ipsum Generator"
	["slug-generator"]="Slug Generator"
)

for file in "${!tools[@]}"; do

	title=${tools[$file]}

	cat > ${TOOLS_DIR}/${file}.html <<EOF
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title} - ToolForge</title>
<link rel="stylesheet" href="/css/style.css">
</head>

<body>

<div class="container">

<h1>${title}</h1>

<p>Free online ${title}</p>

<textarea id="input" rows="8" style="width:90%"></textarea>

<br><br>

<button onclick="runTool()">Run</button>

<h3>Result</h3>

<textarea id="output" rows="8" style="width:90%"></textarea>

</div>

<script>

function runTool(){
	document.getElementById("output").value =
	document.getElementById("input").value
}

</script>

</body>
</html>

EOF

echo "Created ${file}.html"

done
