#!/usr/bin/env bash
set -euo pipefail

# Ensure a lockfile exists before attempting a clean install.
if [ ! -f package-lock.json ]; then
  echo "package-lock.json fehlt – generiere temporäre Lock-Datei via 'npm install --package-lock-only'."
  npm install --package-lock-only --ignore-scripts
fi

npm ci
npm run build
