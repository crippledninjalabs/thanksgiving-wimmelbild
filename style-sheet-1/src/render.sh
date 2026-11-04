#!/usr/bin/env bash
# render.sh <svg> <png> <width> <height> [viewBox]
# Renders an SVG (optionally cropped to a viewBox) with headless Chrome.
set -euo pipefail
svg="$1"; png="$2"; w="$3"; h="$4"; vb="${5:-}"
tmp=$(mktemp -d)
src="$tmp/in.svg"
if [ -n "$vb" ]; then
  sed -E "0,/<svg /s#<svg [^>]*>#<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"$vb\" width=\"$w\" height=\"$h\">#" "$svg" > "$src"
else
  cp "$svg" "$src"
fi
cat > "$tmp/index.html" <<EOF
<html><body style="margin:0;background:#fff"><img src="in.svg" style="display:block;width:${w}px;height:${h}px"></body></html>
EOF
/usr/bin/google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size="$w,$h" --screenshot="$png" \
  "file://$tmp/index.html" >/dev/null 2>&1
rm -rf "$tmp"
