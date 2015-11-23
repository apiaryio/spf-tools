#!/bin/sh
# ENV properties have to injected via docker run -e DOMAIN=VALUE -e ORIG_SPF=value
test -n "$DOMAIN" || exit 1
test -n "$ORIG_SPF" || exit 1

cd $HOME/spf-tools

compare.sh $DOMAIN $ORIG_SPF || despf.sh $ORIG_SPF \
  | simplify.sh | mkblocks.sh $DOMAIN \
  | mkzoneent.sh | cloudflare.sh $DOMAIN
