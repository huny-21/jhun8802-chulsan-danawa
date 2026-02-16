#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required."
  exit 1
fi

if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase CLI is required."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Deploy must run from main branch. Current: $CURRENT_BRANCH"
  exit 1
fi

DEPLOY_NOTE="${1:-auto deploy}"
UTC_STAMP="$(date -u +'%Y-%m-%d %H:%M:%SZ')"
TAG_STAMP="$(date -u +'%Y%m%d-%H%M%S')"
DEPLOY_TAG="deploy-${TAG_STAMP}"

git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: deploy ${UTC_STAMP} - ${DEPLOY_NOTE}"
else
  echo "No file changes to commit. Tag-only deployment record will be created."
fi

git tag -a "$DEPLOY_TAG" -m "Deployment ${UTC_STAMP} - ${DEPLOY_NOTE}"

git push origin main
git push origin "$DEPLOY_TAG"

DEPLOY_CMD=(firebase deploy --only hosting)
if [[ -n "${FIREBASE_PROJECT:-}" ]]; then
  DEPLOY_CMD+=(--project "$FIREBASE_PROJECT")
fi

"${DEPLOY_CMD[@]}"

echo "Done. Deployment version record: $DEPLOY_TAG"
