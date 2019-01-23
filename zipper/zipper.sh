#!/bin/bash
cd ~/Documents/projects;
zip -r -q  ~/Documents/projects/$1-chrome-v$2.zip $1 -x *.git*;
echo $1 v$2 release ready for Chrome!;
cd $1;
zip -r -q ~/Documents/projects/$1-firefox-v$2.zip * -x *.git*;
echo $1 v$2 release ready for Firefox!;
