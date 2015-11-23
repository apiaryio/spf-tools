#!/bin/sh
conf_path=~/.spf-toolsrc
if [ -r $conf_path ]; then
    docker run -ti \
    -v ~/.spf-toolsrc:/home/spf-user/.spf-toolsrc \
    spf-tools $@
else
    echo "Configuration file not found in path $conf_path"
fi