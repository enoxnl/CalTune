#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"

rm -rf "$dist_root"
mkdir -p "$dist_root/server" "$dist_root/.openai"
commit=$(git -C "$project_root" rev-parse --verify HEAD 2>/dev/null || true)
{
  for asset in logo icon; do
    printf 'const %sPng = "' "$asset"
    base64 -w0 "$project_root/worker/assets/$asset.png"
    printf '";\n'
  done
  printf '%s\n' 'const ICAL = (() => {'
  sed 's/^export { ICALmodule as default };$/return ICALmodule;/' "$project_root/worker/vendor/ical-2.2.1.js"
  printf '%s\n' '})();'
  if [[ "$commit" =~ ^[0-9a-f]{40}$ ]] && [[ -z "$(git -C "$project_root" status --porcelain)" ]]; then
    sed "s/^const BUILD_COMMIT = \"\";/const BUILD_COMMIT = \"$commit\";/" "$project_root/worker/index.js"
  else
    cat "$project_root/worker/index.js"
  fi
} > "$dist_root/server/index.js"
if [[ -f "$project_root/.openai/hosting.json" ]]; then
  cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"
fi

echo "Built $dist_root"
