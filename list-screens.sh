#!/usr/bin/env bash

# Resolve script path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/contents/code/list-screens.js" ]; then
    script="$SCRIPT_DIR/contents/code/list-screens.js"
elif [ -f "$HOME/.local/share/kwin/scripts/virtual-desktops-only-on-primary/contents/code/list-screens.js" ]; then
    script="$HOME/.local/share/kwin/scripts/virtual-desktops-only-on-primary/contents/code/list-screens.js"
else
    echo "Error: list-screens.js not found."
    exit 1
fi

if command -v qdbus &>/dev/null; then
    QDBUS="qdbus"
elif command -v qdbus-qt5 &>/dev/null; then
    QDBUS="qdbus-qt5"
else
    echo "Error: qdbus not found. Please install qdbus."
    exit 1
fi

num=$($QDBUS org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript "$script")

if [ -z "$num" ]; then
    echo "Failed to load script into KWin."
    exit 1
fi

# In Plasma 5.27, scripts are registered at /<num> instead of /Scripting/Script<num>
$QDBUS org.kde.KWin "/$num" org.kde.kwin.Script.run

# Allow a moment for log output to reach journald
sleep 0.2

journalctl --user _COMM=kwin_x11 -n 12 --no-pager

$QDBUS org.kde.KWin "/$num" org.kde.kwin.Script.stop
