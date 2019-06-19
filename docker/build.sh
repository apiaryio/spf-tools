#!/bin/bash
set -u

npm run lambda-prepare
source .env_oci
REPOSITORY=$OCI_REGION/$OCI_TENANCY/$OCIR_REPOSITORY
docker build -t $REPOSITORY .
docker push $REPOSITORY:latest
