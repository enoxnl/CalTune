#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"

rm -rf "$dist_root"
mkdir -p "$dist_root/server" "$dist_root/.openai"
commit=$(git -C "$project_root" rev-parse --verify HEAD 2>/dev/null || true)
if [[ "$commit" =~ ^[0-9a-f]{40}$ ]] && [[ -z "$(git -C "$project_root" status --porcelain)" ]]; then
  sed "s/^const BUILD_COMMIT = \"\";/const BUILD_COMMIT = \"$commit\";/" "$project_root/worker/index.js" > "$dist_root/server/index.js"
else
  cp "$project_root/worker/index.js" "$dist_root/server/index.js"
fi
cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"

echo "Built $dist_root"
