#!/bin/bash
# Standardises videos in public/portfolio/ to a web-friendly H.264 MP4 and
# shrinks anything heavier than the site needs. Web playback wants: H.264
# video (yuv420p for broad browser support), AAC audio, and the moov atom at
# the front (-movflags +faststart) so playback can start before the whole
# file downloads.
#
# Two things trigger a re-encode: a long edge over MAX_DIMENSION, or an
# average bitrate over MAX_BITRATE. CRF keeps quality constant while letting
# the bitrate fall wherever the content allows.
#
# Originals (and any MP4 that gets re-encoded in place) are copied into
# public/portfolio/tobedeleted/, mirroring their original subfolder, for
# review before deletion.
#
# Usage: npm run video

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORTFOLIO_DIR="$SCRIPT_DIR/../public/portfolio"
TOBEDELETED_DIR="$PORTFOLIO_DIR/tobedeleted"

MAX_DIMENSION=1280      # long-edge cap in pixels
MAX_BITRATE=4000000     # 4 Mbps — above this an MP4 is re-encoded
CRF=23                  # H.264 quality (lower = better/bigger; 18-28 typical)
PRESET=slow             # encoder effort (better compression, slower)

if ! command -v ffmpeg &>/dev/null || ! command -v ffprobe &>/dev/null; then
  echo "Error: ffmpeg/ffprobe not found. Install with: brew install ffmpeg"
  exit 1
fi

mkdir -p "$TOBEDELETED_DIR"

sources_found=0
converted=0
mp4_found=0
reencoded=0
failed=0

# Copies $1 into tobedeleted/, preserving its path relative to public/portfolio/.
backup_original() {
  local file="$1"
  local rel="${file#"$PORTFOLIO_DIR"/}"
  local dest="$TOBEDELETED_DIR/$rel"
  mkdir -p "$(dirname "$dest")"
  cp "$file" "$dest"
}

# Prints a "scale=..." filter to stdout and returns 0 if $1's long edge exceeds
# MAX_DIMENSION; returns 1 (prints nothing) otherwise. -2 keeps the other edge
# even, which yuv420p requires.
scale_filter() {
  local file="$1"
  local w h
  w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$file")
  h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$file")
  if [ "$w" -le "$MAX_DIMENSION" ] && [ "$h" -le "$MAX_DIMENSION" ]; then
    return 1
  fi
  if [ "$w" -ge "$h" ]; then
    echo "scale=$MAX_DIMENSION:-2"
  else
    echo "scale=-2:$MAX_DIMENSION"
  fi
}

# Returns 0 if $1's average bitrate exceeds MAX_BITRATE. Falls back to the
# container bitrate when the stream doesn't report its own.
bitrate_too_high() {
  local file="$1"
  local br
  br=$(ffprobe -v error -select_streams v:0 -show_entries stream=bit_rate -of csv=p=0 "$file")
  if [ -z "$br" ] || [ "$br" = "N/A" ]; then
    br=$(ffprobe -v error -show_entries format=bit_rate -of csv=p=0 "$file")
  fi
  [ -n "$br" ] && [ "$br" != "N/A" ] && [ "$br" -gt "$MAX_BITRATE" ]
}

# Re-encodes $src to $dst as web-friendly H.264. Extra args (e.g. a scale
# filter) are passed through after $dst.
encode() {
  local src="$1" dst="$2"
  shift 2
  ffmpeg -y -nostdin -loglevel error -i "$src" \
    -c:v libx264 -crf "$CRF" -preset "$PRESET" -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart \
    "$@" "$dst"
}

# ── Pass 1: convert non-MP4 sources (.mov/.webm/.avi/.m4v) to MP4 ──
while IFS= read -r -d '' file; do
  sources_found=$((sources_found + 1))
  filename="$(basename "$file")"
  output="${file%.*}.mp4"

  args=()
  if SCALE=$(scale_filter "$file"); then
    args=(-vf "$SCALE")
  fi

  printf "Converting: %s\n" "$file"

  if encode "$file" "$output" ${args[@]+"${args[@]}"}; then
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
  \( -iname "*.mov" -o -iname "*.webm" -o -iname "*.avi" -o -iname "*.m4v" -o -iname "*.mkv" \) \
  -print0)

# ── Pass 2: re-encode existing MP4s that are oversized or over-bitrate ──
while IFS= read -r -d '' file; do
  mp4_found=$((mp4_found + 1))

  args=()
  needs=0
  if SCALE=$(scale_filter "$file"); then
    args=(-vf "$SCALE")
    needs=1
  fi
  if bitrate_too_high "$file"; then
    needs=1
  fi
  [ "$needs" -eq 0 ] && continue

  printf "Re-encoding: %s\n" "$file"
  backup_original "$file"
  tmp="${file%.mp4}.tmp.mp4"
  if encode "$file" "$tmp" ${args[@]+"${args[@]}"}; then
    mv "$tmp" "$file"
    reencoded=$((reencoded + 1))
    printf "  -> re-encoded in place (original -> tobedeleted/)\n"
  else
    rm -f "$tmp"
    printf "  x Failed: %s\n" "$(basename "$file")"
    failed=$((failed + 1))
  fi
done < <(find "$PORTFOLIO_DIR" \
  -not -path "*/tobedeleted/*" \
  -iname "*.mp4" \
  -print0)

echo ""
echo "----------------------------------------"
echo "Non-MP4 sources found : $sources_found"
echo "Converted to MP4      : $converted"
echo "Existing MP4 found    : $mp4_found"
echo "Re-encoded            : $reencoded"
[ "$failed" -gt 0 ] && echo "Failed                : $failed"
echo "Originals             : $TOBEDELETED_DIR"
echo "----------------------------------------"
echo "Review the MP4 files, then delete the tobedeleted/ folder when ready."
