#!/bin/sh
#set -x

cp .edgerc ./lambda/functions/spf-update/ || { echo "No .edgerc file found!"; exit 1; }
npm install
mkdir -p lambda/functions/spf-update/scripts
cp compare.sh ./lambda/functions/spf-update/scripts
cp despf.sh ./lambda/functions/spf-update/scripts
cp normalize.sh ./lambda/functions/spf-update/scripts
cp simplify.sh ./lambda/functions/spf-update/scripts
cp mkblocks.sh ./lambda/functions/spf-update/scripts
cp -r include/ ./lambda/functions/spf-update/scripts/
cp -r plugins/ ./lambda/functions/spf-update/scripts/
cp -r node_modules/ ./lambda/functions/spf-update/
