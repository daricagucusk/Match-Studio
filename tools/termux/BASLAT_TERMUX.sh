#!/data/data/com.termux/files/usr/bin/sh
set -eu
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/tools/serve.cjs" ]; then
  cd "$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../../tools/serve.cjs" ]; then
  cd "$SCRIPT_DIR/../.."
else
  echo "Match Studio sunucusu bulunamadı. PWA ZIP'ini tam olarak çıkarın." >&2
  exit 1
fi
echo "Match Studio telefon yerel adresi: http://localhost:8911/index.html"
node tools/serve.cjs 8911
