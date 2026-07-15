#!/bin/sh

set -eu

rm -rf _releases
find . -name .DS_Store -delete
npm ci

echo "Compiling Chromium..."
npm run build:chromium

echo "Compiling Firefox..."
npm run build:firefox

echo "Compiling beta..."
npm run build:beta

mkdir -p _releases
version=$(node -p "require('./manifests/chromium/manifest.json').version")

cd dist-prod-firefox
zip -qr "../_releases/${version}-firefox.zip" *
cd ../dist-prod
zip -qr "../_releases/${version}-chromium.zip" *
cd ../dist-beta
zip -qr "../_releases/${version}-chromium-beta.zip" *
cd ..
zip -q -r "_releases/${version}-source.zip" . -x node_modules\* dist-*\* example\* coverage\* .github\* _releases\* .vscode\* scripts\* .env .DS_Store
