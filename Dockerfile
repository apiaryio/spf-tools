FROM        oraclelinux:7-slim
MAINTAINER  Apiary <sre@apiary.io>

ENV REFRESHED_AT 2019-06-18
ENV NPM_VERSION 6.4.1
ENV LAMBDA_TASK_ROOT /app/lambda/functions/spf-update/

RUN yum-config-manager --enable ol7_developer_nodejs8
RUN yum -y install nodejs-8.16.0 gcc gcc-c++ autoconf automake make bind-utils

RUN npm i -g npm@${NPM_VERSION}
RUN node -v
RUN npm -v

RUN mkdir -p /app
COPY package.json /app
COPY package-lock.json /app
COPY index.js /app
COPY .edgerc /app
COPY lambda/ /app/lambda/

WORKDIR /app
ENTRYPOINT [ "npm" ]
CMD ["start"]
