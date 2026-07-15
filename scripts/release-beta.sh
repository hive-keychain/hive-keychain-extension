#!/bin/sh

set -eu

rm -rf _releases

echo "Compiling beta..."
npm run build:beta

mkdir -p _releases
version=$(node -p "require('./manifests/chromium/manifest.json').version")

cd dist-beta
zip -qr "../_releases/${version}-chromium-beta.zip" *
cd ..
