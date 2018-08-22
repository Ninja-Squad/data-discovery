#!/bin/bash

BASEDIR=$(dirname "$0")

curl -X PUT "localhost:9200/rare-resource-physical-index" -H 'Content-Type: application/json' -d'
{
    "aliases" : {
        "rare-resource-index" : {},
        "rare-resource-harvest-index" : {}
    }
}
'
