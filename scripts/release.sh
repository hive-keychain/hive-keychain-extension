#!/bin/sh

rm -rf _releases

echo "Compiling chromium..."
resultChromium=`npm run build:chromium | grep -o "compiled with .* error[s]* in"`
echo "Checking errors"
if [ ${#resultChromium} -gt 0 ]
then
    echo "Errors during Chrome compilation... Cannot create release"
    exit
else 
    echo "No errors"    
fi
echo "Compiling firefox..."
resultFirefox=`npm run build:firefox | grep -o "compiled with .* error[s]* in"`
echo "Checking errors"
if [ ${#resultFirefox} -gt 0 ]
then
    echo "Errors during Firefox compilation... Cannot create release"
    exit
else 
    echo "No errors"    
fi

echo "Compiling beta..."
resultBeta=`npm run build:beta | grep -o "compiled with .* error[s]* in"`
echo "Checking errors"
if [ ${#resultBeta} -gt 0 ]
then
    echo "Errors during Beta compilation... Cannot create release"
    exit
else 
    echo "No errors"    
fi

mkdir -p _releases
manifestVersion=`cat manifests/chromium/manifest.json | grep '"version":'`

version=${manifestVersion//'"'/''}
version=${version//'version: '/''}
version=${version//','/''}
version=`echo ${version} | xargs` 

cd dist-prod-firefox
zip -qr "../_releases/${version}-firefox.zip" *
cd ../dist-prod
zip -qr "../_releases/${version}-chromium.zip" *
cd ../dist-beta
zip -qr "../_releases/${version}-chromium-beta.zip" *
cd ..
zip -q -r "_releases/${version}-source.zip" . -x node_modules\* dist-*\* example\* coverage\* .github\* _releases\* .vscode\* scripts\* .env
