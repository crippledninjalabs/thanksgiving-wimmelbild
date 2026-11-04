#!/usr/bin/env bash
# Build sheet.svg and render sheet.png + zoom crops (2x) with headless Chrome.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd); root="$here/.."
python3 "$here/build.py"
mkdir -p "$root/crops"
"$here/render.sh" "$root/sheet.svg" "$root/sheet.png" 3840 2600
python3 - "$here/crops.json" <<'PY' | while read -r name vb w h; do "$here/render.sh" "$root/sheet.svg" "$root/crops/$name.png" "$w" "$h" "$vb"; echo "crop $name ${w}x${h}"; done
import json,sys
for k,v in json.load(open(sys.argv[1])).items():
    x,y,w,h=map(float,v.split()); s=2.0
    print(k, ','.join(v.split()), int(w*s), int(h*s))
PY
