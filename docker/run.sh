#!/bin/sh
# ENV properties have to injected via docker run -e DOMAIN=VALUE -e ORIG_SPF=value

a="/$0"; a=${a%/*}; a=${a#/}; a=${a:-.}; BINDIR=$(cd $a; cd ..; pwd)

test -n "$DOMAIN" || exit 1
test -n "$ORIG_SPF" || exit 1
# Used in cloudflare.sh
test -n "$TOKEN" || exit 1
test -n "$EMAIL" || exit 1

PATH=$BINDIR:$PATH
cd $BINDIR

compare.sh $DOMAIN $ORIG_SPF || despf.sh $ORIG_SPF \
  | simplify.sh | mkblocks.sh $DOMAIN \
  | mkzoneent.sh | cloudflare.sh $DOMAIN
