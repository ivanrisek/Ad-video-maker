#!/usr/bin/env bash
# Instagram feed version (4:5, 1080×1350) of the walkthrough: the film scaled to 1080×608 on the IgFrame still.
# Usage: scripts/instagram.sh  (run after rendering the IgFrame still to out/ig-frame.png)
set -euo pipefail
cd "$(dirname "$0")/.."
for v in "" "-nobgm"; do
  ffmpeg -v error -y -loop 1 -i out/ig-frame.png -i "out/cnc-quote-walkthrough$v.mp4" \
    -filter_complex "[1:v]scale=1080:608:flags=lanczos[v];[0:v][v]overlay=0:371:shortest=1,format=yuv420p[o]" \
    -map "[o]" -map 1:a -c:v libx264 -preset slow -crf 18 -profile:v high -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart \
    "out/cnc-quote-walkthrough-instagram$v.mp4"
done
