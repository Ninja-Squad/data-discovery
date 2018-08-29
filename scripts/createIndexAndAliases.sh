#!/bin/bash

es_host=$1

BASEDIR=$(dirname "$0")

# NOTE: If the settings are changed here, they must also be changed the same way in
# backend/src/test/resources/fr/inra/urgi/rare/dao/settings.json for the unit tests

curl -X PUT "${es_host}:9200/rare-resource-physical-index" -H 'Content-Type: application/json' -d'
{
    "aliases" : {
        "rare-resource-index" : {},
        "rare-resource-harvest-index" : {}
    },
    "settings": {
        "analysis": {
            "analyzer": {
                "custom_suggestion_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase"
                    ]
                }
            }
        }
    }
}
'

curl -X PUT "${es_host}:9200/wheatis-resource-physical-index" -H 'Content-Type: application/json' -d'
{
    "aliases" : {
        "wheatis-resource-index" : {},
        "wheatis-resource-harvest-index" : {}
    },
    "settings": {
        "analysis": {
            "analyzer": {
                "custom_suggestion_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase"
                    ]
                }
            }
        }
    }
}
'
