#!/data/data/com.termux/files/usr/bin/sh
set -eu
cd "$(dirname "$0")"
echo "Match Studio telefon yerel adresi: http://localhost:8911/index.html"
node tools/serve.cjs 8911
