#!/bin/bash

ES_HOST=$1
APP_NAME=$2
ENV=$3

[ -z "$3" ] && {
    echo "ERROR: missing at least 1 parameter. Expected 3 params: 1:ES_HOST ; 2:APP_NAME ; 3:ENV"
    exit 4
}

BASEDIR=$(dirname "$0")

# NOTE: If the settings are changed here, they must also be changed the same way in
# backend/src/test/resources/fr/inra/urgi/rare/dao/settings.json for the unit tests

curl -X PUT "${ES_HOST}:9200/${APP_NAME}-${ENV}-resource-physical-index" -H 'Content-Type: application/json' -d"
{
    \"aliases\" : {
        \"${APP_NAME}-${ENV}-resource-index\" : {},
        \"${APP_NAME}-${ENV}-resource-harvest-index\" : {}
    },
    \"settings\": {
        \"analysis\": {
            \"analyzer\": {
                \"custom_suggestion_analyzer\": {
                    \"type\": \"custom\",
                    \"tokenizer\": \"standard\",
                    \"filter\": [
                        \"lowercase\"
                    ]
                }
            }
        }
    }
}
"
