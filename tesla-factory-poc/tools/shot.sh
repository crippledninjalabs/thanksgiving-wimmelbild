#!/bin/sh
# usage: tools/shot.sh <seconds> <theme> <out.png>  — headless screenshot with the clock frozen
DIR=$(cd "$(dirname "$0")/.." && pwd)
google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=1600,1000 \
  --enable-logging=stderr --v=0 --virtual-time-budget=1500 \
  --screenshot="$3" "file://$DIR/index.html?t=$1&theme=$2" 2>&1 | grep -iE "console|uncaught|error" | grep -v -iE "gpu|dbus|sandbox|viz|shared_image|fontconfig|chrome-extension" || true
