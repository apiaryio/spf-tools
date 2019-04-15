#!/bin/sh

export PATH=$HOME/bin:/usr/bin:/usr/sbin:/bin:/sbin

pwd

# Check for required tools
for cmd in host awk grep sed cut
do
  type $cmd >/dev/null
done

which host
host jasan.tk

echo "COVERAGE is $COVERAGE"
if [ "x1" = "x$COVERAGE" ] ; then
	$GEM_HOME/wrappers/bashcov -- plugin-tests/test-shell.sh
else
	plugin-tests/test-shell.sh || DEBUG=1 plugin-tests/test-shell.sh
fi
