#!/bin/bash

ROOT="/data/toolforge"
TOOLS="$ROOT/tools"

echo "===== ToolForge build start ====="

############################
# 1 更新 meta description
############################

echo "Updating meta description..."

for file in $TOOLS/*.html
do

name=$(basename "$file" .html)
title=$(echo $name | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
desc="$title free online tool"

sed -i "s|<meta name=\"description\" content=\".*\">|<meta name=\"description\" content=\"$desc\">|g" "$file"

done


############################
# 2 生成 tools-list.json
############################

echo "Generating tools-list.json..."

echo "[" > $ROOT/tools-list.json

first=true

for file in $TOOLS/*.html
do

name=$(basename "$file" .html)
title=$(echo $name | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

if [ "$first" = true ]; then
first=false
else
echo "," >> $ROOT/tools-list.json
fi

echo -n "{\"file\":\"$name\",\"name\":\"$title\"}" >> $ROOT/tools-list.json

done

echo "]" >> $ROOT/tools-list.json


############################
# 3 生成 sitemap.xml
############################

echo "Generating sitemap..."

echo '<?xml version="1.0" encoding="UTF-8"?>' > $ROOT/sitemap.xml
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> $ROOT/sitemap.xml

echo '<url>' >> $ROOT/sitemap.xml
echo '<loc>https://toolforge.site/</loc>' >> $ROOT/sitemap.xml
echo '<priority>1.0</priority>' >> $ROOT/sitemap.xml
echo '</url>' >> $ROOT/sitemap.xml

for file in $TOOLS/*.html
do

name=$(basename "$file")

echo '<url>' >> $ROOT/sitemap.xml
echo "<loc>https://toolforge.site/tools/$name</loc>" >> $ROOT/sitemap.xml
echo '</url>' >> $ROOT/sitemap.xml

done

echo '</urlset>' >> $ROOT/sitemap.xml


echo "===== Build complete ====="
