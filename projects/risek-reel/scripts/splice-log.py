# Merge capture logs for the spliced walk: hero log (re-captured opening) + main log from the
# projects-heading hold onward, shifted to the spliced timeline. Prints walk.json.
# usage: python3 scripts/splice-log.py <hero log.json> <main log.json> <hero frame count>
import json, sys
hero = json.load(open(sys.argv[1])); main = json.load(open(sys.argv[2])); n = int(sys.argv[3])
SPLICE, XF = 447, 3
shift = n - XF - SPLICE
rest = [dict(s, frame=s["frame"] + shift) for s in main if s["frame"] >= SPLICE]
last = rest[-1]
end = last["frame"] + (last.get("hold") or last.get("dur") or 0) + (last.get("pre", 0) + last.get("post", 0) if "tap" in last else 0)
print(json.dumps({"frames": end, "segments": hero + rest}, indent=1, ensure_ascii=False))
