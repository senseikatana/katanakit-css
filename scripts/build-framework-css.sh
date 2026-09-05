#!/usr/bin/env bash
# ============================================================
#  scripts/build-framework-css.sh
#  Pre-compiles the katanakit-css framework (without reset) to
#  a static CSS file that Astro/Starlight serves as a <link>.
#  This avoids Sass resolving paths outside the site root.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT="$ROOT/site/public/framework.css"

mkdir -p "$(dirname "$OUT")"

# Compile main.scss (full framework) without source map.
# The reset is included so the framework classes work standalone.
npx sass "$ROOT/src/scss/main.scss" "$OUT" --no-source-map --style=compressed

SIZE=$(wc -c < "$OUT")
echo "✓ framework.css → $OUT ($SIZE bytes)"
