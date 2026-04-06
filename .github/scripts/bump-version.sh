#!/usr/bin/env bash
set -euo pipefail

# Bump patch version of contracts package
# Usage: .github/scripts/bump-version.sh [major|minor|patch]

BUMP_TYPE="${1:-patch}"
CONTRACTS_DIR="backend/src/_contracts"

cd "$CONTRACTS_DIR"
npm version "$BUMP_TYPE" --no-git-tag-version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "version=$NEW_VERSION" >> "$GITHUB_OUTPUT"
echo "Bumped to $NEW_VERSION"
