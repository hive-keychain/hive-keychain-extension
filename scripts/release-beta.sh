#!/bin/sh

rm -rf _releases


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

cd dist-beta
zip -qr "../_releases/${version}-chromium-beta.zip" *
cd ..
