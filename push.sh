#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

readonly GITHUB_ACCOUNT="contactsuryawritings-ship-it"
readonly REMOTE="prod"
readonly BRANCH="main"

if ! command -v gh >/dev/null 2>&1; then
  printf 'Error: GitHub CLI (gh) is required.\n' >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  printf 'Error: Git is required.\n' >&2
  exit 1
fi

gh auth switch --hostname github.com --user "$GITHUB_ACCOUNT"
git push "$REMOTE" "$BRANCH"