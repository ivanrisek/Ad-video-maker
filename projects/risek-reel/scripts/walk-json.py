# Usage: python3 scripts/walk-json.py <capture log.json> <frame count> > src/walk.json
import json, sys
log = json.load(open(sys.argv[1]))
print(json.dumps({"frames": int(sys.argv[2]), "segments": log}, indent=1))
