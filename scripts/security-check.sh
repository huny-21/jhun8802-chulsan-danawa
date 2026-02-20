#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Checking exposed Google API key patterns..."
if rg -n "AIza[0-9A-Za-z\\-_]{20,}" -S . >/tmp/security_check_keys.txt; then
  echo "FAIL: Potential exposed API key found:"
  cat /tmp/security_check_keys.txt
  exit 1
fi
echo "OK: No exposed API key pattern found."

echo "[2/4] Checking runtime-config is git-ignored..."
if ! rg -n "^public/runtime-config\\.js$" .gitignore >/dev/null; then
  echo "FAIL: public/runtime-config.js is not in .gitignore"
  exit 1
fi
echo "OK: runtime-config.js is git-ignored."

echo "[3/4] Checking placeholder in versioned config..."
if ! rg -n "REPLACE_WITH_NEW_RESTRICTED_KEY" cloudflare-worker/wrangler.toml API_CONFIG_TEMPLATE.md >/dev/null; then
  echo "FAIL: Placeholder missing in versioned config files."
  exit 1
fi
echo "OK: Placeholder exists in versioned config files."

echo "[4/4] Checking runtime-config has active key before enabling auth..."
if rg -n "firebaseEnabled:\\s*true" public/runtime-config.js >/dev/null; then
  if ! rg -n "firebaseApiKey:\\s*\"[^\"]+\"" public/runtime-config.js >/dev/null; then
    echo "FAIL: firebaseEnabled is true but firebaseApiKey is empty."
    exit 1
  fi
fi
echo "OK: runtime-config auth toggle/key check passed."

echo "Security predeploy check passed."
