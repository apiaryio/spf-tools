FROM        debian:jessie
MAINTAINER  Apiary <sre@apiary.io>

ENV REFRESHED_AT 2015-11-23

RUN apt-get update && \
    apt-get install -y jq curl dnsutils

RUN useradd -G sudo -m spf-user

WORKDIR /home/spf-user

USER spf-user

CMD ["./spf-tools/runspftools.sh"]