#!/usr/bin/env bash
# Rebuild scene.svg, preview.png (2400 wide) and zoom crops via headless Chrome.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd); root="$here/.."; r="$here/../../style-sheet-1/src/render.sh"
python3 "$here/build.py"
mkdir -p "$root/crops"
"$r" "$root/scene.svg" "$root/preview.png" 2400 1350
"$r" "$root/scene.svg" "$root/crops/rocket.png" 1200 1800 "5500,200,1800,2700"
"$r" "$root/scene.svg" "$root/crops/garage.png" 1600 1000 "2670,3380,1000,625"
"$r" "$root/scene.svg" "$root/crops/elon.png" 1600 1000 "3780,900,1230,769"
