#!/bin/bash
source .env_oci
REPOSITORY=$OCI_REGION/$OCI_TENANCY/$OCIR_REPOSITORY
docker run --rm -e SPF_CHECK_EVENT="$SPF_CHECK_EVENT" -it $REPOSITORY:latest
