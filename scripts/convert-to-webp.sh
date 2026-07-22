#!/bin/bash
# Converts images in public/portfolio/ to WebP (quality 85) and downsizes
# anything larger than the site ever displays it. The biggest on-site use is
# the gallery modal (maxes out at 1100px wide), so MAX_DIMENSION doubles
# that for retina displays.
#
# Originals (and any oversized WebP that gets shrunk in place) are copied
# into public/portfolio/tobedeleted/, mirroring their original subfolder,
# for review before deletion.
#
# Usage: npm run webp

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORTFOLIO_DIR="$SCRIPT_DIR/../public/portfolio"
TOBEDELETED_DIR="$PORTFOLIO_DIR/tobedeleted"

MAX_DIMENSION=2200

if ! command -v cwebp &>/dev/null; then
  echo "Error: cwebp not found. Install it with: brew install webp"
  exit 1
fi
if ! command -v sips &>/dev/null; then
  echo "Error: sips not found (this script requires macOS)."
  exit 1
fi

mkdir -p "$TOBEDELETED_DIR"

sources_found=0
converted=0
webp_found=0
resized=0
failed=0

# Copies $1 into tobedeleted/, preserving its path relative to public/portfolio/.
backup_original() {
  local file="$1"
  local rel="${file#"$PORTFOLIO_DIR"/}"
  local dest="$TOBEDELETED_DIR/$rel"
  mkdir -p "$(dirname "$dest")"
  cp "$file" "$dest"
}

# Prints "-resize W 0" or "-resize 0 H" to stdout and returns 0 if $1 exceeds
# MAX_DIMENSION on its long edge; returns 1 (prints nothing) otherwise.
resize_args() {
  local file="$1"
  local w h
  w=$(sips -g pixelWidth "$file" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$file" | awk '/pixelHeight/{print $2}')
  if [ "$w" -le "$MAX_DIMENSION" ] && [ "$h" -le "$MAX_DIMENSION" ]; then
    return 1
  fi
  if [ "$w" -ge "$h" ]; then
    echo "-resize $MAX_DIMENSION 0"
  else
    echo "-resize 0 $MAX_DIMENSION"
  fi
}

# ── Pass 1: convert PNG/JPEG/TIFF sources to WebP, resizing if oversized ──
while IFS= read -r -d '' file; do
  sources_found=$((sources_found + 1))
  filename="$(basename "$file")"
  output="${file%.*}.webp"

  args=()
  if RESIZE=$(resize_args "$file"); then
    args=($RESIZE)
    resized=$((resized + 1))
  fi

  printf "Converting: %s\n" "$file"

  if cwebp -q 85 -mt ${args[@]+"${args[@]}"} "$file" -o "$output" 2>/dev/null; then
    backup_original "$file"
    rm "$file"
    converted=$((converted + 1))
    printf "  -> %s (original -> tobedeleted/)\n" "$(basename "$output")"
  else
    printf "  x Failed: %s\n" "$filename"
    failed=$((failed + 1))
  fi
done < <(find "$PORTFOLIO_DIR" \
  -not -path "*/tobedeleted/*" \
  \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.tiff" -o -iname "*.tif" \) \
  -print0)

# ── Pass 2: downsize any existing WebP that exceeds the site's max display size ──
while IFS= read -r -d '' file; do
  webp_found=$((webp_found + 1))

  if ! RESIZE=$(resize_args "$file"); then
    continue
  fi

  printf "Downsizing: %s\n" "$file"
  backup_original "$file"
  tmp="${file}.tmp.webp"
  if cwebp -q 85 -mt $RESIZE "$file" -o "$tmp" 2>/dev/null; then
    mv "$tmp" "$file"
    resized=$((resized + 1))
    printf "  -> resized in place (original -> tobedeleted/)\n"
  else
    rm -f "$tmp"
    printf "  x Failed: %s\n" "$(basename "$file")"
    failed=$((failed + 1))
  fi
done < <(find "$PORTFOLIO_DIR" \
  -not -path "*/tobedeleted/*" \
  -iname "*.webp" \
  -print0)

echo ""
echo "----------------------------------------"
echo "PNG/JPEG/TIFF found : $sources_found"
echo "Converted to WebP   : $converted"
echo "Existing WebP found : $webp_found"
echo "Resized (any format): $resized"
[ "$failed" -gt 0 ] && echo "Failed              : $failed"
echo "Originals           : $TOBEDELETED_DIR"
echo "----------------------------------------"
echo "Review the WebP files, then delete the tobedeleted/ folder when ready."
