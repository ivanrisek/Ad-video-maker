#!/usr/bin/env bash
# Splice a re-captured opening (hero typing → services → glide) onto the main capture at the
# projects-heading landing (main frame 447), with a 3-frame crossfade hidden by the crash stop.
# usage: scripts/splice-walk.sh <hero frames dir> <main frames dir> <out mp4>
set -euo pipefail
HERO=$1; MAIN=$2; OUT=$3
N=$(ls "$HERO" | wc -l)
TMP=$(mktemp -d)
ffmpeg -v error -y -framerate 30 -i "$HERO/%05d.jpg" -c:v libx264 -crf 14 -pix_fmt yuv420p "$TMP/a.mp4"
ffmpeg -v error -y -framerate 30 -start_number 447 -i "$MAIN/%05d.jpg" -c:v libx264 -crf 14 -pix_fmt yuv420p "$TMP/b.mp4"
OFF=$(python3 -c "print(($N-3)/30)")
ffmpeg -v error -y -i "$TMP/a.mp4" -i "$TMP/b.mp4" -filter_complex "[0][1]xfade=transition=fade:duration=0.1:offset=$OFF,format=yuv420p" -c:v libx264 -crf 16 -preset slow -movflags +faststart "$OUT"
rm -rf "$TMP"
