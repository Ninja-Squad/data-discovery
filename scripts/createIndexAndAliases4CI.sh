#!/bin/bash

BASEDIR=$(dirname "$0")
ES_HOST=$1
ES_PORT=9200
APP_NAME=$2
ENV=$3


EXP_PARAMS=3
[ ! $# -eq $EXP_PARAMS ] && {
    echo "ERROR: missing $((EXP_PARAMS-$#)) parameter(s). Expected "\
	"$EXP_PARAMS params: 1:ES_HOST ; 2:APP_NAME ; 3:ENV"
    exit 4
}


echo -e "\nCreate index: ${APP_NAME}-${ENV}-resource-physical-index"
curl -si -X PUT "${ES_HOST}:${ES_PORT}/${APP_NAME}-${ENV}-resource-physical-index"\
 -H 'Content-Type: application/json' -d"
{
    \"aliases\" : {
        \"${APP_NAME}-${ENV}-resource-index\" : {},
        \"${APP_NAME}-${ENV}-resource-harvest-index\" : {}
    },
    \"settings\":
        $(cat ${BASEDIR}/../backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/settings.json )
    }
}
"

echo -e "\n\nApply mapping: $(ls -1 ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${APP_NAME}/*.mapping.json)"
curl -si -X PUT "${ES_HOST}:${ES_PORT}/${APP_NAME}-${ENV}-resource-physical-index/_mapping/${APP_NAME}-${ENV}-resource"\
 -H 'Content-Type: application/json' -d"
$(cat ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${APP_NAME}/*.mapping.json)
"
echo
