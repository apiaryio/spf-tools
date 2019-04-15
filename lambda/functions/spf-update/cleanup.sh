#!/bin/sh
#set -x

rm ./lambda/functions/spf-update/.edgerc > /dev/null || true
rm -r ./node_modules || true
rm -r ./lambda/functions/spf-update/node_modules || true
rm -r ./lambda/functions/spf-update/scripts || true
